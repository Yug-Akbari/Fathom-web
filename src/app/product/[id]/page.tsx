// Force dynamic rendering — disable caching so admin product updates always show live
export const dynamic = 'force-dynamic';

import Link from "next/link";
import Script from "next/script";
import ProductHero from "@/components/product/ProductHero";
import CompleteSuite from "@/components/product/CompleteSuite";
import { Product } from "@/lib/data";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await fetchProductData(params.id);
  if (!product) return { title: "Product Not Found | FATHOM" };

  const productImage = product.images?.[0] || product.image;

  return {
    title: `${product.name} | FATHOM — Premium Home & Kitchen Appliances India`,
    description: product.desc
      ? `${product.desc.slice(0, 140)}. Free shipping across India. Shop now at FATHOM.`
      : `Shop the ${product.name} by FATHOM — ultra-premium home & kitchen appliances. Free shipping across India.`,
    keywords: [
      product.name,
      `${product.name} India`,
      `buy ${product.name} online India`,
      `${product.name} price India`,
      `${product.category} India`,
      "food dehydrator India",
      "coffee machine India",
      "coffee grinder India",
      "premium home & kitchen appliances India",
      "FATHOM store",
    ],
    openGraph: {
      title: `${product.name} | FATHOM`,
      description: product.desc
        ? `${product.desc.slice(0, 140)}. Free shipping across India.`
        : `Shop the ${product.name} by FATHOM. Free shipping across India.`,
      url: `https://www.fathomstore.in/product/${product.id}`,
      siteName: "FATHOM",
      type: "website",
      images: productImage
        ? [{ url: productImage, width: 1200, height: 630, alt: product.name }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProductData(params.id);

  if (!product) {
    notFound();
  }

  // JSON-LD Structured Data — enables rich results (price, availability, ratings) on Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc || `${product.name} by FATHOM — ultra-premium home & kitchen appliances.`,
    image: product.images?.length > 0 ? product.images : [product.image],
    brand: {
      "@type": "Brand",
      name: "FATHOM",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.fathomstore.in/product/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "FATHOM",
      },
    },
  };

  return (
    <div className="w-full bg-background min-h-screen pt-4">
      {/* JSON-LD Structured Data for Google Rich Results */}
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Dynamic Breadcrumbs */}
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
    </div>
  );
}
