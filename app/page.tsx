import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { ProductDemo } from "@/components/landing/product-demo";
import { CreationModes } from "@/components/landing/creation-modes";
import { AvatarGrid } from "@/components/landing/avatar-grid";
import { UseCases } from "@/components/landing/use-cases";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing-section";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProductDemo />
        <CreationModes />
        <AvatarGrid />
        <UseCases />
        <HowItWorks />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
