import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Lightbulb, Globe, Loader2 } from "lucide-react";
import { useStats } from "@/hooks/useSupabaseData";
import heroImage from "@/assets/hero-community.jpg";

const HeroSection = () => {
  const { data: stats, isLoading } = useStats();
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Comunidades colaborando" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-secondary/80 to-primary/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center">
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up">
            El lugar donde las
            <span className="block bg-gradient-to-r from-community to-accent bg-clip-text text-transparent">
              comunidades se conectan
            </span>
            para transformar el futuro
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Una red colaborativa que impulsa el desarrollo de talento, tecnología y transformación social desde lo local hacia lo global.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" variant="community" className="text-lg px-8 py-3">
              Explorar comunidades
              <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20">
              Únete al HUB
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : `${stats?.communities || 0}+`}
              </div>
              <div className="text-white/80">Comunidades activas</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : `${stats?.events || 0}+`}
              </div>
              <div className="text-white/80">Eventos realizados</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                  <Globe className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : `${Math.round((stats?.members || 0) / 1000)}K+`}
              </div>
              <div className="text-white/80">Miembros conectados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;