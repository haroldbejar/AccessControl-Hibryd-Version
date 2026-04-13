import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { NotFoundPage } from "@/features/errors/NotFoundPage";

const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const VisitsPage = lazy(() =>
  import("@/features/visits/VisitsPage").then((m) => ({
    default: m.VisitsPage,
  })),
);
const PackagesPage = lazy(() =>
  import("@/features/packages/PackagesPage").then((m) => ({
    default: m.PackagesPage,
  })),
);
const UsersPage = lazy(() =>
  import("@/features/users/UsersPage").then((m) => ({
    default: m.UsersPage,
  })),
);
const DestinationsPage = lazy(() =>
  import("@/features/destinations/DestinationsPage").then((m) => ({
    default: m.DestinationsPage,
  })),
);
const RepresentativesPage = lazy(() =>
  import("@/features/representatives/RepresentativesPage").then((m) => ({
    default: m.RepresentativesPage,
  })),
);
const ReportsPage = lazy(() =>
  import("@/features/reports/ReportsPage").then((m) => ({
    default: m.ReportsPage,
  })),
);
const ReservationsPage = lazy(() =>
  import("@/features/reservations/ReservationsPage").then((m) => ({
    default: m.ReservationsPage,
  })),
);
const CommonAreasPage = lazy(() =>
  import("@/features/reservations/CommonAreasPage").then((m) => ({
    default: m.CommonAreasPage,
  })),
);
const MobileCapturePage = lazy(
  () => import("@/features/capture/MobileCapturePage"),
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-75">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/capture/:sessionId" element={<MobileCapturePage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/visits" element={<VisitsPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/representatives" element={<RepresentativesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/common-areas" element={<CommonAreasPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
