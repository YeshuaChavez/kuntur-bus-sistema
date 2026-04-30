import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RoleShell } from "@/components/jaysi/RoleShell";
import {
  Play, Pause, Flag, AlertTriangle, MapPin, Clock, Route as RouteIcon,
  Navigation, BadgeCheck, Fuel, Gauge, ThermometerSun, Wind, Users,
  CheckCircle2, Circle, TimerReset,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TripPicker, UpcomingTrips } from "./auxiliar";

export const Route = createFileRoute("/conductor")({
  head: () => ({
    meta: [
      { title: "Conductor · JAYSI" },
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

function ActiveDriverView({
  trip, driverName, onFinish,
}: { trip: ActiveTrip; driverName: string; onFinish: () => void }) {
  const [status, setStatus] = useState("Sin iniciar");
  const [sosOpen, setSosOpen] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [stopTime, setStopTime] = useState<string | null>(null);
  const [paradaCount, setParadaCount] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const started = startTime !== null;

  const pushLog = (label: string) => {
    const time = nowHHMM();
    setLog((l) => [{ label, time }, ...l]);
    return time;
  };

  const handleStart = () => {
    const t = pushLog("Inicio de ruta");
    setStartTime(t);
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

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-primary-foreground/20 pt-4">
            <Mini icon={Clock} k="Inicio" v={startTime ?? "—"} />
            <Mini icon={Pause} k="Últ. parada" v={stopTime ?? "—"} />
            <Mini icon={Flag} k="Estado" v={status} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoCard icon={Gauge} label="Velocidad" value={started ? "82 km/h" : "0 km/h"} tone="primary" />
          <InfoCard icon={Fuel} label="Combustible" value="74%" tone="success" />
          <InfoCard icon={ThermometerSun} label="Clima" value="22° Nublado" />
          <InfoCard icon={Users} label="Pasajeros" value="34/40" />
        </div>

        <RouteMap />

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

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Reporte rápido
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <BigBtn icon={Play} label={startTime ? `Iniciado · ${startTime}` : "Inicio de ruta"} onClick={handleStart} active={status === "En ruta"} />
          <BigBtn icon={Pause} label={stopTime ? `Parada · ${stopTime}` : "Parada técnica"} onClick={handleStop} active={status === "En parada"} disabled={!started} />
          <BigBtn icon={MapPin} label={paradaCount > 0 ? `Parada ${paradaCount}` : "Parada 1"} onClick={handleParada} active={status.startsWith("Parada ")} disabled={!started} />
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <RouteIcon className="h-3.5 w-3.5" /> Plan de paradas
          </h3>
          <ul className="space-y-2.5">
            {plannedStops.map((s, i) => {
              const done = i < reachedStops;
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
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 space-y-2 border-t border-border bg-card/95 p-4 backdrop-blur">
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

function InfoCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone?: "primary" | "success" | "default" }) {
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

function RouteMap() {
  const stops = [
    { x: 60,  y: 380, name: "Lima",     done: true },
    { x: 180, y: 320, name: "Huacho",   done: true },
    { x: 300, y: 280, name: "Barranca", done: true },
    { x: 420, y: 220, name: "Chimbote", done: false, current: true },
    { x: 560, y: 150, name: "Virú",     done: false },
    { x: 700, y: 90,  name: "Trujillo", done: false },
  ];
  const path = stops.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`).join(" ");

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Mapa de ruta</h3>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-destructive">
            <span className="h-1 w-5 rounded-full bg-destructive" /> Camino recomendado (Dijkstra)
          </span>
        </div>
      </div>
      <div className="relative h-[460px] sm:h-[560px] bg-[radial-gradient(ellipse_at_center,_var(--secondary)_0%,_var(--background)_75%)]">
        <svg viewBox="0 0 760 440" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
          <path d="M 60 380 Q 250 420 420 220 T 700 90" stroke="oklch(0.7 0.02 150)" strokeWidth="3" fill="none" strokeDasharray="6 6" opacity="0.5" />
          <path d="M 60 380 Q 200 200 700 90" stroke="oklch(0.7 0.02 150)" strokeWidth="3" fill="none" strokeDasharray="6 6" opacity="0.5" />
          <path
            d={path}
            stroke="oklch(0.62 0.18 28)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 2px 6px oklch(0.62 0.18 28 / 0.4))"
          />
          {stops.map((s) => (
            <g key={s.name}>
              <circle
                cx={s.x}
                cy={s.y}
                r={s.current ? 11 : 7}
                fill={s.current ? "oklch(0.62 0.18 28)" : s.done ? "oklch(0.55 0.13 150)" : "white"}
                stroke={s.current ? "white" : "oklch(0.55 0.13 150)"}
                strokeWidth="3"
              />
              {s.current && (
                <circle cx={s.x} cy={s.y} r="18" fill="none" stroke="oklch(0.62 0.18 28)" strokeWidth="2" opacity="0.5">
                  <animate attributeName="r" from="11" to="26" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={s.x}
                y={s.y - 16}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 13, fontWeight: 700 }}
              >
                {s.name}
              </text>
            </g>
          ))}
        </svg>
        <div className="absolute bottom-2 right-3 flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
          <Navigation className="h-3 w-3 text-destructive" /> Algoritmo Dijkstra · ruta óptima
        </div>
      </div>
    </div>
  );
}

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

function BigBtn({ icon: Icon, label, onClick, active, disabled }: { icon: any; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
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
