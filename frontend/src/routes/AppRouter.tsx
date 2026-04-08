import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { VisitsPage } from "@/features/visits/VisitsPage";

// Placeholders — serán reemplazados en subfases siguientes
const DashboardPage = () => (
  <div className="text-xl font-semibold">Dashboard</div>
);
const PackagesPage = () => (
  <div className="text-xl font-semibold">Paquetes</div>
);

export function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/packages" element={<PackagesPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
