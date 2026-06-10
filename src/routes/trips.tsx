import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Header,
  Footer,
  Stepper,
  TripsList,
  setBookingState,
} from "./index";

export const Route = createFileRoute("/trips")({
  validateSearch: (search: Record<string, unknown>) => ({
    origin: typeof search.origin === "string" ? search.origin : "Lima",
    destination: typeof search.destination === "string" ? search.destination : "Trujillo",
    date: typeof search.date === "string" ? search.date : new Date().toISOString(),
    pax: typeof search.pax === "number" ? search.pax : typeof search.pax === "string" ? parseInt(search.pax, 10) || 1 : 1,
  }),
  head: () => ({
    meta: [
      { title: "Elige tu viaje — KUNTUR" },
      { name: "description", content: "Selecciona el horario y la categoría de bus para tu viaje." },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [activeSection, setActiveSection] = useState("");

  const origin = search.origin;
  const destination = search.destination;
  const date = new Date(search.date);
  const pax = search.pax;

  // Sync search params with sessionStorage on mount / change
  useEffect(() => {
    setBookingState({
      origin,
      destination,
      date: search.date,
      pax,
    });
  }, [origin, destination, search.date, pax]);

  const handlePick = (tripId: string) => {
    setBookingState({ tripId, selectedSeats: [] }); // reset seats if a new trip is picked
    navigate({ to: "/seats" });
  };

  const handleBack = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16 pb-16 pt-6">
        <Stepper step="trips" />
        <TripsList
          origin={origin}
          destination={destination}
          date={date}
          onPick={handlePick}
          onBack={handleBack}
        />
      </main>
      <Footer />
    </div>
  );
}
