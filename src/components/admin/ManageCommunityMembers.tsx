import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommunityMembers, useCommunities } from "@/hooks/useSupabaseData";
import { Users } from "lucide-react";

export const ManageCommunityMembers: React.FC = () => {
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState<string | undefined>(undefined);

  const { data: communities } = useCommunities();
  const { data: members, isLoading, error } = useCommunityMembers(communityFilter);

  const communityMap = useMemo(() => {
    const map = new Map<string, string>();
    (communities || []).forEach((c: any) => map.set(c.id, c.name));
    return map;
  }, [communities]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!members) return [];
    return members.filter((m: any) => {
      if (!q) return true;
      const nick = (m.nickname || "").toLowerCase();
      const phone = (m.phone || "").toLowerCase();
      const communityName = (communityMap.get(m.community_id) || "").toLowerCase();
      return nick.includes(q) || phone.includes(q) || communityName.includes(q);
    });
  }, [members, search, communityMap]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Miembros de Comunidades</CardTitle>
            </div>
            <Badge variant="secondary">Total: {members?.length || 0}</Badge>
          </div>
          <CardDescription>
            Visualiza los miembros sincronizados desde Legion Hack MX hacia el HUB.
          </CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <Input
              placeholder="Buscar por nickname, teléfono o comunidad"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={communityFilter} onValueChange={(v) => setCommunityFilter(v === "all" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por comunidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {(communities || []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando miembros...</div>
          ) : error ? (
            <div className="text-sm text-destructive">Error al cargar miembros.</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay miembros para mostrar.</div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nickname</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Comunidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Se unió</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.nickname || "-"}</TableCell>
                      <TableCell>{m.phone || "-"}</TableCell>
                      <TableCell>{communityMap.get(m.community_id) || m.community_id}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {m.joined_at ? new Date(m.joined_at).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
