import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Search,
  Network,
  ArrowLeft,
  TrendingUp,
  Bell,
  Phone
} from "lucide-react";
import { 
  useMemberDirectory, 
  useCreateConnection,
  useUserConnections,
  useConnectionRequests,
  useMentorshipRequests,
  useUpdateConnection
} from "@/hooks/useNetworkingData";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemberCard } from "@/components/networking/MemberCard";
import NetworkingProfileForm from "@/components/networking/NetworkingProfileForm";
import MentorshipCenter from "@/components/networking/MentorshipCenter";
import { NetworkingSuggestions } from "@/components/networking/NetworkingSuggestions";
import { NetworkingAnalyticsDashboard } from "@/components/networking/NetworkingAnalyticsDashboard";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const SimpleNetworkingDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("directory");
  
  const { data: members, isLoading: membersLoading } = useMemberDirectory({
    search: searchQuery
  });
  const { data: connections } = useUserConnections();
  const { data: connectionRequests } = useConnectionRequests();
  const { data: mentorshipRequests } = useMentorshipRequests();
  const { data: unreadNotifications } = useUnreadNotificationCount();
  
  const { data: currentUserProfile } = useQuery({
    queryKey: ["current-user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("profiles").select("phone").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user?.id,
  });
  
  const createConnection = useCreateConnection();
  const updateConnection = useUpdateConnection();
  const currentUserHasPhone = !!currentUserProfile?.phone;

  // Calculate stats
  const acceptedConnections = connections?.filter(conn => conn.status === "accepted") || [];
  const pendingRequests = connectionRequests?.filter(req => req.status === "pending") || [];
  const activeMentorships = mentorshipRequests?.filter(req => req.status === "active") || [];

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

  const handleSendConnection = (userId: string) => {
    createConnection.mutate({ 
      requested_id: userId, 
      message: "Me gustaría conectar contigo en la plataforma." 
    });
  };

  // Filter out current user
  const availableMembers = members?.filter(member => 
    member.user_id !== user.id
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
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  {pendingRequests.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Solicitudes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-purple-500" />
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{unreadNotifications || 0}</p>
                  {unreadNotifications && unreadNotifications > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Notificaciones</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{activeMentorships.length}</p>
                  <p className="text-sm text-muted-foreground">Mentorías</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="directory">Directorio</TabsTrigger>
            <TabsTrigger value="connections">Conexiones</TabsTrigger>
            <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
            <TabsTrigger value="mentorship">Mentoría</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
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
                      <MemberCard
                        key={member.id}
                        member={member}
                        onConnect={handleSendConnection}
                        isConnecting={createConnection.isPending}
                      />
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
                  Gestiona tus conexiones y solicitudes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {acceptedConnections.length > 0 ? (
                    <div>
                      <h3 className="font-semibold mb-2">Conexiones activas ({acceptedConnections.length})</h3>
                      <div className="grid gap-3">
                        {acceptedConnections.map((connection) => {
                          const otherUser = connection.requester_id === user?.id 
                            ? connection.requested 
                            : connection.requester;
                          
                          return (
                            <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{otherUser?.display_name || 'Usuario'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Conectado desde {new Date(connection.created_at).toLocaleDateString()}
                                  </p>
                              </div>
                            </div>
                            {otherUser?.phone ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const phone = otherUser.phone.replace(/\D/g, '');
                                  window.open(`https://wa.me/${phone}`, '_blank');
                                }}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                WhatsApp
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                No tiene WhatsApp
                              </Badge>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aún no tienes conexiones</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setActiveTab("directory")}
                      >
                        Explorar Miembros
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Banner si el usuario no tiene teléfono */}
        {!currentUserHasPhone && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Configura tu número de WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    Para que tus conexiones puedan contactarte, agrega tu número de teléfono en tu perfil.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate("/profile")}>
                Configurar
              </Button>
            </CardContent>
          </Card>
        )}

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="mt-6">
            <NetworkingSuggestions />
          </TabsContent>

          {/* Mentorship Tab */}
          <TabsContent value="mentorship" className="mt-6">
            <MentorshipCenter />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <NetworkingAnalyticsDashboard userId={user?.id} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <NetworkingProfileForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimpleNetworkingDashboard;