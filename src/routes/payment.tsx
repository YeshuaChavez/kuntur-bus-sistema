import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
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
    toast.success("¡Pago confirmado!", {
      description: `${booking.selectedSeats?.length ?? 1} boleto${(booking.selectedSeats?.length ?? 1) > 1 ? "s" : ""} reservado${(booking.selectedSeats?.length ?? 1) > 1 ? "s" : ""} · Revisa tu correo para el QR.`,
      duration: 6000,
    });
    navigate({ to: "/ticket" });
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
    </div>
  );
}
