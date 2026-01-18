import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Smartphone, Share2, ArrowLeft, MapPin, Clock, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CALENDAR_FEED_URL = "https://itlyiyknweernejmpibd.supabase.co/functions/v1/calendar-feed";

const PublicCalendar = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("all");

  const { data: events, isLoading } = useQuery({
    queryKey: ["public-events", selectedCategory, selectedEventType, selectedLocation, selectedTimeOfDay],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*, organizer:organizer_id(name)")
        .eq("approval_status", "approved")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true });

      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (selectedEventType && selectedEventType !== "all") {
        query = query.eq("event_type", selectedEventType);
      }

      if (selectedLocation && selectedLocation !== "all") {
        query = query.ilike("location", `%${selectedLocation}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by time of day on client side
      if (selectedTimeOfDay && selectedTimeOfDay !== "all" && data) {
        return data.filter(event => {
          if (!event.event_time) return selectedTimeOfDay === "all";
          const hour = parseInt(event.event_time.split(":")[0], 10);
          if (selectedTimeOfDay === "morning") return hour >= 6 && hour < 12;
          if (selectedTimeOfDay === "afternoon") return hour >= 12 && hour < 18;
          if (selectedTimeOfDay === "evening") return hour >= 18 && hour < 22;
          if (selectedTimeOfDay === "night") return hour >= 22 || hour < 6;
          return true;
        });
      }
      
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["event-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("category")
        .eq("approval_status", "approved")
        .not("category", "is", null);

      if (error) throw error;
      const uniqueCategories = [...new Set(data?.map(e => e.category).filter(Boolean))];
      return uniqueCategories as string[];
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["event-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("location")
        .eq("approval_status", "approved")
        .not("location", "is", null);

      if (error) throw error;
      const uniqueLocations = [...new Set(data?.map(e => e.location).filter(Boolean))];
      return uniqueLocations as string[];
    },
  });

  const getCalendarUrl = (protocol: "https" | "webcal" = "https") => {
    const baseUrl = protocol === "webcal" 
      ? CALENDAR_FEED_URL.replace("https://", "webcal://")
      : CALENDAR_FEED_URL;
    
    if (selectedCategory && selectedCategory !== "all") {
      return `${baseUrl}?category=${encodeURIComponent(selectedCategory)}`;
    }
    return baseUrl;
  };

  const handleDownloadICS = () => {
    window.open(getCalendarUrl("https"), "_blank");
    toast.success("Descargando calendario...");
  };

  const handleSubscribe = () => {
    window.location.href = getCalendarUrl("webcal");
    toast.success("Abriendo suscripción al calendario...");
  };

  const handleShare = async () => {
    const shareData = {
      title: "Calendario de Eventos - Hub de Comunidades",
      text: "Suscríbete al calendario de eventos del Hub de Comunidades",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
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
                <span className="hidden sm:inline">Volver</span>
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent flex items-center gap-2">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Calendario de Eventos
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscribe Section */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Sincroniza con tu Calendario
            </CardTitle>
            <CardDescription>
              Suscríbete para recibir automáticamente todos los eventos en tu iPhone, Android o computadora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSubscribe} className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Suscribirse al Calendario
              </Button>
              <Button variant="outline" onClick={handleDownloadICS} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Descargar Archivo .ics
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Instrucciones:</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                    🍎 iPhone / iPad
                  </h5>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Toca "Suscribirse al Calendario"</li>
                    <li>Confirma la suscripción</li>
                    <li>Los eventos aparecerán en tu app Calendario</li>
                  </ol>
                </div>
                <div>
                  <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                    🤖 Android
                  </h5>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Toca "Descargar Archivo .ics"</li>
                    <li>Abre el archivo descargado</li>
                    <li>Selecciona Google Calendar para importar</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {locations?.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTimeOfDay} onValueChange={setSelectedTimeOfDay}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Horario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier horario</SelectItem>
              <SelectItem value="morning">Mañana (6-12h)</SelectItem>
              <SelectItem value="afternoon">Tarde (12-18h)</SelectItem>
              <SelectItem value="evening">Noche (18-22h)</SelectItem>
              <SelectItem value="night">Madrugada (22-6h)</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground self-center ml-auto">
            {events?.length || 0} eventos próximos
          </div>
        </div>

        {/* Events List */}
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
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <Badge className={`${getEventTypeColor(event.event_type)} text-white shrink-0 ml-2`}>
                      {getEventTypeLabel(event.event_type)}
                    </Badge>
                  </div>
                  {event.organizer?.name && (
                    <CardDescription>Por {event.organizer.name}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(parseISO(event.event_date), "EEEE, d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  
                  {event.event_time && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{event.event_time.slice(0, 5)} hrs</span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}

                  {event.max_attendees && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.current_attendees || 0} / {event.max_attendees} asistentes
                      </span>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {event.description}
                    </p>
                  )}

                  {event.registration_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => window.open(event.registration_url, "_blank")}
                    >
                      Registrarse
                    </Button>
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
      </div>
    </div>
  );
};

export default PublicCalendar;
