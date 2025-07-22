import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AddEventDialogProps {
  children: React.ReactNode;
}

export default function AddEventDialog({ children }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from("events").insert({
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
        status: "upcoming",
      });

      if (error) throw error;

      toast({
        title: "Evento creado",
        description: "El evento ha sido creado exitosamente.",
      });

      setOpen(false);
      (e.target as HTMLFormElement).reset();
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el evento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo evento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Nombre del evento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe el evento..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Fecha del Evento *</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">Hora del Evento</Label>
              <Input
                id="event_time"
                name="event_time"
                type="time"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              name="location"
              placeholder="Dirección o plataforma virtual"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo de Evento *</Label>
              <Select name="event_type" required>
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
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                name="category"
                placeholder="Ej: Tecnología, Salud, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_attendees">Máximo de Asistentes</Label>
            <Input
              id="max_attendees"
              name="max_attendees"
              type="number"
              min="1"
              placeholder="Número máximo de asistentes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_url">URL de Registro</Label>
            <Input
              id="registration_url"
              name="registration_url"
              type="url"
              placeholder="https://ejemplo.com/registro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}