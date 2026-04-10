import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <ShieldAlert className="w-20 h-20 text-primary opacity-60" />
        </div>
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">
          Página no encontrada
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          La ruta que buscas no existe o no tienes permisos para acceder.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
