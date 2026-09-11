// Server component — visible FAQ content + FAQPage JSON-LD.
// This is one of the highest-value blocks for "AI SEO" (AEO): AI answer engines
// like Google AI Overviews, ChatGPT and Perplexity heavily favor pages with
// clear, direct question/answer pairs when deciding what to cite or quote.
import Script from "next/script";

const faqs = [
  {
    q: "What is the best food dehydrator for home use in India?",
    a: "For most Indian homes, FATHOM's Professional Food Dehydrator 1200W with 8 Trays offers the best balance of capacity and price. If you have a small kitchen, the compact 5 Tray Food Dehydrator is a great starting option, while larger families or small food businesses should consider the 1500W 12 Tray or 2000W 24 Tray Food Dehydrator.",
  },
  {
    q: "How many trays do I need in a food dehydrator?",
    a: "A 5 tray food dehydrator suits individuals or couples drying small batches. An 8 tray 1200W dehydrator fits most families. A 12 tray 1500W model is ideal for bulk drying of fruits, vegetables and spices, and a 24 tray 2000W dehydrator is best for commercial or catering-scale food preservation.",
  },
  {
    q: "What can you dry in a FATHOM food dehydrator?",
    a: "FATHOM food dehydrators can dry fruits, vegetables, herbs, spices, meat for jerky, flowers, and homemade snacks like fruit leather and makhana, with even heat distribution across every tray.",
  },
  {
    q: "Does FATHOM ship food dehydrators across India?",
    a: "Yes, FATHOM ships Food Dehydrators, Cold Press Juicers, Smoothie Blenders, Espresso Machines and Coffee Grinders across India with free shipping on orders placed through fathomstore.in.",
  },
  {
    q: "What other kitchen appliances does FATHOM sell besides food dehydrators?",
    a: "Alongside its Food Dehydrator range, FATHOM sells a Cold Press Juicer, a Portable Smoothie Blender & Grinder, a 3-in-1 Espresso Machine, and an Electric Coffee Grinder.",
  },
  {
    q: "How do I contact FATHOM for product support?",
    a: "You can reach FATHOM via WhatsApp or phone at +91 82385 43000, email fathom.support@gmail.com, through the Contact page on fathomstore.in, or on Instagram at instagram.com/fathom.india.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function FAQSection() {
  return (
    <section className="py-20 bg-surface" aria-labelledby="faq-heading">
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-2 block">FAQ</span>
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-poppins font-bold text-primary">
            Food Dehydrator — Frequently Asked Questions
          </h2>
        </div>
        <div className="flex flex-col divide-y divide-gray-200">
          {faqs.map((f) => (
            <div key={f.q} className="py-6">
              <h3 className="font-poppins font-bold text-primary text-lg mb-2">{f.q}</h3>
              <p className="text-gray-600 leading-relaxed font-inter text-sm md:text-base">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
