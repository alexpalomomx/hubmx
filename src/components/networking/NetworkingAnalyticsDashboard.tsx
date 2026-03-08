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
    },
    {
      title: "Conexiones Realizadas",
      value: userStats?.connections_made || 0,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Mensajes Enviados",
      value: userStats?.messages_sent || 0,
      icon: MessageSquare,
      color: "text-purple-500",
    },
    {
      title: "Total Actividades",
      value: userStats?.total_activities || 0,
      icon: Activity,
      color: "text-orange-500",
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
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
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