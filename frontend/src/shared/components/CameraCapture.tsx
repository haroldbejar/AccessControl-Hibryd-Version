import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoDevice {
  deviceId: string;
  label: string;
}

interface CameraCaptureProps {
  label: string;
  required?: boolean;
  /** Devuelve base64 puro (sin prefijo data URL) o null al retomar */
  onCapture: (base64: string | null) => void;
}

export function CameraCapture({
  label,
  required = false,
  onCapture,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [captured, setCaptured] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Solicitar permiso y enumerar cámaras al montar
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Solicita permiso primero para obtener labels reales
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        tempStream.getTracks().forEach((t) => t.stop());

        const all = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;

        const videoInputs = all
          .filter((d) => d.kind === "videoinput")
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Cámara ${i + 1}`,
          }));

        setDevices(videoInputs);
        if (videoInputs.length > 0)
          setSelectedDeviceId(videoInputs[0].deviceId);
      } catch {
        if (!cancelled) setPermissionDenied(true);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Iniciar/reiniciar stream al cambiar dispositivo (solo si no hay captura)
  useEffect(() => {
    if (!selectedDeviceId || captured) return;

    let cancelled = false;

    async function startStream() {
      // Detener stream anterior
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        // Dispositivo no disponible; ignorar silenciosamente
      }
    }

    startStream();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [selectedDeviceId, captured]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = 640;
    canvas.height = 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0, 640, 480);

    // base64 puro — sin prefijo data URL
    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

    // Detener cámara tras capturar
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setCaptured(base64);
    onCapture(base64);
  };

  const handleRetake = () => {
    setCaptured(null);
    onCapture(null);
  };

  if (permissionDenied) {
    return (
      <div className="space-y-1">
        <Label>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          No se pudo acceder a la cámara. Verifica los permisos del navegador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      {/* Selector de dispositivo (visible solo si hay más de una cámara y sin captura) */}
      {devices.length > 1 && !captured && (
        <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecciona cámara" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((d) => (
              <SelectItem key={d.deviceId} value={d.deviceId}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Área de captura */}
      <div className="relative overflow-hidden rounded-md border border-border bg-muted">
        {!captured ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-44 w-full object-cover"
            />
            <Button
              type="button"
              size="sm"
              className="absolute bottom-2 left-1/2 -translate-x-1/2"
              onClick={handleCapture}
              disabled={!selectedDeviceId}
            >
              <Camera className="mr-1 h-3 w-3" />
              Capturar
            </Button>
          </>
        ) : (
          <>
            <img
              src={`data:image/jpeg;base64,${captured}`}
              alt={label}
              className="h-44 w-full object-cover"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute bottom-2 left-1/2 -translate-x-1/2"
              onClick={handleRetake}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Retomar
            </Button>
          </>
        )}
      </div>

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
