import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  ArrowLeft,
  Plus,
  BarChart3,
  Network,
  Link2,
  Sparkles,
  Heart
} from "lucide-react";
import { useMyEvents, useLeaderSourceEvents, useLeaderEventInterests, useCommunityMembers } from "@/hooks/useSupabaseData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import AddEventDialog from "@/components/admin/AddEventDialog";
import ManageMyEvents from "@/components/admin/ManageMyEvents";
import ManageMyEventSources from "@/components/admin/ManageMyEventSources";

import EventDateRecommender from "@/components/admin/EventDateRecommender";
import SEOHead from "@/components/SEOHead";

const CommunityLeaderDashboard = () => {
  const { user, isCommunityLeader, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState("events");
  const [myCommunity, setMyCommunity] = useState<any>(null);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  
  const { data: myEvents } = useMyEvents(user?.id, myCommunity?.id);
  const { data: leaderSourceEvents } = useLeaderSourceEvents(user?.id);
  const { data: leaderInterests } = useLeaderEventInterests(user?.id);
  const { data: communityMembers } = useCommunityMembers(myCommunity?.id);

  // Habilitar actualizaciones en tiempo real
  useRealtimeUpdates();

  // Fetch community data for this leader
  useEffect(() => {
    const fetchMyCommunity = async () => {
      if (!user) return;

      try {
        const { data: leader, error } = await supabase
          .from('community_leaders')
          .select('community_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error('Error fetching community leader record:', error);
          return;
        }

        if (leader?.community_id) {
          const { data: community, error: commError } = await supabase
            .from('communities')
            .select('*')
            .eq('id', leader.community_id)
            .maybeSingle();
          if (!commError) setMyCommunity(community);
        }

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingCommunity(false);
      }
    };

    if (user && isCommunityLeader) {
      fetchMyCommunity();
    }
  }, [user, isCommunityLeader]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (!loading && user && !isCommunityLeader) {
      navigate("/");
    }
  }, [user, isCommunityLeader, loading, navigate]);

  if (loading || loadingCommunity) {
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

  const statsCards = [
    {
      title: "Mi Comunidad",
      value: myCommunity?.name || "No asignada",
      icon: Users,
      description: `${myCommunity?.members_count || 0} miembros`,
      color: "text-purple-600"
    },
    {
      title: "Eventos de la Comunidad",
      value: myEvents?.length || 0,
      icon: Calendar,
      description: "Eventos gestionados",
      color: "text-blue-600"
    },
    {
      title: "Eventos de Fuentes Externas",
      value: leaderSourceEvents?.length || 0,
      icon: Link2,
      description: "De fuentes asignadas",
      color: "text-green-600"
    },
    {
      title: "Intereses Totales",
      value: leaderInterests?.length || 0,
      icon: Heart,
      description: "Intereses en eventos externos",
      color: "text-red-600"
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
                Dashboard de Líder - {myCommunity?.name || 'Comunidad'}
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
          {/* Mobile - Select dropdown */}
          <div className="sm:hidden w-full">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="events">Mis Eventos</SelectItem>
                <SelectItem value="community-interests">Interesados en la Comunidad</SelectItem>
                <SelectItem value="ai-recommender">Recomendador IA</SelectItem>
                <SelectItem value="sources">Fuentes Externas</SelectItem>
                <SelectItem value="interests">Intereses en Eventos</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop - Tabs */}
          <div className="hidden sm:block w-full">
            <Tabs value={selectedSection} onValueChange={setSelectedSection}>
              <TabsList className="w-full justify-start h-auto p-1 gap-1 flex-wrap">
                <TabsTrigger value="events" className="flex items-center gap-2 px-4 py-2">
                  <Calendar className="h-4 w-4" />
                  Mis Eventos
                </TabsTrigger>
                <TabsTrigger value="community-interests" className="flex items-center gap-2 px-4 py-2">
                  <Users className="h-4 w-4" />
                  Interesados
                </TabsTrigger>
                <TabsTrigger value="ai-recommender" className="flex items-center gap-2 px-4 py-2">
                  <Sparkles className="h-4 w-4" />
                  Recomendador IA
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex items-center gap-2 px-4 py-2">
                  <Link2 className="h-4 w-4" />
                  Fuentes Externas
                </TabsTrigger>
                <TabsTrigger value="interests" className="flex items-center gap-2 px-4 py-2">
                  <Heart className="h-4 w-4" />
                  Intereses
                </TabsTrigger>
                <TabsTrigger value="networking" className="flex items-center gap-2 px-4 py-2">
                  <Network className="h-4 w-4" />
                  Networking
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
              <ManageMyEvents communityId={myCommunity?.id} />
            </div>
          )}

          {selectedSection === "community-interests" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Personas interesadas en la comunidad
                </h2>
                <Badge variant="secondary">{communityMembers?.length || 0} interesados</Badge>
              </div>
              {communityMembers && communityMembers.length > 0 ? (
                <div className="grid gap-4">
                  {communityMembers.map((member: any) => (
                    <Card key={member.id}>
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                          {(member.full_name || member.nickname || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{member.full_name || member.nickname}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {member.email && <span>{member.email}</span>}
                            {member.phone && <span>{member.phone}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{member.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(member.joined_at).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">
                      Aún no hay personas interesadas en tu comunidad
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {selectedSection === "ai-recommender" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  Recomendador de Fechas con IA
                </h2>
              </div>
              <EventDateRecommender />
            </div>
          )}

          {selectedSection === "sources" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Link2 className="h-6 w-6" />
                  Fuentes de Eventos Externos
                </h2>
              </div>
              <ManageMyEventSources communityId={myCommunity?.id} />
            </div>
          )}

          {selectedSection === "interests" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  Intereses en Eventos de Fuentes Externas
                </h2>
              </div>
              {leaderInterests && leaderInterests.length > 0 ? (
                <div className="grid gap-4">
                  {leaderInterests.map((interest: any) => (
                    <Card key={interest.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {interest.events?.title}
                          </CardTitle>
                          <Badge variant="outline">
                            {new Date(interest.created_at).toLocaleDateString('es-MX')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {(interest.profiles?.display_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{interest.profiles?.display_name || 'Usuario anónimo'}</p>
                            <p className="text-sm text-muted-foreground">
                              Mostró interés el {new Date(interest.created_at).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                        </div>
                        {interest.events?.event_date && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground">
                              Evento: {new Date(interest.events.event_date).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">
                      No hay intereses registrados para eventos de tus fuentes externas
                    </p>
                  </CardContent>
                </Card>
              )}
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