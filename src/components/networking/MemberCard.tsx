import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, UserPlus } from "lucide-react";

interface MemberCardProps {
  member: {
    id: string;
    user_id: string;
    display_name: string;
    avatar_url?: string;
    networking_profile?: {
      location?: string;
      is_available_for_mentoring?: boolean;
      is_seeking_mentorship?: boolean;
      available_for_connections?: boolean;
    };
    skills?: Array<{ id: string; skill_name: string; }>;
  };
  onConnect: (userId: string) => void;
  isConnecting?: boolean;
}

export const MemberCard = ({ member, onConnect, isConnecting }: MemberCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={member.avatar_url} />
            <AvatarFallback>
              {member.display_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {member.display_name}
            </h3>
            {member.networking_profile?.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {member.networking_profile.location}
              </div>
            )}
            <div className="mt-2">
              {member.skills?.slice(0, 2).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="mr-1 mb-1">
                  {skill.skill_name}
                </Badge>
              ))}
              {member.skills && member.skills.length > 2 && (
                <Badge variant="outline">+{member.skills.length - 2}</Badge>
              )}
            </div>
            {member.networking_profile?.is_available_for_mentoring && (
              <Badge variant="outline" className="mt-2">
                <Star className="h-3 w-3 mr-1" />
                Mentor
              </Badge>
            )}
            {member.networking_profile?.is_seeking_mentorship && (
              <Badge variant="outline" className="mt-2 ml-2">
                Busca mentoría
              </Badge>
            )}
            {member.networking_profile?.available_for_connections && (
              <Badge variant="secondary" className="mt-2 ml-2">
                Abierto a conectar
              </Badge>
            )}
            <Button 
              size="sm" 
              className="w-full mt-3"
              onClick={() => onConnect(member.user_id)}
              disabled={isConnecting}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Conectar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};