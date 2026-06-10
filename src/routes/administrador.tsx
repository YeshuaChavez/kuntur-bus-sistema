import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RoleShell } from "@/components/kuntur/RoleShell";
import {
  TrendingUp, TrendingDown, DollarSign, Users, Bus, Percent, ArrowUpRight, Calendar,
  Plus, Pencil, Trash2, Sparkles, MapPin, ArrowRight, Save, X, BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/administrador")({
  head: () => ({
    meta: [
      { title: "Administrador · KUNTUR" },
      { name: "description", content: "Dashboard ejecutivo: KPIs, recaudación, ocupación y auditoría." },
    ],
  }),
  component: AdminView,
});

const kpis = [
  { icon: DollarSign, label: "Ingresos del día", value: "S/ 48,720", delta: "+12.4%", up: true },
  { icon: Percent, label: "Ocupación promedio", value: "84%", delta: "+3.1%", up: true },
  { icon: Users, label: "Pasajeros", value: "1,284", delta: "+8.7%", up: true },
  { icon: Bus, label: "Buses activos", value: "24/26", delta: "-2", up: false },
];

const bars = [62, 78, 54, 88, 92, 71, 84, 96, 82, 74, 88, 91];
const months = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function AdminView() {
  const { user } = useAuth();
  const adminName = user?.role === "administrador" ? user.name : "Pedro Vargas";
  return (
    <RoleShell
      role="Administrador"
      rightSlot={
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground sm:inline-flex">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {adminName}
          </span>
          <button className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground sm:flex">
            <Calendar className="h-3.5 w-3.5" /> Últimos 30 días
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hola, {adminName} 👋</h1>
          <p className="text-sm text-muted-foreground">Panel ejecutivo · 15 May 2026</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <k.icon className="h-5 w-5" />
                </div>
                <span
                  className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    k.up ? "bg-secondary text-[var(--success)]" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {k.delta}
                </span>
              </div>
              <div className="mt-4 text-3xl font-bold text-foreground">{k.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* Chart */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Recaudación mensual</h2>
                <p className="text-xs text-muted-foreground">Comparado con reportes operativos</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-primary" /> Recaudado</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-[var(--primary-glow)]/40" /> Reportado</span>
              </div>
            </div>
            <div className="mt-6 flex h-56 items-end justify-between gap-2">
              {bars.map((b, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full items-end justify-center" style={{ height: "180px" }}>
                    <div
                      className="w-full rounded-t-md bg-[var(--primary-glow)]/30"
                      style={{ height: `${Math.min(100, b + 6)}%` }}
                    />
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-[image:var(--gradient-primary)]"
                      style={{ height: `${b}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top routes */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold text-foreground">Rutas top</h2>
            <p className="text-xs text-muted-foreground">Ingresos del día</p>
            <div className="mt-5 space-y-4">
              {[
                { r: "Lima → Trujillo", v: "S/ 14,820", p: 92 },
                { r: "Lima → Arequipa", v: "S/ 11,400", p: 78 },
                { r: "Cusco → Puno", v: "S/ 8,210", p: 64 },
                { r: "Lima → Ica", v: "S/ 6,540", p: 48 },
                { r: "Trujillo → Piura", v: "S/ 4,120", p: 32 },
              ].map((r) => (
                <div key={r.r}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-foreground">{r.r}</span>
                    <span className="font-bold text-foreground">{r.v}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${r.p}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit table */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Auditoría reciente</h2>
              <p className="text-xs text-muted-foreground">Recaudación reportada vs. validada por sistema</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold text-primary">
              Ver todo <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3">Bus</th>
                  <th>Ruta</th>
                  <th>Reportado</th>
                  <th>Sistema</th>
                  <th>Diferencia</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  { b: "JY-104", r: "Lima → Trujillo", rep: "S/ 4,200", sys: "S/ 4,200", diff: "0", ok: true },
                  { b: "JY-211", r: "Lima → Arequipa", rep: "S/ 3,820", sys: "S/ 3,940", diff: "-S/ 120", ok: false },
                  { b: "JY-087", r: "Cusco → Puno", rep: "S/ 2,710", sys: "S/ 2,710", diff: "0", ok: true },
                  { b: "JY-156", r: "Trujillo → Lima", rep: "S/ 3,150", sys: "S/ 3,150", diff: "0", ok: true },
                ].map((row) => (
                  <tr key={row.b} className="border-b border-border last:border-0">
                    <td className="py-3 font-bold">{row.b}</td>
                    <td className="text-muted-foreground">{row.r}</td>
                    <td>{row.rep}</td>
                    <td>{row.sys}</td>
                    <td className={row.ok ? "text-muted-foreground" : "text-destructive font-semibold"}>{row.diff}</td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.ok
                            ? "bg-secondary text-[var(--success)]"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {row.ok ? "Conciliado" : "Revisar"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RoutesManager />
      </div>
    </RoleShell>
  );
}

/* ----------------------------- Routes Manager ----------------------------- */

interface RouteRow {
  id: string;
  origin: string;
  destination: string;
  price: number;
  active: boolean;
}

function RoutesManager() {
  const [routes, setRoutes] = useState<RouteRow[]>([
    { id: "r1", origin: "Lima",     destination: "Trujillo", price: 42, active: true },
    { id: "r2", origin: "Lima",     destination: "Arequipa", price: 65, active: true },
    { id: "r3", origin: "Cusco",    destination: "Puno",     price: 45, active: true },
    { id: "r4", origin: "Lima",     destination: "Ica",      price: 28, active: true },
    { id: "r5", origin: "Trujillo", destination: "Piura",    price: 42, active: false },
  ]);
  const [editing, setEditing] = useState<RouteRow | null>(null);
  const [creating, setCreating] = useState(false);

  const updatePrice = (id: string, price: number) =>
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, price } : r)));
  const toggleActive = (id: string) =>
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  const removeRoute = (id: string) => setRoutes((prev) => prev.filter((r) => r.id !== id));
  const saveRoute = (r: RouteRow) => {
    setRoutes((prev) => {
      const exists = prev.some((p) => p.id === r.id);
      return exists ? prev.map((p) => (p.id === r.id ? r : p)) : [...prev, r];
    });
    setEditing(null);
    setCreating(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Gestión de rutas y precios</h2>
          <p className="text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
            Las rutas se generan automáticamente · solo edita precios o crea variantes especiales.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[image:var(--gradient-primary)] px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-soft)]"
        >
          <Plus className="h-3.5 w-3.5" /> Nueva ruta
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="py-3">Ruta</th>
              <th>Precio (S/)</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            {routes.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2 font-bold">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {r.origin} <ArrowRight className="h-3 w-3 text-muted-foreground" /> {r.destination}
                  </div>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={r.price}
                    onChange={(e) => updatePrice(r.id, Math.max(1, Number(e.target.value) || 0))}
                    className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm font-bold text-foreground outline-none focus:border-primary"
                  />
                </td>
                <td>
                  <button
                    onClick={() => toggleActive(r.id)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      r.active
                        ? "bg-secondary text-[var(--success)]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.active ? "Activa" : "Pausada"}
                  </button>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => setEditing(r)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeRoute(r.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <RouteFormModal
          initial={editing ?? { id: `r${Date.now()}`, origin: "", destination: "", price: 30, active: true }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={saveRoute}
        />
      )}
    </div>
  );
}

function RouteFormModal({ initial, isNew, onClose, onSave }: {
  initial: RouteRow; isNew: boolean; onClose: () => void; onSave: (r: RouteRow) => void;
}) {
  const [form, setForm] = useState<RouteRow>(initial);
  const valid = form.origin.trim().length >= 2 && form.destination.trim().length >= 2 && form.price > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">{isNew ? "Crear ruta" : "Editar ruta"}</h3>
            <p className="text-xs text-muted-foreground">Ajusta origen, destino y tarifa.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          <Field label="Origen" value={form.origin} onChange={(v) => setForm({ ...form, origin: v })} placeholder="Lima" />
          <Field label="Destino" value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} placeholder="Trujillo" />
          <Field label="Precio (S/)" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Math.max(0, Number(v) || 0) })} placeholder="42" type="number" />
        </div>
        <button
          disabled={!valid}
          onClick={() => onSave(form)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save className="h-4 w-4" /> Guardar
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-background px-3.5 py-2.5 transition-colors focus-within:border-primary">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-base font-bold text-foreground outline-none"
      />
    </label>
  );
}