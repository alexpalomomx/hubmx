import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useCommunityCategories } from "@/hooks/useCommunityCategories";
import { LocationSelector } from "@/components/LocationSelector";

interface AddCommunityDialogProps {
  children: React.ReactNode;
}

const AddCommunityDialog = ({ children }: AddCommunityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [country, setCountry] = useState("México");
  const [state, setState] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCommunityCategories();

  const handleAddTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const locationParts = [state, country].filter(Boolean);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      location: locationParts.join(", ") || (formData.get("location") as string),
      country,
      state: state || null,
      contact_email: formData.get("contact_email") as string,
      website_url: formData.get("website_url") as string,
      logo_url: formData.get("logo_url") as string || null,
      members_count: parseInt(formData.get("members_count") as string) || 0,
      topics: topics,
      status: "active"
    };

    try {
      const { error } = await supabase.from("communities").insert([data]);
      if (error) throw error;

      toast({
        title: "Comunidad creada",
        description: "La comunidad ha sido registrada exitosamente",
      });

      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      form.reset();
      setTopics([]);
      setCountry("México");
      setState("");
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear la comunidad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Comunidad</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la comunidad *</Label>
              <Input id="name" name="name" placeholder="Tech Innovators LATAM" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" placeholder="Describe la misión y objetivos de la comunidad..." rows={3} />
          </div>

          {/* Location Selector */}
          <LocationSelector
            country={country}
            state={state}
            onCountryChange={setCountry}
            onStateChange={setState}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="members_count">Número de interesados</Label>
              <Input id="members_count" name="members_count" type="number" placeholder="100" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de contacto</Label>
              <Input id="contact_email" name="contact_email" type="email" placeholder="contacto@comunidad.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website_url">Sitio web</Label>
              <Input id="website_url" name="website_url" type="url" placeholder="https://comunidad.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL del Logo</Label>
              <Input id="logo_url" name="logo_url" type="url" placeholder="https://ejemplo.com/logo.png" />
            </div>
          </div>

          {/* Topics/Tags */}
          <div className="space-y-2">
            <Label>Temáticas</Label>
            <div className="flex gap-2">
              <Input
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                placeholder="Agregar temática (ej: IA, Blockchain...)"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTopic(); } }}
              />
              <Button type="button" variant="outline" onClick={handleAddTopic} disabled={!currentTopic.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                    {topic}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTopic(topic)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear Comunidad"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCommunityDialog;
