import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Eye, EyeOff, Save, Loader2 } from "lucide-react";

export const ApiCredentials = () => {
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [credentials, setCredentials] = useState({
    legionUrl: "",
    legionKey: ""
  });
  const { toast } = useToast();

  const handleSave = async () => {
    if (!credentials.legionUrl || !credentials.legionKey) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Enviando credenciales...', { 
        legionUrl: credentials.legionUrl, 
        keyLength: credentials.legionKey.length 
      });

      const { data, error } = await supabase.functions.invoke('update-credentials', {
        body: {
          legionUrl: credentials.legionUrl,
          legionKey: credentials.legionKey
        }
      });

      console.log('Respuesta de la función:', { data, error });

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      if (!data || !data.success) {
        console.error('Error en la respuesta:', data);
        throw new Error(data?.error || 'Error desconocido');
      }

      toast({
        title: "Credenciales actualizadas",
        description: "Las credenciales de API se han guardado correctamente",
      });

      // Limpiar formulario
      setCredentials({ legionUrl: "", legionKey: "" });
    } catch (error: any) {
      console.error('Error completo actualizando credenciales:', error);
      
      let errorMessage = "No se pudieron actualizar las credenciales";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Credenciales de API
        </CardTitle>
        <CardDescription>
          Configura las credenciales para conectar con Legion Hack MX
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="legionUrl">URL de Supabase Legion Hack MX</Label>
          <Input
            id="legionUrl"
            type="url"
            placeholder="https://proyecto.supabase.co"
            value={credentials.legionUrl}
            onChange={(e) => setCredentials(prev => ({ ...prev, legionUrl: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legionKey">API Key de Legion Hack MX</Label>
          <div className="relative">
            <Input
              id="legionKey"
              type={showKeys ? "text" : "password"}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={credentials.legionKey}
              onChange={(e) => setCredentials(prev => ({ ...prev, legionKey: e.target.value }))}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Estas credenciales se almacenan de forma segura y se usan para sincronizar 
            datos entre el HUB y Legion Hack MX. Asegúrate de usar la API Key con permisos de lectura/escritura.
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading || !credentials.legionUrl || !credentials.legionKey}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Credenciales
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};