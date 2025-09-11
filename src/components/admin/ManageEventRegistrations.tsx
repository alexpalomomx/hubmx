import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEventRegistrations, useEvents } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

export function ManageEventRegistrations() {
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: registrations, isLoading: registrationsLoading } = useEventRegistrations(
    selectedEventId === "all" ? undefined : selectedEventId
  );
  const { data: allRegistrations } = useEventRegistrations(); // Get all registrations

  // Function to export registrations to Excel
  const exportToExcel = (dataToExport: any[], filename: string) => {
    const exportData = dataToExport.map((registration, index) => ({
      'Nº': index + 1,
      'Evento': registration.event?.title || 'Sin evento',
      'Fecha del Evento': registration.event?.event_date ? format(new Date(registration.event.event_date), "dd/MM/yyyy", { locale: es }) : '',
      'Nickname': registration.nickname,
      'Correo Electrónico': registration.email,
      'WhatsApp': registration.whatsapp,
      'Fecha de Registro': format(new Date(registration.created_at), "dd/MM/yyyy HH:mm", { locale: es })
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
  };

  // Export current filtered registrations
  const handleExportFiltered = () => {
    if (!registrations || registrations.length === 0) return;
    
    const selectedEvent = events?.find(event => event.id === selectedEventId);
    const filename = selectedEventId === "all" 
      ? `registros-todos-eventos-${format(new Date(), "yyyy-MM-dd")}.xlsx`
      : `registros-${selectedEvent?.title?.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    
    exportToExcel(registrations, filename);
  };

  // Export all registrations
  const handleExportAll = () => {
    if (!allRegistrations || allRegistrations.length === 0) return;
    
    const filename = `todos-los-registros-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    exportToExcel(allRegistrations, filename);
  };

  if (eventsLoading || registrationsLoading) {
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
          <h2 className="text-2xl font-semibold tracking-tight">Registros de Eventos</h2>
          <p className="text-muted-foreground">
            Gestiona y visualiza los registros de eventos
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
            {registrations?.length || 0} registros
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportFiltered}
            disabled={!registrations || registrations.length === 0}
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
              Exportar Todos los Registros
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {registrations?.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No hay registros para mostrar
              </p>
            </CardContent>
          </Card>
        ) : (
          registrations?.map((registration) => (
            <Card key={registration.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {registration.event?.title}
                  </CardTitle>
                  <Badge variant="outline">
                    {format(new Date(registration.created_at), "dd MMM yyyy", { locale: es })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nickname</p>
                    <p className="text-sm">{registration.nickname}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Correo</p>
                    <p className="text-sm">{registration.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                    <p className="text-sm">{registration.whatsapp}</p>
                  </div>
                </div>
                {registration.event?.event_date && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Evento: {format(new Date(registration.event.event_date), "dd MMM yyyy", { locale: es })}
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