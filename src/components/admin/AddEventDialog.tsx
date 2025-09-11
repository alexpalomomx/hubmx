import { useState, useEffect } from "react";
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
import { useCommunities } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";

interface AddEventDialogProps {
  children: React.ReactNode;
}

export default function AddEventDialog({ children }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [myCommunity, setMyCommunity] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: communities } = useCommunities();
  const { user, isCollaborator, isCommunityLeader, isAdmin, isCoordinator } = useAuth();

  // Fetch leader's community if they are a community leader
  useEffect(() => {
    const fetchLeaderCommunity = async () => {
      if (!user || !isCommunityLeader) return;

      try {
        const { data: leader, error } = await supabase
          .from('community_leaders')
          .select('community_id, communities(*)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error('Error fetching community leader record:', error);
          return;
        }

        if (leader?.communities) {
          setMyCommunity(leader.communities);
          setSelectedCommunity(leader.community_id);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLeaderCommunity();
  }, [user, isCommunityLeader]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const eventData: any = {
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
        organizer_id: selectedCommunity && selectedCommunity !== "none" ? selectedCommunity : null,
      };

      // Set fields based on user role
      if (isCollaborator) {
        eventData.approval_status = 'pending';
        eventData.submitted_by = user?.id;
      } else if (isCommunityLeader) {
        // For community leaders, always set submitted_by
        eventData.submitted_by = user?.id;
        eventData.approval_status = 'approved'; // Community leaders can approve their own events
      } else if (isAdmin || isCoordinator) {
        // Admins and coordinators create approved events directly
        eventData.approval_status = 'approved';
        eventData.created_by = user?.id;
      }

      const { error } = await supabase.from("events").insert(eventData);

      if (error) throw error;

      toast({
        title: "Evento creado",
        description: isCollaborator 
          ? "El evento ha sido enviado para aprobación."
          : isCommunityLeader
          ? "El evento ha sido creado y aprobado automáticamente."
          : "El evento ha sido creado exitosamente.",
      });

      setOpen(false);
      (e.target as HTMLFormElement).reset();
      setSelectedCommunity("");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
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
            {isCollaborator && " Tu evento será enviado para aprobación."}
            {isCommunityLeader && " Como líder de comunidad, tu evento será aprobado automáticamente."}
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
            <Label htmlFor="organizer_community">Comunidad Organizadora</Label>
            <Select 
              value={selectedCommunity} 
              onValueChange={setSelectedCommunity}
              disabled={isCommunityLeader}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una comunidad" />
              </SelectTrigger>
              <SelectContent>
                {(isAdmin || isCoordinator) && (
                  <SelectItem value="none">Sin comunidad específica</SelectItem>
                )}
                {isCommunityLeader ? (
                  // For community leaders, only show their assigned community
                  myCommunity && (
                    <SelectItem value={myCommunity.id}>
                      {myCommunity.name}
                    </SelectItem>
                  )
                ) : (
                  // For admins and coordinators, show all communities
                  communities?.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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