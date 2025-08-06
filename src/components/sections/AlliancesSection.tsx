import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlliances } from "@/hooks/useSupabaseData";
import { 
  Building, 
  Globe, 
  ExternalLink, 
  ArrowRight 
} from "lucide-react";

const AlliancesSection = () => {
  const { data: alliances } = useAlliances();

  const activeAlliances = alliances?.filter(alliance => alliance.status === 'active').slice(0, 6);

  const getTypeBadge = (type: string) => {
    const colors = {
      'empresa': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'organizacion': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'institucion': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'startup': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'aceleradora': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'universidad': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}>
        {type}
      </Badge>
    );
  };

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Nuestras Alianzas
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Colaboramos con organizaciones, empresas e instituciones que comparten nuestra visión
            de fortalecer el ecosistema de innovación y tecnología
          </p>
        </div>

        {!activeAlliances || activeAlliances.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Próximamente</h3>
            <p className="text-muted-foreground">
              Estamos trabajando para establecer alianzas estratégicas que beneficien a toda la comunidad
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {activeAlliances.map((alliance) => (
                <Card key={alliance.id} className="group hover:shadow-alliance transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      {alliance.logo_url ? (
                        <img
                          src={alliance.logo_url}
                          alt={`Logo de ${alliance.name}`}
                          className="w-16 h-16 rounded-2xl object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><svg class="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"></path></svg></div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Building className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      {getTypeBadge(alliance.alliance_type)}
                    </div>
                    
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {alliance.name}
                    </CardTitle>
                    
                    <CardDescription className="line-clamp-3">
                      {alliance.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {alliance.benefits && alliance.benefits.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 text-foreground">Beneficios:</h4>
                          <div className="flex flex-wrap gap-1">
                            {alliance.benefits.slice(0, 3).map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                            {alliance.benefits.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{alliance.benefits.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {alliance.website_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                          asChild
                        >
                          <a 
                            href={alliance.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Ver sitio web</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {alliances && alliances.length > 6 && (
              <div className="text-center">
                <Button variant="outline" className="group">
                  Ver todas las alianzas
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AlliancesSection;