import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import CommunitiesSection from "@/components/sections/CommunitiesSection";
import EventsSection from "@/components/sections/EventsSection";
import CallsSection from "@/components/sections/CallsSection";
import AlliancesSection from "@/components/sections/AlliancesSection";
import BlogSection from "@/components/sections/BlogSection";
import JoinSection from "@/components/sections/JoinSection";
import Footer from "@/components/sections/Footer";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

const Index = () => {
  // Habilitar actualizaciones en tiempo real
  useRealtimeUpdates();
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <CommunitiesSection />
        <EventsSection />
        <CallsSection />
        <AlliancesSection />
        <BlogSection />
        <JoinSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
