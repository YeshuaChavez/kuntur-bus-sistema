import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { savePurchase } from "@/lib/purchases";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Mail, MapPin, Calendar, Users, QrCode } from "lucide-react";
import {
  Header,
  Footer,
  Stepper,
  PaymentStep,
  getBookingState,
  tripsBase,
} from "./index";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Método de pago — KUNTUR" },
      { name: "description", content: "Simulación de pasarela de pago para comprar tu boleto." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");

  // Load from sessionStorage
  const booking = useMemo(() => getBookingState(), []);

  const [showEmail, setShowEmail] = useState(false);
  const [purchaseId, setPurchaseId] = useState("");
  const [payment, setPayment] = useState({
    method: "card" as "card" | "yape" | "plin",
    card: "",
    exp: "",
    cvv: "",
  });

  useEffect(() => {
    // Basic validation to prevent entering payment without previous info
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = user ? true : emailRegex.test(booking.guestEmail || "");
    const passengersValid = booking.passengers && booking.passengers.length > 0 && booking.passengers.every((p) => /^\d{8}$/.test(p.dni) && p.name.trim().length >= 3);

    if (!booking.tripId || !booking.selectedSeats || booking.selectedSeats.length === 0 || !passengersValid || !emailValid) {
      navigate({ to: "/" });
    }
  }, [booking, user, navigate]);

  const trip = useMemo(() => {
    return tripsBase.find((t) => t.id === booking.tripId) || tripsBase[0];
  }, [booking.tripId]);

  const total = (booking.selectedSeats?.length || 0) * trip.price;

  const handlePay = () => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setPurchaseId(id);

    const userEmail = user?.email || booking.guestEmail || "";
    if (userEmail) {
      savePurchase(userEmail, {
        id,
        purchaseDate: new Date().toISOString(),
        origin: booking.origin || "Lima",
        destination: booking.destination || "Trujillo",
        departureDate: booking.date || new Date().toISOString(),
        departureTime: trip.time,
        seats: booking.selectedSeats || [],
        passengers: booking.passengers || [],
        total,
        tripClass: trip.type,
      });
    }

    const seats = booking.selectedSeats?.length ?? 1;
    toast.success("¡Pago confirmado!", {
      description: `${seats} boleto${seats > 1 ? "s" : ""} reservado${seats > 1 ? "s" : ""} · Revisa tu correo para el QR.`,
      duration: 6000,
    });
    setShowEmail(true);
  };

  const handleBack = () => {
    navigate({ to: "/passengers" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 pb-16 pt-14">
        <Stepper step="payment" />
        <PaymentStep
          total={total}
          payment={payment}
          setPayment={setPayment}
          onBack={handleBack}
          onPay={handlePay}
        />
      </main>
      <Footer />

      {/* Email confirmation modal */}
      <Dialog open={showEmail} onOpenChange={(open) => { if (!open) navigate({ to: "/ticket" }); }}>
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0 flex flex-col max-h-[90dvh]">
          {/* Email header — fijo */}
          <div className="flex-shrink-0 bg-[image:var(--gradient-primary)] px-6 py-5 text-primary-foreground">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] opacity-75">De: notificaciones@kuntur.com</p>
                <p className="truncate text-[11px] opacity-75">Para: {user?.email || booking.guestEmail}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 shrink-0 opacity-80" />
            </div>
            <h2 className="text-base font-bold">Confirmación de Reserva</h2>
            <p className="mt-0.5 text-[11px] opacity-75">#{purchaseId} · Pago procesado exitosamente</p>
          </div>

          {/* Email body — scrollable */}
          <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5">
            <p className="text-sm text-foreground">
              Hola <strong>{booking.passengers?.[0]?.name ?? "Viajero"}</strong>, tu reserva fue confirmada. Aquí están los detalles de tu viaje.
            </p>

            <div className="space-y-2.5 rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-semibold">{booking.origin} → {booking.destination}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm capitalize">
                  {booking.date ? format(new Date(booking.date), "EEEE d 'de' MMMM", { locale: es }) : ""} · {trip.time}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{booking.selectedSeats?.length ?? 1} asiento(s): {booking.selectedSeats?.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <span className="text-sm text-muted-foreground">Total pagado</span>
                <span className="font-bold text-primary">S/ {total}.00</span>
              </div>
            </div>

            {/* QR placeholder */}
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
                <QrCode className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground">Muestra este código al conductor para abordar</p>
              <span className="font-mono text-xs font-bold text-foreground">#KNT-{purchaseId}</span>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              Esta es una notificación automática de KUNTUR Transportes. No respondas este mensaje.
            </p>
          </div>

          {/* Footer — fijo */}
          <div className="flex-shrink-0 border-t border-border px-6 pb-5 pt-4">
            <button
              onClick={() => { setShowEmail(false); navigate({ to: "/ticket" }); }}
              className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
            >
              Ver ticket digital
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
