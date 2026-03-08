import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Calendar, MapPin, Users, Clock, Filter } from "lucide-react";
import { useEvents } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface EventSource {
  name: string;
  source_type: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string | null;
  location: string;
  event_type: string;
  category: string;
  max_attendees: number;
  current_attendees: number;
  registration_url: string | null;
  image_url: string;
  status: string;
  source_id: string | null;
  source: EventSource | null;
  organizer: { name: string } | null;
}

export default function ManageEvents() {
  const { data: events, isLoading } = useEvents();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [sourceFilter, setSourceFilter] = useState<"all" | "manual" | "external">("all");

  const isEventPast = (eventDate: string) => {
    const date = parseISO(eventDate);
    return isPast(date) && !isToday(date);
  };

  const filteredEvents = events?.filter((event) => {
    // Time filter
    if (timeFilter === "upcoming" && isEventPast(event.event_date)) return false;
    if (timeFilter === "past" && !isEventPast(event.event_date)) return false;

    // Source filter
    if (sourceFilter !== "all") {
      const { isExternal } = getEventSourceMeta(event as Event);
      if (sourceFilter === "external" && !isExternal) return false;
      if (sourceFilter === "manual" && isExternal) return false;
    }

    return true;
  });

  const getExternalSourceTypeFromUrl = (registrationUrl?: string | null) => {
    if (!registrationUrl) return null;

    try {
      const hostname = new URL(registrationUrl).hostname.toLowerCase();
      if (hostname.includes("lu.ma")) return "luma";
      if (hostname.includes("meetup.com")) return "meetup";
      if (hostname.includes("eventbrite")) return "eventbrite";
      return null;
    } catch {
      return null;
    }
  };

  const getEventSourceMeta = (event: Event) => {
    const sourceTypeFromUrl = getExternalSourceTypeFromUrl(event.registration_url);
    const sourceType = event.source?.source_type || sourceTypeFromUrl;
    const sourceName = event.source?.name || (sourceType ? "Fuente externa" : null);

    return {
      isExternal: Boolean(event.source_id || sourceType),
      sourceName,
      sourceType,
    };
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el evento "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Evento eliminado",
        description: `El evento "${title}" ha sido eliminado exitosamente.`,
      });

      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, title: string) => {
    const statusOptions = ["upcoming", "ongoing", "completed", "cancelled"];
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];
    
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `El evento "${title}" ahora está marcado como ${nextStatus}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEvent) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: formData.get("title")?.toString() || "",
          description: formData.get("description")?.toString() || "",
          event_date: formData.get("event_date")?.toString() || "",
          event_time: formData.get("event_time")?.toString() || null,
          location: formData.get("location")?.toString() || "",
          event_type: formData.get("event_type")?.toString() || "",
          category: formData.get("category")?.toString() || "",
          max_attendees: parseInt(formData.get("max_attendees")?.toString() || "0") || null,
          registration_url: formData.get("registration_url")?.toString() || "",
          image_url: formData.get("image_url")?.toString() || "",
          status: formData.get("status")?.toString() || "",
        })
        .eq("id", editingEvent.id);

      if (error) throw error;

      toast({
        title: "Evento actualizado",
        description: "El evento ha sido actualizado exitosamente.",
      });

      setIsEditDialogOpen(false);
      setEditingEvent(null);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el evento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "default";
      case "ongoing": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming": return "Próximo";
      case "ongoing": return "En curso";
      case "completed": return "Completado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando eventos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtrar:
        </div>
        <div className="flex gap-1">
          <Button
            variant={timeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={timeFilter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("upcoming")}
          >
            Próximos
          </Button>
          <Button
            variant={timeFilter === "past" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("past")}
          >
            Pasados
          </Button>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex gap-1">
          <Button
            variant={sourceFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSourceFilter("all")}
          >
            Todas las fuentes
          </Button>
          <Button
            variant={sourceFilter === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setSourceFilter("manual")}
          >
            Manuales
          </Button>
          <Button
            variant={sourceFilter === "external" ? "default" : "outline"}
            size="sm"
            onClick={() => setSourceFilter("external")}
          >
            Externos
          </Button>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredEvents?.length || 0} de {events?.length || 0} eventos
        </span>
      </div>

      <div className="grid gap-4">
        {filteredEvents?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay eventos que coincidan con los filtros seleccionados.
          </div>
        )}
        {filteredEvents?.map((event) => {
          const { isExternal, sourceName, sourceType } = getEventSourceMeta(event as Event);
          const past = isEventPast(event.event_date);

          return (
          <Card key={event.id} className={`hover:shadow-lg transition-shadow ${past ? "opacity-70" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {past ? (
                      <Badge variant="outline" className="text-xs border-muted-foreground/40">
                        Ya pasó
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-green-600 hover:bg-green-700 text-white">
                        Próximo
                      </Badge>
                    )}
                    {isExternal && (
                      <Badge variant="secondary" className="text-xs">
                        📡 {sourceName || "Fuente externa"}
                        {sourceType && ` (${sourceType})`}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(event.event_date), "dd 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    {event.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.event_time}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(event.status)}>
                    {getStatusLabel(event.status)}
                  </Badge>
                  <Badge variant="outline">{event.event_type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </span>
                )}
                {event.max_attendees && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {event.current_attendees || 0}/{event.max_attendees} asistentes
                  </span>
                )}
                {event.category && (
                  <Badge variant="secondary" className="text-xs">
                    {event.category}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  {event.organizer?.name && `Organizado por: ${event.organizer.name}`}
                </div>

                {isExternal ? (
                  <p className="text-xs text-muted-foreground italic">
                    Este evento se gestiona desde la fuente externa
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(event.id, event.status, event.title)}
                    >
                      Cambiar Estado
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(event.id, event.title)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingEvent.title}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingEvent.description || ""}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event_date">Fecha del Evento *</Label>
                  <Input
                    id="edit-event_date"
                    name="event_date"
                    type="date"
                    defaultValue={editingEvent.event_date}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-event_time">Hora del Evento</Label>
                  <Input
                    id="edit-event_time"
                    name="event_time"
                    type="time"
                    defaultValue={editingEvent.event_time || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  name="location"
                  defaultValue={editingEvent.location || ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event_type">Tipo de Evento *</Label>
                  <Select name="event_type" defaultValue={editingEvent.event_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría</Label>
                  <Input
                    id="edit-category"
                    name="category"
                    defaultValue={editingEvent.category || ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-max_attendees">Máximo de Asistentes</Label>
                  <Input
                    id="edit-max_attendees"
                    name="max_attendees"
                    type="number"
                    min="1"
                    defaultValue={editingEvent.max_attendees || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select name="status" defaultValue={editingEvent.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Próximo</SelectItem>
                      <SelectItem value="ongoing">En curso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-registration_url">URL de Registro</Label>
                <Input
                  id="edit-registration_url"
                  name="registration_url"
                  type="url"
                  defaultValue={editingEvent.registration_url || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image_url">URL de Imagen</Label>
                <Input
                  id="edit-image_url"
                  name="image_url"
                  type="url"
                  defaultValue={editingEvent.image_url || ""}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}