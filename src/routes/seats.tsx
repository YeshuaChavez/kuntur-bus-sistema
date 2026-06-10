import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import {
  Header,
  Footer,
  Stepper,
  SeatStep,
  AuthBlockModal,
  getBookingState,
  setBookingState,
  tripsBase,
  makeSeats,
} from "./index";

export const Route = createFileRoute("/seats")({
  head: () => ({
    meta: [
      { title: "Elige tus asientos — KUNTUR" },
      { name: "description", content: "Selecciona tus asientos preferidos en tiempo real." },
    ],
  }),
  component: SeatsPage,
});

function SeatsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");
  const [authBlock, setAuthBlock] = useState(false);

  // Load from sessionStorage
  const booking = useMemo(() => getBookingState(), []);
  
  // Local state for selected seat IDs
  const [selectedSeats, setSelectedSeats] = useState<string[]>(() => booking.selectedSeats || []);

  useEffect(() => {
    // If no trip selected, go back to home or trips
    if (!booking.tripId) {
      navigate({ to: "/" });
    }
  }, [booking.tripId, navigate]);

  const trip = useMemo(() => {
    return tripsBase.find((t) => t.id === booking.tripId) || tripsBase[0];
  }, [booking.tripId]);

  const initialSeats = useMemo(() => makeSeats(), []);

  // Update seat status based on local selection
  const seats = useMemo(() => {
    return initialSeats.map((seat) => {
      if (selectedSeats.includes(seat.id)) {
        return { ...seat, status: "selected" as const };
      }
      return seat;
    });
  }, [initialSeats, selectedSeats]);

  const selectedSeatsObjects = useMemo(() => {
    return seats.filter((s) => s.status === "selected");
  }, [seats]);

  const total = selectedSeats.length * trip.price;

  const toggleSeat = (id: string) => {
    const target = seats.find((s) => s.id === id);
    if (!target || target.status === "occupied") return;

    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter((sid) => sid !== id));
    } else {
      if (selectedSeats.length >= booking.pax) return;
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const handlePay = () => {
    if (!selectedSeats.length) return;
    if (user && user.role !== "cliente") {
      setAuthBlock(true);
      return;
    }
    
    // Initialize or update passenger list to match selected seats length
    let currentPassengers = booking.passengers || [];
    if (currentPassengers.length !== selectedSeats.length) {
      currentPassengers = selectedSeats.map((_, i) => currentPassengers[i] || { dni: "", name: "" });
    }

    setBookingState({
      selectedSeats,
      passengers: currentPassengers,
    });
    navigate({ to: "/passengers" });
  };

  const handleBack = () => {
    navigate({
      to: "/trips",
      search: {
        origin: booking.origin,
        destination: booking.destination,
        date: booking.date,
        pax: booking.pax,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 pb-16 pt-14">
        <Stepper step="seats" />
        <SeatStep
          trip={trip}
          seats={seats}
          selected={selectedSeatsObjects}
          total={total}
          toggleSeat={toggleSeat}
          onBack={handleBack}
          onPay={handlePay}
          user={user}
          pax={booking.pax}
        />
      </main>
      {authBlock && (
        <AuthBlockModal
          onClose={() => setAuthBlock(false)}
          onLogin={() => navigate({ to: "/login", search: { redirect: "/seats" } })}
          user={user}
        />
      )}
      <Footer />
    </div>
  );
}
