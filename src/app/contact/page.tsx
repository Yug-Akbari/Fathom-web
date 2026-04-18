import { Metadata } from "next";
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
  openGraph: {
    title: "Contact Us | FATHOM — Get in Touch",
    description:
      "Reach our specialist team 24/7. We're here to help you find the perfect Food Dehydrator or appliance.",
    url: "https://www.fathomstore.in/contact",
    siteName: "FATHOM",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="bg-surface min-h-screen">
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
