import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  ArrowLeft,
  Plus,
  BarChart3,
  Network
} from "lucide-react";
import { useEvents, useEventRegistrations } from "@/hooks/useSupabaseData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import AddEventDialog from "@/components/admin/AddEventDialog";
import ManageEvents from "@/components/admin/ManageEvents";
import { ManageEventRegistrations } from "@/components/admin/ManageEventRegistrations";

const CommunityLeaderDashboard = () => {
  const { user, isCommunityLeader, loading } = useAuth();
  const navigate = useNavigate();
  const { data: events } = useEvents();
  const { data: registrations } = useEventRegistrations();
  const [selectedSection, setSelectedSection] = useState("events");

  // Habilitar actualizaciones en tiempo real
  useRealtimeUpdates();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (!loading && user && !isCommunityLeader) {
      navigate("/");
    }
  }, [user, isCommunityLeader, loading, navigate]);

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

  if (!user || !isCommunityLeader) {
    return null;
  }

  // Filter events for this community leader (placeholder logic - should be filtered by community)
  const myEvents = events?.filter(event => 
    event.created_by === user.id || event.submitted_by === user.id
  ) || [];

  const myRegistrations = registrations?.filter(reg => 
    myEvents.some(event => event.id === reg.event_id)
  ) || [];

  const statsCards = [
    {
      title: "Mis Eventos",
      value: myEvents.length,
      icon: Calendar,
      description: "Eventos creados",
      color: "text-blue-600"
    },
    {
      title: "Registros",
      value: myRegistrations.length,
      icon: Users,
      description: "Total de registros",
      color: "text-green-600"
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
                Dashboard de Líder
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Líder de Comunidad
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  <SelectItem value="events">Mis Eventos</SelectItem>
                  <SelectItem value="registrations">Registros</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Sections */}
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Registros a Eventos</h2>
              </div>
              <ManageEventRegistrations />
            </div>
          )}

          {selectedSection === "networking" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Network className="h-6 w-6" />
                  Networking de la Comunidad
                </h2>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Networking de la Comunidad</CardTitle>
                  <CardDescription>
                    Gestiona las conexiones y actividad de networking en tu comunidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-muted-foreground">Conexiones activas</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-muted-foreground">Mentorías en curso</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-muted-foreground">Eventos de networking</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-6 text-center">
                    <Button onClick={() => navigate("/networking")}>
                      Ver Dashboard de Networking Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityLeaderDashboard;