import { useState } from "react";
import { ConversationsList } from "./ConversationsList";
import { ChatWindow } from "./ChatWindow";
import { MessageCircle } from "lucide-react";

interface MessagingInterfaceProps {
  initialConversationId?: string;
  initialOtherUser?: any;
}

export const MessagingInterface = ({ 
  initialConversationId, 
  initialOtherUser 
}: MessagingInterfaceProps) => {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUser: any;
  } | null>(
    initialConversationId && initialOtherUser 
      ? { id: initialConversationId, otherUser: initialOtherUser }
      : null
  );

  const handleSelectConversation = (conversationId: string, otherUser: any) => {
    setSelectedConversation({ id: conversationId, otherUser });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="h-full">
      {selectedConversation ? (
        <ChatWindow
          conversationId={selectedConversation.id}
          otherUser={selectedConversation.otherUser}
          onBack={handleBackToList}
        />
      ) : (
        <ConversationsList onSelectConversation={handleSelectConversation} />
      )}
    </div>
  );
};