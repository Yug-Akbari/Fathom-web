"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Rss,
  Copy,
  Check,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PackageCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ProductPreview {
  id: string;
  name: string;
  price: number;
  stockStatus?: string;
  category?: string;
  sku?: string;
  image?: string;
  isActive?: boolean;
}

export default function GoogleFeedAdminPage() {
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const primaryFeedUrl = "https://www.fathomstore.in/products-feed.xml";
  const apiFeedUrl = "https://www.fathomstore.in/api/products-feed";

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const items: ProductPreview[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          name: d.name || "Untitled Product",
          price: typeof d.price === "number" ? d.price : parseFloat(d.price || 0),
          stockStatus: d.stockStatus || "In Stock",
          category: d.category || "Appliances",
          sku: d.sku || doc.id,
          image: d.image || (d.images && d.images[0]) || "/images/fridge-obsidian.png",
          isActive: d.isActive !== false,
        });
      });
      setProducts(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const activeProducts = products.filter((p) => p.isActive);
  const inStockProducts = activeProducts.filter((p) => p.stockStatus !== "Out of Stock");

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Automated Feed Online
            </span>
            <span className="text-xs text-gray-500 font-mono">Google Merchant Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-poppins font-bold text-primary">
            Automated Product Feed
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Automate syncing your FATHOM products with Google Shopping &amp; Google Merchant Center every 24 hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={primaryFeedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
            View Live XML
          </a>
          <button
            onClick={() => handleCopy(primaryFeedUrl)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-black transition-all shadow-sm"
          >
            {copiedUrl === primaryFeedUrl ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied Link!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Feed URL
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-gray-400">Total in Feed</div>
            <div className="text-2xl font-bold font-poppins text-primary">
              {loading ? "..." : activeProducts.length} Products
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-gray-400">In Stock</div>
            <div className="text-2xl font-bold font-poppins text-primary">
              {loading ? "..." : inStockProducts.length} Available
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-gray-400">Sync Frequency</div>
            <div className="text-2xl font-bold font-poppins text-primary">
              Every 24 Hours
            </div>
          </div>
        </div>
      </div>

      {/* Google Merchant Center Instructions Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              Setup Guide
            </div>
            <h2 className="text-xl font-bold font-poppins text-primary">
              How to paste this into Google Merchant Center
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Follow these simple steps on the screen you currently have open in Merchant Center:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-5 rounded-xl border border-gray-200 relative">
            <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="font-semibold text-sm text-primary">Select &quot;Add products from a file&quot;</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Keep the first card selected, just like on your current screen.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 relative">
            <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="font-semibold text-sm text-primary">Choose &quot;Enter a link to your file&quot;</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Keep the selected radio button and leave schedule at <em>Automatically updates every 24 hours</em>.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/30 relative">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="font-semibold text-sm text-primary">Paste your Feed URL</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Paste the link below into the <strong>Enter a link to your file*</strong> input box and click Continue!
            </p>
          </div>
        </div>

        {/* The Exact URL Box */}
        <div className="bg-gray-900 text-white p-4 md:p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto overflow-hidden">
            <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
              Paste this URL into Google Merchant Center:
            </div>
            <div className="font-mono text-sm md:text-base text-emerald-400 break-all select-all font-semibold">
              {primaryFeedUrl}
            </div>
          </div>
          <button
            onClick={() => handleCopy(primaryFeedUrl)}
            className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-bold transition-all"
          >
            {copiedUrl === primaryFeedUrl ? (
              <>
                <Check className="w-4 h-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy URL
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual File Download Section (Alternative) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-poppins text-primary">
              Manual File Downloads (Optional Backup)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              If you ever prefer to upload a file manually using the &quot;Upload a file from your computer&quot; option.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/products-feed?format=tsv&download=1"
              download="fathom-products-feed.tsv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              Download TSV
            </a>
            <a
              href="/api/products-feed?format=xml&download=1"
              download="fathom-products-feed.xml"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              Download XML
            </a>
          </div>
        </div>
      </div>

      {/* Live Product Preview in Feed */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-poppins text-primary">
              Live Feed Content Preview
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              These products will be provided to Google Merchant Center during the daily fetch.
            </p>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {activeProducts.length} items ready
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading products from database...</div>
        ) : activeProducts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-sm font-semibold text-gray-800">No active products found</div>
            <div className="text-xs text-gray-500">
              Add products in the Products section to include them in the automated feed.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">SKU / ID</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Stock Status</th>
                  <th className="py-3 px-6 text-right">Feed Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-100"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-primary truncate max-w-xs">{p.name}</div>
                          <div className="text-[11px] text-gray-400 truncate">ID: {p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-600">{p.category}</td>
                    <td className="py-3 px-6 font-mono text-gray-500">{p.sku}</td>
                    <td className="py-3 px-6 font-semibold text-primary">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.stockStatus === "Out of Stock"
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <Check className="w-3 h-3" /> Included
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
