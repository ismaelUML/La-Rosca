# Logos Oficiales y Partidos Reales (2025-2027) — La Rosca

Basta de iconitos geométricos inventados o nombres viejos que quedaron en 2023. Acá tenés el inventario posta de todos los sellos partidarios actuales de la Argentina y los emblemas institucionales del Estado que ya bajamos y cableamos en `packages/web-presentation/public/logos/` desde Wikimedia Commons via [fetch-official-logos.mjs](file:///c:/Users/Danie/OneDrive/Desktop/Estudio%20Y%20Proyectos/Complete/scripts/fetch-official-logos.mjs).

El registro central de código vive en [officialLogosCatalog.ts](file:///c:/Users/Danie/OneDrive/Desktop/Estudio%20Y%20Proyectos/Complete/packages/web-presentation/src/features/party-setup/officialLogosCatalog.ts) y se renderiza con `<OfficialPartyLogo />` y `<OfficialInstitutionLogo />` desde [OfficialLogoBadge.tsx](file:///c:/Users/Danie/OneDrive/Desktop/Estudio%20Y%20Proyectos/Complete/packages/web-presentation/src/features/party-setup/OfficialLogoBadge.tsx).. aparte del propio `<PartyEmblemSvg />` que ahora envuelve el SVG real sin recortarlo.

---

## 1. Partidos y Coaliciones Actuales (2025-2027)

Nota técnica piola: para no romper saves viejos ni los tests unitarios que buscan las claves históricas (`LLA`, `PRO`, `PF`, `UCR`, `UxP`, `FIT`), mantuvimos esos `id` internos pero actualizamos nombres oficiales, descripciones y logos al mapa político actual:

| Clave interna / Bloque | Nombre actual real | Archivo local (`/logos/...`) | Origen Wikimedia Commons | Fondo recomendado |
| :--- | :--- | :--- | :--- | :--- |
| `LLA` | **La Libertad Avanza** | `partido-lla.svg` (`partido-lla-emblema.svg` alt) | `File:Logo La Libertad Avanza (sin águila).svg` | Blanco (`light`) |
| `PRO` | **PRO - Propuesta Republicana** | `partido-pro-2026.png` (`partido-pro.svg` alt) | `File:Logo Propuesta Republicana 2026.png` | Blanco (`light`) |
| `UxP` / `FP` | **Fuerza Patria / Unión por la Patria (PJ)** | `partido-fuerza-patria-png.png` (`partido-fuerza-patria.svg`, `partido-uxp.svg`) | `File:Homeland Force logo.png` / `File:Logo de Fuerza Patria.svg` | Blanco (`light`) |
| `PJ` | **Partido Justicialista** | `partido-pj.svg` | `File:Partido Justicialista emblema.svg` | Blanco (`light`) |
| `UCR` | **Unión Cívica Radical** | `partido-ucr.svg` (`partido-ucr-modern.svg` alt) | `File:Escudo de la UCR.svg` | Blanco (`light`) |
| `PF` / `PU` | **Provincias Unidas / Encuentro Federal** | `partido-provincias-unidas.svg` (`partido-hacemos.svg` alt) | `File:Logo de "Provincias Unidas".svg` | Blanco (`light`) |
| `PROVINCIALES` / `PROV` | **Innovación Federal y Bloques Provinciales** | `partido-innovacion-federal.png` | `File:Innovación Federal.png` | Blanco (`light`) |
| `FIT` / `FIT-U` | **Frente de Izquierda y de Trabajadores - Unidad** | `partido-fitu.svg` | `File:Logo Frente de Izquierda y de Trabajadores-Unidad.svg` | Oscuro (`dark`, el SVG ya trae fondo negro propio) |
| `CC` | **Coalición Cívica ARI** | `partido-cc-ari.svg` | `File:Coalicion Civica.svg` | Blanco (`light`) |

---

## 2. Emblemas Oficiales del Estado Argentino

| Clave en catálogo | Organismo / Uso | Archivo local (`/logos/...`) | Origen Wikimedia Commons | Dónde lo ves en el juego |
| :--- | :--- | :--- | :--- | :--- |
| `ESCUDO_NACIONAL` | **Escudo Nacional Argentino** | `estado-escudo-nacional.svg` | `File:Coat of arms of Argentina.svg` | Landing screen, barra superior de Campaña, Cadena Nacional intro, Escrutinio CNE, Dossier Gobernador |
| `PRESIDENCIA` | **Presidencia de la Nación / Casa Rosada** | `estado-presidencia.svg` | `File:Casa rosada presidencia logo.svg` | Landing, Despacho Presidencial, Barra superior en rol Presidente, Placa intro + cabecera de Cadena Nacional |
| `BOLETIN_OFICIAL` | **Boletín Oficial (BORA)** | `estado-boletin-oficial.png` | `File:Logo Boletín Oficial Argentina.png` | Despacho -> Registro / Crónica Oficial |
| `DIPUTADOS` | **H. Cámara de Diputados de la Nación** | `estado-diputados.svg` | `File:Cámara de diputados de Argentina.svg` | Cámaras hemiciclo, Proyección Diputados, Tablero en Vivo (cámara baja), Barra en rol Diputado |
| `DIPUTADOS_TV` | **Diputados TV (DTV)** | `estado-diputados-tv.png` | `File:Logo Diputados TV.png` | Transmisión de sesión especial de Diputados en tiempo real |
| `SENADO` | **H. Senado de la Nación Argentina** | `estado-senado-inverse.svg` (`estado-senado.svg` alt) | `File:Logo del Senado de Argentina (Inverse).svg` | Cámaras hemiciclo, Proyección Senado, Tablero en Vivo (cámara alta), Barra en rol Senador |
| `BCRA` | **Banco Central de la República Argentina** | `estado-bcra.svg` | `File:BCRA logo.svg` | Modal intradía del MULC / Mesa de Operaciones Cambiarias |
| `CSJN` | **Corte Suprema de Justicia de la Nación** | `estado-corte-suprema.png` | `File:Corte suprema argentina logo.png` | Vista Judicial / Comodoro Py / Despacho de Corte Suprema |

> Un detalle que nos salvó de un blooper visual: `File:Cámara de Diputados de la Nación Argentina.svg` en Commons en realidad es un gráfico de las 257 bancas, no el sello institucional. Lo cambiamos por `File:Cámara de diputados de Argentina.svg`, que sí es el logotipo real de la HCDN.

---

## 3. Regla de Contraste en Modo Oscuro (No negociable)

La estética de *La Rosca* es táctico oscuro (`#090d14` / `#0c1119`), mientras que casi todos los logos institucionales y partidarios reales tienen tipografía negra o azul marino pensada para papel blanco:
1. Para `LLA`, `PRO`, `Fuerza Patria`, `UCR`, `Provincias Unidas`, `Innovación Federal`, `CC ARI`, `Presidencia`, `Boletín Oficial`, `Diputados` y `CSJN`: el componente `OfficialLogoBadge` aplica automáticamente `bg-white/95 p-0.5 rounded-sm` para que no se pierda ni una línea sobre el fondo oscuro.
2. Para `FIT-U`, `Diputados TV` y `Senado (Inverse)`: usan `bg-[#090d14]` porque ya traen tarjeta negra o placa celeste/azul propia en el SVG.
3. Para `Escudo Nacional` y `BCRA`: el SVG ya trae laureles/escudo dorado o disco blanco interno (`Fondo_Blanco`), así que van `transparent` directo sobre el acero oscuro.
4. En `<PartyEmblemSvg />` siempre usar `preserveAspectRatio="xMidYMid meet"` con margen interno (`x=10 y=10 width=80 height=80`), porque logos apaisados como `partido-lla.svg` o `partido-provincias-unidas.svg` si no se rebanan a los costados.

---

## 4. Secuencia de Cadena Nacional y Lugares para Seguir Metiendo Logos

### Cadena Nacional antes del atril (ya implementado)
En [PressAndDebateSimulatorModal.tsx](file:///c:/Users/Danie/OneDrive/Desktop/Estudio%20Y%20Proyectos/Complete/packages/web-presentation/src/features/game-shell/PressAndDebateSimulatorModal.tsx), al disparar Cadena Nacional / Conferencia de Prensa ahora arranca primero una placa animada de transmisión obligatoria con el **Escudo Nacional**, **Presidencia de la Nación**, franjas celestes y blancas, audio de quórum (`playUiSound('quorum')`) y botón `"Ir al atril ahora ->"` (se cierra sola a los ~2,2 segundos si no tocás nada y da paso al estudio 3D con el atril).

### Otros lugares copados donde sumar estos logos a futuro
- **Diario La Rosca / Eventos (`NewspaperEventModal.tsx`)**: mostrar el sello oficial arriba del diario según categoría (`BCRA` en corridas cambiarias, `CSJN` en fallos/cautelares, `PRESIDENCIA` en cadenas nacionales o renuncias de gabinete, `ESCUDO_NACIONAL` en elecciones).
- **Boletas Electorales en Pantalla (Padrón / PASO / Balotaje)**: armar una preview tipo Boleta Única de Papel (BUP) en la Noche Electoral con foto/cargo del candidato y el logo posta de su frente arriba a la izquierda.
- **DNU y Decretos**: poner el sello del `BOLETIN_OFICIAL` + `PRESIDENCIA` en la firma estampada al publicar cada decreto de necesidad y urgencia o veto presidencial.
- **Cumbre de Gobernadores (`FederalSummitAndCrisisModal.tsx`)**: sumar `ESCUDO_NACIONAL` + logos partidarios al lado de cada gobernador cuando negocian ATN y Pacto Fiscal.
- **Partidos locales / provinciales extra**: si más adelante querés sumar Fuerza Republicana, Juntos Somos Río Negro, Frente Renovador de la Concordia o Hacemos Unidos por Córdoba, se pueden agregar con el mismo patrón en `scripts/fetch-official-logos.mjs` y registrarlos en `PARTY_OFFICIAL_LOGOS`.
