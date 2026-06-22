import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

export function RoleShell({
  role,
  children,
  rightSlot,
}: {
  role: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(
    () => typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("kuntur_theme", next ? "dark" : "light"); } catch {}
  };
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };
  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };
  // Roles internos del sistema: ocultamos navegación pública (Atrás / Inicio)
  const isStaff = !!user && user.role !== "cliente";
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {!isStaff && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={goBack}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Atrás"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Atrás</span>
                </button>
                <Link
                  to="/"
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Ir al inicio"
                >
                  <span className="hidden sm:inline">Inicio</span>
                </Link>
              </div>
            )}
            <Link to="/" aria-label="Inicio"><Logo /></Link>
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground sm:inline">
              {role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {rightSlot}
            <button
              onClick={toggleTheme}
              aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
            >
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}