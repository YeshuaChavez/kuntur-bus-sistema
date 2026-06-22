import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, storeUser } from "@/lib/auth";
import { getPurchases } from "@/lib/purchases";
import { Header, Footer } from "./index";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Mail, ShieldCheck, Edit2, Check, X, Bus, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil — KUNTUR" },
      { name: "description", content: "Administra tu cuenta y preferencias en KUNTUR." },
    ],
  }),
  component: PerfilPage,
});

const roleColors: Record<string, string> = {
  cliente:       "bg-primary/10 text-primary",
  conductor:     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  auxiliar:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  controlador:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  administrador: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};

function PerfilPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");
  const [tripCount, setTripCount] = useState(0);

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? "");

  // Password mock
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdVisible, setPwdVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/perfil" } });
      return;
    }
    if (user.role === "cliente") setTripCount(getPurchases(user.email).length);
  }, [user, navigate]);

  if (!user) return null;

  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const saveName = () => {
    if (!draftName.trim() || draftName.trim() === user.name) { setEditingName(false); return; }
    storeUser({ ...user, name: draftName.trim() });
    toast.success("Nombre actualizado");
    setEditingName(false);
  };

  const handlePwdChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 4) { toast.error("La contraseña debe tener al menos 4 caracteres"); return; }
    toast.success("Contraseña actualizada correctamente");
    setPwd("");
    setShowPwd(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="mx-auto max-w-3xl px-5 sm:px-8 pb-16 pt-14">
        {/* Page header */}
        <div className="mb-8">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">Tu cuenta</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Mi perfil</h1>
        </div>

        <div className="space-y-5">
          {/* Identity card */}
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-2xl font-extrabold text-primary-foreground shadow-[var(--shadow-soft)]">
                {initials}
              </div>

              <div className="flex-1 space-y-3">
                {/* Name row */}
                <div className="flex items-center gap-2">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                        className="rounded-xl border border-primary bg-background px-3 py-1.5 text-lg font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button onClick={saveName} className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:brightness-110">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setEditingName(false); setDraftName(user.name); }} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:bg-muted">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-extrabold text-foreground">{user.name}</h2>
                      <button
                        onClick={() => { setDraftName(user.name); setEditingName(true); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Info chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {user.email}
                  </span>
                  <span className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold capitalize", roleColors[user.role] ?? "bg-muted text-muted-foreground")}>
                    <ShieldCheck className="h-3.5 w-3.5" /> {user.role}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Miembro desde enero 2024
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats — solo clientes */}
          {user.role === "cliente" && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard icon={Bus} label="Viajes realizados" value={String(tripCount)} sub={tripCount === 0 ? "¡Compra tu primer pasaje!" : "en total"} />
              <StatCard icon={User} label="Tipo de cuenta" value="Cliente" sub="acceso completo" />
              <StatCard icon={ShieldCheck} label="Estado" value="Activa" sub="cuenta verificada" success />
            </div>
          )}

          {/* Quick links for clientes */}
          {user.role === "cliente" && tripCount > 0 && (
            <Link
              to={"/mis-viajes" as any}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Bus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Ver mis viajes</p>
                  <p className="text-xs text-muted-foreground">{tripCount} boleto{tripCount !== 1 ? "s" : ""} en tu historial</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}

          {/* Change password */}
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Cambiar contraseña</h3>
              </div>
              <button
                onClick={() => setShowPwd((v) => !v)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {showPwd ? "Cancelar" : "Cambiar"}
              </button>
            </div>

            {showPwd ? (
              <form onSubmit={handlePwdChange} className="space-y-3">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    type={pwdVisible ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="button" onClick={() => setPwdVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {pwdVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]">
                  Guardar contraseña
                </button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">••••••••</p>
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-[28px] border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="mb-1 text-sm font-bold text-destructive">Zona de peligro</h3>
            <p className="mb-4 text-xs text-muted-foreground">Estas acciones son irreversibles. Úsalas con precaución.</p>
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="rounded-xl border border-destructive/40 bg-background px-4 py-2 text-xs font-bold text-destructive transition hover:bg-destructive/10 active:scale-95"
            >
              Cerrar sesión en todos los dispositivos
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, success }: { icon: any; label: string; value: string; sub: string; success?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-extrabold", success ? "text-primary" : "text-foreground")}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
