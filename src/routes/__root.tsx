import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

const QUICK_REPLIES = [
  { q: "¿Cómo compro un pasaje?", a: "Usa el buscador en la página principal: elige origen, destino y fecha, selecciona tu asiento y paga en línea. ¡Listo en minutos!" },
  { q: "¿Dónde veo mi boleto?", a: "Tu boleto digital aparece tras el pago y llega a tu correo. Si tienes cuenta, también está en 'Mis viajes'." },
  { q: "¿Cuánto dura Lima → Cusco?", a: "Aproximadamente 21–24 horas. Te recomendamos el servicio Cama nocturna para mayor comodidad en ruta." },
  { q: "¿Puedo cancelar mi pasaje?", a: "Sí, hasta 24 horas antes de la salida. Escríbenos por correo o llama a nuestro centro de atención KUNTUR." },
];

function AssistenteIA() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "¡Hola! Soy el asistente KUNTUR 🦅 ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const reply = (text: string) => {
    const found = QUICK_REPLIES.find((r) => r.q === text);
    const answer = found?.a ?? "Gracias por tu consulta. En breve un agente te atenderá. También puedes llamar al número de atención KUNTUR.";
    setMessages((m) => [...m, { from: "user", text }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: answer }]);
    }, 900);
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
        <div className="fixed bottom-24 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] max-w-[340px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_40px_-8px_rgba(0,0,0,0.25)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary/8 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
                  <path d="M7 14h.01M12 14h.01M17 14h.01"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-none">Asistente KUNTUR</p>
                <p className="text-[10px] text-primary mt-0.5">● En línea</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex h-56 flex-col gap-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
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
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-secondary px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && !typing && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
              {QUICK_REPLIES.map((r) => (
                <button
                  key={r.q}
                  onClick={() => reply(r.q)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  {r.q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escribe tu consulta…"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow transition-all hover:brightness-110 active:scale-90 disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir asistente inteligente"
        className="fixed bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-[0_4px_20px_-4px_rgba(0,0,0,0.18)] transition-all hover:scale-105 hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.22)] active:scale-95"
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-primary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
            <path d="M7 14h.01M12 14h.01M17 14h.01"/>
          </svg>
        </div>
        <span className="hidden sm:inline">Asistente inteligente</span>
        <span className="sm:hidden">Asistente</span>
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
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..850;1,300..850&display=swap" },
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
  return (
    <>
      <Outlet />
      <AssistenteIA />
    </>
  );
}
