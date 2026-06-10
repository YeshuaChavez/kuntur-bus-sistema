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
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="María López" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="usuario@correo.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-semibold text-muted-foreground">Contraseña</label>
                      {mode === "login" && <a href="#" className="text-xs font-semibold text-primary hover:underline">¿Olvidaste tu contraseña?</a>}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" placeholder="••••••••" />
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
                  <button type="button" className="flex items-center justify-center gap-2 py-3.5 border border-border rounded-2xl hover:bg-secondary/50 transition-all active:scale-95">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd3lQhpag-beMpu8UdcMKtrJRHseSL0sGiASXUVxSoOphvUeIpd9-0fxqIH7g6Y9RzCEfrqfUjCqtTxT7Ii5i4N1cGG5i4SQqphShdsQqOkiinKOi2r1x39nGUuMMsAaeFLYlFb1UYJbhxvz8ExjaN0XihMVXxq-WV6a4Dy17yYlNlXmPLKMo8pfuaRcw0v_vpTGmxbScBl16cRhSNFK3lLGKfUujXgYF_1XCUMLMFsfWeWK5OyTJouMIswUOx9lwZVK3XnscdAQt_" alt="Google" className="w-5 h-5 opacity-90" />
                    <span className="font-semibold text-foreground text-sm">Google</span>
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 py-3.5 border border-border rounded-2xl hover:bg-secondary/50 transition-all active:scale-95 text-foreground">
                    <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 opacity-90"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
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