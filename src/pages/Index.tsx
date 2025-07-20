import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import CommunitiesSection from "@/components/sections/CommunitiesSection";
import EventsSection from "@/components/sections/EventsSection";
import JoinSection from "@/components/sections/JoinSection";
import Footer from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <CommunitiesSection />
        <EventsSection />
        <JoinSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
