import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import {
  Header,
  Footer,
  Stepper,
  TicketResult,
  getBookingState,
  clearBookingState,
  tripsBase,
} from "./index";

export const Route = createFileRoute("/ticket")({
  head: () => ({
    meta: [
      { title: "Tu Boleto Digital — KUNTUR" },
      { name: "description", content: "Muestra tu boleto digital con código QR para abordar el bus." },
    ],
  }),
  component: TicketPage,
});

function TicketPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");

  // Load from sessionStorage
  const booking = useMemo(() => getBookingState(), []);

  useEffect(() => {
    if (!booking.tripId || !booking.selectedSeats || booking.selectedSeats.length === 0) {
      navigate({ to: "/" });
    }
  }, [booking.tripId, booking.selectedSeats, navigate]);

  const trip = useMemo(() => {
    return tripsBase.find((t) => t.id === booking.tripId) || tripsBase[0];
  }, [booking.tripId]);

  const date = useMemo(() => {
    return booking.date ? new Date(booking.date) : new Date();
  }, [booking.date]);

  // Convert selectedSeats string list to Seat objects for component props
  const selectedSeatsObjects = useMemo(() => {
    return (booking.selectedSeats || []).map((id) => ({
      id,
      row: 0,
      col: 0,
      status: "selected" as const,
    }));
  }, [booking.selectedSeats]);

  const handleNew = () => {
    clearBookingState();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 pb-16 pt-6">
        <Stepper step="ticket" />
        <TicketResult
          selected={selectedSeatsObjects}
          trip={trip}
          origin={booking.origin || "Lima"}
          destination={booking.destination || "Trujillo"}
          date={date}
          passengers={booking.passengers}
          onNew={handleNew}
          user={user}
          guestEmail={booking.guestEmail || ""}
        />
      </main>
      <Footer />
    </div>
  );
}
