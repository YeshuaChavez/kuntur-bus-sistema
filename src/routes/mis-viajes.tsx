import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getPurchases, type PurchaseRecord } from "@/lib/purchases";
import { Header, Footer } from "./index";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar, Users, Ticket, QrCode, ArrowRight, Bus,
  MapPin, ChevronRight, Clock, Crown, X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/mis-viajes")({
  head: () => ({
    meta: [
      { title: "Mis Viajes — KUNTUR" },
      { name: "description", content: "Historial de tus compras y reservas en KUNTUR." },
    ],
  }),
  component: MisViajesPage,
});

function MisViajesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [selected, setSelected] = useState<PurchaseRecord | null>(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/mis-viajes" } });
      return;
    }
    if (user.role !== "cliente") {
      navigate({ to: "/" });
      return;
    }
    setPurchases(getPurchases(user.email));
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 pb-16 pt-14">
        {/* Page header */}
        <div className="mb-10">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
            Tu historial
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Mis viajes
          </h1>
          {user && (
            <p className="mt-2 text-muted-foreground">
              Bienvenida, <strong className="text-foreground">{user.name}</strong>. Aquí tienes todos tus boletos reservados.
            </p>
          )}
        </div>

        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-card py-24 text-center shadow-[var(--shadow-card)]">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Bus className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Aún no tienes viajes</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Cuando compres tu primer boleto aparecerá aquí con todos los detalles de tu reserva.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.55_0.14_150_/_0.5)] transition-all hover:brightness-110 active:scale-95"
            >
              Buscar destinos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((p) => (
              <PurchaseCard key={p.id} purchase={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Ticket detail modal */}
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-sm gap-0 overflow-hidden rounded-3xl p-0">
          {/* Gradient header */}
          <div className="relative bg-[image:var(--gradient-primary)] px-6 pb-8 pt-6 text-primary-foreground">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">KUNTUR Transportes</p>
            <div className="mt-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 opacity-80" />
              <span className="text-xl font-extrabold tracking-tight">{selected?.origin}</span>
              <ArrowRight className="h-4 w-4 opacity-60" />
              <span className="text-xl font-extrabold tracking-tight">{selected?.destination}</span>
            </div>
            <p className="mt-1 font-mono text-[11px] opacity-60">#KNT-{selected?.id}</p>
          </div>

          {/* Tear-line */}
          <div className="relative -mt-4 flex items-center overflow-visible">
            <div className="absolute -left-3 h-6 w-6 rounded-full bg-background" />
            <div className="h-px w-full border-t border-dashed border-border" />
            <div className="absolute -right-3 h-6 w-6 rounded-full bg-background" />
          </div>

          {/* Body */}
          <div className="space-y-5 px-6 pb-6 pt-4">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fecha de salida</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-sm font-semibold capitalize text-foreground">
                    {selected ? format(new Date(selected.departureDate), "d MMM yyyy", { locale: es }) : ""}
                  </span>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hora</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{selected?.departureTime}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clase</p>
                <div className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{selected?.tripClass}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total pagado</p>
                <p className="text-sm font-extrabold text-primary">S/ {selected?.total}.00</p>
              </div>
            </div>

            {/* Seats */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Asientos</p>
              <div className="flex flex-wrap gap-2">
                {selected?.seats.map((s) => (
                  <span key={s} className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    <Ticket className="h-3 w-3" /> {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Passengers */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pasajeros</p>
              <div className="space-y-1.5 rounded-xl border border-border bg-secondary/30 p-3">
                {selected?.passengers.map((pass, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {i + 1}
                      </div>
                      <span className="truncate text-sm font-medium text-foreground">{pass.name}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">DNI {pass.dni}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QR placeholder */}
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
                <QrCode className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground">Muestra este código al abordar</p>
              <span className="font-mono text-xs font-bold text-foreground">#KNT-{selected?.id}</span>
            </div>

            <p className="text-center text-[10px] text-muted-foreground">
              Comprado el {selected ? format(new Date(selected.purchaseDate), "d 'de' MMMM 'de' yyyy · HH:mm", { locale: es }) : ""}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PurchaseCard({ purchase: p, onClick }: { purchase: PurchaseRecord; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-card p-5 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-elegant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {format(new Date(p.purchaseDate), "d MMM yyyy · HH:mm", { locale: es })}
          </p>
          <p className="mt-0.5 truncate text-lg font-bold text-foreground">
            {p.origin} → {p.destination}
          </p>
        </div>
        <span className="whitespace-nowrap rounded-xl bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          S/ {p.total}
        </span>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="capitalize">
            {format(new Date(p.departureDate), "EEEE d MMM", { locale: es })} · {p.departureTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{p.passengers.map((pass) => pass.name).join(", ")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Ticket className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>Asientos: {p.seats.join(", ")} · {p.tripClass}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
        <span className="font-mono text-[10px] font-bold text-muted-foreground">#KNT-{p.id}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
          Ver detalles <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}
