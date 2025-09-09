import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Check, X, Mail, MapPin, Users, Building } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PendingCommunity {
  id: string;
  name: string;
  description: string;
  category: string;
  contact_email: string;
  location?: string;
  members_count?: number;
  created_at: string;
  status: string;
}

interface PendingAlliance {
  id: string;
  name: string;
  description: string;
  alliance_type: string;
  contact_email: string;
  created_at: string;
  status: string;
}

interface ManagePendingApprovalsProps {
  pendingCommunities: PendingCommunity[];
  pendingAlliances: PendingAlliance[];
  showOnlyType?: 'communities' | 'alliances';
}

export function ManagePendingApprovals({ 
  pendingCommunities, 
  pendingAlliances, 
  showOnlyType 
}: ManagePendingApprovalsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleApproveCommunity = async (id: string) => {
    try {
      const { data: community, error: fetchError } = await supabase
        .from("communities")
        .select("name, contact_email")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("communities")
        .update({ status: "active" })
        .eq("id", id);

      if (error) throw error;

      // Solo enviar notificaciones a usuarios registrados que tengan el mismo email
      if (community?.contact_email) {
        try {
          // Buscar usuario en la tabla de perfiles que tenga el email de contacto
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("display_name", community.contact_email);

          if (profiles && profiles.length > 0) {
            await supabase
              .from("notifications")
              .insert({
                user_id: profiles[0].user_id,
                notification_type: "community_approved",
                title: "¡Comunidad Aprobada!",
                message: `Tu solicitud para la comunidad "${community.name}" ha sido aprobada y ya es visible en la plataforma.`,
                data: { community_id: id, community_name: community.name }
              });
          }
        } catch (notificationError) {
          console.log("No se pudo enviar notificación:", notificationError);
        }
      }

      toast({
        title: "Comunidad aprobada",
        description: "La comunidad ha sido aprobada exitosamente.",
      });

      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    } catch (error) {
      console.error("Error al aprobar comunidad:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al aprobar la comunidad.",
        variant: "destructive",
      });
    }
  };

  const handleRejectCommunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from("communities")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Comunidad rechazada",
        description: "La comunidad ha sido rechazada.",
      });

      queryClient.invalidateQueries({ queryKey: ['communities'] });
    } catch (error) {
      console.error("Error al rechazar comunidad:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al rechazar la comunidad.",
        variant: "destructive",
      });
    }
  };

  const handleApproveAlliance = async (id: string) => {
    try {
      const { data: alliance, error: fetchError } = await supabase
        .from("alliances")
        .select("name, contact_email, submitted_by")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("alliances")
        .update({ 
          status: "active",
          approval_status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user?.id || null
        })
        .eq("id", id);

      if (error) throw error;

      // Si hay submitted_by, enviar notificación directa
      if (alliance?.submitted_by) {
        await supabase
          .from("notifications")
          .insert({
            user_id: alliance.submitted_by,
            notification_type: "alliance_approved",
            title: "¡Alianza Aprobada!",
            message: `Tu solicitud de alianza "${alliance.name}" ha sido aprobada y ya es visible en la plataforma.`,
            data: { alliance_id: id, alliance_name: alliance.name }
          });
      }

      toast({
        title: "Alianza aprobada",
        description: "La alianza ha sido aprobada y se ha enviado notificación al solicitante.",
      });

      queryClient.invalidateQueries({ queryKey: ['alliances'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    } catch (error) {
      console.error("Error al aprobar alianza:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al aprobar la alianza.",
        variant: "destructive",
      });
    }
  };

  const handleRejectAlliance = async (id: string) => {
    try {
      const { error } = await supabase
        .from("alliances")
        .update({ status: "rejected", approval_status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Alianza rechazada",
        description: "La alianza ha sido rechazada.",
      });

      queryClient.invalidateQueries({ queryKey: ['alliances'] });
    } catch (error) {
      console.error("Error al rechazar alianza:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al rechazar la alianza.",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tech": return "bg-blue-100 text-blue-800";
      case "education": return "bg-green-100 text-green-800";
      case "social": return "bg-purple-100 text-purple-800";
      case "entrepreneurship": return "bg-orange-100 text-orange-800";
      case "web3": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      "tech": "Tecnología",
      "education": "Educación", 
      "social": "Impacto Social",
      "entrepreneurship": "Emprendimiento",
      "web3": "Web3"
    };
    return categories[category as keyof typeof categories] || category;
  };

  return (
    <div className="space-y-6">
      {!showOnlyType && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Aprobaciones Pendientes</h2>
          <p className="text-muted-foreground">
            Revisa y aprueba las solicitudes de nuevas comunidades y alianzas
          </p>
        </div>
      )}

      {/* Debug info */}
      <div className="p-4 bg-muted/30 rounded-md text-sm">
        <p>Debug: Comunidades pendientes: {pendingCommunities.length}</p>
        <p>Debug: Alianzas pendientes: {pendingAlliances.length}</p>
        {pendingAlliances.length > 0 && (
          <p>Debug: Primera alianza: {pendingAlliances[0]?.name}</p>
        )}
      </div>

      {/* Pending Communities */}
      {(!showOnlyType || showOnlyType === 'communities') && pendingCommunities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5" />
            Comunidades Pendientes ({pendingCommunities.length})
          </h3>
          
          {pendingCommunities.map((community) => (
            <Card key={community.id} className="border-orange-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{community.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getCategoryColor(community.category)}>
                        {getCategoryLabel(community.category)}
                      </Badge>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveCommunity(community.id)}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => handleRejectCommunity(community.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{community.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{community.contact_email}</span>
                  </div>
                  
                  {community.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{community.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{community.members_count || 0} miembros</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Solicitado: {format(new Date(community.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Alliances */}
      {(!showOnlyType || showOnlyType === 'alliances') && pendingAlliances.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Building className="h-5 w-5" />
            Alianzas Pendientes ({pendingAlliances.length})
          </h3>
          
          {pendingAlliances.map((alliance) => (
            <Card key={alliance.id} className="border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{alliance.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">
                        {alliance.alliance_type}
                      </Badge>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveAlliance(alliance.id)}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => handleRejectAlliance(alliance.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{alliance.description}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{alliance.contact_email}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Solicitado: {format(new Date(alliance.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No pending items */}
      {((!showOnlyType && pendingCommunities.length === 0 && pendingAlliances.length === 0) ||
        (showOnlyType === 'communities' && pendingCommunities.length === 0) ||
        (showOnlyType === 'alliances' && pendingAlliances.length === 0)) && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              {showOnlyType === 'communities' 
                ? "No hay solicitudes de comunidades pendientes de aprobación"
                : showOnlyType === 'alliances'
                ? "No hay solicitudes de alianzas pendientes de aprobación" 
                : "No hay solicitudes pendientes de aprobación"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}