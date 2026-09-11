// Server component (no "use client") — rendered directly into the initial HTML.
// This is intentional: the Hero/CategoryGrid sections load their content from
// Firebase on the client, so search engines and AI crawlers that don't execute
// JavaScript (many AI answer-engine bots don't) would otherwise see a near-empty
// page. This section guarantees real, crawlable, keyword-rich text about every
// Food Dehydrator FATHOM sells, plus the rest of the catalog.
import Link from "next/link";

const dehydrators = [
  {
    name: "Compact 5 Tray Food Dehydrator",
    power: "Entry-level",
    trays: "5 Trays",
    blurb:
      "A compact food dehydrator built for small kitchens and first-time users. Perfect for drying fruits, vegetables, herbs and making healthy snacks at home without taking up counter space.",
  },
  {
    name: "Professional Food Dehydrator 1200W — 8 Trays",
    power: "1200W",
    trays: "8 Trays",
    blurb:
      "A professional-grade 1200W food dehydrator with 8 trays, ideal for families who dehydrate fruits, vegetables, meat (jerky) and herbs in larger batches with even, consistent drying.",
  },
  {
    name: "Professional Food Dehydrator 1500W — 12 Trays",
    power: "1500W",
    trays: "12 Trays",
    blurb:
      "A high-capacity 1500W, 12-tray food dehydrator designed for serious home cooks, small food businesses and bulk dehydrating of fruits, vegetables, spices and dried snacks.",
  },
  {
    name: "Food Dehydrator 2000W — 24 Trays",
    power: "2000W",
    trays: "24 Trays",
    blurb:
      "FATHOM's largest food dehydrator — a powerful 2000W, 24-tray commercial-capacity dryer built for bulk food preservation, catering, and small-scale commercial food drying operations.",
  },
];

const otherProducts = [
  {
    name: "Cold Press Juicer",
    blurb: "Slow-masticating cold press juicer that retains more nutrients and enzymes than traditional juicers.",
  },
  {
    name: "Portable Smoothie Blender & Grinder",
    blurb: "A compact, portable blender and grinder for smoothies, shakes and everyday kitchen grinding on the go.",
  },
  {
    name: "3-in-1 Espresso Machine",
    blurb: "A versatile 3-in-1 espresso machine for espresso, cappuccino and latte-style coffee at home.",
  },
  {
    name: "Electric Coffee Grinder",
    blurb: "A precision electric coffee grinder for fresh, consistent coffee grounds every time.",
  },
];

export default function DehydratorGuide() {
  return (
    <section className="py-20 bg-white" aria-labelledby="dehydrator-guide-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-2 block">
            Food Dehydrator Range
          </span>
          <h2 id="dehydrator-guide-heading" className="text-3xl md:text-4xl font-poppins font-bold text-primary mb-4">
            Shop the FATHOM Food Dehydrator Range — 5, 8, 12 &amp; 24 Tray Models
          </h2>
          <p className="text-gray-600 leading-relaxed font-inter">
            FATHOM is India&apos;s dedicated <strong>food dehydrator</strong> brand. Whether you need a compact{" "}
            <strong>5 tray food dehydrator</strong> for everyday snacking, a <strong>Professional Food Dehydrator
            1200W with 8 trays</strong> for family-sized batches, a high-capacity <strong>1500W 12 Tray Food
            Dehydrator</strong>, or our largest <strong>2000W 24 Tray Food Dehydrator</strong> for bulk and
            commercial use — we have a food dryer built for every kitchen. Every FATHOM food dehydrator is
            engineered for even heat distribution, precise temperature control and energy-efficient drying of
            fruits, vegetables, herbs, spices and meat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {dehydrators.map((d) => (
            <article
              key={d.name}
              className="border border-gray-200 rounded-2xl p-6 hover:border-accent transition-colors"
            >
              <h3 className="text-xl font-poppins font-bold text-primary mb-1">{d.name}</h3>
              <p className="text-xs font-bold tracking-widest uppercase text-accent mb-3">
                {d.power} &middot; {d.trays}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed font-inter mb-4">{d.blurb}</p>
              <Link
                href="/shop?category=Food%20Dehydrator"
                className="text-sm font-bold text-primary hover:text-accent transition-colors underline underline-offset-4"
              >
                Shop this Food Dehydrator
              </Link>
            </article>
          ))}
        </div>

        <div className="max-w-3xl mb-8">
          <h2 className="text-2xl md:text-3xl font-poppins font-bold text-primary mb-3">
            More from FATHOM: Juicers, Blenders &amp; Coffee Appliances
          </h2>
          <p className="text-gray-600 leading-relaxed font-inter">
            Beyond food dehydrators, FATHOM also sells a <strong>Cold Press Juicer</strong>, a{" "}
            <strong>Portable Smoothie Blender &amp; Grinder</strong>, a <strong>3-in-1 Espresso Machine</strong> and
            an <strong>Electric Coffee Grinder</strong> — all designed with the same premium build quality as our
            dehydrator range.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherProducts.map((p) => (
            <div key={p.name} className="p-5 rounded-2xl bg-surface">
              <h3 className="font-poppins font-bold text-primary mb-2">{p.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-inter">{p.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
