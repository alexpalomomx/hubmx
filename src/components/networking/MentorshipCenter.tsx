import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Star, 
  MessageSquare, 
  Calendar,
  User,
  Search,
  Send
} from "lucide-react";
import { useMentorshipRequests, useCreateMentorshipRequest, useMemberDirectory, useUpdateMentorship } from "@/hooks/useNetworkingData";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MentorshipCenter = () => {
  const { user } = useAuth();
  const { data: mentorshipRequests } = useMentorshipRequests();
  const { data: members } = useMemberDirectory({ available_for_mentoring: true });
  const createMentorshipRequest = useCreateMentorshipRequest();
  const updateMentorship = useUpdateMentorship();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [requestForm, setRequestForm] = useState({
    skill_area: "",
    message: ""
  });

  // Filter mentors based on search
  const availableMentors = members?.filter(member => 
    member.networking_profile?.is_available_for_mentoring &&
    member.user_id !== user?.id &&
    (searchQuery === "" || 
     member.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     member.skills?.some((skill: any) => 
       skill.skill_name.toLowerCase().includes(searchQuery.toLowerCase())
     ))
  ) || [];

  // Filter requests by current user
  const myMentorshipRequests = mentorshipRequests?.filter(req => 
    req.mentee_id === user?.id || req.mentor_id === user?.id
  ) || [];

  const handleSendMentorshipRequest = () => {
    if (!selectedMentor || !requestForm.skill_area.trim()) return;

    createMentorshipRequest.mutate({
      mentor_id: selectedMentor.user_id,
      skill_area: requestForm.skill_area,
      message: requestForm.message
    }, {
      onSuccess: () => {
        setSelectedMentor(null);
        setRequestForm({ skill_area: "", message: "" });
      }
    });
  };

  const handleAcceptMentorship = (mentorshipId: string) => {
    updateMentorship.mutate({
      id: mentorshipId,
      status: "active" as const,
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleRejectMentorship = (mentorshipId: string) => {
    updateMentorship.mutate({
      id: mentorshipId,
      status: "cancelled" as const
    });
  };

  const handleCompleteMentorship = (mentorshipId: string) => {
    updateMentorship.mutate({
      id: mentorshipId,
      status: "completed" as const,
      end_date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
      case "active": return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "completed": return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "cancelled": return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "active": return "Activa";
      case "completed": return "Completada";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="find-mentors">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="find-mentors">Encontrar Mentores</TabsTrigger>
          <TabsTrigger value="my-mentorships">Mis Mentorías</TabsTrigger>
        </TabsList>

        {/* Find Mentors Tab */}
        <TabsContent value="find-mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Mentores
              </CardTitle>
              <CardDescription>
                Encuentra mentores expertos en las áreas que te interesan
              </CardDescription>
              <Input
                placeholder="Buscar por nombre o habilidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardHeader>
            <CardContent>
              {availableMentors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron mentores disponibles
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableMentors.map((mentor) => (
                    <Card key={mentor.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={mentor.avatar_url} />
                            <AvatarFallback>
                              {mentor.display_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold flex items-center gap-1">
                              {mentor.display_name}
                              <Star className="h-4 w-4 text-yellow-500" />
                            </h3>
                            {mentor.networking_profile?.networking_bio && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {mentor.networking_profile.networking_bio}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {mentor.skills?.filter((skill: any) => skill.is_offering_mentorship)
                                .slice(0, 3).map((skill: any) => (
                                <Badge key={skill.id} variant="secondary" className="text-xs">
                                  {skill.skill_name}
                                </Badge>
                              ))}
                            </div>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => setSelectedMentor(mentor)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Solicitar Mentoría
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Solicitar Mentoría a {mentor.display_name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Envía una solicitud de mentoría explicando qué necesitas aprender
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Área de interés</label>
                                    <Input
                                      placeholder="Ej: Desarrollo web, Marketing digital, etc."
                                      value={requestForm.skill_area}
                                      onChange={(e) => 
                                        setRequestForm({ ...requestForm, skill_area: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Mensaje (opcional)</label>
                                    <Textarea
                                      placeholder="Cuéntale sobre tus objetivos y qué esperas de la mentoría..."
                                      value={requestForm.message}
                                      onChange={(e) => 
                                        setRequestForm({ ...requestForm, message: e.target.value })
                                      }
                                      rows={3}
                                    />
                                  </div>
                                  <Button 
                                    onClick={handleSendMentorshipRequest}
                                    disabled={createMentorshipRequest.isPending || !requestForm.skill_area.trim()}
                                    className="w-full"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    {createMentorshipRequest.isPending ? "Enviando..." : "Enviar Solicitud"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Mentorships Tab */}
        <TabsContent value="my-mentorships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Mis Mentorías
              </CardTitle>
              <CardDescription>
                Gestiona tus mentorías activas y solicitudes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myMentorshipRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes mentorías activas o solicitudes pendientes
                </div>
              ) : (
                <div className="space-y-4">
                  {myMentorshipRequests.map((mentorship) => {
                    const isMentor = mentorship.mentor_id === user?.id;
                    const otherUser = isMentor ? mentorship.mentee : mentorship.mentor;
                    
                    return (
                      <Card key={mentorship.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={otherUser?.avatar_url} />
                                <AvatarFallback>
                                  {otherUser?.display_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">
                                  {isMentor ? "Mentoreando a" : "Mentorías con"} {otherUser?.display_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Área: {mentorship.skill_area}
                                </p>
                                {mentorship.message && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    "{mentorship.message}"
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={getStatusColor(mentorship.status)}>
                                    {getStatusLabel(mentorship.status)}
                                  </Badge>
                                  {mentorship.start_date && (
                                    <span className="text-xs text-muted-foreground flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Desde {new Date(mentorship.start_date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                             <div className="flex gap-2">
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => {/* TODO: Implementar mensajería */}}
                               >
                                 <MessageSquare className="h-4 w-4" />
                               </Button>
                              {mentorship.status === "pending" && isMentor && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAcceptMentorship(mentorship.id)}
                                    disabled={updateMentorship.isPending}
                                  >
                                    Aceptar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleRejectMentorship(mentorship.id)}
                                    disabled={updateMentorship.isPending}
                                  >
                                    Rechazar
                                  </Button>
                                </>
                              )}
                              {mentorship.status === "active" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleCompleteMentorship(mentorship.id)}
                                  disabled={updateMentorship.isPending}
                                >
                                  Completar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorshipCenter;