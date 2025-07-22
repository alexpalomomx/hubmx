import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Calendar, ExternalLink, FileText } from "lucide-react";
import { useCalls } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Call {
  id: string;
  title: string;
  description: string;
  call_type: string;
  application_deadline: string;
  application_url: string;
  image_url: string;
  requirements: string[];
  benefits: string[];
  status: string;
  created_at: string;
}

export default function ManageCalls() {
  const { data: calls, isLoading } = useCalls();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (call: Call) => {
    setEditingCall(call);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la convocatoria "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from("calls")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Convocatoria eliminada",
        description: `La convocatoria "${title}" ha sido eliminada exitosamente.`,
      });

      queryClient.invalidateQueries({ queryKey: ["calls"] });
    } catch (error) {
      console.error("Error deleting call:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la convocatoria. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, title: string) => {
    const statusOptions = ["open", "closed", "in_review"];
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];
    
    try {
      const { error } = await supabase
        .from("calls")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `La convocatoria "${title}" ahora está ${getStatusLabel(nextStatus)}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["calls"] });
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
    if (!editingCall) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const requirements = formData.get("requirements")?.toString().split("\n").filter(Boolean) || [];
      const benefits = formData.get("benefits")?.toString().split("\n").filter(Boolean) || [];
      
      const { error } = await supabase
        .from("calls")
        .update({
          title: formData.get("title")?.toString() || "",
          description: formData.get("description")?.toString() || "",
          call_type: formData.get("call_type")?.toString() || "",
          application_deadline: formData.get("application_deadline")?.toString() || null,
          application_url: formData.get("application_url")?.toString() || "",
          image_url: formData.get("image_url")?.toString() || "",
          requirements,
          benefits,
          status: formData.get("status")?.toString() || "",
        })
        .eq("id", editingCall.id);

      if (error) throw error;

      toast({
        title: "Convocatoria actualizada",
        description: "La convocatoria ha sido actualizada exitosamente.",
      });

      setIsEditDialogOpen(false);
      setEditingCall(null);
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    } catch (error) {
      console.error("Error updating call:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la convocatoria. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "default";
      case "closed": return "destructive";
      case "in_review": return "secondary";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Abierta";
      case "closed": return "Cerrada";
      case "in_review": return "En revisión";
      default: return status;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando convocatorias...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {calls?.map((call) => (
          <Card key={call.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{call.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {call.application_deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Vence: {format(new Date(call.application_deadline), "dd 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    )}
                    <Badge variant="outline">{call.call_type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(call.status)}>
                    {getStatusLabel(call.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {call.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {call.description}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {call.requirements && call.requirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Requisitos:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {call.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {req}
                        </li>
                      ))}
                      {call.requirements.length > 3 && (
                        <li className="text-xs italic">+{call.requirements.length - 3} más...</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {call.benefits && call.benefits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Beneficios:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {call.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {benefit}
                        </li>
                      ))}
                      {call.benefits.length > 3 && (
                        <li className="text-xs italic">+{call.benefits.length - 3} más...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {call.application_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={call.application_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver convocatoria
                      </a>
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(call.id, call.status, call.title)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Cambiar Estado
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(call)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(call.id, call.title)}
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
            <DialogTitle>Editar Convocatoria</DialogTitle>
          </DialogHeader>
          {editingCall && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingCall.title}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingCall.description || ""}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-call_type">Tipo de Convocatoria *</Label>
                  <Select name="call_type" defaultValue={editingCall.call_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beca">Beca</SelectItem>
                      <SelectItem value="premio">Premio</SelectItem>
                      <SelectItem value="concurso">Concurso</SelectItem>
                      <SelectItem value="financiamiento">Financiamiento</SelectItem>
                      <SelectItem value="programa">Programa</SelectItem>
                      <SelectItem value="voluntariado">Voluntariado</SelectItem>
                      <SelectItem value="empleo">Empleo</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select name="status" defaultValue={editingCall.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Abierta</SelectItem>
                      <SelectItem value="closed">Cerrada</SelectItem>
                      <SelectItem value="in_review">En revisión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-application_deadline">Fecha límite</Label>
                  <Input
                    id="edit-application_deadline"
                    name="application_deadline"
                    type="date"
                    defaultValue={editingCall.application_deadline || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-application_url">URL de aplicación</Label>
                  <Input
                    id="edit-application_url"
                    name="application_url"
                    type="url"
                    defaultValue={editingCall.application_url || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image_url">URL de Imagen</Label>
                <Input
                  id="edit-image_url"
                  name="image_url"
                  type="url"
                  defaultValue={editingCall.image_url || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-requirements">Requisitos (uno por línea)</Label>
                <Textarea
                  id="edit-requirements"
                  name="requirements"
                  defaultValue={editingCall.requirements?.join("\n") || ""}
                  rows={4}
                  placeholder="Escribe cada requisito en una línea nueva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-benefits">Beneficios (uno por línea)</Label>
                <Textarea
                  id="edit-benefits"
                  name="benefits"
                  defaultValue={editingCall.benefits?.join("\n") || ""}
                  rows={4}
                  placeholder="Escribe cada beneficio en una línea nueva"
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