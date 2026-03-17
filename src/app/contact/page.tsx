import InquiryHero from "@/components/contact/InquiryHero";
import ContactForm from "@/components/contact/ContactForm";
import SpecialistConnect from "@/components/contact/SpecialistConnect";
import ArchitecturalMap from "@/components/contact/ArchitecturalMap";

export const metadata = {
  title: "Contact Us | FATHOM",
  description: "Connect with our specialist team for your high-end architectural needs.",
};

export default function ContactPage() {
  return (
    <div className="bg-surface min-h-screen">
      <InquiryHero />
      
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 overflow-hidden">
          {/* Left Side: Form */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col pt-8">
            <ContactForm />
          </div>

          <div className="hidden lg:block lg:col-span-1 xl:col-span-2"></div>

          {/* Right Side: Specialist Connect */}
          <div className="lg:col-span-4 flex flex-col">
            <SpecialistConnect />
          </div>
        </div>
      </div>

      <ArchitecturalMap />
    </div>
  );
}
