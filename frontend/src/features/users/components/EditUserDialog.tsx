import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useUpdateUser, useRoles } from "../hooks/useUsers";
import type { UserResponse } from "../types/user.types";

const schema = z.object({
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  roleId: z.number().min(1, "Seleccione un rol"),
  visible: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  user: UserResponse;
  open: boolean;
  onClose: () => void;
}

export function EditUserDialog({ user, open, onClose }: Props) {
  const { user: currentUser } = useAuthStore();
  const { data: roles = [] } = useRoles();
  const updateUser = useUpdateUser(onClose);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      roleId: user.roleId,
      visible: user.visible,
    },
  });

  // Sincronizar cuando cambia el usuario objetivo
  useEffect(() => {
    reset({ name: user.name, roleId: user.roleId, visible: user.visible });
  }, [user, reset]);

  const roleId = watch("roleId");
  const visible = watch("visible");

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    updateUser.mutate({
      id: user.id,
      name: data.name,
      roleId: data.roleId,
      visible: data.visible,
      userModified: currentUser?.userId ?? 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Cuenta (solo lectura) */}
          <div className="space-y-1.5">
            <Label>Cuenta de usuario</Label>
            <Input value={user.userAccount} disabled className="bg-muted" />
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nombre completo</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Rol */}
          <div className="space-y-1.5">
            <Label>Rol</Label>
            <Select
              value={String(roleId)}
              onValueChange={(v) =>
                setValue("roleId", Number(v), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && (
              <p className="text-xs text-destructive">
                {errors.roleId.message}
              </p>
            )}
          </div>

          {/* Estado activo */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="edit-visible"
              checked={visible}
              onChange={(e) => setValue("visible", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-primary"
            />
            <Label htmlFor="edit-visible" className="cursor-pointer">
              Usuario activo
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateUser.isPending}
            >
              {updateUser.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
