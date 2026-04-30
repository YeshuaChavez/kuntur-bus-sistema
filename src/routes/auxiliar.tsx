import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RoleShell } from "@/components/jaysi/RoleShell";
import { SeatMap, type Seat } from "@/components/jaysi/SeatMap";
import { ScanLine, Grid3x3, Wifi, WifiOff, CheckCircle2, Users, Phone, BadgeCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auxiliar")({
  head: () => ({
    meta: [
      { title: "Auxiliar · JAYSI" },
      { name: "description", content: "Validación de tickets QR y mapa operativo de abordaje." },
    ],
  }),
  component: AuxiliarView,
});

function buildSeats(): Seat[] {
  const boarded = new Set(["1A", "1B", "2A", "3C", "4B", "5D"]);
  const sold = new Set(["2B", "4A", "6C", "7B", "8D", "9A", "10C"]);
  const list: Seat[] = [];
  for (let r = 1; r <= 10; r++) {
    (["A", "B", "C", "D"] as const).forEach((c, i) => {
      const id = `${r}${c}`;
      const status: Seat["status"] = boarded.has(id) ? "boarded" : sold.has(id) ? "sold" : "free";
      list.push({ id, row: r, col: i + 1, status, passenger: sold.has(id) || boarded.has(id) ? "Pasajero #" + id : undefined });
    });
  }
  return list;
}

function AuxiliarView() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"scan" | "map">("scan");
  const [online, setOnline] = useState(true);
  const seats = buildSeats();
  const boarded = seats.filter((s) => s.status === "boarded").length;
  const sold = seats.filter((s) => s.status === "sold").length;
  const auxName = user?.role === "auxiliar" ? user.name : "Luis Ramírez";
  const emergency = "+51 998 123 456";

  return (
    <RoleShell
      role="Auxiliar"
      rightSlot={
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground sm:inline-flex">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {auxName}
          </span>
          <button
            onClick={() => setOnline(!online)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              online
                ? "bg-secondary text-[var(--success)]"
                : "bg-[var(--warning)]/20 text-[var(--warning-foreground)]"
            }`}
          >
            {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {online ? "Online" : "Offline · sync"}
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-md">
        {/* Identity + emergency */}
        <div className="mb-4 grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-border bg-[image:var(--gradient-primary)] p-4 text-primary-foreground shadow-[var(--shadow-soft)]">
          <div>
            <div className="text-[10px] uppercase tracking-wider opacity-80">Auxiliar de turno</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-lg font-bold">
              <BadgeCheck className="h-4 w-4" /> {auxName}
            </div>
          </div>
          <a
            href={`tel:${emergency.replace(/\s/g, "")}`}
            className="flex flex-col items-end justify-center rounded-xl bg-destructive px-3 py-2 text-right shadow-[0_4px_12px_-4px_oklch(0.62_0.15_28_/_0.6)] active:scale-95"
          >
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground">
              <Phone className="h-3 w-3" /> Emergencia
            </span>
            <span className="text-sm font-bold text-destructive-foreground">{emergency}</span>
          </a>
        </div>

        {/* Trip context */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Bus JY-104 · 06:30</div>
              <div className="mt-0.5 text-base font-bold text-foreground">Lima → Trujillo</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Abordaje</div>
              <div className="text-base font-bold text-primary">{boarded}/{boarded + sold}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 grid grid-cols-2 rounded-xl border border-border bg-muted p-1">
          <button
            onClick={() => setTab("scan")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              tab === "scan" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <ScanLine className="h-4 w-4" /> Escáner
          </button>
          <button
            onClick={() => setTab("map")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              tab === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Grid3x3 className="h-4 w-4" /> Mapa
          </button>
        </div>

        {tab === "scan" ? <Scanner /> : <div className="mt-4"><SeatMap seats={seats} variant="operator" /></div>}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat icon={CheckCircle2} label="Validados" value={boarded.toString()} />
          <Stat icon={Users} label="Pendientes" value={sold.toString()} />
        </div>
      </div>
    </RoleShell>
  );
}

function Scanner() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-foreground/95 p-4 shadow-[var(--shadow-card)]">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-foreground">
        {/* Camera-like gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.6)_70%)]" />

        {/* Focus frame */}
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2">
          {[
            "top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-xl",
            "top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-xl",
            "bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-xl",
            "bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-xl",
          ].map((c) => (
            <div key={c} className={`absolute h-10 w-10 border-[var(--primary-glow)] ${c}`} />
          ))}
          {/* Scan line */}
          <div className="absolute inset-x-2 top-1/2 h-0.5 animate-pulse rounded-full bg-[var(--primary-glow)] shadow-[0_0_12px_var(--primary-glow)]" />
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-4 py-1.5 text-xs font-medium text-background backdrop-blur">
          Apunta al código QR del pasajero
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary p-3 text-sm">
        <div className="flex items-center gap-2 text-secondary-foreground">
          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          <span className="font-semibold">Último: Asiento 3C · María L.</span>
        </div>
        <span className="text-xs text-muted-foreground">hace 12s</span>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-0.5 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}