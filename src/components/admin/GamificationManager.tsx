import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, Users, Calendar, TrendingUp, Share2, UserPlus, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const GamificationManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: topUsers, isLoading } = useQuery({
    queryKey: ['top-users-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select(`*, profiles(display_name, avatar_url)`)
        .order('total_points', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

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
      return { totalUsers: totalUsers || 0, totalPoints, avgPoints, totalActions: totalActions || 0 };
    },
  });

  const handleSyncPoints = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('sync-communities', {
        body: { action: 'sync', direction: 'bidirectional' }
      });
      if (error) throw error;
      toast({ title: "Sincronización exitosa", description: "Los puntos se han sincronizado correctamente" });
    } catch (error) {
      toast({ title: "Error en sincronización", description: "No se pudo completar la sincronización", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const pointsConfig = [
    { icon: Users, color: "text-blue-500", label: "Unirse a una comunidad", points: 10 },
    { icon: Calendar, color: "text-green-500", label: "Interés en evento (Me interesa)", points: 5 },
    { icon: Calendar, color: "text-emerald-500", label: "Registrarse en un evento", points: 5 },
    { icon: Share2, color: "text-purple-500", label: "Compartir contenido", points: 3 },
    { icon: UserPlus, color: "text-orange-500", label: "Referir un usuario", points: 10 },
    { icon: FileText, color: "text-pink-500", label: "Blog post aprobado", points: 20 },
    { icon: Users, color: "text-cyan-500", label: "Completar perfil networking", points: 10 },
    { icon: Star, color: "text-yellow-500", label: "Primera conexión", points: 5 },
    { icon: Trophy, color: "text-amber-600", label: "Mentoría completada (mentor)", points: 20 },
    { icon: Trophy, color: "text-amber-400", label: "Mentoría completada (mentee)", points: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Gamificación</h2>
          <p className="text-muted-foreground">Gestiona puntos y sincronización con Legion Hack MX</p>
        </div>
        <Button onClick={handleSyncPoints} disabled={loading}>
          {loading ? "Sincronizando..." : "Sincronizar Puntos"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, color: "text-primary", label: "Usuarios Activos", value: stats?.totalUsers || 0 },
          { icon: Trophy, color: "text-yellow-500", label: "Puntos Totales", value: stats?.totalPoints || 0 },
          { icon: Star, color: "text-orange-500", label: "Promedio de Puntos", value: stats?.avgPoints || 0 },
          { icon: TrendingUp, color: "text-green-500", label: "Acciones Totales", value: stats?.totalActions || 0 },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Points Config */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Puntos</CardTitle>
          <CardDescription>Todas las acciones que otorgan puntos en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pointsConfig.map((item, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-sm text-muted-foreground">+{item.points} puntos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 10 Usuarios por Puntos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pos</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Puntos</TableHead>
                  <TableHead>Comunidades</TableHead>
                  <TableHead>Eventos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers?.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index < 3 && <Trophy className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />}
                        #{index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {(user.profiles as any)?.display_name || 'Usuario anónimo'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">{user.total_points}</Badge>
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
