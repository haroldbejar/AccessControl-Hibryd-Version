import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { ShieldX } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 p-8">
            <div className="flex justify-center">
              <ShieldX className="w-20 h-20 text-destructive opacity-70" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Algo salió mal
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ocurrió un error inesperado. Por favor recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
