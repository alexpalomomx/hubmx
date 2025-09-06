import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import {
  TrendingUp,
  Users,
  MessageSquare,
  UserPlus,
  BookOpen,
  Eye,
  Activity,
  Calendar
} from "lucide-react";
import { 
  useNetworkingStats, 
  useNetworkingEngagement,
  useAdminNetworkingAnalytics 
} from "@/hooks/useNetworkingAnalytics";
import { useSuggestionAnalytics } from "@/hooks/useNetworkingSuggestions";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface NetworkingAnalyticsDashboardProps {
  userId?: string;
  isAdmin?: boolean;
}

export const NetworkingAnalyticsDashboard = ({ userId, isAdmin = false }: NetworkingAnalyticsDashboardProps) => {
  const { data: userStats } = useNetworkingStats(userId);
  const { data: engagement } = useNetworkingEngagement("week");
  const { data: adminAnalytics } = useAdminNetworkingAnalytics();
  const { data: suggestionStats } = useSuggestionAnalytics();

  const statsCards = [
    {
      title: "Visualizaciones de Perfil",
      value: userStats?.profile_views || 0,
      icon: Eye,
      color: "text-blue-500",
      change: "+12%"
    },
    {
      title: "Conexiones Realizadas",
      value: userStats?.connections_made || 0,
      icon: Users,
      color: "text-green-500",
      change: "+5%"
    },
    {
      title: "Mensajes Enviados",
      value: userStats?.messages_sent || 0,
      icon: MessageSquare,
      color: "text-purple-500",
      change: "+18%"
    },
    {
      title: "Total Actividades",
      value: userStats?.total_activities || 0,
      icon: Activity,
      color: "text-orange-500",
      change: "+8%"
    }
  ];

  const engagementData = engagement?.daily_breakdown ? 
    Object.entries(engagement.daily_breakdown).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
      actividad: count
    })) : [];

  const actionTypeData = engagement?.by_action_type ? 
    Object.entries(engagement.by_action_type).map(([type, count]) => ({
      name: type.replace('_', ' '),
      value: count
    })) : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change} esta semana</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="actions">Tipos de Acción</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Vista Admin</TabsTrigger>}
          <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Actividad de Networking (Últimos 7 días)
              </CardTitle>
              <CardDescription>
                Tu actividad de networking durante la última semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="actividad" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Acciones</CardTitle>
                <CardDescription>
                  Tipos de actividades de networking que realizas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={actionTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {actionTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desglose de Actividades</CardTitle>
                <CardDescription>
                  Resumen detallado de tu networking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Solicitudes enviadas</span>
                  </div>
                  <Badge variant="secondary">
                    {userStats?.connection_requests_sent || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Solicitudes recibidas</span>
                  </div>
                  <Badge variant="secondary">
                    {userStats?.connection_requests_received || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Mentorías solicitadas</span>
                  </div>
                  <Badge variant="secondary">
                    {userStats?.mentorship_requests_sent || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Mentorías recibidas</span>
                  </div>
                  <Badge variant="secondary">
                    {userStats?.mentorship_requests_received || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admin Tab */}
        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Administrativo</CardTitle>
                <CardDescription>
                  Vista general de la actividad de networking en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminAnalytics?.slice(0, 20).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium">
                            {activity.user?.display_name || 'Usuario desconocido'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.action_type.replace('_', ' ')}
                            {activity.target_user && ` → ${activity.target_user?.display_name}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Suggestions Tab */}
        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Sugerencias</CardTitle>
              <CardDescription>
                Estadísticas sobre las sugerencias de networking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{suggestionStats?.total || 0}</p>
                      <p className="text-sm text-muted-foreground">Total sugerencias</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{suggestionStats?.accepted || 0}</p>
                      <p className="text-sm text-muted-foreground">Aceptadas</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {suggestionStats?.acceptance_rate.toFixed(1) || 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Tasa de aceptación</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pendientes</span>
                  <span>{suggestionStats?.pending || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ 
                      width: `${suggestionStats?.total ? (suggestionStats.pending / suggestionStats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};