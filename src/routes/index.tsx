import { createFileRoute, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { SeatMap, type Seat } from "@/components/kuntur/SeatMap";
import { useAuth, roleHome, registerAccount, storeUser } from "@/lib/auth";
import {
  ArrowRight, Calendar, MapPin, Search, Users, X, QrCode, Clock, Bus, Leaf,
  LogIn, LogOut, ShieldCheck, AlertCircle, ArrowLeftRight, Sparkles, CreditCard, ChevronRight,
  IdCard, User as UserIcon, Lock, CheckCircle2, Crown, Moon, BedDouble, Star, SlidersHorizontal,
  Mail, ArrowUpDown, Headphones, Globe, Ticket as TicketIcon, Utensils, Sun, Compass,
  Timer, Smartphone, XCircle, HelpCircle, SearchX, Luggage, RefreshCw, Menu,
  Bell, Download, Share2, AlertTriangle, Wrench, BarChart3, BadgeCheck,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { toast } from "sonner";

export interface BookingState {
  origin: string;
  destination: string;
  date: string; // ISO String
  pax: number;
  tripId: string | null;
  selectedSeats: string[];
  passengers: { dni: string; name: string }[];
  guestEmail: string;
}

export const initialBookingState: BookingState = {
  origin: "Lima",
  destination: "Trujillo",
  date: "",
  pax: 1,
  tripId: null,
  selectedSeats: [],
  passengers: [],
  guestEmail: "",
};

export function getBookingState(): BookingState {
  if (typeof window === "undefined") return initialBookingState;
  try {
    const data = sessionStorage.getItem("kuntur_booking");
    if (!data) return initialBookingState;
    const parsed = JSON.parse(data);
    return { ...initialBookingState, ...parsed };
  } catch (e) {
    return initialBookingState;
  }
}

export function setBookingState(state: Partial<BookingState>) {
  if (typeof window === "undefined") return;
  try {
    const current = getBookingState();
    const updated = { ...current, ...state };
    sessionStorage.setItem("kuntur_booking", JSON.stringify(updated));
  } catch (e) {}
}

export function clearBookingState() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("kuntur_booking");
  } catch (e) {}
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KUNTUR — Compra tu pasaje en segundos" },
      { name: "description", content: "Busca rutas, elige tu asiento en tiempo real y obtén tu boleto digital con QR." },
    ],
  }),
  component: HomeBooking,
});

export const cities = ["Lima", "Trujillo", "Arequipa", "Cusco", "Piura", "Ica", "Puno", "Chiclayo", "Tacna"];

export const tripsBase = [
  { id: "1", time: "06:30", arr: "11:45", price: 42, type: "Ejecutivo",     seats: 18, dur: "5h 15m" },
  { id: "2", time: "09:15", arr: "14:30", price: 38, type: "Cama",          seats: 6,  dur: "5h 15m" },
  { id: "3", time: "14:00", arr: "19:15", price: 45, type: "Premium",       seats: 22, dur: "5h 15m" },
  { id: "4", time: "22:30", arr: "03:45", price: 36, type: "Cama nocturna", seats: 11, dur: "5h 15m" },
];

export const tripStyles: Record<string, {
  icon: any; label: string; gradient: string; ring: string; chip: string; accent: string;
  tagline: string; bgCard: string; borderCard: string; description: string;
}> = {
  Premium: {
    icon: Crown, label: "Premium",
    gradient: "linear-gradient(135deg, oklch(0.78 0.14 85), oklch(0.65 0.18 45))",
    ring: "ring-2 ring-amber-300/50", chip: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
    accent: "text-amber-600", tagline: "VIP", bgCard: "bg-gradient-to-br from-amber-50 to-orange-50",
    borderCard: "border-amber-200 hover:border-amber-400",
    description: "Asiento VIP reclinable \u00b7 snack \u00b7 almohada \u00b7 cargador USB",
  },
  Ejecutivo: {
    icon: Star, label: "Ejecutivo",
    gradient: "linear-gradient(135deg, oklch(0.55 0.14 230), oklch(0.45 0.16 255))",
    ring: "ring-1 ring-blue-300/50", chip: "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50",
    accent: "text-blue-600", tagline: "Asiento amplio", bgCard: "bg-gradient-to-br from-blue-50 to-indigo-50",
    borderCard: "border-blue-200 hover:border-blue-400",
    description: "Asiento ejecutivo reclinable \u00b7 WiFi a bordo \u00b7 toma USB",
  },
  Cama: {
    icon: BedDouble, label: "Cama",
    gradient: "linear-gradient(135deg, oklch(0.58 0.13 155), oklch(0.46 0.14 165))",
    ring: "ring-1 ring-emerald-300/50", chip: "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
    accent: "text-emerald-600", tagline: "Reclinable 160\u00b0", bgCard: "bg-gradient-to-br from-emerald-50 to-teal-50",
    borderCard: "border-emerald-200 hover:border-emerald-400",
    description: "Semi-cama 160\u00b0 \u00b7 TV individual \u00b7 frazada \u00b7 almohada",
  },
  "Cama nocturna": {
    icon: Moon, label: "Cama nocturna",
    gradient: "linear-gradient(135deg, oklch(0.42 0.12 280), oklch(0.32 0.1 270))",
    ring: "ring-1 ring-violet-400/50", chip: "bg-violet-100 text-violet-800 border border-violet-300 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/50",
    accent: "text-violet-600", tagline: "Descanso total", bgCard: "bg-gradient-to-br from-violet-50 to-purple-50",
    borderCard: "border-violet-200 hover:border-violet-400",
    description: "Cama 180\u00b0 \u00b7 Fraza t\u00e9rmica \u00b7 Cortinas privacidad",
  }
};

export function getTripStyle(type: string) { return tripStyles[type] ?? tripStyles.Ejecutivo; }
export const ALL_CATEGORIES = ["Todos", "Ejecutivo", "Premium", "Cama", "Cama nocturna"];

export function makeSeats(): Seat[] {
  const occupied1 = new Set(["1A", "2B", "3C", "4D", "6A", "7C", "9B", "5A"]);
  const occupied2 = new Set(["P1B", "P2A", "P4C", "P5D", "P7B", "P8A", "P10C"]);
  const list: Seat[] = [];
  for (let r = 1; r <= 10; r++) {
    (["A", "B", "C", "D"] as const).forEach((c, i) => {
      const id = `${r}${c}`;
      list.push({ id, row: r, col: i + 1, floor: 1, status: occupied1.has(id) ? "occupied" : "free" });
    });
  }
  for (let r = 1; r <= 10; r++) {
    (["A", "B", "C", "D"] as const).forEach((c, i) => {
      const id = `P${r}${c}`;
      list.push({ id, row: r, col: i + 1, floor: 2, status: occupied2.has(id) ? "occupied" : "free" });
    });
  }
  return list;
}

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.07 }
    );
    document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function HomeBooking() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (user && user.role !== "cliente") navigate({ to: roleHome(user.role) }); }, [user, navigate]);
  useScrollReveal();
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      const destinosEl = document.getElementById("destinos");
      const beneficiosEl = document.getElementById("beneficios");

      if (beneficiosEl && scrollPos >= beneficiosEl.offsetTop) {
        setActiveSection("beneficios");
      } else if (destinosEl && scrollPos >= destinosEl.offsetTop) {
        setActiveSection("destinos");
      } else {
        setActiveSection("inicio");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [origin, setOrigin] = useState("Lima");
  const [destination, setDestination] = useState("Trujillo");
  const [date, setDate] = useState<Date>(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; });
  const [pax, setPax] = useState(1);

  const swap = () => { setOrigin(destination); setDestination(origin); };

  const handleSearch = () => {
    clearBookingState();
    setBookingState({
      origin,
      destination,
      date: date.toISOString(),
      pax,
    });
    navigate({
      to: "/trips",
      search: {
        origin,
        destination,
        date: date.toISOString(),
        pax,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        <Hero origin={origin} destination={destination} date={date} pax={pax}
          setOrigin={setOrigin} setDestination={setDestination} setDate={setDate} setPax={setPax}
          swap={swap} onSearch={handleSearch} />
      </main>
      <Footer />
    </div>
  );
}

/* ====== NOTIFICATIONS ====== */
type Notif = { id: string; title: string; desc: string; time: string; read: boolean; icon: any };

function getRoleNotifications(role: string | undefined): Notif[] {
  if (role === "cliente") return [
    { id: "1", title: "Viaje confirmado", desc: "Tu boleto ha sido procesado exitosamente.", time: "Hace 5 min", read: false, icon: CheckCircle2 },
    { id: "2", title: "Recuerda tu viaje", desc: "Tu salida de mañana es a las 22:30. ¡Llega 30 min antes!", time: "Hace 2 h", read: false, icon: Calendar },
    { id: "3", title: "Oferta especial", desc: "20% de descuento en rutas hacia Arequipa este fin de semana.", time: "Ayer", read: true, icon: Sparkles },
  ];
  if (role === "conductor") return [
    { id: "1", title: "Viaje asignado", desc: "Nueva ruta: Lima → Trujillo · Salida 06:30 · Bus JY-104.", time: "Hace 10 min", read: false, icon: Bus },
    { id: "2", title: "Revisión pendiente", desc: "Bus JY-104 requiere inspección de frenos antes de salir.", time: "Hace 1 h", read: false, icon: AlertTriangle },
  ];
  if (role === "auxiliar") return [
    { id: "1", title: "Viaje próximo", desc: "JY-104 Lima → Trujillo inicia abordaje en 30 min. Gate A2.", time: "Hace 5 min", read: false, icon: Clock },
    { id: "2", title: "Atención especial", desc: "Asiento 1A: pasajero con necesidades especiales. Atención prioritaria.", time: "Hace 20 min", read: false, icon: Users },
  ];
  if (role === "controlador") return [
    { id: "1", title: "Alerta SOS activa", desc: "JY-104 activó botón de pánico · Av. Central 450, Lima.", time: "Hace 2 min", read: false, icon: AlertCircle },
    { id: "2", title: "Retraso detectado", desc: "JY-211 Lima → Arequipa · 20 min de retraso por tráfico.", time: "Hace 15 min", read: false, icon: Clock },
    { id: "3", title: "Mantenimiento urgente", desc: "KTR-202 requiere cambio de frenos antes de próxima salida.", time: "Hace 1 h", read: true, icon: Wrench },
  ];
  if (role === "administrador") return [
    { id: "1", title: "Reporte disponible", desc: "El resumen de ingresos de esta semana está listo.", time: "Hace 30 min", read: false, icon: BarChart3 },
    { id: "2", title: "Gastos pendientes", desc: "3 solicitudes de gasto esperan tu aprobación.", time: "Hace 2 h", read: false, icon: BadgeCheck },
    { id: "3", title: "Logro del equipo", desc: "Carlos Mendoza completó 200 viajes este mes.", time: "Ayer", read: true, icon: Sparkles },
  ];
  return [];
}

function NotifBell({ role }: { role: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(() => getRoleNotifications(role));
  const unread = notifs.filter((n) => !n.read).length;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAll = () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => setNotifs((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificaciones"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card transition-all hover:bg-muted active:scale-90"
      >
        <Bell className="h-4 w-4 text-foreground" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-bold text-foreground">Notificaciones</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-semibold text-primary hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-80 divide-y divide-border overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Sin notificaciones</p>
            ) : (
              notifs.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => markOne(n.id)}
                    className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50", !n.read && "bg-primary/5")}
                  >
                    <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", !n.read ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={cn("truncate text-sm font-semibold", n.read ? "text-muted-foreground" : "text-foreground")}>{n.title}</p>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{n.desc}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/60">{n.time}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== HEADER ====== */
export function Header({ user, onLogout, activeSection, setActiveSection }: {
  user: ReturnType<typeof useAuth>["user"];
  onLogout: () => void;
  activeSection: string;
  setActiveSection: (v: string) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(
    () => typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("kuntur_theme", next ? "dark" : "light"); } catch {}
  };
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function goHome() {
    setActiveSection("inicio");
    setMobileOpen(false);
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate({ to: "/" });
    }
  }

  function goSection(id: string, section: string) {
    setActiveSection(section);
    setMobileOpen(false);
    if (window.location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate({ to: "/" });
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 400);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/85 shadow-[0px_4px_20px_0px_rgba(84,95,115,0.05)] backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-16">
        <Link
          to="/"
          onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setActiveSection("inicio"); }}
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary"
        >
          <span
            aria-hidden="true"
            className="h-8 w-8 bg-primary [mask:url('/condor.svg')_center/contain_no-repeat] [-webkit-mask:url('/condor.svg')_center/contain_no-repeat]"
          />
          <span>KUNTUR</span>
        </Link>
        <nav className="hidden items-center gap-10 text-base md:flex">
          <button onClick={goHome} className={cn("pb-1 font-semibold transition-colors hover:text-primary bg-transparent border-0 cursor-pointer", activeSection === "inicio" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}>Inicio</button>
          <button onClick={() => goSection("destinos", "destinos")} className={cn("pb-1 font-semibold transition-colors hover:text-primary bg-transparent border-0 cursor-pointer", activeSection === "destinos" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}>Destinos</button>
          <button onClick={() => goSection("beneficios", "beneficios")} className={cn("pb-1 font-semibold transition-colors hover:text-primary bg-transparent border-0 cursor-pointer", activeSection === "beneficios" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}>Beneficios</button>
          {user?.role === "cliente" && (
            <Link to={"/mis-viajes" as any} className={cn("pb-1 font-semibold transition-colors hover:text-primary", pathname === "/mis-viajes" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}>
              Mis viajes
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
            title={dark ? "Modo claro" : "Modo oscuro"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:bg-muted active:scale-90"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </button>
          {user ? (
            <>
              {user.role === "cliente" ? (
                <Link to={"/perfil" as any} className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-muted sm:inline-flex">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {user.name} &middot; {user.role}
                </Link>
              ) : (
                <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground sm:inline-flex">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {user.name} &middot; {user.role}
                </span>
              )}
              {user.role !== "cliente" && <Link to={roleHome(user.role) as any} className="hidden sm:inline-flex rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Mi panel</Link>}
              <NotifBell role={user.role} />
              <button onClick={onLogout} className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                <LogOut className="h-3.5 w-3.5" /> Salir
              </button>
            </>
          ) : (
            <Link to="/login" search={{ redirect: "/" }} className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95">
              <UserIcon className="h-4 w-4 text-primary" /> Ingresar
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card transition-all hover:bg-muted active:scale-90"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-card/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto max-w-7xl flex flex-col gap-1 px-5 py-3">
            <button
              onClick={goHome}
              className={cn("flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors", activeSection === "inicio" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary")}
            >Inicio</button>
            <button
              onClick={() => goSection("destinos", "destinos")}
              className={cn("flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors", activeSection === "destinos" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary")}
            >Destinos</button>
            <button
              onClick={() => goSection("beneficios", "beneficios")}
              className={cn("flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors", activeSection === "beneficios" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary")}
            >Beneficios</button>
            {user?.role === "cliente" && (
              <Link to={"/mis-viajes" as any} onClick={() => setMobileOpen(false)}
                className={cn("flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors", pathname === "/mis-viajes" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary")}
              >Mis viajes</Link>
            )}
            {user && (
              <Link to={"/perfil" as any} onClick={() => setMobileOpen(false)}
                className={cn("flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors", pathname === "/perfil" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary")}
              >Mi perfil</Link>
            )}
          </nav>
          <div className="mx-auto max-w-7xl flex flex-col gap-2 border-t border-border/40 px-5 pb-4 pt-3">
            {!user && (
              <Link to="/login" search={{ redirect: "/" }} onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all active:scale-95"
              >
                <UserIcon className="h-4 w-4" /> Ingresar a mi cuenta
              </Link>
            )}
            {user && user.role !== "cliente" && (
              <Link to={roleHome(user.role) as any} onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-all active:scale-95"
              >
                Mi panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const destinationDetails: Record<string, {
  history: string;
  weather: string;
  food: string;
  fact: string;
}> = {
  Lima: {
    history: "Fundada en 1535 como la 'Ciudad de los Reyes', Lima fue la capital del Virreinato del Per\u00fa. Hoy es una metr\u00f3polis vibrante que combina historia colonial en su centro hist\u00f3rico y modernidad a orillas del Pac\u00edfico en Miraflores y Barranco.",
    weather: "Templado, h\u00famedo (15\u00b0C - 27\u00b0C). Agradable todo el a\u00f1o.",
    food: "Ceviche lime\u00f1o, Causa rellena, Lomo saltado y Anticuchos.",
    fact: "Alberga la Huaca Pucllana, un imponente templo ceremonial preinca construido de adobe en pleno coraz\u00f3n de la ciudad."
  },
  Arequipa: {
    history: "Conocida como la 'Ciudad Blanca' debido a sus hermosas construcciones hechas de sillar (piedra volc\u00e1nica). Fundada en 1540, cuenta con un centro hist\u00f3rico declarado Patrimonio de la Humanidad.",
    weather: "Seco y templado, con sol radiante casi todo el a\u00f1o (10\u00b0C - 24\u00b0C).",
    food: "Rocoto relleno, Chupe de camarones, Ocopa arequipe\u00f1a y Adobo.",
    fact: "Posee el Ca\u00f1\u00f3n del Colca, uno de los m\u00e1s profundos del mundo y hogar del majestuoso C\u00f3ndor Andino."
  },
  Cusco: {
    history: "Antigua capital del Imperio Incaico y el 'Ombligo del Mundo'. Es una de las ciudades m\u00e1s fascinantes de Am\u00e9rica por su impresionante mezcla de cimientos de piedra inca y templos coloniales espa\u00f1oles.",
    weather: "Clima andino, templado y seco, con noches fr\u00edas (5\u00b0C - 20\u00b0C).",
    food: "Chiri Uchu, Sopa de trigo, Cuy chactado y lech\u00f3n cusque\u00f1o.",
    fact: "Es la puerta de entrada a Machu Picchu, una de las nuevas siete maravillas del mundo moderno."
  },
  Trujillo: {
    history: "Fundada en 1534, Trujillo es la 'Capital de la Primavera' y de la Marinera norte\u00f1a. Fue el centro de las civilizaciones Mochica y Chim\u00fa, destacadas por su orfebrer\u00eda y arquitectura.",
    weather: "C\u00e1lido y templado, sumamente primaveral todo el a\u00f1o (16\u00b0C - 26\u00b0C).",
    food: "Shambar (sopa tradicional de los lunes), Seco de cabrito y Pescado a la brasa.",
    fact: "Alberga las ruinas de Chan Chan, la ciudad de barro precolombina m\u00e1s grande de Am\u00e9rica."
  },
  Piura: {
    history: "La primera ciudad espa\u00f1ola fundada en Sudam\u00e9rica en 1532 por Francisco Pizarro. Es famosa por su fervor cultural, su hermosa cer\u00e1mica en Chulucanas y sus espectaculares playas como M\u00e1ncora.",
    weather: "C\u00e1lido, tropical y soleado todo el a\u00f1o (20\u00b0C - 34\u00b0C).",
    food: "Seco de chabelo, Cebiche de mero con zarandaja y Tamalitos verdes.",
    fact: "Sus costas son el paso de ballenas jorobadas entre julio y octubre, ofreciendo un avistamiento natural inolvidable."
  },
  Ica: {
    history: "Un oasis f\u00e9rtil en medio del desierto. Ica destaca por su milenaria agricultura (hogar de las culturas Nazca y Paracas), su producci\u00f3n de Pisco de alta calidad y sus misteriosas dunas.",
    weather: "C\u00e1lido, soleado y des\u00e9rtico durante todo el a\u00f1o (18\u00b0C - 32\u00b0C).",
    food: "Carapulcra con Sopa seca, Ensalada de pallares y Tejas ique\u00f1as.",
    fact: "Su desierto esconde la Huacachina, el \u00fanico oasis natural rodeado de dunas gigantes en toda Sudam\u00e9rica."
  }
};

/* ====== HERO ====== */
function Hero(props: {
  origin: string; destination: string; date: Date; pax: number;
  setOrigin: (v: string) => void; setDestination: (v: string) => void;
  setDate: (v: Date) => void; setPax: (v: number) => void;
  swap: () => void; onSearch: () => void;
}) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedCityInfo, setSelectedCityInfo] = useState<{ city: string; region: string; price: number; img: string } | null>(null);

  useEffect(() => {
    if (!carouselApi) return;
    let intervalId: any;

    const startAutoplay = () => {
      intervalId = setInterval(() => {
        carouselApi.scrollNext();
      }, 4000);
    };

    const stopAutoplay = () => {
      if (intervalId) clearInterval(intervalId);
    };

    startAutoplay();

    carouselApi.on("select", () => {
      stopAutoplay();
      startAutoplay();
    });
    carouselApi.on("pointerDown", stopAutoplay);

    return () => stopAutoplay();
  }, [carouselApi]);

  const destinations = [
    { city: "Lima", region: "Costa Central", price: 45, img: "/lima.png" },
    { city: "Arequipa", region: "Ciudad Blanca", price: 55, img: "/arequipa.png" },
    { city: "Cusco", region: "Valle Sagrado", price: 60, img: "/cusco.png" },
    { city: "Trujillo", region: "Norte Colonial", price: 42, img: "/trujillo.png" },
    { city: "Piura", region: "Costa Norte", price: 50, img: "/piura.png" },
    { city: "Ica", region: "Sol y Dunas", price: 35, img: "/ica.png" },
  ];
  return (
    <>
      <section className="relative z-0 flex min-h-[700px] flex-col justify-center overflow-hidden pb-48 pt-20">
        <div className="absolute inset-0 -z-20">
          <img alt="Flota de buses KUNTUR" className="h-full w-full object-cover" src="/fleet-hero.png" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-background to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-16">
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-[54px] lg:leading-[1.15]">
            Viaja con el confort y la seguridad de <span className="text-[oklch(0.78_0.13_160)] font-black">KUNTUR</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl font-normal leading-relaxed text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Reserva tus pasajes hacia los destinos m&aacute;s emblem&aacute;ticos del Per&uacute; con un servicio premium dise&ntilde;ado para tu tranquilidad.
          </p>
        </div>
        {/* Floating Search Panel */}
        <div className="relative z-20 mx-auto mt-10 -mb-24 w-full max-w-[1150px] px-5 sm:px-8 lg:px-12">
          <div className="rounded-[28px] md:rounded-full border border-white/20 bg-white/95 p-2 pl-6 md:pl-8 md:pr-2 shadow-[0px_25px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-card/90">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3 lg:gap-5 w-full justify-between">
              
              {/* Title label */}
              <div className="hidden lg:flex items-center gap-2 pr-2">
                <span className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground whitespace-nowrap lg:text-foreground">Compra tu pasaje:</span>
              </div>
              <div className="hidden lg:block h-10 w-px bg-border/60" />

              {/* Origen */}
              <div className="relative flex-1 min-w-[110px] pl-2 md:pl-0">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Origen:</label>
                <div className="relative flex items-center">
                  <select value={props.origin} onChange={(e) => props.setOrigin(e.target.value)} className="w-full appearance-none bg-transparent text-sm font-extrabold text-foreground outline-none cursor-pointer pr-6 py-1 border-0 focus:ring-0 focus:outline-none transition-colors hover:text-primary">
                    {cities.map((c) => <option key={c} value={c} className="text-black bg-white">{c.toUpperCase()}</option>)}
                  </select>
                  <ChevronRight className="absolute right-2 h-4 w-4 rotate-90 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="h-px w-full bg-border/40 md:hidden" />
              <div className="hidden h-10 w-px bg-border/60 md:block" />

              {/* Destino */}
              <div className="relative flex-1 min-w-[110px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Destino:</label>
                <div className="relative flex items-center">
                  <select value={props.destination} onChange={(e) => props.setDestination(e.target.value)} className="w-full appearance-none bg-transparent text-sm font-extrabold text-foreground outline-none cursor-pointer pr-6 py-1 border-0 focus:ring-0 focus:outline-none transition-colors hover:text-primary">
                    {cities.map((c) => <option key={c} value={c} className="text-black bg-white">{c.toUpperCase()}</option>)}
                  </select>
                  <ChevronRight className="absolute right-2 h-4 w-4 rotate-90 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="h-px w-full bg-border/40 md:hidden" />
              <div className="hidden h-10 w-px bg-border/60 md:block" />

              {/* Fecha salida */}
              <div className="relative flex-1 min-w-[125px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Fecha salida:</label>
                <div className="relative flex items-center">
                  <DatePickerField value={props.date} onChange={props.setDate} borderless />
                </div>
              </div>
              <div className="h-px w-full bg-border/40 md:hidden" />
              <div className="hidden h-10 w-px bg-border/60 md:block" />

              {/* Pasajeros */}
              <div className="relative flex-1 min-w-[115px]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">N° pasajeros:</label>
                <div className="relative flex items-center">
                  <select value={props.pax} onChange={(e) => props.setPax(Number(e.target.value))} className="w-full appearance-none bg-transparent text-sm font-extrabold text-foreground outline-none cursor-pointer pr-6 py-1 border-0 focus:ring-0 focus:outline-none transition-colors hover:text-primary">
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n} className="text-black bg-white">{n} PASAJERO{n > 1 ? "S" : ""}</option>)}
                  </select>
                  <ChevronRight className="absolute right-2 h-4 w-4 rotate-90 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              
              {/* Buscar Button */}
              <div className="md:pl-2 w-full md:w-auto">
                <button onClick={props.onSearch} className="w-full rounded-full bg-primary hover:bg-primary/90 active:scale-95 px-8 py-3.5 text-sm font-extrabold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 md:w-auto">
                  BUSCAR
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Destinos */}
      <section id="destinos" className="bg-background pb-16 pt-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
          <Carousel opts={{ align: "start", loop: true }} setApi={setCarouselApi} className="w-full">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div data-reveal>
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5 block">Rutas destacadas</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Explora destinos inolvidables</h2>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <CarouselPrevious className="static translate-y-0 left-auto top-auto" />
                <CarouselNext className="static translate-y-0 right-auto top-auto" />
              </div>
            </div>
            <CarouselContent className="-ml-6">
              {destinations.map((d) => (
                <CarouselItem key={d.city} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div
                    onClick={() => { props.setDestination(d.city); props.onSearch(); }}
                    className="group relative w-full overflow-hidden rounded-[24px] bg-card text-left shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] cursor-pointer"
                  >
                    <div className="h-[400px] overflow-hidden">
                      <img alt={d.city} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src={d.img} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/80">{d.region}</p>
                      <h3 className="mb-2 text-2xl font-semibold text-white">{d.city}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-white">Desde</span>
                        <span className="text-2xl font-semibold text-white">S/ {d.price}.00</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCityInfo(d);
                        }}
                        className="w-full rounded-full border-2 border-white bg-black/25 hover:bg-white hover:text-black text-white font-bold py-2.5 text-center text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-md"
                      >
                        CONOCE MÁS
                      </button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>
      {/* Beneficios */}
      <section id="beneficios" className="border-y border-border/30 bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">¿Por qué viajar con KUNTUR?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Ofrecemos un servicio interprovincial premium de primer nivel, cuidando cada detalle de tu viaje.</p>
          </div>
          <div data-reveal className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {([
              { icon: ShieldCheck, title: "Seguridad garantizada", desc: "Monitoreo GPS en tiempo real y conductores altamente capacitados para tu tranquilidad en ruta.", img: "/benefit_safety.png" },
              { icon: Bus, title: "Flota moderna", desc: "Buses de última generación equipados con asientos ergonómicos, climatización y pantallas de entretenimiento individual.", img: "/benefit_fleet.png" },
              { icon: Headphones, title: "Atención 24/7", desc: "Canales de soporte directo disponibles antes, durante y después del viaje, siempre listos para ayudarte.", img: "/benefit_support.png" },
            ] as const).map((b) => (
              <div key={b.title} className="group relative flex flex-col rounded-[24px] border border-border/40 bg-card shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-elegant)] overflow-hidden">
                <div className="h-56 overflow-hidden relative">
                  <img alt={b.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={b.img} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 text-primary shadow-md backdrop-blur-md transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <b.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between bg-card">
                  <div>
                    <h3 className="mb-3 text-xl font-bold text-foreground transition-colors group-hover:text-primary">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Métodos de Pago */}
      <section className="border-t border-border/30 bg-background py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 text-center">
          <div data-reveal className="mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5 block">Pago 100% Seguro</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Métodos de pago aceptados</h2>
            <p className="mt-2 text-sm text-muted-foreground">Elige el método que prefieras para comprar tu pasaje de forma segura y rápida.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {/* Yape */}
            <div className="flex h-14 w-28 items-center justify-center rounded-xl bg-card border border-border/60 transition-all hover:scale-105 shadow-sm hover:shadow-md hover:bg-secondary/50 cursor-default">
              <span className="font-black text-xl tracking-tight" style={{ color: "#6D14CC" }}>yape</span>
            </div>
            {/* Plin */}
            <div className="flex h-14 w-28 items-center justify-center rounded-xl bg-card border border-border/60 transition-all hover:scale-105 shadow-sm hover:shadow-md hover:bg-secondary/50 cursor-default">
              <span className="font-black text-xl tracking-tight" style={{ color: "#14B8C8" }}>plin</span>
            </div>
            {/* Visa */}
            <div className="flex h-14 w-28 items-center justify-center rounded-xl bg-card border border-border/60 transition-all hover:scale-105 shadow-sm hover:shadow-md hover:bg-secondary/50 cursor-default">
              <span className="font-black text-xl italic tracking-tight" style={{ color: "#1A1F71" }}>VISA</span>
            </div>
            {/* Mastercard */}
            <div className="flex h-14 w-28 items-center justify-center rounded-xl bg-card border border-border/60 transition-all hover:scale-105 shadow-sm hover:shadow-md p-2 cursor-default hover:bg-secondary/50">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-[#EB001B]" />
                  <div className="h-6 w-6 rounded-full bg-[#F79E1B]" />
                </div>
                <span className="font-bold text-xs tracking-tight" style={{ color: "#231F20" }}>mastercard</span>
              </div>
            </div>
            {/* American Express */}
            <div className="flex h-14 w-28 items-center justify-center rounded-xl bg-card border border-border/60 transition-all hover:scale-105 shadow-sm hover:shadow-md hover:bg-secondary/50 cursor-default">
              <span className="font-bold text-sm tracking-tighter" style={{ color: "#006FCF" }}>AMEX</span>
            </div>
            {/* Diners Club */}
            <div className="flex h-14 w-28 items-center justify-center rounded-xl bg-card border border-border/60 transition-all hover:scale-105 shadow-sm hover:shadow-md hover:bg-secondary/50 cursor-default">
              <span className="font-bold text-xs tracking-wider" style={{ color: "#004A97" }}>Diners Club</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/30 bg-secondary py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-16">
          <div data-reveal className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5 block">Resolvemos tus dudas</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Preguntas frecuentes</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                icon: Luggage,
                q: "¿Cuánto equipaje puedo llevar?",
                a: "Cada pasajero puede llevar hasta 20 kg en bodega y 5 kg de equipaje de mano en cabina. Si necesitas transportar equipaje adicional, contáctanos con anticipación para coordinarlo sin inconvenientes.",
              },
              {
                icon: RefreshCw,
                q: "¿Puedo cancelar o cambiar mi pasaje?",
                a: "Sí. Los cambios de fecha o ruta se realizan hasta 24 horas antes de la salida sin costo adicional. Las cancelaciones tienen un descuento del 10% por gastos administrativos sobre el valor del pasaje.",
              },
              {
                icon: Clock,
                q: "¿Con cuánta anticipación debo llegar a la terminal?",
                a: "Recomendamos llegar con al menos 30 minutos de anticipación para completar el proceso de embarque. Los buses parten puntualmente según el horario indicado en tu boleto.",
              },
              {
                icon: TicketIcon,
                q: "¿Cómo recibo mis pasajes después de comprar?",
                a: "Una vez confirmado el pago, recibirás tus boletos digitales en PDF con código QR al correo que registraste. También puedes acceder a ellos en cualquier momento desde tu cuenta en la plataforma.",
              },
              {
                icon: Star,
                q: "¿Cuál es la diferencia entre Ejecutivo, Cama y Cama nocturna?",
                a: "Ejecutivo: asientos reclinables con WiFi y toma USB. Cama: reclinable a 160° con TV individual, frazada y almohada. Cama Nocturna: reclinable a 180° casi completamente plano, cortinas de privacidad, ideal para viajes largos nocturnos.",
              },
              {
                icon: Users,
                q: "¿Tienen descuentos para estudiantes o adultos mayores?",
                a: "Sí. Ofrecemos 20% de descuento para estudiantes universitarios con carnet vigente y adultos mayores de 65 años con DNI. El descuento se aplica automáticamente al seleccionar la categoría correspondiente durante la compra.",
              },
            ].map(({ icon: Icon, q, a }, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border border-border/50 bg-card px-5 shadow-[var(--shadow-card)] data-[state=open]:border-primary/30 data-[state=open]:shadow-[var(--shadow-soft)] transition-all"
              >
                <AccordionTrigger className="gap-4 py-5 text-left text-sm font-semibold text-foreground hover:no-underline hover:text-primary [&[data-state=open]]:text-primary">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    {q}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-11 text-sm leading-relaxed text-muted-foreground">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Dialog for details */}
      <Dialog open={!!selectedCityInfo} onOpenChange={(open) => !open && setSelectedCityInfo(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[28px] border border-border/40 shadow-2xl bg-card flex flex-col max-h-[90dvh] [&>button]:bg-black/40 [&>button]:text-white [&>button]:hover:bg-black/60 [&>button]:rounded-full [&>button]:p-2 [&>button]:border [&>button]:border-white/20 [&>button]:transition-all">
          {selectedCityInfo && (() => {
            const details = destinationDetails[selectedCityInfo.city];
            return (
              <>
                {/* Image — fija, no hace scroll */}
                <div className="relative h-[180px] sm:h-[220px] w-full flex-shrink-0">
                  <img alt={selectedCityInfo.city} className="h-full w-full object-cover" src={selectedCityInfo.img} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute bottom-4 left-5 sm:bottom-6 sm:left-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.78_0.13_160)]">{selectedCityInfo.region}</p>
                    <DialogTitle asChild>
                      <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">{selectedCityInfo.city}</h2>
                    </DialogTitle>
                  </div>
                </div>
                {/* Contenido scrollable */}
                <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                      <Compass className="h-4 w-4 text-primary flex-shrink-0" /> Historia y Cultura
                    </h3>
                    <DialogDescription asChild>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {details?.history}
                      </p>
                    </DialogDescription>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-secondary/50 border border-border/20 flex flex-col items-center text-center">
                      <Sun className="h-5 w-5 text-orange-500 mb-1.5" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Clima</span>
                      <span className="text-[11px] font-semibold text-foreground leading-snug">{details?.weather}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-secondary/50 border border-border/20 flex flex-col items-center text-center">
                      <Utensils className="h-5 w-5 text-green-600 mb-1.5" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Plato Bandera</span>
                      <span className="text-[11px] font-semibold text-foreground leading-snug">{details?.food}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-secondary/50 border border-border/20 flex flex-col items-center text-center">
                      <Sparkles className="h-5 w-5 text-amber-500 mb-1.5" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">¿Sabías que...?</span>
                      <span className="text-[11px] font-semibold text-foreground leading-snug">{details?.fact}</span>
                    </div>
                  </div>
                </div>
                {/* Footer fijo */}
                <div className="p-4 sm:p-5 border-t border-border/40 bg-secondary/30 flex items-center justify-between gap-3 flex-col sm:flex-row flex-shrink-0">
                  <div className="flex flex-col text-center sm:text-left">
                    <span className="text-xs text-muted-foreground">Pasajes de ida desde</span>
                    <span className="text-xl font-extrabold text-foreground">S/ {selectedCityInfo.price}.00</span>
                  </div>
                  <button
                    onClick={() => {
                      props.setDestination(selectedCityInfo.city);
                      props.onSearch();
                      setSelectedCityInfo(null);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-95 px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
                  >
                    Buscar Pasajes <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ====== DATE PICKER ====== */
export function DatePickerField({ value, onChange, borderless }: { value: Date; onChange: (v: Date) => void; borderless?: boolean }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-2 text-left transition-colors focus:outline-none",
            borderless
              ? "bg-transparent border-0 p-0 py-1 text-sm font-extrabold text-foreground hover:text-primary"
              : "rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm px-4 py-4 hover:border-primary/50"
          )}
        >
          <span className="capitalize">{format(value, "EEE d MMM", { locale: es })}</span>
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <CalendarPicker mode="single" selected={value} onSelect={(d) => d && onChange(d)} disabled={(d) => d < today} initialFocus locale={es} className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}

/* ====== STEPPER ====== */
export function Stepper({ step }: { step: string }) {
  const steps = ["search", "trips", "seats", "passengers", "payment", "ticket"];
  const labels = ["Buscar", "Viajes", "Asientos", "Datos", "Pago", "Boleto"];
  const idx = steps.indexOf(step);
  return (
    <div className="mb-10 w-full overflow-x-auto pb-2">
      <div className="flex items-center justify-center min-w-max mx-auto px-4">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-full text-sm font-black transition-all duration-300 select-none",
                i < idx
                  ? "bg-primary/15 text-primary ring-2 ring-primary/30"
                  : i === idx
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.45)] ring-4 ring-primary/20 scale-110"
                  : "bg-muted text-muted-foreground/50"
              )}>
                {i < idx ? (
                  <svg viewBox="0 0 12 12" fill="none" className="h-4 w-4 stroke-primary stroke-[2.5]">
                    <polyline points="1.5,6.5 4.5,9.5 10.5,2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
                {i === idx && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-primary/20 -z-10" />
                )}
              </div>
              <span className={cn(
                "text-[11px] font-semibold whitespace-nowrap tracking-wide transition-colors",
                i === idx ? "text-primary" : i < idx ? "text-primary/60" : "text-muted-foreground/50"
              )}>{l}</span>
            </div>
            {i < labels.length - 1 && (
              <div className={cn(
                "mx-1 sm:mx-2 mb-5 h-[2px] w-8 sm:w-14 rounded-full transition-all duration-500",
                i < idx ? "bg-primary/50" : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====== TRIPS LIST ====== */
export function TripsList({ origin, destination, date, onPick, onBack }: {
  origin: string; destination: string; date: Date; onPick: (id: string) => void; onBack: () => void;
}) {
  const dateLabel = format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
  const [activeCategory, setActiveCategory] = useState("Todos");
  const filtered = tripsBase.filter((t) => activeCategory === "Todos" || t.type === activeCategory);

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
            <button onClick={onBack} className="bg-primary text-primary-foreground p-3 rounded-full shadow-md hover:rotate-180 transition-transform duration-500 z-10">
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
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><p className="text-base font-semibold capitalize">{dateLabel}</p></div>
        </div>
        <button onClick={onBack} className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg active:scale-95">Modificar</button>
      </div>
      {/* Category filter */}
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6">
          <SlidersHorizontal className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          {ALL_CATEGORIES.map((cat) => {
            const s = cat !== "Todos" ? tripStyles[cat] : null;
            const Icon = s?.icon;
            const chip = (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all", activeCategory === cat ? s ? `${s.chip} shadow-sm` : "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
                {Icon && <Icon className="h-3 w-3" />}{cat}
              </button>
            );
            if (!s) return chip;
            return (
              <Tooltip key={cat}>
                <TooltipTrigger asChild>{chip}</TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px] text-center text-xs leading-snug">
                  <p className="font-semibold mb-0.5">{s.label} · {s.tagline}</p>
                  <p className="text-muted-foreground">{s.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6">Viajes Disponibles</h2>
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-border bg-card p-12 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">Sin viajes disponibles</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              No encontramos viajes de tipo <strong className="text-foreground">{activeCategory}</strong> para esta ruta. Prueba con otra categoría.
            </p>
            <button
              onClick={() => setActiveCategory("Todos")}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
            >
              <X className="h-3.5 w-3.5" /> Ver todos los viajes
            </button>
          </div>
        )}
        {filtered.map((t, idx) => {
          const s = getTripStyle(t.type);
          const Icon = s.icon;
          const isFirst = idx === 0;
          return (
            <button key={t.id} onClick={() => onPick(t.id)} className={cn("group relative flex w-full flex-col md:flex-row items-start md:items-center justify-between overflow-hidden rounded-[24px] border p-6 text-left shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 bg-card", isFirst ? "border-2 border-primary ring-4 ring-primary/5" : "border-border/30 hover:border-primary/50")}>
              {isFirst && <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl text-[11px] font-bold uppercase tracking-wider">Recomendado</div>}
              <div className="flex items-start gap-4 flex-1">
                <div className="hidden sm:flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]" style={{ background: s.gradient }}><Icon className="h-6 w-6" /></div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", s.chip)}><Icon className="h-3 w-3" /> {s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-xs", t.seats <= 6 ? "text-destructive" : "text-primary")}>{t.seats <= 6 ? `¡Solo ${t.seats}!` : `${t.seats} disponibles`}</span>
                      <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-500", t.seats <= 6 ? "bg-destructive" : t.seats <= 12 ? "bg-[var(--warning)]" : "bg-primary")} style={{ width: `${Math.round((t.seats / 44) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div><p className="text-2xl font-semibold text-foreground">{t.time}</p><p className="text-xs text-muted-foreground">{origin}</p></div>
                    <div className="flex flex-col items-center flex-1 max-w-[120px]">
                      <p className="text-xs text-muted-foreground mb-1">{t.dur}</p>
                      <div className="w-full h-[2px] bg-border relative"><div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-border" /><div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-border" /></div>
                      <Bus className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                    </div>
                    <div className="text-right"><p className="text-2xl font-semibold text-foreground">{t.arr}</p><p className="text-xs text-muted-foreground">{destination}</p></div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              </div>
              <div className="md:border-l border-border/30 md:pl-6 flex flex-col items-center md:items-end mt-4 md:mt-0 w-full md:w-auto">
                <p className="text-xs text-muted-foreground mb-1">Precio por persona</p>
                <p className={cn("text-3xl font-bold mb-4", isFirst ? "text-primary" : "text-foreground")}>S/ {t.price}.00</p>
                <div className={cn("w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm text-center transition-all", isFirst ? "bg-primary text-primary-foreground shadow-lg active:scale-95" : "border-2 border-primary text-primary hover:bg-primary/5")}>Seleccionar</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ====== SEAT STEP ====== */
export function SeatStep({ trip, seats, selected, total, toggleSeat, onBack, onPay, user, pax }: {
  trip: typeof tripsBase[number]; seats: Seat[]; selected: Seat[]; total: number;
  toggleSeat: (id: string) => void; onBack: () => void; onPay: () => void;
  user: ReturnType<typeof useAuth>["user"]; pax: number;
}) {
  const isWrongRole = user && user.role !== "cliente";
  const s = getTripStyle(trip.type);
  const Icon = s.icon;
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  useEffect(() => {
    if (timeLeft === 0) return;
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const expired = timeLeft === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-2">&larr; Volver a viajes</button>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Selecciona tus asientos</h2>
        <p className="text-sm text-muted-foreground mb-6">Selecci&oacute;n libre &middot; toca para reservar</p>
        <SeatMap seats={seats} onSelect={toggleSeat} variant="client" />
      </div>
      <aside className="rounded-[24px] border border-border/20 bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] lg:sticky lg:top-28 lg:h-fit">
        <div className={cn("flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold mb-5 tabular-nums", expired ? "bg-destructive/10 text-destructive border border-destructive/20" : timeLeft < 120 ? "bg-[var(--warning)]/15 text-[var(--warning-foreground)] border border-[var(--warning)]/30" : "bg-secondary text-muted-foreground")}>
          <Timer className={cn("h-3.5 w-3.5", !expired && timeLeft < 120 && "animate-pulse")} />
          {expired ? "Tiempo agotado — recarga la página" : `Tiempo para completar: ${mins}:${secs}`}
        </div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tu reserva</h3>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.chip)}><Icon className="h-3 w-3" /> {s.label}</span>
        </div>
        <div className="space-y-3 text-sm">
          <Row k="Viaje" v={`${trip.time} \u00b7 ${trip.type}`} />
          <Row k="Asientos" v={selected.length ? selected.map((s) => s.id).join(", ") : "\u2014"} />
          <Row k="Precio unit." v={`S/ ${trip.price}`} />
          <Row k="Pasajeros" v={`${selected.length}/${pax}`} />
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
        <button disabled={selected.length !== pax} onClick={onPay} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">
          <CreditCard className="h-4 w-4" /> Continuar al pago
        </button>
        {selected.length !== pax && <p className="mt-2 text-center text-[11px] text-muted-foreground">Selecciona exactamente {pax} asiento{pax > 1 ? "s" : ""} para continuar.</p>}
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (<div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium text-foreground">{v}</span></div>);
}

/* ====== AUTH BLOCK MODAL ====== */
export function AuthBlockModal({ onClose, onLogin, user }: { onClose: () => void; onLogin: () => void; user: ReturnType<typeof useAuth>["user"]; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/15 text-destructive"><AlertCircle className="h-5 w-5" /></div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Cuenta no permitida</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Tu cuenta de <strong>{user?.role}</strong> no puede comprar pasajes.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 space-y-2">
          <button onClick={onLogin} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg"><LogIn className="h-4 w-4" /> Cambiar de cuenta</button>
          <button onClick={onClose} className="w-full rounded-xl border border-border bg-background py-3 font-semibold text-foreground transition-colors hover:bg-muted">Seguir explorando</button>
        </div>
      </div>
    </div>
  );
}

/* ====== TICKET RESULT ====== */
export function TicketResult({ selected, trip, origin, destination, date, passengers, onNew, user, guestEmail }: {
  selected: Seat[]; trip: typeof tripsBase[number]; origin: string; destination: string; date: Date;
  passengers?: { dni: string; name: string }[]; onNew: () => void;
  user: ReturnType<typeof useAuth>["user"]; guestEmail: string;
}) {
  const dateLabel = format(date, "d MMM yyyy", { locale: es });
  const s = getTripStyle(trip.type);
  const Icon = s.icon;
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault(); setRegError("");
    const firstName = passengers?.[0]?.name || "Invitado Kuntur";
    const res = registerAccount({ name: firstName, email: guestEmail, password: regPassword, role: "cliente" });
    if (!res.ok) { setRegError(res.error); return; }
    storeUser(res.user); setRegSuccess(true);
  };

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      <div className="mb-4 flex max-w-full items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary overflow-hidden">
        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" /> <span className="truncate">Pago confirmado &middot; {user ? user.name : (passengers?.[0]?.name || "Invitado")}</span>
      </div>
      <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="p-6 text-white" style={{ background: s.gradient }}>
          <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-90">
            <span className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {s.label}</span>
            <span>KUNTUR &middot; 2026</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div><div className="text-3xl font-bold">{origin}</div><div className="text-xs opacity-90">{trip.time} &middot; {dateLabel}</div></div>
            <ArrowRight className="h-5 w-5" />
            <div className="text-right"><div className="text-3xl font-bold">{destination}</div><div className="text-xs opacity-90">{trip.arr} &middot; {dateLabel}</div></div>
          </div>
        </div>
        <div className="flex flex-col items-center p-6">
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-secondary p-5">
            <div className="grid h-44 w-44 grid-cols-8 grid-rows-8 gap-0.5">
              {Array.from({ length: 64 }).map((_, i) => (<div key={i} className={`${(i * 7) % 3 === 0 ? "bg-foreground" : "bg-transparent"} rounded-[2px]`} />))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><QrCode className="h-3.5 w-3.5" /> Mu&eacute;stralo al auxiliar</div>
          <div className="mt-5 grid w-full grid-cols-3 gap-3 border-t border-dashed border-border pt-5 text-center">
            <MiniTicket k="Asientos" v={selected.map((s) => s.id).join(", ")} />
            <MiniTicket k="Bus" v="JY-104" />
            <MiniTicket k="Total" v={`S/ ${selected.length * trip.price}`} />
          </div>
          {passengers && passengers.length > 0 && (
            <div className="mt-4 w-full rounded-xl bg-secondary p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pasajeros</div>
              <ul className="mt-1 space-y-0.5 text-xs font-medium text-foreground">
                {passengers.map((p, i) => (<li key={i} className="flex items-center justify-between gap-2"><span className="truncate">{p.name || "\u2014"}</span><span className="whitespace-nowrap text-muted-foreground">DNI {p.dni || "\u2014"} &middot; {selected[i]?.id}</span></li>))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--success)]"><Clock className="h-3.5 w-3.5" /> Llega 30 min antes de la salida</div>
        </div>
      </div>
      {!user && guestEmail && (
        <div className="mt-6 w-full max-w-md bg-card border border-border/50 rounded-[24px] p-6 shadow-[var(--shadow-elegant)] transition-all">
          {regSuccess ? (
            <div className="text-center space-y-2 py-2">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary"><CheckCircle2 className="h-5 w-5" /></div>
              <h4 className="text-sm font-bold text-foreground">&iexcl;Cuenta creada con &eacute;xito!</h4>
              <p className="text-xs text-muted-foreground">Te has registrado como <strong>{passengers?.[0]?.name || "Cliente"}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5 animate-pulse" /></div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">&iquest;Quieres guardar tu cuenta?</h4>
                  <p className="text-xs text-muted-foreground">Crea una contrase&ntilde;a para <strong className="text-foreground">{guestEmail}</strong>.</p>
                </div>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input required type="password" placeholder="Crea una contrase\u00f1a" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
              </div>
              {regError && <div className="text-xs font-semibold text-destructive">{regError}</div>}
              <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all active:scale-[0.98]">Guardar mi cuenta</button>
            </form>
          )}
        </div>
      )}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => toast.success("PDF generado", { description: "Revisa tu carpeta de descargas." })}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Download className="h-4 w-4 text-primary" /> Descargar PDF
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(`Boleto KUNTUR · ${origin} → ${destination} · ${trip.time}`).catch(() => {});
            toast.success("¡Enlace copiado!", { description: "Comparte tu reserva fácilmente." });
          }}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Share2 className="h-4 w-4 text-primary" /> Compartir
        </button>
      </div>
      <button onClick={onNew} className="mt-3 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">Comprar otro pasaje</button>
    </div>
  );
}

function MiniTicket({ k, v }: { k: string; v: string }) {
  return (<div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div><div className="mt-0.5 text-sm font-bold text-foreground">{v}</div></div>);
}

/* ====== PASSENGERS STEP ====== */
function dniFieldStatus(v: string): FieldStatus {
  if (!v) return "idle";
  return /^\d{8}$/.test(v) ? "valid" : "invalid";
}
function dniFieldHint(v: string): string | undefined {
  if (!v) return undefined;
  if (/^\d{8}$/.test(v)) return "DNI v\u00e1lido";
  const rem = 8 - v.length;
  return rem > 0 ? `Faltan ${rem} d\u00edgito${rem === 1 ? "" : "s"}` : "Solo se permiten 8 d\u00edgitos";
}
function nameFieldStatus(v: string): FieldStatus {
  if (!v) return "idle";
  return v.trim().length >= 3 ? "valid" : "invalid";
}
function nameFieldHint(v: string): string | undefined {
  if (!v || v.trim().length >= 3) return undefined;
  return `M\u00ednimo 3 caracteres (${v.trim().length}/3)`;
}
function emailFieldStatus(v: string): FieldStatus {
  if (!v) return "idle";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "valid" : "invalid";
}
function emailFieldHint(v: string): string | undefined {
  if (!v) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Correo v\u00e1lido" : "Introduce un correo v\u00e1lido";
}

export function PassengersStep({ selected, passengers, setPassengers, total, onBack, onNext, user, guestEmail, setGuestEmail }: {
  selected: Seat[]; passengers: { dni: string; name: string }[];
  setPassengers: (p: { dni: string; name: string }[]) => void;
  total: number; onBack: () => void; onNext: () => void;
  user: ReturnType<typeof useAuth>["user"]; guestEmail: string; setGuestEmail: (email: string) => void;
}) {
  const update = (i: number, patch: Partial<{ dni: string; name: string }>) => {
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };
  const emailValid = user ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
  const valid = passengers.every((p) => /^\d{8}$/.test(p.dni) && p.name.trim().length >= 3) && emailValid;

  const completedCount = passengers.filter((p) => /^\d{8}$/.test(p.dni) && p.name.trim().length >= 3).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-2">&larr; Volver a asientos</button>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Datos de los pasajeros</h2>
        <p className="text-sm text-muted-foreground mb-6">Necesitamos esta informaci&oacute;n por requerimiento de transporte.</p>
        <div className="space-y-4">
          {!user && (
            <div className="rounded-[24px] border border-primary/20 bg-primary/5 p-6 shadow-[var(--shadow-card)]">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><Mail className="h-4 w-4" /></div>
                <span className="text-sm font-bold text-foreground">Contacto para env&iacute;o de pasajes</span>
              </div>
              <FieldInput
                icon={Mail}
                label="Correo electr\u00f3nico"
                placeholder="ejemplo@correo.com"
                value={guestEmail}
                onChange={setGuestEmail}
                status={emailFieldStatus(guestEmail)}
                hint={emailFieldHint(guestEmail)}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">Enviaremos tus boletos en PDF y tu c&oacute;digo QR a este correo.</p>
            </div>
          )}
          {passengers.map((p, i) => {
            const pDniStatus  = dniFieldStatus(p.dni);
            const pNameStatus = nameFieldStatus(p.name);
            const pComplete   = pDniStatus === "valid" && pNameStatus === "valid";
            return (
              <div
                key={i}
                className={`rounded-[24px] border bg-card p-6 shadow-[var(--shadow-card)] transition-all ${pComplete ? "border-[var(--success)]/40" : "border-border/20"}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-primary-foreground transition-colors ${pComplete ? "bg-[var(--success)]" : "bg-primary"}`}>
                      {pComplete ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className="text-sm font-bold text-foreground">Pasajero &middot; Asiento {selected[i]?.id}</span>
                  </div>
                  {pComplete && (
                    <span className="rounded-full bg-[var(--success)]/10 px-2.5 py-1 text-[10px] font-black text-[var(--success)]">
                      Completo
                    </span>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FieldInput
                    icon={IdCard}
                    label="DNI"
                    placeholder="12345678"
                    maxLength={8}
                    value={p.dni}
                    onChange={(v) => update(i, { dni: v.replace(/\D/g, "").slice(0, 8) })}
                    status={pDniStatus}
                    hint={dniFieldHint(p.dni)}
                    showCounter
                  />
                  <FieldInput
                    icon={UserIcon}
                    label="Nombre completo"
                    placeholder="Mar\u00eda L\u00f3pez"
                    value={p.name}
                    onChange={(v) => update(i, { name: v })}
                    status={pNameStatus}
                    hint={nameFieldHint(p.name)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <aside className="rounded-[24px] border border-border/20 bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] lg:sticky lg:top-28 lg:h-fit">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resumen</h3>
        <div className="mt-4 space-y-3 text-sm">
          <Row k="Asientos" v={selected.map((s) => s.id).join(", ")} />
          <Row k="Pasajeros" v={`${completedCount} / ${passengers.length} completados`} />
        </div>
        <div className="my-5 h-px bg-border" />

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
            <span>Progreso</span>
            <span className={completedCount === passengers.length ? "text-[var(--success)]" : "text-primary"}>
              {completedCount}/{passengers.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-500 ${completedCount === passengers.length ? "bg-[var(--success)]" : "bg-primary"}`}
              style={{ width: `${passengers.length > 0 ? (completedCount / passengers.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-primary">S/ {total}</span>
        </div>
        <button disabled={!valid} onClick={onNext} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">
          Continuar al pago <ArrowRight className="h-4 w-4" />
        </button>
        {!valid && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {!emailValid ? "Introduce un correo v\u00e1lido. " : ""}
            {completedCount < passengers.length ? `Completa los datos de ${passengers.length - completedCount} pasajero${passengers.length - completedCount !== 1 ? "s" : ""}.` : ""}
          </p>
        )}
      </aside>
    </div>
  );
}

type FieldStatus = "valid" | "invalid" | "idle";

function FieldInput({ icon: Icon, label, value, onChange, placeholder, maxLength, status = "idle", hint, showCounter }: {
  icon: any; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number;
  status?: FieldStatus; hint?: string; showCounter?: boolean;
}) {
  const borderCls = status === "valid"
    ? "border-[var(--success)]"
    : status === "invalid" && value.length > 0
    ? "border-destructive"
    : "border-border";
  const focusCls = status === "valid"
    ? "focus-within:ring-[var(--success)]/20 focus-within:border-[var(--success)]"
    : status === "invalid" && value.length > 0
    ? "focus-within:ring-destructive/20 focus-within:border-destructive"
    : "focus-within:border-primary focus-within:ring-primary/20";
  return (
    <div className={`rounded-xl border ${borderCls} bg-background px-4 py-3 transition-all focus-within:ring-2 ${focusCls}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3 w-3" /> {label}
        </span>
        <div className="flex items-center gap-1.5">
          {showCounter && maxLength && (
            <span className={`text-[10px] font-bold tabular-nums ${value.length === maxLength ? "text-[var(--success)]" : value.length > 0 ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
              {value.length}/{maxLength}
            </span>
          )}
          {status === "valid" && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] flex-shrink-0" />}
          {status === "invalid" && value.length > 0 && <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />}
        </div>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
      />
      {hint && value.length > 0 && (
        <p className={`mt-1 text-[10px] font-medium ${status === "valid" ? "text-[var(--success)]" : "text-destructive"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ====== PAYMENT STEP ====== */
export function PaymentStep({ total, payment, setPayment, onBack, onPay }: {
  total: number; payment: { method: "card" | "yape" | "plin"; card: string; exp: string; cvv: string };
  setPayment: (p: typeof payment) => void; onBack: () => void; onPay: () => void;
}) {
  const methods: { id: "card" | "yape" | "plin"; label: string; desc: string; icon: any }[] = [
    { id: "card",  label: "Tarjeta", desc: "Visa \u00b7 Mastercard",     icon: CreditCard  },
    { id: "yape",  label: "Yape",    desc: "Pago instant\u00e1neo",      icon: Smartphone  },
    { id: "plin",  label: "Plin",    desc: "Transferencia m\u00f3vil",   icon: Smartphone  },
  ];
  const cardOk = payment.method !== "card" || (payment.card.replace(/\s/g, "").length >= 13 && /^\d{2}\/\d{2}$/.test(payment.exp) && /^\d{3,4}$/.test(payment.cvv));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground hover:text-foreground mb-2">&larr; Volver a datos</button>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">M&eacute;todo de pago</h2>
        <p className="text-sm text-muted-foreground mb-6">Pago simulado &middot; ning&uacute;n cargo real.</p>
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          {methods.map((m) => (
            <button key={m.id} onClick={() => setPayment({ ...payment, method: m.id })} className={cn("rounded-[20px] border-2 p-5 text-left transition-all bg-background", payment.method === m.id ? "border-primary shadow-[var(--shadow-soft)]" : "border-border hover:border-primary/40")}>
              <div className="flex items-center gap-2 text-sm font-bold text-foreground"><m.icon className="h-5 w-5 text-primary" /> {m.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.desc}</div>
            </button>
          ))}
        </div>
        {payment.method === "card" && (
          <div className="rounded-[24px] border border-border/20 bg-card p-6 shadow-[var(--shadow-card)]">
            <FieldInput icon={CreditCard} label="N\u00famero de tarjeta" placeholder="4242 4242 4242 4242" value={payment.card} onChange={(v) => setPayment({ ...payment, card: v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <FieldInput icon={Calendar} label="Vencimiento" placeholder="MM/AA" value={payment.exp} onChange={(v) => { const d = v.replace(/\D/g, "").slice(0, 4); setPayment({ ...payment, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} />
              <FieldInput icon={Lock} label="CVV" placeholder="123" maxLength={4} value={payment.cvv} onChange={(v) => setPayment({ ...payment, cvv: v.replace(/\D/g, "").slice(0, 4) })} />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-primary font-medium"><Lock className="h-4 w-4" /> Pago 100% seguro &middot; datos cifrados</div>
          </div>
        )}
        {payment.method !== "card" && (
          <div className="rounded-[24px] border border-border/20 bg-card p-8 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary"><QrCode className="h-8 w-8" /></div>
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
        <button disabled={!cardOk} onClick={onPay} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">
          <CheckCircle2 className="h-4 w-4" /> Confirmar pago
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">Pago ficticio para demostraci&oacute;n.</p>
      </aside>
    </div>
  );
}

/* ====== FOOTER ====== */
export function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="text-xl font-bold text-foreground">KUNTUR</span>
          <p className="text-xs text-muted-foreground max-w-sm text-center md:text-left">&copy; 2026 KUNTUR. Todos los derechos reservados. Movilidad premium con puntualidad garantizada.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {["Legal", "Privacidad", "Soporte", "T\u00e9rminos", "Contacto"].map((link) => (
            <a key={link} href="#" className="text-muted-foreground hover:text-primary transition-colors hover:underline decoration-primary decoration-2 underline-offset-4">{link}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
