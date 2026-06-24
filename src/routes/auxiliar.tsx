import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RoleShell } from "@/components/kuntur/RoleShell";
import { SeatMap, type Seat } from "@/components/kuntur/SeatMap";
import {
  ScanLine, Grid3x3, Wifi, WifiOff, CheckCircle2, Users, Phone, BadgeCheck,
  Bus, ArrowRight, Clock, CalendarClock, Flag, ChevronRight, LogOut, MapPin,
  AlertCircle, UserMinus, Timer, Sparkles, Moon, BedDouble, Crown, Star,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auxiliar")({
  head: () => ({
    meta: [
      { title: "Auxiliar · KUNTUR" },
      { name: "description", content: "Validación de tickets QR y mapa operativo de abordaje." },
    ],
  }),
  component: AuxiliarView,
});

type TripOption = {
  id: string;
  bus: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  date: string;
  type: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const TRIPS: TripOption[] = [
  { id: "JY-104", bus: "JY-104", origin: "Lima",     destination: "Trujillo", departure: "06:30", arrival: "11:45", date: today(),    type: "Ejecutivo" },
  { id: "JY-220", bus: "JY-220", origin: "Lima",     destination: "Arequipa", departure: "14:00", arrival: "00:30", date: today(),    type: "Premium" },
  { id: "JY-318", bus: "JY-318", origin: "Trujillo", destination: "Lima",     departure: "22:30", arrival: "03:45", date: today(),    type: "Cama nocturna" },
  { id: "JY-405", bus: "JY-405", origin: "Lima",     destination: "Ica",      departure: "07:15", arrival: "11:30", date: tomorrow(), type: "Cama" },
  { id: "JY-512", bus: "JY-512", origin: "Cusco",    destination: "Puno",     departure: "09:45", arrival: "16:00", date: tomorrow(), type: "Ejecutivo" },
];

/* ─── Estilos por categoría ─────────────────────────────────────────── */
const tripStyles: Record<string, {
  icon: any; gradient: string; chip: string; accent: string; tagline: string; bg: string;
}> = {
  Premium: {
    icon: Crown,
    gradient: "linear-gradient(135deg, oklch(0.78 0.14 85), oklch(0.68 0.16 50))",
    chip: "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
    accent: "text-amber-600",
    tagline: "VIP · snack incluido",
    bg: "bg-amber-50 border-amber-200",
  },
  Ejecutivo: {
    icon: Star,
    gradient: "linear-gradient(135deg, oklch(0.62 0.13 230), oklch(0.55 0.14 250))",
    chip: "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50",
    accent: "text-blue-600",
    tagline: "Asiento amplio · WiFi",
    bg: "bg-blue-50 border-blue-200",
  },
  Cama: {
    icon: BedDouble,
    gradient: "linear-gradient(135deg, oklch(0.62 0.13 150), oklch(0.5 0.14 160))",
    chip: "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
    accent: "text-emerald-600",
    tagline: "Reclinable 160°",
    bg: "bg-emerald-50 border-emerald-200",
  },
  "Cama nocturna": {
    icon: Moon,
    gradient: "linear-gradient(135deg, oklch(0.4 0.1 280), oklch(0.3 0.09 270))",
    chip: "bg-violet-100 text-violet-700 border border-violet-300 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/50",
    accent: "text-violet-600",
    tagline: "Reclinable 180° · manta",
    bg: "bg-violet-50 border-violet-200",
  },
};
const getStyle = (type: string) => tripStyles[type] ?? tripStyles.Ejecutivo;

/* ─── Seats builder ─────────────────────────────────────────────────── */
function buildSeats(): Seat[] {
  const boarded = new Set(["1A", "1B", "2A", "3C", "4B", "5D"]);
  const sold    = new Set(["2B", "4A", "6C", "7B", "8D", "9A", "10C"]);
  const list: Seat[] = [];
  for (let r = 1; r <= 10; r++) {
    (["A", "B", "C", "D"] as const).forEach((c, i) => {
      const id = `${r}${c}`;
      const status: Seat["status"] = boarded.has(id) ? "boarded" : sold.has(id) ? "sold" : "free";
      list.push({ id, row: r, col: i + 1, floor: 1, status, passenger: sold.has(id) || boarded.has(id) ? "Pasajero #" + id : undefined });
    });
  }
  return list;
}

/* ─── Main view ─────────────────────────────────────────────────────── */
function AuxiliarView() {
  const { user } = useAuth();
  const auxName = user?.role === "auxiliar" ? user.name : "Luis Ramírez";
  const [stage, setStage] = useState<"select" | "active" | "upcoming">("select");
  const [tripId, setTripId] = useState<string | null>(null);
  const trip = TRIPS.find((t) => t.id === tripId) ?? null;

  if (stage === "select" || !trip) {
    return (
      <RoleShell role="Auxiliar" rightSlot={<AuxBadge name={auxName} />}>
        <TripPicker
          title="Selecciona el viaje a operar"
          subtitle="Elige el bus que tienes asignado para iniciar el turno."
          onPick={(id) => { setTripId(id); setStage("active"); }}
        />
      </RoleShell>
    );
  }

  if (stage === "upcoming") {
    return (
      <RoleShell role="Auxiliar" rightSlot={<AuxBadge name={auxName} />}>
        <UpcomingTrips
          finishedTripLabel={`${trip.origin} → ${trip.destination}`}
          onPickNext={(id) => { setTripId(id); setStage("active"); }}
        />
      </RoleShell>
    );
  }

  return <ActiveTripView trip={trip} auxName={auxName} onFinish={() => setStage("upcoming")} />;
}

function AuxBadge({ name }: { name: string }) {
  return (
    <span className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground sm:inline-flex">
      <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {name}
    </span>
  );
}

/* ─── Trip Picker ────────────────────────────────────────────────────── */
export function TripPicker({ title, subtitle, onPick }: {
  title: string; subtitle: string; onPick: (id: string) => void;
}) {
  const todayTrips = TRIPS.filter((t) => t.date === today());
  const tomorrowTrips = TRIPS.filter((t) => t.date === tomorrow());

  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero banner */}
      <div className="rounded-2xl border border-border bg-[image:var(--gradient-primary)] p-5 text-primary-foreground shadow-[var(--shadow-soft)]">
        <div className="text-[10px] uppercase tracking-wider opacity-80">Inicio de turno</div>
        <h1 className="mt-1 text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm opacity-90">{subtitle}</p>
      </div>

      {/* Hoy */}
      {todayTrips.length > 0 && (
        <div className="mt-5">
          <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Hoy · {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "short" })}
          </div>
          <div className="space-y-2.5">
            {todayTrips.map((t) => <TripRow key={t.id} trip={t} onPick={onPick} />)}
          </div>
        </div>
      )}

      {/* Mañana */}
      {tomorrowTrips.length > 0 && (
        <div className="mt-5">
          <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" /> Mañana
          </div>
          <div className="space-y-2.5">
            {tomorrowTrips.map((t) => <TripRow key={t.id} trip={t} onPick={onPick} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function TripRow({ trip, onPick }: { trip: TripOption; onPick: (id: string) => void }) {
  const s = getStyle(trip.type);
  const Icon = s.icon;
  return (
    <button
      onClick={() => onPick(trip.id)}
      className="group flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
    >
      <div className="flex items-center gap-3">
        {/* Icono con gradiente de la categoría */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
          style={{ background: s.gradient }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{trip.origin}</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-bold text-foreground">{trip.destination}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.chip}`}>
              <Icon className="h-3 w-3" /> {trip.type}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Bus {trip.bus} · {trip.departure} → {trip.arrival} · {s.tagline}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

/* ─── Upcoming Trips (post-viaje) con countdown ──────────────────────── */
function minutesUntil(dateStr: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const target = new Date(`${dateStr}T00:00:00`);
  target.setHours(h, m, 0, 0);
  return Math.max(0, Math.round((target.getTime() - Date.now()) / 60000));
}

function formatRemaining(min: number) {
  if (min <= 0) return "Listo para abordar";
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

/* Countdown en segundos para precisión visual */
function useCountdown(targetMs: number) {
  const [secsLeft, setSecsLeft] = useState(() => Math.max(0, Math.round((targetMs - Date.now()) / 1000)));
  useEffect(() => {
    const id = setInterval(() => setSecsLeft(Math.max(0, Math.round((targetMs - Date.now()) / 1000))), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return secsLeft;
}

function CountdownBadge({ dateStr, hhmm }: { dateStr: string; hhmm: string }) {
  const [h, m] = hhmm.split(":").map(Number);
  const target = new Date(`${dateStr}T00:00:00`);
  target.setHours(h, m, 0, 0);
  const secs = useCountdown(target.getTime());

  const hrs  = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const ss   = secs % 60;
  const ready = secs <= 0;

  return (
    <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-sm font-bold tabular-nums ${
      ready
        ? "animate-pulse bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        : secs < 600
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-secondary text-primary"
    }`}>
      <Timer className="h-3.5 w-3.5 flex-shrink-0" />
      {ready
        ? "¡Listo!"
        : hrs > 0
        ? `${hrs}h ${String(mins).padStart(2, "0")}m`
        : `${String(mins).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
      }
    </div>
  );
}

export function UpcomingTrips({ finishedTripLabel, onPickNext }: {
  finishedTripLabel: string; onPickNext: (id: string) => void;
}) {
  const upcoming = TRIPS
    .map((t) => ({ ...t, remaining: minutesUntil(t.date, t.departure) }))
    .filter((t) => {
      const [h, m] = t.departure.split(":").map(Number);
      const dep = new Date(`${t.date}T00:00:00`);
      dep.setHours(h, m, 0, 0);
      return dep.getTime() > Date.now() - 5 * 60_000; // últimos 5 min también visibles
    })
    .sort((a, b) => (a.date + a.departure).localeCompare(b.date + b.departure));

  return (
    <div className="mx-auto max-w-2xl">
      {/* Viaje completado */}
      <div className="rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 text-[var(--success)]">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Viaje finalizado</span>
        </div>
        <div className="mt-1 text-base font-bold text-foreground">{finishedTripLabel}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">El reporte se envió a la oficina. ¡Buen trabajo!</p>
      </div>

      {/* Título */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Próximos viajes</h2>
        </div>
        <span className="text-xs text-muted-foreground">{upcoming.length} asignado{upcoming.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="mt-3 space-y-3">
        {upcoming.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center flex flex-col items-center justify-center">
            <img src="/shift_completed.png" alt="Shift completed" className="mb-4 h-32 w-auto object-contain opacity-80" />
            <p className="text-sm font-semibold text-muted-foreground">No hay más viajes asignados. ¡Descansa!</p>
          </div>
        )}
        {upcoming.map((t) => {
          const s = getStyle(t.type);
          const Icon = s.icon;
          const [th, tm] = t.departure.split(":").map(Number);
          const depMs = new Date(`${t.date}T00:00:00`);
          depMs.setHours(th, tm, 0, 0);
          const isReady = Date.now() >= depMs.getTime() - 5 * 60_000;

          return (
            <div
              key={t.id + t.date}
              className={`overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-all ${
                isReady ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              {/* Franja superior de color */}
              <div className="h-1 w-full" style={{ background: s.gradient }} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ background: s.gradient }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-bold text-foreground">{t.origin}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-bold text-foreground">{t.destination}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Bus {t.bus} · sale {t.departure}{t.date > today() ? " (mañana)" : ""} · {s.tagline}
                      </div>
                    </div>
                  </div>
                  <CountdownBadge dateStr={t.date} hhmm={t.departure} />
                </div>

                {isReady && (
                  <button
                    onClick={() => onPickNext(t.id)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-all active:scale-[0.98]"
                  >
                    <Flag className="h-4 w-4" /> Iniciar este viaje
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Active Trip View ──────────────────────────────────────────────── */
type Stop = {
  name: string;
  scheduled: string;
  passengers: { seat: string; name: string; off: boolean }[];
  done: boolean;
};

function buildStops(): Stop[] {
  return [
    { name: "Huacho",   scheduled: "08:10", done: true,  passengers: [{ seat: "1A", name: "Carlos R.", off: true }, { seat: "2B", name: "Lucía M.", off: true }] },
    { name: "Barranca", scheduled: "09:25", done: false, passengers: [{ seat: "3C", name: "María L.", off: false }, { seat: "4B", name: "Pedro S.", off: false }, { seat: "5D", name: "Andrea V.", off: false }] },
    { name: "Chimbote", scheduled: "11:40", done: false, passengers: [{ seat: "6C", name: "Jorge T.", off: false }, { seat: "7B", name: "Sofía N.", off: false }] },
    { name: "Trujillo", scheduled: "15:20", done: false, passengers: [{ seat: "8D", name: "Ricardo P.", off: false }, { seat: "9A", name: "Elena G.", off: false }, { seat: "10C", name: "Manuel B.", off: false }] },
  ];
}

function ActiveTripView({ trip, auxName, onFinish }: {
  trip: TripOption; auxName: string; onFinish: () => void;
}) {
  const [tab, setTab]       = useState<"scan" | "map" | "off">("scan");
  const [online, setOnline] = useState(true);
  const [stops, setStops]   = useState<Stop[]>(buildStops);
  const seats = buildSeats();
  const boarded = seats.filter((s) => s.status === "boarded").length;
  const sold    = seats.filter((s) => s.status === "sold").length;
  const emergency = "+51 998 123 456";

  const totalToOff  = stops.reduce((acc, s) => acc + s.passengers.length, 0);
  const offCount    = stops.reduce((acc, s) => acc + s.passengers.filter((p) => p.off).length, 0);
  const currentStop = stops.findIndex((s) => !s.done);

  const togglePassenger = (stopIdx: number, seat: string) => {
    setStops((prev) => prev.map((s, i) => i !== stopIdx ? s : {
      ...s,
      passengers: s.passengers.map((p) => p.seat === seat ? { ...p, off: !p.off } : p),
    }));
  };

  const closeStop = (stopIdx: number) => {
    setStops((prev) => prev.map((s, i) => i !== stopIdx ? s : {
      ...s, done: true,
      passengers: s.passengers.map((p) => ({ ...p, off: true })),
    }));
  };

  const s = getStyle(trip.type);
  const Icon = s.icon;

  return (
    <RoleShell
      role="Auxiliar"
      rightSlot={
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground sm:inline-flex">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {auxName}
          </span>
          <button
            onClick={() => setOnline(!online)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              online ? "bg-secondary text-[var(--success)]" : "bg-[var(--warning)]/20 text-[var(--warning-foreground)]"
            }`}
          >
            {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {online ? "Online" : "Offline · sync"}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-md pb-28">
        {/* Header del viaje */}
        <div className="mb-4 overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]">
          <div className="h-1.5" style={{ background: s.gradient }} />
          <div className="grid grid-cols-[1fr_auto] gap-3 border border-t-0 border-border bg-card p-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: s.gradient }}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.chip}`}>
                  {trip.type}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-base font-bold text-foreground">
                {trip.origin} <ArrowRight className="h-4 w-4 text-primary" /> {trip.destination}
              </div>
              <div className="text-xs text-muted-foreground">Bus {trip.bus} · {trip.departure} → {trip.arrival}</div>
            </div>
            <a
              href={`tel:${emergency.replace(/\s/g, "")}`}
              className="flex flex-col items-end justify-center rounded-xl bg-destructive px-3 py-2 text-right shadow-[0_4px_12px_-4px_oklch(0.62_0.15_28_/_0.6)] active:scale-95"
            >
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground">
                <Phone className="h-3 w-3" /> Emergencia
              </span>
              <span className="text-sm font-bold text-destructive-foreground">{emergency}</span>
            </a>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={CheckCircle2} label="Validados"  value={boarded.toString()} color="text-[var(--success)]" />
          <Stat icon={Users}        label="Pendientes" value={sold.toString()}    color="text-primary" />
          <Stat icon={LogOut}       label="Bajaron"    value={`${offCount}/${totalToOff}`} color="text-foreground" />
        </div>

        {/* Tabs */}
        <div className="mt-4 grid grid-cols-3 rounded-xl border border-border bg-muted p-1">
          {([["scan", ScanLine, "Escáner"], ["map", Grid3x3, "Mapa"], ["off", UserMinus, "Bajadas"]] as const).map(([id, Ic, lbl]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-colors ${
                tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Ic className="h-4 w-4" /> {lbl}
            </button>
          ))}
        </div>

        {tab === "scan" && <Scanner />}
        {tab === "map"  && <div className="mt-4"><SeatMap seats={seats} variant="operator" /></div>}
        {tab === "off"  && (
          <DropoffPanel
            stops={stops}
            currentIdx={currentStop === -1 ? stops.length : currentStop}
            onToggle={togglePassenger}
            onClose={closeStop}
          />
        )}

        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--warning-foreground)]" />
          <p className="text-xs text-foreground">
            <strong>Recordatorio:</strong> verifica DNI del pasajero al retirar equipaje en cada parada.
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur">
        <button
          onClick={onFinish}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-primary)] py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-all active:scale-[0.98]"
        >
          <Flag className="h-5 w-5" /> Finalizar viaje
        </button>
      </div>
    </RoleShell>
  );
}

/* ─── Dropoff Panel ─────────────────────────────────────────────────── */
function DropoffPanel({ stops, currentIdx, onToggle, onClose }: {
  stops: Stop[]; currentIdx: number;
  onToggle: (stopIdx: number, seat: string) => void;
  onClose: (stopIdx: number) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      {stops.map((s, i) => {
        const off       = s.passengers.filter((p) => p.off).length;
        const total     = s.passengers.length;
        const isCurrent = i === currentIdx;
        const allOff    = off === total && total > 0;
        return (
          <div
            key={s.name}
            className={`overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] ${
              isCurrent ? "border-primary ring-2 ring-primary/20" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  s.done ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-secondary text-primary"
                }`}>
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{s.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Programada {s.scheduled} · {off}/{total} bajaron
                  </div>
                </div>
              </div>
              {s.done ? (
                <span className="rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--success)]">Cerrada</span>
              ) : isCurrent ? (
                <span className="animate-pulse rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Actual</span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pendiente</span>
              )}
            </div>
            <ul className="divide-y divide-border">
              {s.passengers.map((p) => (
                <li key={p.seat} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground">{p.seat}</span>
                    <span className={`text-sm font-medium ${p.off ? "text-muted-foreground line-through" : "text-foreground"}`}>{p.name}</span>
                  </div>
                  <button
                    onClick={() => !s.done && onToggle(i, p.seat)}
                    disabled={s.done}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      p.off ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-primary text-primary-foreground hover:opacity-90"
                    } ${s.done ? "opacity-60" : ""}`}
                  >
                    {p.off ? (<><CheckCircle2 className="h-3.5 w-3.5" /> Bajó</>) : (<><LogOut className="h-3.5 w-3.5" /> Retirar</>)}
                  </button>
                </li>
              ))}
            </ul>
            {!s.done && isCurrent && (
              <div className="border-t border-border bg-muted/40 p-3">
                <button
                  onClick={() => onClose(i)}
                  disabled={!allOff}
                  className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${
                    allOff
                      ? "bg-[image:var(--gradient-primary)] text-primary-foreground active:scale-[0.98]"
                      : "cursor-not-allowed bg-muted text-muted-foreground"
                  }`}
                >
                  {allOff ? "Cerrar parada y avanzar" : `Faltan ${total - off} pasajeros por bajar`}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Scanner mock data ──────────────────────────────────────────────── */
const MOCK_PASSENGERS = [
  { name: "María López",    seat: "3C", dni: "72450123", route: "Lima → Trujillo", valid: true  },
  { name: "Carlos Rivas",   seat: "1A", dni: "45892167", route: "Lima → Trujillo", valid: true  },
  { name: "Ana Gutiérrez",  seat: "7B", dni: "89231045", route: "Lima → Trujillo", valid: true  },
  { name: "Pedro Mamani",   seat: "4D", dni: "67823401", route: "Lima → Arequipa", valid: false },
  { name: "Rosa Quispe",    seat: "2B", dni: "53190847", route: "Lima → Trujillo", valid: true  },
];

/* ─── Scanner ───────────────────────────────────────────────────────── */
function Scanner() {
  const [phase, setPhase] = useState<"idle" | "scanning" | "valid" | "invalid">("idle");
  const [passenger, setPassenger] = useState<typeof MOCK_PASSENGERS[0] | null>(null);
  const [scanIdx, setScanIdx] = useState(0);

  const doScan = () => {
    setPhase("scanning");
    setTimeout(() => {
      const p = MOCK_PASSENGERS[scanIdx % MOCK_PASSENGERS.length];
      setPassenger(p);
      setPhase(p.valid ? "valid" : "invalid");
      setScanIdx((i) => i + 1);
    }, 2000);
  };

  const reset = () => { setPhase("idle"); setPassenger(null); };

  const bracketColor =
    phase === "valid"   ? "border-emerald-400" :
    phase === "invalid" ? "border-destructive"  : "border-[var(--primary-glow)]";

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-foreground/95 p-4 shadow-[var(--shadow-card)]">
      {/* Viewfinder */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.6)_70%)]" />

        {/* Corner brackets */}
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2">
          {[
            "top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-xl",
            "top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-xl",
            "bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-xl",
            "bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-xl",
          ].map((c) => (
            <div key={c} className={`absolute h-10 w-10 transition-colors duration-500 ${bracketColor} ${c}`} />
          ))}

          {/* Scan line */}
          {phase === "scanning" && (
            <div className="absolute inset-x-2 top-1/2 h-0.5 animate-pulse rounded-full bg-[var(--primary-glow)] shadow-[0_0_16px_var(--primary-glow)]" />
          )}

          {/* Result icon */}
          {phase === "valid" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-20 w-20 text-emerald-400 drop-shadow-lg" />
            </div>
          )}
          {phase === "invalid" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle className="h-20 w-20 text-destructive drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* Scanning spinner badge */}
        {phase === "scanning" && (
          <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[var(--primary-glow)]" />
          </div>
        )}

        {/* Status label */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur transition-all duration-300 ${
          phase === "valid"    ? "bg-emerald-500/90 text-white" :
          phase === "invalid"  ? "bg-destructive/90 text-white" :
          phase === "scanning" ? "bg-primary/80 text-white"     :
                                  "bg-foreground/80 text-background"
        }`}>
          {phase === "idle"     && "Toca para simular escaneo"}
          {phase === "scanning" && "Leyendo código QR…"}
          {phase === "valid"    && "✓ Boleto válido"}
          {phase === "invalid"  && "✗ No autorizado"}
        </div>

        {/* Tap overlay (idle only) */}
        {phase === "idle" && (
          <>
            <div className="absolute inset-0 flex items-center justify-center p-12 opacity-35">
              <img src="/scanner_placeholder.png" alt="Scan QR" className="h-48 w-auto object-contain mix-blend-screen" />
            </div>
            <button onClick={doScan} className="absolute inset-0 z-10" aria-label="Simular escaneo QR" />
          </>
        )}
      </div>

      {/* Result card */}
      {(phase === "valid" || phase === "invalid") && passenger && (
        <div className={`mt-3 rounded-xl border p-3 ${
          phase === "valid" ? "border-emerald-300/50 bg-emerald-500/10 dark:border-emerald-700/50 dark:bg-emerald-500/15" : "border-destructive/30 bg-destructive/10"
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-sm font-bold ${phase === "valid" ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}`}>
                {phase === "valid" ? "Acceso permitido" : "Acceso denegado"}
              </p>
              {phase === "valid" ? (
                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <p><strong className="text-foreground">{passenger.name}</strong> · DNI {passenger.dni}</p>
                  <p>Asiento <strong className="text-foreground">{passenger.seat}</strong> · {passenger.route}</p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Boleto no corresponde a la ruta actual.</p>
              )}
            </div>
            <button onClick={reset} className="shrink-0 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Idle: last scanned */}
      {phase === "idle" && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary p-3 text-sm">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            <span className="font-semibold">Último: Asiento 3C · María L.</span>
          </div>
          <span className="text-xs text-muted-foreground">hace 12s</span>
        </div>
      )}

      {/* Scanning: spinner row */}
      {phase === "scanning" && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-secondary p-3 text-sm">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <span className="font-semibold text-muted-foreground">Verificando con servidor…</span>
        </div>
      )}
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────────────────── */
function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`mt-0.5 text-2xl font-bold ${color ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}