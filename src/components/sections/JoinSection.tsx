import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, HandHeart, ArrowRight, CheckCircle } from "lucide-react";

const JoinSection = () => {
  const [selectedType, setSelectedType] = useState("community");

  const registrationTypes = [
    {
      id: "community",
      title: "Comunidad Nueva",
      description: "Registra tu comunidad y conecta con la red global",
      icon: Users,
      benefits: [
        "Visibilidad en la plataforma",
        "Acceso a eventos exclusivos",
        "Red de colaboración",
        "Recursos y herramientas",
        "Mentoría especializada"
      ],
      cta: "Registrar Comunidad"
    },
    {
      id: "chapter",
      title: "Capítulo Local",
      description: "Crea un capítulo local de una comunidad existente",
      icon: Building,
      benefits: [
        "Soporte organizacional",
        "Metodologías probadas",
        "Comunidad establecida",
        "Material educativo",
        "Acompañamiento inicial"
      ],
      cta: "Crear Capítulo"
    },
    {
      id: "alliance",
      title: "Alianza Institucional",
      description: "Únete como organización, empresa o institución aliada",
      icon: HandHeart,
      benefits: [
        "Patrocinio de eventos",
        "Acceso a talento",
        "Responsabilidad social",
        "Networking estratégico",
        "Proyectos colaborativos"
      ],
      cta: "Formar Alianza"
    }
  ];

  const selectedRegistration = registrationTypes.find(type => type.id === selectedType);

  return (
    <section id="unete" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Únete al{" "}
            <span className="bg-gradient-community bg-clip-text text-transparent">
              Movimiento
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hay muchas formas de ser parte del HUB de Comunidades. 
            Elige la opción que mejor se adapte a tus objetivos.
          </p>
        </div>

        {/* Registration Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {registrationTypes.map((type) => (
            <Card 
              key={type.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-glow ${
                selectedType === type.id 
                  ? 'ring-2 ring-primary shadow-glow' 
                  : 'hover:shadow-card'
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-hero flex items-center justify-center mb-4 ${
                  selectedType === type.id ? 'animate-glow' : ''
                }`}>
                  <type.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{type.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  {type.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Type Details */}
        {selectedRegistration && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Benefits */}
            <div>
              <h3 className="text-2xl font-bold mb-6">
                Beneficios de {selectedRegistration.title}
              </h3>
              <div className="space-y-4">
                {selectedRegistration.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button variant="hero" size="lg" className="group">
                  {selectedRegistration.cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>
            </div>

            {/* Registration Form Preview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedRegistration.icon className="h-5 w-5 text-primary" />
                  Formulario de {selectedRegistration.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre de la {selectedType === 'alliance' ? 'Organización' : 'Comunidad'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Nombre de tu ${selectedType === 'alliance' ? 'organización' : 'comunidad'}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email de contacto</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="contacto@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                    placeholder="Cuéntanos sobre tu proyecto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {selectedType === 'alliance' ? 'Tipo de Alianza' : 'Categoría Principal'}
                  </label>
                  <select className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    {selectedType === 'alliance' ? (
                      <>
                        <option>Empresa Privada</option>
                        <option>Institución Educativa</option>
                        <option>Organización Gubernamental</option>
                        <option>ONG/Fundación</option>
                      </>
                    ) : (
                      <>
                        <option>Tecnología</option>
                        <option>Educación</option>
                        <option>Impacto Social</option>
                        <option>Emprendimiento</option>
                        <option>Web3</option>
                      </>
                    )}
                  </select>
                </div>

                <Button variant="community" className="w-full">
                  Enviar Solicitud
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-hero text-white p-8 shadow-glow">
            <h3 className="text-2xl font-bold mb-4">
              ¿Tienes dudas sobre cómo unirte?
            </h3>
            <p className="text-white/90 mb-6">
              Nuestro equipo está aquí para ayudarte. Agenda una sesión de orientación gratuita.
            </p>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              Agendar Sesión
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;