import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Users, ExternalLink, X, Globe } from "lucide-react";
import { useCommunities } from "@/hooks/useSupabaseData";
import { LATAM_COUNTRIES } from "@/lib/latam-locations";

// SVG paths for simplified LATAM country shapes (centered positions for markers)
const COUNTRY_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  "México": { x: 150, y: 120, label: "MX" },
  "Guatemala": { x: 195, y: 175, label: "GT" },
  "Honduras": { x: 215, y: 175, label: "HN" },
  "El Salvador": { x: 200, y: 185, label: "SV" },
  "Nicaragua": { x: 220, y: 195, label: "NI" },
  "Costa Rica": { x: 225, y: 215, label: "CR" },
  "Panamá": { x: 245, y: 225, label: "PA" },
  "Cuba": { x: 230, y: 125, label: "CU" },
  "República Dominicana": { x: 280, y: 140, label: "DO" },
  "Colombia": { x: 260, y: 270, label: "CO" },
  "Venezuela": { x: 310, y: 240, label: "VE" },
  "Ecuador": { x: 235, y: 310, label: "EC" },
  "Perú": { x: 250, y: 370, label: "PE" },
  "Bolivia": { x: 300, y: 400, label: "BO" },
  "Paraguay": { x: 330, y: 430, label: "PY" },
  "Chile": { x: 280, y: 490, label: "CL" },
  "Argentina": { x: 320, y: 500, label: "AR" },
  "Uruguay": { x: 355, y: 460, label: "UY" },
};

const CommunityMapPage = () => {
  const navigate = useNavigate();
  const { data: communities, isLoading } = useCommunities("all");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Group communities by country
  const communitiesByCountry = useMemo(() => {
    if (!communities) return {};
    const grouped: Record<string, typeof communities> = {};
    communities.forEach((c) => {
      const country = c.country || "México";
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(c);
    });
    return grouped;
  }, [communities]);

  const countriesWithCommunities = Object.keys(communitiesByCountry);
  const selectedCommunities = selectedCountry ? communitiesByCountry[selectedCountry] || [] : [];

  const totalCommunities = communities?.length || 0;
  const totalCountries = countriesWithCommunities.length;

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
              Mapa de Comunidades
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCommunities}</p>
                <p className="text-xs text-muted-foreground">Comunidades</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCountries}</p>
                <p className="text-xs text-muted-foreground">Países</p>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <Select value={selectedCountry || ""} onValueChange={(v) => setSelectedCountry(v || null)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filtrar por país" />
                </SelectTrigger>
                <SelectContent>
                  {countriesWithCommunities.sort().map((country) => (
                    <SelectItem key={country} value={country}>
                      {country} ({communitiesByCountry[country]?.length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCountry && (
                <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" onClick={() => setSelectedCountry(null)}>
                  <X className="h-3 w-3 mr-1" /> Limpiar filtro
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Map */}
          <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Mapa Interactivo LATAM
              </h2>
              <div className="relative bg-muted/30 rounded-xl p-4">
                <svg viewBox="80 60 330 520" className="w-full h-auto max-h-[500px]">
                  {/* Background */}
                  <rect x="80" y="60" width="330" height="520" fill="transparent" />
                  
                  {/* Country markers */}
                  {Object.entries(COUNTRY_POSITIONS).map(([country, pos]) => {
                    const count = communitiesByCountry[country]?.length || 0;
                    const isActive = count > 0;
                    const isSelected = selectedCountry === country;
                    const isHovered = hoveredCountry === country;
                    const radius = isActive ? Math.min(8 + count * 3, 22) : 6;
                    
                    return (
                      <g
                        key={country}
                        className={isActive ? "cursor-pointer" : ""}
                        onClick={() => isActive && setSelectedCountry(isSelected ? null : country)}
                        onMouseEnter={() => setHoveredCountry(country)}
                        onMouseLeave={() => setHoveredCountry(null)}
                      >
                        {/* Pulse animation for active countries */}
                        {isActive && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={radius + 4}
                            className={isSelected ? "fill-primary/30" : "fill-primary/10"}
                          >
                            <animate
                              attributeName="r"
                              values={`${radius + 2};${radius + 8};${radius + 2}`}
                              dur="3s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.6;0.1;0.6"
                              dur="3s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                        
                        {/* Main circle */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={radius}
                          className={
                            isSelected
                              ? "fill-primary stroke-primary-foreground"
                              : isActive
                              ? isHovered
                                ? "fill-primary/80 stroke-primary"
                                : "fill-primary/60 stroke-primary/30"
                              : "fill-muted-foreground/20 stroke-muted-foreground/10"
                          }
                          strokeWidth={isSelected ? 3 : 1.5}
                          style={{ transition: "all 0.2s ease" }}
                        />
                        
                        {/* Count label for active */}
                        {isActive && (
                          <text
                            x={pos.x}
                            y={pos.y + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-primary-foreground font-bold pointer-events-none"
                            fontSize={radius > 14 ? 11 : 9}
                          >
                            {count}
                          </text>
                        )}
                        
                        {/* Country label */}
                        <text
                          x={pos.x}
                          y={pos.y + radius + 12}
                          textAnchor="middle"
                          className={
                            isSelected || isHovered
                              ? "fill-foreground font-semibold"
                              : isActive
                              ? "fill-muted-foreground font-medium"
                              : "fill-muted-foreground/50"
                          }
                          fontSize={isSelected || isHovered ? 10 : 8}
                          style={{ transition: "all 0.2s ease" }}
                        >
                          {pos.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Hover tooltip */}
                {hoveredCountry && (
                  <div className="absolute top-2 right-2 bg-card border border-border rounded-lg shadow-lg p-3 text-sm z-10">
                    <p className="font-semibold">{hoveredCountry}</p>
                    <p className="text-muted-foreground">
                      {communitiesByCountry[hoveredCountry]?.length || 0} comunidades
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Haz clic en un país para ver sus comunidades
              </p>
            </CardContent>
          </Card>

          {/* Community List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {selectedCountry
                ? `Comunidades en ${selectedCountry} (${selectedCommunities.length})`
                : `Selecciona un país en el mapa`}
            </h2>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando...</div>
            ) : selectedCountry ? (
              selectedCommunities.length > 0 ? (
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {selectedCommunities.map((community) => (
                    <Card
                      key={community.id}
                      className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Logo */}
                          <div className="shrink-0">
                            {community.logo_url ? (
                              <img
                                src={community.logo_url}
                                alt={community.name}
                                className="w-12 h-12 rounded-xl object-cover border border-border"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                  const next = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (next) next.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-primary-foreground text-lg font-bold ${
                                community.logo_url ? "hidden" : ""
                              }`}
                            >
                              {community.name.charAt(0)}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {community.name}
                            </h3>
                            {community.state && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{community.state}</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {community.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {community.category}
                              </Badge>
                              {community.members_count ? (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Users className="h-3 w-3" />
                                  {community.members_count}
                                </span>
                              ) : null}
                              {community.website_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 px-1.5 text-[10px]"
                                  onClick={() => window.open(community.website_url, "_blank")}
                                >
                                  <ExternalLink className="h-3 w-3 mr-0.5" />
                                  Web
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No hay comunidades registradas en {selectedCountry}</p>
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <Globe className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Haz clic en un país del mapa para explorar sus comunidades</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Los círculos más grandes indican más comunidades
                </p>
              </div>
            )}

            {/* View all link */}
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => navigate("/comunidades")}>
                Ver listado completo de comunidades
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMapPage;
