import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EventCalendarViewProps {
  events: any[];
  onEventClick: (event: any) => void;
  hasInterest: (eventId: string) => boolean;
}

export const EventCalendarView = ({ events, onEventClick, hasInterest }: EventCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    events?.forEach((event) => {
      const dateKey = event.event_date;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "virtual": return "bg-blue-500";
      case "presencial": return "bg-green-500";
      case "hibrido": return "bg-purple-500";
      default: return "bg-muted-foreground";
    }
  };

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={i}
                className={cn(
                  "min-h-[80px] sm:min-h-[100px] border-t border-r border-border p-1",
                  !isCurrentMonth && "bg-muted/30",
                  isToday && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "text-xs font-medium mb-1",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        "w-full text-left text-[10px] sm:text-xs px-1 py-0.5 rounded truncate text-white font-medium hover:opacity-80 transition-opacity",
                        getEventTypeColor(event.event_type)
                      )}
                      title={event.title}
                    >
                      {event.event_time ? `${event.event_time.slice(0, 5)} ` : ""}{event.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
