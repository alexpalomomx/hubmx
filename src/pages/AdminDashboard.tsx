import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Building, 
  Megaphone, 
  FileText, 
  BarChart3,
  ArrowLeft,
  Settings
} from "lucide-react";
import { useStats, useCommunities, useEvents, useAlliances, useCalls } from "@/hooks/useSupabaseData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import AddCommunityDialog from "@/components/admin/AddCommunityDialog";

const AdminDashboard = () => {
  const { user, isAdmin, isCoordinator, loading } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useStats();
  const { data: communities } = useCommunities();
  const { data: events } = useEvents();
  const { data: alliances } = useAlliances();
  const { data: calls } = useCalls();

  // Habilitar actualizaciones en tiempo real
  useRealtimeUpdates();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (!loading && user && !isAdmin && !isCoordinator) {
      navigate("/");
    }
  }, [user, isAdmin, isCoordinator, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isCoordinator)) {
    return null;
  }

  const statsCards = [
    {
      title: "Comunidades",
      value: stats?.communities || 0,
      icon: Users,
      description: "Comunidades activas",
      color: "text-blue-600"
    },
    {
      title: "Eventos",
      value: stats?.events || 0,
      icon: Calendar,
      description: "Total de eventos",
      color: "text-green-600"
    },
    {
      title: "Alianzas",
      value: stats?.alliances || 0,
      icon: Building,
      description: "Alianzas activas",
      color: "text-purple-600"
    },
    {
      title: "Miembros",
      value: stats?.members || 0,
      icon: Users,
      description: "Total de miembros",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al inicio</span>
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Dashboard Administrativo
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                {isAdmin ? 'Admin' : 'Coordinador'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="communities" className="space-y-6">
          <TabsList className="grid w-full lg:grid-cols-5">
            <TabsTrigger value="communities">Comunidades</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="alliances">Alianzas</TabsTrigger>
            <TabsTrigger value="calls">Convocatorias</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="communities" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestión de Comunidades</h2>
                <p className="text-muted-foreground">
                  Administra las comunidades registradas en la plataforma
                </p>
              </div>
              <AddCommunityDialog>
                <Button variant="hero">
                  <Users className="mr-2 h-4 w-4" />
                  Nueva Comunidad
                </Button>
              </AddCommunityDialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities?.slice(0, 6).map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{community.name}</span>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {community.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {community.members_count || 0} miembros
                      </span>
                      <span className="capitalize text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {community.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestión de Eventos</h2>
                <p className="text-muted-foreground">
                  Administra eventos y actividades
                </p>
              </div>
              <Button variant="hero">
                <Calendar className="mr-2 h-4 w-4" />
                Nuevo Evento
              </Button>
            </div>
            
            <div className="space-y-4">
              {events?.slice(0, 5).map((event) => (
                <Card key={event.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(event.event_date).toLocaleDateString('es-ES')} - {event.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                        {event.event_type}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alliances" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestión de Alianzas</h2>
                <p className="text-muted-foreground">
                  Administra alianzas y colaboradores
                </p>
              </div>
              {isAdmin && (
                <Button variant="hero">
                  <Building className="mr-2 h-4 w-4" />
                  Nueva Alianza
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alliances?.map((alliance) => (
                <Card key={alliance.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{alliance.name}</span>
                      {isAdmin && (
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {alliance.alliance_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {alliance.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calls" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestión de Convocatorias</h2>
                <p className="text-muted-foreground">
                  Administra convocatorias y oportunidades
                </p>
              </div>
              <Button variant="hero">
                <Megaphone className="mr-2 h-4 w-4" />
                Nueva Convocatoria
              </Button>
            </div>
            
            <div className="space-y-4">
              {calls?.map((call) => (
                <Card key={call.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{call.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {call.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Tipo: {call.call_type}</span>
                          <span>Fecha límite: {new Date(call.application_deadline).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded capitalize ${
                          call.status === 'open' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {call.status === 'open' ? 'Abierta' : 'Cerrada'}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestión del Blog</h2>
                <p className="text-muted-foreground">
                  Administra publicaciones y contenido
                </p>
              </div>
              <Button variant="hero">
                <FileText className="mr-2 h-4 w-4" />
                Nueva Publicación
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No hay publicaciones</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza creando tu primera publicación del blog
                </p>
                <Button variant="outline">
                  Crear publicación
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;