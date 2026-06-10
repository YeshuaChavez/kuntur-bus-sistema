import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/kuntur/Logo";
import { DEMO_ACCOUNTS, getAccount, registerAccount, roleHome, storeUser, type Role } from "@/lib/auth";
import { Mail, Lock, ArrowRight, User, ScanLine, Bus, MonitorPlay, BarChart3, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Iniciar sesión · KUNTUR" },
      { name: "description", content: "Inicia sesión en KUNTUR según tu rol." },
    ],
  }),
  component: LoginPage,
});

const roleIcons: Record<Role, any> = {
  cliente: User,
  auxiliar: ScanLine,
  conductor: Bus,
  controlador: MonitorPlay,
  administrador: BarChart3,
};

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [tab, setTab] = useState<"pasajeros" | "corporativo">("pasajeros");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const acc = getAccount(email);
      if (!acc || acc.password !== password) {
        setError("Credenciales incorrectas. Verifica tus datos o prueba el acceso corporativo.");
        return;
      }
      storeUser(acc.user);
      navigate({ to: redirect ?? roleHome(acc.user.role) });
    } else {
      const res = registerAccount({ name, email, password, role: "cliente" });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      storeUser(res.user);
      navigate({ to: redirect ?? roleHome(res.user.role) });
    }
  };

  const quickLogin = (mail: string) => {
    const acc = DEMO_ACCOUNTS[mail];
    storeUser(acc.user);
    navigate({ to: redirect ?? roleHome(acc.user.role) });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <main className="flex-grow flex flex-col md:flex-row min-h-screen">
        {/* Panel Izquierdo: Marketing (Oculto en móviles pequeños, o mostrado arriba) */}
        <section className="w-full md:w-1/2 bg-card p-8 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
          <div className="max-w-xl mx-auto space-y-8">
            <header>
              <div className="mb-6 scale-125 origin-left">
                 <Link to="/"><Logo /></Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight tracking-tight">
                Bienvenido a KUNTUR
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                El futuro del transporte inteligente en el Perú. Compra pasajes, monitorea flotas y viaja seguro con la red de movilidad más avanzada del país.
              </p>
            </header>

            {/* Bento Grid / Marketing Images */}
            <div className="grid grid-cols-2 gap-4 h-[350px] md:h-[400px]">
              <div className="relative group overflow-hidden rounded-3xl col-span-1 row-span-2 shadow-sm">
                <img src="/lima.png" alt="Lima" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/50">
                  <span className="text-sm text-primary font-bold">Costa Central - Lima</span>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-3xl col-span-1 shadow-sm">
                <img src="/arequipa.png" alt="Arequipa" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/50">
                  <span className="text-xs text-primary font-bold">Arequipa</span>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-3xl col-span-1 shadow-sm">
                <img src="/cusco.png" alt="Cusco" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/50">
                  <span className="text-xs text-primary font-bold">Cusco</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4 hidden md:flex">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold text-foreground">JP</div>
                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">MA</div>
                <div className="w-10 h-10 rounded-full border-2 border-background bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">RC</div>
              </div>
              <span className="text-sm font-medium text-muted-foreground italic">+10,000 usuarios confían en nosotros</span>
            </div>
          </div>
        </section>

        {/* Panel Derecho: Login Form */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background relative overflow-hidden">
          {/* Fondo gradiente sutil */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-full opacity-30" style={{ background: "var(--gradient-soft)" }} />
          
          <div className="w-full max-w-[480px] bg-card rounded-3xl p-8 md:p-12 shadow-[var(--shadow-elegant)] relative z-10 border border-border/50">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Ingresar a tu cuenta</h2>
              <p className="text-muted-foreground">Gestiona tus viajes y operaciones en un solo lugar.</p>
            </div>

            {/* Tab Selector */}
            <div className="flex p-1.5 bg-secondary/50 rounded-2xl mb-8">
              <button 
                onClick={() => setTab("pasajeros")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${tab === "pasajeros" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Pasajeros
              </button>
              <button 
                onClick={() => setTab("corporativo")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${tab === "corporativo" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Acceso Corporativo
              </button>
            </div>

            {tab === "pasajeros" ? (
              <>
                <div className="flex justify-center mb-6">
                   <button 
                     onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                     className="text-sm font-medium text-primary hover:underline"
                   >
                     {mode === "login" ? "¿No tienes cuenta? Regístrate aquí" : "Ya tengo cuenta. Iniciar sesión"}
                   </button>
                </div>
                
                <form onSubmit={submit} className="space-y-5">
                  {mode === "register" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground ml-1">Nombre completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input required type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="María López" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="usuario@correo.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-semibold text-muted-foreground">Contraseña</label>
                      {mode === "login" && <a href="#" className="text-xs font-semibold text-primary hover:underline">¿Olvidaste tu contraseña?</a>}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input required type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive text-center">
                      {error}
                    </div>
                  )}

                  <button type="submit" className="w-full py-4 mt-2 bg-[image:var(--gradient-primary)] text-primary-foreground font-bold text-lg rounded-2xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elegant)] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                    {mode === "login" ? "Iniciar sesión" : "Crear cuenta"} <ArrowRight className="h-5 w-5" />
                  </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                  <div className="flex-grow h-px bg-border"></div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">O continúa con</span>
                  <div className="flex-grow h-px bg-border"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" className="flex items-center justify-center gap-2 py-3.5 border border-border rounded-2xl bg-background hover:bg-secondary/50 transition-all active:scale-95">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="font-semibold text-foreground text-sm">Google</span>
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 py-3.5 border border-border rounded-2xl bg-background hover:bg-secondary/50 transition-all active:scale-95 text-foreground">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-80 flex-shrink-0" aria-hidden>
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="font-semibold text-foreground text-sm">Apple</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-3">
                  {Object.entries(DEMO_ACCOUNTS).filter(([mail]) => mail !== "cliente@kuntur.com").map(([mail, { user }]) => {
                    const Icon = roleIcons[user.role];
                    return (
                      <button
                        key={mail}
                        onClick={() => quickLogin(mail)}
                        className="flex w-full items-center justify-between rounded-2xl border border-border bg-background p-4 text-left transition-all hover:border-primary/40 hover:bg-secondary/50 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary group-hover:scale-110 transition-transform">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold capitalize text-foreground">{user.role}</div>
                            <div className="text-xs text-muted-foreground">{mail}</div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 md:px-12 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-bold text-foreground">KUNTUR</span>
            <p className="text-xs text-muted-foreground">© 2026 Kuntur Smart Transport S.A. Todos los derechos reservados.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Términos de servicio</a>
            <a href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Soporte</a>
            <a href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}