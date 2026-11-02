import React from "react";

interface ProductSkeletonProps {
  variant?: "shop" | "trending";
}

export function ProductCardSkeleton({ variant = "shop" }: ProductSkeletonProps) {
  if (variant === "trending") {
    return (
      <div className="flex flex-col animate-pulse">
        {/* Image Box */}
        <div className="relative aspect-[4/5] bg-neutral-100 rounded-xl overflow-hidden mb-4 p-8 flex items-center justify-center border border-neutral-200/50">
          <div className="w-3/4 h-3/4 rounded-lg bg-neutral-200/70" />
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="h-5 bg-neutral-200 rounded w-3/4" />
          <div className="h-3.5 bg-neutral-100 rounded w-1/2" />
          <div className="h-4 bg-neutral-200 rounded w-1/3 pt-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-neutral-100 flex flex-col pt-6 pb-8 px-8 relative h-full animate-pulse">
      {/* Top Badge Skeleton */}
      <div className="absolute top-4 left-4 z-10 w-20 h-5 rounded-full bg-neutral-200/60" />

      {/* Image Container with Shimmer */}
      <div className="relative aspect-square w-full mb-8 overflow-hidden rounded-xl bg-neutral-100 flex items-center justify-center p-8">
        <div className="w-4/5 h-4/5 rounded-lg bg-neutral-200/60" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow justify-between">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="space-y-2 w-2/3">
            <div className="h-4 bg-neutral-200 rounded w-full" />
            <div className="h-3 bg-neutral-100 rounded w-3/4" />
          </div>
          <div className="w-16 h-5 bg-neutral-200 rounded" />
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-center border-t border-neutral-100 pt-4">
          <div className="w-20 h-3 bg-neutral-200/80 rounded" />
          <div className="w-8 h-8 rounded-full bg-neutral-200/80" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 6,
  variant = "shop",
}: {
  count?: number;
  variant?: "shop" | "trending";
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "trending") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((i) => (
          <ProductCardSkeleton key={i} variant="trending" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((i) => (
        <ProductCardSkeleton key={i} variant="shop" />
      ))}
    </div>
  );
}

export default ProductCardSkeleton;

