import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useChangePassword } from "../hooks/useUsers";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Requerida"),
    newPassword: z
      .string()
      .min(6, "Mínimo 6 caracteres")
      .max(100, "Máximo 100 caracteres"),
    confirmPassword: z.string().min(1, "Requerida"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

function PasswordField({
  id,
  label,
  registration,
  error,
}: {
  id: string;
  label: string;
  registration: object;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          className="pr-10"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function ChangePasswordDialog({ open, onClose }: Props) {
  const { user } = useAuthStore();
  const changePassword = useChangePassword(onClose);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    if (!user?.userId) return;
    changePassword.mutate({
      id: user.userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña actual y la nueva contraseña.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordField
            id="currentPassword"
            label="Contraseña actual"
            registration={register("currentPassword")}
            error={errors.currentPassword?.message}
          />
          <PasswordField
            id="newPassword"
            label="Nueva contraseña"
            registration={register("newPassword")}
            error={errors.newPassword?.message}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirmar nueva contraseña"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
