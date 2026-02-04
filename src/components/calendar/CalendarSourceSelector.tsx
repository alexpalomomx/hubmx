import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Download, Smartphone, Link2, Copy, Check, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";

const CALENDAR_FEED_URL = "https://itlyiyknweernejmpibd.supabase.co/functions/v1/calendar-feed";

interface EventSource {
  id: string;
  name: string;
  source_type: string;
  events_imported: number;
  is_active: boolean;
}

interface CalendarSourceSelectorProps {
  onUrlChange?: (url: string) => void;
}

export function CalendarSourceSelector({ onUrlChange }: CalendarSourceSelectorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [includeAllSources, setIncludeAllSources] = useState(true);
  const [includeInternal, setIncludeInternal] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch available event sources
  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["event-sources-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_sources")
        .select("id, name, source_type, events_imported, is_active")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as EventSource[];
    },
  });

  // Fetch user preferences if logged in
  const { data: userPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ["user-calendar-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_calendar_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Load user preferences when available
  useEffect(() => {
    if (userPrefs) {
      setIncludeAllSources(userPrefs.include_all_sources ?? true);
      setSelectedSources(userPrefs.selected_sources || []);
    }
  }, [userPrefs]);

  // Save user preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");
      
      const { error } = await supabase
        .from("user_calendar_preferences")
        .upsert({
          user_id: user.id,
          include_all_sources: includeAllSources,
          selected_sources: selectedSources,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Preferencias guardadas");
      queryClient.invalidateQueries({ queryKey: ["user-calendar-preferences"] });
    },
    onError: (error) => {
      console.error("Error saving preferences:", error);
      toast.error("Error al guardar preferencias");
    },
  });

  // Generate calendar URL based on selections
  const getCalendarUrl = (protocol: "https" | "webcal" = "https") => {
    const baseUrl = protocol === "webcal" 
      ? CALENDAR_FEED_URL.replace("https://", "webcal://")
      : CALENDAR_FEED_URL;
    
    const params = new URLSearchParams();
    
    if (!includeAllSources && selectedSources.length > 0) {
      params.set("sources", selectedSources.join(","));
    }
    
    if (user) {
      params.set("user", user.id);
    }
    
    if (!includeInternal) {
      params.set("internal", "false");
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Update parent when URL changes
  useEffect(() => {
    onUrlChange?.(getCalendarUrl("https"));
  }, [selectedSources, includeAllSources, includeInternal, user]);

  const handleToggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleSelectAll = () => {
    if (sources) {
      setSelectedSources(sources.map(s => s.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedSources([]);
  };

  const handleDownloadICS = () => {
    window.open(getCalendarUrl("https"), "_blank");
    toast.success("Descargando calendario...");
  };

  const handleSubscribe = () => {
    window.location.href = getCalendarUrl("webcal");
    toast.success("Abriendo suscripción al calendario...");
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(getCalendarUrl("https"));
    setCopied(true);
    toast.success("URL copiada al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case "meetup": return "🔵";
      case "luma": return "🟣";
      case "eventbrite": return "🟠";
      case "ics": return "📅";
      default: return "📆";
    }
  };

  if (sourcesLoading || prefsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Personaliza tu Suscripción
        </CardTitle>
        <CardDescription>
          Elige qué fuentes de eventos quieres sincronizar con tu calendario
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* All sources toggle */}
        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="all-sources" className="font-medium">
              Incluir todas las fuentes
            </Label>
            <p className="text-sm text-muted-foreground">
              Recibe eventos de todas las plataformas conectadas
            </p>
          </div>
          <Switch
            id="all-sources"
            checked={includeAllSources}
            onCheckedChange={setIncludeAllSources}
          />
        </div>

        {/* Source selection */}
        {!includeAllSources && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Selecciona las fuentes:</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  Todas
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                  Ninguna
                </Button>
              </div>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {sources?.map((source) => (
                <div
                  key={source.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedSources.includes(source.id)
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background/50 border-border hover:bg-muted/50"
                  }`}
                  onClick={() => handleToggleSource(source.id)}
                >
                  <Checkbox
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={() => handleToggleSource(source.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{getSourceTypeIcon(source.source_type)}</span>
                      <span className="font-medium truncate">{source.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {source.events_imported} eventos importados
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {sources?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay fuentes externas configuradas aún
              </p>
            )}
          </div>
        )}

        {/* Include internal events toggle */}
        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="internal-events" className="font-medium">
              Incluir eventos internos
            </Label>
            <p className="text-sm text-muted-foreground">
              Eventos creados directamente en Hub de Comunidades
            </p>
          </div>
          <Switch
            id="internal-events"
            checked={includeInternal}
            onCheckedChange={setIncludeInternal}
          />
        </div>

        {/* Save preferences button (only for logged in users) */}
        {user && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => savePreferencesMutation.mutate()}
            disabled={savePreferencesMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {savePreferencesMutation.isPending ? "Guardando..." : "Guardar mis preferencias"}
          </Button>
        )}

        {/* Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-sm font-medium">Tu suscripción incluirá:</p>
          <div className="flex flex-wrap gap-2">
            {includeAllSources ? (
              <Badge variant="secondary">Todas las fuentes</Badge>
            ) : (
              <>
                {selectedSources.length === 0 ? (
                  <Badge variant="outline" className="text-muted-foreground">
                    Ninguna fuente seleccionada
                  </Badge>
                ) : (
                  sources
                    ?.filter(s => selectedSources.includes(s.id))
                    .map(s => (
                      <Badge key={s.id} variant="secondary">
                        {getSourceTypeIcon(s.source_type)} {s.name}
                      </Badge>
                    ))
                )}
              </>
            )}
            {includeInternal && (
              <Badge variant="secondary">📍 Eventos internos</Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={handleSubscribe} className="w-full">
            <Smartphone className="h-4 w-4 mr-2" />
            Suscribirse
          </Button>
          <Button variant="outline" onClick={handleDownloadICS} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Descargar .ics
          </Button>
        </div>

        {/* Copy URL */}
        <div className="flex items-center gap-2">
          <div className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
            {getCalendarUrl("https")}
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopyUrl}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-3 text-sm">Instrucciones:</h4>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <h5 className="font-medium flex items-center gap-2 mb-2">
                🍎 iPhone / iPad
              </h5>
              <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Toca "Suscribirse"</li>
                <li>Confirma la suscripción</li>
                <li>Los eventos aparecerán automáticamente</li>
              </ol>
            </div>
            <div>
              <h5 className="font-medium flex items-center gap-2 mb-2">
                🤖 Android / Google Calendar
              </h5>
              <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copia la URL del calendario</li>
                <li>En Google Calendar, ve a "Otros calendarios"</li>
                <li>Selecciona "Desde URL" y pega</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
