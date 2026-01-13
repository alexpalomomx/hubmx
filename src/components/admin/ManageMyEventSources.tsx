import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, RefreshCw, Trash2, ExternalLink, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMyEventSources } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";

interface EventSource {
  id: string;
  name: string;
  source_type: "meetup" | "luma" | "ics";
  url: string;
  is_active: boolean;
  last_synced_at: string | null;
  sync_error: string | null;
  events_imported: number;
  created_at: string;
}

const ManageMyEventSources = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: sources, isLoading } = useMyEventSources(user?.id);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  // Form state
  const [newSource, setNewSource] = useState({
    name: "",
    source_type: "meetup" as "meetup" | "luma" | "ics",
    url: "",
  });

  const addSourceMutation = useMutation({
    mutationFn: async (source: typeof newSource) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("event_sources")
        .insert({
          name: source.name,
          source_type: source.source_type,
          url: source.url,
          created_by: userData.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-event-sources"] });
      setIsAddDialogOpen(false);
      setNewSource({ name: "", source_type: "meetup", url: "" });
      toast.success("Fuente agregada correctamente");
    },
    onError: (error: any) => {
      toast.error("Error al agregar fuente: " + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("event_sources")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-event-sources"] });
      toast.success("Estado actualizado");
    },
    onError: (error: any) => {
      toast.error("Error: " + error.message);
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("event_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-event-sources"] });
      toast.success("Fuente eliminada");
    },
    onError: (error: any) => {
      toast.error("Error: " + error.message);
    },
  });

  const syncSource = async (source: EventSource) => {
    setSyncingId(source.id);
    try {
      const response = await fetch(
        "https://itlyiyknweernejmpibd.supabase.co/functions/v1/import-external-events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ single_url: source.url }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al sincronizar");
      }

      // Update the source with sync results
      await supabase
        .from("event_sources")
        .update({
          last_synced_at: new Date().toISOString(),
          events_imported: (source.events_imported || 0) + (result.inserted || 0),
          sync_error: null,
        })
        .eq("id", source.id);

      queryClient.invalidateQueries({ queryKey: ["my-event-sources"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });

      toast.success(
        `Sincronización completada: ${result.inserted || 0} eventos importados, ${result.skipped || 0} omitidos`
      );
    } catch (error: any) {
      await supabase
        .from("event_sources")
        .update({
          last_synced_at: new Date().toISOString(),
          sync_error: error.message,
        })
        .eq("id", source.id);

      queryClient.invalidateQueries({ queryKey: ["my-event-sources"] });
      toast.error("Error al sincronizar: " + error.message);
    } finally {
      setSyncingId(null);
    }
  };

  const syncAllSources = async () => {
    const activeSources = sources?.filter((s) => s.is_active) || [];
    if (activeSources.length === 0) {
      toast.info("No hay fuentes activas para sincronizar");
      return;
    }

    for (const source of activeSources) {
      await syncSource(source as EventSource);
    }
  };

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case "meetup":
        return { label: "Meetup", color: "bg-red-500" };
      case "luma":
        return { label: "Luma", color: "bg-purple-500" };
      case "ics":
        return { label: "ICS Feed", color: "bg-blue-500" };
      default:
        return { label: type, color: "bg-gray-500" };
    }
  };

  const getUrlPlaceholder = (type: string) => {
    switch (type) {
      case "meetup":
        return "https://www.meetup.com/nombre-del-grupo/";
      case "luma":
        return "https://lu.ma/nombre-del-evento o https://lu.ma/calendar/xxx";
      case "ics":
        return "https://calendar.google.com/calendar/ical/xxx/basic.ics";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Fuentes de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mis Fuentes de Eventos
            </CardTitle>
            <CardDescription>
              Importa eventos desde Meetup, Luma o feeds ICS
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={syncAllSources}
              disabled={syncingId !== null}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncingId ? "animate-spin" : ""}`} />
              Sincronizar Todo
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Fuente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Fuente de Eventos</DialogTitle>
                  <DialogDescription>
                    Configura una nueva fuente para importar eventos automáticamente
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Meetup Tech CDMX"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Fuente</Label>
                    <Select
                      value={newSource.source_type}
                      onValueChange={(value: "meetup" | "luma" | "ics") =>
                        setNewSource({ ...newSource, source_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meetup">Meetup</SelectItem>
                        <SelectItem value="luma">Luma</SelectItem>
                        <SelectItem value="ics">ICS Feed (Google Calendar, etc.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      placeholder={getUrlPlaceholder(newSource.source_type)}
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {newSource.source_type === "meetup" && "Ingresa la URL del grupo de Meetup"}
                      {newSource.source_type === "luma" && "Ingresa la URL del evento o calendario de Luma"}
                      {newSource.source_type === "ics" && "Ingresa la URL del feed ICS público"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => addSourceMutation.mutate(newSource)}
                    disabled={!newSource.name || !newSource.url || addSourceMutation.isPending}
                  >
                    {addSourceMutation.isPending ? "Agregando..." : "Agregar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sources && sources.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Sync</TableHead>
                <TableHead>Eventos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => {
                const typeInfo = getSourceTypeLabel(source.source_type);
                return (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{source.name}</span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${typeInfo.color} text-white`}>
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={source.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: source.id, isActive: checked })
                          }
                        />
                        {source.sync_error ? (
                          <span title={source.sync_error}>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          </span>
                        ) : source.last_synced_at ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {source.last_synced_at
                        ? format(new Date(source.last_synced_at), "dd MMM yyyy HH:mm", { locale: es })
                        : "Nunca"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{source.events_imported}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncSource(source as EventSource)}
                          disabled={syncingId === source.id}
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${syncingId === source.id ? "animate-spin" : ""}`}
                          />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSourceMutation.mutate(source.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tienes fuentes de eventos configuradas</p>
            <p className="text-sm">Agrega una fuente para importar eventos automáticamente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageMyEventSources;
