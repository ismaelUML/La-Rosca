# Auditoría Técnica y Plan de Rediseño 1:1 — LA ROSCA (Estética Casa Rosada)

Documento de diagnóstico verificado contra el código fuente actual del repositorio y plan completo de migración visual y funcional para acoplar al 100% el nuevo diseño (`Rosado Casa Rosada` + papel crema + obsidiana) manteniendo intacto todo el motor de simulación, el modo Campaña, el modo Gobierno y el gestor multi-ventana.

---

## Parte 1 — Errores Concretos (Arreglo Rápido, Verificados en Código)

### 1.1 Símbolo de yen (`¥`) en tarjetas de acción, dilemas y Congreso
- **Dónde ocurre exactamente:**
  - `packages/simulation-infrastructure/src/datasets/campaignPresets2027.ts` (líneas 211, 265, 266: `'+45,0 ¥'`, `'+18,0 ¥'`, `'+26,0 ¥'`).
  - `packages/simulation-infrastructure/src/datasets/campaignDilemmasCatalog.ts` (líneas 213, 215, 216, 221, 223, etc.: `'PRESUPUESTO +18 ¥'`, `'COSTO -2,5 ¥'`, `'APORTES +7 ¥'`).
  - `packages/web-presentation/src/features/campaign/CampaignResumenView.tsx` (línea 382: `{state.budgetArgentums.toFixed(1)} ¥`).
  - `packages/web-presentation/src/features/game-shell/CongressBillsNegotiationSection.tsx` (línea 652: `Obra Pública (-30¥)`).
  - `packages/web-presentation/src/App.tsx` (línea 532: `-15 ¥`).
- **Causa:** Se usó `¥` como símbolo improvisado de "argentums" (`budgetArgentums`), mientras el topbar muestra `$125.0M` (pesos/millones).
- **Arreglo:** Unificar todo en **`US$ ... M`** (o **`$ ... M`** con formato `es-AR`) a través de una sola función helper `formatCurrencyMillions(val)`. Eliminar `¥` del 100% del repositorio.

### 1.2 Formato numérico mezclado (`. ` vs `, `)
- **Dónde ocurre:**
  - Los valores dinámicos (`toFixed(1)` / `toFixed(2)`) salen con **punto**: `$125.0M` (`CampaignActionsView.tsx:450`, `CampaignSidebarLayout.tsx:209`), `71.7%` (`Argentina3DMapCanvas.tsx`), `34.5%`, etc.
  - Los strings estáticos de badges salen con **coma**: `+1,4/+2,8`, `+18,0` (`campaignPresets2027.ts`, `measuresExpansionCatalog.ts`).
- **Arreglo:** Crear un formateador centralizado en `packages/web-presentation/src/lib/formatters.ts`:
  - `formatArNumber(value, decimals)` basado en `Intl.NumberFormat('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })`.
  - Aplicar en todas las vistas, mapa, tarjetas, ticker y tooltips (`52,4 %`, `34,5 %`, `US$ 125 M`, `+1,4 %`).

### 1.3 Tildes faltantes y mayúsculas inconsistentes
- **Dónde ocurre:**
  - Comentarios y textos heredados sin tilde o inconsistentes en `CongressBillsNegotiationSection.tsx`, `CamarasLegislativasView.tsx`, encabezados en mayúsculas de `ReformasInstitucionalesSection.tsx` y `DespachoAndRegistroView.tsx`.
- **Arreglo:** Barrido completo de strings de UI en `packages/web-presentation/src` (`ROSCA Y VOTACIÓN DE LEYES`, `RELACIÓN POR BLOQUES`, etc.).

### 1.4 Leyenda del Mapa 3D vs colores reales del mapa
- **Dónde ocurre:**
  - En `packages/web-presentation/src/features/map-3d/Argentina3DMapCanvas.tsx` (líneas 53–58), la leyenda de `LOYALTY` dice **verde (`bg-emerald-500`) / amarillo (`bg-amber-400`) / rojo (`bg-rose-500`)**.
  - En `packages/web-presentation/src/features/map-3d/argentina3dGeometry.ts` (líneas 28–31 y 230–235), los hexadecimales reales son `0x10b981` (verde esmeralda), `0xd97706` (ámbar oscuro) y `0xe11d48` (carmesí) sobre materiales `MeshStandardMaterial` con `metalness: 0.24`, `emissive: 0x0f172a` y luces nocturnas azuladas/cálidas. Al mezclarse con la luz azul y la saturación del shader, el esmeralda se ve **turquesa**, el ámbar se ve **marrón** y el modo `PARTIES`/`GOVERNORS` mete **celeste/teal** (`0x0284c7`, `0x14b8a6`).
- **Arreglo:**
  1. Reemplazar los colores por la paleta **Rosado / Crema / Ciruela** del diseño nuevo (`#EB3F7D` afín >= 60%, `#EFE9DA` negociable 45–59%, `#5A3444` hostil < 45%) — o sincronizar hex exactos entre leyenda 2D y material 3D sin `emissive` azulado que contamine los tonos.
  2. Bajar `metalness` a `0.05`–`0.1` y usar luz neutra/cálida para que el color pintado coincida exactamente con los cuadraditos de `CÓMO LEER EL MAPA`.

### 1.5 Ticker cortado y título cortado en Despacho
- **Dónde ocurre:**
  - `LiveNewsAndMarketTicker.tsx` (línea 259): usa `truncate` dentro de un único `flex` sin ancho mínimo adaptativo ni animación/carrusel legible para titulares largos, cortando el texto con `...` en anchos medios.
  - `DespachoAndRegistroView.tsx` (líneas 76–111): el banner superior mete avatar + badges + título `<h1>` + 2 botones grandes en `md:flex-row` dentro de ventanas flotantes de ancho reducido, aplastando/recortando textos.
- **Arreglo:** En el rediseño, compactar el header de Despacho y convertir el zócalo inferior en un ticker opcional/plegable con desplazamiento o chips concisos que no compitan con la mano de cartas inferior.

### 1.6 Escritorio 3D: mitad derecha del visor en negro vacío
- **Dónde ocurre:**
  - `packages/web-presentation/src/features/game-shell/PresidentialDesk3DScene.tsx` (líneas 88–97 y 180–215).
  - **Causa raíz exacta:** `buildCasaRosadaDeskScene` llama `renderer.setSize(w, h)` **una sola vez al montar** usando `container.clientWidth`. No existe ningún `ResizeObserver` ni listener de `resize` que actualice `camera.aspect`, `camera.updateProjectionMatrix()` y `renderer.setSize(...)` cuando la ventana flotante se agranda, se maximiza o se reordena. Como resultado, el `<canvas>` queda congelado en el ancho inicial y deja el resto del contenedor `bg-[#05080d]` negro vacío.
- **Arreglo inmediato:** Conectar un `ResizeObserver` sobre `containerRef.current` dentro del `useEffect` (igual que ya hace `Argentina3DMapCanvas.tsx`).

---

## Parte 2 — Datos que No Cierran (Explicación Real vs Bugs)

| Inconsistencia reportada | Causa verificada en el código | ¿Bug o diseño mal comunicado? | Solución |
| :--- | :--- | :--- | :--- |
| **Dossier dice 38 diputados propios y el hemiciclo muestra 30** | En `SetupSummarySidebar.tsx` (`CONGRESS_SCENARIO_CATALOG`), `ESTANDAR_2027` muestra `38 Dip · 7 Sen propios`. Pero si venís del modo **Campaña**, `campaignGovernmentBridge.ts` (`buildCongressFromCampaign`) recalcula las bancas con `buildSeatScale(votePct, coalitionCount)`: si asumiste con intención de voto baja (~30–34%), escala tus diputados propios a ~30. | Falta de comunicación / inconsistencia entre escenario elegido y puente de campaña. | Mostrar en el Dossier/transición cuántas bancas ganaste en función de tu elección (`Base 38 ± resultado electoral`) o respetar el escenario si se arranca en Gobierno Directo. |
| **Dossier dice reservas USD 55B y en juego hay 22,2B** | En `initialState2027Factory.ts` (líneas 90 y 103–105), la dificultad `VIENTO_DE_COLA` fija **`grossReserves: 55.0`** (brutas), y automáticamente resta `argendolarEncajes (14.8) + chinaSwap (18.0) = 32.8`, dejando **`netLiquidReservesBillionUsd = 22.2`**! (`55.0 - 14.8 - 18.0 = 22.2`). El Dossier muestra *Brutas* (`USD 55.0B`) y el juego muestra *Netas* (`22.2 B`). | **Bug de etiquetas:** nunca aclara *Brutas* vs *Netas* en el Dossier. | Etiquetar explícitamente `Reservas Brutas: US$ 55,0 B (Netas: US$ 22,2 B)` en el Dossier de Partida y mantener coherencia en todo el tablero. |
| **HUD dice Imagen 48% y el ticker dice Aprobación 44,8%** | En `DespachoAndRegistroView.tsx` (líneas 159–165), la tarjeta titulada *"Aprobación Presidencial"* muestra `presidentialPersonalImagePct` (ej. `48%`), mientras `LiveNewsAndMarketTicker.tsx` (línea 52) imprime `managementApprovalPct` (`44,8%`). Además `campaignGovernmentBridge.ts` (líneas 99–102) deriva `managementApprovalPct` con fórmula ponderada y le suma `+3.5` a `presidentialPersonalImagePct`. | **Bug de rótulos:** dos variables distintas mostradas con el mismo nombre ("Aprobación"). | Separar claramente **`IMAGEN PERSONAL`** vs **`APROBACIÓN DE GESTIÓN`** en tarjetas, HUD y ticker, y mostrar una sola métrica principal en el topbar. |
| **`Inflación interanual: mín 33 · máx 33` no dice nada** | En `indicatorsSeriesBuilder.ts` (líneas 7–52), cuando `startVal === currentValue` al mes 1, `buildSyntheticCurve` genera una línea horizontal constante y `Math.min` = `Math.max` = `33`. `IndicatorChartCard.tsx:129` siempre renderiza `mín {min} · máx {max}`. | **Bug visual en mes inicial.** | Si `minValue === maxValue`, mostrar `Sin variación en el período` o `Base inicial: 33,0 %` en vez de `mín 33 · máx 33`. |
| **Dos nombres para el mismo recurso (`Caja $125M` vs `Presupuesto de campaña +18`)** | Todo apunta al mismo campo `state.budgetArgentums`. `CampaignSidebarLayout` y `CampaignActionsView` lo llaman `CAJA`, `CampaignResumenView` lo llama `Presupuesto`, y las cartas/dilemas lo llaman `PRESUPUESTO DE CAMPAÑA` o `APORTES`. | **Inconsistencia de vocabulario.** | Unificar el nombre en todo el juego: **`CAJA`** (en campaña: `Caja de campaña · US$ 125 M`, en gobierno: `Reservas / Caja Tesoro` según corresponda). |

---

## Parte 3 — Diagnóstico de Diseño: Por qué hoy NO es "extravagante" ni se siente argentino

1. **Estética genérica dark-navy + dorado:** `#0b0f14` + `#162233` + `#b89342` + labels `10px font-mono uppercase` es la plantilla estándar de cualquier dashboard cripto o militar genérico. No transmite Casa Rosada, Boletín Oficial ni rosca política argentina.
2. **Saturación de dorado y colores semánticos sin jerarquía:** Cuando bordes, botones, títulos, tags y contadores son dorados, nada llama la atención. Los 52 botones `"EJECUTAR OPERACIÓN"` gritan igual. A eso se suman 7 colores simultáneos (verde, rojo, naranja, turquesa, celeste, violeta, marrón) más dos azules casi indistinguibles en el hemiciclo (`PF` vs `UXP` o `CORDOBA`).
3. **Micro-tipografía cansadora:** Abuso de `text-[10px] font-mono uppercase` gris apagado sobre negro (`text-slate-400` sobre `#090d14`) con bajo contraste y sin peso tipográfico editorial.
4. **Dependencia ciega del color:** Etiquetas como `"IMAGEN POSITIVA · VERDE"` o `"LLA · Violeta"` existen porque el color solo no se distingue. En el diseño nuevo, los datos se apoyan en tamaño, tipografía, posición, barra/cuadros de riesgo y etiquetas directas.
5. **Brillos borrosos (`backdrop-blur` pesados + `box-shadow` gigantes):** Ensucian las capas cuando hay ventanas abiertas y bajan FPS en notebooks sin GPU dedicada.
6. **Ausencia de identidad visual de "LA ROSCA":** El nombre del juego no tenía marca ni símbolo gráfico propio, ni estética de afiche político / papel impreso / cartelería argentina.

---

## Parte 4 — El Escritorio 3D (`PresidentialDesk3DScene.tsx`)

### Estado actual (verificado en código)
- Aunque en `PresidentialDesk3DScene.tsx` (líneas 172–178) los 4 objetos 3D **ya disparan acciones reales** al hacer clic (`CARPETA_DNU` -> Medidas, `TELEFONO_ROJO` -> Cumbre Gobernadores, `TERMINAL_BCRA` -> Rueda MULC, `SALA_PRENSA` -> Cadena Nacional / Prensa), la escena mide solo `215px` de alto, tiene fondo plano `#070b13` / `#14080c`, un rectángulo celeste básico de ventana (`PlaneGeometry(7.2, 3.2)`), sin paredes ni ambientación, **se rompe al redimensionar** (mitad derecha negra) y duplica la interacción con 4 botones pequeños abajo.

### Cómo transformarlo en la pantalla estrella de `01 DESPACHO`
1. **Viewport amplio y `ResizeObserver` real:** Subir la altura a `320px–380px` (o modo inmersivo dentro de Despacho) con `ResizeObserver` actualizando cámara y renderer al instante.
2. **Dirección de arte Casa Rosada / Salón Blanco:**
   - Paredes **Rosado Casa Rosada pálido/terracota** (`#4E1E31` / `#6E2943` bajo iluminación cálida) con zócalo de madera oscura y molduras crema `#EFE9DA`.
   - Ventanal alto con vista nocturna estilizada hacia Plaza de Mayo y luz cálida de velador de escritorio (`SpotLight` + sombras activadas).
   - Escritorio lustrado en caoba cálida con bandera argentina de pie, tintero/sello y los **4 objetos protagonistas bien separados y con etiquetas flotantes HUD** proyectadas en pantalla (estilo los pins del mapa):
     - **Teléfono Rojo** -> `GOBERNADORES · Pacto y ATN`
     - **Monitor / Terminal** -> `MERCADOS · Rueda BCRA / CCL`
     - **Carpeta / Expediente** -> `DNU Y MEDIDAS · Decretos vigentes`
     - **Ventana / Atril con micrófono** -> `PRENSA · Cadena Nacional y Vocería`
3. **Eliminar las 4 tarjetitas duplicadas redundantes** (o dejarlas como leyenda/atajo accesible de teclado `1–4` abajo) para que la interacción principal sea tocar directamente el escritorio iluminado con highlight rosado al pasar el mouse.

---

## Parte 5 — Plan de Implementación 1:1 del Nuevo Diseño (`LA ROSCA`)

El diseño de tus 2 capturas se integra **al 100%** como la nueva piel y arquitectura de navegación del juego, conservando intactos `@argentina-sim/domain`, `@argentina-sim/infrastructure` y todas las pantallas internas:

### 5.1 Tokens y Tipografía Global (`index.html` + `index.css` + `tailwind.config.js`)
- **Fuentes:** Sumar Google Fonts **`Anton`** (o **`Barlow Condensed`** 800/900) para titulares de afiche/KPIs enormes, junto a **`Plus Jakarta Sans`** (cuerpo legible) y **`JetBrains Mono`** (datos tabulares).
- **Paleta única (1 acento por pantalla):**
  - Fondo lienzo: `#090407` con halo radial `#260917` centrado atrás del mapa 3D.
  - Acento firma: **Rosado Casa Rosada** `#EB3F7D` (bordes activos, selección, CTA, puntos positivos clave, pines destacados).
  - Papel afiche / cartelería: **Crema Papel** `#EFE9DA` con tinta `#120D10` para cartas de acción, provincias negociables y recortes de diario.
  - Panel oscuro HUD: `#0E080B` / `#140B10` con bordes limpios `1px` `rgba(255,255,255,0.14)` o rosado `#EB3F7D`, **sin** glows borrosos pesados.

### 5.2 Topbar Limpio + Menú `☰` + Logo Rosca
- **Izquierda:** Botón `☰` (despliega utilidades secundarias: Guardar partida, Silenciar audio, Modo 2001 / Salir al menú, Ver/Minimizar ventanas) + **Isotipo "La Rosca"** (anillo abierto rosado `#EB3F7D` en SVG) + **`LA ROSCA`** en display bold + subtítulo `{MES AÑO} · {CAMPAÑA / GOBIERNO}`.
- **Centro:** **3 KPIs grandes** con jerarquía limpia:
  - En Campaña: `IMAGEN` (`52,4 %`) · `INTENCIÓN DE VOTO` (`34,5 %`) · `CAJA` (`US$ 125 M`)
  - En Gobierno: `APROBACIÓN` (`48,0 %`) · `INFLACIÓN / DÓLAR` o `RESERVAS NETAS` · `RIESGO PAÍS / SUPERÁVIT`
- **Píldora centrada debajo:** `[ OBJETIVO ]  {objectiveTitle} · faltan {N} meses` con borde fino rosado.
- **Derecha:** Botón único protagonista **`AVANZAR MES →`** con borde rosado `#EB3F7D`.

### 5.3 Dock Lateral Numerado (`01` .. `05`) Flotando sobre el Mapa
- Reemplazar la doble barra horizontal de pestañas superior por la caja vertical flotante arriba a la izquierda (exactamente como en el mockup):
  - **En Gobierno:** `01 DESPACHO`, `02 ECONOMÍA`, `03 PRESUPUESTO`, `04 POLÍTICA Y CONGRESO`, `05 PAÍS`.
  - **En Campaña:** `01 SITUACIÓN`, `02 ESTRATEGIA`, `03 POLÍTICO`, `04 PAÍS`, `05 DIARIO`.
- La categoría seleccionada se pinta entera en **Rosado Casa Rosada (`#EB3F7D`)** con texto oscuro y subtítulo descriptivo (`Provincias y gobernadores`).
- **Sin auto-apertura:** Al tocar `05 PAÍS`, solo despliega al costado (o debajo en pills finas) sus sub-opciones (`Población y Demografía`, `Inmigración`, `Emigración`, `Salud y Educación`, `Matriz Productiva`) para que el jugador elija exactamente qué ventana abrir en el escritorio.

### 5.4 Mapa 3D Central Rediseñado (`Argentina3DMapCanvas`)
- **Anillos de radar rosados** (`0xeb3f7d`) concéntricos sobre el fondo oscuro vino/obsidiana.
- **Paleta 3D del mapa alineada 1:1 con la leyenda:**
  - Afín (>= 60 %): `#EB3F7D` (Rosado)
  - Negociable (45–59 %): `#EFE9DA` (Crema papel)
  - Hostil (< 45 %): `#5A3444` (Bordó apagado)
  - Altura = `nationalDeputiesCount`.
- **Pines flotantes HTML proyectados 3D->2D** sobre las provincias clave (`SALTA 7`, `CHACO 7`, `MISIONES 7`, `★ CASA ROSADA · CABA 25` en etiqueta rosada, `SANTA FE 19`, `CÓRDOBA 18`, `BUENOS AIRES 70`, `MENDOZA 10`, `RÍO NEGRO 5`, `CHUBUT 5`, `SANTA CRUZ 5`, `T. DEL FUEGO 5`).
- **Esquina inferior izquierda:** Leyenda `CÓMO LEER EL MAPA` + bloque con borde crema `4 JUGADAS ESTE MES` (o acciones/turnos restantes).

### 5.5 Tarjeta Derecha de Provincia Seleccionada (`SelectedProvinceCard`)
- Rediseño exacto al mockup derecho:
  - Borde rosado `#EB3F7D` sobre fondo oscuro `#0D070A`.
  - Fila superior: `{REGION} · {SIGLA}` en rosado vs `SELECCIONADA`.
  - Nombre de la provincia en tipografía display condensada grande (`CIUDAD AUTÓNOMA DE BUENOS AIRES`) + `Gob. {governorName}`.
  - Grilla 2×2 limpia: `DIPUTADOS`, `LEALTAD` (destacada en rosado), `FISCAL` (con coma `es-AR`), `COPART.`.
  - Botón lleno rosado abajo: **`GIRAR ATN · 0,08 % DEL PBI`** (o en campaña: **`VISITAR PROVINCIA / RECORRIDA`**).

### 5.6 Mano de 3 Cartas Tácticas Inferiores + `3 de 52 cartas · Ver todas`
- Abajo en el centro sobre el mapa: **3 cartas inclinadas** (`-3deg`, `0deg`, `+3deg`) con hover que las endereza y eleva:
  - **2 cartas en Crema Papel (`#EFE9DA`)** y tinta negra (ej. `TERRITORIO · RECORRIDA · 8,6 M`, `ESTRUCTURA · CENA CON EMPRESARIOS PYME · 2,5 M`).
  - **1 carta central destacada en Rosado (`#EB3F7D`)** con badge superior `★ RECOMENDADA` (ej. `ROSCA · CUMBRE CON GREMIOS DIALOGUISTAS · 6,0 M` y botón negro `EJECUTAR`).
  - Cada carta incluye **indicador visual de riesgo de 3 cuadraditos** (`Riesgo bajo` = 1 relleno, `Riesgo medio` = 2 rellenos, `Riesgo alto` = 3 rellenos) + efecto con triángulo `▲` en formato `es-AR` (`+US$ 26 M`, cero `¥`).
- A la derecha abajo: enlace **`3 de 52 cartas · Ver todas`** que abre la ventana completa de `Acciones de campaña` (o en Gobierno, `Medidas / Decretos`).

### 5.7 Ventanas Internas & Hemiciclos Coherentes con el Nuevo Sistema
- Adaptar `DesktopWindowFrame.tsx` y `hoi-panel` al mismo lenguaje (fondo `#0E080B`, borde fino `#EB3F7D/50` en la activa, botones limpios sin dorado genérico).
- Actualizar los colores de bloques en `CamarasLegislativasView.tsx` para eliminar los dos azules casi iguales (diferenciar `PF` vs `UXP` con mayor contraste + usar iniciales/trama o borde además del color).

---

## Parte 6 — Orden Recomendado de Ejecución

1. **Fase A — Fix de datos, números y bugs críticos (bajo riesgo, arregla toda la lógica rota):**
   - Eliminar `¥` y crear `formatArNumber` / `formatCurrencyMillions` (`es-AR`).
   - Corregir `ResizeObserver` de `PresidentialDesk3DScene.tsx` (chau mitad negra).
   - Aclarar Reservas Brutas vs Netas en Dossier, separar `Imagen Personal` vs `Aprobación de Gestión`, ocultar `mín 33 · máx 33` cuando no hay rango y unificar `CAJA`.
   - Corregir tildes faltantes y diferenciar los dos azules en hemiciclos.
2. **Fase B — Shell Visual 1:1 "LA ROSCA · Rosado Casa Rosada" (Campaña y Gobierno):**
   - Nueva tipografía + tokens rosado/crema/obsidiana.
   - Nuevo Topbar (Logo Rosca, 3 KPIs, píldora Objetivo, menú `☰`, `AVANZAR MES →`).
   - Dock lateral numerado `01..05` sin auto-apertura + ventana de sub-opciones al elegir categoría.
   - Mapa 3D con paleta rosado/crema/ciruela + anillos rosados + pines flotantes + leyenda + `4 JUGADAS ESTE MES` + tarjeta derecha de provincia.
   - Mano de 3 cartas inclinadas abajo + `Ver todas`.
3. **Fase C — Rediseño Artístico del Escritorio 3D (`01 DESPACHO`):**
   - Paredes rosado Casa Rosada, ventanal con iluminación nocturna real, etiquetas flotantes sobre los 4 objetos interactivos y escena amplia sin duplicar botones.
4. **Fase D — Limpieza de estilos internos en ventanas (`DesktopWindowFrame`, tarjetas, medidas y diarios):**
   - Alinear botones de acción, tablas y modales al sistema rosado/crema/obsidiana.
