import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAllEventInterests, useEvents } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Download, FileSpreadsheet, Heart } from "lucide-react";
import * as XLSX from 'xlsx';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ManageEventInterests() {
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: interests, isLoading: interestsLoading } = useAllEventInterests(
    selectedEventId === "all" ? undefined : selectedEventId
  );
  const { data: allInterests } = useAllEventInterests();

  // Function to export interests to Excel
  const exportToExcel = (dataToExport: any[], filename: string) => {
    const exportData = dataToExport.map((interest, index) => ({
      'Nº': index + 1,
      'Evento': (interest.events as any)?.title || 'Sin evento',
      'Fecha del Evento': (interest.events as any)?.event_date ? format(new Date((interest.events as any).event_date), "dd/MM/yyyy", { locale: es }) : '',
      'Usuario': (interest.profiles as any)?.display_name || 'Usuario anónimo',
      'Fecha de Interés': format(new Date(interest.created_at), "dd/MM/yyyy HH:mm", { locale: es })
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Intereses");
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
  };

  // Export current filtered interests
  const handleExportFiltered = () => {
    if (!interests || interests.length === 0) return;
    
    const selectedEvent = events?.find(event => event.id === selectedEventId);
    const filename = selectedEventId === "all" 
      ? `intereses-todos-eventos-${format(new Date(), "yyyy-MM-dd")}.xlsx`
      : `intereses-${selectedEvent?.title?.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    
    exportToExcel(interests, filename);
  };

  // Export all interests
  const handleExportAll = () => {
    if (!allInterests || allInterests.length === 0) return;
    
    const filename = `todos-los-intereses-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    exportToExcel(allInterests, filename);
  };

  if (eventsLoading || interestsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Intereses en Eventos
          </h2>
          <p className="text-muted-foreground">
            Visualiza los usuarios interesados en cada evento
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Filtrar por evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los eventos</SelectItem>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">
            {interests?.length || 0} intereses
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportFiltered}
            disabled={!interests || interests.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {selectedEventId === "all" ? "Exportar Todos" : "Exportar Evento"}
          </Button>
          
          {selectedEventId !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAll}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Todos los Intereses
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {interests?.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No hay intereses para mostrar
              </p>
            </CardContent>
          </Card>
        ) : (
          interests?.map((interest) => (
            <Card key={interest.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {(interest.events as any)?.title}
                  </CardTitle>
                  <Badge variant="outline">
                    {format(new Date(interest.created_at), "dd MMM yyyy", { locale: es })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={(interest.profiles as any)?.avatar_url} />
                    <AvatarFallback>
                      {((interest.profiles as any)?.display_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{(interest.profiles as any)?.display_name || 'Usuario anónimo'}</p>
                    <p className="text-sm text-muted-foreground">
                      Mostró interés el {format(new Date(interest.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
                {(interest.events as any)?.event_date && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Evento: {format(new Date((interest.events as any).event_date), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
