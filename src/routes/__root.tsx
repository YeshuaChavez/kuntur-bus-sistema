import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

type KW = { keys: string[]; answer: string };

const KB: KW[] = [
  { keys: ["hola","buenas","saludos","hey","buenos días","buenas tardes","buenas noches"],
    answer: "¡Hola! 👋 Soy el asistente KUNTUR. Puedo ayudarte con pasajes, horarios, precios, destinos, equipaje y más. ¿Qué necesitas?" },
  { keys: ["gracias","ok","listo","perfecto","excelente","genial"],
    answer: "¡Con gusto! Si tienes otra pregunta aquí estaré. ¡Buen viaje! 🦅" },
  { keys: ["pasaje","comprar","compra","adquirir","reservar","reserva","compro"],
    answer: "Para comprar un pasaje: ingresa origen, destino y fecha en el buscador de la página principal → elige tu asiento en el mapa interactivo → paga en línea. Tu boleto digital llega al instante." },
  { keys: ["boleto","ticket","ver boleto","mis viajes","donde esta"],
    answer: "Tu boleto aparece en pantalla al terminar la compra y se envía a tu correo. Con cuenta KUNTUR también lo encuentras en 'Mis viajes' cuando quieras." },
  { keys: ["horario","hora","salida","llegada","cuando sale","a que hora"],
    answer: "Los horarios varían por ruta. Búscalos en el buscador con tu origen, destino y fecha: verás todos los viajes disponibles con hora exacta de salida y llegada estimada." },
  { keys: ["precio","costo","cuanto","cuánto","vale","soles","tarifa","barato"],
    answer: "Precios referenciales: Lima–Ica desde S/ 35 · Lima–Trujillo desde S/ 45 · Lima–Arequipa desde S/ 65 · Lima–Piura desde S/ 70 · Lima–Cusco desde S/ 80. Varían según categoría y disponibilidad." },
  { keys: ["lima"],
    answer: "Lima es nuestro hub principal. Conectamos a Ica (4-5 h), Trujillo (9 h), Arequipa (14 h), Piura (15 h) y Cusco (21-24 h). Consulta el buscador para horarios exactos." },
  { keys: ["arequipa"],
    answer: "Lima → Arequipa: aproximadamente 14 horas. Servicios disponibles: Ejecutivo, Cama y Cama nocturna. Desde S/ 65." },
  { keys: ["cusco","cuzco"],
    answer: "Lima → Cusco: aproximadamente 21-24 horas. Recomendamos el servicio Cama nocturna para mayor comodidad. Desde S/ 80." },
  { keys: ["trujillo"],
    answer: "Lima → Trujillo: aproximadamente 9 horas. Servicios: Ejecutivo y Premium. Desde S/ 45." },
  { keys: ["piura"],
    answer: "Lima → Piura: aproximadamente 14-16 horas. Servicios: Ejecutivo y Cama. Desde S/ 70." },
  { keys: ["ica"],
    answer: "Lima → Ica: aproximadamente 4-5 horas. Es la ruta más corta que operamos. Servicios: Ejecutivo y Premium. Desde S/ 35." },
  { keys: ["cancelar","cancelación","devolucion","devolución","reembolso","anular"],
    answer: "Puedes cancelar hasta 24 horas antes de la salida. El reembolso se aplica según la tarifa. Escríbenos a atencion@kuntur.pe o llama a nuestro centro de atención." },
  { keys: ["asiento","cama","ejecutivo","premium","nocturna","clase","servicio","categoria"],
    answer: "Tenemos 4 categorías: Ejecutivo (asiento reclinable) · Premium (asiento extra ancho) · Cama (reclinación 180°) · Cama nocturna (ideal para viajes de madrugada, totalmente reclinable)." },
  { keys: ["equipaje","maleta","bulto","peso","llevar","bodega"],
    answer: "Cada pasajero: 1 maleta de hasta 25 kg en bodega + 1 bolso de mano de hasta 8 kg. Equipaje adicional tiene costo extra según peso." },
  { keys: ["pago","tarjeta","yape","plin","efectivo","transferencia","visa","mastercard","pagar"],
    answer: "Aceptamos Visa, Mastercard, Yape, Plin y transferencias bancarias. El pago es 100% seguro con cifrado SSL." },
  { keys: ["cuenta","registro","registrar","crear cuenta","usuario","contraseña"],
    answer: "Crear tu cuenta KUNTUR es gratis: solo necesitas tu correo. Con cuenta guardas tu historial de viajes, tus datos de pasajero y accedes a ofertas exclusivas." },
  { keys: ["qr","código qr","codigo qr","escanear","validar","subir","abordar"],
    answer: "Tu boleto incluye un QR único. Al subir al bus, el auxiliar lo escaneará desde su tablet. Puedes mostrarlo en pantalla o imprimirlo." },
  { keys: ["descuento","oferta","promoción","promocion","estudiante","adulto mayor","65"],
    answer: "20% de descuento para estudiantes con carnet universitario vigente y adultos mayores de 65 años con DNI. El descuento se aplica automáticamente al seleccionar la categoría." },
  { keys: ["wifi","enchufe","usb","servicio a bordo","pelicula","comida","snack"],
    answer: "Los buses Premium y Cama incluyen WiFi a bordo, toma de corriente USB por asiento y snack de bienvenida en rutas largas." },
  { keys: ["mascota","perro","gato","animal"],
    answer: "Por el momento KUNTUR no permite el transporte de mascotas en la cabina. Contacta a atención al cliente para consultar opciones en bodega para tu viaje." },
  { keys: ["niño","menor","bebe","bebé","infantil"],
    answer: "Niños menores de 3 años viajan gratis en el regazo del adulto. De 3 a 11 años pagan tarifa reducida del 50%. Mayores de 12 pagan tarifa completa." },
];

function matchAnswer(input: string): string {
  const norm = input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const { keys, answer } of KB) {
    if (keys.some((k) => norm.includes(k.normalize("NFD").replace(/[̀-ͯ]/g, "")))) {
      return answer;
    }
  }
  return "No tengo información exacta sobre eso. Puedes escribirnos a atencion@kuntur.pe o llamar a nuestra línea de atención. ¿Hay algo más en lo que pueda ayudarte?";
}

const BOT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>
  </svg>
);

const CHIP_GROUPS: { label: string; chips: string[] }[] = [
  { label: "Compras", chips: ["¿Cómo compro un pasaje?", "¿Qué métodos de pago aceptan?", "¿Puedo cancelar mi reserva?"] },
  { label: "Viaje",   chips: ["¿Qué incluye el equipaje?", "¿Qué servicios hay a bordo?", "¿Descuentos disponibles?"] },
  { label: "Rutas",   chips: ["Lima → Cusco", "Lima → Arequipa", "Lima → Trujillo", "Lima → Ica"] },
];

function AssistenteIA() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "¡Hola! Soy el asistente KUNTUR. ¿En qué puedo ayudarte hoy? Puedes escribir o elegir un tema:" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const reply = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { from: "user", text: trimmed }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: matchAnswer(trimmed) }]);
    }, 800);
  };

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setInput("");
    reply(t);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-[4.5rem] right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-[340px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_40px_-8px_rgba(0,0,0,0.28)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
                {BOT_ICON}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-none">Asistente KUNTUR</p>
                <p className="mt-0.5 text-[10px] font-semibold text-primary">● En línea</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex h-52 flex-col gap-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.from === "bot"
                    ? "bg-secondary text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-secondary px-3 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          <div className="border-t border-border/60 px-3 pt-2 pb-1">
            <div className="mb-1.5 flex gap-1">
              {CHIP_GROUPS.map((g, i) => (
                <button
                  key={g.label}
                  onClick={() => setActiveGroup(i)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                    activeGroup === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pb-2">
              {CHIP_GROUPS[activeGroup].chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { reply(chip); }}
                  disabled={typing}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border/60 p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escribe tu pregunta…"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={send}
              disabled={!input.trim() || typing}
              aria-label="Enviar mensaje"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow transition-all hover:brightness-110 active:scale-90 disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB — solo círculo con icono */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Asistente inteligente KUNTUR"
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[0_4px_24px_-4px_oklch(0.5_0.07_160_/_0.55)] transition-all hover:scale-110 hover:shadow-[0_6px_28px_-4px_oklch(0.5_0.07_160_/_0.65)] active:scale-95"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>
          </svg>
        )}
      </button>
    </>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] shadow-[0_12px_40px_-8px_oklch(0.55_0.14_150_/_0.4)]">
        <span
          aria-hidden="true"
          className="h-11 w-11 bg-primary-foreground [mask:url('/condor.svg')_center/contain_no-repeat] [-webkit-mask:url('/condor.svg')_center/contain_no-repeat]"
        />
      </div>

      <div className="text-[96px] font-black leading-none tracking-tighter text-primary/15 select-none">
        404
      </div>

      <h1 className="-mt-2 text-2xl font-extrabold tracking-tight text-foreground">
        ¡Esta ruta no existe!
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        El cóndor buscó en cada destino pero no encontró esta página. Puede que haya sido movida o eliminada.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.55_0.14_150_/_0.5)] transition-all hover:brightness-110 active:scale-95"
        >
          Volver al inicio
        </Link>
        <a
          href="/#destinos"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-secondary active:scale-95"
        >
          Ver destinos
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KUNTUR — Sistema integral de gestión de transporte" },
      { name: "description", content: "Plataforma KUNTUR: venta de pasajes, validación, despacho y monitoreo de flota en un solo ecosistema." },
      { name: "author", content: "KUNTUR" },
      { property: "og:title", content: "KUNTUR — Sistema integral de gestión de transporte" },
      { property: "og:description", content: "Plataforma KUNTUR: venta de pasajes, validación, despacho y monitoreo de flota en un solo ecosistema." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "KUNTUR — Sistema integral de gestión de transporte" },
      { name: "twitter:description", content: "Plataforma KUNTUR: venta de pasajes, validación, despacho y monitoreo de flota en un solo ecosistema." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f13055f0-0ab9-47a4-8364-2a22e82bd2c1/id-preview-cb586e02--87bc5a15-c199-407e-b927-8f8f3f4b2fdc.lovable.app-1777513994278.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f13055f0-0ab9-47a4-8364-2a22e82bd2c1/id-preview-cb586e02--87bc5a15-c199-407e-b927-8f8f3f4b2fdc.lovable.app-1777513994278.png" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/condor.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('kuntur_theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-right" />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { pathname } = useLocation();
  const isRoleRoute = ["/auxiliar", "/conductor", "/controlador", "/administrador"].some(
    (role) => pathname.startsWith(role)
  );

  return (
    <>
      <Outlet />
      {!isRoleRoute && <AssistenteIA />}
    </>
  );
}
