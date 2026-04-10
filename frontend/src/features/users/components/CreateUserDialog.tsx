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
import { useCreateUser, useRoles } from "../hooks/useUsers";

const schema = z.object({
  userAccount: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(50, "Máximo 50 caracteres"),
  name: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(100, "Máximo 100 caracteres"),
  roleId: z.number().min(1, "Seleccione un rol"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateUserDialog({ open, onClose }: Props) {
  const { user: currentUser } = useAuthStore();
  const { data: roles = [] } = useRoles();
  const createUser = useCreateUser(onClose);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { userAccount: "", name: "", password: "", roleId: 0 },
  });

  const roleId = watch("roleId");

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    createUser.mutate({
      userAccount: data.userAccount,
      name: data.name,
      password: data.password,
      roleId: data.roleId,
      userCreated: currentUser?.userId ?? 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ej: Juan Pérez"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Cuenta de usuario */}
          <div className="space-y-1.5">
            <Label htmlFor="userAccount">Cuenta de usuario</Label>
            <Input
              id="userAccount"
              {...register("userAccount")}
              placeholder="Ej: jperez"
              autoComplete="off"
            />
            {errors.userAccount && (
              <p className="text-xs text-destructive">
                {errors.userAccount.message}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Rol */}
          <div className="space-y-1.5">
            <Label>Rol</Label>
            <Select
              value={roleId > 0 ? String(roleId) : ""}
              onValueChange={(v) =>
                setValue("roleId", Number(v), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol..." />
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

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createUser.isPending}
            >
              {createUser.isPending ? "Guardando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
