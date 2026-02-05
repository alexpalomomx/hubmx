 import { useState, useEffect } from "react";
 import { useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { useToast } from "@/hooks/use-toast";
 import { UserCheck, Check, X, Clock, Users, Eye } from "lucide-react";
 
 interface LeaderRegistration {
   id: string;
   leader_name: string;
   email: string;
   phone: string;
   description: string | null;
   community_id: string | null;
   status: string;
   created_at: string;
   communityName?: string;
 }
 
 const ManageLeaderRegistrations = () => {
   const { toast } = useToast();
   const queryClient = useQueryClient();
   
   const [registrations, setRegistrations] = useState<LeaderRegistration[]>([]);
   const [loading, setLoading] = useState(false);
   const [selectedRegistration, setSelectedRegistration] = useState<LeaderRegistration | null>(null);
   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
   const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
   const [rejectionReason, setRejectionReason] = useState("");
   const [statusFilter, setStatusFilter] = useState<string>("pending");
 
   useEffect(() => {
     fetchRegistrations();
   }, [statusFilter]);
 
   const fetchRegistrations = async () => {
     try {
       let query = supabase
         .from('leader_registrations')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (statusFilter !== "all") {
         query = query.eq('status', statusFilter);
       }
 
       const { data, error } = await query;
 
       if (error) throw error;
 
       const regs = data || [];
       const communityIds = regs.map(r => r.community_id).filter(Boolean);
 
       let communitiesMap = new Map<string, string>();
       if (communityIds.length > 0) {
         const { data: communitiesData } = await supabase
           .from('communities')
           .select('id, name')
           .in('id', communityIds);
         communitiesMap = new Map((communitiesData || []).map(c => [c.id, c.name]));
       }
 
       const enriched = regs.map(r => ({
         ...r,
         communityName: r.community_id ? communitiesMap.get(r.community_id) || 'Comunidad no encontrada' : 'Sin asignar'
       }));
 
       setRegistrations(enriched);
     } catch (error) {
       console.error('Error fetching registrations:', error);
     }
   };
 
   const handleApprove = async (registration: LeaderRegistration) => {
     setLoading(true);
     try {
       const { error } = await supabase
         .from('leader_registrations')
         .update({
           status: 'approved',
           approved_at: new Date().toISOString(),
           approved_by: (await supabase.auth.getUser()).data.user?.id
         })
         .eq('id', registration.id);
 
       if (error) throw error;
 
       toast({
         title: "Solicitud Aprobada",
         description: `La solicitud de ${registration.leader_name} ha sido aprobada`,
       });
 
       fetchRegistrations();
     } catch (error: any) {
       toast({
         title: "Error",
         description: "No se pudo aprobar la solicitud",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
   const handleReject = async () => {
     if (!selectedRegistration) return;
 
     setLoading(true);
     try {
       const { error } = await supabase
         .from('leader_registrations')
         .update({
           status: 'rejected',
           rejection_reason: rejectionReason,
           approved_at: new Date().toISOString(),
           approved_by: (await supabase.auth.getUser()).data.user?.id
         })
         .eq('id', selectedRegistration.id);
 
       if (error) throw error;
 
       toast({
         title: "Solicitud Rechazada",
         description: `La solicitud ha sido rechazada`,
       });
 
       setIsRejectDialogOpen(false);
       setSelectedRegistration(null);
       setRejectionReason("");
       fetchRegistrations();
     } catch (error: any) {
       toast({
         title: "Error",
         description: "No se pudo rechazar la solicitud",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
       case 'approved':
        return <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400"><Check className="h-3 w-3 mr-1" />Aprobado</Badge>;
       case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rechazado</Badge>;
       default:
         return <Badge variant="secondary">{status}</Badge>;
     }
   };
 
   const pendingCount = registrations.filter(r => r.status === 'pending').length;
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <UserCheck className="h-6 w-6 text-primary" />
             Solicitudes de Líder
             {pendingCount > 0 && (
               <Badge variant="destructive" className="ml-2">
                 {pendingCount} pendientes
               </Badge>
             )}
           </h2>
           <p className="text-muted-foreground">
             Gestiona las solicitudes de registro de líderes de comunidad
           </p>
         </div>
         <div className="flex gap-2">
           <Button
             variant={statusFilter === "pending" ? "default" : "outline"}
             size="sm"
             onClick={() => setStatusFilter("pending")}
           >
             Pendientes
           </Button>
           <Button
             variant={statusFilter === "approved" ? "default" : "outline"}
             size="sm"
             onClick={() => setStatusFilter("approved")}
           >
             Aprobados
           </Button>
           <Button
             variant={statusFilter === "all" ? "default" : "outline"}
             size="sm"
             onClick={() => setStatusFilter("all")}
           >
             Todos
           </Button>
         </div>
       </div>
 
       {/* Registrations List */}
       <div className="grid grid-cols-1 gap-4">
         {registrations.length === 0 ? (
           <Card>
             <CardContent className="flex flex-col items-center justify-center py-8">
               <Users className="h-12 w-12 text-muted-foreground mb-4" />
               <p className="text-lg font-medium text-muted-foreground">
                 No hay solicitudes {statusFilter !== "all" ? statusFilter === "pending" ? "pendientes" : "aprobadas" : ""}
               </p>
             </CardContent>
           </Card>
         ) : (
           registrations.map((registration) => (
             <Card key={registration.id}>
               <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                 <div className="flex items-start space-x-4">
                   <div className="p-2 bg-primary/10 rounded-full">
                     <UserCheck className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <h3 className="font-medium">{registration.leader_name}</h3>
                     <p className="text-sm text-muted-foreground">{registration.email}</p>
                     <p className="text-sm text-muted-foreground">
                       Comunidad: <span className="font-medium">{registration.communityName}</span>
                     </p>
                     <p className="text-xs text-muted-foreground mt-1">
                       Enviado el {new Date(registration.created_at).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                   {getStatusBadge(registration.status)}
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       setSelectedRegistration(registration);
                       setIsViewDialogOpen(true);
                     }}
                   >
                     <Eye className="h-4 w-4 mr-1" />
                     Ver
                   </Button>
                   {registration.status === 'pending' && (
                     <>
                       <Button
                         variant="default"
                         size="sm"
                         onClick={() => handleApprove(registration)}
                         disabled={loading}
                       >
                         <Check className="h-4 w-4 mr-1" />
                         Aprobar
                       </Button>
                       <Button
                         variant="destructive"
                         size="sm"
                         onClick={() => {
                           setSelectedRegistration(registration);
                           setIsRejectDialogOpen(true);
                         }}
                         disabled={loading}
                       >
                         <X className="h-4 w-4 mr-1" />
                         Rechazar
                       </Button>
                     </>
                   )}
                 </div>
               </CardContent>
             </Card>
           ))
         )}
       </div>
 
       {/* View Dialog */}
       <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>Detalle de Solicitud</DialogTitle>
           </DialogHeader>
           {selectedRegistration && (
             <div className="space-y-4">
               <div>
                 <Label className="text-muted-foreground">Nombre del Líder</Label>
                 <p className="font-medium">{selectedRegistration.leader_name}</p>
               </div>
               <div>
                 <Label className="text-muted-foreground">Email</Label>
                 <p className="font-medium">{selectedRegistration.email}</p>
               </div>
               <div>
                 <Label className="text-muted-foreground">Teléfono</Label>
                 <p className="font-medium">{selectedRegistration.phone}</p>
               </div>
               <div>
                 <Label className="text-muted-foreground">Comunidad</Label>
                 <p className="font-medium">{selectedRegistration.communityName}</p>
               </div>
               <div>
                 <Label className="text-muted-foreground">Descripción</Label>
                 <p className="text-sm">{selectedRegistration.description || 'Sin descripción'}</p>
               </div>
               <div>
                 <Label className="text-muted-foreground">Estado</Label>
                 <div className="mt-1">{getStatusBadge(selectedRegistration.status)}</div>
               </div>
             </div>
           )}
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
               Cerrar
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Reject Dialog */}
       <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Rechazar Solicitud</DialogTitle>
             <DialogDescription>
               Proporciona una razón para rechazar esta solicitud
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div className="space-y-2">
               <Label>Razón del Rechazo</Label>
               <Textarea
                 value={rejectionReason}
                 onChange={(e) => setRejectionReason(e.target.value)}
                 placeholder="Explica por qué se rechaza esta solicitud..."
                 rows={3}
               />
             </div>
           </div>
           <DialogFooter>
             <Button
               variant="outline"
               onClick={() => {
                 setIsRejectDialogOpen(false);
                 setRejectionReason("");
               }}
               disabled={loading}
             >
               Cancelar
             </Button>
             <Button
               variant="destructive"
               onClick={handleReject}
               disabled={loading || !rejectionReason.trim()}
             >
               {loading ? "Rechazando..." : "Rechazar"}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default ManageLeaderRegistrations;