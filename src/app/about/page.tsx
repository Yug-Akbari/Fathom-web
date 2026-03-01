import AboutHero from "@/components/about/AboutHero";
import OurMission from "@/components/about/OurMission";
import OurValues from "@/components/about/OurValues";
import OurImpact from "@/components/about/OurImpact";

export const metadata = {
  title: "About Us | FATHOM",
  description: "Your trusted partner in quality products.",
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <AboutHero />
      <OurMission />
      <OurValues />
      <OurImpact />
    </div>
  );
}
