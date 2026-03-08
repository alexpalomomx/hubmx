import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAllCommunityCategories } from "@/hooks/useCommunityCategories";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";

export const ManageCommunityCategories = () => {
  const { data: categories, isLoading } = useAllCommunityCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['community-categories'] });
    queryClient.invalidateQueries({ queryKey: ['community-categories-all'] });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      value: formData.get("value") as string,
      label: formData.get("label") as string,
      description: formData.get("description") as string || null,
      color: formData.get("color") as string || null,
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from("community_categories" as any)
          .update(payload as any)
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Categoría actualizada" });
      } else {
        const { error } = await supabase
          .from("community_categories" as any)
          .insert([payload] as any);
        if (error) throw error;
        toast({ title: "Categoría creada" });
      }
      invalidate();
      setDialogOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("community_categories" as any)
      .update({ is_active: !isActive } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      invalidate();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría? Las comunidades que la usen conservarán el valor actual.")) return;
    const { error } = await supabase
      .from("community_categories" as any)
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      invalidate();
      toast({ title: "Categoría eliminada" });
    }
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Categorías de Comunidades
            </CardTitle>
            <CardDescription>Administra las categorías disponibles para comunidades</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew}>
                <Plus className="h-4 w-4 mr-1" /> Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor (slug) *</Label>
                    <Input id="value" name="value" placeholder="tech" defaultValue={editing?.value || ""} required />
                    <p className="text-xs text-muted-foreground">Identificador único sin espacios</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label">Nombre visible *</Label>
                    <Input id="label" name="label" placeholder="Tecnología" defaultValue={editing?.label || ""} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input id="description" name="description" placeholder="Comunidades de tecnología..." defaultValue={editing?.description || ""} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color (opcional)</Label>
                    <Input id="color" name="color" placeholder="#3B82F6" defaultValue={editing?.color || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Orden</Label>
                    <Input id="sort_order" name="sort_order" type="number" defaultValue={editing?.sort_order || 0} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4 text-muted-foreground">Cargando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.sort_order}</TableCell>
                  <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{cat.value}</code></TableCell>
                  <TableCell className="font-medium">{cat.label}</TableCell>
                  <TableCell>
                    <Switch
                      checked={cat.is_active}
                      onCheckedChange={() => handleToggleActive(cat.id, cat.is_active)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!categories || categories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No hay categorías</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
