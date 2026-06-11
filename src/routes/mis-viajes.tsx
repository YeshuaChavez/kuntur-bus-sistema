import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getPurchases, type PurchaseRecord } from "@/lib/purchases";
import { Header, Footer } from "./index";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Users, Ticket, QrCode, ArrowRight, Bus } from "lucide-react";

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
              <PurchaseCard key={p.id} purchase={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function PurchaseCard({ purchase: p }: { purchase: PurchaseRecord }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/50">
          <QrCode className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
