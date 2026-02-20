import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LearningCenter from "@/components/LearningCenter";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <LearningCenter />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
