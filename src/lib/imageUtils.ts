/**
 * Image helper utility for FATHOM.
 * 
 * Safely validates and returns high-resolution product image URLs.
 * Keeps raw.githubusercontent.com URLs intact to guarantee 100% delivery reliability
 * across all ISPs (avoiding 3rd-party CDN blocks in India) while preserving full image quality
 * and zero Vercel optimization quota consumption.
 */

export function getOptimizedImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return "/images/fridge-obsidian.png";
  }

  return url.trim();
}
