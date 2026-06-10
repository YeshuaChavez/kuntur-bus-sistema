import { Compass, Eye, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type SeatStatus = "free" | "selected" | "occupied" | "sold" | "boarded";

export interface Seat {
  id: string;
  row: number;
  col: number;
  floor: number;
  status: SeatStatus;
  passenger?: string;
}

const statusStyles: Record<SeatStatus, string> = {
  free:     "border-2 border-primary/50 bg-background text-primary hover:bg-primary/10 cursor-pointer",
  selected: "border-2 border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)] scale-105 cursor-pointer",
  occupied: "border border-border bg-muted text-muted-foreground cursor-not-allowed opacity-60",
  sold:     "border-2 border-[var(--warning)] bg-[var(--warning)]/15 text-[var(--warning-foreground)]",
  boarded:  "border-2 border-primary bg-primary text-primary-foreground",
};

interface SeatMapProps {
  seats: Seat[];
  onSelect?: (id: string) => void;
  variant?: "client" | "operator";
}

export function SeatMap({ seats, onSelect, variant = "client" }: SeatMapProps) {
  const floors = [...new Set(seats.map((s) => s.floor))].sort();
  const multiFloor = floors.length > 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className={cn(multiFloor && "grid grid-cols-1 gap-8 sm:grid-cols-2")}>
        {floors.map((f) => {
          const floorSeats = seats.filter((s) => s.floor === f);
          const rows = Math.max(...floorSeats.map((s) => s.row));
          return (
            <div key={f}>
              {/* Floor badge */}
              {multiFloor && (
                <div className="mb-3 flex items-center justify-center gap-1.5">
                  {f === 1
                    ? <Layers className="h-3.5 w-3.5 text-primary" />
                    : <Eye    className="h-3.5 w-3.5 text-primary" />}
                  <span className="text-xs font-black uppercase tracking-wider text-primary">Piso {f}</span>
                </div>
              )}

              {/* Bus front header */}
              <div className="mx-auto mb-4 flex w-full max-w-[260px] items-center justify-between rounded-t-3xl border border-border bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground">
                {f === 1
                  ? <><span className="flex items-center gap-1"><Compass className="h-3 w-3" /> Conductor</span><span>Frente</span></>
                  : <><span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Piso Superior</span><span>Vista Panorámica</span></>}
              </div>

              {/* Seat grid */}
              <div className="flex flex-col items-center gap-2">
                {Array.from({ length: rows }).map((_, r) => {
                  const rowSeats = floorSeats
                    .filter((s) => s.row === r + 1)
                    .sort((a, b) => a.col - b.col);
                  return (
                    <div key={r} className="flex items-center gap-2">
                      {rowSeats.slice(0, 2).map((s) => (
                        <SeatBtn key={s.id} seat={s} onSelect={onSelect} variant={variant} />
                      ))}
                      <div className="w-6 text-center text-[10px] text-muted-foreground">{r + 1}</div>
                      {rowSeats.slice(2).map((s) => (
                        <SeatBtn key={s.id} seat={s} onSelect={onSelect} variant={variant} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <Legend variant={variant} />
    </div>
  );
}

function SeatBtn({
  seat,
  onSelect,
  variant,
}: {
  seat: Seat;
  onSelect?: (id: string) => void;
  variant: "client" | "operator";
}) {
  const disabled = seat.status === "occupied" || (variant === "operator" && !onSelect);
  return (
    <button
      type="button"
      disabled={disabled && !onSelect}
      onClick={() => onSelect?.(seat.id)}
      className={cn(
        "h-10 w-10 rounded-lg text-xs font-semibold transition-all duration-150",
        statusStyles[seat.status],
      )}
      title={seat.passenger}
    >
      {seat.id}
    </button>
  );
}

function Legend({ variant }: { variant: "client" | "operator" }) {
  const items =
    variant === "client"
      ? [
          { c: "border-2 border-primary/50 bg-background", l: "Libre" },
          { c: "bg-primary", l: "Seleccionado" },
          { c: "bg-muted border border-border opacity-60", l: "Ocupado" },
        ]
      : [
          { c: "bg-primary", l: "Abordado" },
          { c: "bg-[var(--warning)]/30 border-2 border-[var(--warning)]", l: "Vendido" },
          { c: "bg-background border-2 border-primary/50", l: "Libre" },
        ];
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-4">
      {items.map((i) => (
        <div key={i.l} className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={cn("h-4 w-4 rounded", i.c)} />
          <span>{i.l}</span>
        </div>
      ))}
    </div>
  );
}
