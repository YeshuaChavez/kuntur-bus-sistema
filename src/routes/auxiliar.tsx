import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoleShell } from "@/components/jaysi/RoleShell";
import { SeatMap, type Seat } from "@/components/jaysi/SeatMap";
import {
  ScanLine, Grid3x3, Wifi, WifiOff, CheckCircle2, Users, Phone, BadgeCheck,
  Bus, ArrowRight, Clock, CalendarClock, Flag, ChevronRight, LogOut, MapPin,
  AlertCircle, UserMinus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auxiliar")({
  head: () => ({
    meta: [
      { title: "Auxiliar · JAYSI" },
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
  departure: string; // HH:MM
  arrival: string;
  date: string; // YYYY-MM-DD
};

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const TRIPS: TripOption[] = [
  { id: "JY-104", bus: "JY-104", origin: "Lima",     destination: "Trujillo", departure: "06:30", arrival: "11:45", date: today() },
  { id: "JY-220", bus: "JY-220", origin: "Lima",     destination: "Arequipa", departure: "14:00", arrival: "00:30", date: today() },
  { id: "JY-318", bus: "JY-318", origin: "Trujillo", destination: "Lima",     departure: "22:30", arrival: "03:45", date: today() },
  { id: "JY-405", bus: "JY-405", origin: "Lima",     destination: "Ica",      departure: "07:15", arrival: "11:30", date: tomorrow() },
  { id: "JY-512", bus: "JY-512", origin: "Cusco",    destination: "Puno",     departure: "09:45", arrival: "16:00", date: tomorrow() },
];

function buildSeats(): Seat[] {
  const boarded = new Set(["1A", "1B", "2A", "3C", "4B", "5D"]);
  const sold = new Set(["2B", "4A", "6C", "7B", "8D", "9A", "10C"]);
  const list: Seat[] = [];
  for (let r = 1; r <= 10; r++) {
    (["A", "B", "C", "D"] as const).forEach((c, i) => {
      const id = `${r}${c}`;
      const status: Seat["status"] = boarded.has(id) ? "boarded" : sold.has(id) ? "sold" : "free";
      list.push({ id, row: r, col: i + 1, status, passenger: sold.has(id) || boarded.has(id) ? "Pasajero #" + id : undefined });
    });
  }
  return list;
}

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

  return (
    <ActiveTripView
      trip={trip}
      auxName={auxName}
      onFinish={() => setStage("upcoming")}
    />
  );
}

function AuxBadge({ name }: { name: string }) {
  return (
    <span className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground sm:inline-flex">
      <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {name}
    </span>
  );
}

/* ---------------------------- Selector de viaje ---------------------------- */

export function TripPicker({
  title, subtitle, onPick,
}: { title: string; subtitle: string; onPick: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border bg-[image:var(--gradient-primary)] p-5 text-primary-foreground shadow-[var(--shadow-soft)]">
        <div className="text-[10px] uppercase tracking-wider opacity-80">Inicio de turno</div>
        <h1 className="mt-1 text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm opacity-90">{subtitle}</p>
      </div>

      <div className="mt-4 space-y-2.5">
        {TRIPS.filter((t) => t.date === today()).map((t) => (
          <TripRow key={t.id} trip={t} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

function TripRow({ trip, onPick }: { trip: TripOption; onPick: (id: string) => void }) {
  return (
    <button
      onClick={() => onPick(trip.id)}
      className="group flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
          <Bus className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            {trip.origin} <ArrowRight className="h-3.5 w-3.5 text-primary" /> {trip.destination}
          </div>
          <div className="text-xs text-muted-foreground">
            Bus {trip.bus} · {trip.departure} → {trip.arrival}
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

/* --------------------------- Próximos viajes UI --------------------------- */

function minutesUntil(dateStr: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const target = new Date(`${dateStr}T${hhmm}:00`);
  target.setHours(h, m, 0, 0);
  return Math.max(0, Math.round((target.getTime() - Date.now()) / 60000));
}

function formatRemaining(min: number) {
  if (min <= 0) return "Listo para abordar";
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return `en ${d}d ${h}h`;
  if (h > 0) return `en ${h}h ${m}m`;
  return `en ${m} min`;
}

export function UpcomingTrips({
  finishedTripLabel, onPickNext,
}: { finishedTripLabel: string; onPickNext: (id: string) => void }) {
  // Re-render cada 30s para refrescar el countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Mostramos los siguientes (excluye los que ya pasaron hoy)
  const upcoming = TRIPS
    .map((t) => ({ ...t, remaining: minutesUntil(t.date, t.departure) }))
    .filter((t) => t.remaining > 0 || t.date > today())
    .sort((a, b) => (a.date + a.departure).localeCompare(b.date + b.departure));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 text-[var(--success)]">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Viaje finalizado</span>
        </div>
        <div className="mt-1 text-base font-bold text-foreground">{finishedTripLabel}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">El reporte se envió a la oficina. ¡Buen trabajo!</p>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Próximos viajes</h2>
      </div>

      <div className="mt-3 space-y-2.5">
        {upcoming.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No hay más viajes asignados. ¡Descansa!
          </div>
        )}
        {upcoming.map((t) => (
          <div
            key={t.id + t.date}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {t.origin} <ArrowRight className="h-3.5 w-3.5 text-primary" /> {t.destination}
                </div>
                <div className="text-xs text-muted-foreground">
                  Bus {t.bus} · sale {t.departure} {t.date > today() ? "(mañana)" : ""}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs font-semibold text-primary">
                <Clock className="h-3.5 w-3.5" /> {formatRemaining(t.remaining)}
              </div>
              <button
                onClick={() => onPickNext(t.id)}
                className="mt-1 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
              >
                Iniciar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Vista activa (turno) -------------------------- */

type Stop = {
  name: string;
  scheduled: string;
  passengers: { seat: string; name: string; off: boolean }[];
  done: boolean;
};

function buildStops(): Stop[] {
  return [
    {
      name: "Huacho", scheduled: "08:10", done: true,
      passengers: [
        { seat: "1A", name: "Carlos R.", off: true },
        { seat: "2B", name: "Lucía M.",  off: true },
      ],
    },
    {
      name: "Barranca", scheduled: "09:25", done: false,
      passengers: [
        { seat: "3C", name: "María L.",   off: false },
        { seat: "4B", name: "Pedro S.",   off: false },
        { seat: "5D", name: "Andrea V.",  off: false },
      ],
    },
    {
      name: "Chimbote", scheduled: "11:40", done: false,
      passengers: [
        { seat: "6C", name: "Jorge T.",   off: false },
        { seat: "7B", name: "Sofía N.",   off: false },
      ],
    },
    {
      name: "Trujillo", scheduled: "15:20", done: false,
      passengers: [
        { seat: "8D", name: "Ricardo P.", off: false },
        { seat: "9A", name: "Elena G.",   off: false },
        { seat: "10C", name: "Manuel B.", off: false },
      ],
    },
  ];
}

function ActiveTripView({
  trip, auxName, onFinish,
}: { trip: TripOption; auxName: string; onFinish: () => void }) {
  const [tab, setTab] = useState<"scan" | "map" | "off">("scan");
  const [online, setOnline] = useState(true);
  const [stops, setStops] = useState<Stop[]>(buildStops);
  const seats = buildSeats();
  const boarded = seats.filter((s) => s.status === "boarded").length;
  const sold = seats.filter((s) => s.status === "sold").length;
  const emergency = "+51 998 123 456";

  const totalToOff = stops.reduce((acc, s) => acc + s.passengers.length, 0);
  const offCount = stops.reduce((acc, s) => acc + s.passengers.filter((p) => p.off).length, 0);
  const currentStopIdx = stops.findIndex((s) => !s.done);

  const togglePassenger = (stopIdx: number, seat: string) => {
    setStops((prev) => prev.map((s, i) => i !== stopIdx ? s : {
      ...s,
      passengers: s.passengers.map((p) => p.seat === seat ? { ...p, off: !p.off } : p),
    }));
  };

  const closeStop = (stopIdx: number) => {
    setStops((prev) => prev.map((s, i) => i !== stopIdx ? s : {
      ...s,
      done: true,
      passengers: s.passengers.map((p) => ({ ...p, off: true })),
    }));
  };

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
              online
                ? "bg-secondary text-[var(--success)]"
                : "bg-[var(--warning)]/20 text-[var(--warning-foreground)]"
            }`}
          >
            {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {online ? "Online" : "Offline · sync"}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-md pb-28">
        <div className="mb-4 grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-border bg-[image:var(--gradient-primary)] p-4 text-primary-foreground shadow-[var(--shadow-soft)]">
          <div>
            <div className="text-[10px] uppercase tracking-wider opacity-80">Auxiliar de turno</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-lg font-bold">
              <BadgeCheck className="h-4 w-4" /> {auxName}
            </div>
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

        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Bus {trip.bus} · {trip.departure}</div>
              <div className="mt-0.5 text-base font-bold text-foreground">{trip.origin} → {trip.destination}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Abordaje</div>
              <div className="text-base font-bold text-primary">{boarded}/{boarded + sold}</div>
            </div>
          </div>
        </div>

        {/* KPIs extra */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat icon={CheckCircle2} label="Validados" value={boarded.toString()} />
          <Stat icon={Users} label="Pendientes" value={sold.toString()} />
          <Stat icon={LogOut} label="Bajaron" value={`${offCount}/${totalToOff}`} />
        </div>

        <div className="mt-4 grid grid-cols-3 rounded-xl border border-border bg-muted p-1">
          <button
            onClick={() => setTab("scan")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-colors ${
              tab === "scan" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <ScanLine className="h-4 w-4" /> Escáner
          </button>
          <button
            onClick={() => setTab("map")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-colors ${
              tab === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Grid3x3 className="h-4 w-4" /> Mapa
          </button>
          <button
            onClick={() => setTab("off")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-colors ${
              tab === "off" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <UserMinus className="h-4 w-4" /> Bajadas
          </button>
        </div>

        {tab === "scan" && <Scanner />}
        {tab === "map" && <div className="mt-4"><SeatMap seats={seats} variant="operator" /></div>}
        {tab === "off" && (
          <DropoffPanel
            stops={stops}
            currentIdx={currentStopIdx === -1 ? stops.length : currentStopIdx}
            onToggle={togglePassenger}
            onClose={closeStop}
          />
        )}

        {/* Aviso operativo */}
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--warning-foreground)]" />
          <div className="text-xs text-foreground">
            <strong>Recordatorio:</strong> verifica DNI del pasajero al retirar equipaje en cada parada.
          </div>
        </div>
      </div>

      {/* Botón Finalizar viaje */}
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

function DropoffPanel({
  stops, currentIdx, onToggle, onClose,
}: {
  stops: Stop[];
  currentIdx: number;
  onToggle: (stopIdx: number, seat: string) => void;
  onClose: (stopIdx: number) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      {stops.map((s, i) => {
        const off = s.passengers.filter((p) => p.off).length;
        const total = s.passengers.length;
        const isCurrent = i === currentIdx;
        const allOff = off === total && total > 0;
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
                <span className="rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--success)]">
                  Cerrada
                </span>
              ) : isCurrent ? (
                <span className="animate-pulse rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Actual
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pendiente
                </span>
              )}
            </div>

            <ul className="divide-y divide-border">
              {s.passengers.map((p) => (
                <li key={p.seat} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground">
                      {p.seat}
                    </span>
                    <span className={`text-sm font-medium ${p.off ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {p.name}
                    </span>
                  </div>
                  <button
                    onClick={() => !s.done && onToggle(i, p.seat)}
                    disabled={s.done}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      p.off
                        ? "bg-[var(--success)]/15 text-[var(--success)]"
                        : "bg-primary text-primary-foreground hover:opacity-90"
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

function Scanner() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-foreground/95 p-4 shadow-[var(--shadow-card)]">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.6)_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2">
          {[
            "top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-xl",
            "top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-xl",
            "bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-xl",
            "bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-xl",
          ].map((c) => (
            <div key={c} className={`absolute h-10 w-10 border-[var(--primary-glow)] ${c}`} />
          ))}
          <div className="absolute inset-x-2 top-1/2 h-0.5 animate-pulse rounded-full bg-[var(--primary-glow)] shadow-[0_0_12px_var(--primary-glow)]" />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-4 py-1.5 text-xs font-medium text-background backdrop-blur">
          Apunta al código QR del pasajero
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary p-3 text-sm">
        <div className="flex items-center gap-2 text-secondary-foreground">
          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          <span className="font-semibold">Último: Asiento 3C · María L.</span>
        </div>
        <span className="text-xs text-muted-foreground">hace 12s</span>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-0.5 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
