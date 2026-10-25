import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export interface FeedProduct {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImages: string[];
  availability: "in_stock" | "out_of_stock";
  price: string;
  priceValue: number;
  brand: string;
  condition: string;
  category: string;
  sku: string;
  identifierExists: "no" | "yes";
}

const BASE_URL = "https://www.fathomstore.in";
const DEFAULT_IMAGE = `${BASE_URL}/images/fridge-obsidian.png`;

function cleanDescription(text: string | undefined): string {
  if (!text) {
    return "Premium kitchen appliances by FATHOM. High quality, commercial-grade performance with free shipping across India.";
  }
  const stripped = text
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  return stripped.slice(0, 5000) || "Premium kitchen appliances by FATHOM.";
}

function getValidImageUrl(img: string | undefined): string {
  if (!img || img.startsWith("data:")) {
    return DEFAULT_IMAGE;
  }
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }
  const cleanPath = img.startsWith("/") ? img : `/${img}`;
  return `${BASE_URL}${cleanPath}`;
}

function cdata(str: string): string {
  return `<![CDATA[${String(str || "").replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function fetchFeedProducts(): Promise<FeedProduct[]> {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const products: FeedProduct[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Skip inactive products if explicitly set to false
      if (data.isActive === false) return;

      const rawPrice = typeof data.price === "number" ? data.price : parseFloat(String(data.price || "0").replace(/[^0-9.]/g, ""));
      const priceNum = isNaN(rawPrice) || rawPrice < 0 ? 0 : rawPrice;

      // Primary image
      const primaryImage = getValidImageUrl(data.image || (data.images && data.images[0]));

      // Additional images (Google allows up to 10 additional images)
      const additionalImages: string[] = [];
      if (Array.isArray(data.images)) {
        for (const img of data.images) {
          const valid = getValidImageUrl(img);
          if (valid !== primaryImage && !additionalImages.includes(valid) && additionalImages.length < 10) {
            additionalImages.push(valid);
          }
        }
      }

      // Stock status
      const isInStock = data.stockStatus !== "Out of Stock" && (data.stockCount === undefined || data.stockCount > 0);

      const title = (data.name || "FATHOM Product").trim();
      const sku = (data.sku || doc.id).trim();

      products.push({
        id: doc.id,
        title,
        description: cleanDescription(data.description || data.desc),
        link: `${BASE_URL}/product/${doc.id}`,
        imageLink: primaryImage,
        additionalImages,
        availability: isInStock ? "in_stock" : "out_of_stock",
        price: `${priceNum.toFixed(2)} INR`,
        priceValue: priceNum,
        brand: "FATHOM",
        condition: "new",
        category: data.category || "Food Dehydrators",
        sku,
        identifierExists: "no", // Custom brand without barcode/GTIN - prevents rejection
      });
    });

    return products;
  } catch (error) {
    console.error("Error fetching products for Google feed:", error);
    return [];
  }
}

export function generateGoogleMerchantXml(products: FeedProduct[]): string {
  const itemsXml = products
    .map((p) => {
      const additionalImgTags = p.additionalImages
        .map((img) => `      <g:additional_image_link>${img}</g:additional_image_link>`)
        .join("\n");

      return `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${cdata(p.title)}</g:title>
      <g:description>${cdata(p.description)}</g:description>
      <g:link>${p.link}</g:link>
      <g:image_link>${p.imageLink}</g:image_link>
${additionalImgTags ? additionalImgTags + "\n" : ""}\
      <g:availability>${p.availability}</g:availability>
      <g:price>${p.price}</g:price>
      <g:brand>${cdata(p.brand)}</g:brand>
      <g:condition>${p.condition}</g:condition>
      <g:mpn>${cdata(p.sku)}</g:mpn>
      <g:identifier_exists>${p.identifierExists}</g:identifier_exists>
      <g:product_type>${cdata(p.category)}</g:product_type>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Delivery</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>FATHOM Store Products</title>
    <link>${BASE_URL}</link>
    <description>FATHOM - Premium Food Dehydrators, Commercial Dryers &amp; Kitchen Appliances</description>
${itemsXml}
  </channel>
</rss>`;
}

export function generateGoogleMerchantTsv(products: FeedProduct[]): string {
  const headers = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "brand",
    "condition",
    "identifier_exists",
    "product_type",
    "mpn",
  ];

  const rows = products.map((p) => {
    // Escape tabs and linebreaks in TSV
    const clean = (val: string) => String(val || "").replace(/[\t\r\n]+/g, " ").trim();

    return [
      clean(p.id),
      clean(p.title),
      clean(p.description),
      clean(p.link),
      clean(p.imageLink),
      p.availability,
      p.price,
      clean(p.brand),
      p.condition,
      p.identifierExists,
      clean(p.category),
      clean(p.sku),
    ].join("\t");
  });

  return [headers.join("\t"), ...rows].join("\n");
}
