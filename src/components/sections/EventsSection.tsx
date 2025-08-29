import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { useEvents } from "@/hooks/useSupabaseData";
import { EventRegistrationDialog } from "@/components/EventRegistrationDialog";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const EventsSection = () => {
  const { data: events, isLoading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const upcomingEvents = events?.filter(event => event.status === "upcoming") || [];
  const pastEvents = events?.filter(event => event.status === "past") || [];

  const handleRegister = (event: any) => {
    if (!user) {
      toast({
        title: "Inicia sesión requerido",
        description: "Para registrarte a un evento, primero debes crear una cuenta o iniciar sesión para que tu información se guarde automáticamente.",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            Ir a registro
          </Button>
        ),
      });
      return;
    }
    
    setSelectedEvent(event);
    setIsRegistrationOpen(true);
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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "virtual": return "bg-blue-100 text-blue-800";
      case "presencial": return "bg-green-100 text-green-800";
      case "híbrido": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section id="eventos" className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Eventos y{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Actividades
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Participa en eventos, talleres y actividades que conectan a las comunidades 
            y potencian el aprendizaje colaborativo.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Próximos Eventos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                     <Badge className={getTypeColor(event.event_type)}>
                       {event.event_type}
                     </Badge>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
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

                  <Button 
                    variant="hero" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleRegister(event)}
                  >
                    Registrarse
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div>
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

                  <Button variant="outline" size="sm" className="w-full">
                    Ver evidencia
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="community" size="lg">
            Ver calendario completo
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