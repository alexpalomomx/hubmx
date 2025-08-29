import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Calendar, Building, Megaphone, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ContentApprovalProps {
  pendingEvents: any[];
  pendingAlliances: any[];
  pendingCalls: any[];
  pendingBlogPosts: any[];
}

const ManageContentApprovals = ({ 
  pendingEvents, 
  pendingAlliances, 
  pendingCalls, 
  pendingBlogPosts 
}: ContentApprovalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApproval = async (item: any, table: string, action: 'approve' | 'reject') => {
    setSelectedItem({ ...item, table });
    setAction(action);
    setIsDialogOpen(true);
    setRejectionReason('');
  };

  const confirmApproval = async () => {
    if (!selectedItem) return;

    setIsApproving(true);
    try {
      const updateData: any = {
        approval_status: action,
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString()
      };

      if (action === 'reject' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from(selectedItem.table)
        .update(updateData)
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: action === 'approve' ? "Contenido Aprobado" : "Contenido Rechazado",
        description: `El contenido ha sido ${action === 'approve' ? 'aprobado' : 'rechazado'} exitosamente`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: [selectedItem.table] });

      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'events':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'alliances':
        return <Building className="h-5 w-5 text-purple-600" />;
      case 'calls':
        return <Megaphone className="h-5 w-5 text-green-600" />;
      case 'blog_posts':
        return <FileText className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'events':
        return 'Evento';
      case 'alliances':
        return 'Alianza';
      case 'calls':
        return 'Convocatoria';
      case 'blog_posts':
        return 'Publicación';
      default:
        return 'Contenido';
    }
  };

  const allPendingItems = [
    ...pendingEvents.map(item => ({ ...item, type: 'events' })),
    ...pendingAlliances.map(item => ({ ...item, type: 'alliances' })),
    ...pendingCalls.map(item => ({ ...item, type: 'calls' })),
    ...pendingBlogPosts.map(item => ({ ...item, type: 'blog_posts' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (allPendingItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Aprobaciones de Contenido
          </CardTitle>
          <CardDescription>
            No hay contenido pendiente de aprobación
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Contenido Pendiente de Aprobación
          </CardTitle>
          <CardDescription>
            Revisa y aprueba el contenido enviado por colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allPendingItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start space-x-4 flex-1">
                  {getTypeIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {item.title || item.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(item.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description || item.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enviado el {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(item, item.type, 'approve')}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(item, item.type, 'reject')}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Aprobar' : 'Rechazar'} {getTypeLabel(selectedItem?.type)}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve' 
                ? `¿Estás seguro de que quieres aprobar "${selectedItem?.title || selectedItem?.name}"?`
                : `¿Estás seguro de que quieres rechazar "${selectedItem?.title || selectedItem?.name}"?`
              }
            </DialogDescription>
          </DialogHeader>
          
          {action === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Razón del rechazo (opcional)
              </label>
              <Textarea
                placeholder="Explica por qué estás rechazando este contenido..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isApproving}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmApproval}
              disabled={isApproving}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {isApproving 
                ? (action === 'approve' ? 'Aprobando...' : 'Rechazando...') 
                : (action === 'approve' ? 'Aprobar' : 'Rechazar')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageContentApprovals;