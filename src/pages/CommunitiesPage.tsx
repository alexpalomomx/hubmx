import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Filter, Users, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { useCommunities } from "@/hooks/useSupabaseData";
import { JoinCommunityDialog } from "@/components/JoinCommunityDialog";
import { SocialShare } from "@/components/ui/social-share";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCommunityCategories } from "@/hooks/useCommunityCategories";
import { getAllCountryNames, getStatesForCountry } from "@/lib/latam-locations";

const CommunitiesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const { data: communities, isLoading, error } = useCommunities(selectedCategory);
  const { data: dbCategories = [] } = useCommunityCategories();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "Todas" },
    ...dbCategories.map((c) => ({ id: c.value, name: c.label })),
  ];

  const countries = getAllCountryNames();
  const states = selectedCountry !== "all" ? getStatesForCountry(selectedCountry) : [];

  // Filter by location client-side
  const filteredCommunities = communities?.filter((c) => {
    if (selectedCountry !== "all" && c.country !== selectedCountry) return false;
    if (selectedState !== "all" && c.state !== selectedState) return false;
    return true;
  });

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-community bg-clip-text text-transparent">
              Comunidades
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Categoría:</span>
            </div>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Location filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Ubicación:</span>
            </div>
            <Select value={selectedCountry} onValueChange={(v) => { setSelectedCountry(v); setSelectedState("all"); }}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los países</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {states.length > 0 && (
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Error al cargar las comunidades</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando comunidades...</span>
          </div>
        )}

        {/* Results count */}
        {filteredCommunities && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredCommunities.length} comunidad{filteredCommunities.length !== 1 ? "es" : ""} encontrada{filteredCommunities.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        {filteredCommunities && filteredCommunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCommunities.map((community) => (
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
                  {/* Country/State badge */}
                  {(community.country || community.state) && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {[community.state, community.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
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

        {filteredCommunities && filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron comunidades con estos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;
