import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Crown, Plus, Trash2, Users, Shield } from "lucide-react";
import { useCommunities } from "@/hooks/useSupabaseData";

const ManageCommunityLeaders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: communities } = useCommunities();
  
  const [leaders, setLeaders] = useState<any[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    communityId: "",
  });

  // Fetch leaders on component mount
  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('community_leaders')
        .select(`
          *,
          community:communities(name),
          profile:profiles!community_leaders_user_id_fkey(display_name)
        `)
        .eq('status', 'active');

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaders:', error);
    }
  };

  const handleAssignLeader = async () => {
    if (!formData.email || !formData.communityId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, find the user by email from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .ilike('display_name', `%${formData.email}%`)
        .single();

      if (profileError || !profileData) {
        toast({
          title: "Error",
          description: "Usuario no encontrado. Verifica el email o nombre.",
          variant: "destructive",
        });
        return;
      }

      // Check if user already has community_leader role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', profileData.user_id)
        .eq('role', 'community_leader')
        .single();

      // Assign community leader role if not exists
      if (!existingRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: profileData.user_id,
            role: 'community_leader'
          });

        if (roleError) throw roleError;
      }

      // Check if user is already leader of this community
      const { data: existingLeader } = await supabase
        .from('community_leaders')
        .select('id')
        .eq('user_id', profileData.user_id)
        .eq('community_id', formData.communityId)
        .eq('status', 'active')
        .single();

      if (existingLeader) {
        toast({
          title: "Error",
          description: "Este usuario ya es líder de esta comunidad",
          variant: "destructive",
        });
        return;
      }

      // Assign to community
      const { error: leaderError } = await supabase
        .from('community_leaders')
        .insert({
          user_id: profileData.user_id,
          community_id: formData.communityId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'active'
        });

      if (leaderError) throw leaderError;

      toast({
        title: "Líder Asignado",
        description: "El líder ha sido asignado exitosamente a la comunidad",
      });

      setIsAssignDialogOpen(false);
      setFormData({ email: "", communityId: "" });
      fetchLeaders();
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar el líder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLeader = async () => {
    if (!selectedLeader) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('community_leaders')
        .update({ status: 'inactive' })
        .eq('id', selectedLeader.id);

      if (error) throw error;

      toast({
        title: "Líder Removido",
        description: "El líder ha sido removido de la comunidad",
      });

      setIsRemoveDialogOpen(false);
      setSelectedLeader(null);
      fetchLeaders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo remover el líder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            Líderes de Comunidad
          </h2>
          <p className="text-muted-foreground">
            Gestiona los líderes asignados a cada comunidad
          </p>
        </div>
        <Button onClick={() => setIsAssignDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Asignar Líder
        </Button>
      </div>

      {/* Leaders List */}
      <div className="grid grid-cols-1 gap-4">
        {leaders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                No hay líderes asignados
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Asigna líderes a las comunidades para que puedan gestionar eventos y actividades
              </p>
            </CardContent>
          </Card>
        ) : (
          leaders.map((leader) => (
            <Card key={leader.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Crown className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {leader.profile?.display_name || 'Usuario sin nombre'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comunidad: {leader.community?.name || 'Comunidad no encontrada'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Asignado el {new Date(leader.assigned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    <Shield className="h-3 w-3 mr-1" />
                    Activo
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLeader(leader);
                      setIsRemoveDialogOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assign Leader Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Líder de Comunidad</DialogTitle>
            <DialogDescription>
              Selecciona un usuario y una comunidad para asignar como líder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Nombre o Email del Usuario</Label>
              <Input
                id="email"
                type="text"
                placeholder="Nombre del usuario o email@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Puedes buscar por nombre de usuario o email
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="community">Comunidad</Label>
              <Select
                value={formData.communityId}
                onValueChange={(value) => setFormData({ ...formData, communityId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una comunidad" />
                </SelectTrigger>
                <SelectContent>
                  {communities?.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleAssignLeader} disabled={loading}>
              {loading ? "Asignando..." : "Asignar Líder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Leader Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Líder</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres remover a este líder de la comunidad?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveLeader}
              disabled={loading}
            >
              {loading ? "Removiendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCommunityLeaders;