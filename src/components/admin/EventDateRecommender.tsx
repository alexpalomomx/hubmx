import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Sparkles, Loader2, CalendarDays, Clock, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

const EventDateRecommender = () => {
  const [preferredMonth, setPreferredMonth] = useState<string>("");
  const [eventType, setEventType] = useState<string>("");
  const [duration, setDuration] = useState<string>("2 horas");
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [eventsAnalyzed, setEventsAnalyzed] = useState<number>(0);

  const getMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        value: date.toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
        label: date.toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
      });
    }
    return months;
  };

  const recommendMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("recommend-event-date", {
        body: {
          preferredMonth,
          eventType,
          duration,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      setRecommendation(data.recommendation);
      setEventsAnalyzed(data.eventsAnalyzed);
      toast.success("Recomendación generada exitosamente");
    },
    onError: (error: Error) => {
      console.error("Error getting recommendation:", error);
      if (error.message.includes("429")) {
        toast.error("Demasiadas solicitudes. Intenta de nuevo en unos minutos.");
      } else if (error.message.includes("402")) {
        toast.error("Se requiere agregar créditos para usar la IA.");
      } else {
        toast.error("Error al generar recomendación: " + error.message);
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recomendador de Fechas con IA
        </CardTitle>
        <CardDescription>
          Usa inteligencia artificial para encontrar la mejor fecha para tu evento,
          evitando conflictos con otros eventos del calendario.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="month">Mes preferido</Label>
            <Select value={preferredMonth} onValueChange={setPreferredMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="próximas 2 semanas">Próximas 2 semanas</SelectItem>
                {getMonthOptions().map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de evento</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="híbrido">Híbrido</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="conferencia">Conferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duración estimada</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar duración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 hora">1 hora</SelectItem>
                <SelectItem value="2 horas">2 horas</SelectItem>
                <SelectItem value="3 horas">3 horas</SelectItem>
                <SelectItem value="medio día">Medio día (4-5 horas)</SelectItem>
                <SelectItem value="día completo">Día completo (8+ horas)</SelectItem>
                <SelectItem value="varios días">Varios días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={() => recommendMutation.mutate()}
          disabled={recommendMutation.isPending}
          className="w-full"
        >
          {recommendMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analizando calendario...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Obtener Recomendación de Fecha
            </>
          )}
        </Button>

        {recommendation && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Recomendación de la IA
              </h3>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {eventsAnalyzed} eventos analizados
              </Badge>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{recommendation}</ReactMarkdown>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-accent/50 p-3 rounded-lg border border-border">
              <AlertCircle className="h-4 w-4 mt-0.5 text-primary" />
              <p>
                Esta recomendación se basa en los eventos registrados en el sistema.
                Verifica siempre que no haya conflictos con eventos externos no registrados.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventDateRecommender;
