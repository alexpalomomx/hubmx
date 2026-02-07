import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAlliances } from "@/hooks/useSupabaseData";
import { Plus, X } from "lucide-react";

interface AllianceData {
  id?: string;
  name: string;
  description: string | null;
  alliance_type: string;
  contact_email: string | null;
  website_url: string | null;
  logo_url: string | null;
  benefits: string[] | null;
}

interface AddAllianceDialogProps {
  children: React.ReactNode;
  alliance?: AllianceData | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddAllianceDialog = ({ children, alliance, open: controlledOpen, onOpenChange }: AddAllianceDialogProps) => {
  const { user } = useAuth();
  const { refetch } = useAlliances();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  const isEditing = !!alliance?.id;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    alliance_type: "",
    contact_email: "",
    website_url: "",
    logo_url: "",
  });

  useEffect(() => {
    if (alliance && open) {
      setFormData({
        name: alliance.name || "",
        description: alliance.description || "",
        alliance_type: alliance.alliance_type || "",
        contact_email: alliance.contact_email || "",
        website_url: alliance.website_url || "",
        logo_url: alliance.logo_url || "",
      });
      setBenefits(alliance.benefits || []);
    }
  }, [alliance, open]);

  const resetForm = () => {
    setFormData({ name: "", description: "", alliance_type: "", contact_email: "", website_url: "", logo_url: "" });
    setBenefits([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("alliances")
          .update({ ...formData, benefits })
          .eq("id", alliance!.id!);
        if (error) throw error;
        toast.success("Alianza actualizada exitosamente");
      } else {
        const { error } = await supabase
          .from("alliances")
          .insert({ ...formData, benefits, created_by: user.id, status: "active" });
        if (error) throw error;
        toast.success("Alianza creada exitosamente");
      }

      setOpen(false);
      refetch();
      if (!isEditing) resetForm();
    } catch (error) {
      console.error("Error saving alliance:", error);
      toast.error(isEditing ? "Error al actualizar la alianza" : "Error al crear la alianza");
    } finally {
      setLoading(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Alianza" : "Nueva Alianza"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos de la alianza" : "Agrega una nueva alianza al ecosistema de comunidades"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alliance_type">Tipo de Alianza *</Label>
              <Select value={formData.alliance_type} onValueChange={(value) => setFormData({ ...formData, alliance_type: value })} required>
                <SelectTrigger><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empresa">Empresa</SelectItem>
                  <SelectItem value="organizacion">Organización</SelectItem>
                  <SelectItem value="institucion">Institución</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="aceleradora">Aceleradora</SelectItem>
                  <SelectItem value="universidad">Universidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de Contacto</Label>
              <Input id="contact_email" type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Sitio Web</Label>
              <Input id="website_url" type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} placeholder="https://ejemplo.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL del Logo</Label>
            <Input id="logo_url" type="url" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://ejemplo.com/logo.png" />
          </div>

          <div className="space-y-2">
            <Label>Beneficios</Label>
            <div className="flex gap-2">
              <Input value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} placeholder="Agregar beneficio" onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }} />
              <Button type="button" onClick={addBenefit} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
            {benefits.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                    <span>{benefit}</span>
                    <Button type="button" variant="ghost" size="sm" className="h-auto p-0 text-secondary-foreground hover:text-destructive" onClick={() => removeBenefit(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar Cambios" : "Crear Alianza")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAllianceDialog;
