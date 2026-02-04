import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Share2, ArrowLeft, MapPin, Clock, Users, Heart, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEventInterests } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { CalendarSourceSelector } from "@/components/calendar/CalendarSourceSelector";

const PublicCalendar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast: toastUI } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("all");
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  
  const { data: userInterests } = useEventInterests(user?.id);

  // Verificar si el usuario ya mostró interés en un evento
  const hasInterest = (eventId: string) => {
    return userInterests?.some((interest: any) => interest.event_id === eventId);
  };

  const handleInterest = async (event: any) => {
    if (!user) {
      toastUI({
        title: "Inicia sesión requerido",
        description: "Para mostrar interés en un evento, primero debes crear una cuenta o iniciar sesión.",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth?tab=signup")}>
            Ir a registro
          </Button>
        ),
      });
      return;
    }

    // Si ya mostró interés, solo abrir el link
    if (hasInterest(event.id)) {
      if (event.registration_url) {
        window.open(event.registration_url, "_blank");
      } else {
        toast.info("Este evento no tiene link de registro");
      }
      return;
    }

    setLoadingEventId(event.id);
    
    try {
      const { error } = await supabase
        .from('event_interests')
        .insert({
          user_id: user.id,
          event_id: event.id,
        });

      if (error) throw error;

      toast.success("¡Interés registrado! +5 puntos");
      queryClient.invalidateQueries({ queryKey: ['event-interests'] });
      queryClient.invalidateQueries({ queryKey: ['user-points'] });
      
      // Abrir el link de registro después de registrar interés
      if (event.registration_url) {
        window.open(event.registration_url, "_blank");
      }
    } catch (error: any) {
      console.error("Error registering interest:", error);
      toast.error("Error al registrar interés");
    } finally {
      setLoadingEventId(null);
    }
  };

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
        {/* Subscribe Section with Source Selector */}
        <div className="mb-8">
          <CalendarSourceSelector />
        </div>

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

                  <Button 
                    variant={hasInterest(event.id) ? "secondary" : "default"}
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => handleInterest(event)}
                    disabled={loadingEventId === event.id}
                  >
                    {hasInterest(event.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Me interesa
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        Me interesa
                      </>
                    )}
                  </Button>
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
