import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/jaysi/Logo";
import { DEMO_ACCOUNTS, getAccount, registerAccount, roleHome, storeUser, type Role } from "@/lib/auth";
import { Mail, Lock, ArrowRight, User, ScanLine, Bus, MonitorPlay, BarChart3, Leaf, UserPlus } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Iniciar sesión · JAYSI" },
      { name: "description", content: "Inicia sesión en JAYSI según tu rol." },
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
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const acc = getAccount(email);
      if (!acc || acc.password !== password) {
        setError("Credenciales incorrectas. Prueba con una cuenta demo o regístrate.");
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
    <div className="min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] opacity-50"
        style={{ background: "var(--gradient-soft)" }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_1fr] lg:py-16">
        <div>
          <Link to="/"><Logo /></Link>
          <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary px-3 py-1 text-xs font-semibold text-primary">
            <Leaf className="h-3.5 w-3.5" /> Acceso seguro
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Inicia sesión y entra a tu <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">vista personalizada.</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            JAYSI detecta tu rol y te lleva directo al panel que necesitas: cliente, auxiliar, conductor, controlador o administrador.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cuentas demo · clic para entrar</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(DEMO_ACCOUNTS).map(([mail, { user }]) => {
                const Icon = roleIcons[user.role];
                return (
                  <button
                    key={mail}
                    onClick={() => quickLogin(mail)}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold capitalize text-foreground">{user.role}</div>
                        <div className="text-xs text-muted-foreground">{mail}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Contraseña para todas: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">demo</code></p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)] lg:sticky lg:top-10 lg:h-fit">
          <div className="flex gap-2 rounded-xl bg-secondary/60 p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >Iniciar sesión</button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >Crear cuenta</button>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-foreground">
            {mode === "login" ? "Bienvenido de nuevo" : "Únete a JAYSI"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Ingresa con tu correo y contraseña." : "Crea tu cuenta de cliente en segundos."}
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <FormField icon={User} label="Nombre completo" type="text" value={name} onChange={setName} placeholder="María López" />
            )}
            <FormField icon={Mail} label="Correo electrónico" type="email" value={email} onChange={setEmail} placeholder="cliente@jaysi.com" />
            <FormField icon={Lock} label="Contraseña" type="password" value={password} onChange={setPassword} placeholder={mode === "login" ? "demo" : "mínimo 4 caracteres"} />
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-elegant)]"
            >
              {mode === "login" ? (<>Iniciar sesión <ArrowRight className="h-4 w-4" /></>) : (<>Crear cuenta <UserPlus className="h-4 w-4" /></>)}
            </button>
          </form>
          <div className="mt-5 text-center text-xs text-muted-foreground">
            ¿No tienes cuenta? <Link to="/" className="font-semibold text-primary">Explora viajes como invitado</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  icon: Icon, label, type, value, onChange, placeholder,
}: { icon: any; label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 transition-colors focus-within:border-primary">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </div>
    </label>
  );
}