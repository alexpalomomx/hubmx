import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_time?: string;
  location?: string;
}

interface EventRegistrationDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventRegistrationDialog({ event, open, onOpenChange }: EventRegistrationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Load user profile data when dialog opens
  useEffect(() => {
    if (open && user) {
      const loadProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setUserProfile(data);
      };
      loadProfile();
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!event) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const whatsapp = formData.get("whatsapp") as string;
      const email = formData.get("email") as string;
      const nickname = formData.get("nickname") as string;

      const { error } = await supabase
        .from("event_registrations")
        .insert([
          {
            event_id: event.id,
            whatsapp,
            email,
            nickname,
          },
        ]);

      if (error) throw error;

      // Update user profile if data changed
      if (user && userProfile) {
        const updates: any = {};
        if (userProfile.phone !== whatsapp) updates.phone = whatsapp;
        if (userProfile.display_name !== nickname) updates.display_name = nickname;
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from("profiles")
            .update(updates)
            .eq("user_id", user.id);
        }
      }

      toast({
        title: "¡Registro exitoso!",
        description: `Te has registrado para ${event.title}`,
      });

      // Reset form and close dialog
      (e.target as HTMLFormElement).reset();
      onOpenChange(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["eventRegistrations"] });
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo completar el registro. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrarse para {event?.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname (redes sociales)</Label>
            <Input
              id="nickname"
              name="nickname"
              placeholder="@tunickname"
              defaultValue={userProfile?.display_name || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              defaultValue={user?.email || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              placeholder="+52 1234567890"
              defaultValue={userProfile?.phone || ""}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}