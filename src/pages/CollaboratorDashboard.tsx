import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Building, 
  Megaphone, 
  FileText, 
  ArrowLeft,
  Plus,
  Clock
} from "lucide-react";
import { useEvents, useAlliances, useCalls, useBlogPosts } from "@/hooks/useSupabaseData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import AddEventDialog from "@/components/admin/AddEventDialog";
import AddAllianceDialog from "@/components/admin/AddAllianceDialog";
import AddCallDialog from "@/components/admin/AddCallDialog";
import AddBlogPostDialog from "@/components/admin/AddBlogPostDialog";
import ManageEvents from "@/components/admin/ManageEvents";
import ManageAlliances from "@/components/admin/ManageAlliances";
import ManageCalls from "@/components/admin/ManageCalls";
import ManageBlogPosts from "@/components/admin/ManageBlogPosts";

const CollaboratorDashboard = () => {
  const { user, isCollaborator, loading } = useAuth();
  const navigate = useNavigate();
  const { data: events } = useEvents();
  const { data: alliances } = useAlliances();
  const { data: calls } = useCalls();
  const { data: blogPosts } = useBlogPosts();
  const [selectedSection, setSelectedSection] = useState("events");

  // Habilitar actualizaciones en tiempo real
  useRealtimeUpdates();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (!loading && user && !isCollaborator) {
      navigate("/");
    }
  }, [user, isCollaborator, loading, navigate]);

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

  if (!user || !isCollaborator) {
    return null;
  }

  // Filter content submitted by this collaborator
  const myEvents = events?.filter(event => event.submitted_by === user.id) || [];
  const myAlliances = alliances?.filter(alliance => alliance.submitted_by === user.id) || [];
  const myCalls = calls?.filter(call => call.submitted_by === user.id) || [];
  const myBlogPosts = blogPosts?.filter(post => post.submitted_by === user.id) || [];

  // Count pending submissions
  const pendingCount = [
    ...myEvents.filter(e => e.approval_status === 'pending'),
    ...myAlliances.filter(a => a.approval_status === 'pending'),
    ...myCalls.filter(c => c.approval_status === 'pending'),
    ...myBlogPosts.filter(p => p.approval_status === 'pending')
  ].length;

  const statsCards = [
    {
      title: "Eventos",
      value: myEvents.length,
      icon: Calendar,
      description: "Eventos creados",
      color: "text-blue-600"
    },
    {
      title: "Alianzas",
      value: myAlliances.length,
      icon: Building,
      description: "Alianzas propuestas",
      color: "text-purple-600"
    },
    {
      title: "Convocatorias",
      value: myCalls.length,
      icon: Megaphone,
      description: "Convocatorias creadas",
      color: "text-green-600"
    },
    {
      title: "Pendientes",
      value: pendingCount,
      icon: Clock,
      description: "Esperando aprobación",
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
                Dashboard de Colaborador
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Colaborador
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

        {/* Info Message */}
        <Card className="mb-8 border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-muted-foreground">
                <strong>Importante:</strong> Todo el contenido que crees debe ser aprobado por un administrador antes de ser publicado.
              </p>
            </div>
          </CardContent>
        </Card>

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
                  <SelectItem value="events">Eventos</SelectItem>
                  <SelectItem value="alliances">Alianzas</SelectItem>
                  <SelectItem value="calls">Convocatorias</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Sections */}
          {selectedSection === "events" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Eventos</h2>
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

          {selectedSection === "alliances" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Alianzas</h2>
                <AddAllianceDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Alianza
                  </Button>
                </AddAllianceDialog>
              </div>
              <ManageAlliances />
            </div>
          )}

          {selectedSection === "calls" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Convocatorias</h2>
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Publicaciones</h2>
                <AddBlogPostDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Publicación
                  </Button>
                </AddBlogPostDialog>
              </div>
              <ManageBlogPosts />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaboratorDashboard;