import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  BookOpen, 
  Search,
  Network,
  ArrowLeft
} from "lucide-react";
import { useMemberDirectory, useCreateConnection } from "@/hooks/useNetworkingData";
import { MemberCard } from "@/components/networking/MemberCard";

const SimpleNetworkingDashboard = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("directory");
  
  const { data: members, isLoading: membersLoading } = useMemberDirectory({
    search: searchQuery
  });
  
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                  Todas tus conexiones establecidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Funcionalidad de conexiones próximamente
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil de Networking</CardTitle>
                <CardDescription>
                  Gestiona tu perfil para networking y conexiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Configuración de perfil próximamente
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimpleNetworkingDashboard;