import { useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { CameraCapture } from "./CameraCapture";
import { useCameraSession } from "@/shared/hooks/useCameraSession";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  label: string;
  required?: boolean;
  onCapture: (base64: string | null) => void;
}

export function PhotoCapture({ label, required, onCapture }: Props) {
  const handlePhoto = useCallback(
    (photo: string | null) => onCapture(photo),
    [onCapture],
  );
  const { state, sessionUrl, generateSession, cancelSession } =
    useCameraSession(handlePhoto);

  return (
    <Tabs defaultValue="pc">
      <TabsList className="mb-2">
        <TabsTrigger value="pc">Cámara PC</TabsTrigger>
        <TabsTrigger value="mobile">Usar celular</TabsTrigger>
      </TabsList>

      <TabsContent value="pc">
        <CameraCapture
          label={label}
          required={required}
          onCapture={onCapture}
        />
      </TabsContent>

      <TabsContent
        value="mobile"
        className="flex flex-col items-center gap-3 py-2"
      >
        {state === "idle" && (
          <Button variant="outline" onClick={generateSession}>
            Generar QR
          </Button>
        )}

        {(state === "connecting" || state === "waiting") && sessionUrl && (
          <>
            <QRCodeSVG value={sessionUrl} size={180} />
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Esperando foto del celular...
            </p>
            <Button variant="ghost" size="sm" onClick={cancelSession}>
              Cancelar
            </Button>
          </>
        )}

        {state === "connecting" && !sessionUrl && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando sesión...
          </p>
        )}

        {state === "received" && (
          <p className="text-sm text-green-600 font-medium">✓ Foto recibida</p>
        )}

        {state === "error" && (
          <p className="text-sm text-destructive">
            Error al generar sesión.{" "}
            <button onClick={generateSession} className="underline">
              Reintentar
            </button>
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
