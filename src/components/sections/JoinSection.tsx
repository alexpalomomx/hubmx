import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, HandHeart, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const JoinSection = () => {
  const [selectedType, setSelectedType] = useState("community");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    category: "Tecnología"
  });
  const { toast } = useToast();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (selectedType === "community") {
        const { error } = await supabase
          .from("communities")
          .insert({
            name: formData.name,
            description: formData.description,
            category: formData.category.toLowerCase(),
            contact_email: formData.email,
            status: "active"
          });

        if (error) throw error;

        toast({
          title: "¡Comunidad registrada exitosamente!",
          description: "Tu comunidad ha sido registrada y será revisada por nuestro equipo.",
        });
      } else if (selectedType === "alliance") {
        const { error } = await supabase
          .from("alliances")
          .insert({
            name: formData.name,
            description: formData.description,
            alliance_type: formData.category,
            contact_email: formData.email,
            status: "active"
          });

        if (error) throw error;

        toast({
          title: "¡Alianza registrada exitosamente!",
          description: "Tu alianza ha sido registrada y será revisada por nuestro equipo.",
        });
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        description: "",
        category: selectedType === 'alliance' ? 'Empresa Privada' : 'Tecnología'
      });

    } catch (error) {
      console.error("Error al registrar:", error);
      toast({
        title: "Error al registrar",
        description: "Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

            {/* Registration Form */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedRegistration.icon className="h-5 w-5 text-primary" />
                  Formulario de {selectedRegistration.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre de la {selectedType === 'alliance' ? 'Organización' : 'Comunidad'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Nombre de tu ${selectedType === 'alliance' ? 'organización' : 'comunidad'}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email de contacto</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="contacto@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                      placeholder="Cuéntanos sobre tu proyecto..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {selectedType === 'alliance' ? 'Tipo de Alianza' : 'Categoría Principal'}
                    </label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {selectedType === 'alliance' ? (
                        <>
                          <option value="Empresa Privada">Empresa Privada</option>
                          <option value="Institución Educativa">Institución Educativa</option>
                          <option value="Organización Gubernamental">Organización Gubernamental</option>
                          <option value="ONG/Fundación">ONG/Fundación</option>
                        </>
                      ) : (
                        <>
                          <option value="tech">Tecnología</option>
                          <option value="education">Educación</option>
                          <option value="social">Impacto Social</option>
                          <option value="entrepreneurship">Emprendimiento</option>
                          <option value="web3">Web3</option>
                        </>
                      )}
                    </select>
                  </div>

                  <Button 
                    type="submit" 
                    variant="community" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "Enviar Solicitud"}
                  </Button>
                </form>
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