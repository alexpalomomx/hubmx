import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  BookOpen, 
  Search,
  Network,
  Star,
  MapPin,
  ArrowLeft
} from "lucide-react";
import { 
  useUserConnections, 
  useConnectionRequests, 
  useMemberDirectory,
  useNetworkingProfile,
  useUpdateConnection,
  useCreateConnection
} from "@/hooks/useNetworkingData";
import { useToast } from "@/hooks/use-toast";

const NetworkingDashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("directory");
  
  const { data: connections, isLoading: connectionsLoading } = useUserConnections();
  const { data: connectionRequests, isLoading: requestsLoading } = useConnectionRequests();
  const { data: members, isLoading: membersLoading } = useMemberDirectory({
    search: searchQuery
  });
  const { data: networkingProfile } = useNetworkingProfile(user?.id);
  
  const updateConnection = useUpdateConnection();
  const createConnection = useCreateConnection();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const handleAcceptConnection = (connectionId: string) => {
    updateConnection.mutate({ id: connectionId, status: "accepted" });
  };

  const handleRejectConnection = (connectionId: string) => {
    updateConnection.mutate({ id: connectionId, status: "cancelled" });
  };

  const handleSendConnection = (userId: string) => {
    createConnection.mutate({ 
      requested_id: userId, 
      message: "Me gustaría conectar contigo en la plataforma." 
    });
  };

  const acceptedConnections = connections?.filter(conn => conn.status === "accepted") || [];
  const pendingRequests = connectionRequests?.filter(req => req.requested_id === user.id) || [];
  
  const connectedUserIds = new Set([
    ...acceptedConnections.map(conn => 
      conn.requester_id === user.id ? conn.requested_id : conn.requester_id
    )
  ]);

  // Filter out already connected users and current user
  const availableMembers = members?.filter(member => 
    member.user_id !== user.id && !connectedUserIds.has(member.user_id)
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Network className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Networking & Conexiones
              </h1>
              <p className="text-muted-foreground">Conecta con otros miembros de la comunidad</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{acceptedConnections.length}</p>
                  <p className="text-sm text-muted-foreground">Conexiones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <UserPlus className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">Solicitudes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Mensajes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Mentorías</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="directory">Directorio de Miembros</TabsTrigger>
            <TabsTrigger value="connections">Mis Conexiones</TabsTrigger>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
          </TabsList>

          {/* Member Directory Tab */}
          <TabsContent value="directory" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Directorio de Miembros
                </CardTitle>
                <CardDescription>
                  Encuentra y conecta con otros miembros de la comunidad
                </CardDescription>
                <div className="flex gap-4">
                  <Input
                    placeholder="Buscar miembros..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="text-center py-8">Cargando miembros...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableMembers.map((member) => (
                      <Card key={member.id} className="hover:shadow-md transition-shadow">
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
                                {member.skills?.slice(0, 2).map((skill: any) => (
                                  <Badge key={skill.id} variant="secondary" className="mr-1 mb-1">
                                    {skill.skill_name}
                                  </Badge>
                                ))}
                                {member.skills?.length > 2 && (
                                  <Badge variant="outline">+{member.skills.length - 2}</Badge>
                                )}
                              </div>
                              {member.networking_profile?.is_available_for_mentoring && (
                                <Badge variant="outline" className="mt-2">
                                  <Star className="h-3 w-3 mr-1" />
                                  Mentor
                                </Badge>
                              )}
                              <Button 
                                size="sm" 
                                className="w-full mt-3"
                                onClick={() => handleSendConnection(member.user_id)}
                                disabled={createConnection.isPending}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Conectar
                              </Button>
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

          {/* My Connections Tab */}
          <TabsContent value="connections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mis Conexiones
                </CardTitle>
                <CardDescription>
                  Todas tus conexiones establecidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectionsLoading ? (
                  <div className="text-center py-8">Cargando conexiones...</div>
                ) : acceptedConnections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aún no tienes conexiones establecidas
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {acceptedConnections.map((connection) => {
                      const otherUser = connection.requester_id === user.id 
                        ? connection.requested 
                        : connection.requester;
                      
                      return (
                        <Card key={connection.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={otherUser?.avatar_url} />
                                <AvatarFallback>
                                  {otherUser?.display_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold">{otherUser?.display_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Conectado desde {new Date(connection.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
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

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Solicitudes de Conexión
                </CardTitle>
                <CardDescription>
                  Gestiona las solicitudes de conexión recibidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="text-center py-8">Cargando solicitudes...</div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tienes solicitudes pendientes
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={request.requester?.avatar_url} />
                                <AvatarFallback>
                                  {request.requester?.display_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">
                                  {request.requester?.display_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Quiere conectar contigo
                                </p>
                                {request.message && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    "{request.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleAcceptConnection(request.id)}
                                disabled={updateConnection.isPending}
                              >
                                Aceptar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRejectConnection(request.id)}
                                disabled={updateConnection.isPending}
                              >
                                Rechazar
                              </Button>
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
        </Tabs>
      </div>
    </div>
  );
};

export default NetworkingDashboard;