import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Calendar,
  Heart,
  Link2,
  Download,
  TrendingUp,
  Building,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useImpactReport, type TimeRange } from "@/hooks/useImpactReport";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

const TIME_LABELS: Record<TimeRange, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 3 meses",
  all: "Todo el tiempo",
};

interface ThemeResult {
  name: string;
  count: number;
  description: string;
  example_events: string[];
}

interface ThemesAnalysis {
  themes: ThemeResult[];
  summary: string;
  total_events_analyzed: number;
  error?: string;
}

export const ImpactReport = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const data = useImpactReport(timeRange);
  const { toast } = useToast();

  // AI Themes state
  const [themesAnalysis, setThemesAnalysis] = useState<ThemesAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeThemes = async () => {
    setIsAnalyzing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-event-themes");
      if (error) throw error;
      if (result?.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }
      setThemesAnalysis(result as ThemesAnalysis);
    } catch (e: any) {
      toast({ title: "Error al analizar", description: e.message || "Error desconocido", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const summary = [
      ["Reporte de Impacto - Hub de Comunidades"],
      ["Período", TIME_LABELS[timeRange]],
      ["Fecha de generación", new Date().toLocaleDateString("es-MX")],
      [],
      ["Métrica", "Valor"],
      ["Total de Comunidades", data.totalCommunities],
      ["Comunidades (período)", data.newCommunities],
      ["Total de Eventos", data.totalEvents],
      ["Total de Interesados", data.totalInterests],
      ["Nuevos Miembros", data.totalMembers],
      ["Conexiones Realizadas", data.acceptedConnections],
      ["Conexiones Pendientes", data.pendingConnections],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

    const eventsData = data.topEvents.map((e) => ({
      Evento: e.title,
      Fecha: e.event_date,
      Categoría: e.category || "Sin categoría",
      Interesados: e.interest_count,
    }));
    const wsEvents = XLSX.utils.json_to_sheet(eventsData);
    XLSX.utils.book_append_sheet(wb, wsEvents, "Top Eventos");

    const catData = data.categoryData.map((c) => ({
      Categoría: c.name,
      "Nº Comunidades": c.value,
    }));
    const wsCat = XLSX.utils.json_to_sheet(catData);
    XLSX.utils.book_append_sheet(wb, wsCat, "Categorías");

    const commData = data.communities.map((c) => ({
      Comunidad: c.name,
      Categoría: c.category,
      Miembros: c.members_count || 0,
      "Fecha Creación": new Date(c.created_at).toLocaleDateString("es-MX"),
    }));
    const wsComm = XLSX.utils.json_to_sheet(commData);
    XLSX.utils.book_append_sheet(wb, wsComm, "Comunidades");

    // AI Themes sheet if available
    if (themesAnalysis?.themes) {
      const themesData = themesAnalysis.themes.map((t) => ({
        Temática: t.name,
        "Nº Eventos": t.count,
        Descripción: t.description,
        "Eventos Ejemplo": t.example_events.join(", "),
      }));
      const wsThemes = XLSX.utils.json_to_sheet(themesData);
      XLSX.utils.book_append_sheet(wb, wsThemes, "Temáticas IA");
    }

    XLSX.writeFile(wb, `reporte-impacto-${timeRange}.xlsx`);
  };

  const statsCards = [
    { title: "Comunidades", value: data.totalCommunities, icon: Building, sub: `${data.newCommunities} en período` },
    { title: "Eventos", value: data.totalEvents, icon: Calendar, sub: `${data.totalInterests} interesados` },
    { title: "Miembros", value: data.totalMembers, icon: Users, sub: "en período" },
    { title: "Conexiones", value: data.acceptedConnections, icon: Link2, sub: `${data.pendingConnections} pendientes` },
  ];

  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
            Reporte de Impacto
          </h2>
          <p className="text-sm text-muted-foreground">Métricas generales de la plataforma</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(TIME_LABELS) as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="text-xs"
            >
              {TIME_LABELS[range]}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={exportToExcel} className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Top Eventos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="ai-themes" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Temáticas IA
          </TabsTrigger>
          <TabsTrigger value="connections">Conexiones</TabsTrigger>
        </TabsList>

        {/* Top Events */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Eventos con más interés
              </CardTitle>
              <CardDescription>Los 10 eventos con mayor número de interesados</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay datos de interés en este período</p>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topEvents} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="title"
                        width={180}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v: string) => (v.length > 28 ? v.slice(0, 28) + "…" : v)}
                      />
                      <Tooltip />
                      <Bar dataKey="interest_count" name="Interesados" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categoría</CardTitle>
                <CardDescription>Comunidades agrupadas por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                {data.categoryData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay datos</p>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {data.categoryData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalle por Temática</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    <Badge variant="secondary">{cat.value}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Themes */}
        <TabsContent value="ai-themes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Análisis de Temáticas con IA
              </CardTitle>
              <CardDescription>
                La IA analiza los títulos y descripciones de eventos de fuentes externas para identificar las temáticas más relevantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!themesAnalysis && !isAnalyzing && (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto text-primary opacity-40 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Presiona el botón para que la IA analice los eventos externos y detecte las temáticas principales
                  </p>
                  <Button onClick={analyzeThemes} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Analizar Temáticas
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Analizando eventos con IA...</p>
                </div>
              )}

              {themesAnalysis && !isAnalyzing && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="text-sm font-medium mb-1">Resumen ({themesAnalysis.total_events_analyzed} eventos analizados)</p>
                    <p className="text-sm text-muted-foreground">{themesAnalysis.summary}</p>
                  </div>

                  {/* Chart */}
                  {themesAnalysis.themes.length > 0 && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={themesAnalysis.themes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v: string) => (v.length > 15 ? v.slice(0, 15) + "…" : v)}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" name="Eventos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Theme Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themesAnalysis.themes.map((theme, i) => (
                      <Card key={theme.name} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <h4 className="font-semibold text-sm">{theme.name}</h4>
                            </div>
                            <Badge variant="secondary">{theme.count} eventos</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{theme.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {theme.example_events.map((ev) => (
                              <Badge key={ev} variant="outline" className="text-xs font-normal">
                                {ev.length > 35 ? ev.slice(0, 35) + "…" : ev}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Re-analyze button */}
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={analyzeThemes} className="gap-2">
                      <Sparkles className="h-3 w-3" />
                      Volver a analizar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections */}
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Resumen de Conexiones
              </CardTitle>
              <CardDescription>Estado de las conexiones de networking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{data.totalConnections}</p>
                    <p className="text-sm text-muted-foreground">Total solicitudes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{data.acceptedConnections}</p>
                    <p className="text-sm text-muted-foreground">Aceptadas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{data.pendingConnections}</p>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
