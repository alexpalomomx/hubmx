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

interface AddCallDialogProps {
  children: React.ReactNode;
}

export default function AddCallDialog({ children }: AddCallDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const requirements = formData.get("requirements")?.toString().split("\n").filter(Boolean) || [];
      const benefits = formData.get("benefits")?.toString().split("\n").filter(Boolean) || [];
      
      const { error } = await supabase.from("calls").insert({
        title: formData.get("title")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        call_type: formData.get("call_type")?.toString() || "",
        application_deadline: formData.get("application_deadline")?.toString() || null,
        application_url: formData.get("application_url")?.toString() || "",
        image_url: formData.get("image_url")?.toString() || "",
        requirements,
        benefits,
        status: "open",
      });

      if (error) throw error;

      toast({
        title: "Convocatoria creada",
        description: "La convocatoria ha sido creada exitosamente.",
      });

      setOpen(false);
      (e.target as HTMLFormElement).reset();
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    } catch (error) {
      console.error("Error creating call:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la convocatoria. Inténtalo de nuevo.",
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
          <DialogTitle>Crear Nueva Convocatoria</DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva convocatoria.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Título de la convocatoria"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe la convocatoria..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="call_type">Tipo de Convocatoria *</Label>
            <Select name="call_type" required>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="application_deadline">Fecha límite</Label>
              <Input
                id="application_deadline"
                name="application_deadline"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application_url">URL de aplicación</Label>
              <Input
                id="application_url"
                name="application_url"
                type="url"
                placeholder="https://ejemplo.com/aplicar"
              />
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos (uno por línea)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              placeholder="Escribe cada requisito en una línea nueva"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Beneficios (uno por línea)</Label>
            <Textarea
              id="benefits"
              name="benefits"
              placeholder="Escribe cada beneficio en una línea nueva"
              rows={4}
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
              {isLoading ? "Creando..." : "Crear Convocatoria"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}