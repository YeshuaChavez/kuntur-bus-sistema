import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/kuntur/RoleShell";
import {
  Play, Pause, Flag, AlertTriangle, MapPin, Clock, Route as RouteIcon,
  Navigation, BadgeCheck, Fuel, Gauge, ThermometerSun, Users,
  CheckCircle2, Circle, TimerReset, Timer,
  Activity, BatteryCharging, Thermometer, Zap, Shield, BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TripPicker, UpcomingTrips } from "./auxiliar";

export const Route = createFileRoute("/conductor")({
  head: () => ({
    meta: [
      { title: "Conductor · KUNTUR" },
      { name: "description", content: "Reporte de ruta minimalista con botón S.O.S de emergencia." },
    ],
  }),
  component: ConductorView,
});

type ActiveTrip = {
  id: string;
  origin: string;
  destination: string;
  bus: string;
  departure: string;
};

const TRIP_LOOKUP: Record<string, ActiveTrip> = {
  "JY-104": { id: "JY-104", origin: "Lima",     destination: "Trujillo", bus: "JY-104", departure: "06:30" },
  "JY-220": { id: "JY-220", origin: "Lima",     destination: "Arequipa", bus: "JY-220", departure: "14:00" },
  "JY-318": { id: "JY-318", origin: "Trujillo", destination: "Lima",     bus: "JY-318", departure: "22:30" },
  "JY-405": { id: "JY-405", origin: "Lima",     destination: "Ica",      bus: "JY-405", departure: "07:15" },
  "JY-512": { id: "JY-512", origin: "Cusco",    destination: "Puno",     bus: "JY-512", departure: "09:45" },
};

function ConductorView() {
  const { user } = useAuth();
  const driverName = user?.role === "conductor" ? user.name : "Carlos Mendoza";
  const [stage, setStage] = useState<"select" | "active" | "upcoming">("select");
  const [tripId, setTripId] = useState<string | null>(null);
  const trip = tripId ? TRIP_LOOKUP[tripId] : null;

  if (stage === "select" || !trip) {
    return (
      <RoleShell role="Conductor" rightSlot={<DriverBadge name={driverName} />}>
        <TripPicker
          title="Selecciona el viaje a conducir"
          subtitle="Elige tu unidad para iniciar el reporte de ruta."
          onPick={(id) => { setTripId(id); setStage("active"); }}
        />
      </RoleShell>
    );
  }

  if (stage === "upcoming") {
    return (
      <RoleShell role="Conductor" rightSlot={<DriverBadge name={driverName} />}>
        <UpcomingTrips
          finishedTripLabel={`${trip.origin} → ${trip.destination}`}
          onPickNext={(id) => { setTripId(id); setStage("active"); }}
        />
      </RoleShell>
    );
  }

  return <ActiveDriverView trip={trip} driverName={driverName} onFinish={() => setStage("upcoming")} />;
}

function DriverBadge({ name }: { name: string }) {
  return (
    <div className="hidden flex-col items-end text-right sm:flex">
      <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
        <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {name}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Conductor</span>
    </div>
  );
}

type LogEntry = { label: string; time: string };

function nowHHMM() {
  return new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ─── Elapsed timer ─────────────────────────────────────────────────── */
function useElapsed(startEpoch: number | null) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!startEpoch) { setSecs(0); return; }
    const tick = () => setSecs(Math.floor((Date.now() - startEpoch) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startEpoch]);
  return secs;
}

function formatElapsed(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ─── Active Driver View ────────────────────────────────────────────── */
function ActiveDriverView({ trip, driverName, onFinish }: {
  trip: ActiveTrip; driverName: string; onFinish: () => void;
}) {
  const [status, setStatus]         = useState("Sin iniciar");
  const [sosOpen, setSosOpen]       = useState(false);
  const [startEpoch, setStartEpoch] = useState<number | null>(null);
  const [startTime, setStartTime]   = useState<string | null>(null);
  const [stopTime, setStopTime]     = useState<string | null>(null);
  const [paradaCount, setParadaCount] = useState(0);
  const [log, setLog]               = useState<LogEntry[]>([]);
  const [conductorTab, setConductorTab] = useState<"ruta" | "sensores">("ruta");
  const started = startTime !== null;
  const elapsed = useElapsed(startEpoch);

  const pushLog = (label: string) => {
    const time = nowHHMM();
    setLog((l) => [{ label, time }, ...l]);
    return time;
  };

  const handleStart = () => {
    const t = pushLog("Inicio de ruta");
    setStartTime(t);
    setStartEpoch(Date.now());
    setStopTime(null);
    setStatus("En ruta");
  };

  const handleStop = () => {
    if (!started) return;
    const t = pushLog("Parada técnica");
    setStopTime(t);
    setStatus("En parada");
  };

  const handleParada = () => {
    if (!started) return;
    const next = paradaCount + 1;
    setParadaCount(next);
    pushLog(`Parada ${next}`);
    setStatus(`Parada ${next}`);
  };

  const handleFinish = () => {
    pushLog("Fin de viaje");
    setStatus("Finalizado");
    onFinish();
  };

  const plannedStops = [
    { name: "Lima",     scheduled: trip.departure },
    { name: "Huacho",   scheduled: "08:10" },
    { name: "Barranca", scheduled: "09:25" },
    { name: "Chimbote", scheduled: "11:40" },
    { name: "Virú",     scheduled: "13:50" },
    { name: "Trujillo", scheduled: "15:20" },
  ];
  const reachedStops = Math.min(paradaCount, plannedStops.length);

  return (
    <RoleShell role="Conductor" rightSlot={<DriverBadge name={driverName} />}>
      <div className="mx-auto max-w-3xl pb-44">

        {/* Hero card */}
        <div className="rounded-3xl bg-[image:var(--gradient-primary)] p-6 text-primary-foreground shadow-[var(--shadow-elegant)]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-widest opacity-80">
            <span>Bus {trip.bus} · Salida {trip.departure}</span>
            <span>Conductor: <strong className="font-bold opacity-100">{driverName}</strong></span>
            <span>ID: <strong className="font-mono opacity-100">{trip.id}</strong></span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">{trip.origin} → {trip.destination}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
            <MapPin className="h-3.5 w-3.5" /> Km 248 · cerca de Chimbote
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3 border-t border-primary-foreground/20 pt-4">
            <Mini icon={Clock}  k="Inicio"      v={startTime ?? "—"} />
            <Mini icon={Pause}  k="Últ. parada" v={stopTime  ?? "—"} />
            <Mini icon={Flag}   k="Estado"      v={status} />
            <div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-70">
                <Timer className="h-3 w-3" /> Tiempo
              </div>
              <div className={`mt-0.5 font-mono text-base font-bold tabular-nums ${started ? "opacity-100" : "opacity-40"}`}>
                {started ? formatElapsed(elapsed) : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-5 flex gap-1 rounded-2xl bg-secondary/50 p-1 w-fit">
          <button
            onClick={() => setConductorTab("ruta")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              conductorTab === "ruta"
                ? "bg-card text-primary shadow-[var(--shadow-soft)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Navigation className="h-4 w-4" /> Ruta
          </button>
          <button
            onClick={() => setConductorTab("sensores")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              conductorTab === "sensores"
                ? "bg-card text-primary shadow-[var(--shadow-soft)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-4 w-4" /> Sensores
          </button>
        </div>

        {/* ── Ruta content ── */}
        {conductorTab === "ruta" && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoCard icon={Gauge}          label="Velocidad"   value={started ? "82 km/h" : "0 km/h"} tone="primary" />
              <InfoCard icon={Fuel}           label="Combustible" value="74%"         tone="success" />
              <InfoCard icon={ThermometerSun} label="Clima"       value="22° Nublado" />
              <InfoCard icon={Users}          label="Pasajeros"   value="34/40" />
            </div>

            <RouteMap reachedStops={reachedStops} started={started} />

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/30 bg-secondary p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Próxima parada</div>
                  <div className="text-base font-bold text-foreground">
                    {plannedStops[reachedStops]?.name ?? "Destino final"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Programada</div>
                <div className="font-mono text-base font-bold text-primary">
                  {plannedStops[reachedStops]?.scheduled ?? "—"}
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reporte rápido</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <BigBtn icon={Play}   label={startTime ? `Iniciado · ${startTime}` : "Inicio de ruta"} onClick={handleStart} active={status === "En ruta"} />
              <BigBtn icon={Pause}  label={stopTime  ? `Parada · ${stopTime}`   : "Parada técnica"} onClick={handleStop}  active={status === "En parada"} disabled={!started} />
              <BigBtn icon={MapPin} label={paradaCount > 0 ? `Parada ${paradaCount}` : "Parada 1"}  onClick={handleParada} active={status.startsWith("Parada ")} disabled={!started} />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <RouteIcon className="h-3.5 w-3.5" /> Plan de paradas
              </h3>
              <ul className="space-y-2.5">
                {plannedStops.map((s, i) => {
                  const done    = i < reachedStops;
                  const current = i === reachedStops && started;
                  return (
                    <li key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                        ) : current ? (
                          <Circle className="h-4 w-4 animate-pulse fill-primary text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                        )}
                        <span className={`text-sm font-semibold ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {i + 1}. {s.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{s.scheduled}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {log.length > 0 && (
              <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <TimerReset className="h-3.5 w-3.5" /> Bitácora del viaje
                </h3>
                <ul className="space-y-2">
                  {log.map((e, i) => (
                    <li key={i} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-foreground">{e.label}</span>
                      <span className="font-mono text-sm text-primary">{e.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* ── Sensores content ── */}
        {conductorTab === "sensores" && (
          <SensoresView unit={trip.bus} started={started} />
        )}
      </div>

      {/* Bottom bar — always visible */}
      <div className="fixed inset-x-0 bottom-0 z-40 space-y-2 border-t border-border bg-card/95 p-4 backdrop-blur">
        {started && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-2 text-sm font-mono font-bold text-primary tabular-nums">
            <Timer className="h-4 w-4" /> {formatElapsed(elapsed)} en ruta
          </div>
        )}
        {!started ? (
          <button
            onClick={handleStart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-primary)] py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-all active:scale-[0.98]"
          >
            <Play className="h-5 w-5" /> Iniciar viaje
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[image:var(--gradient-primary)] py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-all active:scale-[0.98]"
          >
            <Flag className="h-5 w-5" /> Finalizar viaje · iniciado {startTime}
          </button>
        )}
        <button
          onClick={() => setSosOpen(true)}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-destructive py-4 text-base font-bold tracking-wide text-destructive-foreground shadow-[0_8px_24px_-8px_oklch(0.62_0.15_28_/_0.6)] transition-all active:scale-[0.98]"
        >
          <AlertTriangle className="h-5 w-5" /> EMERGENCIA · S.O.S
        </button>
      </div>

      {sosOpen && <SosModal onClose={() => setSosOpen(false)} />}
    </RoleShell>
  );
}

/* ─── Info card ─────────────────────────────────────────────────────── */
function InfoCard({ icon: Icon, label, value, tone }: {
  icon: any; label: string; value: string; tone?: "primary" | "success" | "default";
}) {
  const toneCls = tone === "primary" ? "text-primary" : tone === "success" ? "text-[var(--success)]" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${toneCls}`} /> {label}
      </div>
      <div className={`mt-1 text-base font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}

/* ─── Route Map ─────────────────────────────────────────────────────── */
function RouteMap({ reachedStops, started }: { reachedStops: number; started: boolean }) {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    if (!started) { setAnimProgress(0); return; }
    const DURATION = 10000; // 10 segundos por vuelta
    const startTime = performance.now();
    let rafId: number;
    const tick = (now: number) => {
      setAnimProgress(((now - startTime) % DURATION) / DURATION);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [started]);

  const stops = [
    { x: 60,  y: 380, name: "Lima"     },
    { x: 180, y: 320, name: "Huacho"   },
    { x: 300, y: 280, name: "Barranca" },
    { x: 420, y: 220, name: "Chimbote" },
    { x: 560, y: 150, name: "Virú"     },
    { x: 700, y: 90,  name: "Trujillo" },
  ];
  const path = stops.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`).join(" ");

  // Interpolación lineal entre paradas
  const n = stops.length - 1;
  const seg = Math.min(Math.floor(animProgress * n), n - 1);
  const t   = (animProgress * n) - seg;
  const busX = stops[seg].x + (stops[Math.min(seg + 1, n)].x - stops[seg].x) * t;
  const busY = stops[seg].y + (stops[Math.min(seg + 1, n)].y - stops[seg].y) * t;

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Mapa de ruta</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive">
          <span className="h-1 w-5 rounded-full bg-destructive" /> Ruta óptima (Dijkstra)
        </span>
      </div>
      <div className="relative h-[460px] sm:h-[560px] bg-[radial-gradient(ellipse_at_center,_var(--secondary)_0%,_var(--background)_75%)]">
        <svg viewBox="0 0 760 440" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
          <path d="M 60 380 Q 250 420 420 220 T 700 90" stroke="oklch(0.7 0.02 150)" strokeWidth="3" fill="none" strokeDasharray="6 6" opacity="0.4" />
          <path d="M 60 380 Q 200 200 700 90"           stroke="oklch(0.7 0.02 150)" strokeWidth="3" fill="none" strokeDasharray="6 6" opacity="0.4" />
          <path
            d={path}
            stroke="oklch(0.62 0.18 28)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 2px 6px oklch(0.62 0.18 28 / 0.4))"
          />
          {stops.map((s, i) => {
            const done    = i < reachedStops;
            const current = started && i === reachedStops;
            return (
              <g key={s.name}>
                <circle
                  cx={s.x} cy={s.y}
                  r={current ? 11 : 7}
                  fill={current ? "oklch(0.62 0.18 28)" : done ? "oklch(0.55 0.13 150)" : "white"}
                  stroke={current ? "white" : "oklch(0.55 0.13 150)"}
                  strokeWidth="3"
                />
                {current && (
                  <circle cx={s.x} cy={s.y} r="18" fill="none" stroke="oklch(0.62 0.18 28)" strokeWidth="2" opacity="0.5">
                    <animate attributeName="r"       from="11"  to="26" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0"  dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={s.x} y={s.y - 16} textAnchor="middle" className="fill-foreground" style={{ fontSize: 13, fontWeight: 700 }}>
                  {s.name}
                </text>
              </g>
            );
          })}

          {/* Bus animado — aparece al iniciar el viaje */}
          {started && (
            <g>
              {/* Halo pulsante */}
              <circle cx={busX} cy={busY} r="18" fill="oklch(0.62 0.18 28)" opacity="0.2">
                <animate attributeName="r"       values="14;22;14" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.08;0.3" dur="1s" repeatCount="indefinite" />
              </circle>
              {/* Punto del bus */}
              <circle
                cx={busX} cy={busY} r="11"
                fill="oklch(0.62 0.18 28)"
                stroke="white"
                strokeWidth="3"
                filter="drop-shadow(0 2px 8px oklch(0.62 0.18 28 / 0.6))"
              />
              {/* Icono "B" de bus */}
              <text x={busX} y={busY + 4} textAnchor="middle" fill="white" style={{ fontSize: 10, fontWeight: 900 }}>B</text>
            </g>
          )}
        </svg>
        <div className="absolute bottom-2 right-3 flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
          <Navigation className="h-3 w-3 text-destructive" /> Algoritmo Dijkstra · ruta óptima
        </div>
      </div>
    </div>
  );
}

/* ─── Mini ──────────────────────────────────────────────────────────── */
function Mini({ icon: Icon, k, v }: { icon: any; k: string; v: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-70">
        <Icon className="h-3 w-3" /> {k}
      </div>
      <div className="mt-0.5 text-base font-bold">{v}</div>
    </div>
  );
}

/* ─── Big Button ────────────────────────────────────────────────────── */
function BigBtn({ icon: Icon, label, onClick, active, disabled }: {
  icon: any; label: string; onClick: () => void; active?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all active:scale-95 ${
        disabled
          ? "cursor-not-allowed border-border/50 bg-muted/40 text-muted-foreground/60"
          : active
          ? "border-primary bg-secondary text-primary shadow-[var(--shadow-soft)]"
          : "border-border bg-card text-foreground hover:border-primary/40"
      }`}
    >
      <Icon className="h-9 w-9" strokeWidth={2} />
      <span className="text-sm font-bold leading-tight">{label}</span>
    </button>
  );
}

/* ─── SOS Modal ─────────────────────────────────────────────────────── */
function SosModal({ onClose }: { onClose: () => void }) {
  const reasons = ["Avería mecánica", "Accidente", "Asalto / Seguridad", "Salud pasajero", "Otro"];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Reportar emergencia</h3>
            <p className="text-xs text-muted-foreground">Selecciona el motivo. La oficina será notificada.</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {reasons.map((r) => (
            <button
              key={r}
              onClick={onClose}
              className="w-full rounded-xl border border-border bg-background p-3.5 text-left font-medium text-foreground transition-colors hover:border-destructive hover:bg-destructive/5"
            >
              {r}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-xl py-3 text-sm font-semibold text-muted-foreground">
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ─── Sensores View ─────────────────────────────────────────────────── */
type SensorStatus = "ok" | "warn" | "crit";

function SensoresView({ unit, started }: { unit: string; started: boolean }) {
  const [sensors, setSensors] = useState({
    motorTemp:   85,
    oilPressure: 55,
    adblue:      92,
    battery:     24.2,
    lastUpdate:  nowHHMM(),
  });

  useEffect(() => {
    const id = setInterval(() => {
      setSensors((prev) => ({
        motorTemp:   Math.round(clamp(prev.motorTemp   + (Math.random() - 0.45) * 4,   72, 102) * 10) / 10,
        oilPressure: Math.round(clamp(prev.oilPressure + (Math.random() - 0.5)  * 3,   38, 72)),
        adblue:      prev.adblue,
        battery:     Math.round(clamp(prev.battery     + (Math.random() - 0.5)  * 0.4, 22, 28) * 10) / 10,
        lastUpdate:  nowHHMM(),
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const motorSt: SensorStatus = sensors.motorTemp   < 95   ? "ok" : sensors.motorTemp   < 102 ? "warn" : "crit";
  const oilSt:   SensorStatus = sensors.oilPressure > 40   ? "ok" : sensors.oilPressure > 30  ? "warn" : "crit";
  const battSt:  SensorStatus = sensors.battery     > 23.5 ? "ok" : sensors.battery     > 22  ? "warn" : "crit";

  const overallBad  = [motorSt, oilSt, battSt].includes("crit");
  const overallWarn = !overallBad && [motorSt, oilSt, battSt].includes("warn");

  return (
    <div className="mt-5 space-y-5">
      {/* Status header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Unidad <strong className="text-foreground">{unit}</strong>
            {" · "}
            <span className={overallBad ? "font-bold text-destructive" : overallWarn ? "font-bold text-yellow-600" : "font-bold text-primary"}>
              {overallBad ? "Atención Requerida" : overallWarn ? "Revisión Preventiva" : "Estado General: Óptimo"}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {started ? "Monitoreo activo durante ruta" : "Bus en espera · sensores en standby"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          LIVE · {sensors.lastUpdate}
        </div>
      </div>

      {/* Motor */}
      <SensorCard title="Motor" icon={Thermometer}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SensorGauge
            label="Temperatura del Motor"
            value={`${sensors.motorTemp}°C`}
            status={motorSt}
            okLabel="Óptimo"
            pct={sensors.motorTemp / 110}
          />
          <SensorGauge
            label="Presión de Aceite"
            value={`${sensors.oilPressure} PSI`}
            status={oilSt}
            okLabel="Estable"
            pct={sensors.oilPressure / 80}
          />
          <SensorGauge
            label="Nivel de AdBlue"
            value={`${sensors.adblue}%`}
            status="ok"
            okLabel="Suficiente"
            pct={sensors.adblue / 100}
          />
        </div>
      </SensorCard>

      {/* Eléctrico */}
      <SensorCard title="Eléctrico" icon={BatteryCharging}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Voltaje Batería</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{sensors.battery}V</span>
              <StatusBadge status={battSt} okLabel="Normal" />
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-700 ${battSt === "ok" ? "bg-primary" : battSt === "warn" ? "bg-yellow-500" : "bg-destructive"}`}
                style={{ width: `${Math.round(((sensors.battery - 22) / 6) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Alternador</p>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-base font-bold text-primary">Cargando</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">28.4V · 90A salida</p>
          </div>
        </div>
      </SensorCard>

      {/* Chasis y Seguridad */}
      <SensorCard title="Chasis y Seguridad" icon={Shield}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" /> Frenos
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">80% vida útil</span>
              <StatusBadge status="ok" okLabel="OK" />
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[80%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="space-y-1.5 rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Thermometer className="h-3.5 w-3.5" /> Temp. Frenos
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">142°C</span>
              <StatusBadge status="ok" okLabel="Normal" />
            </div>
            <p className="text-[10px] text-muted-foreground">Rango normal · &lt;300°C</p>
          </div>
          <div className="space-y-1.5 rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> Suspensión
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Calibrada</span>
              <StatusBadge status="ok" okLabel="Óptima" />
            </div>
            <p className="text-[10px] text-muted-foreground">Nivelación automática activa</p>
          </div>
        </div>
      </SensorCard>

      {/* Efficiency banner */}
      <div className="relative overflow-hidden rounded-[24px] border border-primary/20 bg-primary/5 p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Eficiencia en Tiempo Real</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            El monitoreo continuo reduce un 15% el consumo y previene fallos mecánicos inesperados.
          </p>
        </div>
        <div className="flex-shrink-0 rounded-xl border border-primary/20 bg-card px-4 py-2 text-xs font-bold text-primary">
          Ver Histórico
        </div>
        <BarChart3 className="absolute -bottom-3 -right-3 h-20 w-20 text-primary opacity-5" />
      </div>
    </div>
  );
}

function SensorCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {title}
      </h3>
      {children}
    </div>
  );
}

function SensorGauge({ label, value, status, okLabel, pct }: {
  label: string; value: string; status: SensorStatus; okLabel: string; pct: number;
}) {
  const barCls = status === "ok" ? "bg-primary" : status === "warn" ? "bg-yellow-500" : "bg-destructive";
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-foreground">{value}</span>
        <StatusBadge status={status} okLabel={okLabel} />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barCls}`}
          style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status, okLabel }: { status: SensorStatus; okLabel: string }) {
  const map: Record<SensorStatus, { label: string; cls: string }> = {
    ok:   { label: okLabel,    cls: "bg-primary/10 text-primary" },
    warn: { label: "Atención", cls: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
    crit: { label: "Crítico",  cls: "bg-destructive/10 text-destructive" },
  };
  const { label, cls } = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${cls}`}>{label}</span>;
}
