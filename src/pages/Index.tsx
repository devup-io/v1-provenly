import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { Features } from "@/components/landing/Features";
import { HowItWorksNew } from "@/components/landing/HowItWorksNew";
import { DeveloperShowcase } from "@/components/landing/DeveloperShowcase";
import { ForCompanies } from "@/components/landing/ForCompanies";
import { WhyJoin } from "@/components/landing/WhyJoin";
import { Integrations } from "@/components/landing/Integrations";
import { Testimonials } from "@/components/landing/Testimonials";
import { Stats } from "@/components/landing/Stats";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorksNew />
        <DeveloperShowcase />
        <ForCompanies />
        <WhyJoin />
        <Integrations />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
