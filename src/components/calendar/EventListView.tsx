import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Heart, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface EventListViewProps {
  events: any[];
  onEventClick: (event: any) => void;
  hasInterest: (eventId: string) => boolean;
  loadingEventId: string | null;
}

const getEventTypeLabel = (type: string) => {
  switch (type) {
    case "virtual": return "Virtual";
    case "presencial": return "Presencial";
    case "hibrido": return "Híbrido";
    default: return type;
  }
};

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "virtual": return "bg-blue-500";
    case "presencial": return "bg-green-500";
    case "hibrido": return "bg-purple-500";
    default: return "bg-muted-foreground";
  }
};

export const EventListView = ({ events, onEventClick, hasInterest, loadingEventId }: EventListViewProps) => {
  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, any[]>();
    events?.forEach((event) => {
      const dateKey = event.event_date;
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)!.push(event);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">No hay eventos próximos</p>
        <p className="text-sm text-muted-foreground mt-1">Vuelve pronto para ver nuevos eventos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map(([dateKey, dayEvents]) => (
        <div key={dateKey}>
          {/* Date Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-primary uppercase">
                {format(parseISO(dateKey), "MMM", { locale: es })}
              </span>
              <span className="text-lg font-bold text-primary leading-none">
                {format(parseISO(dateKey), "d")}
              </span>
            </div>
            <div>
              <h3 className="font-semibold capitalize">
                {format(parseISO(dateKey), "EEEE", { locale: es })}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {format(parseISO(dateKey), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>

          {/* Events for this date */}
          <div className="space-y-2 ml-[4.25rem]">
            {dayEvents.map((event: any) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
              >
                {/* Time */}
                <div className="flex-shrink-0 w-16 text-center">
                  {event.event_time ? (
                    <span className="text-sm font-medium">{event.event_time.slice(0, 5)}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Todo el día</span>
                  )}
                </div>

                {/* Type indicator */}
                <div className={`flex-shrink-0 w-1 h-10 rounded-full ${getEventTypeColor(event.event_type)}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {getEventTypeLabel(event.event_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {event.organizer?.name && <span>{event.organizer.name}</span>}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <Button
                  variant={hasInterest(event.id) ? "secondary" : "default"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => onEventClick(event)}
                  disabled={loadingEventId === event.id}
                >
                  {hasInterest(event.id) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
