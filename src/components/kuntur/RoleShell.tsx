import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

export function RoleShell({
  role,
  children,
  rightSlot,
  variant = "desktop",
}: {
  role: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
  variant?: "phone" | "tablet" | "desktop";
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

  const headerEl = (
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
  );

  if (variant === "phone") {
    return (
      <>
        {/* Mobile: Fullscreen Layout */}
        <div className="block md:hidden min-h-screen bg-background">
          {headerEl}
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </div>

        {/* Desktop: iPhone Simulator Layout */}
        <div className="hidden md:flex min-h-screen items-center justify-center bg-slate-950 p-8 relative overflow-hidden select-none">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px]" />
          
          <div className="flex flex-col items-center gap-5 relative z-10">
            {/* Simulation Header */}
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full font-sans">
                Vista Auxiliar (Smartphone)
              </span>
              <p className="text-[11px] text-muted-foreground mt-2 font-sans">
                Simulación responsiva del dispositivo del operador de abordaje
              </p>
            </div>

            {/* Smartphone Mockup */}
            <div className="relative w-[390px] h-[844px] bg-background border-[12px] border-slate-900 dark:border-slate-800 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-4 ring-slate-800/30 overflow-hidden flex flex-col text-foreground select-text">
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[110px] h-[28px] bg-black rounded-full z-50 flex items-center justify-between px-3 select-none pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-3.5 h-1 bg-slate-900 rounded-full" />
              </div>

              {/* Status Bar */}
              <div className="flex h-12 shrink-0 items-end justify-between px-6 pb-2 text-[11px] font-bold text-foreground z-40 bg-card select-none">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  {/* Cellular signal */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="16" width="3" height="4" rx="0.5" />
                    <rect x="7" y="12" width="3" height="8" rx="0.5" />
                    <rect x="12" y="8" width="3" height="12" rx="0.5" />
                    <rect x="17" y="4" width="3" height="16" rx="0.5" />
                  </svg>
                  {/* Wifi */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0" />
                  </svg>
                  {/* Battery */}
                  <div className="flex items-center border border-foreground/50 rounded-sm p-[1px] w-[20px] h-[10px]">
                    <div className="bg-foreground h-full w-[80%] rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Device Screen Viewport */}
              <div className="flex-1 overflow-hidden relative flex flex-col">
                {/* Embed header inside simulation */}
                {headerEl}
                
                {/* Main scrollable area */}
                <div className="flex-1 overflow-y-auto">
                  <main className="px-4 py-5 pb-24">{children}</main>
                </div>

                {/* Home Indicator bar */}
                <div className="absolute bottom-1.5 inset-x-0 h-4 flex items-center justify-center pointer-events-none z-50">
                  <div className="w-32 h-1 bg-foreground/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (variant === "tablet") {
    return (
      <>
        {/* Mobile: Fullscreen Layout */}
        <div className="block lg:hidden min-h-screen bg-background">
          {headerEl}
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </div>

        {/* Desktop: Tablet Showcase Layout */}
        <div className="hidden lg:flex min-h-screen items-center justify-center bg-slate-950 p-8 relative overflow-hidden select-none">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />

          <div className="flex flex-col items-center gap-5 relative z-10 w-full max-w-[1024px]">
            {/* Simulation Header */}
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full font-sans">
                Vista Conductor (Tablet)
              </span>
              <p className="text-[11px] text-muted-foreground mt-2 font-sans">
                Simulación del terminal de control de telemetría a bordo del bus
              </p>
            </div>

            {/* Tablet Mockup */}
            <div className="relative w-full aspect-[16/10] max-h-[720px] bg-background border-[16px] border-slate-900 dark:border-slate-800 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-4 ring-slate-800/30 overflow-hidden flex flex-col text-foreground select-text">
              {/* Camera dot */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-950 z-50 pointer-events-none" />

              {/* Status Bar */}
              <div className="flex h-10 shrink-0 items-end justify-between px-8 pb-1.5 text-[11px] font-bold text-foreground z-40 bg-card select-none">
                <span>10:42 AM</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-black bg-secondary px-2 py-0.5 rounded-md border border-border">GPS Enlazado</span>
                  {/* Cellular signal */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="16" width="3" height="4" rx="0.5" />
                    <rect x="7" y="12" width="3" height="8" rx="0.5" />
                    <rect x="12" y="8" width="3" height="12" rx="0.5" />
                    <rect x="17" y="4" width="3" height="16" rx="0.5" />
                  </svg>
                  {/* Wifi */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0" />
                  </svg>
                  {/* Battery */}
                  <div className="flex items-center border border-foreground/50 rounded-sm p-[1px] w-[20px] h-[10px]">
                    <div className="bg-foreground h-full w-[95%] rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Device Viewport */}
              <div className="flex-1 overflow-hidden relative flex flex-col">
                {/* Embed header inside simulation */}
                {headerEl}
                
                {/* Main scrollable area */}
                <div className="flex-1 overflow-y-auto">
                  <main className="px-6 py-6 pb-40">{children}</main>
                </div>

                {/* Home Indicator bar */}
                <div className="absolute bottom-1 inset-x-0 h-4 flex items-center justify-center pointer-events-none z-50">
                  <div className="w-40 h-1 bg-foreground/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Normal view for other roles
  return (
    <div className="min-h-screen bg-background">
      {headerEl}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}