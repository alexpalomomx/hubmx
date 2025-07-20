import { Card, CardContent } from "@/components/ui/card";
import { Network, Target, Zap, Heart, Globe2, Users2 } from "lucide-react";

const AboutSection = () => {
  const values = [
    {
      icon: Network,
      title: "Conexión",
      description: "Unimos comunidades y talentos a través de redes colaborativas globales"
    },
    {
      icon: Target,
      title: "Colaboración",
      description: "Fomentamos el trabajo conjunto para maximizar el impacto social y tecnológico"
    },
    {
      icon: Zap,
      title: "Impacto",
      description: "Transformamos realidades locales con soluciones innovadoras y sostenibles"
    }
  ];

  const stats = [
    { number: "50+", label: "Comunidades", icon: Users2 },
    { number: "200+", label: "Eventos", icon: Zap },
    { number: "15+", label: "Países", icon: Globe2 },
    { number: "5K+", label: "Miembros", icon: Heart }
  ];

  return (
    <section id="que-es" className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Qué es el{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              HUB de Comunidades?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Somos una red de comunidades que impulsa el desarrollo de talento, 
            tecnología y transformación social desde lo local hacia lo global.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <Card key={value.title} className="text-center shadow-card hover:shadow-glow transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-gradient-hero group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Animated Stats */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-hero rounded-3xl opacity-5"></div>
          <div className="relative bg-card rounded-3xl p-8 shadow-card">
            <h3 className="text-2xl font-bold text-center mb-8">
              Nuestro impacto en números
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center group">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-gradient-community group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;