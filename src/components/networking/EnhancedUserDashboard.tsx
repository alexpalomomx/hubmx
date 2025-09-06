import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  UserPlus, 
  BookOpen, 
  Bell, 
  Settings,
  Network,
  TrendingUp,
  Calendar,
  Globe,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  useUserConnections, 
  useConnectionRequests,
  useMentorshipRequests 
} from "@/hooks/useNetworkingData";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useConversations } from "@/hooks/useMessaging";
import { useNetworkingSuggestions } from "@/hooks/useNetworkingSuggestions";
import { useNetworkingStats } from "@/hooks/useNetworkingAnalytics";
import { MessagingInterface } from "@/components/messaging/MessagingInterface";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { NetworkingSuggestions } from "./NetworkingSuggestions";
import { NetworkingAnalyticsDashboard } from "./NetworkingAnalyticsDashboard";
import MentorshipCenter from "./MentorshipCenter";

export const EnhancedUserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: connections } = useUserConnections();
  const { data: connectionRequests } = useConnectionRequests();
  const { data: mentorshipRequests } = useMentorshipRequests();
  const { data: unreadNotifications } = useUnreadNotificationCount();
  const { data: conversations } = useConversations();
  const { data: suggestions } = useNetworkingSuggestions();
  const { data: networkingStats } = useNetworkingStats();

  const acceptedConnections = connections?.filter(conn => conn.status === "accepted") || [];
  const pendingConnectionRequests = connectionRequests?.filter(req => req.status === "pending") || [];
  const pendingMentorshipRequests = mentorshipRequests?.filter(req => req.status === "pending") || [];
  const unreadMessages = conversations?.filter(conv => conv.messages?.some((msg: any) => !msg.is_read)) || [];

  const networkingStatsCards = [
    {
      title: "Conexiones",
      value: acceptedConnections.length,
      icon: Users,
      color: "text-blue-500",
      onClick: () => setActiveTab("connections"),
      description: "Conexiones activas"
    },
    {
      title: "Mensajes",
      value: unreadMessages.length,
      icon: MessageSquare,
      color: "text-green-500",
      onClick: () => setActiveTab("messages"),
      description: "Conversaciones sin leer",
      badge: unreadMessages.length > 0 ? unreadMessages.length : undefined
    },
    {
      title: "Solicitudes",
      value: pendingConnectionRequests.length,
      icon: UserPlus,
      color: "text-orange-500",
      onClick: () => setActiveTab("requests"),
      description: "Solicitudes pendientes",
      badge: pendingConnectionRequests.length > 0 ? pendingConnectionRequests.length : undefined
    },
    {
      title: "Mentorías",
      value: pendingMentorshipRequests.length,
      icon: BookOpen,
      color: "text-purple-500",
      onClick: () => setActiveTab("mentorship"),
      description: "Mentorías activas"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Mi Dashboard de Networking
              </h1>
              <p className="text-muted-foreground">Gestiona tus conexiones y crecimiento profesional</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/profile")}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Perfil
            </Button>
            {unreadNotifications && unreadNotifications > 0 && (
              <div className="relative">
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {unreadNotifications}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {networkingStatsCards.map((stat) => (
            <Card 
              key={stat.title} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.badge && (
                        <Badge variant="destructive" className="text-xs">
                          {stat.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/networking")}>
                <Globe className="h-6 w-6" />
                <span className="text-sm">Explorar Miembros</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab("suggestions")}>
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Ver Sugerencias</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/#eventos")}>
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Eventos Networking</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab("analytics")}>
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Ver Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="connections">Conexiones</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorías</TabsTrigger>
            <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Nueva conexión aceptada</p>
                        <p className="text-sm text-muted-foreground">Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Perfil actualizado</p>
                        <p className="text-sm text-muted-foreground">Ayer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Nueva solicitud de mentoría</p>
                        <p className="text-sm text-muted-foreground">Hace 3 días</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Networking Stats Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estadísticas de Networking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Visualizaciones de perfil esta semana</span>
                      <Badge variant="secondary">{networkingStats?.profile_views || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Nuevas conexiones este mes</span>
                      <Badge variant="secondary">{networkingStats?.connections_made || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Mensajes intercambiados</span>
                      <Badge variant="secondary">{networkingStats?.messages_sent || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tasa de respuesta</span>
                      <Badge variant="secondary">85%</Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setActiveTab("analytics")}
                  >
                    Ver Análisis Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="connections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Conexiones</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Vista de conexiones aquí</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <div className="h-[600px]">
              <MessagingInterface />
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Conexión</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Vista de solicitudes aquí</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentorship" className="mt-6">
            <MentorshipCenter />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-6">
            <NetworkingSuggestions />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <NetworkingAnalyticsDashboard userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
