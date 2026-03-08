import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommunities } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { Users, MapPin, Globe, TrendingUp } from "lucide-react";

export function ManageCommunityData() {
  const { data: communities, isLoading } = useCommunities("all");

  const stats = useMemo(() => {
    if (!communities) return null;

    const totalMembers = communities.reduce((sum, c) => sum + (c.members_count || 0), 0);
    const active = communities.filter(c => c.status === "active").length;
    const withWebsite = communities.filter(c => c.website_url).length;

    const byCategory = communities.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = communities.reduce((acc, c) => {
      const loc = c.state || c.location || "Sin ubicación";
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalMembers, active, withWebsite, byCategory, byLocation, total: communities.length };
  }, [communities]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Resumen de Comunidades</h2>
        <p className="text-sm text-muted-foreground">Estadísticas generales</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Comunidades</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
              <p className="text-xs text-muted-foreground">Interesados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.withWebsite || 0}</p>
              <p className="text-xs text-muted-foreground">Con sitio web</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.active || 0}</p>
              <p className="text-xs text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Por categoría</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}: {count}
                </Badge>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
