import { useParams, useSearchParams } from "react-router-dom";
import { useRef, useState } from "react";

type State = "idle" | "sending" | "done" | "error";

export default function MobileCapturePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setState("sending");
    try {
      const base64 = await toBase64(file);
      const backendHost = window.location.hostname;
      const res = await fetch(
        `http://${backendHost}:5192/api/photo-sessions/${sessionId}/upload`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, photo: base64 }),
        },
      );
      if (!res.ok) throw new Error("Sesión inválida o expirada.");
      setState("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-background">
      <h1 className="text-2xl font-bold text-foreground">Captura de Foto</h1>

      {state === "idle" && (
        <>
          <p className="text-muted-foreground text-center">
            Toca el botón para abrir la cámara y tomar la foto.
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-lg font-medium"
          >
            Tomar foto
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCapture}
          />
        </>
      )}

      {state === "sending" && (
        <p className="text-muted-foreground">Enviando foto...</p>
      )}

      {state === "done" && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl">✅</span>
          <p className="text-green-600 font-semibold text-lg">
            Foto enviada correctamente
          </p>
          <p className="text-muted-foreground text-sm text-center">
            Puedes cerrar esta página.
          </p>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl">❌</span>
          <p className="text-destructive font-semibold">{errorMsg}</p>
          <button
            onClick={() => {
              setState("idle");
              setErrorMsg("");
            }}
            className="underline text-sm text-muted-foreground"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.8;

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        // Calcular dimensiones manteniendo aspect ratio
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width >= height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        // Solo base64 puro, sin prefijo data URL
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY).split(",")[1]);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
