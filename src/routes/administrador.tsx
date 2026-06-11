import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RoleShell } from "@/components/kuntur/RoleShell";
import {
  TrendingUp, TrendingDown, DollarSign, Users, Bus, Percent, ArrowUpRight,
  Calendar, Plus, Pencil, Trash2, Sparkles, MapPin, ArrowRight, Save, X,
  BadgeCheck, BarChart3, Navigation, ShieldCheck, Download, Clock,
  AlertTriangle, MoreVertical, Search, ChevronLeft, ChevronRight, Gauge,
  Fuel, Zap, Wrench, Wallet, PieChart, CheckCircle2, ClipboardList,
  PlusCircle, Minus, Crosshair, AlertCircle, UserCheck, Phone,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/administrador")({
  head: () => ({
    meta: [
      { title: "Administrador · KUNTUR" },
      { name: "description", content: "Dashboard ejecutivo KUNTUR BI: resumen, operaciones, flota, personal y finanzas." },
    ],
  }),
  component: AdminView,
});

// ─── Shared data ────────────────────────────────────────────────────────────
const weekBars = [
  { day: "Lun", digital: 80, terminal: 60 },
  { day: "Mar", digital: 90, terminal: 55 },
  { day: "Mié", digital: 75, terminal: 70 },
  { day: "Jue", digital: 85, terminal: 65 },
  { day: "Vie", digital: 95, terminal: 50 },
  { day: "Hoy", digital: 100, terminal: 40 },
];

const monthBars = [62, 78, 54, 88, 92, 71, 84, 96, 82, 74, 88, 91];
const months = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const auditRows = [
  { id: "BUS-402", route: "Lima - Paracas",        declared: "S/ 1,240", audited: "S/ 1,240", gap: "S/ 0.00",   ok: true  },
  { id: "BUS-518", route: "Cusco - Puno",           declared: "S/ 2,450", audited: "S/ 2,280", gap: "S/ 170",   ok: false },
  { id: "BUS-331", route: "Arequipa - Juliaca",     declared: "S/ 1,890", audited: "S/ 1,890", gap: "S/ 0.00",  ok: true  },
  { id: "BUS-440", route: "Lima - Huancayo",        declared: "S/ 3,120", audited: "S/ 2,965", gap: "S/ 155",   ok: false },
];

const opsFleet = [
  { id: "BUS-402", driver: "Ricardo Alva",    dest: "Cusco (Terminal Terrestre)", time: "10:30 AM", status: "onroute"  as const, pax: 92 },
  { id: "BUS-105", driver: "Martha Sifuentes",dest: "Arequipa (Parada Norte)",    time: "10:45 AM", status: "delayed"  as const, pax: 78 },
  { id: "BUS-088", driver: "Julio Mendez",    dest: "Ica (Estación Central)",     time: "11:15 AM", status: "terminal" as const, pax: 45 },
];

const opsAlerts = [
  { type: "speed"       as const, title: "Exceso de Velocidad",         unit: "BUS-402", detail: "105 km/h en zona de 90 km/h (Km 124 Pan. Sur).", time: "Hace 2 min" },
  { type: "delay"       as const, title: "Retraso Operativo",           unit: "BUS-105", detail: "Retraso de 15 min por tráfico en Panamericana Sur.", time: "Hace 15 min" },
  { type: "maintenance" as const, title: "Aviso de Mantenimiento",      unit: "BUS-221", detail: "Revisión de frenos requerida al llegar a terminal Lima.", time: "Hace 45 min" },
  { type: "shift"       as const, title: "Cambio de Turno",             unit: "BUS-098", detail: "Conductor Carlos R. inició turno.", time: "Hace 1h" },
];

const fleetInventory = [
  { id: "BUS-402", model: "Marcopolo G8",  year: 2023, lastService: "12 Oct 2023", status: "operative" as const, fuel: 85 },
  { id: "BUS-395", model: "Scania Touring", year: 2022, lastService: "05 Nov 2023", status: "workshop"  as const, fuel: 15 },
  { id: "BUS-410", model: "Marcopolo G8",  year: 2024, lastService: "—",           status: "reserve"   as const, fuel: 98 },
  { id: "BUS-388", model: "Volvo B11R",    year: 2021, lastService: "20 Ago 2023", status: "operative" as const, fuel: 60 },
  { id: "BUS-405", model: "Marcopolo G8",  year: 2023, lastService: "15 Sep 2023", status: "operative" as const, fuel: 45 },
];

const personnel = [
  { id: "KT-8821", name: "Carlos Mendoza", role: "Conductor",      statusKey: "active",   statusLabel: "En Ruta",  performance: 94, perf: "Elite" },
  { id: "KT-9012", name: "Elena Rivas",    role: "Administrativo", statusKey: "working",  statusLabel: "Activo",   performance: 98, perf: "Excelencia" },
  { id: "KT-7734", name: "Roberto Díaz",   role: "Mecánico",       statusKey: "workshop", statusLabel: "Taller",   performance: 82, perf: "Regular" },
  { id: "KT-9110", name: "Lucía Torres",   role: "Conductor",      statusKey: "rest",     statusLabel: "Descanso", performance: 90, perf: "Muy Bueno" },
];

const shifts = [
  { name: "Carlos Mendoza", time: "06:00 AM", route: "Ruta Central: Est. Sur - Terminal A", unit: "KT-044", statusLabel: "A tiempo",   ok: true },
  { name: "Lucía Torres",   time: "07:30 AM", route: "Ruta Norte: Aeropuerto - Centro",     unit: "KT-102", statusLabel: "Check-in",   ok: true },
  { name: "Pendiente",      time: "08:15 AM", route: "Ruta Nocturna: Transbordador 14",     unit: "—",      statusLabel: "Sin asignar", ok: false },
];

const expenditures = [
  { vendor: "PetroPerú S.A.",         category: "Combustible",   amount: "S/ 12,400", date: "12 May 2024", paid: true  },
  { vendor: "Seguros Mapfre",         category: "Seguros",       amount: "S/ 4,500",  date: "10 May 2024", paid: true  },
  { vendor: "Taller Mecánico Express",category: "Mantenimiento", amount: "S/ 2,800",  date: "08 May 2024", paid: false },
];

const agencyRevenue = [
  { name: "Lima Central",    amount: "S/ 450,200", pct: 45, shade: "opacity-100" },
  { name: "Cusco Terminal",  amount: "S/ 320,100", pct: 32, shade: "opacity-80"  },
  { name: "Arequipa Norte",  amount: "S/ 230,200", pct: 23, shade: "opacity-60"  },
];

const settlements = [
  { initials: "RM", name: "Ricardo Mendoza", unit: "BUS-204", date: "15/05/2024", gross: "S/ 4,200", expenses: "S/ 850",   net: "S/ 3,350", settled: false },
  { initials: "AS", name: "Ana Salinas",     unit: "BUS-112", date: "15/05/2024", gross: "S/ 5,100", expenses: "S/ 1,100", net: "S/ 4,000", settled: true  },
  { initials: "JP", name: "Jorge Prado",     unit: "BUS-088", date: "14/05/2024", gross: "S/ 3,800", expenses: "S/ 450",   net: "S/ 3,350", settled: true  },
];

// ─── Types ──────────────────────────────────────────────────────────────────
type AdminTab = "resumen" | "operaciones" | "flota" | "personal" | "finanzas";

const ADMIN_TABS: { id: AdminTab; label: string; Icon: any }[] = [
  { id: "resumen",     label: "Resumen",     Icon: BarChart3 },
  { id: "operaciones", label: "Operaciones", Icon: Navigation },
  { id: "flota",       label: "Flota",       Icon: Bus },
  { id: "personal",    label: "Personal",    Icon: Users },
  { id: "finanzas",    label: "Finanzas",    Icon: DollarSign },
];

interface RouteRow {
  id: string; origin: string; destination: string; price: number; active: boolean;
}

// ─── Main View ───────────────────────────────────────────────────────────────
function AdminView() {
  const { user } = useAuth();
  const adminName = user?.role === "administrador" ? user.name : "Pedro Vargas";
  const [tab, setTab] = useState<AdminTab>("resumen");

  return (
    <RoleShell
      role="Administrador"
      rightSlot={
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground sm:inline-flex">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {adminName}
          </span>
          <button onClick={() => toast.info("Seleccionar período de reporte")} className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-all hover:bg-secondary sm:flex">
            <Calendar className="h-3.5 w-3.5" /> Oct 2026
          </button>
          <button onClick={() => toast.success("Exportando dashboard · PDF generado", { description: "El archivo llegará a tu carpeta de descargas en segundos." })} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-95">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
        </div>
      }
    >
      {/* Tab bar */}
      <div className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 rounded-2xl bg-secondary/40 p-1 w-fit">
        {ADMIN_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
              tab === id
                ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
        </div>
      </div>

      {tab === "resumen"     && <ResumenTab adminName={adminName} />}
      {tab === "operaciones" && <OperacionesTab />}
      {tab === "flota"       && <FlotaTab />}
      {tab === "personal"    && <PersonalTab />}
      {tab === "finanzas"    && <FinanzasTab />}
    </RoleShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 1 — RESUMEN (BI Dashboard)
// ══════════════════════════════════════════════════════════════════════════
function ResumenTab({ adminName }: { adminName: string }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hola, {adminName}</h1>
        <p className="text-sm text-muted-foreground">Dashboard ejecutivo · Oct 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryKpi Icon={DollarSign} label="Ingresos Consolidados" value="S/ 48,720"
          sub="+12.4% vs mes anterior" up />
        <SummaryKpi Icon={Percent} label="Factor de Ocupación" value="84%"
          sub={<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: "84%" }} /></div>} />
        <SummaryKpi Icon={CheckCircle2} label="Puntualidad OTP" value="89%"
          sub={<span className="flex items-center gap-1.5 text-primary"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Estado Óptimo</span>} />
        <SummaryKpi Icon={Bus} label="Disponibilidad Flota" value="92%"
          sub="115 / 125 Operativas" />
      </div>

      {/* Chart + Right panel */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Weekly bar chart */}
        <div className="rounded-[24px] border border-border bg-card p-7 shadow-[var(--shadow-card)]">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Recaudación por Canales</h3>
              <p className="text-sm text-muted-foreground">Tendencia semanal: Digital vs. Terminal</p>
            </div>
            <div className="flex gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Digital</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-sm bg-primary/30" /> Terminal</span>
            </div>
          </div>
          <div className="flex h-52 items-end justify-around gap-3">
            {weekBars.map((b) => (
              <div key={b.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end justify-center gap-1" style={{ height: "180px" }}>
                  <div className="w-1/2 rounded-t-lg bg-[image:var(--gradient-primary)] hover:brightness-110 transition-all" style={{ height: `${b.digital}%` }} />
                  <div className="w-1/2 rounded-t-lg bg-primary/25 hover:brightness-110 transition-all" style={{ height: `${b.terminal}%` }} />
                </div>
                <span className={cn("text-[11px] font-semibold", b.day === "Hoy" ? "text-primary font-bold" : "text-muted-foreground")}>{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Alert banner */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">2 Unidades con descuadres &gt; S/150</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Payment methods + top routes */}
          <div className="flex-1 rounded-[24px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Métodos de Pago</h4>
            <div className="mb-5 flex items-center gap-6">
              {/* Donut */}
              <div className="relative h-28 w-28 flex-shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#ebefed" strokeDasharray="100, 100" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#066448" strokeDasharray="45, 100" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#88d6b3" strokeDasharray="25, 100" strokeDashoffset="-45" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#cfe8db" strokeDasharray="30, 100" strokeDashoffset="-70" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">100%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {[["Yape/Plin", "45%"], ["Tarjeta", "25%"], ["Efectivo", "30%"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-bold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-foreground">Rutas Más Rentables</h4>
              <div className="space-y-3">
                {[
                  { r: "Lima - Paracas",       v: "S/ 12.4k", p: 95 },
                  { r: "Cusco - Valle Sagrado", v: "S/ 9.8k",  p: 78 },
                  { r: "Arequipa - Colca",      v: "S/ 7.2k",  p: 60 },
                ].map((item) => (
                  <div key={item.r}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-foreground">{item.r}</span>
                      <span className="font-bold text-foreground">{item.v}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${item.p}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit table */}
      <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Conciliación de Cajas y Peajes</h3>
            <p className="text-sm text-muted-foreground">Auditoría financiera en tiempo real</p>
          </div>
          <select className="rounded-xl border border-border bg-secondary/50 px-4 py-2 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
            <option>Todas las Sucursales</option>
            <option>Lima Central</option>
            <option>Arequipa Norte</option>
            <option>Cusco Matriz</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3">Ruta</th>
                <th className="px-6 py-3 text-right">Declarado</th>
                <th className="px-6 py-3 text-right">Auditado</th>
                <th className="px-6 py-3 text-right">Brecha</th>
                <th className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditRows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-secondary/20">
                  <td className="px-6 py-4 font-bold text-foreground">{r.id}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.route}</td>
                  <td className="px-6 py-4 text-right">{r.declared}</td>
                  <td className="px-6 py-4 text-right">{r.audited}</td>
                  <td className={cn("px-6 py-4 text-right font-bold", r.ok ? "text-primary" : "text-destructive")}>{r.gap}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold",
                      r.ok ? "border border-primary/20 bg-primary/10 text-primary" : "border border-destructive/20 bg-destructive/10 text-destructive"
                    )}>
                      {r.ok ? "Conciliado" : "Descuadre"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between bg-secondary/20 px-6 py-3 text-xs text-muted-foreground">
          <span>Mostrando 4 de 115 unidades analizadas</span>
          <div className="flex gap-1">
            <button className="rounded-lg p-1.5 hover:bg-secondary transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <button className="rounded-lg p-1.5 hover:bg-secondary transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <RoutesManager />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 2 — OPERACIONES
// ══════════════════════════════════════════════════════════════════════════
function OperacionesTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Consola de Operaciones</h1>
        <p className="text-sm text-muted-foreground">Monitoreo de flota y cumplimiento de itinerarios en tiempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi Icon={Bus} bg="bg-primary/10" color="text-primary" label="Buses en Ruta" value="42" sub="/ 50 totales" progress={84} />
        <AdminKpi Icon={UserCheck} bg="bg-secondary" color="text-secondary-foreground" label="Conductores Activos" value="38" sub="Turnos confirmados" success />
        <AdminKpi Icon={AlertTriangle} bg="bg-destructive/10" color="text-destructive" label="Retrasos Críticos" value="3" sub="Atención requerida" destructive />
        <AdminKpi Icon={Clock} bg="bg-secondary" color="text-secondary-foreground" label="Próximas Salidas (1h)" value="12" sub="Siguiente: Lima-Cusco 10:15" />
      </div>

      {/* Map + Alerts grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* SVG Map */}
        <div className="relative overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]" style={{ minHeight: "420px" }}>
          <div className="absolute left-4 top-4 z-10 rounded-2xl border border-border/50 bg-card/80 p-4 backdrop-blur-md">
            <h3 className="mb-2 text-sm font-bold text-foreground">Zonas de Operación</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Lima - Cusco (Alta densidad)</div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full bg-primary/50" /> Cusco - Arequipa</div>
            </div>
          </div>
          <div className="relative h-full min-h-[420px] bg-[#0f172a]">
            <img src="/map_peru_routes.png" alt="Mapa de Rutas Perú" className="absolute inset-0 h-full w-full object-cover opacity-75" />
            <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 800 420" fill="none">
              <path d="M0 210 Q200 100 400 210 T800 210" stroke="oklch(0.55 0.13 150)" strokeWidth="1.5" strokeDasharray="6 6" />
              <path d="M120 0 Q200 210 320 420" stroke="oklch(0.55 0.13 150)" strokeWidth="1.5" strokeDasharray="6 6" />
              <path d="M580 0 Q500 210 680 420" stroke="oklch(0.55 0.13 150)" strokeWidth="1.5" strokeDasharray="6 6" />
            </svg>
            <OpsCity x="12%" y="22%" name="Lima" />
            <OpsCity x="68%" y="18%" name="Trujillo" />
            <OpsCity x="32%" y="78%" name="Ica" />
            <OpsCity x="78%" y="68%" name="Arequipa" />
            <OpsCity x="52%" y="48%" name="Cusco" />
            <OpsPin x="22%" y="32%" id="BUS-402" status="onroute" />
            <OpsPin x="58%" y="40%" id="BUS-105" status="delayed" />
            <OpsPin x="40%" y="60%" id="BUS-088" status="onroute" />
            <OpsPin x="65%" y="55%" id="BUS-331" status="onroute" />
          </div>
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm hover:bg-secondary"><Plus className="h-4 w-4" /></button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm hover:bg-secondary"><Minus className="h-4 w-4" /></button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:brightness-110 mt-1"><Crosshair className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Alerts */}
        <div className="flex flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 p-5">
            <h3 className="font-bold text-foreground">Alertas Urgentes</h3>
            <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-black text-white">REAL-TIME</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {opsAlerts.map((a, i) => (
              <div key={i} className={cn("rounded-r-xl border-l-4 p-3",
                a.type === "speed"       ? "border-destructive bg-destructive/8" :
                a.type === "delay"       ? "border-secondary bg-secondary/20" :
                a.type === "maintenance" ? "border-muted-foreground bg-secondary/10 opacity-80" :
                                          "border-border bg-secondary/5 opacity-60"
              )}>
                <div className="mb-1 flex items-start justify-between">
                  <span className={cn("text-sm font-bold",
                    a.type === "speed" ? "text-destructive" : "text-foreground"
                  )}>{a.title}</span>
                  <span className="text-[10px] text-muted-foreground">{a.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">Unidad <strong className="text-foreground">{a.unit}</strong>: {a.detail}</p>
                {a.type === "speed" && (
                  <button onClick={() => toast.info("Llamando al conductor…", { duration: 3000 })} className="mt-2 text-xs font-semibold text-primary hover:underline">Contactar Conductor</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet table */}
      <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-bold text-foreground">Estado de Salidas y Arribos</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className="w-56 rounded-xl border border-border bg-secondary/50 pl-9 pr-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Buscar unidad..." />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Hora</th>
                <th className="px-5 py-3">Unidad</th>
                <th className="px-5 py-3">Conductor</th>
                <th className="px-5 py-3">Destino</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Ocupación</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opsFleet.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-secondary/20">
                  <td className="px-5 py-4 font-bold">{r.time}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{r.id}</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{r.driver}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.dest}</td>
                  <td className="px-5 py-4">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold",
                      r.status === "onroute"  ? "bg-primary/10 text-primary" :
                      r.status === "delayed"  ? "bg-destructive/10 text-destructive" :
                                               "bg-secondary text-muted-foreground"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full",
                        r.status === "onroute" ? "bg-primary" : r.status === "delayed" ? "bg-destructive" : "bg-muted-foreground"
                      )} />
                      {r.status === "onroute" ? "En Ruta" : r.status === "delayed" ? "Retrasado" : "En Terminal"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${r.pax}%` }} />
                      </div>
                      <span className="text-xs font-semibold">{r.pax}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toast.info(`Opciones para ${r.id}`)} className="text-muted-foreground hover:text-primary"><MoreVertical className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border p-4 text-center">
          <button onClick={() => toast.info("Cargando registros adicionales…")} className="text-sm font-bold text-primary hover:underline">Cargar más registros</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 3 — FLOTA
// ══════════════════════════════════════════════════════════════════════════
function FlotaTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Flota</h1>
          <p className="text-sm text-muted-foreground">Monitoreo operativo y mantenimiento preventivo</p>
        </div>
        <button onClick={() => toast.success("Mantenimiento programado · Unidad reservada en taller")} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-95">
          <PlusCircle className="h-4 w-4" /> Programar Mantenimiento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi Icon={Bus}         bg="bg-secondary"      color="text-secondary-foreground" label="Total Unidades"     value="125 buses" sub="+2 este mes" success />
        <AdminKpi Icon={CheckCircle2}bg="bg-primary/10"     color="text-primary"             label="Disponibilidad"     value="92%" sub="Meta: 90%" success />
        <AdminKpi Icon={Wrench}      bg="bg-destructive/10" color="text-destructive"          label="En Mantenimiento"   value="8 unidades" sub="Urgente" destructive />
        <AdminKpi Icon={Gauge}       bg="bg-secondary"      color="text-secondary-foreground" label="Kilometraje Prom."  value="12,450 km/mes" sub="Promedio flota" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Fleet table */}
        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="text-lg font-bold text-foreground">Inventario de Flota</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input className="w-48 rounded-xl border border-border bg-secondary/50 pl-9 pr-3 py-2 text-sm focus:border-primary outline-none" placeholder="Buscar unidad..." />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  {["Unidad","Modelo","Año","Últ. Manto.","Estado","Combustible"].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fleetInventory.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-5 py-4 font-bold text-primary">{f.id}</td>
                    <td className="px-5 py-4 text-foreground">{f.model}</td>
                    <td className="px-5 py-4 text-muted-foreground">{f.year}</td>
                    <td className="px-5 py-4 text-muted-foreground">{f.lastService}</td>
                    <td className="px-5 py-4">
                      <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold",
                        f.status === "operative" ? "bg-primary/10 text-primary" :
                        f.status === "workshop"  ? "bg-destructive/10 text-destructive" :
                                                   "bg-secondary text-muted-foreground"
                      )}>
                        {f.status === "operative" ? "Operativo" : f.status === "workshop" ? "En Taller" : "Reserva"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                        <div className={cn("h-full rounded-full", f.fuel < 20 ? "bg-destructive" : "bg-primary")} style={{ width: `${f.fuel}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border p-4 text-center">
            <button onClick={() => toast.info("Cargando inventario completo de flota…")} className="text-sm font-bold text-primary hover:underline">Ver todas las 125 unidades</button>
          </div>
        </div>

        {/* Right: health + AI */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[24px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">Salud Mecánica</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CircleGauge pct={90} label="Motor" />
              <CircleGauge pct={70} label="Frenos" />
              <CircleGauge pct={45} label="Neumáticos" warn />
              <CircleGauge pct={95} label="Sensores" />
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Alertas Críticas</span>
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-black uppercase text-destructive">2 Activas</span>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/8 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                  <div>
                    <p className="text-xs font-bold text-destructive">BUS-395: Presión Aceite</p>
                    <p className="text-[11px] text-muted-foreground">Revisión inmediata requerida.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-[image:var(--gradient-primary)] p-5 text-primary-foreground shadow-[var(--shadow-card)]">
            <div className="relative z-10">
              <h4 className="mb-2 text-lg font-bold">Optimización IA</h4>
              <p className="mb-4 text-sm opacity-90">Sistema sugiere rotar 5 unidades para equilibrar el desgaste de flota.</p>
              <button onClick={() => toast.success("IA analizando flota · 5 rotaciones sugeridas generadas")} className="rounded-xl bg-card px-4 py-2 text-xs font-bold text-primary transition-all hover:brightness-105 active:scale-95">
                Ver Recomendaciones
              </button>
            </div>
            <Zap className="absolute -bottom-3 -right-3 h-24 w-24 opacity-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 4 — PERSONAL
// ══════════════════════════════════════════════════════════════════════════
function PersonalTab() {
  const [roleFilter, setRoleFilter] = useState<"all" | "conductor" | "mecanico" | "admin">("all");

  const filtered = personnel.filter(p =>
    roleFilter === "all" ? true :
    roleFilter === "conductor" ? p.role === "Conductor" :
    roleFilter === "mecanico"  ? p.role === "Mecánico" :
                                  p.role === "Administrativo"
  );

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi Icon={Users}      bg="bg-secondary"      color="text-secondary-foreground" label="Total Colaboradores"  value="128" sub="Conductores, Mecánicos, Admins" />
        <AdminKpi Icon={UserCheck}  bg="bg-primary/10"     color="text-primary"             label="Conductores Activos"   value="92"  sub="Turnos confirmados" success />
        <AdminKpi Icon={ShieldCheck}bg="bg-secondary"      color="text-secondary-foreground" label="Índice de Seguridad"  value="96%" sub="Promedio general" success />
        <AdminKpi Icon={AlertCircle}bg="bg-destructive/10" color="text-destructive"          label="Ausentismo"           value="2.4%" sub="Últimos 30 días" destructive />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Directory table */}
        <div className="flex-grow overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-bold text-foreground">Directorio de Colaboradores</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input className="w-56 rounded-xl border border-border bg-secondary/50 pl-9 pr-3 py-2 text-sm focus:border-primary outline-none" placeholder="Buscar por nombre o ID..." />
                </div>
              </div>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center pr-1">Filtros:</span>
              {[
                { id: "all" as const, label: "Todos" },
                { id: "conductor" as const, label: "Conductores" },
                { id: "mecanico" as const, label: "Mecánicos" },
                { id: "admin" as const, label: "Administración" },
              ].map(f => (
                <button key={f.id} onClick={() => setRoleFilter(f.id)} className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                  roleFilter === f.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                )}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  {["Colaborador","Cargo","Estado","Desempeño","Acciones"].map(h => (
                    <th key={h} className={cn("px-6 py-3", h === "Acciones" && "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={p.id} className="group transition-colors hover:bg-secondary/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials}</div>
                          <div>
                            <p className="font-semibold text-foreground">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{p.role}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-2 w-2 rounded-full",
                            p.statusKey === "active"   ? "animate-pulse bg-primary" :
                            p.statusKey === "working"  ? "bg-secondary-foreground" :
                            p.statusKey === "workshop" ? "bg-muted-foreground" :
                                                          "bg-muted-foreground/50"
                          )} />
                          <span className={cn("text-sm font-medium",
                            p.statusKey === "active" ? "text-primary" : "text-muted-foreground"
                          )}>{p.statusLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${p.performance}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] font-bold text-primary">{p.performance}% {p.perf}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => toast.info(`Editando perfil de ${p.name}`)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => toast.info(`Más opciones para ${p.name}`)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><MoreVertical className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border p-5 text-xs text-muted-foreground">
            <span>Mostrando {filtered.length} de 128 colaboradores</span>
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-1.5 bg-secondary hover:bg-secondary/70 disabled:opacity-40" disabled><ChevronLeft className="h-4 w-4" /></button>
              <button className="h-8 w-8 rounded-lg bg-primary text-xs font-bold text-primary-foreground">1</button>
              <button onClick={() => toast.info("Página 2 · Cargando colaboradores…")} className="h-8 w-8 rounded-lg text-xs font-bold text-foreground hover:bg-secondary">2</button>
              <button onClick={() => toast.info("Página 3 · Cargando colaboradores…")} className="h-8 w-8 rounded-lg text-xs font-bold text-foreground hover:bg-secondary">3</button>
              <button onClick={() => toast.info("Página 2 · Cargando colaboradores…")} className="rounded-lg p-1.5 bg-secondary hover:bg-secondary/70"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Right: shifts + payroll */}
        <div className="w-full flex flex-col gap-4 lg:w-96">
          <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-border bg-secondary/20 p-5">
              <h3 className="font-bold text-foreground">Asignaciones de Hoy</h3>
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-[11px] font-bold text-primary">HOY</span>
            </div>
            <div className="p-5 space-y-5">
              {shifts.map((s, i) => {
                const initials = s.name === "Pendiente" ? "?" : s.name.split(" ").map(w => w[0]).join("").slice(0, 2);
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        s.ok ? "border-2 border-primary bg-primary/10 text-primary" : "border-2 border-border bg-secondary text-muted-foreground"
                      )}>{initials}</div>
                      {i < shifts.length - 1 && <div className="mt-1 w-0.5 flex-1 bg-border" />}
                    </div>
                    <div className={cn("flex-grow", i < shifts.length - 1 && "pb-5")}>
                      <div className="flex items-start justify-between">
                        <p className={cn("text-sm font-bold", !s.ok && "text-muted-foreground italic")}>{s.name}</p>
                        <span className="text-xs font-bold text-primary">{s.time}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Navigation className="h-3 w-3" /> {s.route}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        {s.unit !== "—" && <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Bus {s.unit}</span>}
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", s.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                          {s.statusLabel}
                        </span>
                      </div>
                      {!s.ok && (
                        <button onClick={() => toast.success("Conductor asignado al turno correctamente")} className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                          <PlusCircle className="h-3 w-3" /> Asignar ahora
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => toast.info("Calendario completo · Función disponible próximamente")} className="w-full border-t border-border p-4 text-sm font-bold text-primary transition-colors hover:bg-primary/5">
              Ver Calendario Completo
            </button>
          </div>

          <div className="rounded-[24px] bg-[image:var(--gradient-primary)] p-6 text-primary-foreground shadow-lg">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 opacity-80" />
              <h4 className="text-sm font-bold uppercase tracking-wide">Recordatorio de Nómina</h4>
            </div>
            <p className="mb-4 text-sm opacity-90">El cierre de mes es en 4 días. Valide las horas extra del personal administrativo.</p>
            <button onClick={() => toast.success("Redirigiendo a módulo de finanzas…")} className="w-full rounded-xl bg-card py-2 text-sm font-bold text-primary transition-all hover:brightness-105 active:scale-95">
              Ir a Finanzas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 5 — FINANZAS
// ══════════════════════════════════════════════════════════════════════════
function FinanzasTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión Financiera</h1>
          <p className="text-sm text-muted-foreground">Panel de control y auditoría de flujo de caja KUNTUR</p>
        </div>
        <button onClick={() => toast.success("Reporte generado · Descarga iniciada", { description: "El PDF llegará a tu carpeta de descargas en segundos." })} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-95">
          <Download className="h-4 w-4" /> Generar Reporte Mensual
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpi Icon={DollarSign} bg="bg-primary/10"     color="text-primary"             label="Ingresos Totales"     value="S/ 1,240,500" sub="+8.2% este mes" success />
        <AdminKpi Icon={PieChart}   bg="bg-secondary"      color="text-secondary-foreground" label="Margen Operativo"     value="24.5%"         sub="Sobre costos operativos" />
        <AdminKpi Icon={Fuel}       bg="bg-secondary"      color="text-secondary-foreground" label="Costos Combustible"   value="S/ 312,400"    sub="25% del presupuesto" />
        <AdminKpi Icon={Wallet}     bg="bg-secondary"      color="text-secondary-foreground" label="Efectivo en Caja"     value="S/ 85,200"     sub="Disponible hoy" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Left */}
        <div className="flex flex-col gap-4">
          {/* Cash flow chart */}
          <div className="rounded-[24px] border border-border bg-card p-7 shadow-[var(--shadow-card)]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Flujo de Caja Mensual</h3>
              <div className="flex gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Ingresos</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-sm bg-secondary-foreground/30" /> Gastos</span>
              </div>
            </div>
            <div className="flex h-52 items-end justify-between gap-3">
              {[
                { m: "Ene", ing: 60, gas: 40 }, { m: "Feb", ing: 75, gas: 35 },
                { m: "Mar", ing: 85, gas: 50 }, { m: "Abr", ing: 70, gas: 45 },
                { m: "May", ing: 95, gas: 60, active: true },
              ].map((b) => (
                <div key={b.m} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-end gap-1" style={{ height: "180px" }}>
                    <div className={cn("w-1/2 rounded-t-lg transition-all hover:brightness-110",
                      b.active ? "bg-[image:var(--gradient-primary)]" : "bg-primary/20"
                    )} style={{ height: `${b.ing}%` }} />
                    <div className="w-1/2 rounded-t-lg bg-secondary-foreground/15 transition-all hover:brightness-110" style={{ height: `${b.gas}%` }} />
                  </div>
                  <span className={cn("text-[11px] font-semibold", b.active ? "font-bold text-primary" : "text-muted-foreground")}>{b.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expenditures table */}
          <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="border-b border-border p-5">
              <h3 className="text-base font-bold text-foreground">Egresos Recientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {["Proveedor","Categoría","Monto","Fecha","Estado"].map(h => <th key={h} className="px-5 py-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenditures.map((e) => (
                    <tr key={e.vendor} className="transition-colors hover:bg-secondary/20">
                      <td className="px-5 py-4 font-semibold text-foreground">{e.vendor}</td>
                      <td className="px-5 py-4 text-muted-foreground">{e.category}</td>
                      <td className="px-5 py-4 text-foreground">{e.amount}</td>
                      <td className="px-5 py-4 text-muted-foreground">{e.date}</td>
                      <td className="px-5 py-4">
                        <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold",
                          e.paid ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        )}>{e.paid ? "Pagado" : "Pendiente"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          {/* Agency revenue */}
          <div className="rounded-[24px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="mb-5 text-base font-bold text-foreground">Recaudación por Agencia</h3>
            <div className="space-y-5">
              {agencyRevenue.map((a) => (
                <div key={a.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-foreground">{a.name}</span>
                    <span className="font-bold text-foreground">{a.amount} ({a.pct}%)</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full rounded-full bg-primary", a.shade)} style={{ width: `${a.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial alerts */}
          <div className="rounded-[24px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="text-base font-bold text-foreground">Alertas Financieras</h3>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-destructive/8 p-4">
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-bold text-destructive">Facturas Pendientes de Pago (4)</p>
                  <p className="mt-1 text-xs text-muted-foreground">Vencimiento detectado para proveedores de mantenimiento.</p>
                  <button onClick={() => toast.error("4 facturas vencidas · Contacta a los proveedores", { duration: 5000 })} className="mt-2 text-xs font-semibold text-destructive underline">Revisar facturas</button>
                </div>
              </div>
            </div>
          </div>

          {/* Audit banner */}
          <div className="relative overflow-hidden rounded-[24px] bg-[image:var(--gradient-primary)] p-6 text-primary-foreground shadow-[var(--shadow-card)]">
            <div className="relative z-10">
              <h4 className="mb-1 text-lg font-bold">Auditoría Trimestral</h4>
              <p className="text-sm opacity-90">Programada para el 30 de Junio. Asegure que todos los documentos estén liquidados.</p>
            </div>
            <TrendingUp className="absolute -bottom-3 -right-3 h-20 w-20 opacity-10" />
          </div>
        </div>
      </div>

      {/* Settlement table */}
      <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-lg font-bold text-foreground">Reporte de Liquidación de Conductores</h3>
          <div className="flex gap-1">
            <button onClick={() => toast.info("Buscar liquidación por conductor o unidad")} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Search className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Conductor","Unidad","Fecha","Recaudación Bruta","Gastos Declarados","Neto a Liquidar","Estado"].map(h => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settlements.map((s) => (
                <tr key={s.name} className="transition-colors hover:bg-secondary/20">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">{s.initials}</div>
                      {s.name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{s.unit}</td>
                  <td className="px-5 py-4 text-muted-foreground">{s.date}</td>
                  <td className="px-5 py-4 font-semibold">{s.gross}</td>
                  <td className="px-5 py-4 text-destructive">{s.expenses}</td>
                  <td className="px-5 py-4 font-bold text-primary">{s.net}</td>
                  <td className="px-5 py-4">
                    <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold",
                      s.settled ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    )}>{s.settled ? "Liquidado" : "Pendiente"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  Shared sub-components
// ══════════════════════════════════════════════════════════════════════════
function SummaryKpi({ Icon, label, value, sub, up }: {
  Icon: any; label: string; value: string; sub?: React.ReactNode; up?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">{value}</h2>
      </div>
      <div className="mt-3 text-xs">
        {typeof sub === "string" ? (
          <span className={cn("flex items-center gap-1 font-semibold", up !== undefined ? (up ? "text-primary" : "text-destructive") : "text-muted-foreground")}>
            {up !== undefined && (up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
            {sub}
          </span>
        ) : sub}
      </div>
    </div>
  );
}

function AdminKpi({ Icon, bg, color, label, value, sub, success, destructive, progress }: {
  Icon: any; bg: string; color: string; label: string; value: string; sub?: string;
  success?: boolean; destructive?: boolean; progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {success && <span className="text-xs font-bold text-primary"><TrendingUp className="h-3.5 w-3.5" /></span>}
        {destructive && <span className="text-xs font-bold text-destructive"><AlertTriangle className="h-3.5 w-3.5" /></span>}
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
      {sub && <p className="mt-1.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function CircleGauge({ pct, label, warn }: { pct: number; label: string; warn?: boolean }) {
  const r = 35;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-background p-4">
      <div className="relative mb-2 flex h-20 w-20 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="transparent" strokeWidth="6" className="stroke-secondary" />
          <circle cx="40" cy="40" r={r} fill="transparent" strokeWidth="6"
            strokeDasharray={`${circumference}`} strokeDashoffset={`${dashOffset}`}
            className={cn(warn ? "stroke-[var(--warning,#d97706)]" : "stroke-primary")}
            style={{ transition: "stroke-dashoffset 1s ease", strokeLinecap: "round" }} />
        </svg>
        <span className="absolute text-sm font-bold text-foreground">{pct}%</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function OpsCity({ x, y, name }: { x: string; y: string; name: string }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ left: x, top: y }}>
      <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {name}</div>
    </div>
  );
}

function OpsPin({ x, y, id, status }: { x: string; y: string; id: string; status: "onroute" | "delayed" }) {
  const bg = status === "onroute" ? "bg-primary" : "bg-destructive";
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
      <div className={cn("relative flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground shadow-md", bg)}>
        <Bus className="h-3.5 w-3.5" />
        <span className={cn("absolute -inset-1 animate-ping rounded-full opacity-30", bg)} />
      </div>
      <div className="mt-1 whitespace-nowrap rounded bg-card px-1.5 py-0.5 text-[9px] font-bold text-foreground shadow">{id}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  Routes Manager (unchanged from original)
// ══════════════════════════════════════════════════════════════════════════
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
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[image:var(--gradient-primary)] px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-soft)]">
          <Plus className="h-3.5 w-3.5" /> Nueva ruta
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="py-3">Ruta</th><th>Precio (S/)</th><th>Estado</th><th className="text-right">Acciones</th>
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
                  <input type="number" min={1} value={r.price}
                    onChange={(e) => updatePrice(r.id, Math.max(1, Number(e.target.value) || 0))}
                    className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm font-bold outline-none focus:border-primary" />
                </td>
                <td>
                  <button onClick={() => toggleActive(r.id)}
                    className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      r.active ? "bg-secondary text-[var(--success,#16a34a)]" : "bg-muted text-muted-foreground"
                    )}>
                    {r.active ? "Activa" : "Pausada"}
                  </button>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <button onClick={() => setEditing(r)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:border-primary hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeRoute(r.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:border-destructive hover:text-destructive">
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
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 grid gap-3">
          <Field label="Origen"       value={form.origin}      onChange={(v) => setForm({ ...form, origin: v })}      placeholder="Lima" />
          <Field label="Destino"      value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} placeholder="Trujillo" />
          <Field label="Precio (S/)"  value={String(form.price)} onChange={(v) => setForm({ ...form, price: Math.max(0, Number(v) || 0) })} placeholder="42" type="number" />
        </div>
        <button disabled={!valid} onClick={() => onSave(form)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] disabled:cursor-not-allowed disabled:opacity-40">
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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent text-base font-bold text-foreground outline-none" />
    </label>
  );
}
