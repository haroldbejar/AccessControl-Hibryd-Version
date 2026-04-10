import { useRef, useEffect, useState } from "react";
import { PenLine, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignatureCaptureProps {
  label?: string;
  onCapture: (signature: string | null) => void;
}

export function SignatureCapture({
  label = "Firma",
  onCapture,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (confirmed) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || confirmed) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setHasSignature(true);
    }
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setConfirmed(false);
    onCapture(null);
  };

  const confirm = () => {
    if (!hasSignature) return;
    const canvas = canvasRef.current!;
    const base64 = canvas.toDataURL("image/png").split(",")[1];
    setConfirmed(true);
    onCapture(base64);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        className={`relative border rounded-md overflow-hidden ${
          confirmed ? "border-green-500" : "border-border"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={160}
          className="w-full touch-none bg-white"
          style={{ cursor: confirmed ? "default" : "crosshair" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {confirmed && (
          <div className="absolute inset-0 bg-green-50/50 flex items-center justify-center pointer-events-none">
            <CheckCircle className="h-8 w-8 text-green-500 opacity-60" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          className="gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Limpiar
        </Button>
        {!confirmed ? (
          <Button
            type="button"
            size="sm"
            onClick={confirm}
            disabled={!hasSignature}
            className="gap-1"
          >
            <PenLine className="h-3 w-3" />
            Confirmar firma
          </Button>
        ) : (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Firma capturada
          </span>
        )}
      </div>
    </div>
  );
}
