# KUNTUR — Prototipo Interactivo de Alta Fidelidad (IHC) para Gestión de Transporte

KUNTUR es un prototipo interactivo de interfaz de usuario de alta fidelidad enfocado en la Interacción Hombre-Computador (IHC). Diseñado para digitalizar y optimizar de forma simulada la experiencia de transporte terrestre interprovincial en el Perú, este proyecto se enfoca puramente en el diseño frontend, la responsividad y la validación de usabilidad (heurísticas de Nielsen y pautas WCAG AA) sin depender de un backend o base de datos externa.

Todas las interacciones complejas (telemetría en vivo, escaneo de boletos, asistente inteligente y pasarela de pago) están simuladas directamente en el cliente mediante lógica de React y la API de Web Audio.

---

## Módulos y Flujos de Interfaces Simulados

El prototipo cuenta con interfaces personalizadas para cinco roles clave del sistema de transporte, demostrando el flujo de trabajo IHC adaptado a cada usuario:

### 1. Módulo del Cliente (Experiencia del Pasajero)
* **Buscador de Viajes:** Selección interactiva de origen, destino y fecha con listado de viajes filtrable por categorías.
* **Mapa de Asientos:** Distribución de bus de uno y dos pisos con selección de asientos libre/ocupado en tiempo real.
* **Pasarela de Pago:** Formulario con validación de datos del cliente (DNI, nombre, correo) que simula el procesamiento de tarjetas de crédito.
* **Boleto Digital:** Vista del ticket final que genera un código QR simulado al confirmar la transacción de compra.
* **Sección Mis Viajes:** Vista del historial del cliente y conteo regresivo animado para su próximo viaje.

### 2. Módulo de Auxiliar de Abordaje (Tierra)
* **Lector de Códigos QR:** Simulación de cámara y scanner con lógica de validación interna.
  * **Beep de Éxito:** Pitido doble agudo generado mediante la API de Web Audio al detectar un boleto correcto.
  * **Zumbido de Error:** Tono grave de advertencia ante boletos inválidos.
  * **Vibración de Pantalla (Shake):** Animación visual de retroalimentación que simula vibración de hardware cuando el acceso es denegado.
* **Mapa Operativo:** Visualización de asientos en proceso de abordaje (check-in) con cambio de color inmediato al registrar al pasajero.
* **Control de Escalas:** Panel de control de bajadas en paradas intermedias para verificar pasajeros.

### 3. Módulo de Conductor de Ruta (A Bordo)
* **Bitácora de Viaje:** Registro cronológico de inicio de viaje, paradas técnicas e incidencias menores con marcas de tiempo automáticas.
* **Telemetría y Sensores Activos:** Simulación en bucle de datos de motor (temperatura, presión de aceite, AdBlue y batería) que cambian aleatoriamente cada 3 segundos, mostrando indicadores de advertencia o peligro.
* **Mapa GPS Animado:** Un mapa de ruta interactivo SVG donde se desplaza un marcador de bus a lo largo de la ruta calculada por algoritmo óptimo de Dijkstra.
* **Botón de Emergencia S.O.S:** Botón interactivo que al presionarse despliega un modal de llamada a la central y reproduce una sirena acústica de alarma oscilante en bucle sintetizada en tiempo real.

### 4. Módulo de Controlador de Flota (Central de Despacho)
* **Mapa de Flota General:** Panel visual de buses activos en ruta a nivel nacional con alertas de estado de sensores.
* **Terminales y Andenes:** Monitoreo y asignación de andenes ocupados o libres en agencias principales.
* **Taller y Mantenimiento:** Vista técnica de buses fuera de ruta asignados a reparación u optimización.

### 5. Módulo del Administrador (Gestión del Negocio)
* **Panel de Estadísticas:** Gráficos y widgets con simulación de ingresos, porcentaje de ocupación e indicadores clave.
* **Gestión de Rutas:** Formularios interactivos para crear y editar viajes y asignar unidades de transporte.

---

## Stack Tecnológico y Simulación Frontend

Al tratarse de un prototipo interactivo IHC, todo el sistema opera en el navegador del cliente usando las siguientes tecnologías:

* **Core**: React + TypeScript
* **Enrutamiento**: TanStack Start / TanStack Router (enrutamiento de layouts y protección de vistas de rol)
* **Diseño Visual**: Tailwind CSS (estilo responsivo con animaciones personalizadas)
* **Audio y Haptic Feedback**: API Web Audio nativa (síntesis de ondas sonoras en tiempo real para sonidos de validación y sirena S.O.S)
* **Datos Simulados**: Arrays locales y generadores dinámicos que simulan la carga y actualización de datos operativos.

---

## Sistema de Diseño (Estética KUNTUR)

El prototipo implementa una guía de estilos formal (IHC) para una experiencia de usuario premium:
* **Colores**: Tonos tierra con verde salvia y esmeralda (`oklch`) combinados con fondos oscuros pizarra de alto contraste que cumplen con la norma de legibilidad WCAG AA.
* **Tipografía**: Plus Jakarta Sans y Outfit para una lectura limpia y estructurada.
* **Animaciones**: Duraciones cortas de `150ms` para interacciones simples y curvas amortiguadas `cubic-bezier(0.16, 1, 0.3, 1)` para paneles y alertas, mejorando la respuesta percibida.

---

## Instrucciones para Levantar el Prototipo

Ejecuta el prototipo de manera local en tu navegador:

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor local (Modo de Desarrollo)
```bash
npm run dev
```
Navega a [http://localhost:3000](http://localhost:3000) para interactuar con la aplicación.

### 3. Compilar para producción (Build)
```bash
npm run build
```
Genera la compilación lista para despliegue en hostings estáticos o SSR.
