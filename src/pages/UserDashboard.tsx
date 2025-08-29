import { useAuth } from "@/contexts/AuthContext";
import { useUserCommunities, useUserEventRegistrations } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Calendar, MapPin, Users, Globe, BookOpen, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userCommunities, isLoading: communitiesLoading } = useUserCommunities(user?.id);
  const { data: userEvents, isLoading: eventsLoading } = useUserEventRegistrations(user?.email);

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mis Comunidades */}
          <div>
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
              <div className="space-y-4">
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
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/#comunidades")}>
                    Explorar Comunidades
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Mis Eventos */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-6 w-6" />
              Mis Eventos
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
            ) : userEvents && userEvents.length > 0 ? (
              <div className="space-y-4">
                {userEvents.map((registration: any) => {
                  const event = registration.events;
                  const isUpcoming = new Date(event.event_date) > new Date();
                  
                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
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
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No te has registrado a ningún evento aún.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/#eventos")}>
                    Explorar Eventos
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;