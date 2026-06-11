import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { RoleShell } from "@/components/kuntur/RoleShell";
import {
  Bus, MapPin, Search, AlertCircle, Phone, BadgeCheck, Headset,
  History, CheckCircle2, Clock, CalendarClock, Fuel, Gauge,
  ArrowRight, AlertTriangle, MoreVertical, PlusCircle,
  Package, ClipboardList, MessageSquare, RefreshCw, Zap, Wrench,
  Navigation, Bell, AlertOctagon, CheckCircle, Map, Filter,
  Plus, Minus, Crosshair, TrendingUp, Shield, BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/controlador")({
  head: () => ({
    meta: [
      { title: "Controlador · KUNTUR" },
      { name: "description", content: "Torre de control: monitoreo, rutas, alertas y taller." },
    ],
  }),
  component: ControladorView,
});

// ─── Data ──────────────────────────────────────────────────────────────────
const fleet = [
  { id: "JY-104", route: "Lima → Trujillo",   driver: "C. Mendoza", driverPhone: "+51 998 100 104", aux: "L. Ramírez", auxPhone: "+51 998 200 104", eta: "11:45", scheduled: "11:45", status: "ontime" as const },
  { id: "JY-211", route: "Lima → Arequipa",   driver: "R. Quispe",  driverPhone: "+51 998 100 211", aux: "S. Paredes", auxPhone: "+51 998 200 211", eta: "18:20", scheduled: "18:00", status: "delay"  as const },
  { id: "JY-087", route: "Cusco → Puno",      driver: "J. Flores",  driverPhone: "+51 998 100 087", aux: "K. Huamán", auxPhone: "+51 998 200 087", eta: "14:10", scheduled: "14:00", status: "ontime" as const },
  { id: "JY-156", route: "Trujillo → Lima",   driver: "M. Vega",    driverPhone: "+51 998 100 156", aux: "D. Castro", auxPhone: "+51 998 200 156", eta: "20:30", scheduled: "20:00", status: "delay"  as const },
  { id: "JY-302", route: "Lima → Ica",        driver: "P. Soto",    driverPhone: "+51 998 100 302", aux: "E. Tello",  auxPhone: "+51 998 200 302", eta: "09:45", scheduled: "09:45", status: "ontime" as const },
];

const completedTrips = [
  { id: "JY-099", route: "Lima → Chiclayo",  driver: "C. Mendoza", departed: "Hoy · 04:30",   arrived: "Hoy · 14:05",   pax: 42, status: "ontime" as const },
  { id: "JY-188", route: "Arequipa → Lima",  driver: "R. Quispe",  departed: "Hoy · 02:15",   arrived: "Hoy · 18:40",   pax: 38, status: "delay"  as const },
  { id: "JY-077", route: "Cusco → Lima",     driver: "J. Flores",  departed: "Ayer · 22:00",  arrived: "Hoy · 12:30",   pax: 44, status: "ontime" as const },
  { id: "JY-145", route: "Piura → Trujillo", driver: "M. Vega",    departed: "Ayer · 20:15",  arrived: "Hoy · 03:50",   pax: 36, status: "ontime" as const },
  { id: "JY-221", route: "Tacna → Arequipa", driver: "P. Soto",    departed: "Ayer · 18:00",  arrived: "Ayer · 23:45",  pax: 40, status: "delay"  as const },
];

const upcomingTrips = [
  { id: "JY-410", route: "Lima → Huancayo",  driver: "C. Mendoza", departs: "Hoy · 21:00",    countdown: "en 35 min",   pax: 28, gate: "A3" },
  { id: "JY-415", route: "Lima → Trujillo",  driver: "R. Quispe",  departs: "Hoy · 22:30",    countdown: "en 2h 05m",   pax: 41, gate: "B1" },
  { id: "JY-418", route: "Lima → Arequipa",  driver: "J. Flores",  departs: "Mañana · 05:15", countdown: "en 8h",       pax: 33, gate: "C2" },
  { id: "JY-422", route: "Cusco → Puno",     driver: "M. Vega",    departs: "Mañana · 07:00", countdown: "en 9h 45m",   pax: 25, gate: "A1" },
];

const activeRoutes = [
  { id: "SRV-402", from: "Lima",  to: "Trujillo", unit: "KT-402", type: "Express",  status: "active"    as const, eta: "14:45", speed: 82,  traffic: "clear"    as const },
  { id: "SRV-311", from: "Lima",  to: "Chimbote", unit: "KT-115", type: "Estándar", status: "scheduled" as const, start: "19:00", distance: 420, traffic: "moderate" as const },
  { id: "SRV-189", from: "Lima",  to: "Arequipa", unit: "KT-009", type: "Premium",  status: "active"    as const, eta: "21:30", speed: 76,  traffic: "clear"    as const },
];

const alerts = [
  { id: "JY-104", type: "sos"        as const, title: "SOS: Botón de Pánico",           location: "Av. Central 450, San Isidro, Lima",          time: "Hace 2 min",  priority: 1 },
  { id: "KU-502", type: "mechanical" as const, title: "Falla Mecánica: Presión Aceite", location: "Km 24 Panamericana Sur, Villa el Salvador",  time: "Hace 15 min", priority: 2 },
  { id: "TR-882", type: "delay"      as const, title: "Retraso: Congestión Alta",        location: "Av. Arequipa Cdra 12, Lince",                time: "Hace 25 min", priority: 3 },
];

const repairs = [
  { unit: "KTR-202", type: "urgent"  as const, desc: "Cambio de Frenos Hidráulicos", mechanic: "Carlos R.", progress: 75 },
  { unit: "KTR-115", type: "routine" as const, desc: "Alineación y Balanceo",         mechanic: "Elena M.",  progress: 40 },
  { unit: "KTR-088", type: "urgent"  as const, desc: "Falla en Transmisión",           mechanic: "Jorge G.",  progress: 15 },
  { unit: "KTR-250", type: "routine" as const, desc: "Cambio de Aceite y Filtros",     mechanic: "Sonia L.",  progress: 90 },
];

const inventory = [
  { name: "Frenos (Sets)",     count: 24, pct: 60, low: false },
  { name: "Aceites (Galones)", count: 8,  pct: 15, low: true  },
  { name: "Neumáticos",        count: 42, pct: 85, low: false },
];

const preventive = [
  { unit: "KTR-155", task: "Revisión de 50,000 km" },
  { unit: "KTR-089", task: "Cambio de Aceite" },
];

// ─── Types ─────────────────────────────────────────────────────────────────
type TabId = "monitoreo" | "rutas" | "alertas" | "taller";

const TABS: { id: TabId; label: string; Icon: any }[] = [
  { id: "monitoreo", label: "Monitoreo", Icon: Navigation },
  { id: "rutas",     label: "Rutas",     Icon: Map },
  { id: "alertas",   label: "Alertas",   Icon: Bell },
  { id: "taller",    label: "Taller",    Icon: Wrench },
];

// ─── Main View ─────────────────────────────────────────────────────────────
function ControladorView() {
  const { user } = useAuth();
  const ctrlName = user?.role === "controlador" ? user.name : "Ana Torres";
  const [tab, setTab] = useState<TabId>("monitoreo");
  const criticalCount = alerts.filter(a => a.type === "sos").length;

  return (
    <RoleShell
      role="Controlador"
      rightSlot={
        <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground sm:inline-flex">
          <Headset className="h-3.5 w-3.5 text-primary" /> {ctrlName}
        </span>
      }
    >
      {/* Tab bar */}
      <div className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 rounded-2xl bg-secondary/40 p-1 w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
              tab === id
                ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === "alertas" && criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-white ring-2 ring-card">
                {criticalCount}
              </span>
            )}
          </button>
        ))}
        </div>
      </div>

      {tab === "monitoreo" && <MonitoreoTab />}
      {tab === "rutas"     && <RutasTab />}
      {tab === "alertas"   && <AlertasTab />}
      {tab === "taller"    && <TallerTab />}
    </RoleShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 1 — MONITOREO
// ══════════════════════════════════════════════════════════════════════════
function MonitoreoTab() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Dynamically import Leaflet to prevent SSR errors
    import("leaflet").then((L) => {
      if (mapInstance.current) return;

      const map = L.map(mapRef.current!, {
        center: [-11.0, -75.0],
        zoom: 6,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      mapInstance.current = map;

      // Dark theme CartoDB layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20
      }).addTo(map);

      // Custom DivIcons
      const cityIcon = (name: string) => L.divIcon({
        className: "custom-city-icon",
        html: `
          <div class="flex items-center gap-1.5 whitespace-nowrap">
            <div class="w-2.5 h-2.5 rounded-full bg-white border-2 border-[oklch(0.55_0.13_150)] shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
            <span class="text-[10px] font-bold text-white uppercase tracking-wider bg-slate-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10 select-none">${name}</span>
          </div>
        `,
        iconSize: [120, 20],
        iconAnchor: [5, 10]
      });

      const busIcon = (id: string, status: "ontime" | "delay" | "alert") => {
        const colorClass = status === "ontime" 
          ? "bg-primary text-primary-foreground border-primary shadow-primary/40" 
          : status === "delay" 
          ? "bg-[var(--warning)] text-white border-[var(--warning)] shadow-[var(--warning)]/40"
          : "bg-destructive text-destructive-foreground border-destructive shadow-destructive/40";
        return L.divIcon({
          className: "custom-bus-icon",
          html: `
            <div class="flex flex-col items-center">
              <div class="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider shadow-lg ${colorClass} transition-all duration-300 transform hover:scale-110">
                <svg class="h-2.5 w-2.5 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="6" y1="21" x2="6" y2="17"></line>
                  <line x1="18" y1="21" x2="18" y2="17"></line>
                  <path d="M4 17h16"></path>
                </svg>
                <span>${id}</span>
              </div>
              <div class="w-1.5 h-1.5 rounded-full bg-white border border-black/40 mt-0.5"></div>
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 25]
        });
      };

      // Coordinates
      const citiesCoords: Record<string, [number, number]> = {
        Lima: [-12.046374, -77.042793],
        Trujillo: [-8.11599, -79.02998],
        Ica: [-14.06777, -75.72858],
        Arequipa: [-16.409047, -71.537451],
        Cusco: [-13.53195, -71.96746],
        Puno: [-15.84, -70.02],
        Piura: [-5.19449, -80.63282]
      };

      // Add city markers
      Object.entries(citiesCoords).forEach(([name, coords]) => {
        L.marker(coords, { icon: cityIcon(name) }).addTo(map);
      });

      // Draw routes
      const routes = [
        [citiesCoords.Piura, citiesCoords.Trujillo],
        [citiesCoords.Trujillo, citiesCoords.Lima],
        [citiesCoords.Lima, citiesCoords.Ica, citiesCoords.Arequipa],
        [citiesCoords.Arequipa, citiesCoords.Cusco, citiesCoords.Puno]
      ];

      routes.forEach((route) => {
        L.polyline(route, {
          color: "oklch(0.78 0.13 160)",
          weight: 5,
          opacity: 0.12
        }).addTo(map);

        L.polyline(route, {
          color: "oklch(0.55 0.13 150)",
          weight: 1.5,
          opacity: 0.6,
          dashArray: "3 6"
        }).addTo(map);
      });

      // Active buses
      const buses = [
        { id: "JY-104", coords: [-10.08, -78.03] as [number, number], status: "ontime" as const, route: "Lima → Trujillo", driver: "C. Mendoza" },
        { id: "JY-211", coords: [-14.22, -74.28] as [number, number], status: "delay" as const, route: "Lima → Arequipa", driver: "R. Quispe" },
        { id: "JY-087", coords: [-14.68, -70.99] as [number, number], status: "ontime" as const, route: "Cusco → Puno", driver: "J. Flores" },
        { id: "JY-156", coords: [-9.5, -78.5] as [number, number], status: "delay" as const, route: "Trujillo → Lima", driver: "M. Vega" },
        { id: "JY-302", coords: [-13.0, -76.3] as [number, number], status: "ontime" as const, route: "Lima → Ica", driver: "P. Soto" }
      ];

      buses.forEach((b) => {
        const marker = L.marker(b.coords, { icon: busIcon(b.id, b.status) }).addTo(map);
        marker.bindPopup(`
          <div class="p-1 text-[11px] leading-relaxed">
            <h4 class="font-bold text-foreground mb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full ${b.status === "ontime" ? "bg-primary" : "bg-orange-500"}"></span>
              Bus ${b.id}
            </h4>
            <p class="text-muted-foreground m-0"><strong>Ruta:</strong> ${b.route}</p>
            <p class="text-muted-foreground m-0"><strong>Conductor:</strong> ${b.driver}</p>
            <p class="text-muted-foreground m-0"><strong>Estado:</strong> ${b.status === "ontime" ? "A tiempo" : "Con retraso"}</p>
          </div>
        `, {
          closeButton: false,
          className: "custom-leaflet-popup"
        });
      });

      // Zoom controller manually positioned
      L.control.zoom({
        position: "bottomright"
      }).addTo(map);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        .leaflet-container {
          background: #0f172a !important;
          border-radius: 24px;
        }
        .custom-city-icon {
          background: transparent;
          border: none;
        }
        .custom-bus-icon {
          background: transparent;
          border: none;
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: #1e293b !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: #1e293b !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-bar a:hover {
          background-color: #334155 !important;
        }
      `}</style>
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard Icon={Fuel}     bg="bg-primary/10"    color="text-primary"             label="Combustible Prom." value="84.2%" />
        <KpiCard Icon={Gauge}    bg="bg-secondary"     color="text-secondary-foreground" label="Velocidad Prom."   value="78 km/h" />
        <KpiCard Icon={Bus}      bg="bg-primary/10"    color="text-primary"             label="Flota en Ruta"     value="24 / 30" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Left: map + departures */}
        <div className="flex flex-col gap-4">
          {/* Map */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Torre de Control</h1>
                  <p className="text-xs text-muted-foreground">Actualizado en vivo · 24 buses activos</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <MapLegend color="bg-primary"     label="A tiempo" />
                  <MapLegend color="bg-[var(--warning)]" label="Retraso" />
                  <MapLegend color="bg-destructive"  label="Alerta" />
                </div>
              </div>
            </div>

            {/* Live badge */}
            <div className="absolute left-4 top-20 z-10 flex items-center gap-2 rounded-2xl border border-border/50 bg-card/80 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur-md">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
              <span className="text-primary">TRÁFICO EN VIVO</span>
              <span className="text-muted-foreground">· Costa Norte</span>
            </div>

            <div ref={mapRef} className="relative h-[420px] w-full" style={{ zIndex: 1 }} />
          </div>

          {/* Departures table */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Próximas Salidas</h2>
              <button onClick={() => toast.info("Mostrando todas las salidas del día")} className="text-xs font-semibold text-primary hover:underline">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <th className="pb-2 pr-4">Hora</th>
                    <th className="pb-2 pr-4">Destino</th>
                    <th className="pb-2 pr-4">Unidad</th>
                    <th className="pb-2 pr-4 text-center">Andén</th>
                    <th className="pb-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {upcomingTrips.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-secondary/30">
                      <td className="py-2.5 pr-4 font-semibold">{t.departs.split("·")[1]?.trim()}</td>
                      <td className="py-2.5 pr-4 text-foreground">{t.route.split("→")[1]?.trim()}</td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{t.id}</td>
                      <td className="py-2.5 pr-4 text-center">
                        <span className="rounded-lg bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">{t.gate}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">{t.countdown}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: unit status */}
        <aside className="flex flex-col rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between rounded-t-3xl border-b border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Estado de Unidades</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{fleet.length} activos</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {fleet.map((b) => <UnitCard key={b.id} unit={b} />)}
          </div>
          <div className="rounded-b-3xl bg-secondary/30 p-4">
            <button onClick={() => toast.success("Ruta asignada correctamente · Conductor notificado")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-[0.98]">
              <PlusCircle className="h-4 w-4" /> Asignar Nueva Ruta
            </button>
          </div>
        </aside>
      </div>

      {/* History */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary"><History className="h-4 w-4" /></div>
              <div>
                <h2 className="text-base font-bold text-foreground">Historial de viajes</h2>
                <p className="text-[11px] text-muted-foreground">Viajes recientes finalizados</p>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">{completedTrips.length} terminados</span>
          </div>
          <div className="space-y-2">
            {completedTrips.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={cn("h-4 w-4", t.status === "ontime" ? "text-primary" : "text-[var(--warning-foreground)]")} />
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                        <Bus className="h-3.5 w-3.5 text-muted-foreground" /> {t.id}
                      </div>
                      <div className="text-xs text-muted-foreground">{t.route} · {t.driver}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-foreground">{t.pax} pax</div>
                    <div className={cn("text-[10px] font-medium", t.status === "delay" ? "text-[var(--warning-foreground)]" : "text-primary")}>
                      {t.status === "ontime" ? "A tiempo" : "Con retraso"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <span>Salió: <strong className="text-foreground">{t.departed}</strong></span>
                  <span>Llegó: <strong className="text-foreground">{t.arrived}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary"><CalendarClock className="h-4 w-4" /></div>
              <div>
                <h2 className="text-base font-bold text-foreground">Próximos a comenzar</h2>
                <p className="text-[11px] text-muted-foreground">Salidas programadas</p>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">{upcomingTrips.length} en cola</span>
          </div>
          <div className="space-y-2">
            {upcomingTrips.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Clock className="h-4 w-4" /></div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                        <Bus className="h-3.5 w-3.5 text-muted-foreground" /> {t.id}
                        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase text-secondary-foreground">Puerta {t.gate}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{t.route} · {t.driver}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">{t.departs.split("·")[1]?.trim()}</div>
                    <div className="text-[10px] font-medium text-primary">{t.countdown}</div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <span>{t.departs}</span>
                  <span><strong className="text-foreground">{t.pax}</strong> pasajeros</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 2 — RUTAS
// ══════════════════════════════════════════════════════════════════════════
function RutasTab() {
  const [filter, setFilter] = useState<"all" | "active" | "scheduled">("all");

  const filtered = activeRoutes.filter(r =>
    filter === "all" ? true : filter === "active" ? r.status === "active" : r.status === "scheduled"
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Filter sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="rounded-[24px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 text-sm font-bold text-primary">Filtros de Red</h3>
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado de Servicio</p>
            <div className="flex flex-wrap gap-2">
              {(["all","active","scheduled"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  filter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}>
                  {f === "all" ? "Todas" : f === "active" ? "Activas" : "Programadas"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Región Operativa</p>
            <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
              <option>Costa Norte</option>
              <option>Sierra Central</option>
              <option>Amazonía</option>
            </select>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Unidades Activas ({fleet.length})</p>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {fleet.map(b => (
                <div key={b.id} className="flex cursor-pointer items-center justify-between rounded-lg bg-background p-2 hover:bg-secondary/50 transition-colors">
                  <span className="text-xs font-medium text-foreground">{b.id}</span>
                  <span className={cn("h-2 w-2 rounded-full", b.status === "ontime" ? "bg-primary" : "bg-destructive")} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] bg-[image:var(--gradient-primary)] p-5 text-primary-foreground">
          <div className="relative z-10">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-80">Rendimiento Hoy</p>
            <h4 className="mb-2 text-2xl font-bold">94.8% Eficiencia</h4>
            <p className="text-sm opacity-80">Tráfico moderado en variante Pasamayo.</p>
          </div>
          <TrendingUp className="absolute -bottom-2 -right-2 h-24 w-24 opacity-10" />
        </div>
      </aside>

      {/* Route cards */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rutas Activas</h1>
            <p className="text-sm text-muted-foreground">Flujos de transporte en tiempo real</p>
          </div>
          <button onClick={() => toast.success("Formulario de nueva ruta abierto")} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-95">
            <PlusCircle className="h-4 w-4" /> Nueva Ruta
          </button>
        </div>

        {filtered.map((r) => (
          <div key={r.id} className="group flex flex-col overflow-hidden rounded-[24px] border border-border/30 bg-card shadow-[var(--shadow-card)] transition-all hover:border-primary/30 hover:-translate-y-0.5 md:flex-row">
            {/* Map thumbnail placeholder */}
            <div className="relative flex h-44 w-full flex-shrink-0 items-center justify-center bg-secondary md:h-auto md:w-64">
              <svg className="h-full w-full opacity-20" viewBox="0 0 256 180" fill="none">
                <path d="M0 90 Q64 40 128 90 T256 90" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" className="text-primary" />
                <path d="M40 0 Q80 90 100 180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" className="text-muted-foreground" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl bg-card/80 px-3 py-1 backdrop-blur-sm border border-border/50 flex items-center gap-2 text-xs font-semibold">
                  <span className={cn("h-2 w-2 rounded-full", r.traffic === "clear" ? "animate-pulse bg-primary" : "bg-[var(--warning)]")} />
                  {r.traffic === "clear" ? "Vía Despejada" : "Tráfico Moderado"}
                </div>
              </div>
            </div>

            {/* Card content */}
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">ID: {r.id}</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-foreground">{r.from}</h2>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-xl font-bold text-primary">{r.to}</h2>
                    </div>
                  </div>
                  <span className={cn(
                    "rounded-xl px-3 py-1 text-xs font-bold",
                    r.type === "Express" ? "bg-primary/10 text-primary" : r.type === "Premium" ? "bg-secondary text-secondary-foreground" : "bg-secondary/60 text-muted-foreground"
                  )}>{r.type}</span>
                </div>

                {/* Timeline */}
                <div className="relative mb-4 flex items-center gap-2 px-2">
                  <div className="absolute left-9 right-9 top-4 h-0.5 bg-border" />
                  <div className="z-10 flex flex-col items-center gap-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-primary">{r.from}</span>
                  </div>
                  <div className="z-10 mx-auto flex flex-col items-center gap-1">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-primary/10",
                      r.status === "active" ? "bg-primary/20 text-primary" : "border-2 border-border bg-background text-muted-foreground"
                    )}>
                      <Bus className={cn("h-4 w-4", r.status === "active" && "animate-bounce")} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{r.status === "active" ? "En Tránsito" : "Programado"}</span>
                  </div>
                  <div className="z-10 flex flex-col items-center gap-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-background text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{r.to}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {r.status === "active" ? (
                    <>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ETA: {r.eta}</span>
                      <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {r.speed} km/h</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Inicio: {(r as any).start}</span>
                      <span className="flex items-center gap-1"><Navigation className="h-3.5 w-3.5" /> {(r as any).distance} km</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast.info("Editor de ruta abierto")} className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary active:scale-95">Modificar</button>
                  <button onClick={() => toast.info(`Detalle de ruta ${r.id} · ${r.from} → ${r.to}`)} className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-95">Ver Detalles</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 3 — ALERTAS
// ══════════════════════════════════════════════════════════════════════════
function AlertasTab() {
  const [severity, setSeverity] = useState<"criticas" | "preventivas" | "resueltas">("criticas");

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
        <div>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Filtros de Estado</p>
          <div className="flex flex-col gap-2">
            {[
              { id: "criticas",    label: "Críticas",    count: 4,  Icon: AlertOctagon, activeClass: "bg-destructive/10 text-destructive border-destructive/20" },
              { id: "preventivas", label: "Preventivas", count: 12, Icon: AlertTriangle, activeClass: "bg-secondary text-secondary-foreground border-border" },
              { id: "resueltas",   label: "Resueltas",   count: 85, Icon: CheckCircle2,  activeClass: "bg-secondary text-secondary-foreground border-border" },
            ].map(({ id, label, count, Icon, activeClass }) => (
              <button
                key={id}
                onClick={() => setSeverity(id as any)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                  severity === id ? activeClass : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                )}
              >
                <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-black text-white",
                  id === "criticas" ? "bg-destructive" : id === "preventivas" ? "bg-muted-foreground" : "bg-muted-foreground/60"
                )}>{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 text-sm font-bold text-foreground">Próximo Turno</h3>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">RM</div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ricardo Mendoza</p>
              <p className="text-[11px] text-muted-foreground">Supervisor Senior</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Alerts */}
      <section className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Panel de Alertas</h1>
          <span className="text-xs text-muted-foreground">Actualizado hace un momento</span>
        </div>

        <div className="flex flex-col gap-4">
          {alerts.map((a) => {
            const isSos = a.type === "sos";
            const isMech = a.type === "mechanical";
            return (
              <div key={a.id} className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:scale-[1.005] md:flex-row">
                {/* Left accent + icon */}
                <div className={cn(
                  "relative flex w-full items-center justify-center md:w-48 md:flex-shrink-0",
                  isSos ? "bg-destructive/8 min-h-[120px]" : isMech ? "bg-secondary/50 min-h-[120px]" : "bg-primary/5 min-h-[120px]"
                )}>
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl",
                    isSos ? "bg-destructive text-white" : isMech ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {isSos  ? <AlertOctagon className="h-7 w-7" /> :
                     isMech ? <Wrench className="h-7 w-7" /> :
                              <Clock className="h-7 w-7" />}
                  </div>
                  {isSos && <span className="absolute inset-0 animate-ping rounded-none bg-destructive/10 opacity-50" style={{ animationDuration: "2s" }} />}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className={cn(
                          "text-base font-bold leading-tight",
                          isSos ? "text-destructive" : "text-foreground"
                        )}>{a.title}</h3>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{a.time} · ID: {a.id}</p>
                      </div>
                      <span className={cn(
                        "flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                        isSos ? "bg-destructive text-white" : isMech ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"
                      )}>
                        {isSos ? "Prioridad 1" : isMech ? "Preventiva" : "Gestión"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" /> {a.location}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    {isSos && (
                      <button onClick={() => toast.error("Llamada de emergencia iniciada · PNP en camino", { duration: 5000 })} className="flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95">
                        <Phone className="h-3.5 w-3.5" /> Contactar Policía
                      </button>
                    )}
                    {isMech && (
                      <button onClick={() => toast.success("Mecánico asignado · ETA estimado 20 min")} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-95">
                        <ClipboardList className="h-3.5 w-3.5" /> Asignar Mecánico
                      </button>
                    )}
                    {!isSos && !isMech && (
                      <button onClick={() => toast.success("ETA actualizado · Pasajeros informados automáticamente")} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20 active:scale-95">
                        <RefreshCw className="h-3.5 w-3.5" /> Ajustar ETA
                      </button>
                    )}
                    <button onClick={() => toast.info(`Llamando al conductor de ${a.id}…`, { duration: 3000 })} className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-secondary active:scale-95">
                      <Phone className="h-3.5 w-3.5" /> Llamar Conductor
                    </button>
                    {!isSos && !isMech && (
                      <button onClick={() => toast.success("Pasajeros notificados · Mensaje enviado por app")} className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-secondary active:scale-95">
                        <MessageSquare className="h-3.5 w-3.5" /> Notificar Pasajeros
                      </button>
                    )}
                    <button className="ml-auto rounded-xl border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-primary">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB 4 — TALLER
// ══════════════════════════════════════════════════════════════════════════
function TallerTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Taller de Mantenimiento</h1>
          <p className="text-sm text-muted-foreground">Control operativo de flota y gestión de reparaciones</p>
        </div>
        <button onClick={() => toast.success("Ingreso registrado en taller · Mecánico asignado automáticamente")} className="flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary/20 active:scale-95">
          <PlusCircle className="h-4 w-4" /> Registrar Ingreso
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard Icon={Bus}          bg="bg-secondary"       color="text-secondary-foreground" label="Flota en Servicio"        value="112"  sub="+2% vs mes ant." />
        <KpiCard Icon={Wrench}       bg="bg-destructive/10"  color="text-destructive"          label="Unidades en Taller"       value="12"   sub="Alta demanda" destructive />
        <KpiCard Icon={ClipboardList} bg="bg-primary/10"     color="text-primary"              label="Mtto. Pendientes"         value="5"    sub="Programados hoy" />
        <KpiCard Icon={Zap}          bg="bg-primary/10"      color="text-primary"              label="Eficiencia del Taller"    value="94%"  sub="Excelente" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Repairs table */}
        <div className="rounded-[24px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Reparaciones en Curso</h2>
            <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground">4 unidades activas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Unidad</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Descripción</th>
                  <th className="pb-3">Mecánico</th>
                  <th className="pb-3">Progreso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {repairs.map((r) => (
                  <tr key={r.unit} className="transition-colors hover:bg-secondary/30">
                    <td className="py-3.5 font-bold text-primary">{r.unit}</td>
                    <td className="py-3.5">
                      <span className={cn(
                        "rounded-lg px-2 py-0.5 text-[10px] font-bold",
                        r.type === "urgent" ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"
                      )}>
                        {r.type === "urgent" ? "Urgente" : "Rutina"}
                      </span>
                    </td>
                    <td className="py-3.5 text-foreground">{r.desc}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-primary flex-shrink-0">
                          {r.mechanic.split(" ")[0][0]}
                        </div>
                        <span>{r.mechanic}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${r.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-primary">{r.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panels */}
        <div className="flex flex-col gap-4">
          {/* Inventory */}
          <div className="rounded-[24px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">Inventario</h2>
            </div>
            <div className="space-y-4">
              {inventory.map((item) => (
                <div key={item.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-foreground">{item.name}</span>
                    <span className={cn("font-bold", item.low ? "text-destructive" : "text-primary")}>{item.count} uds.</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full rounded-full transition-all", item.low ? "bg-destructive" : "bg-primary")} style={{ width: `${item.pct}%` }} />
                  </div>
                  {item.low && <p className="mt-1 text-[11px] italic text-destructive">Stock bajo — Reordenar</p>}
                </div>
              ))}
            </div>
            <button className="mt-5 w-full rounded-xl border border-primary py-2 text-xs font-bold text-primary transition-all hover:bg-primary/5 active:scale-95">
              Ver Todo el Inventario
            </button>
          </div>

          {/* Preventive */}
          <div className="rounded-[24px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">Preventivo</h2>
            </div>
            <div className="space-y-3">
              {preventive.map((p) => (
                <div key={p.unit} className="flex gap-3 rounded-xl border border-border bg-background p-3">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{p.unit}</p>
                    <p className="text-[11px] text-muted-foreground">{p.task}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Próximo</span>
                      <button className="text-[11px] font-semibold text-primary hover:underline">Estimar Días</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[image:var(--gradient-primary)] p-8 text-primary-foreground">
        <div className="relative z-10 max-w-xl">
          <h3 className="mb-2 text-2xl font-bold">Optimización de Flota</h3>
          <p className="opacity-90">Nuestro sistema predice fallos mecánicos antes de que ocurran, ahorrando un 15% en costos operativos anuales.</p>
        </div>
        <Zap className="absolute -bottom-4 -right-4 h-40 w-40 opacity-10" />
        <BarChart3 className="absolute bottom-8 right-24 h-24 w-24 opacity-10" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  Shared sub-components
// ══════════════════════════════════════════════════════════════════════════
function KpiCard({ Icon, bg, color, label, value, sub, destructive }: {
  Icon: any; bg: string; color: string; label: string; value: string; sub?: string; destructive?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className={cn("flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        {sub && <p className={cn("text-[11px]", destructive ? "text-destructive" : "text-primary")}>{sub}</p>}
      </div>
    </div>
  );
}

function UnitCard({ unit }: { unit: typeof fleet[number] }) {
  const initials = unit.driver.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="cursor-pointer rounded-2xl border border-border bg-background p-3 transition-all hover:border-primary/40">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-foreground">{unit.id}</p>
          <p className="text-[11px] text-muted-foreground">{unit.route}</p>
        </div>
        <span className={cn(
          "rounded-md px-2 py-0.5 text-[10px] font-bold",
          unit.status === "ontime" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
        )}>
          {unit.status === "ontime" ? "A TIEMPO" : "RETRASO"}
        </span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-primary">
          {initials}
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Conductor</p>
          <p className="text-xs font-semibold text-foreground">{unit.driver}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" /> ETA: {unit.eta}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
          <Navigation className="h-3 w-3" /> GPS ON
        </span>
      </div>
    </div>
  );
}

function MapLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <div className={cn("h-2.5 w-2.5 rounded-full", color)} /> {label}
    </div>
  );
}

function CityLabel({ x, y, name }: { x: string; y: string; name: string }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ left: x, top: y }}>
      <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {name}</div>
    </div>
  );
}

function BusPin({ x, y, status, id }: { x: string; y: string; status: "ontime" | "delay"; id: string }) {
  const color = status === "ontime" ? "bg-primary" : "bg-[var(--warning)]";
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
      <div className={cn("relative flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-elegant)]", color)}>
        <Bus className="h-4 w-4" />
        <span className={cn("absolute -inset-1 animate-ping rounded-full opacity-30", color)} />
      </div>
      <div className="mt-1 whitespace-nowrap rounded-md bg-card px-1.5 py-0.5 text-[9px] font-bold text-foreground shadow">{id}</div>
    </div>
  );
}
