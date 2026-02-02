import { useAuth } from "@/contexts/AuthContext";
import { useUserCommunities, useEventInterests } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Calendar, MapPin, Users, Globe, BookOpen, ArrowLeft, Network, MessageSquare, UserPlus, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useUserConnections, useConnectionRequests, useMentorshipRequests } from "@/hooks/useNetworkingData";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { MessagingInterface } from "@/components/messaging/MessagingInterface";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { NetworkingSuggestions } from "@/components/networking/NetworkingSuggestions";
import { NetworkingAnalyticsDashboard } from "@/components/networking/NetworkingAnalyticsDashboard";
import { useState } from "react";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("communities");
  const { data: userCommunities, isLoading: communitiesLoading } = useUserCommunities(user?.id);
  const { data: userEventInterests, isLoading: eventsLoading } = useEventInterests(user?.id);
  
  // Networking data
  const { data: connections } = useUserConnections();
  const { data: connectionRequests } = useConnectionRequests();
  const { data: mentorshipRequests } = useMentorshipRequests();
  const { data: unreadNotifications } = useUnreadNotificationCount();

  const acceptedConnections = connections?.filter(conn => conn.status === "accepted") || [];
  const pendingRequests = connectionRequests?.filter(req => req.status === "pending") || [];
  const pendingMentorships = mentorshipRequests?.filter(req => req.status === "pending") || [];

  if (!user) {
    navigate("/auth");
    return null;
  }

  const getCommunityIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tecnología':
        return '💻';
      case 'educación':
        return '📚';
      case 'salud':
        return '🏥';
      case 'ambiente':
        return '🌱';
      case 'arte':
        return '🎨';
      case 'emprendimiento':
        return '🚀';
      default:
        return '👥';
    }
  };

  const getCommunityColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'tecnología':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'educación':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'salud':
        return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'ambiente':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
      case 'arte':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'emprendimiento':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'presencial':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'virtual':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'híbrido':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate("/")}> 
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver al inicio
            </Button>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">Mi Dashboard</h1>
            <div></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            Bienvenido, {user.email?.split('@')[0]}. Aquí puedes ver tus comunidades y eventos.
          </p>
        </div>

        {/* Networking Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/networking")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Network className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{acceptedConnections.length}</p>
                  <p className="text-sm text-muted-foreground">Conexiones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Mensajes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserPlus className="h-8 w-8 text-orange-500" />
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  {pendingRequests.length > 0 && (
                    <Badge variant="destructive" className="h-5 px-2 text-xs">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Solicitudes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingMentorships.length}</p>
                  <p className="text-sm text-muted-foreground">Mentorías</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="w-[200px] bg-background border border-border shadow-sm z-50">
              <SelectValue placeholder="Seleccionar sección" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-50">
              <SelectItem value="communities">Comunidades</SelectItem>
              <SelectItem value="events">Eventos</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="messages">Mensajes</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          {activeSection === "communities" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Users className="mr-2 h-6 w-6" />
                Mis Comunidades
              </h2>
              
              {communitiesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userCommunities && userCommunities.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {userCommunities.map((membership: any) => {
                    const community = membership.communities;
                    return (
                      <Card key={community.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              {community.logo_url ? (
                                <img
                                  src={community.logo_url}
                                  alt={community.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                                  {getCommunityIcon(community.category)}
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-lg">{community.name}</CardTitle>
                                <Badge className={getCommunityColor(community.category)}>
                                  {community.category}
                                </Badge>
                              </div>
                            </div>
                            {community.website_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={community.website_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-3">{community.description}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              {community.members_count} miembros
                            </span>
                            <span>
                              Unido el {format(new Date(membership.joined_at), "dd 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No te has unido a ninguna comunidad aún.</p>
                    <div className="flex gap-4 justify-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/networking")}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Explorar Networking
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/#comunidades")}>
                        Explorar Comunidades
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeSection === "events" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Calendar className="mr-2 h-6 w-6" />
                Eventos que me interesan
              </h2>
              
              {eventsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userEventInterests && userEventInterests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {userEventInterests.map((interest: any) => {
                    const event = interest.events;
                    if (!event) return null;
                    const isUpcoming = new Date(event.event_date) > new Date();
                    
                    return (
                      <Card key={interest.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getEventTypeColor(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                                <Badge variant={isUpcoming ? "default" : "secondary"}>
                                  {isUpcoming ? "Próximo" : "Finalizado"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-3">{event.description}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="mr-2 h-4 w-4" />
                              {format(new Date(event.event_date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                              {event.event_time && ` - ${event.event_time}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                            <div className="flex items-center text-muted-foreground">
                              <Users className="mr-2 h-4 w-4" />
                              {event.current_attendees} participantes
                              {event.max_attendees && ` de ${event.max_attendees}`}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 border-t pt-2">
                            Interesado desde: {format(new Date(interest.created_at), "dd 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No has mostrado interés en ningún evento aún.</p>
                    <div className="flex gap-4 justify-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/networking")}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Explorar Networking
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/#eventos")}>
                        Explorar Eventos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeSection === "networking" && (
            <div>
              <NetworkingSuggestions />
            </div>
          )}

          {activeSection === "messages" && (
            <div>
              <MessagingInterface />
            </div>
          )}

          {activeSection === "analytics" && (
            <div>
              <NetworkingAnalyticsDashboard userId={user?.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;