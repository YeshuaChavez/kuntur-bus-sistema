import { createFileRoute } from "@tanstack/react-router";
import { RoleShell } from "@/components/jaysi/RoleShell";
import { Bus, MapPin, Search, AlertCircle, Phone, BadgeCheck, Headset, History, CheckCircle2, Clock, CalendarClock } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/controlador")({
  head: () => ({
    meta: [
      { title: "Controlador · KUNTUR" },
      { name: "description", content: "Monitoreo en tiempo real de la flota y los despachos del día." },
    ],
  }),
  component: ControladorView,
});

const fleet = [
  { id: "JY-104", route: "Lima → Trujillo", driver: "C. Mendoza", driverPhone: "+51 998 100 104", aux: "L. Ramírez", auxPhone: "+51 998 200 104", eta: "11:45", scheduled: "11:45", status: "ontime" },
  { id: "JY-211", route: "Lima → Arequipa", driver: "R. Quispe",   driverPhone: "+51 998 100 211", aux: "S. Paredes", auxPhone: "+51 998 200 211", eta: "18:20", scheduled: "18:00", status: "delay" },
  { id: "JY-087", route: "Cusco → Puno",    driver: "J. Flores",   driverPhone: "+51 998 100 087", aux: "K. Huamán",  auxPhone: "+51 998 200 087", eta: "14:10", scheduled: "14:00", status: "ontime" },
  { id: "JY-156", route: "Trujillo → Lima", driver: "M. Vega",     driverPhone: "+51 998 100 156", aux: "D. Castro",  auxPhone: "+51 998 200 156", eta: "20:30", scheduled: "20:00", status: "delay" },
  { id: "JY-302", route: "Lima → Ica",      driver: "P. Soto",     driverPhone: "+51 998 100 302", aux: "E. Tello",   auxPhone: "+51 998 200 302", eta: "09:45", scheduled: "09:45", status: "ontime" },
];

const completedTrips = [
  { id: "JY-099", route: "Lima → Chiclayo",  driver: "C. Mendoza", departed: "Hoy · 04:30", arrived: "Hoy · 14:05", pax: 42, status: "ontime" },
  { id: "JY-188", route: "Arequipa → Lima",  driver: "R. Quispe",  departed: "Hoy · 02:15", arrived: "Hoy · 18:40", pax: 38, status: "delay" },
  { id: "JY-077", route: "Cusco → Lima",     driver: "J. Flores",  departed: "Ayer · 22:00", arrived: "Hoy · 12:30", pax: 44, status: "ontime" },
  { id: "JY-145", route: "Piura → Trujillo", driver: "M. Vega",    departed: "Ayer · 20:15", arrived: "Hoy · 03:50", pax: 36, status: "ontime" },
  { id: "JY-221", route: "Tacna → Arequipa", driver: "P. Soto",    departed: "Ayer · 18:00", arrived: "Ayer · 23:45", pax: 40, status: "delay" },
];

const upcomingTrips = [
  { id: "JY-410", route: "Lima → Huancayo",  driver: "C. Mendoza", departs: "Hoy · 21:00", in: "en 35 min",  pax: 28, gate: "A3" },
  { id: "JY-415", route: "Lima → Trujillo",  driver: "R. Quispe",  departs: "Hoy · 22:30", in: "en 2h 05m", pax: 41, gate: "B1" },
  { id: "JY-418", route: "Lima → Arequipa",  driver: "J. Flores",  departs: "Mañana · 05:15", in: "en 8h",  pax: 33, gate: "C2" },
  { id: "JY-422", route: "Cusco → Puno",     driver: "M. Vega",    departs: "Mañana · 07:00", in: "en 9h 45m", pax: 25, gate: "A1" },
];

function ControladorView() {
  const { user } = useAuth();
  const ctrlName = user?.role === "controlador" ? user.name : "Ana Torres";
  return (
    <RoleShell
      role="Controlador"
      rightSlot={
        <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground sm:inline-flex">
          <Headset className="h-3.5 w-3.5 text-primary" /> {ctrlName}
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Map */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Mapa de flota</h1>
                <p className="text-xs text-muted-foreground">Actualizado hace 4 segundos · 24 buses activos</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Legend color="bg-primary" l="A tiempo" />
                <Legend color="bg-[var(--warning)]" l="Retraso" />
                <Legend color="bg-destructive" l="Alerta" />
              </div>
            </div>
          </div>
          <div className="relative h-[560px] bg-[radial-gradient(ellipse_at_center,_var(--secondary)_0%,_var(--background)_75%)]">
            {/* Stylized roads */}
            <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 800 560" fill="none">
              <path d="M0 280 Q200 150 400 280 T800 280" stroke="oklch(0.55 0.13 150)" strokeWidth="1.5" strokeDasharray="6 6" />
              <path d="M120 0 Q200 280 320 560" stroke="oklch(0.55 0.13 150)" strokeWidth="1.5" strokeDasharray="6 6" />
              <path d="M580 0 Q500 280 680 560" stroke="oklch(0.55 0.13 150)" strokeWidth="1.5" strokeDasharray="6 6" />
              <path d="M0 80 L800 120" stroke="oklch(0.55 0.13 150)" strokeWidth="1" strokeDasharray="4 8" />
              <path d="M0 460 L800 420" stroke="oklch(0.55 0.13 150)" strokeWidth="1" strokeDasharray="4 8" />
            </svg>
            {/* City labels */}
            <Label x="12%" y="22%" name="Lima" />
            <Label x="68%" y="18%" name="Trujillo" />
            <Label x="32%" y="78%" name="Ica" />
            <Label x="78%" y="68%" name="Arequipa" />
            <Label x="50%" y="50%" name="Huánuco" />

            {/* Bus pins */}
            <Pin x="22%" y="32%" status="ontime" id="JY-104" />
            <Pin x="58%" y="40%" status="delay" id="JY-211" />
            <Pin x="40%" y="60%" status="ontime" id="JY-087" />
            <Pin x="65%" y="55%" status="delay" id="JY-156" />
            <Pin x="30%" y="70%" status="ontime" id="JY-302" />
            <Pin x="48%" y="28%" status="ontime" id="JY-440" />
          </div>
        </div>

        {/* Sidebar dispatches */}
        <aside className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Despachos del día</h2>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              5 activos
            </span>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar bus o ruta..."
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mt-4 space-y-2">
            {fleet.map((b) => (
              <div key={b.id} className="rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${b.status === "ontime" ? "bg-primary" : "bg-[var(--warning)]"}`} />
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                        <Bus className="h-3.5 w-3.5 text-muted-foreground" /> {b.id}
                      </div>
                      <div className="text-xs text-muted-foreground">{b.route}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${b.status === "delay" ? "text-[var(--warning-foreground)]" : "text-foreground"}`}>
                      {b.eta}
                    </div>
                    <div className="text-[10px] text-muted-foreground">prog. {b.scheduled}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                  <ContactRow role="Conductor" name={b.driver} phone={b.driverPhone} />
                  <ContactRow role="Auxiliar" name={b.aux} phone={b.auxPhone} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-[var(--warning)]/15 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-[var(--warning-foreground)]" />
              <div className="text-xs text-[var(--warning-foreground)]">
                <strong className="font-semibold">JY-211</strong> reporta tráfico denso en Panamericana Sur.
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Historial y próximos viajes */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <History className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Historial de viajes</h2>
                <p className="text-xs text-muted-foreground">Viajes recientes finalizados</p>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {completedTrips.length} terminados
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {completedTrips.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${t.status === "ontime" ? "text-primary" : "text-[var(--warning-foreground)]"}`} />
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                        <Bus className="h-3.5 w-3.5 text-muted-foreground" /> {t.id}
                      </div>
                      <div className="text-xs text-muted-foreground">{t.route} · {t.driver}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-foreground">{t.pax} pax</div>
                    <div className={`text-[10px] font-medium ${t.status === "delay" ? "text-[var(--warning-foreground)]" : "text-primary"}`}>
                      {t.status === "ontime" ? "A tiempo" : "Con retraso"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <span>Salió: <strong className="text-foreground">{t.departed}</strong></span>
                  <span>Llegó: <strong className="text-foreground">{t.arrived}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Próximos a comenzar</h2>
                <p className="text-xs text-muted-foreground">Salidas programadas</p>
              </div>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {upcomingTrips.length} en cola
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {upcomingTrips.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                        <Bus className="h-3.5 w-3.5 text-muted-foreground" /> {t.id}
                        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase text-secondary-foreground">Puerta {t.gate}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{t.route} · {t.driver}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">{t.departs.split(" · ")[1]}</div>
                    <div className="text-[10px] font-medium text-primary">{t.in}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <span>{t.departs}</span>
                  <span><strong className="text-foreground">{t.pax}</strong> pasajeros</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </RoleShell>
  );
}

function Legend({ color, l }: { color: string; l: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <div className={`h-2.5 w-2.5 rounded-full ${color}`} /> {l}
    </div>
  );
}

function ContactRow({ role, name, phone }: { role: string; name: string; phone: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-2 py-1.5">
      <div className="min-w-0">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{role}</div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
          <BadgeCheck className="h-3 w-3 text-primary" />
          <span className="truncate">{name}</span>
        </div>
      </div>
      <a
        href={`tel:${phone.replace(/\s/g, "")}`}
        title={phone}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-90"
      >
        <Phone className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function Label({ x, y, name }: { x: string; y: string; name: string }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ left: x, top: y }}>
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3" /> {name}
      </div>
    </div>
  );
}

function Pin({ x, y, status, id }: { x: string; y: string; status: "ontime" | "delay"; id: string }) {
  const color = status === "ontime" ? "bg-primary" : "bg-[var(--warning)]";
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
      <div className={`relative flex h-9 w-9 items-center justify-center rounded-full ${color} text-primary-foreground shadow-[var(--shadow-elegant)]`}>
        <Bus className="h-4 w-4" />
        <span className={`absolute -inset-1 animate-ping rounded-full ${color} opacity-30`} />
      </div>
      <div className="mt-1 whitespace-nowrap rounded-md bg-card px-1.5 py-0.5 text-[9px] font-bold text-foreground shadow">
        {id}
      </div>
    </div>
  );
}
