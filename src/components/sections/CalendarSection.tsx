import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Smartphone, MapPin, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CALENDAR_FEED_URL = "https://itlyiyknweernejmpibd.supabase.co/functions/v1/calendar-feed";

const CalendarSection = () => {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ["landing-calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, organizer:organizer_id(name)")
        .eq("approval_status", "approved")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const handleDownloadICS = () => {
    window.open(CALENDAR_FEED_URL, "_blank");
    toast.success("Descargando calendario...");
  };

  const handleSubscribe = () => {
    window.location.href = CALENDAR_FEED_URL.replace("https://", "webcal://");
    toast.success("Abriendo suscripción al calendario...");
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "virtual": return "bg-blue-500";
      case "presencial": return "bg-green-500";
      case "hibrido": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "virtual": return "Virtual";
      case "presencial": return "Presencial";
      case "hibrido": return "Híbrido";
      default: return type;
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1">
            <Calendar className="h-3 w-3 mr-2" />
            Calendario Compartido
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Próximos Eventos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mantente al día con todos los eventos de la comunidad. Sincroniza el calendario con tu dispositivo para no perderte nada.
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

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <Badge className={`${getEventTypeColor(event.event_type)} text-white shrink-0 ml-2 text-xs`}>
                      {getEventTypeLabel(event.event_type)}
                    </Badge>
                  </div>
                  {event.organizer?.name && (
                    <CardDescription className="text-xs">Por {event.organizer.name}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">
                      {format(new Date(event.event_date), "EEE, d MMM", { locale: es })}
                    </span>
                    {event.event_time && (
                      <>
                        <Clock className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                        <span className="text-muted-foreground">{event.event_time.slice(0, 5)}</span>
                      </>
                    )}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
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

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate("/calendario")}
            className="group"
          >
            Ver Calendario Completo
            <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CalendarSection;
