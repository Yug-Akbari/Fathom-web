import { NextRequest, NextResponse } from "next/server";
import {
  fetchFeedProducts,
  generateGoogleMerchantXml,
  generateGoogleMerchantTsv,
} from "@/lib/googleFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get("format")?.toLowerCase();
    const isDownload = searchParams.get("download") === "1";

    const products = await fetchFeedProducts();

    if (format === "tsv") {
      const tsv = generateGoogleMerchantTsv(products);
      const headers: Record<string, string> = {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      };

      if (isDownload) {
        headers["Content-Disposition"] = 'attachment; filename="fathom-products-feed.tsv"';
      }

      return new NextResponse(tsv, { status: 200, headers });
    }

    // Default: XML format
    const xml = generateGoogleMerchantXml(products);
    const headers: Record<string, string> = {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    };

    if (isDownload) {
      headers["Content-Disposition"] = 'attachment; filename="fathom-products-feed.xml"';
    }

    return new NextResponse(xml, { status: 200, headers });
  } catch (error) {
    console.error("Error generating api/products-feed:", error);
    return NextResponse.json(
      { error: "Failed to generate Google Merchant feed" },
      { status: 500 }
    );
  }
}
