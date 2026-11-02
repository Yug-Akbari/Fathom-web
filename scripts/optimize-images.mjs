import fs from "fs";
import path from "path";
import sharp from "sharp";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

// --- Load .env.local manually to ensure zero extra dependencies ---
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found at " + envPath);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();

// --- Parse CLI arguments ---
const args = process.argv.slice(2);
let isDryRun = true;
let onlyProductId = null;
let limitCount = null;

for (const arg of args) {
  if (arg === "--run" || arg === "--dry-run=false") {
    isDryRun = false;
  } else if (arg === "--dry-run" || arg === "--dry-run=true") {
    isDryRun = true;
  } else if (arg.startsWith("--only=")) {
    onlyProductId = arg.split("=")[1].trim();
  } else if (arg.startsWith("--limit=")) {
    limitCount = parseInt(arg.split("=")[1].trim(), 10);
  }
}

// --- Initialize Firebase ---
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const GITHUB_TOKEN = env.GITHUB_TOKEN;
const GITHUB_OWNER = env.GITHUB_REPO_OWNER;
const GITHUB_REPO = env.GITHUB_REPO_NAME;

// --- Helper to format bytes ---
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// --- Download helper ---
async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "FathomOptimizer/1.0",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// --- Extract filename base ---
function parseFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const base = path.basename(pathname);
    const ext = path.extname(base);
    const nameWithoutExt = path.basename(base, ext);
    return { base, nameWithoutExt, ext };
  } catch {
    const base = path.basename(url);
    const ext = path.extname(base);
    const nameWithoutExt = path.basename(base, ext);
    return { base, nameWithoutExt, ext };
  }
}

// --- GitHub check exists helper ---
async function githubFileExists(filePath) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "FathomOptimizer/1.0",
    },
  });
  return res.status === 200;
}

// --- GitHub upload helper ---
async function uploadToGitHub(filePath, buffer, commitMsg) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  
  // Check if exists to get SHA for idempotency
  let sha = undefined;
  const checkRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "FathomOptimizer/1.0",
    },
  });
  if (checkRes.ok) {
    const data = await checkRes.json();
    sha = data.sha;
  }

  const body = {
    message: commitMsg,
    content: buffer.toString("base64"),
    branch: "main",
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "FathomOptimizer/1.0",
    },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const errData = await putRes.json().catch(() => ({}));
    throw new Error(`GitHub upload failed for ${filePath}: ${putRes.status} ${JSON.stringify(errData)}`);
  }
}

// --- Main Optimization Pipeline ---
async function main() {
  console.log("==================================================================");
  console.log(" FATHOM High-Fidelity Image Optimizer (Sharp + WebP)");
  console.log(" Strategy: Option A with Safeguard (Keep original if WebP is larger)");
  console.log(" Mode:", isDryRun ? "DRY-RUN (Safe: Preview only, no remote writes)" : "REAL RUN (Live updates)");
  if (onlyProductId) console.log(" Filter product:", onlyProductId);
  if (limitCount) console.log(" Product limit:", limitCount);
  console.log("==================================================================\n");

  // 1. Fetch products from Firestore
  console.log("Fetching products from Firestore...");
  const snapshot = await getDocs(collection(db, "products"));
  let products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`Retrieved ${products.length} products total.`);

  if (onlyProductId) {
    products = products.filter((p) => p.id === onlyProductId);
    if (products.length === 0) {
      console.error(`Product with ID "${onlyProductId}" not found!`);
      process.exit(1);
    }
  }

  if (limitCount && limitCount > 0) {
    products = products.slice(0, limitCount);
  }

  // 2. Export Backup of Products Collection
  const backupsDir = path.resolve(process.cwd(), "backups");
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupsDir, `products-backup-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(products, null, 2), "utf-8");
  console.log(`[Backup] Exported products backup to: ${backupFile}\n`);

  // Prepare dry-run preview directory
  const previewDir = path.resolve(process.cwd(), "optimized-preview");
  if (isDryRun) {
    if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });
  }

  const tableRows = [];
  let totalOrigBytes = 0;
  let totalEffectiveFullBytes = 0;
  let totalEffectiveThumbBytes = 0;

  // 3. Process each product
  for (const product of products) {
    console.log(`------------------------------------------------------------------`);
    console.log(`Processing Product: "${product.name}" (ID: ${product.id})`);

    // Collect all URLs: main image + gallery images
    const rawUrls = [];
    if (product.image) rawUrls.push({ type: "main", url: product.image });
    if (Array.isArray(product.images)) {
      product.images.forEach((u, idx) => {
        rawUrls.push({ type: `gallery_${idx}`, url: u });
      });
    }

    // Deduplicate by URL
    const uniqueUrls = [];
    const seen = new Set();
    for (const item of rawUrls) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        uniqueUrls.push(item);
      }
    }

    console.log(`  Found ${uniqueUrls.length} unique image(s) for this product.`);

    const urlMapping = {}; // oldUrl -> { fullUrl, thumbUrl }

    for (let i = 0; i < uniqueUrls.length; i++) {
      const { url } = uniqueUrls[i];
      const { base, nameWithoutExt, ext } = parseFilenameFromUrl(url);

      console.log(`  [${i + 1}/${uniqueUrls.length}] Processing: ${base}...`);
      let origBuffer;
      try {
        origBuffer = await downloadBuffer(url);
      } catch (err) {
        console.error(`  [Error] Could not download ${url}: ${err.message}`);
        continue;
      }

      const origMeta = await sharp(origBuffer).metadata();
      const origSize = origBuffer.length;
      totalOrigBytes += origSize;

      // a) Generate "full" WebP variant: max width 2000px, quality 95, effort 6, withMetadata
      const fullWebpBuffer = await sharp(origBuffer)
        .withMetadata()
        .resize({ width: 2000, withoutEnlargement: true })
        .webp({ quality: 95, smartSubsample: true, alphaQuality: 100, effort: 6 })
        .toBuffer();

      const fullWebpSize = fullWebpBuffer.length;

      // SAFEGUARD FOR FULL: Only use WebP if it is smaller than original.
      // If WebP is larger, KEEP ORIGINAL so file size NEVER increases.
      const fullUseWebp = fullWebpSize < origSize;
      const effectiveFullSize = fullUseWebp ? fullWebpSize : origSize;
      totalEffectiveFullBytes += effectiveFullSize;

      // b) Generate "thumb" WebP variant: max width 640px, quality 95, effort 6, withMetadata
      const thumbWebpBuffer = await sharp(origBuffer)
        .withMetadata()
        .resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 95, smartSubsample: true, alphaQuality: 100, effort: 6 })
        .toBuffer();

      const thumbWebpMeta = await sharp(thumbWebpBuffer).metadata();
      const thumbWebpSize = thumbWebpBuffer.length;

      // SAFEGUARD FOR THUMB: Only use WebP thumb if it is smaller than original.
      const thumbUseWebp = thumbWebpSize < origSize;
      const effectiveThumbSize = thumbUseWebp ? thumbWebpSize : origSize;
      totalEffectiveThumbBytes += effectiveThumbSize;

      const fullSavedPct = fullUseWebp
        ? (((origSize - fullWebpSize) / origSize) * 100).toFixed(1) + "%"
        : "0.0% (Kept Orig)";

      const thumbSavedPct = thumbUseWebp
        ? (((origSize - thumbWebpSize) / origSize) * 100).toFixed(1) + "%"
        : "0.0% (Kept Orig)";

      tableRows.push({
        filename: base,
        origDim: `${origMeta.width}x${origMeta.height}`,
        origSize: formatBytes(origSize),
        fullAction: fullUseWebp ? `WebP (${formatBytes(fullWebpSize)})` : `Kept Orig (${formatBytes(origSize)})`,
        fullSaved: fullSavedPct,
        thumbAction: thumbUseWebp ? `WebP 640p (${formatBytes(thumbWebpSize)})` : `Kept Orig`,
        thumbSaved: thumbSavedPct,
      });

      if (isDryRun) {
        // Save to ./optimized-preview/<productId>/
        const prodPreviewDir = path.join(previewDir, product.id);
        if (!fs.existsSync(prodPreviewDir)) fs.mkdirSync(prodPreviewDir, { recursive: true });

        const origSavePath = path.join(prodPreviewDir, `${nameWithoutExt}_original${ext}`);
        const fullSavePath = path.join(prodPreviewDir, `${nameWithoutExt}_full.webp`);
        const thumbSavePath = path.join(prodPreviewDir, `${nameWithoutExt}_thumb.webp`);

        fs.writeFileSync(origSavePath, origBuffer);
        fs.writeFileSync(fullSavePath, fullWebpBuffer);
        fs.writeFileSync(thumbSavePath, thumbWebpBuffer);
      } else {
        // Real run:
        let finalFullUrl = url;
        let finalThumbUrl = url;

        // If WebP full is smaller, upload it alongside original
        if (fullUseWebp) {
          const fullRelPath = `public/uploads/${nameWithoutExt}_full.webp`;
          console.log(`    Uploading ${fullRelPath} to GitHub...`);
          await uploadToGitHub(fullRelPath, fullWebpBuffer, `Add WebP full variant for ${base}`);
          finalFullUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${fullRelPath}`;
        } else {
          console.log(`    [Safeguard] Full WebP was larger (${formatBytes(fullWebpSize)} > ${formatBytes(origSize)}). Keeping original URL.`);
        }

        // If WebP thumb is smaller, upload it alongside original
        if (thumbUseWebp) {
          const thumbRelPath = `public/uploads/${nameWithoutExt}_thumb.webp`;
          console.log(`    Uploading ${thumbRelPath} to GitHub...`);
          await uploadToGitHub(thumbRelPath, thumbWebpBuffer, `Add WebP thumb variant for ${base}`);
          finalThumbUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${thumbRelPath}`;
        }

        urlMapping[url] = { fullUrl: finalFullUrl, thumbUrl: finalThumbUrl };
      }
    }

    if (!isDryRun && Object.keys(urlMapping).length > 0) {
      console.log(`  Updating Firestore document for product "${product.name}"...`);

      const currentMain = product.image;
      const currentImages = Array.isArray(product.images) ? product.images : [];

      const newMain = urlMapping[currentMain]?.fullUrl || currentMain;
      const newMainThumb = urlMapping[currentMain]?.thumbUrl || newMain;

      const newImages = currentImages.map((u) => urlMapping[u]?.fullUrl || u);
      const newImagesThumb = currentImages.map((u) => urlMapping[u]?.thumbUrl || u);

      const updatePayload = {
        image: newMain,
        imageThumb: newMainThumb,
        images: newImages,
        imagesThumb: newImagesThumb,
        imagesLegacy: product.imagesLegacy || {
          image: currentMain,
          images: currentImages,
          updatedAt: new Date().toISOString(),
        },
      };

      const docRef = doc(db, "products", product.id);
      await updateDoc(docRef, updatePayload);
      console.log(`  [Done] Firestore updated. Legacy URLs preserved in 'imagesLegacy'.`);
    }
  }

  // 4. Print Summary Table
  console.log("\n==================================================================");
  console.log(" OPTIMIZATION RESULTS SUMMARY TABLE (OPTION A WITH SAFEGUARD)");
  console.log("==================================================================");
  console.table(tableRows);

  console.log("------------------------------------------------------------------");
  console.log(`Total Images Processed      : ${tableRows.length}`);
  console.log(`Total Original Size         : ${formatBytes(totalOrigBytes)}`);
  console.log(`Effective Full Variant Size : ${formatBytes(totalEffectiveFullBytes)} (${totalOrigBytes === totalEffectiveFullBytes ? 'Originals preserved where smaller' : (((totalOrigBytes - totalEffectiveFullBytes) / totalOrigBytes) * 100).toFixed(1) + '% reduction'})`);
  console.log(`Effective Thumb Variant Size: ${formatBytes(totalEffectiveThumbBytes)} (${(((totalOrigBytes - totalEffectiveThumbBytes) / totalOrigBytes) * 100).toFixed(1)}% reduction)`);
  console.log("------------------------------------------------------------------");

  if (isDryRun) {
    console.log(`\nDry-run complete! All preview files available in:`);
    console.log(`  ${previewDir}`);
    console.log(`\nZero modifications were made to GitHub or Firestore.`);
  } else {
    console.log(`\nReal migration complete!`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Migration Fatal Error:", err);
  process.exit(1);
});
