import { Metadata } from "next";
import Script from "next/script";
import InquiryHero from "@/components/contact/InquiryHero";
import ContactForm from "@/components/contact/ContactForm";
import SpecialistConnect from "@/components/contact/SpecialistConnect";
import ArchitecturalMap from "@/components/contact/ArchitecturalMap";

export const metadata: Metadata = {
  title: "Contact Us | FATHOM — Get in Touch",
  description:
    "Have a question about our Food Dehydrators, Dehydrators or Food Dryers? Contact the FATHOM team. 24/7 support from our product specialists.",
  keywords: [
    "fathom contact",
    "fathom customer support",
    "food dehydrator help",
    "dehydrator support",
    "FATHOM store contact",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | FATHOM — Get in Touch",
    description:
      "Reach our specialist team 24/7. We're here to help you find the perfect Food Dehydrator or appliance.",
    url: "https://www.fathomstore.in/contact",
    siteName: "FATHOM",
    type: "website",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "FATHOM",
  image: "https://www.fathomstore.in/images/fathom-logo-transparent.png",
  url: "https://www.fathomstore.in/contact",
  telephone: "+91-82385-43000",
  email: "fathom.support@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "126, Green Plaza Shopping, Mota Varachha",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "394105",
    addressCountry: "IN",
  },
  sameAs: ["https://www.instagram.com/fathom.india/"],
};

export default function ContactPage() {
  return (
    <div className="bg-surface min-h-screen">
      <Script
        id="localbusiness-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <InquiryHero />
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 overflow-hidden">
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col pt-8">
            <ContactForm />
          </div>
          <div className="hidden lg:block lg:col-span-1 xl:col-span-2"></div>
          <div className="lg:col-span-4 flex flex-col">
            <SpecialistConnect />
          </div>
        </div>
      </div>
      <ArchitecturalMap />
    </div>
  );
}
