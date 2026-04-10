import { useState } from "react";
import { Pencil, Trash2, Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUsers, useDeleteUser } from "./hooks/useUsers";
import { useAuthStore } from "@/features/auth/store/authStore";
import { CreateUserDialog } from "./components/CreateUserDialog";
import { EditUserDialog } from "./components/EditUserDialog";
import type { UserResponse } from "./types/user.types";

export function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const { user: currentUser } = useAuthStore();
  const deleteUser = useDeleteUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserResponse | null>(null);

  const handleDelete = (id: number) => {
    if (id === currentUser?.userId) {
      return; // guardado también en backend
    }
    if (
      !window.confirm(
        "¿Eliminar este usuario? Esta acción no se puede deshacer.",
      )
    )
      return;
    deleteUser.mutate(id);
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de acceso al sistema
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo usuario
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Cuenta</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  No hay usuarios registrados
                </td>
              </tr>
            )}
            {!isLoading &&
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    {u.id === currentUser?.userId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (tú)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {u.userAccount}
                  </td>
                  <td className="px-4 py-3">{u.roleName}</td>
                  <td className="px-4 py-3">
                    {u.visible ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTarget(u)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                          u.id === currentUser?.userId || deleteUser.isPending
                        }
                        onClick={() => handleDelete(u.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {users.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {users.length} usuario{users.length !== 1 ? "s" : ""}
        </p>
      )}

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      {editTarget && (
        <EditUserDialog
          user={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
