import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { Features } from "@/components/landing/Features";
import { HowItWorksNew } from "@/components/landing/HowItWorksNew";
import { FeaturedDevelopers } from "@/components/landing/FeaturedDevelopers";
import { DeveloperShowcase } from "@/components/landing/DeveloperShowcase";
import { WhyJoin } from "@/components/landing/WhyJoin";
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
        <WhyJoin />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
