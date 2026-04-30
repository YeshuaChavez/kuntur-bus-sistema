import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SeatMap, type Seat } from "@/components/jaysi/SeatMap";
import { Logo } from "@/components/jaysi/Logo";
import { useAuth, roleHome } from "@/lib/auth";
import {
  ArrowRight, Calendar, MapPin, Search, Users, X, QrCode, Clock, Bus, Leaf,
  LogIn, LogOut, ShieldCheck, AlertCircle, ArrowLeftRight, Sparkles, CreditCard, ChevronRight,
  IdCard, User as UserIcon, Lock, CheckCircle2, Crown, Moon, BedDouble, Star,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JAYSI — Compra tu pasaje en segundos" },
      { name: "description", content: "Busca rutas, elige tu asiento en tiempo real y obtén tu boleto digital con QR." },
    ],
  }),
  component: HomeBooking,
});

const cities = ["Lima", "Trujillo", "Arequipa", "Cusco", "Piura", "Ica", "Puno", "Chiclayo", "Tacna"];

const tripsBase = [
  { id: "1", time: "06:30", arr: "11:45", price: 42, type: "Ejecutivo", seats: 18, dur: "5h 15m" },
  { id: "2", time: "09:15", arr: "14:30", price: 38, type: "Cama",      seats: 6,  dur: "5h 15m" },
  { id: "3", time: "14:00", arr: "19:15", price: 45, type: "Premium",   seats: 22, dur: "5h 15m" },
  { id: "4", time: "22:30", arr: "03:45", price: 36, type: "Cama nocturna", seats: 11, dur: "5h 15m" },
];

// Estilos visuales por tipo de viaje — diferenciador claro de servicio
export const tripStyles: Record<
  string,
  { icon: any; label: string; gradient: string; ring: string; chip: string; accent: string; tagline: string }
> = {
  Premium: {
    icon: Crown,
    label: "Premium",
    gradient: "linear-gradient(135deg, oklch(0.78 0.14 85), oklch(0.68 0.16 50))",
    ring: "ring-2 ring-[oklch(0.72_0.15_70)]/60",
    chip: "bg-[oklch(0.72_0.15_70)]/15 text-[oklch(0.45_0.13_60)] border border-[oklch(0.72_0.15_70)]/40",
    accent: "text-[oklch(0.55_0.14_65)]",
    tagline: "Servicio VIP · snack incluido",
  },
  Ejecutivo: {
    icon: Star,
    label: "Ejecutivo",
    gradient: "linear-gradient(135deg, oklch(0.62 0.13 230), oklch(0.55 0.14 250))",
    ring: "ring-1 ring-[oklch(0.6_0.13_240)]/40",
    chip: "bg-[oklch(0.6_0.13_240)]/12 text-[oklch(0.4_0.13_245)] border border-[oklch(0.6_0.13_240)]/35",
    accent: "text-[oklch(0.5_0.13_240)]",
    tagline: "Asiento amplio · WiFi",
  },
  Cama: {
    icon: BedDouble,
    label: "Cama",
    gradient: "linear-gradient(135deg, oklch(0.62 0.13 150), oklch(0.5 0.14 160))",
    ring: "ring-1 ring-primary/40",
    chip: "bg-primary/12 text-primary border border-primary/30",
    accent: "text-primary",
    tagline: "Reclinable 160°",
  },
  "Cama nocturna": {
    icon: Moon,
    label: "Cama nocturna",
    gradient: "linear-gradient(135deg, oklch(0.4 0.1 280), oklch(0.3 0.09 270))",
    ring: "ring-1 ring-[oklch(0.45_0.1_275)]/40",
    chip: "bg-[oklch(0.45_0.1_275)]/15 text-[oklch(0.38_0.1_275)] border border-[oklch(0.45_0.1_275)]/35",
    accent: "text-[oklch(0.42_0.1_275)]",
    tagline: "Reclinable 180° · manta",
  },
};

function getTripStyle(type: string) {
  return tripStyles[type] ?? tripStyles.Ejecutivo;
}

function makeSeats(): Seat[] {
  const occupied = new Set(["1A", "2B", "3C", "4D", "6A", "7C", "9B", "5A"]);
  const list: Seat[] = [];
  for (let r = 1; r <= 10; r++) {
    (["A", "B", "C", "D"] as const).forEach((c, i) => {
      const id = `${r}${c}`;
      list.push({ id, row: r, col: i + 1, status: occupied.has(id) ? "occupied" : "free" });
    });
  }
  return list;
}

function HomeBooking() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Si el usuario logueado NO es cliente, lo redirigimos a su panel.
  useEffect(() => {
    if (user && user.role !== "cliente") {
      navigate({ to: roleHome(user.role) });
    }
  }, [user, navigate]);

  const [origin, setOrigin] = useState("Lima");
  const [destination, setDestination] = useState("Trujillo");
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [pax, setPax] = useState(1);

  const [step, setStep] = useState<"search" | "trips" | "seats" | "passengers" | "payment" | "ticket">("search");
  const [tripId, setTripId] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>(makeSeats);
  const [authBlock, setAuthBlock] = useState(false);
  const [passengers, setPassengers] = useState<{ dni: string; name: string }[]>([]);
  const [payment, setPayment] = useState<{ method: "card" | "yape" | "plin"; card: string; exp: string; cvv: string }>({
    method: "card", card: "", exp: "", cvv: "",
  });

  const trip = useMemo(() => tripsBase.find((t) => t.id === tripId) ?? tripsBase[0], [tripId]);
  const selected = seats.filter((s) => s.status === "selected");
  const total = selected.length * trip.price;

  const toggleSeat = (id: string) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.id === id && s.status !== "occupied"
          ? { ...s, status: s.status === "selected" ? "free" : "selected" }
          : s,
      ),
    );
  };

  const swap = () => { setOrigin(destination); setDestination(origin); };

  const goPay = () => {
    if (!selected.length) return;
    if (!user || user.role !== "cliente") {
      setAuthBlock(true);
      return;
    }
    setPassengers(selected.map((s) => ({ dni: "", name: "" })));
    setStep("passengers");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[460px] opacity-60"
        style={{ background: "var(--gradient-soft)" }}
      />

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        {step === "search" && (
          <Hero
            origin={origin} destination={destination} date={date} pax={pax}
            setOrigin={setOrigin} setDestination={setDestination} setDate={setDate} setPax={setPax}
            swap={swap} onSearch={() => setStep("trips")}
          />
        )}

        {step !== "search" && (
          <Stepper step={step} />
        )}

        {step === "trips" && (
          <TripsList
            origin={origin} destination={destination} date={date}
            onPick={(id) => { setTripId(id); setStep("seats"); }}
            onBack={() => setStep("search")}
          />
        )}

        {step === "seats" && (
          <SeatStep
            trip={trip} seats={seats} selected={selected} total={total}
            toggleSeat={toggleSeat} onBack={() => setStep("trips")} onPay={goPay}
            user={user}
          />
        )}

        {step === "passengers" && (
          <PassengersStep
            selected={selected}
            passengers={passengers}
            setPassengers={setPassengers}
            total={total}
            onBack={() => setStep("seats")}
            onNext={() => setStep("payment")}
          />
        )}

        {step === "payment" && (
          <PaymentStep
            total={total}
            payment={payment}
            setPayment={setPayment}
            onBack={() => setStep("passengers")}
            onPay={() => setStep("ticket")}
          />
        )}

        {step === "ticket" && (
          <Ticket selected={selected} trip={trip} origin={origin} destination={destination} date={date}
            passengers={passengers}
            onNew={() => { setStep("search"); setSeats(makeSeats()); }} user={user!}
          />
        )}
      </main>

      {authBlock && (
        <AuthBlockModal
          onClose={() => setAuthBlock(false)}
          onLogin={() => navigate({ to: "/login", search: { redirect: "/" } })}
          user={user}
        />
      )}
    </div>
  );
}

/* --------------------------------- Header --------------------------------- */

function Header({ user, onLogout }: { user: ReturnType<typeof useAuth>["user"]; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/"><Logo /></Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {user.name} · {user.role}
              </span>
              {user.role !== "cliente" && (
                <Link
                  to={roleHome(user.role) as any}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Mi panel
                </Link>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="h-3.5 w-3.5" /> Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              search={{ redirect: "/" }}
              className="flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-primary)] px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-elegant)]"
            >
              <LogIn className="h-4 w-4" /> Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero(props: {
  origin: string; destination: string; date: Date; pax: number;
  setOrigin: (v: string) => void; setDestination: (v: string) => void; setDate: (v: Date) => void; setPax: (v: number) => void;
  swap: () => void; onSearch: () => void;
}) {
  return (
    <>
      <section className="pt-10 text-center sm:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          <Leaf className="h-3.5 w-3.5" /> Transporte sostenible
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          Tu próximo viaje, <br className="sm:hidden" />
          <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">a un toque de distancia.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Compara rutas, elige tu asiento en vivo y recibe tu boleto digital al instante.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-elegant)] sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_1fr_auto]">
          <CitySelect icon={MapPin} label="Origen" value={props.origin} onChange={props.setOrigin} />
          <button
            onClick={props.swap}
            className="hidden h-full items-center justify-center rounded-xl border border-border bg-background px-3 text-muted-foreground transition-all hover:rotate-180 hover:border-primary hover:text-primary lg:flex"
            aria-label="Intercambiar"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <CitySelect icon={MapPin} label="Destino" value={props.destination} onChange={props.setDestination} />
          <DatePickerField value={props.date} onChange={props.setDate} />
          <button
            onClick={props.onSearch}
            className="group flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-6 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-elegant)]"
          >
            <Search className="h-4 w-4" /> Buscar
          </button>
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { i: Sparkles, t: "Asientos en tiempo real", d: "Mira disponibilidad al instante." },
          { i: ShieldCheck, t: "Compra protegida", d: "Confirmación instantánea con QR." },
          { i: CreditCard, t: "Sin sorpresas", d: "Precio final, sin recargos ocultos." },
        ].map((b) => (
          <div key={b.t} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <b.i className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{b.t}</div>
              <div className="text-xs text-muted-foreground">{b.d}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Rutas populares</h2>
          <span className="text-xs text-muted-foreground">Toca para reservar rápido</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { o: "Lima", d: "Trujillo", p: 38 },
            { o: "Lima", d: "Arequipa", p: 65 },
            { o: "Cusco", d: "Puno", p: 45 },
            { o: "Lima", d: "Ica", p: 28 },
            { o: "Trujillo", d: "Piura", p: 42 },
            { o: "Arequipa", d: "Tacna", p: 35 },
          ].map((r) => (
            <button
              key={r.o + r.d}
              onClick={() => { props.setOrigin(r.o); props.setDestination(r.d); props.onSearch(); }}
              className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
            >
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {r.o} <ArrowRight className="h-3.5 w-3.5 text-primary" /> {r.d}
                </div>
                <div className="text-xs text-muted-foreground">Desde S/ {r.p}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function CitySelect({ icon: Icon, label, value, onChange }: { icon: any; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-background px-3.5 py-2.5 transition-colors focus-within:border-primary">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-base font-bold text-foreground outline-none"
      >
        {cities.map((c) => <option key={c}>{c}</option>)}
      </select>
    </label>
  );
}

function Field({ icon: Icon, label, value, onChange }: { icon: any; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-background px-3.5 py-2.5 transition-colors focus-within:border-primary">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-base font-bold text-foreground outline-none"
      />
    </label>
  );
}

function DatePickerField({ value, onChange }: { value: Date; onChange: (v: Date) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex flex-col gap-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-left transition-colors hover:border-primary focus:border-primary focus:outline-none"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3 w-3" /> Fecha
          </span>
          <span className="text-base font-bold capitalize text-foreground">
            {format(value, "EEE d MMM yyyy", { locale: es })}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <CalendarPicker
          mode="single"
          selected={value}
          onSelect={(d) => d && onChange(d)}
          disabled={(d) => d < today}
          initialFocus
          locale={es}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function PaxSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-background px-3.5 py-2.5 transition-colors focus-within:border-primary">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Users className="h-3 w-3" /> Pax
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent text-base font-bold text-foreground outline-none"
      >
        {[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>
  );
}

/* --------------------------------- Stepper --------------------------------- */

function Stepper({ step }: { step: string }) {
  const steps = ["search", "trips", "seats", "passengers", "payment", "ticket"];
  const labels = ["Buscar", "Viajes", "Asientos", "Datos", "Pago", "Boleto"];
  const idx = steps.indexOf(step);
  return (
    <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-2">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-sm ${i === idx ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{l}</span>
          {i < labels.length - 1 && <div className="h-px w-6 bg-border sm:w-10" />}
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- Trips --------------------------------- */

function TripsList({ origin, destination, date, onPick, onBack }: {
  origin: string; destination: string; date: Date; onPick: (id: string) => void; onBack: () => void;
}) {
  const dateLabel = format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Modificar búsqueda</button>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{origin} → {destination}</h2>
          <p className="text-sm capitalize text-muted-foreground">{tripsBase.length} viajes · {dateLabel}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {tripsBase.map((t) => {
          const s = getTripStyle(t.type);
          const Icon = s.icon;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className={cn(
                "group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]",
                s.ring,
              )}
            >
              {/* franja lateral con el color del servicio */}
              <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: s.gradient }} />
              <div className="flex items-center gap-4 pl-2">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
                  style={{ background: s.gradient }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{t.time}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold text-foreground">{t.arr}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.chip)}>
                      <Icon className="h-3 w-3" /> {s.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.tagline} · {t.dur} · {t.seats} asientos libres</div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-2xl font-bold", s.accent)}>S/ {t.price}</div>
                <div className="text-xs text-muted-foreground">por persona</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- Seats --------------------------------- */

function SeatStep({ trip, seats, selected, total, toggleSeat, onBack, onPay, user }: {
  trip: typeof tripsBase[number]; seats: Seat[]; selected: Seat[]; total: number;
  toggleSeat: (id: string) => void; onBack: () => void; onPay: () => void;
  user: ReturnType<typeof useAuth>["user"];
}) {
  const isClient = user?.role === "cliente";
  const s = getTripStyle(trip.type);
  const Icon = s.icon;
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Volver a viajes</button>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Elige tu asiento</h2>
        <p className="text-sm text-muted-foreground">Selección libre · toca para reservar</p>
        <div className="mt-5">
          <SeatMap seats={seats} onSelect={toggleSeat} variant="client" />
        </div>
      </div>
      <aside className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24 lg:h-fit">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tu reserva</h3>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.chip)}>
            <Icon className="h-3 w-3" /> {s.label}
          </span>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <Row k="Viaje" v={`${trip.time} · ${trip.type}`} />
          <Row k="Asientos" v={selected.length ? selected.map((s) => s.id).join(", ") : "—"} />
          <Row k="Precio unit." v={`S/ ${trip.price}`} />
        </div>
        <div className="my-4 h-px bg-border" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-foreground">S/ {total}</span>
        </div>

        {!isClient && selected.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/15 p-3 text-xs text-[var(--warning-foreground)]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Para pagar necesitas iniciar sesión como <strong>cliente</strong>.</span>
          </div>
        )}

        <button
          disabled={!selected.length}
          onClick={onPay}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-elegant)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CreditCard className="h-4 w-4" /> Pagar S/ {total}
        </button>
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}

/* ------------------------------ Auth block modal ------------------------------ */

function AuthBlockModal({ onClose, onLogin, user }: {
  onClose: () => void; onLogin: () => void; user: ReturnType<typeof useAuth>["user"];
}) {
  const wrongRole = user && user.role !== "cliente";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${wrongRole ? "bg-destructive/15 text-destructive" : "bg-secondary text-primary"}`}>
              {wrongRole ? <AlertCircle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {wrongRole ? "Cuenta no permitida" : "Inicia sesión para pagar"}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {wrongRole
                  ? `Tu cuenta de ${user!.role} no puede comprar pasajes. Cambia a una cuenta de cliente.`
                  : "Solo los clientes registrados pueden completar la compra. 🌿"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-2">
          <button
            onClick={onLogin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)]"
          >
            <LogIn className="h-4 w-4" /> {wrongRole ? "Cambiar de cuenta" : "Iniciar sesión"}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-border bg-background py-3 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Seguir explorando
          </button>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Demo: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">cliente@jaysi.com</code> · <code className="rounded bg-muted px-1.5 py-0.5 font-mono">demo</code>
        </p>
      </div>
    </div>
  );
}

/* --------------------------------- Ticket --------------------------------- */

function Ticket({ selected, trip, origin, destination, date, passengers, onNew, user }: {
  selected: Seat[]; trip: typeof tripsBase[number]; origin: string; destination: string; date: Date;
  passengers?: { dni: string; name: string }[];
  onNew: () => void; user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  const dateLabel = format(date, "d MMM yyyy", { locale: es });
  const s = getTripStyle(trip.type);
  const Icon = s.icon;
  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
        <ShieldCheck className="h-3.5 w-3.5" /> Pago confirmado · {user.name}
      </div>
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="p-6 text-white" style={{ background: s.gradient }}>
          <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-90">
            <span className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {s.label}</span>
            <span>JAYSI · 2026</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold">{origin}</div>
              <div className="text-xs opacity-90">{trip.time} · {dateLabel}</div>
            </div>
            <ArrowRight className="h-5 w-5" />
            <div className="text-right">
              <div className="text-3xl font-bold">{destination}</div>
              <div className="text-xs opacity-90">{trip.arr} · {dateLabel}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center p-6">
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-secondary p-5">
            <div className="grid h-44 w-44 grid-cols-8 grid-rows-8 gap-0.5">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`${(i * 7) % 3 === 0 ? "bg-foreground" : "bg-transparent"} rounded-[2px]`} />
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <QrCode className="h-3.5 w-3.5" /> Muéstralo al auxiliar
          </div>
          <div className="mt-5 grid w-full grid-cols-3 gap-3 border-t border-dashed border-border pt-5 text-center">
            <Mini k="Asientos" v={selected.map((s) => s.id).join(", ")} />
            <Mini k="Bus" v="JY-104" />
            <Mini k="Total" v={`S/ ${selected.length * trip.price}`} />
          </div>
          {passengers && passengers.length > 0 && (
            <div className="mt-4 w-full rounded-xl bg-secondary p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pasajeros</div>
              <ul className="mt-1 space-y-0.5 text-xs font-medium text-foreground">
                {passengers.map((p, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span className="truncate">{p.name || "—"}</span>
                    <span className="whitespace-nowrap text-muted-foreground">DNI {p.dni || "—"} · {selected[i]?.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--success)]">
            <Clock className="h-3.5 w-3.5" /> Llega 30 min antes de la salida
          </div>
        </div>
      </div>
      <button
        onClick={onNew}
        className="mt-6 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Comprar otro pasaje
      </button>
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-sm font-bold text-foreground">{v}</div>
    </div>
  );
}

/* ------------------------------ Passengers Step ------------------------------ */

function PassengersStep({ selected, passengers, setPassengers, total, onBack, onNext }: {
  selected: Seat[];
  passengers: { dni: string; name: string }[];
  setPassengers: (p: { dni: string; name: string }[]) => void;
  total: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const update = (i: number, patch: Partial<{ dni: string; name: string }>) => {
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };
  const valid = passengers.every((p) => /^\d{8}$/.test(p.dni) && p.name.trim().length >= 3);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Volver a asientos</button>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Datos de los pasajeros</h2>
        <p className="text-sm text-muted-foreground">Necesitamos esta información por requerimiento de transporte.</p>

        <div className="mt-5 space-y-4">
          {passengers.map((p, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
                  Pasajero · Asiento {selected[i]?.id}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldInput
                  icon={IdCard} label="DNI" placeholder="12345678" maxLength={8}
                  value={p.dni}
                  onChange={(v) => update(i, { dni: v.replace(/\D/g, "").slice(0, 8) })}
                />
                <FieldInput
                  icon={UserIcon} label="Nombre completo" placeholder="María López"
                  value={p.name}
                  onChange={(v) => update(i, { name: v })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24 lg:h-fit">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resumen</h3>
        <div className="mt-4 space-y-2 text-sm">
          <Row k="Asientos" v={selected.map((s) => s.id).join(", ")} />
          <Row k="Pasajeros" v={passengers.length.toString()} />
        </div>
        <div className="my-4 h-px bg-border" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-foreground">S/ {total}</span>
        </div>
        <button
          disabled={!valid}
          onClick={onNext}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-elegant)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar al pago <ArrowRight className="h-4 w-4" />
        </button>
        {!valid && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Completa DNI (8 dígitos) y nombre de cada pasajero.</p>
        )}
      </aside>
    </div>
  );
}

function FieldInput({ icon: Icon, label, value, onChange, placeholder, maxLength }: {
  icon: any; label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-background px-3.5 py-2.5 transition-colors focus-within:border-primary">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
      />
    </label>
  );
}

/* ------------------------------ Payment Step ------------------------------ */

function PaymentStep({ total, payment, setPayment, onBack, onPay }: {
  total: number;
  payment: { method: "card" | "yape" | "plin"; card: string; exp: string; cvv: string };
  setPayment: (p: typeof payment) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  const methods: { id: "card" | "yape" | "plin"; label: string; desc: string }[] = [
    { id: "card", label: "Tarjeta", desc: "Visa · Mastercard" },
    { id: "yape", label: "Yape", desc: "Pago instantáneo" },
    { id: "plin", label: "Plin", desc: "Transferencia móvil" },
  ];
  const cardOk =
    payment.method !== "card" ||
    (payment.card.replace(/\s/g, "").length >= 13 && /^\d{2}\/\d{2}$/.test(payment.exp) && /^\d{3,4}$/.test(payment.cvv));

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Volver a datos</button>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Método de pago</h2>
        <p className="text-sm text-muted-foreground">Pago simulado · ningún cargo real.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayment({ ...payment, method: m.id })}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                payment.method === m.id
                  ? "border-primary bg-secondary shadow-[var(--shadow-soft)]"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <CreditCard className="h-4 w-4 text-primary" /> {m.label}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{m.desc}</div>
            </button>
          ))}
        </div>

        {payment.method === "card" && (
          <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <FieldInput
              icon={CreditCard} label="Número de tarjeta" placeholder="4242 4242 4242 4242"
              value={payment.card}
              onChange={(v) =>
                setPayment({
                  ...payment,
                  card: v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
                })
              }
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <FieldInput
                icon={Calendar} label="Vencimiento" placeholder="MM/AA"
                value={payment.exp}
                onChange={(v) => {
                  const d = v.replace(/\D/g, "").slice(0, 4);
                  setPayment({ ...payment, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
                }}
              />
              <FieldInput
                icon={Lock} label="CVV" placeholder="123" maxLength={4}
                value={payment.cvv}
                onChange={(v) => setPayment({ ...payment, cvv: v.replace(/\D/g, "").slice(0, 4) })}
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Conexión segura · datos cifrados
            </div>
          </div>
        )}

        {payment.method !== "card" && (
          <div className="mt-5 rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <QrCode className="h-7 w-7" />
            </div>
            <div className="font-bold text-foreground">Escanea con {payment.method === "yape" ? "Yape" : "Plin"}</div>
            <div className="mt-1 text-xs text-muted-foreground">Confirma el pago de S/ {total} desde tu app.</div>
          </div>
        )}
      </div>

      <aside className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24 lg:h-fit">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">A pagar</h3>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-foreground">S/ {total}</span>
        </div>
        <button
          disabled={!cardOk}
          onClick={onPay}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-elegant)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCircle2 className="h-4 w-4" /> Confirmar pago
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">Pago ficticio para demostración.</p>
      </aside>
    </div>
  );
}
