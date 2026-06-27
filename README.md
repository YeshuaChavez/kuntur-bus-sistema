# 🦅 KUNTUR — Sistema Inteligente de Gestión de Transporte y Movilidad

KUNTUR es una plataforma web moderna, interactiva y robusta diseñada para digitalizar y optimizar la experiencia de transporte terrestre interprovincial en el Perú. Inspirada en la imponencia y la conectividad del cóndor andino, KUNTUR unifica en un solo ecosistema digital la venta de pasajes para clientes y las herramientas operativas clave para el personal de tierra, tripulación de cabina, despachadores y administradores de flota.

---

## 🚀 Características Principales por Rol

El sistema cuenta con interfaces adaptadas y personalizadas para cinco roles clave del ecosistema de transporte:

### 1. 🎫 Módulo del Cliente (Experiencia del Pasajero)
* **Buscador Inteligente:** Filtros por origen, destino, fecha y categorías de servicio (Premium, Ejecutivo, Cama y Cama Nocturna).
* **Mapa de Asientos Interactivo:** Visualización en tiempo real de la distribución del bus (primer y segundo piso) con estados diferenciados (Libre, Vendido, Seleccionado).
* **Pasarela de Pago Simulada:** Formulario de pago seguro con DNI, validación de campos, selección de pasarela y simulación de compra instantánea.
* **Boleto Digital QR:** Generación de boleto electrónico con código QR encriptado y envío automático simulado al correo del cliente.
* **Sección "Mis Viajes":** Historial de compras pasadas y próximas salidas con conteo regresivo y descarga de boletos.

### 2. 📱 Módulo de Auxiliar de Abordaje (Tierra)
* **Escáner QR Interactivo:** Simulación de lector de boletos integrado en interfaz móvil.
  * **Beep de Éxito:** Pitido doble agudo sintetizado en tiempo real ante boletos válidos.
  * **Zumbido de Advertencia:** Sonido grave y retroceso visual ante boletos inválidos.
  * **Feedback Háptico Visual:** Vibración en pantalla (shake) si el boleto no corresponde al viaje o al asiento.
* **Monitoreo de Abordaje:** Vista del mapa de asientos con actualización en tiempo real de pasajeros validados (*check-in*).
* **Control de Paradas y Equipaje:** Panel de bajadas por escala para registrar pasajeros de forma ordenada antes de cerrar y avanzar.

### 3. 🚛 Módulo de Conductor de Ruta (A Bordo)
* **Bitácora Automatizada:** Registro cronológico de inicio de viaje, paradas técnicas e incidencias menores con marcas de tiempo en formato de números tabulares.
* **Sensores y Telemetría en Tiempo Real:** Monitorización en vivo de temperatura del motor, presión de aceite, nivel de AdBlue y voltaje de batería con alertas de atención y advertencia críticas.
* **Mapa de Navegación Dinámico:** Seguimiento GPS con un marcador de bus en movimiento a lo largo del trazado de paradas (calculado mediante algoritmo óptimo de Dijkstra).
* **Botón de Emergencia S.O.S:** Disparador de alerta de prioridad crítica (accidentes, fallas mayores) que activa una **sirena sonora oscilante** en bucle y notifica de inmediato a la PNP y Central de control.

### 4. 🎛️ Módulo de Controlador de Flota (Central de Despacho)
* **Mapa Satelital General:** Localización en vivo de todas las unidades activas en carretera con estados según telemetría.
* **Gestión de Terminales y Andenes:** Monitoreo de andenes ocupados, salidas programadas e incidencias en agencias a nivel nacional.
* **Taller y Mantenimiento:** Reporte técnico de unidades retiradas de servicio para mantenimiento preventivo u optimización de flota.

### 5. 👑 Módulo del Administrador (Gestión del Negocio)
* **Dashboard Global de Métricas:** Resumen de ingresos diarios, pasajes vendidos, porcentaje de ocupación y alertas de mantenimiento.
* **Despacho y Planificación:** Creación y modificación de rutas interprovinciales con andenes de embarque asignados.
* **Base de Datos de Flota e Historial:** Registro detallado de buses activos, marcas, capacidades y base de datos operativa.

---

## 🛠️ Stack Tecnológico

El proyecto está construido con herramientas frontend modernas y optimizadas para rendimiento y SEO:

* **Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Empaquetador y Build Server**: [Vite](https://vite.dev/)
* **Enrutamiento y SSR**: [TanStack Start / TanStack Router](https://tanstack.com/router)
* **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
* **Iconografía**: [Lucide React](https://lucide.dev/)
* **Librerías de UI**: Componentes accesibles construidos bajo estándares Nielsen y WCAG AA (soportando modo oscuro adaptativo nativo).
* **Audio y Haptic Feedback**: [Web Audio API](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API) nativa (síntesis de ondas cuadradas y senoidales en tiempo real para beeps y sirenas).

---

## 🎨 Sistema de Diseño (Estética KUNTUR)

El diseño visual del sistema rompe con plantillas genéricas de inteligencia artificial (*AI slop*) para enfocarse en una identidad andina, premium y limpia:
* **Paleta de Colores:** Basada en tonos tierra y naturaleza. Predominan el verde salvia y esmeralda (`oklch(0.5 0.07 160)`), grises pizarra profunda para fondos oscuros (`oklch(0.129 0.042 264.695)`) y tonos crema suaves para fondos claros.
* **Tipografía:** *Plus Jakarta Sans* y Outfit de Google Fonts, logrando un par tipográfico corporativo y sofisticado con pesos extra-bold y espaciado de tracking apretado.
* **Movimiento y Animaciones:** Transiciones y curvas de suavizado de alto nivel (como muelle de amortiguación `cubic-bezier(0.16, 1, 0.3, 1)` para paneles laterales e indicadores hover sutiles de `150ms`).
* **Accesibilidad (A11y):** Contraste garantizado mayor a 4.5:1 (WCAG AA), elementos interactivos con foco visible claro (`focus-visible:ring-2`) y soporte completo de teclado (`role="button"` con Space/Enter).

---

## 💻 Instrucciones para Desarrolladores

Sigue los siguientes pasos para levantar el entorno de desarrollo localmente:

### Prerrequisitos
Tener instalado Node.js (versión 18 o superior).

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar servidor de desarrollo
Levanta el servidor local con recarga rápida (HMR):
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

### 3. Compilar para producción
Genera el paquete optimizado y minificado tanto para el cliente como para el servidor (SSR / Edge handlers):
```bash
npm run build
```
Los archivos de distribución se generarán en la carpeta `dist/`.

---

## 📁 Estructura del Proyecto (Key Directories)

```text
├── .agents/               # Reglas de diseño del frontend y buenas prácticas React
├── public/                # Ilustraciones de IA y assets estáticos públicos
├── src/
│   ├── components/        # Componentes reutilizables (Logo, SeatMap, UI Atoms)
│   ├── lib/               # Utilidades de autenticación, compras y sintetizador de Audio
│   │   ├── auth.ts
│   │   └── utils.ts       # playSuccessBeep, playErrorBuzz, playSirenTone
│   ├── routes/            # Sistema de Enrutamiento TanStack Router
│   │   ├── __root.tsx     # Layout raíz, chat interactivo de IA
│   │   ├── index.tsx      # Landing page, buscador y Stepper de compra
│   │   ├── login.tsx      # Portal de acceso centralizado
│   │   ├── auxiliar.tsx   # Panel del auxiliar terrestre (Escáner QR)
│   │   ├── conductor.tsx  # Panel del chofer (Telemetría + SOS)
│   │   ├── controlador.tsx# Panel de despacho general
│   │   └── administrador.tsx# Panel de administración de negocio
│   ├── router.tsx         # Configuración del router
│   ├── styles.css         # Archivo global de Tailwind y animaciones personalizadas
│   └── main.tsx           # Punto de entrada de la aplicación
└── package.json           # Dependencias y scripts de ejecución
```
