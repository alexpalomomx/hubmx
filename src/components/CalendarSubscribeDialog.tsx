import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Download, Smartphone } from "lucide-react";
import { toast } from "sonner";

const CALENDAR_FEED_URL = "https://itlyiyknweernejmpibd.supabase.co/functions/v1/calendar-feed";

interface CalendarSubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarSubscribeDialog({ open, onOpenChange }: CalendarSubscribeDialogProps) {
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  const { data: communities } = useQuery({
    queryKey: ["communities-for-calendar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleCommunityToggle = (communityId: string) => {
    setSelectAll(false);
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCommunities([]);
    }
  };

  const getCalendarUrl = (protocol: "https" | "webcal" = "https") => {
    const baseUrl = protocol === "webcal" 
      ? CALENDAR_FEED_URL.replace("https://", "webcal://")
      : CALENDAR_FEED_URL;
    
    if (selectAll || selectedCommunities.length === 0) {
      return baseUrl;
    }
    
    // If multiple communities selected, we need to create multiple subscriptions
    // For now, we'll use the first selected community
    // In a future update, we could support comma-separated IDs in the edge function
    if (selectedCommunities.length === 1) {
      return `${baseUrl}?community=${selectedCommunities[0]}`;
    }
    
    // For multiple selections, create a comma-separated list
    return `${baseUrl}?communities=${selectedCommunities.join(",")}`;
  };

  const handleSubscribe = () => {
    if (!selectAll && selectedCommunities.length === 0) {
      toast.error("Selecciona al menos una comunidad");
      return;
    }
    
    window.location.href = getCalendarUrl("webcal");
    toast.success("Abriendo suscripción al calendario...");
    onOpenChange(false);
  };

  const handleDownload = () => {
    if (!selectAll && selectedCommunities.length === 0) {
      toast.error("Selecciona al menos una comunidad");
      return;
    }
    
    window.open(getCalendarUrl("https"), "_blank");
    toast.success("Descargando calendario...");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Suscribirse al Calendario
          </DialogTitle>
          <DialogDescription>
            Selecciona las comunidades cuyos eventos quieres sincronizar con tu calendario.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-medium cursor-pointer">
              Todas las comunidades
            </Label>
          </div>

          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {communities?.map((community) => (
                <div key={community.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={community.id}
                    checked={!selectAll && selectedCommunities.includes(community.id)}
                    disabled={selectAll}
                    onCheckedChange={() => handleCommunityToggle(community.id)}
                  />
                  <Label 
                    htmlFor={community.id} 
                    className={`cursor-pointer ${selectAll ? "text-muted-foreground" : ""}`}
                  >
                    {community.name}
                  </Label>
                </div>
              ))}
              {!communities?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay comunidades disponibles
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg text-sm">
          <h4 className="font-medium mb-2">💡 Tip:</h4>
          <p className="text-muted-foreground">
            <strong>iPhone/iPad:</strong> Usa "Suscribirse" para sincronización automática.
            <br />
            <strong>Android:</strong> Descarga el archivo .ics e impórtalo en Google Calendar.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDownload} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Descargar .ics
          </Button>
          <Button onClick={handleSubscribe} className="w-full sm:w-auto">
            <Smartphone className="h-4 w-4 mr-2" />
            Suscribirse (iPhone)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
