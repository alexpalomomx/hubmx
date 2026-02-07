import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlliances } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddAllianceDialog from "./AddAllianceDialog";
import { 
  Building, 
  Globe, 
  Mail, 
  Edit, 
  Trash2, 
  Eye,
  ExternalLink 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Alliance {
  id: string;
  name: string;
  description: string;
  alliance_type: string;
  contact_email: string;
  website_url: string;
  logo_url: string;
  status: string;
  benefits: string[];
  created_at: string;
}

const ManageAlliances = () => {
  const { data: alliances, refetch } = useAlliances();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; alliance: Alliance | null }>({
    open: false,
    alliance: null
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; alliance: Alliance | null }>({
    open: false,
    alliance: null
  });

  const handleStatusToggle = async (alliance: Alliance) => {
    const newStatus = alliance.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('alliances')
        .update({ status: newStatus })
        .eq('id', alliance.id);

      if (error) throw error;

      toast.success(`Alianza ${newStatus === 'active' ? 'activada' : 'desactivada'} correctamente`);
      refetch();
    } catch (error) {
      console.error('Error updating alliance status:', error);
      toast.error('Error al actualizar el estado de la alianza');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.alliance) return;

    try {
      const { error } = await supabase
        .from('alliances')
        .delete()
        .eq('id', deleteDialog.alliance.id);

      if (error) throw error;

      toast.success('Alianza eliminada correctamente');
      setDeleteDialog({ open: false, alliance: null });
      refetch();
    } catch (error) {
      console.error('Error deleting alliance:', error);
      toast.error('Error al eliminar la alianza');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactiva</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'empresa': 'bg-blue-100 text-blue-800',
      'organizacion': 'bg-purple-100 text-purple-800',
      'institucion': 'bg-green-100 text-green-800',
      'startup': 'bg-orange-100 text-orange-800',
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  if (!alliances) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {alliances.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No hay alianzas registradas</h3>
              <p className="text-muted-foreground">
                Las alianzas aparecerán aquí una vez que se agreguen al sistema
              </p>
            </CardContent>
          </Card>
        ) : (
          alliances.map((alliance) => (
            <Card key={alliance.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {alliance.logo_url ? (
                      <img
                        src={alliance.logo_url}
                        alt={`Logo de ${alliance.name}`}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{alliance.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(alliance.status)}
                        {getTypeBadge(alliance.alliance_type)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(alliance)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {alliance.status === 'active' ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditDialog({ open: true, alliance })}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, alliance })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {alliance.description}
                </CardDescription>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {alliance.contact_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{alliance.contact_email}</span>
                    </div>
                  )}
                  {alliance.website_url && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={alliance.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Ver sitio web</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {alliance.benefits && alliance.benefits.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Beneficios:</h4>
                    <div className="flex flex-wrap gap-1">
                      {alliance.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, alliance: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la alianza 
              "{deleteDialog.alliance?.name}" del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddAllianceDialog
        alliance={editDialog.alliance}
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, alliance: open ? editDialog.alliance : null })}
      >
        <span />
      </AddAllianceDialog>
    </>
  );
};

export default ManageAlliances;