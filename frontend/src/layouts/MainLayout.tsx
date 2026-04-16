import { useState } from "react";
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
  Sun,
  Moon,
  KeyRound,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/shared/hooks/useTheme";
import ChangePasswordDialog from "@/features/users/components/ChangePasswordDialog";
import NotificationBell from "@/shared/components/NotificationBell";
import { useNotifications } from "@/shared/hooks/useNotifications";

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
  const { theme, toggleTheme } = useTheme();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("access-control-sidebar") === "true";
  });

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("access-control-sidebar", String(next));
      return next;
    });
  };

  const isAdmin = user?.roleName?.toLowerCase().includes("admin") ?? false;
  const { packageAlerts } = useNotifications();

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
      <aside
        className={`${collapsed ? "w-16" : "w-64"} border-r border-sidebar-border bg-sidebar dark:bg-linear-to-b dark:from-[#0F172A] dark:to-[#020617] flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        {/* Logo */}
        <div
          className={`flex items-center border-b border-sidebar-border transition-all duration-300 ${
            collapsed ? "justify-center px-0 py-5" : "gap-2 px-6 py-5"
          }`}
        >
          <Shield className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-lg whitespace-nowrap overflow-hidden">
              Access Control
            </span>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-blue-400 font-semibold"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
                }`
              }
            >
              <span className="relative">
                <Icon className="h-4 w-4 shrink-0" />
                {to === "/packages" && packageAlerts > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-bold">
                    {packageAlerts > 9 ? "9+" : packageAlerts}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Info del usuario */}
        <div className="px-4 py-4 border-t border-sidebar-border">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title="Cambiar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Cambiar contraseña
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ChangePasswordDialog
              open={changePasswordOpen}
              onClose={() => setChangePasswordOpen(false)}
            />
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
