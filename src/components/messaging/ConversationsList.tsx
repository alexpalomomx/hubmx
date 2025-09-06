import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle } from "lucide-react";
import { useConversations } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationsListProps {
  onSelectConversation: (conversationId: string, otherUser: any) => void;
}

export const ConversationsList = ({ onSelectConversation }: ConversationsListProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations, isLoading } = useConversations();

  const filteredConversations = conversations?.filter(conversation => {
    const otherUser = conversation.participant1_id === user?.id 
      ? conversation.participant2 
      : conversation.participant1;
    
    return otherUser?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherUser = (conversation: any) => {
    return conversation.participant1_id === user?.id 
      ? conversation.participant2 
      : conversation.participant1;
  };

  const getLastMessage = (conversation: any) => {
    const messages = conversation.messages;
    return messages && messages.length > 0 ? messages[messages.length - 1] : null;
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 1000) {
      return "Ahora";
    } else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}m`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return format(date, "HH:mm");
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return format(date, "EEE", { locale: es });
    } else {
      return format(date, "dd/MM", { locale: es });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversaciones
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Cargando conversaciones...
          </div>
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const lastMessage = getLastMessage(conversation);
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id, otherUser)}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={otherUser?.avatar_url} />
                        <AvatarFallback>
                          {otherUser?.display_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">
                          {otherUser?.display_name}
                        </h3>
                        {conversation.last_message_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatLastMessageTime(conversation.last_message_at)}
                          </span>
                        )}
                      </div>
                      {lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          Nueva conversación
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                        3
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No se encontraron conversaciones" : "No tienes conversaciones aún"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Conecta con otros miembros para comenzar a chatear
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};