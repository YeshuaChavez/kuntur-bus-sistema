import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

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
  return <Outlet />;
}
