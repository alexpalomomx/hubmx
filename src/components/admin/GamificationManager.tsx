import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, Users, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const GamificationManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch top users by points
  const { data: topUsers, isLoading } = useQuery({
    queryKey: ['top-users-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          *,
          profiles(display_name, avatar_url)
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Fetch gamification stats
  const { data: stats } = useQuery({
    queryKey: ['gamification-stats'],
    queryFn: async () => {
      const { count: totalUsers } = await supabase
        .from('user_points')
        .select('*', { count: 'exact', head: true });

      const { data: pointsData } = await supabase
        .from('user_points')
        .select('total_points');

      const { count: totalActions } = await supabase
        .from('points_history')
        .select('*', { count: 'exact', head: true });

      const totalPoints = pointsData?.reduce((sum, item) => sum + (item.total_points || 0), 0) || 0;
      const avgPoints = totalUsers ? Math.round(totalPoints / totalUsers) : 0;

      return {
        totalUsers: totalUsers || 0,
        totalPoints,
        avgPoints,
        totalActions: totalActions || 0
      };
    },
  });

  const handleSyncPoints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-communities', {
        body: {
          action: 'sync',
          direction: 'bidirectional'
        }
      });

      if (error) throw error;

      toast({
        title: "Sincronización exitosa",
        description: "Los puntos de gamificación se han sincronizado correctamente con Legion Hack MX",
      });
    } catch (error) {
      console.error('Error en sincronización de puntos:', error);
      toast({
        title: "Error en sincronización",
        description: "No se pudo completar la sincronización de puntos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Gamificación</h2>
          <p className="text-muted-foreground">
            Gestiona puntos y sincronización con Legion Hack MX
          </p>
        </div>
        <Button onClick={handleSyncPoints} disabled={loading}>
          {loading ? "Sincronizando..." : "Sincronizar Puntos"}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Puntos Totales</p>
                <p className="text-2xl font-bold">{stats?.totalPoints || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Promedio de Puntos</p>
                <p className="text-2xl font-bold">{stats?.avgPoints || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Acciones Totales</p>
                <p className="text-2xl font-bold">{stats?.totalActions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Puntos</CardTitle>
          <CardDescription>
            Así es como los usuarios ganan puntos en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Unirse a una comunidad</p>
                <p className="text-sm text-muted-foreground">+10 puntos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Registrarse en un evento</p>
                <p className="text-sm text-muted-foreground">+5 puntos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Users Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 10 Usuarios por Puntos
          </CardTitle>
          <CardDescription>
            Los usuarios con más puntos en el sistema de gamificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posición</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Puntos Totales</TableHead>
                  <TableHead>Comunidades</TableHead>
                  <TableHead>Eventos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers?.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                        {index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
                        #{index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {(user.profiles as any)?.display_name || 'Usuario anónimo'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {user.total_points}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.community_joins}</TableCell>
                    <TableCell>{user.event_registrations}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};