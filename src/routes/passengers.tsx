import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import {
  Header,
  Footer,
  Stepper,
  PassengersStep,
  getBookingState,
  setBookingState,
  tripsBase,
} from "./index";

export const Route = createFileRoute("/passengers")({
  head: () => ({
    meta: [
      { title: "Datos de pasajeros — KUNTUR" },
      { name: "description", content: "Ingresa los datos de los pasajeros para tu boleto de viaje." },
    ],
  }),
  component: PassengersPage,
});

function PassengersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");

  // Load from sessionStorage
  const booking = useMemo(() => getBookingState(), []);
  
  const [passengers, setPassengers] = useState<{ dni: string; name: string }[]>(() => booking.passengers || []);
  const [guestEmail, setGuestEmail] = useState(() => booking.guestEmail || "");

  useEffect(() => {
    if (!booking.tripId || !booking.selectedSeats || booking.selectedSeats.length === 0) {
      navigate({ to: "/" });
    }
  }, [booking.tripId, booking.selectedSeats, navigate]);

  const trip = useMemo(() => {
    return tripsBase.find((t) => t.id === booking.tripId) || tripsBase[0];
  }, [booking.tripId]);

  const total = (booking.selectedSeats?.length || 0) * trip.price;

  // Convert selectedSeats string list to Seat objects for component props
  const selectedSeatsObjects = useMemo(() => {
    return (booking.selectedSeats || []).map((id) => ({
      id,
      row: 0,
      col: 0,
      status: "selected" as const,
    }));
  }, [booking.selectedSeats]);

  const handleNext = () => {
    setBookingState({
      passengers,
      guestEmail,
    });
    navigate({ to: "/payment" });
  };

  const handleBack = () => {
    navigate({ to: "/seats" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 pb-16 pt-6">
        <Stepper step="passengers" />
        <PassengersStep
          selected={selectedSeatsObjects}
          passengers={passengers}
          setPassengers={setPassengers}
          total={total}
          onBack={handleBack}
          onNext={handleNext}
          user={user}
          guestEmail={guestEmail}
          setGuestEmail={setGuestEmail}
        />
      </main>
      <Footer />
    </div>
  );
}
