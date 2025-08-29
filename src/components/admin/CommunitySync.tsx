import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, ArrowRight, ArrowLeft, ArrowLeftRight, Loader2 } from "lucide-react";

export const CommunitySync = () => {
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<string>("bidirectional");
  const { toast } = useToast();

  const handleSync = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-communities', {
        body: {
          action: 'sync',
          direction: direction
        }
      });

      if (error) throw error;

      toast({
        title: "Sincronización exitosa",
        description: "Las comunidades se han sincronizado correctamente",
      });
    } catch (error) {
      console.error('Error en sincronización:', error);
      toast({
        title: "Error en sincronización",
        description: "No se pudo completar la sincronización. Verifica las credenciales.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSyncIcon = () => {
    switch (direction) {
      case 'from_legion':
        return <ArrowRight className="h-4 w-4" />;
      case 'to_legion':
        return <ArrowLeft className="h-4 w-4" />;
      default:
        return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  const getSyncDescription = () => {
    switch (direction) {
      case 'from_legion':
        return "Importar usuarios, comunidades y datos desde Legion Hack MX al HUB";
      case 'to_legion':
        return "Exportar usuarios, comunidades y datos del HUB a Legion Hack MX";
      default:
        return "Sincronización bidireccional completa entre ambas plataformas";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sincronización con Legion Hack MX
        </CardTitle>
        <CardDescription>
          Sincroniza las comunidades entre el HUB y Legion Hack MX
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Dirección de sincronización</label>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bidirectional">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Bidireccional
                </div>
              </SelectItem>
              <SelectItem value="from_legion">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Desde Legion Hack MX
                </div>
              </SelectItem>
              <SelectItem value="to_legion">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Hacia Legion Hack MX
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            {getSyncIcon()}
            <span>{getSyncDescription()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Datos sincronizados:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Usuarios</Badge>
            <Badge variant="secondary">Perfiles</Badge>
            <Badge variant="secondary">Comunidades</Badge>
            <Badge variant="secondary">Miembros</Badge>
            <Badge variant="secondary">Puntos</Badge>
            <Badge variant="secondary">Gamificación</Badge>
          </div>
        </div>

        <Button 
          onClick={handleSync} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Iniciar Sincronización
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};