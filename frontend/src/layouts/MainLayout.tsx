import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  Shield,
  UserCog,
  Building2,
  ContactRound,
  FileBarChart2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";

const baseNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/visits", icon: Users, label: "Visitas" },
  { to: "/packages", icon: Package, label: "Paquetes" },
  { to: "/reservations", icon: CalendarDays, label: "Reservas" },
  { to: "/reports", icon: FileBarChart2, label: "Reportes" },
];

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.roleName?.toLowerCase().includes("admin") ?? false;

  const adminNavItems = [
    { to: "/destinations", icon: Building2, label: "Destinatarios" },
    { to: "/representatives", icon: ContactRound, label: "Representantes" },
    { to: "/common-areas", icon: MapPin, label: "Zonas comunes" },
    { to: "/users", icon: UserCog, label: "Usuarios" },
  ];

  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Access Control</span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Info del usuario */}
        <div className="px-4 py-4 border-t">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.roleName}
          </p>
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
