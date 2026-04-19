// Force dynamic rendering — disable caching so admin product updates always show live
export const dynamic = 'force-dynamic';

import Link from "next/link";
import Script from "next/script";
import ProductHero from "@/components/product/ProductHero";
import CompleteSuite from "@/components/product/CompleteSuite";
import ProductReviews from "@/components/product/ProductReviews";
import { Product } from "@/lib/data";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

async function fetchProductData(id: string): Promise<Product | undefined> {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        name: d.name,
        subtitle: d.sku || "",
        price: d.price,
        image: d.image || "/images/fridge-obsidian.png",
        images: d.images || [],
        badge: d.isNew ? "New" : d.isBestSeller ? "Bestseller" : undefined,
        category: d.category?.toLowerCase() || "appliances",
        finish: d.specs?.find((s: any) => s.key === "FINISH")?.value || "Stainless Steel",
        inStock: d.stockStatus !== "Out of Stock",
        desc: d.description || "",
        specs: d.specs || [],
      };
    }
  } catch (error) {
    console.error("Error fetching product from Firebase:", error);
  }
  return undefined;
}

async function fetchApprovedReviews(productId: string) {
  try {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await fetchProductData(params.id);
  if (!product) return { title: "Product Not Found | FATHOM" };
  const productImage = product.images?.[0] || product.image;
  return {
    title: `${product.name} | Food Dehydrator & Dehydrator`,
    description: product.desc
      ? `${product.desc.slice(0, 140)}. Free shipping across India. Shop now at FATHOM.`
      : `Buy the ${product.name} by FATHOM — premium Food Dehydrator, Dehydrator & Food Dryer. Free shipping across India.`,
    keywords: [
      "fathom", product.name, `${product.name} India`, `buy ${product.name} online`,
      "food dehydrator", "dehydrator", "food dryer", "coffee machine", "coffee grinder", "FATHOM",
    ],
    openGraph: {
      title: `${product.name} | FATHOM`,
      description: product.desc
        ? `${product.desc.slice(0, 140)}. Free shipping across India.`
        : `Buy the ${product.name} by FATHOM. Free shipping across India.`,
      url: `https://www.fathomstore.in/product/${product.id}`,
      siteName: "FATHOM",
      type: "website",
      images: productImage ? [{ url: productImage, width: 1200, height: 630, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProductData(params.id);
  if (!product) notFound();

  const reviews = await fetchApprovedReviews(params.id);
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc || `${product.name} by FATHOM — premium Food Dehydrator, Dehydrator & Food Dryer.`,
    image: product.images?.length > 0 ? product.images : [product.image],
    brand: { "@type": "Brand", name: "FATHOM" },
    offers: {
      "@type": "Offer",
      url: `https://www.fathomstore.in/product/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "FATHOM" },
    },
  };

  // Only add aggregateRating when there are real approved reviews
  if (avgRating && reviews.length > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <div className="w-full bg-background min-h-screen pt-4">
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 flex items-center gap-2">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <span className="text-gray-300">-</span>
          <Link href="/shop" className="hover:text-accent transition-colors capitalize">{product.category}</Link>
          <span className="text-gray-300">-</span>
          <span className="text-primary">{product.name}</span>
        </div>
      </div>
      <ProductHero product={product} />
      <CompleteSuite />
      <ProductReviews productId={product.id} productName={product.name} />
    </div>
  );
}
