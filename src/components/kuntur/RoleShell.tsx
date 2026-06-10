import { Link, useRouter } from "@tanstack/react-router";
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
            <Logo />
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground sm:inline">
              {role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {rightSlot}
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