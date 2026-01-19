import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Eye, Users, Globe, Mail } from "lucide-react";
import { useCommunities } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  contact_email: string;
  website_url: string;
  logo_url: string;
  members_count: number;
  topics: string[];
  status: string;
  created_at: string;
}

export default function ManageCommunities() {
  const { data: communities, isLoading } = useCommunities();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (community: Community) => {
    setEditingCommunity(community);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la comunidad "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from("communities")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Comunidad eliminada",
        description: `La comunidad "${name}" ha sido eliminada exitosamente.`,
      });

      queryClient.invalidateQueries({ queryKey: ["communities"] });
    } catch (error) {
      console.error("Error deleting community:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la comunidad. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from("communities")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `La comunidad "${name}" ahora está ${newStatus === "active" ? "activa" : "inactiva"}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["communities"] });
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
    if (!editingCommunity) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const topics = formData.get("topics")?.toString().split(",").map(t => t.trim()).filter(Boolean) || [];
      
      const { error } = await supabase
        .from("communities")
        .update({
          name: formData.get("name")?.toString() || "",
          description: formData.get("description")?.toString() || "",
          category: formData.get("category")?.toString() || "",
          location: formData.get("location")?.toString() || "",
          contact_email: formData.get("contact_email")?.toString() || "",
          website_url: formData.get("website_url")?.toString() || "",
          logo_url: formData.get("logo_url")?.toString() || null,
          members_count: parseInt(formData.get("members_count")?.toString() || "0"),
          topics,
        })
        .eq("id", editingCommunity.id);

      if (error) throw error;

      toast({
        title: "Comunidad actualizada",
        description: "La comunidad ha sido actualizada exitosamente.",
      });

      setIsEditDialogOpen(false);
      setEditingCommunity(null);
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    } catch (error) {
      console.error("Error updating community:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la comunidad. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando comunidades...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {communities?.map((community) => (
          <Card key={community.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {community.logo_url ? (
                    <img
                      src={community.logo_url}
                      alt={`Logo de ${community.name}`}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-lg">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {community.members_count} miembros
                      </span>
                      {community.location && (
                        <span>{community.location}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={community.status === "active" ? "default" : "secondary"}>
                    {community.status === "active" ? "Activa" : "Inactiva"}
                  </Badge>
                  <Badge variant="outline">{community.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {community.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {community.description}
                </p>
              )}
              
              {community.topics && community.topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {community.topics.slice(0, 3).map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {community.topics.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{community.topics.length - 3} más
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {community.contact_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {community.contact_email}
                    </span>
                  )}
                  {community.website_url && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Sitio web
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(community.id, community.status, community.name)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {community.status === "active" ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(community)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(community.id, community.name)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Comunidad</DialogTitle>
          </DialogHeader>
          {editingCommunity && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingCommunity.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría *</Label>
                  <Select name="category" defaultValue={editingCommunity.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="medio-ambiente">Medio Ambiente</SelectItem>
                      <SelectItem value="arte-cultura">Arte y Cultura</SelectItem>
                      <SelectItem value="deportes">Deportes</SelectItem>
                      <SelectItem value="emprendimiento">Emprendimiento</SelectItem>
                      <SelectItem value="voluntariado">Voluntariado</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingCommunity.description || ""}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Ubicación</Label>
                  <Input
                    id="edit-location"
                    name="location"
                    defaultValue={editingCommunity.location || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-members_count">Número de Miembros</Label>
                  <Input
                    id="edit-members_count"
                    name="members_count"
                    type="number"
                    min="0"
                    defaultValue={editingCommunity.members_count || 0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contact_email">Email de Contacto</Label>
                  <Input
                    id="edit-contact_email"
                    name="contact_email"
                    type="email"
                    defaultValue={editingCommunity.contact_email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-website_url">Sitio Web</Label>
                  <Input
                    id="edit-website_url"
                    name="website_url"
                    type="url"
                    defaultValue={editingCommunity.website_url || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-logo_url">URL del Logo</Label>
                <Input
                  id="edit-logo_url"
                  name="logo_url"
                  type="url"
                  defaultValue={editingCommunity.logo_url || ""}
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa la URL de una imagen para el logo de la comunidad
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-topics">Temas/Tags (separados por comas)</Label>
                <Input
                  id="edit-topics"
                  name="topics"
                  defaultValue={editingCommunity.topics?.join(", ") || ""}
                  placeholder="Ej: React, JavaScript, Frontend"
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