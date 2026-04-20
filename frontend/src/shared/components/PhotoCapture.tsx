import { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { CameraCapture } from "./CameraCapture";
import { useCameraSession } from "@/shared/hooks/useCameraSession";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Props {
  label: string;
  required?: boolean;
  onCapture: (base64: string | null) => void;
}

export function PhotoCapture({ label, required, onCapture }: Props) {
  // Estado local para el preview de la foto capturada (PC o móvil)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Maneja la recepción de la foto desde PC o móvil
  const handlePhoto = useCallback(
    (photo: string | null) => {
      setCapturedPhoto(photo);
      onCapture(photo);
    },
    [onCapture],
  );

  const handleRetake = useCallback(() => {
    setCapturedPhoto(null);
    onCapture(null);
  }, [onCapture]);

  const { state, sessionUrl, generateSession, cancelSession } =
    useCameraSession(handlePhoto);

  return (
    <Tabs defaultValue="pc">
      <TabsList className="mb-2">
        <TabsTrigger value="pc">Cámara PC</TabsTrigger>
        <TabsTrigger value="mobile">Usar celular</TabsTrigger>
      </TabsList>

      <TabsContent value="pc">
        {/* Preview si ya hay foto capturada */}
        {capturedPhoto ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={`data:image/jpeg;base64,${capturedPhoto}`}
              alt={label}
              className="h-44 w-full object-cover rounded-md border"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleRetake}
            >
              Retomar
            </Button>
          </div>
        ) : (
          <CameraCapture
            label={label}
            required={required}
            onCapture={handlePhoto}
          />
        )}
      </TabsContent>

      <TabsContent
        value="mobile"
        className="flex flex-col items-center gap-3 py-2"
      >
        {/* Preview si ya hay foto capturada */}
        {capturedPhoto ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-green-600 font-medium">
              ✓ Foto recibida
            </p>
            <img
              src={`data:image/jpeg;base64,${capturedPhoto}`}
              alt={label}
              className="h-44 w-full object-cover rounded-md border"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleRetake}
            >
              Retomar
            </Button>
          </div>
        ) : (
          <>
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

            {state === "error" && (
              <p className="text-sm text-destructive">
                Error al generar sesión.{" "}
                <button onClick={generateSession} className="underline">
                  Reintentar
                </button>
              </p>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
