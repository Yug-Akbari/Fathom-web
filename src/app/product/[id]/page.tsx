// Force dynamic rendering — disable caching so admin product updates always show live
export const dynamic = 'force-dynamic';

import Link from "next/link";
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
        finish: d.specs?.find((s:any) => s.key === "FINISH")?.value || "Stainless Steel",
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

// Optional: Dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await fetchProductData(params.id);
  if (!product) return { title: "Not Found | FATHOM" };
  return {
    title: `${product.name} | FATHOM Elite`,
    description: product.desc,
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProductData(params.id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="w-full bg-background min-h-screen pt-4">
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
