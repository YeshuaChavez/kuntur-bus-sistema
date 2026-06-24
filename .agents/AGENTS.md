# KUNTUR - Pautas de Desarrollo y Diseño UI/UX

Este archivo define las reglas de diseño visual, experiencia de usuario y desarrollo React para el proyecto KUNTUR. Todos los agentes de codificación deben adherirse estrictamente a estas directrices al modificar o crear interfaces.

---

## 1. Diseño Frontend y Estética (Anthropic Frontend Design)
*Para evitar diseños genéricos o "AI slop" (degradados morados estándar, fuentes genéricas y tarjetas apiladas sin personalidad).*

### A. Tipografía y Escala Visual
* **Fuentes Prohibidas:** Evitar el uso predeterminado de `Inter`, `Roboto`, `Arial` y `Space Grotesk` a menos que sea una limitación técnica estricta.
* **Tipografía Recomendada:** Usar fuentes con personalidad que evoquen la identidad andina y moderna de Kuntur (por ejemplo, `Plus Jakarta Sans`, `Outfit` o pares tipográficos de Google Fonts con contraste claro).
* **Escala:** Usar clases de tamaño y peso de texto con propósito (por ejemplo, títulos con tracking apretado `tracking-tight` y pesos extra-bold).

### B. Paleta de Colores y Contraste
* Evitar combinaciones tímidas o degradados cliché tipo "morado-azul sobre blanco".
* Utilizar colores tailoreados mediante variables CSS/HSL del proyecto. Asegurar que los contrastes cumplan con la norma WCAG AA (mínimo 4.5:1 para texto normal, 3:1 para texto grande).
* En modo oscuro, usar tonos carbón, azul marino profundo o pizarra para los fondos en lugar de negro puro (`#000`), manteniendo bordes sutiles de separación.

### C. Composición y Layout
* Diseñar layouts que tengan un punto de vista deliberado. El *Hero* principal debe funcionar como una tesis visual clara.
* Usar asimetrías sutiles, divisiones diagonales y elementos flotantes o superpuestos para romper la rigidez de las rejillas de tarjetas genéricas.
* Los elementos de secuencia (como pasos 01, 02, 03) solo se usarán si el contenido representa un proceso estrictamente secuencial y cronológico.

---

## 2. Directrices de Interfaz Web (Vercel Web Interface Guidelines)
*Para garantizar una experiencia accesible, responsiva y semántica.*

### A. Accesibilidad (A11y)
* **HTML Semántico:** Utilizar elementos de estructura adecuados (`<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`) en lugar de divs anidados para todo.
* **Roles y ARIA:** Todo elemento interactivo que no sea un botón semántico debe incluir `role="button"` y un manejador de teclado compatible (por ejemplo, `onKeyDown` con Space/Enter). Añadir `aria-label` cuando el botón solo use iconos.
* **Estados de Foco:** Asegurar que todos los elementos interactivos tengan un estado de foco visible claro (ej. `focus-visible:ring-2 focus-visible:ring-primary`).

### B. Interacción y Formatos
* **Tamaños de Toque:** Todo botón o enlace interactivo en dispositivos móviles debe tener un área táctil mínima de `44x44px` (o `h-11 w-11`).
* **Formatos de Texto:** Utilizar números tabulares (`font-mono` o `tabular-nums`) para precios, distancias, horas e identificadores para evitar saltos visuales al actualizarse.

---

## 3. Buenas Prácticas en React y Rendimiento (Vercel React Best Practices)
*Para mantener un código limpio, rápido y escalable.*

### A. Evitar Cascadas de Peticiones (Waterfalls)
* No realizar peticiones consecutivas en hooks o efectos secuenciales que bloqueen la renderización inicial del componente.
* Pre-cargar o paralelizar datos siempre que sea posible.

### B. Optimización del Tamaño de Bundle
* **Iconos:** Importar únicamente los iconos necesarios de `lucide-react`. No importar librerías enteras de golpe.
* Evitar los "barrel imports" (archivos index masivos que re-exportan todo) si esto genera ciclos o incrementa el tamaño del bundle cargado inicialmente.

### C. Evitar Re-renders Innecesarios
* No definir componentes React dentro del cuerpo de renderizado de otro componente.
* Memorizar componentes costosos o funciones manejadoras utilizando `useMemo` o `useCallback` de manera selectiva.

---

## 4. Animaciones y Movimiento (Bencium UX Designer)
*Para que la aplicación se sienta fluida, viva y premium.*

### A. Curvas de Transición (Easing)
* Usar curvas de aceleración elegantes para movimientos realistas:
  * **Entrada/Salida Estándar:** `cubic-bezier(0.4, 0, 0.2, 1)` (movimientos fluidos dentro de la pantalla).
  * **Apertura de Modales o Menús:** `cubic-bezier(0.16, 1, 0.3, 1)` (efecto muelle/amortiguación premium).

### B. Duración
* Mantener las animaciones cortas para que la UI se sienta responsiva:
  * **Efectos Hover e Indicadores:** `150ms`.
  * **Paneles Laterales, Menús y Transiciones de Página:** `300ms`.
