import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users } from "lucide-react";

interface Community {
  id: string;
  name: string;
}

interface JoinCommunityDialogProps {
  community: Community;
  children: React.ReactNode;
}

export const JoinCommunityDialog = ({ community, children }: JoinCommunityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const nickname = formData.get("nickname") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    try {
      // Check if user already joined this community (by user_id or email)
      const { data: existingMember } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", community.id)
        .or(`user_id.eq.${user?.id},email.eq.${email}`)
        .eq("status", "active")
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Ya eres miembro",
          description: "Ya estás registrado en esta comunidad",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("community_members").insert({
        community_id: community.id,
        nickname,
        phone,
        email,
        user_id: user?.id || null,
      });

      if (error) throw error;

      // Disparar sincronización hacia Legion Hack MX (no bloqueante)
      try {
        await supabase.functions.invoke('sync-communities', {
          body: { action: 'sync', direction: 'to_legion' }
        });
      } catch (syncErr) {
        console.warn('Fallo al sincronizar con LegionHack:', syncErr);
      }

      toast({
        title: "¡Te has unido exitosamente!",
        description: `Ahora eres miembro de ${community.name}`,
      });

      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error joining community:", error);
      toast({
        title: "Error al unirse",
        description: "No se pudo completar el registro. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Unirse a {community.name}
          </DialogTitle>
          <DialogDescription>
            Completa tus datos para unirte a esta comunidad
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              name="nickname"
              placeholder="Tu nickname"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Tu email"
              defaultValue={user?.email || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Celular</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Tu número de celular"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Uniéndose..." : "Unirse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};