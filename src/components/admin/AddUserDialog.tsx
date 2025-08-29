import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface AddUserDialogProps {
  children: React.ReactNode;
}

export default function AddUserDialog({ children }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const displayName = formData.get("display_name")?.toString() || "";
    
    try {
      // Verificar que el usuario actual es admin antes de invocar la función
      const { data: authUser } = await supabase.auth.getUser();
      const currentUserId = authUser?.user?.id;
      if (!currentUserId) {
        throw new Error("No autenticado. Inicia sesión para continuar.");
      }
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUserId)
        .maybeSingle();
      if (roleRow?.role !== "admin") {
        throw new Error("No autorizado. Solo los administradores pueden invitar usuarios.");
      }

      // Llamar función Edge para crear usuario de forma segura
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          display_name: displayName,
          role: selectedRole,
          frontend_url: window.location.origin,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${email} para que establezca su contraseña y acceda con rol ${getRoleLabel(selectedRole)}`,
      });

      setOpen(false);
      (e.target as HTMLFormElement).reset();
      setSelectedRole("user");
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'coordinator':
        return 'Coordinador';
      case 'community_leader':
        return 'Líder de Comunidad';
      case 'collaborator':
        return 'Colaborador';
      default:
        return 'Usuario';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Envía una invitación por email para que el usuario establezca su propia contraseña y acceda al sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              Se enviará una invitación a este email para que el usuario establezca su contraseña
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Nombre de Usuario</Label>
            <Input
              id="display_name"
              name="display_name"
              placeholder="Nombre completo o apodo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="collaborator">Colaborador</SelectItem>
                <SelectItem value="community_leader">Líder de Comunidad</SelectItem>
                <SelectItem value="coordinator">Coordinador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
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
              {isLoading ? "Enviando invitación..." : "Enviar Invitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}