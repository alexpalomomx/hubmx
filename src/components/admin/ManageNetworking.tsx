import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Network,
  BarChart3,
  UserCheck,
  UserX,
  Star
} from "lucide-react";
import { useUserConnections, useMentorshipRequests, useMemberDirectory } from "@/hooks/useNetworkingData";

const ManageNetworking = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: allConnections } = useUserConnections();
  const { data: allMentorshipRequests } = useMentorshipRequests();
  const { data: allMembers } = useMemberDirectory({});

  // Statistics
  const totalConnections = allConnections?.length || 0;
  const activeConnections = allConnections?.filter(conn => conn.status === "accepted").length || 0;
  const pendingConnections = allConnections?.filter(conn => conn.status === "pending").length || 0;
  
  const totalMentorships = allMentorshipRequests?.length || 0;
  const activeMentorships = allMentorshipRequests?.filter(req => req.status === "active").length || 0;
  const pendingMentorships = allMentorshipRequests?.filter(req => req.status === "pending").length || 0;

  const membersWithNetworkingProfile = allMembers?.filter(
    member => member.networking_profile
  ).length || 0;

  const availableMentors = allMembers?.filter(
    member => member.networking_profile?.is_available_for_mentoring
  ).length || 0;

  const statsCards = [
    {
      title: "Conexiones Totales",
      value: totalConnections,
      subtitle: `${activeConnections} activas, ${pendingConnections} pendientes`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Mentorías",
      value: totalMentorships,
      subtitle: `${activeMentorships} activas, ${pendingMentorships} pendientes`,
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Perfiles Completos",
      value: membersWithNetworkingProfile,
      subtitle: `De ${allMembers?.length || 0} miembros totales`,
      icon: Network,
      color: "text-purple-600"
    },
    {
      title: "Mentores Disponibles",
      value: availableMentors,
      subtitle: "Ofrecen mentoría activamente",
      icon: Star,
      color: "text-orange-600"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
      case "accepted": 
      case "active": return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "completed": return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "blocked":
      case "cancelled": return "bg-red-500/10 text-red-700 dark:text-red-300";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Networking</h2>
          <p className="text-muted-foreground">
            Administra conexiones, mentorías y la actividad de networking
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="connections">Conexiones</TabsTrigger>
          <TabsTrigger value="mentorships">Mentorías</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Connections */}
            <Card>
              <CardHeader>
                <CardTitle>Conexiones Recientes</CardTitle>
                <CardDescription>Últimas solicitudes de conexión</CardDescription>
              </CardHeader>
              <CardContent>
                {allConnections && allConnections.length > 0 ? (
                  <div className="space-y-3">
                    {allConnections.slice(0, 5).map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm">
                            {connection.requester?.display_name} → {connection.requested?.display_name}
                          </span>
                        </div>
                        <Badge className={getStatusColor(connection.status)}>
                          {connection.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay conexiones registradas
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Mentorships */}
            <Card>
              <CardHeader>
                <CardTitle>Mentorías Recientes</CardTitle>
                <CardDescription>Últimas solicitudes de mentoría</CardDescription>
              </CardHeader>
              <CardContent>
                {allMentorshipRequests && allMentorshipRequests.length > 0 ? (
                  <div className="space-y-3">
                    {allMentorshipRequests.slice(0, 5).map((mentorship) => (
                      <div key={mentorship.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{mentorship.mentee?.display_name} → {mentorship.mentor?.display_name}</div>
                            <div className="text-xs text-muted-foreground">{mentorship.skill_area}</div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(mentorship.status)}>
                          {mentorship.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay mentorías registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Conexiones</CardTitle>
              <CardDescription>Gestiona las conexiones entre miembros</CardDescription>
            </CardHeader>
            <CardContent>
              {allConnections && allConnections.length > 0 ? (
                <div className="space-y-4">
                  {allConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{connection.requester?.display_name}</div>
                          <span className="text-muted-foreground">→</span>
                          <div className="font-medium">{connection.requested?.display_name}</div>
                        </div>
                        {connection.message && (
                          <div className="text-sm text-muted-foreground max-w-md truncate">
                            "{connection.message}"
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(connection.status)}>
                          {connection.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(connection.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No hay conexiones registradas
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentorships Tab */}
        <TabsContent value="mentorships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Mentorías</CardTitle>
              <CardDescription>Gestiona las mentorías y solicitudes</CardDescription>
            </CardHeader>
            <CardContent>
              {allMentorshipRequests && allMentorshipRequests.length > 0 ? (
                <div className="space-y-4">
                  {allMentorshipRequests.map((mentorship) => (
                    <div key={mentorship.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{mentorship.mentor?.display_name}</span>
                          <span className="text-muted-foreground">mentoreando a</span>
                          <span className="font-medium">{mentorship.mentee?.display_name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Área: {mentorship.skill_area}
                        </div>
                        {mentorship.message && (
                          <div className="text-sm text-muted-foreground max-w-md">
                            "{mentorship.message}"
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(mentorship.status)}>
                          {mentorship.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(mentorship.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No hay mentorías registradas
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageNetworking;