import * as signalR from "@microsoft/signalr";
import { useCallback, useRef, useState } from "react";
import api from "@/shared/services/api";

export type SessionState =
  | "idle"
  | "connecting"
  | "waiting"
  | "received"
  | "error";

export function useCameraSession(onPhotoReceived: (base64: string) => void) {
  const [state, setState] = useState<SessionState>("idle");
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const generateSession = useCallback(async () => {
    setState("connecting");
    try {
      const { data } = await api.post("/photo-sessions");
      const { sessionId, token, networkIp } = data;

      const frontendPort = window.location.port || "5173";
      const url = `http://${networkIp}:${frontendPort}/capture/${sessionId}?token=${token}`;
      setSessionUrl(url);

      // SignalR se conecta a localhost — el PC siempre accede a su propio backend
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`http://localhost:5192/hubs/photo`)
        .withAutomaticReconnect()
        .build();

      connection.on("photoReceived", (photo: string) => {
        onPhotoReceived(photo);
        setState("received");
        connection.stop();
      });

      await connection.start();
      await connection.invoke("JoinSession", sessionId);
      setState("waiting");
      connectionRef.current = connection;
    } catch {
      setState("error");
    }
  }, [onPhotoReceived]);

  const cancelSession = useCallback(() => {
    connectionRef.current?.stop();
    connectionRef.current = null;
    setState("idle");
    setSessionUrl(null);
  }, []);

  return { state, sessionUrl, generateSession, cancelSession };
}
