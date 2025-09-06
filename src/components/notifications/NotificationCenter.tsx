import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  UserPlus, 
  MessageSquare, 
  BookOpen,
  Calendar,
  Users,
  Heart,
  Filter
} from "lucide-react";
import { 
  useNotifications, 
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useRealtimeNotifications 
} from "@/hooks/useNotifications";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationCenterProps {
  showHeader?: boolean;
  maxHeight?: string;
}

export const NotificationCenter = ({ 
  showHeader = true, 
  maxHeight = "400px" 
}: NotificationCenterProps) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  
  // Enable realtime updates
  useRealtimeNotifications();

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === "unread") return !notification.is_read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "connection_request":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "connection_accepted":
        return <Users className="h-4 w-4 text-green-500" />;
      case "message_received":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "mentorship_request":
        return <BookOpen className="h-4 w-4 text-orange-500" />;
      case "mentorship_accepted":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "event_reminder":
        return <Calendar className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 1000) {
      return "Ahora";
    } else if (diff < 60 * 60 * 1000) {
      return `Hace ${Math.floor(diff / (60 * 1000))} min`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `Hace ${Math.floor(diff / (60 * 60 * 1000))} h`;
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return format(date, "EEEE", { locale: es });
    } else {
      return format(date, "dd/MM/yyyy", { locale: es });
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  return (
    <Card className="w-full">
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificaciones</CardTitle>
              {unreadCount && unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter(filter === "all" ? "unread" : "all")}
              >
                <Filter className="h-4 w-4" />
                {filter === "all" ? "Solo no leídas" : "Todas"}
              </Button>
              {unreadCount && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <ScrollArea className="h-full" style={{ maxHeight }}>
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.is_read ? "bg-primary/5 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsRead.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatNotificationTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filter === "unread" 
                  ? "No tienes notificaciones sin leer" 
                  : "No tienes notificaciones"
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Las notificaciones aparecerán aquí cuando tengas actividad
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};