import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Users, Award, Loader2 } from "lucide-react";
import { useCalls } from "@/hooks/useSupabaseData";

const CallsSection = () => {
  const { data: calls, isLoading, error } = useCalls("open");

  if (error) {
    return null; // No mostrar la sección si hay error
  }

  // No mostrar la sección si no hay convocatorias abiertas
  if (!isLoading && (!calls || calls.length === 0)) {
    return null;
  }

  return (
    <section id="convocatorias" className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Convocatorias{" "}
            <span className="bg-gradient-community bg-clip-text text-transparent">
              Abiertas
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre oportunidades de financiación, becas, programas de aceleración 
            y concursos que pueden impulsar tu proyecto o carrera.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando convocatorias...</span>
          </div>
        )}

        {/* Calls Grid */}
        {calls && calls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {calls.map((call) => (
              <Card key={call.id} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="default" className="bg-community text-community-foreground">
                      {call.call_type === 'beca' ? 'Beca' : 
                       call.call_type === 'aceleracion' ? 'Aceleración' :
                       call.call_type === 'hackathon' ? 'Hackathon' :
                       call.call_type}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(call.application_deadline).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200">
                    {call.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {call.description}
                  </p>
                  
                  {/* Requirements */}
                  {call.requirements && call.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-1 text-primary" />
                        Requisitos:
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {call.requirements.slice(0, 2).map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-1 h-1 rounded-full bg-primary mt-2 mr-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                        {call.requirements.length > 2 && (
                          <li className="text-xs text-muted-foreground italic">
                            +{call.requirements.length - 2} requisitos más
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {call.benefits && call.benefits.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-2 flex items-center">
                        <Award className="h-4 w-4 mr-1 text-community" />
                        Beneficios:
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {call.benefits.slice(0, 2).map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-1 h-1 rounded-full bg-community mt-2 mr-2 flex-shrink-0"></span>
                            {benefit}
                          </li>
                        ))}
                        {call.benefits.length > 2 && (
                          <li className="text-xs text-muted-foreground italic">
                            +{call.benefits.length - 2} beneficios más
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <Button 
                    variant="hero" 
                    className="w-full group-hover:scale-105 transition-transform duration-200"
                    onClick={() => call.application_url && window.open(call.application_url, '_blank')}
                  >
                    Postúlate aquí
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA for more calls */}
        {calls && calls.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="community" size="lg">
              Ver todas las convocatorias
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CallsSection;