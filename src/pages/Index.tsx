import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OwnershipPathways from "@/components/OwnershipPathways";
import ProcessSteps from "@/components/ProcessSteps";
import TrustSection from "@/components/TrustSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AccessibilitySkipLink from "@/components/AccessibilitySkipLink";
import StructuredData, { sdaStructuredData } from "@/components/ui/structured-data";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={sdaStructuredData} />
      <AccessibilitySkipLink />
      <Header />
      <main id="main-content" role="main">
        <Hero />
        <OwnershipPathways />
        <ProcessSteps />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
