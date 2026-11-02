"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/shop/FilterSidebar";
import CategoryPills from "@/components/shop/CategoryPills";
import ProductGrid from "@/components/shop/ProductGrid";
import { Product } from "@/lib/data";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

export default function ShopClient() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";

  const [category, setCategory] = useState(urlCategory ? urlCategory.toLowerCase() : "all");
  const [maxPrice, setMaxPrice] = useState(500000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [searchText, setSearchText] = useState(urlSearch);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync URL search param
  useEffect(() => {
    if (urlSearch) setSearchText(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (urlCategory) setCategory(urlCategory.toLowerCase());
  }, [urlCategory]);

  // Fast-hydrate from session cache for instant zero-latency loading
  useEffect(() => {
    try {
      sessionStorage.removeItem("fathom_shop_products_cache");
      const cached = sessionStorage.getItem("fathom_shop_products_cache_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((p) => ({
            ...p,
            image: getOptimizedImageUrl(p.image),
          }));
          setLiveProducts(cleaned);
          setIsLoading(false);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Query only active products
    const q = query(collection(db, "products"), where("isActive", "==", true));
    const unsub = onSnapshot(q, (snapshot) => {
      const dbData = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          category: (d.category || "").toLowerCase(),
          price: d.price,
          inStock: d.stockStatus !== "Out of Stock",
          finish: d.specs?.find((s: any) => s.key === "FINISH")?.value || "Stainless Steel",
          isNew: false,
          isFeatured: d.isFeatured,
          isBestSeller: d.isBestSeller,
          isMainPanel: d.isMainPanel,
          image: getOptimizedImageUrl(d.image),
          hoverImage: "/images/fridge-obsidian-open.png",
          subtitle: d.sku,
          desc: d.description || "",
        } as unknown as Product;
      });

      setLiveProducts(dbData);
      setIsLoading(false);

      try {
        sessionStorage.setItem("fathom_shop_products_cache_v2", JSON.stringify(dbData));
      } catch {}
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const dbCategories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(dbCategories);
    });

    return () => {
      unsub();
      unsubCategories();
    };
  }, []);

  // Filter products based on all active states
  const filteredProducts = useMemo(() => {
    let result = liveProducts.filter((product: any) => {
      // Search Filter
      if (searchText && !product.name?.toLowerCase().includes(searchText.toLowerCase())) return false;

      // Category Filter (Case Insensitive)
      if (category !== "all" && product.category?.toLowerCase() !== category.toLowerCase()) return false;

      // Price Filter
      if (product.price > maxPrice) return false;

      // Stock Filter
      if (inStockOnly && !product.inStock) return false;

      // Visibility Filters
      const isProductFeatured = product.isFeatured || product.badge === "Featured";
      const isProductBestSeller =
        product.isBestSeller || product.badge === "Bestseller" || product.badge === "Best Seller";

      if (featuredOnly && bestSellerOnly) {
        if (!isProductFeatured && !isProductBestSeller) return false;
      } else if (featuredOnly) {
        if (!isProductFeatured) return false;
      } else if (bestSellerOnly) {
        if (!isProductBestSeller) return false;
      }

      return true;
    });

    // Default prioritized sorting:
    // Main Panel > Best Seller > Featured > Others
    result.sort((a: any, b: any) => {
      const getScore = (p: any) => {
        if (p.isMainPanel) return 4;
        if (p.isBestSeller || p.badge === "Bestseller" || p.badge === "Best Seller") return 3;
        if (p.isFeatured || p.badge === "Featured") return 2;
        return 1;
      };

      return getScore(b) - getScore(a);
    });

    return result;
  }, [category, maxPrice, inStockOnly, featuredOnly, bestSellerOnly, liveProducts, searchText]);

  return (
    <div className="flex flex-col lg:flex-row gap-12 w-full mt-10">
      {/* Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <FilterSidebar
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          featuredOnly={featuredOnly}
          setFeaturedOnly={setFeaturedOnly}
          bestSellerOnly={bestSellerOnly}
          setBestSellerOnly={setBestSellerOnly}
        />
      </div>

      {/* Product Area */}
      <div className="flex-1 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <CategoryPills activeCategory={category} setCategory={setCategory} categories={categories} />
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap mb-6 lg:mb-0 lg:ml-auto">
            Sort By:
            <select className="bg-transparent border-none text-primary font-inter font-semibold outline-none cursor-pointer">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
        </div>

        <div className="mb-6 text-sm text-gray-400 font-medium">
          {isLoading ? "Loading collection..." : `Showing ${filteredProducts.length} products`}
        </div>

        {/* Passing the dynamically filtered products & loading status into grid */}
        <ProductGrid products={filteredProducts} isLoading={isLoading && liveProducts.length === 0} />

        {/* Pagination / Load More */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            <button className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm shadow-md">
              1
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
