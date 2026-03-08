import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, MapPin, Loader2 } from "lucide-react";
import { useCommunities } from "@/hooks/useSupabaseData";
import { JoinCommunityDialog } from "@/components/JoinCommunityDialog";
import { SocialShare } from "@/components/ui/social-share";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CommunitiesSection = () => {
  const { data: communities, isLoading, error } = useCommunities("all");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pick 3 random communities, shuffle on each mount
  const randomCommunities = useMemo(() => {
    if (!communities || communities.length === 0) return [];
    const shuffled = [...communities].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [communities]);

  const handleJoinCommunity = () => {
    if (!user) {
      toast({
        title: "Registro requerido",
        description: "Para unirte a una comunidad, primero debes crear una cuenta.",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth?tab=signup")}>
            Crear cuenta
          </Button>
        ),
      });
    }
  };

  const getCommunityIcon = (category: string) => {
    const icons: Record<string, string> = { tech: "🚀", education: "🎓", social: "🌱", entrepreneurship: "💡", web3: "⛓️" };
    return icons[category] || "🌟";
  };

  const getCommunityColor = (category: string) => {
    const colors: Record<string, string> = { tech: "from-blue-500 to-purple-600", education: "from-green-500 to-teal-600", social: "from-emerald-500 to-green-600", entrepreneurship: "from-yellow-500 to-orange-600", web3: "from-orange-500 to-red-600" };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  if (error) {
    return (
      <section id="comunidades" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-destructive">Error al cargar las comunidades</p>
        </div>
      </section>
    );
  }

  return (
    <section id="comunidades" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comunidades{" "}
            <span className="bg-gradient-community bg-clip-text text-transparent">Activas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre y conecta con comunidades que están transformando el mundo
            a través de la tecnología, la educación y el impacto social.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando comunidades...</span>
          </div>
        )}

        {/* Communities Grid - 3 random */}
        {randomCommunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {randomCommunities.map((community) => (
              <Card key={community.id} className="group hover:shadow-community transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="mb-4">
                      {community.logo_url ? (
                        <img
                          src={community.logo_url}
                          alt={`Logo de ${community.name}`}
                          className="w-16 h-16 rounded-2xl object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${getCommunityColor(community.category)} flex items-center justify-center text-2xl">${getCommunityIcon(community.category)}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCommunityColor(community.category)} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                          {getCommunityIcon(community.category)}
                        </div>
                      )}
                    </div>
                    {community.website_url && (
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={() => window.open(community.website_url, '_blank')}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200">
                    {community.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{community.description}</p>

                  {community.topics && community.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {community.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{(community.members_count || 0).toLocaleString()} interesados</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{community.location}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {community.website_url && (
                        <Button onClick={() => window.open(community.website_url, '_blank')} variant="outline" className="flex-1" size="sm">
                          Visitar sitio
                        </Button>
                      )}
                      {user ? (
                        <JoinCommunityDialog community={{ id: community.id, name: community.name }}>
                          <Button className="flex-1" size="sm">
                            <Users className="mr-2 h-4 w-4" />
                            Me interesa
                          </Button>
                        </JoinCommunityDialog>
                      ) : (
                        <Button className="flex-1" size="sm" onClick={handleJoinCommunity}>
                          <Users className="mr-2 h-4 w-4" />
                          Me interesa
                        </Button>
                      )}
                    </div>
                    <SocialShare
                      url={window.location.origin}
                      title={`Únete a ${community.name}`}
                      description={community.description}
                      hashtags={[community.category, 'comunidad', ...community.topics?.slice(0, 3) || []]}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {communities && communities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron comunidades.</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" onClick={() => navigate("/mapa")} className="group">
            <MapPin className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Explorar mapa de comunidades
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/comunidades")}>
            Ver todas las comunidades
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunitiesSection;
