import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ExternalLink, Download, Smartphone } from "lucide-react";
import { useEvents } from "@/hooks/useSupabaseData";
import { EventRegistrationDialog } from "@/components/EventRegistrationDialog";
import { SocialShare } from "@/components/ui/social-share";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

const CALENDAR_FEED_URL = "https://itlyiyknweernejmpibd.supabase.co/functions/v1/calendar-feed";

const EventsSection = () => {
  const { data: events, isLoading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast: toastUI } = useToast();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents = events?.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate >= today;
  }) || [];
  
  const pastEvents = events?.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate < today;
  }).slice(0, 3) || [];

  const handleRegister = (event: any) => {
    if (!user) {
      toastUI({
        title: "Inicia sesión requerido",
        description: "Para registrarte a un evento, primero debes crear una cuenta o iniciar sesión.",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth?tab=signup")}>
            Ir a registro
          </Button>
        ),
      });
      return;
    }
    
    setSelectedEvent(event);
    setIsRegistrationOpen(true);
  };

  const handleDownloadICS = () => {
    window.open(CALENDAR_FEED_URL, "_blank");
    toast.success("Descargando calendario...");
  };

  const handleSubscribe = () => {
    window.location.href = CALENDAR_FEED_URL.replace("https://", "webcal://");
    toast.success("Abriendo suscripción al calendario...");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "virtual": return "bg-blue-100 text-blue-800";
      case "presencial": return "bg-green-100 text-green-800";
      case "híbrido": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <section id="eventos" className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="eventos" className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Eventos y{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Calendario
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Participa en eventos, talleres y actividades. Sincroniza el calendario con tu dispositivo para no perderte nada.
          </p>
        </div>

        {/* Subscribe Card */}
        <Card className="mb-10 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Sincroniza con tu Calendario</h3>
                  <p className="text-sm text-muted-foreground">
                    Recibe los eventos automáticamente en iPhone, Android o PC
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSubscribe} size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Suscribirse
                </Button>
                <Button variant="outline" onClick={handleDownloadICS} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar .ics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Próximos Eventos
          </h3>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 6).map((event) => (
                <Card key={event.id} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                       <Badge className={getTypeColor(event.event_type)}>
                         {event.event_type}
                       </Badge>
                      {event.registration_url && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={() => window.open(event.registration_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      {event.event_time && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{event.event_time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{event.current_attendees || 0}/{event.max_attendees || '∞'} participantes</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleRegister(event)}
                      >
                        Registrarse
                      </Button>
                      <SocialShare 
                        url={window.location.origin}
                        title={`${event.title} - ${formatDate(event.event_date)}`}
                        description={event.description}
                        hashtags={['evento', 'comunidad', event.category]}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium">No hay eventos próximos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vuelve pronto para ver nuevos eventos
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Clock className="h-6 w-6 text-muted-foreground" />
              Eventos Pasados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                       <Badge variant="secondary">
                         {event.event_type}
                       </Badge>
                      <Badge variant="outline" className="text-xs">
                        Finalizado
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.current_attendees || 0} participantes</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver evidencia
                      </Button>
                      <SocialShare 
                        url={window.location.origin}
                        title={`${event.title} - Evento finalizado`}
                        description={event.description}
                        hashtags={['evento', 'comunidad', 'finalizado']}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="community" 
            size="lg"
            onClick={() => navigate("/calendario")}
            className="group"
          >
            Ver calendario completo
            <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>

      <EventRegistrationDialog
        event={selectedEvent}
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
      />
    </section>
  );
};

export default EventsSection;