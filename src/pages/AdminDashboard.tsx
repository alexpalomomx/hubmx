import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import ManageNetworking from "@/components/admin/ManageNetworking";

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
        <div className="space-y-6">
          {/* Section Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-auto">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-full sm:w-[280px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50">
                  <SelectItem value="communities">Comunidades</SelectItem>
                  <SelectItem value="community-data">Info Comunidades</SelectItem>
                  <SelectItem value="approvals" className="relative">
                    <div className="flex items-center justify-between w-full">
                      <span>Aprobaciones Comunidades</span>
                      {pendingData && (pendingData.communities.length + pendingData.alliances.length) > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {pendingData.communities.length + pendingData.alliances.length}
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
                  <SelectItem value="users">Usuarios</SelectItem>
                  <SelectItem value="alliances">Alianzas</SelectItem>
                  <SelectItem value="calls">Convocatorias</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="gamification">Gamificación</SelectItem>
                </SelectContent>
              </Select>
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
              <ManagePendingApprovals 
                pendingCommunities={pendingData?.communities || []}
                pendingAlliances={pendingData?.alliances || []}
              />
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