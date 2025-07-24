import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommunities } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { MapPin, Users, Mail, Globe, Calendar } from "lucide-react";

export function ManageCommunityData() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { data: communities, isLoading } = useCommunities(selectedCategory === "all" ? undefined : selectedCategory);

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "tech", label: "Tecnología" },
    { value: "education", label: "Educación" },
    { value: "social", label: "Impacto Social" },
    { value: "entrepreneurship", label: "Emprendimiento" },
    { value: "web3", label: "Web3" }
  ];

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tech": return "bg-blue-100 text-blue-800";
      case "education": return "bg-green-100 text-green-800";
      case "social": return "bg-purple-100 text-purple-800";
      case "entrepreneurship": return "bg-orange-100 text-orange-800";
      case "web3": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Información de Comunidades</h2>
          <p className="text-muted-foreground">
            Visualiza los datos detallados de todas las comunidades registradas
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary">
          {communities?.length || 0} comunidades
        </Badge>
      </div>

      <div className="grid gap-4">
        {communities?.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No hay comunidades para mostrar
              </p>
            </CardContent>
          </Card>
        ) : (
          communities?.map((community) => (
            <Card key={community.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{community.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(community.category)}>
                      {getCategoryLabel(community.category)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(community.created_at), "dd MMM yyyy", { locale: es })}
                    </Badge>
                  </div>
                </div>
                {community.description && (
                  <p className="text-muted-foreground text-sm mt-2">
                    {community.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {community.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                        <p className="text-sm">{community.contact_email}</p>
                      </div>
                    </div>
                  )}
                  
                  {community.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Ubicación</p>
                        <p className="text-sm">{community.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Miembros</p>
                      <p className="text-sm">{community.members_count || 0}</p>
                    </div>
                  </div>

                  {community.website_url && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Sitio web</p>
                        <a 
                          href={community.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Ver sitio
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {community.topics && community.topics.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Temáticas</p>
                    <div className="flex flex-wrap gap-1">
                      {community.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Registrada: {format(new Date(community.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}</span>
                  </div>
                  <Badge variant={community.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {community.status === 'active' ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}