import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SeatMap, type Seat } from "@/components/jaysi/SeatMap";
import { Logo } from "@/components/jaysi/Logo";
import { useAuth, roleHome, registerAccount, storeUser } from "@/lib/auth";
import {
  ArrowRight, Calendar, MapPin, Search, Users, X, QrCode, Clock, Bus, Leaf,
  LogIn, LogOut, ShieldCheck, AlertCircle, ArrowLeftRight, Sparkles, CreditCard, ChevronRight,
  IdCard, User as UserIcon, Lock, CheckCircle2, Crown, Moon, BedDouble, Star, SlidersHorizontal,
  Mail, ArrowUpDown, Headphones, Globe, Ticket as TicketIcon,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "KUNTUR — Compra tu pasaje en segundos" },
      { name: "description", content: "Busca rutas, elige tu asiento en tiempo real y obtén tu boleto digital con QR." },
    ],
  }),
  component: HomeBooking,
});

const cities = ["Lima", "Trujillo", "Arequipa", "Cusco", "Piura", "Ica", "Puno", "Chiclayo", "Tacna"];

const tripsBase = [
  { id: "1", time: "06:30", arr: "11:45", price: 42, type: "Ejecutivo",     seats: 18, dur: "5h 15m" },
  { id: "2", time: "09:15", arr: "14:30", price: 38, type: "Cama",          seats: 6,  dur: "5h 15m" },
  { id: "3", time: "14:00", arr: "19:15", price: 45, type: "Premium",       seats: 22, dur: "5h 15m" },
  { id: "4", time: "22:30", arr: "03:45", price: 36, type: "Cama nocturna", seats: 11, dur: "5h 15m" },
];

/* ─── Trip styles — visually distinct per category ─────────────────── */
export const tripStyles: Record<string, {
  icon: any; label: string; gradient: string; ring: string; chip: string; accent: string;
  tagline: string; bgCard: string; borderCard: string; description: string;
}> = {
  Premium: {
    icon: Crown,
    label: "Premium",
    gradient: "linear-gradient(135deg, oklch(0.78 0.14 85), oklch(0.65 0.18 45))",
    ring: "ring-2 ring-amber-300/50",
    chip: "bg-amber-100 text-amber-800 border border-amber-300",
    accent: "text-amber-600",
    tagline: "VIP · snack incluido",
    bgCard: "bg-gradient-to-br from-amber-50 to-orange-50",
    borderCard: "border-amber-200 hover:border-amber-400",
    description: "Asiento VIP reclinable · snack · almohada · cargador USB",
  },
  Ejecutivo: {
    icon: Star,
    label: "Ejecutivo",
    gradient: "linear-gradient(135deg, oklch(0.55 0.14 230), oklch(0.45 0.16 255))",
    ring: "ring-1 ring-blue-300/50",
    chip: "bg-blue-100 text-blue-800 border border-blue-300",
    accent: "text-blue-600",
    tagline: "Asiento amplio · WiFi",
    bgCard: "bg-gradient-to-br from-blue-50 to-indigo-50",
    borderCard: "border-blue-200 hover:border-blue-400",
    description: "Asiento ejecutivo reclinable · WiFi a bordo · toma USB",
  },
  Cama: {
    icon: BedDouble,
    label: "Cama",
    gradient: "linear-gradient(135deg, oklch(0.58 0.13 155), oklch(0.46 0.14 165))",
    ring: "ring-1 ring-emerald-300/50",
    chip: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    accent: "text-emerald-600",
    tagline: "Reclinable 160°",
    bgCard: "bg-gradient-to-br from-emerald-50 to-teal-50",
    borderCard: "border-emerald-200 hover:border-emerald-400",
    description: "Semi-cama 160° · TV individual · frazada · almohada",
  },
  "Cama nocturna": {
    icon: Moon,
    label: "Cama nocturna",
    gradient: "linear-gradient(135deg, oklch(0.42 0.12 280), oklch(0.32 0.1 270))",
    ring: "ring-1 ring-violet-400/50",
    chip: "bg-violet-100 text-violet-800 border border-violet-300",
    accent: "text-violet-700",
    tagline: "Reclinable 180° · manta",
    bgCard: "bg-gradient-to-br from-violet-50 to-purple-50",
    borderCard: "border-violet-200 hover:border-violet-400",
    description: "Cama full 180° · kit de viaje · luz nocturna · snack",
  },
};

function getTripStyle(type: string) {
  return tripStyles[type] ?? tripStyles.Ejecutivo;
}

const ALL_CATEGORIES = ["Todos", "Ejecutivo", "Premium", "Cama", "Cama nocturna"];

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

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
function HomeBooking() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "cliente") navigate({ to: roleHome(user.role) });
  }, [user, navigate]);

  const [origin, setOrigin]           = useState("Lima");
  const [destination, setDestination] = useState("Trujillo");
  const [date, setDate]               = useState<Date>(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; });
  const [pax, setPax]                 = useState(1);

  const [step, setStep]   = useState<"search" | "trips" | "seats" | "passengers" | "payment" | "ticket">("search");
  const [tripId, setTripId]         = useState<string | null>(null);
  const [seats, setSeats]           = useState<Seat[]>(makeSeats);
  const [authBlock, setAuthBlock]   = useState(false);
  const [passengers, setPassengers] = useState<{ dni: string; name: string }[]>([]);
  const [guestEmail, setGuestEmail] = useState("");
  const [payment, setPayment]       = useState<{ method: "card" | "yape" | "plin"; card: string; exp: string; cvv: string }>({
    method: "card", card: "", exp: "", cvv: "",
  });

  const trip     = useMemo(() => tripsBase.find((t) => t.id === tripId) ?? tripsBase[0], [tripId]);
  const selected = seats.filter((s) => s.status === "selected");
  const total    = selected.length * trip.price;

  const toggleSeat = (id: string) => {
    setSeats((prev) => prev.map((s) =>
      s.id === id && s.status !== "occupied"
        ? { ...s, status: s.status === "selected" ? "free" : "selected" }
        : s,
    ));
  };

  const swap = () => { setOrigin(destination); setDestination(origin); };

  const goPay = () => {
    if (!selected.length) return;
    if (user && user.role !== "cliente") { setAuthBlock(true); return; }
    setPassengers(selected.map(() => ({ dni: "", name: "" })));
    setStep("passengers");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} />

      <main>
        {step === "search" && (
          <Hero
            origin={origin} destination={destination} date={date} pax={pax}
            setOrigin={setOrigin} setDestination={setDestination} setDate={setDate} setPax={setPax}
            swap={swap} onSearch={() => setStep("trips")}
          />
        )}

        {step !== "search" && (
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 pb-16 pt-6">
            <Stepper step={step} />

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
                selected={selected} passengers={passengers} setPassengers={setPassengers}
                total={total} onBack={() => setStep("seats")} onNext={() => setStep("payment")}
                user={user} guestEmail={guestEmail} setGuestEmail={setGuestEmail}
              />
            )}

            {step === "payment" && (
              <PaymentStep
                total={total} payment={payment} setPayment={setPayment}
                onBack={() => setStep("passengers")} onPay={() => setStep("ticket")}
              />
            )}

            {step === "ticket" && (
              <TicketResult
                selected={selected} trip={trip} origin={origin} destination={destination} date={date}
                passengers={passengers}
                onNew={() => { setStep("search"); setSeats(makeSeats()); setGuestEmail(""); }}
                user={user} guestEmail={guestEmail}
              />
            )}
          </div>
        )}
      </main>

      {authBlock && (
        <AuthBlockModal
          onClose={() => setAuthBlock(false)}
          onLogin={() => navigate({ to: "/login", search: { redirect: "/" } })}
          user={user}
        />
      )}

      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HEADER — Stitch-style sticky navbar
   ═══════════════════════════════════════════════════════════════════════ */
function Header({ user, onLogout }: { user: ReturnType<typeof useAuth>["user"]; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md shadow-[0px_4px_20px_0px_rgba(84,95,115,0.05)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-16 h-20">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary">KUNTUR</Link>

        <nav className="hidden md:flex items-center gap-10 text-base">
          <Link to="/" className="text-primary border-b-2 border-primary pb-1 font-semibold">Inicio</Link>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Mis Viajes</a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Ayuda</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {user.name} · {user.role}
              </span>
              {user.role !== "cliente" && (
                <Link to={roleHome(user.role) as any} className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                  Mi panel
                </Link>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="h-3.5 w-3.5" /> Salir
              </button>
            </>
          ) : (
            <Link
              to="/login" search={{ redirect: "/" }}
              className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95"
            >
              <UserIcon className="h-4 w-4 text-primary" /> Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO — Full-width bg image + floating search panel + destinations + benefits
   ═══════════════════════════════════════════════════════════════════════ */
function Hero(props: {
  origin: string; destination: string; date: Date; pax: number;
  setOrigin: (v: string) => void; setDestination: (v: string) => void;
  setDate: (v: Date) => void; setPax: (v: number) => void;
  swap: () => void; onSearch: () => void;
}) {
  return (
    <>
      {/* ── Hero Background ─── */}
      <section className="relative pt-20 pb-48 overflow-hidden min-h-[660px] flex flex-col justify-center">
        <div className="absolute inset-0 -z-20">
          <img
            alt="Flota de buses KUNTUR"
            className="w-full h-full object-cover"
            src="/fleet-hero.png"
          />
        </div>
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(247,250,248,1) 100%)" }} />

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-bold leading-tight tracking-tight text-white drop-shadow-lg">
            Viaja con el confort y la seguridad de{" "}
            <span className="text-[oklch(0.68_0.13_160)]">KUNTUR</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 drop-shadow-md">
            Reserva tus pasajes hacia los destinos más emblemáticos del Perú con un servicio premium diseñado para tu tranquilidad.
          </p>
        </div>

        {/* ── Floating Search Panel ─── */}
        <div className="mx-auto max-w-[1100px] px-5 sm:px-8 lg:px-16 -mb-28 relative z-20 mt-10">
          <div className="bg-card rounded-[24px] shadow-[0px_20px_50px_rgba(0,0,0,0.15)] p-6 sm:p-8 lg:p-10 border border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              {/* Origen / Destino */}
              <div className="md:col-span-4 relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">Origen / Destino</label>
                <div className="flex flex-col gap-2 relative">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      value={props.origin} onChange={(e) => props.setOrigin(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-base font-medium text-foreground"
                    >
                      {cities.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={props.swap}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-primary text-primary-foreground p-2 rounded-full shadow-md hover:rotate-180 transition-transform duration-500 active:scale-90"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                  <div className="relative">
                    <Bus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      value={props.destination} onChange={(e) => props.setDestination(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-base font-medium text-foreground"
                    >
                      {cities.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Fecha */}
              <div className="md:col-span-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">Ida</label>
                  <DatePickerField value={props.date} onChange={props.setDate} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">Pasajeros</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      value={props.pax} onChange={(e) => props.setPax(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none text-base font-medium text-foreground"
                    >
                      {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} Pasajero{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Buscar */}
              <div className="md:col-span-4">
                <button
                  onClick={props.onSearch}
                  className="w-full py-4 bg-primary hover:brightness-110 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-base"
                >
                  <Search className="h-5 w-5" /> Buscar viajes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Destinos Populares ─── */}
      <section className="pt-36 pb-16 bg-background">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Explora destinos inolvidables</h2>
            <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:underline cursor-pointer">
              Ver todos los destinos <ArrowRight className="h-4 w-4" />
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { city: "Lima", region: "Costa Central", price: 45, img: "/lima.png" },
              { city: "Arequipa", region: "Ciudad Blanca", price: 55, img: "/arequipa.png" },
              { city: "Cusco", region: "Valle Sagrado", price: 60, img: "/cusco.png" },
            ].map((d) => (
              <button
                key={d.city}
                onClick={() => { props.setDestination(d.city); props.onSearch(); }}
                className="group relative bg-card rounded-[24px] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-500 cursor-pointer text-left"
              >
                <div className="h-[380px] overflow-hidden">
                  <img alt={d.city} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={d.img} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest mb-1">{d.region}</p>
                  <h3 className="text-white text-2xl font-semibold mb-2">{d.city}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-base">Desde</span>
                    <span className="text-[oklch(0.68_0.13_160)] text-2xl font-semibold">S/ {d.price}.00</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Beneficios ─── */}
      <section className="py-20 bg-secondary border-y border-border/30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: "Seguridad Garantizada", desc: "Sistemas de monitoreo GPS en tiempo real y conductores altamente capacitados para tu tranquilidad." },
              { icon: Bus,         title: "Flota Moderna",         desc: "Buses de última generación con asientos de cuero, climatización y entretenimiento a bordo." },
              { icon: Headphones,  title: "Atención 24/7",         desc: "Estamos contigo en cada kilómetro. Soporte personalizado antes, durante y después de tu viaje." },
            ].map((b) => (
              <div key={b.title} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-primary group-hover:text-primary-foreground text-primary">
                  <b.icon className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">{b.title}</h4>
                <p className="text-base text-muted-foreground px-4 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Date Picker ───────────────────────────────────────────────────── */
function DatePickerField({ value, onChange }: { value: Date; onChange: (v: Date) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-4 text-left transition-colors hover:border-primary focus:border-primary focus:outline-none">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-base font-medium capitalize text-foreground">{format(value, "EEE d MMM", { locale: es })}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <CalendarPicker
          mode="single" selected={value} onSelect={(d) => d && onChange(d)}
          disabled={(d) => d < today} initialFocus locale={es}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

/* ─── Stepper ───────────────────────────────────────────────────────── */
function Stepper({ step }: { step: string }) {
  const steps  = ["search", "trips", "seats", "passengers", "payment", "ticket"];
  const labels = ["Buscar", "Viajes", "Asientos", "Datos", "Pago", "Boleto"];
  const idx = steps.indexOf(step);
  return (
    <div className="mb-8 flex items-center gap-1 overflow-x-auto pb-2">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-1">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
            i < idx ? "bg-primary/20 text-primary" : i === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}>
            {i + 1}
          </div>
          <span className={cn("text-sm whitespace-nowrap", i === idx ? "font-bold text-primary" : "text-muted-foreground")}>{l}</span>
          {i < labels.length - 1 && <div className={cn("h-px w-6 sm:w-10", i < idx ? "bg-primary/40" : "bg-border")} />}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TRIPS LIST — Stitch-style cards with search info bar
   ═══════════════════════════════════════════════════════════════════════ */
function TripsList({ origin, destination, date, onPick, onBack }: {
  origin: string; destination: string; date: Date; onPick: (id: string) => void; onBack: () => void;
}) {
  const dateLabel = format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = tripsBase.filter(
    (t) => activeCategory === "Todos" || t.type === activeCategory,
  );

  return (
    <div>
      {/* Search Info Bar */}
      <div className="bg-card rounded-[24px] p-6 shadow-[var(--shadow-card)] border border-border/30 flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="bg-background p-4 rounded-xl border border-border/30">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Origen</p>
              <p className="text-xl font-semibold text-foreground">{origin}</p>
            </div>
            <button
              onClick={onBack}
              className="bg-primary text-primary-foreground p-3 rounded-full shadow-md hover:rotate-180 transition-transform duration-500 z-10"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <div className="bg-background p-4 rounded-xl border border-border/30">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Destino</p>
              <p className="text-xl font-semibold text-foreground">{destination}</p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto bg-background p-4 rounded-xl border border-border/30 min-w-[200px]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Fecha de Viaje</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-base font-semibold capitalize">{dateLabel}</p>
          </div>
        </div>
        <button onClick={onBack} className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg active:scale-95">
          Modificar
        </button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6">
        <SlidersHorizontal className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        {ALL_CATEGORIES.map((cat) => {
          const s = cat !== "Todos" ? tripStyles[cat] : null;
          const Icon = s?.icon;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                isActive
                  ? s
                    ? `${s.chip} shadow-sm`
                    : "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {cat}
            </button>
          );
        })}
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6">Viajes Disponibles</h2>

      {/* Trip Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No hay viajes de categoría <strong>{activeCategory}</strong> disponibles para esta fecha.
          </div>
        )}
        {filtered.map((t, idx) => {
          const s = getTripStyle(t.type);
          const Icon = s.icon;
          const isFirst = idx === 0;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className={cn(
                "group relative flex w-full flex-col md:flex-row items-start md:items-center justify-between overflow-hidden rounded-[24px] border p-6 text-left shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5",
                isFirst ? "border-2 border-primary ring-4 ring-primary/5" : "border-border/30 hover:border-primary/50",
                "bg-card",
              )}
            >
              {isFirst && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl text-[11px] font-bold uppercase tracking-wider">
                  Recomendado
                </div>
              )}

              <div className="flex items-start gap-4 flex-1">
                <div
                  className="hidden sm:flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
                  style={{ background: s.gradient }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", s.chip)}>
                      <Icon className="h-3 w-3" /> {s.label}
                    </span>
                    <span className={cn("font-bold text-xs", t.seats <= 6 ? "text-destructive" : "text-primary")}>
                      {t.seats <= 6 ? `Solo ${t.seats} disponibles` : `${t.seats} disponibles`}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-2xl font-semibold text-foreground">{t.time}</p>
                      <p className="text-xs text-muted-foreground">{origin}</p>
                    </div>
                    <div className="flex flex-col items-center flex-1 max-w-[120px]">
                      <p className="text-xs text-muted-foreground mb-1">{t.dur}</p>
                      <div className="w-full h-[2px] bg-border relative">
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-border" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-border" />
                      </div>
                      <Bus className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-foreground">{t.arr}</p>
                      <p className="text-xs text-muted-foreground">{destination}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              </div>

              <div className="md:border-l border-border/30 md:pl-6 flex flex-col items-center md:items-end mt-4 md:mt-0 w-full md:w-auto">
                <p className="text-xs text-muted-foreground mb-1">Precio por persona</p>
                <p className={cn("text-3xl font-bold mb-4", isFirst ? "text-primary" : "text-foreground")}>S/ {t.price}.00</p>
                <div className={cn(
                  "w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm text-center transition-all",
                  isFirst
                    ? "bg-primary text-primary-foreground shadow-lg active:scale-95"
                    : "border-2 border-primary text-primary hover:bg-primary/5",
                )}>
                  Seleccionar
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SEAT STEP
   ═══════════════════════════════════════════════════════════════════════ */
function SeatStep({ trip, seats, selected, total, toggleSeat, onBack, onPay, user }: {
  trip: typeof tripsBase[number]; seats: Seat[]; selected: Seat[]; total: number;
  toggleSeat: (id: string) => void; onBack: () => void; onPay: () => void;
  user: ReturnType<typeof useAuth>["user"];
}) {
  const isWrongRole = user && user.role !== "cliente";
  const s = getTripStyle(trip.type);
  const Icon = s.icon;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-2">← Volver a viajes</button>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Selecciona tus asientos</h2>
        <p className="text-sm text-muted-foreground mb-6">Selección libre · toca para reservar</p>
        <SeatMap seats={seats} onSelect={toggleSeat} variant="client" />
      </div>

      <aside className="rounded-[24px] border border-border/20 bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] lg:sticky lg:top-28 lg:h-fit">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tu reserva</h3>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.chip)}>
            <Icon className="h-3 w-3" /> {s.label}
          </span>
        </div>
        <div className="space-y-3 text-sm">
          <Row k="Viaje"       v={`${trip.time} · ${trip.type}`} />
          <Row k="Asientos"    v={selected.length ? selected.map((s) => s.id).join(", ") : "—"} />
          <Row k="Precio unit." v={`S/ ${trip.price}`} />
        </div>
        <div className="my-5 h-px bg-border" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-primary">S/ {total}</span>
        </div>

        {isWrongRole && selected.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/15 p-3 text-xs text-[var(--warning-foreground)]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Tu cuenta de <strong>{user!.role}</strong> no puede comprar pasajes.</span>
          </div>
        )}

        <button
          disabled={!selected.length}
          onClick={onPay}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          <CreditCard className="h-4 w-4" /> Continuar al pago
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

/* ─── Auth Block Modal (solo para roles incorrectos) ─────────────── */
function AuthBlockModal({ onClose, onLogin, user }: {
  onClose: () => void; onLogin: () => void; user: ReturnType<typeof useAuth>["user"];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Cuenta no permitida</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tu cuenta de <strong>{user?.role}</strong> no puede comprar pasajes. Necesitas una cuenta de <strong>cliente</strong>.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-2">
          <button onClick={onLogin} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg">
            <LogIn className="h-4 w-4" /> Cambiar de cuenta
          </button>
          <button onClick={onClose} className="w-full rounded-xl border border-border bg-background py-3 font-semibold text-foreground transition-colors hover:bg-muted">
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TICKET RESULT — with optional guest registration
   ═══════════════════════════════════════════════════════════════════════ */
function TicketResult({
  selected, trip, origin, destination, date, passengers, onNew, user, guestEmail,
}: {
  selected: Seat[]; trip: typeof tripsBase[number]; origin: string; destination: string; date: Date;
  passengers?: { dni: string; name: string }[];
  onNew: () => void;
  user: ReturnType<typeof useAuth>["user"];
  guestEmail: string;
}) {
  const dateLabel = format(date, "d MMM yyyy", { locale: es });
  const s = getTripStyle(trip.type);
  const Icon = s.icon;

  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    const firstName = passengers?.[0]?.name || "Invitado Kuntur";
    const res = registerAccount({ name: firstName, email: guestEmail, password: regPassword, role: "cliente" });
    if (!res.ok) { setRegError(res.error); return; }
    storeUser(res.user);
    setRegSuccess(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
        <ShieldCheck className="h-3.5 w-3.5" /> Pago confirmado · {user ? user.name : (passengers?.[0]?.name || "Invitado")}
      </div>
      <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="p-6 text-white" style={{ background: s.gradient }}>
          <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-90">
            <span className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {s.label}</span>
            <span>KUNTUR · 2026</span>
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
            <MiniTicket k="Asientos" v={selected.map((s) => s.id).join(", ")} />
            <MiniTicket k="Bus"      v="JY-104" />
            <MiniTicket k="Total"    v={`S/ ${selected.length * trip.price}`} />
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

      {/* Guest Registration */}
      {!user && guestEmail && (
        <div className="mt-6 w-full max-w-md bg-card border border-border/50 rounded-[24px] p-6 shadow-[var(--shadow-elegant)] transition-all">
          {regSuccess ? (
            <div className="text-center space-y-2 py-2">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">¡Cuenta creada con éxito!</h4>
              <p className="text-xs text-muted-foreground">
                Te has registrado e iniciado sesión como <strong>{passengers?.[0]?.name || "Cliente"}</strong>. Podrás ver tus boletos y comprar más rápido en tus próximos viajes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">¿Quieres guardar tu cuenta?</h4>
                  <p className="text-xs text-muted-foreground">
                    Crea una contraseña para tu correo <strong className="text-foreground">{guestEmail}</strong> y regístrate al instante.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    required type="password" placeholder="Crea una contraseña (mín. 4 caracteres)"
                    value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                {regError && <div className="text-xs font-semibold text-destructive">{regError}</div>}
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all active:scale-[0.98]">
                Guardar mi cuenta y acceder
              </button>
            </form>
          )}
        </div>
      )}

      <button onClick={onNew} className="mt-6 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
        Comprar otro pasaje
      </button>
    </div>
  );
}

function MiniTicket({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-sm font-bold text-foreground">{v}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PASSENGERS STEP — with guest email collection
   ═══════════════════════════════════════════════════════════════════════ */
function PassengersStep({
  selected, passengers, setPassengers, total, onBack, onNext, user, guestEmail, setGuestEmail,
}: {
  selected: Seat[]; passengers: { dni: string; name: string }[];
  setPassengers: (p: { dni: string; name: string }[]) => void;
  total: number; onBack: () => void; onNext: () => void;
  user: ReturnType<typeof useAuth>["user"];
  guestEmail: string; setGuestEmail: (email: string) => void;
}) {
  const update = (i: number, patch: Partial<{ dni: string; name: string }>) => {
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = user ? true : emailRegex.test(guestEmail);
  const valid = passengers.every((p) => /^\d{8}$/.test(p.dni) && p.name.trim().length >= 3) && emailValid;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-2">← Volver a asientos</button>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Datos de los pasajeros</h2>
        <p className="text-sm text-muted-foreground mb-6">Necesitamos esta información por requerimiento de transporte.</p>
        <div className="space-y-4">
          {!user && (
            <div className="rounded-[24px] border border-primary/20 bg-primary/5 p-6 shadow-[var(--shadow-card)]">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-foreground">Contacto para envío de pasajes</span>
              </div>
              <FieldInput icon={Mail} label="Correo electrónico" placeholder="ejemplo@correo.com" value={guestEmail} onChange={setGuestEmail} />
              <p className="mt-2 text-[11px] text-muted-foreground">Enviaremos tus boletos en PDF y tu código de abordaje QR a este correo.</p>
            </div>
          )}

          {passengers.map((p, i) => (
            <div key={i} className="rounded-[24px] border border-border/20 bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <span className="text-sm font-bold text-foreground">Pasajero · Asiento {selected[i]?.id}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldInput icon={IdCard} label="DNI" placeholder="12345678" maxLength={8} value={p.dni} onChange={(v) => update(i, { dni: v.replace(/\D/g, "").slice(0, 8) })} />
                <FieldInput icon={UserIcon} label="Nombre completo" placeholder="María López" value={p.name} onChange={(v) => update(i, { name: v })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-[24px] border border-border/20 bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] lg:sticky lg:top-28 lg:h-fit">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resumen</h3>
        <div className="mt-4 space-y-3 text-sm">
          <Row k="Asientos" v={selected.map((s) => s.id).join(", ")} />
          <Row k="Pasajeros" v={passengers.length.toString()} />
        </div>
        <div className="my-5 h-px bg-border" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-primary">S/ {total}</span>
        </div>
        <button
          disabled={!valid} onClick={onNext}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          Continuar al pago <ArrowRight className="h-4 w-4" />
        </button>
        {!valid && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {!emailValid ? "Introduce un correo válido. " : ""}Completa DNI (8 dígitos) y nombre de cada pasajero.
          </p>
        )}
      </aside>
    </div>
  );
}

function FieldInput({ icon: Icon, label, value, onChange, placeholder, maxLength }: {
  icon: any; label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-border bg-background px-4 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
        className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
      />
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAYMENT STEP — Stitch-style with sidebar summary
   ═══════════════════════════════════════════════════════════════════════ */
function PaymentStep({ total, payment, setPayment, onBack, onPay }: {
  total: number;
  payment: { method: "card" | "yape" | "plin"; card: string; exp: string; cvv: string };
  setPayment: (p: typeof payment) => void;
  onBack: () => void; onPay: () => void;
}) {
  const methods: { id: "card" | "yape" | "plin"; label: string; desc: string }[] = [
    { id: "card", label: "Tarjeta", desc: "Visa · Mastercard" },
    { id: "yape", label: "Yape",    desc: "Pago instantáneo" },
    { id: "plin", label: "Plin",    desc: "Transferencia móvil" },
  ];
  const cardOk =
    payment.method !== "card" ||
    (payment.card.replace(/\s/g, "").length >= 13 && /^\d{2}\/\d{2}$/.test(payment.exp) && /^\d{3,4}$/.test(payment.cvv));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-2">← Volver a datos</button>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Método de pago</h2>
        <p className="text-sm text-muted-foreground mb-6">Pago simulado · ningún cargo real.</p>

        {/* Method Tabs */}
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayment({ ...payment, method: m.id })}
              className={cn(
                "rounded-[20px] border-2 p-5 text-left transition-all",
                payment.method === m.id
                  ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <CreditCard className="h-5 w-5 text-primary" /> {m.label}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{m.desc}</div>
            </button>
          ))}
        </div>

        {payment.method === "card" && (
          <div className="rounded-[24px] border border-border/20 bg-card p-6 shadow-[var(--shadow-card)]">
            <FieldInput
              icon={CreditCard} label="Número de tarjeta" placeholder="4242 4242 4242 4242"
              value={payment.card}
              onChange={(v) => setPayment({ ...payment, card: v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })}
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <FieldInput
                icon={Calendar} label="Vencimiento" placeholder="MM/AA"
                value={payment.exp}
                onChange={(v) => { const d = v.replace(/\D/g, "").slice(0, 4); setPayment({ ...payment, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }}
              />
              <FieldInput
                icon={Lock} label="CVV" placeholder="123" maxLength={4}
                value={payment.cvv}
                onChange={(v) => setPayment({ ...payment, cvv: v.replace(/\D/g, "").slice(0, 4) })}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-primary font-medium">
              <Lock className="h-4 w-4" /> Pago 100% seguro · datos cifrados
            </div>
          </div>
        )}

        {payment.method !== "card" && (
          <div className="rounded-[24px] border border-border/20 bg-card p-8 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
              <QrCode className="h-8 w-8" />
            </div>
            <div className="text-lg font-bold text-foreground">Escanea con {payment.method === "yape" ? "Yape" : "Plin"}</div>
            <div className="mt-1 text-sm text-muted-foreground">Confirma el pago de S/ {total} desde tu app.</div>
          </div>
        )}
      </div>

      <aside className="rounded-[24px] border border-border/20 bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] lg:sticky lg:top-28 lg:h-fit">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">A pagar</h3>
        <div className="my-5 h-px bg-border" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-primary">S/ {total}</span>
        </div>
        <button
          disabled={!cardOk} onClick={onPay}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          <CheckCircle2 className="h-4 w-4" /> Confirmar pago
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">Pago ficticio para demostración.</p>
      </aside>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="text-xl font-bold text-foreground">KUNTUR</span>
          <p className="text-xs text-muted-foreground max-w-sm text-center md:text-left">
            © 2026 KUNTUR. Todos los derechos reservados. Movilidad premium con puntualidad garantizada.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {["Legal", "Privacidad", "Soporte", "Términos", "Contacto"].map((link) => (
            <a key={link} href="#" className="text-muted-foreground hover:text-primary transition-colors hover:underline decoration-primary decoration-2 underline-offset-4">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}