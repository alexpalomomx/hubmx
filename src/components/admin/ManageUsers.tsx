import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, Shield, Users, Crown, Plus, Trash2 } from "lucide-react";
import AddUserDialog from "./AddUserDialog";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email?: string;
  role?: string;
}

const ManageUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users with their roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name');

      if (profilesError) throw profilesError;

      // Get user roles and emails
      const usersWithDetails = await Promise.all(
        profiles.map(async (profile) => {
          const [{ data: roleData }, { data: userData }] = await Promise.all([
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.user_id)
              .single(),
            supabase.auth.admin.getUserById(profile.user_id)
          ]);

          return {
            ...profile,
            role: roleData?.role || 'user',
            email: userData.user?.email || 'Sin email'
          };
        })
      );

      return usersWithDetails;
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'coordinator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'community_leader':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'collaborator':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'coordinator':
        return <Settings className="h-4 w-4" />;
      case 'community_leader':
        return <Crown className="h-4 w-4" />;
      case 'collaborator':
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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

  const handleChangeRole = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    setIsRoleDialogOpen(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: {
          user_id: selectedUser.user_id,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: "Usuario eliminado",
        description: `El usuario ${selectedUser.display_name || selectedUser.email} ha sido eliminado correctamente`,
      });

      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    setIsLoading(true);
    try {
      // First, remove existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);

      // Then add new role if it's not 'user'
      if (newRole !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUser.user_id,
            role: newRole as any // Cast to handle enum type
          });

        if (error) throw error;
      }

      toast({
        title: "Éxito",
        description: `Rol actualizado a ${getRoleLabel(newRole)}`,
      });

      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administra los roles y permisos de los usuarios del sistema
              </CardDescription>
            </div>
            <AddUserDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invitar Usuario
              </Button>
            </AddUserDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    {getRoleIcon(user.role || 'user')}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {user.display_name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="outline" 
                    className={getRoleBadgeColor(user.role || 'user')}
                  >
                    {getRoleLabel(user.role || 'user')}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangeRole(user)}
                  >
                    Cambiar Rol
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Cambia el rol de {selectedUser?.display_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Nuevo Rol</Label>
              <Select value={newRole} onValueChange={setNewRole}>
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={isLoading}
            >
              {isLoading ? "Actualizando..." : "Actualizar Rol"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {selectedUser?.display_name || selectedUser?.email}? 
              Esta acción no se puede deshacer y eliminará todos los datos relacionados con este usuario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUsers;