import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Building, 
  Megaphone, 
  FileText, 
  BarChart3,
  ArrowLeft,
  Settings,
  Plus,
  Award,
  Briefcase,
  RefreshCw,
  Trophy
} from "lucide-react";
import { useStats, useCommunities, useEvents, useAlliances, useCalls, usePendingApprovals } from "@/hooks/useSupabaseData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import AddCommunityDialog from "@/components/admin/AddCommunityDialog";
import AddEventDialog from "@/components/admin/AddEventDialog";
import AddCallDialog from "@/components/admin/AddCallDialog";
import AddAllianceDialog from "@/components/admin/AddAllianceDialog";
import AddBlogPostDialog from "@/components/admin/AddBlogPostDialog";
import ManageCommunities from "@/components/admin/ManageCommunities";
import ManageEvents from "@/components/admin/ManageEvents";
import ManageCalls from "@/components/admin/ManageCalls";
import ManageAlliances from "@/components/admin/ManageAlliances";
import ManageBlogPosts from "@/components/admin/ManageBlogPosts";
import { ManageEventRegistrations } from "@/components/admin/ManageEventRegistrations";
import { ManageCommunityData } from "@/components/admin/ManageCommunityData";
import { ManagePendingApprovals } from "@/components/admin/ManagePendingApprovals";
import ManageContentApprovals from "@/components/admin/ManageContentApprovals";
import ManageUsers from "@/components/admin/ManageUsers";
import { CommunitySync } from "@/components/admin/CommunitySync";
import { ApiCredentials } from "@/components/admin/ApiCredentials";
import { GamificationManager } from "@/components/admin/GamificationManager";
import { ManageCommunityMembers } from "@/components/admin/ManageCommunityMembers";
import ManageCommunityLeaders from "@/components/admin/ManageCommunityLeaders";
import ManageNetworking from "@/components/admin/ManageNetworking";
import ManageEventSources from "@/components/admin/ManageEventSources";

const AdminDashboard = () => {
  const { user, isAdmin, isCoordinator, loading } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useStats();
  const { data: communities } = useCommunities();
  const { data: events } = useEvents();
  const { data: alliances } = useAlliances();
  const { data: calls } = useCalls();
  const { data: pendingData } = usePendingApprovals();
  const [selectedSection, setSelectedSection] = useState("communities");
  const [approvalsTab, setApprovalsTab] = useState<"communities" | "alliances">("communities");

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

  useEffect(() => {
    if (pendingData) {
      const totalPending = (pendingData.communities?.length || 0) +
        (pendingData.alliances?.length || 0) +
        (pendingData.events?.length || 0) +
        (pendingData.calls?.length || 0) +
        (pendingData.blogPosts?.length || 0);

      // Si hay pendientes, mostrar automáticamente la sección de Aprobaciones
      if (totalPending > 0) {
        setSelectedSection("approvals");
      }

      // Dentro de Aprobaciones, priorizar Alianzas si hay
      if ((pendingData.alliances?.length || 0) > 0) {
        setApprovalsTab("alliances");
      } else if ((pendingData.communities?.length || 0) > 0) {
        setApprovalsTab("communities");
      }
    }
  }, [pendingData]);

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
        <div className="space-y-6">
          {/* Section Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Mobile Menu - Select dropdown */}
            <div className="w-full sm:hidden">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50">
                  <SelectItem value="communities">Comunidades</SelectItem>
                  <SelectItem value="community-data">Info Comunidades</SelectItem>
                  <SelectItem value="approvals" className="relative">
                    <div className="flex items-center justify-between w-full">
                      <span>Aprobaciones</span>
                      {(((pendingData?.communities?.length || 0) + (pendingData?.alliances?.length || 0)) > 0) && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {(pendingData?.communities?.length || 0) + (pendingData?.alliances?.length || 0)}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="content-approvals" className="relative">
                    <div className="flex items-center justify-between w-full">
                      <span>Aprobaciones Contenido</span>
                      {pendingData && (pendingData.events?.length + pendingData.calls?.length + pendingData.blogPosts?.length + pendingData.alliances?.length) > 0 && (
                        <span className="ml-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {(pendingData.events?.length || 0) + (pendingData.calls?.length || 0) + (pendingData.blogPosts?.length || 0) + (pendingData.alliances?.length || 0)}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="events">Eventos</SelectItem>
                  <SelectItem value="registrations">Registros</SelectItem>
                  <SelectItem value="members">Miembros</SelectItem>
                  <SelectItem value="leaders">Líderes</SelectItem>
                  <SelectItem value="users">Usuarios</SelectItem>
                  <SelectItem value="alliances">Alianzas</SelectItem>
                  <SelectItem value="calls">Convocatorias</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="event-sources">Fuentes Externas</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="gamification">Gamificación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Menu - Tabs */}
            <div className="hidden sm:block w-full">
              <Tabs value={selectedSection} onValueChange={setSelectedSection}>
                <TabsList className="grid grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 w-full h-auto p-1 gap-1">
                  <TabsTrigger value="communities" className="flex items-center gap-1 text-xs px-2 py-2">
                    <Users className="h-3 w-3" />
                    <span className="hidden lg:inline">Comunidades</span>
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-1 text-xs px-2 py-2">
                    <Calendar className="h-3 w-3" />
                    <span className="hidden lg:inline">Eventos</span>
                  </TabsTrigger>
                  <TabsTrigger value="alliances" className="flex items-center gap-1 text-xs px-2 py-2">
                    <Building className="h-3 w-3" />
                    <span className="hidden lg:inline">Alianzas</span>
                  </TabsTrigger>
                  <TabsTrigger value="approvals" className="flex items-center gap-1 text-xs px-2 py-2 relative">
                    <Settings className="h-3 w-3" />
                    <span className="hidden lg:inline">Aprobaciones</span>
                    {(((pendingData?.communities?.length || 0) + (pendingData?.alliances?.length || 0)) > 0) && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {(pendingData?.communities?.length || 0) + (pendingData?.alliances?.length || 0)}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="content-approvals" className="flex items-center gap-1 text-xs px-2 py-2 relative">
                    <FileText className="h-3 w-3" />
                    <span className="hidden lg:inline">Contenido</span>
                    {pendingData && (pendingData.events?.length + pendingData.calls?.length + pendingData.blogPosts?.length + pendingData.alliances?.length) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {(pendingData.events?.length || 0) + (pendingData.calls?.length || 0) + (pendingData.blogPosts?.length || 0) + (pendingData.alliances?.length || 0)}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-1 text-xs px-2 py-2 hidden xl:flex">
                    <Users className="h-3 w-3" />
                    <span className="hidden lg:inline">Usuarios</span>
                  </TabsTrigger>
                  <TabsTrigger value="networking" className="flex items-center gap-1 text-xs px-2 py-2 hidden xl:flex">
                    <Briefcase className="h-3 w-3" />
                    <span className="hidden lg:inline">Networking</span>
                  </TabsTrigger>
                  <TabsTrigger value="gamification" className="flex items-center gap-1 text-xs px-2 py-2 hidden xl:flex">
                    <Trophy className="h-3 w-3" />
                    <span className="hidden lg:inline">Gamificación</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Secondary navigation for less common sections */}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  variant={selectedSection === "community-data" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection("community-data")}
                  className="h-8 text-xs"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Info Comunidades
                </Button>
                <Button
                  variant={selectedSection === "registrations" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection("registrations")}
                  className="h-8 text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Registros
                </Button>
                <Button
                  variant={selectedSection === "members" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection("members")}
                  className="h-8 text-xs"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Miembros
                </Button>
                <Button
                  variant={selectedSection === "leaders" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection("leaders")}
                  className="h-8 text-xs"
                >
                  <Award className="h-3 w-3 mr-1" />
                  Líderes
                </Button>
                <Button
                  variant={selectedSection === "calls" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection("calls")}
                  className="h-8 text-xs"
                >
                  <Megaphone className="h-3 w-3 mr-1" />
                  Convocatorias
                </Button>
                <Button
                  variant={selectedSection === "blog" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection("blog")}
                  className="h-8 text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Blog
                </Button>
                <Button
                  variant={selectedSection === "event-sources" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection("event-sources")}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Fuentes Externas
                </Button>
                <div className="xl:hidden flex gap-2">
                  <Button
                    variant={selectedSection === "users" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection("users")}
                    className="h-8 text-xs"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Usuarios
                  </Button>
                  <Button
                    variant={selectedSection === "networking" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection("networking")}
                    className="h-8 text-xs"
                  >
                    <Briefcase className="h-3 w-3 mr-1" />
                    Networking
                  </Button>
                  <Button
                    variant={selectedSection === "gamification" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection("gamification")}
                    className="h-8 text-xs"
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    Gamificación
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          {selectedSection === "communities" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestión de Comunidades</h2>
                <AddCommunityDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Comunidad
                  </Button>
                </AddCommunityDialog>
              </div>
              <ManageCommunities />
            </div>
          )}

          {selectedSection === "community-data" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ManageCommunityData />
                <CommunitySync />
                <ApiCredentials />
              </div>
            </div>
          )}

          {selectedSection === "approvals" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Gestión de Aprobaciones</h2>
                <p className="text-muted-foreground">
                  Revisa y aprueba las solicitudes pendientes organizadas por tipo
                </p>
              </div>

              <Tabs value={approvalsTab} onValueChange={(v) => setApprovalsTab(v as any)} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="communities" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Comunidades
                      {((pendingData?.communities?.length || 0) > 0) && (
                        <Badge variant="destructive" className="ml-2">
                          {pendingData?.communities?.length || 0}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="alliances" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Alianzas
                      {((pendingData?.alliances?.length || 0) > 0) && (
                        <Badge variant="destructive" className="ml-2">
                          {pendingData?.alliances?.length || 0}
                        </Badge>
                      )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="communities">
                  <ManagePendingApprovals 
                    pendingCommunities={pendingData?.communities || []}
                    pendingAlliances={[]}
                    showOnlyType="communities"
                  />
                </TabsContent>

                <TabsContent value="alliances">
                  <ManagePendingApprovals 
                    pendingCommunities={[]}
                    pendingAlliances={pendingData?.alliances || []}
                    showOnlyType="alliances"
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {selectedSection === "content-approvals" && (
            <div className="space-y-6">
              <ManageContentApprovals 
                pendingEvents={pendingData?.events || []}
                pendingAlliances={pendingData?.alliances || []}
                pendingCalls={pendingData?.calls || []}
                pendingBlogPosts={pendingData?.blogPosts || []}
              />
            </div>
          )}

          {selectedSection === "events" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestión de Eventos</h2>
                <AddEventDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Evento
                  </Button>
                </AddEventDialog>
              </div>
              <ManageEvents />
            </div>
          )}

          {selectedSection === "registrations" && (
            <div className="space-y-6">
              <ManageEventRegistrations />
            </div>
          )}

          {selectedSection === "members" && (
            <div className="space-y-6">
              <ManageCommunityMembers />
            </div>
          )}

          {selectedSection === "leaders" && (
            <div className="space-y-6">
              <ManageCommunityLeaders />
            </div>
          )}

          {selectedSection === "users" && (
            <div className="space-y-6">
              <ManageUsers />
            </div>
          )}

          {selectedSection === "alliances" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Gestión de Alianzas</h2>
                  <p className="text-muted-foreground">
                    Administra alianzas y colaboradores
                  </p>
                </div>
                {isAdmin && (
                  <AddAllianceDialog>
                    <Button variant="hero">
                      <Building className="mr-2 h-4 w-4" />
                      Nueva Alianza
                    </Button>
                  </AddAllianceDialog>
                )}
              </div>
              <ManageAlliances />
            </div>
          )}

          {selectedSection === "calls" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestión de Convocatorias</h2>
                <AddCallDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Convocatoria
                  </Button>
                </AddCallDialog>
              </div>
              <ManageCalls />
            </div>
          )}

          {selectedSection === "blog" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Gestión del Blog</h2>
                  <p className="text-muted-foreground">
                    Administra publicaciones y contenido
                  </p>
                </div>
                <AddBlogPostDialog>
                  <Button variant="hero">
                    <FileText className="mr-2 h-4 w-4" />
                    Nueva Publicación
                  </Button>
                </AddBlogPostDialog>
              </div>
              <ManageBlogPosts />
            </div>
          )}

          {selectedSection === "event-sources" && (
            <div className="space-y-6">
              <ManageEventSources />
            </div>
          )}

          {selectedSection === "networking" && (
            <div className="space-y-6">
              <ManageNetworking />
            </div>
          )}

          {selectedSection === "gamification" && (
            <div className="space-y-6">
              <GamificationManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;