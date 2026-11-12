# FIXES.md — Bitácora Técnica de Soluciones y Verificación de La Rosca

Registro de soluciones arquitectónicas, módulos modificados, métricas de calidad de código y confirmaciones de commits.

---

## Estándares de Ingeniería Aplicados en Cada Fix
- **Arquitectura Hexagonal (Ports & Adapters)**: Dominio desacoplado (`packages/simulation-domain`), Infraestructura de datos (`packages/simulation-infrastructure`), Presentación reactiva (`packages/web-presentation`).
- **Complejidad Ciclomática Estricta**: $CC \le 5$ en cada función o componente.
- **Índice de Mantenibilidad**: $MI \ge 75$ en todos los archivos de la solución.
- **Test-Driven / Determinismo**: 22 tests unitarios pasando en $< 1$ segundo.

---

## Registro Cronológico de Soluciones

### FIX-001: Persistencia reactiva del estado y creador de personaje
- **Commit**: `d596495`
- **Archivos**:
  - `packages/simulation-infrastructure/src/repositories/LocalStorageSaveRepository.ts`
  - `packages/web-presentation/src/App.tsx`
  - `packages/web-presentation/src/features/character-creator/CharacterCreatorView.tsx`
- **Solución técnica**:
  - Se vinculó `localStorage` con autoguardado en cada acción y avance mensual.
  - Se corrigió la inicialización de campaña para respetar `customCandidate` antes de caer en el fallback del catálogo predefinido.
  - Se implementó el switch irreversible de confirmación de candidatura con impacto electoral.

---

### FIX-002: Sincronización del mapa vectorial con candidatos reales de la interna
- **Commit**: `e69b915`
- **Archivos**:
  - `packages/web-presentation/src/features/campaign/districtPollGenerator.ts`
  - `packages/web-presentation/src/features/campaign/ArgentinaRealVectorMap.tsx`
  - `packages/web-presentation/src/features/campaign/CampaignImageAndMapView.tsx`
- **Solución técnica**:
  - Se desacopló el popup de intención de voto interna de La Pampa/Pueyrredón de los dirigentes hardcodeados del PRO (Macri, Vidal, Larreta, Torres).
  - El modal ahora consume dinámicamente `state.internalPoll?.candidates` respetando el partido que eligió o creó el jugador.

---

### FIX-003: Algoritmo probabilístico de apoyos provinciales y cooldown de 5 meses
- **Commit**: `b05a353`
- **Archivos**:
  - `packages/web-presentation/src/features/campaign/CampaignApoyoProvinciasView.tsx`
  - `packages/web-presentation/src/App.tsx`
- **Solución técnica**:
  - Implementación de `computeLeaderEffectiveProb`:
    $$\text{Prob} = \text{clamp}(\text{Base} + \Delta_{\text{afinidad}} + \text{Bono}_{\text{imagen}} + \text{Bono}_{\text{rasgo}}, 5\%, 95\%)$$
  - Donde el rasgo `DIALOGUISTA` aporta $+12\%$ y `DOGMÁTICO` penaliza $-15\%$ si no son del mismo espacio.
  - Al recibir rechazo, se registra el cooldown en `state.politicianCooldowns[leaderId] = 5`, bloqueando la interacción por 5 turnos mensuales.

---

### FIX-004: Ordenamiento descendente de fórmulas y badge "¡Tu fórmula lidera!"
- **Commit**: `b05a353`
- **Archivos**:
  - `packages/web-presentation/src/features/campaign/CampaignPartidoProvinciasView.tsx`
- **Solución técnica**:
  - Se refactorizó `ProvincialVoteBar` con `sortedShares` descendente. Si el jugador tiene la mayor cantidad de votos, pasa automáticamente a la fila 1 y la barra multicromática arranca con su color.
  - Se agregó `buildDiffLabel` que calcula el diferencial contra el competidor inmediato (`+7,2 vs. Provincias Unidas`).
  - En `TurnCardItem`, se agregó la función `checkIsPlayerLeading` que activa el borde violeta y el cartel `¡Tu fórmula lidera!` en el resumen del turno.

---

### FIX-005: Coaliciones distritales interactivas y absorción de votos
- **Commit**: `b05a353`
- **Archivos**:
  - `packages/web-presentation/src/features/campaign/CampaignPartidoProvinciasView.tsx`
  - `packages/web-presentation/src/features/campaign/VicePresidentSelectionModal.tsx`
- **Solución técnica**:
  - Se reemplazó el texto estático de la solapa `COALICION` por un catálogo interactivo de fuerzas locales (`ProvincialCoalitionCard`).
  - Límite de 2 aliados distritales máximos.
  - Detección de incompatibilidad ideológica insalvable (`isPartyIncompatible` para izquierda dura / derecha).
  - Traspaso directo del 60 % de votos del socio a la fórmula provincial (`transferAllianceVotes`), con opción de romper la alianza si fuera necesario.
  - Fallback en `VicePresidentSelectionModal` para partidos nuevos creados por el jugador sin alianzas previas.

---

### FIX-006: Fatiga dinámica de acciones y degradación estilo QQG
- **Commit**: `b05a353`
- **Archivos**:
  - `packages/web-presentation/src/features/campaign/CampaignActionsView.tsx`
  - `packages/web-presentation/src/features/campaign/CampaignPartidoProvinciasView.tsx`
- **Solución técnica**:
  - En acciones nacionales:
    $$\text{Mult}_{\text{recorrida}} = f(\text{visitas}) \times \text{AfinidadProvincial}$$
    (1 visita = $1.0$, 2 = $0.65$, 3 = $0.40$, 4+ = $0.13$).
  - En acciones de campaña provincial:
    $$\text{Mult}_{\text{fatiga}} = \frac{1}{1 + 0.35 \times (4 - \text{accionesRestantes})}$$
  - Escalamiento en vivo del texto de las píldoras (`scaleProvincialBadge`) para que los rangos reflejen la pérdida de efectividad.
  - Reset mensual automático al avanzar de turno mediante `useEffect` sobre `state.stage.currentMonthIndex`, recargando las 4 acciones y sumando 12 argentums de presupuesto provincial.

---

### FIX-007: Fase 1 Macroeconómica 1:1 (Inercia de IPC, productoria de 12 meses y feedback reservas/brecha)
- **Commit**: `b9518fa`
- **Archivos**:
  - `packages/simulation-domain/src/models/SimulationTypes.ts`
  - `packages/simulation-domain/src/economy/inflationEngine.ts`
  - `packages/simulation-domain/src/economy/centralBankAndBankingEngine.ts`
  - `packages/simulation-domain/src/engine/SimulationEngine.ts`
  - `packages/simulation-infrastructure/src/datasets/initialState2027Factory.ts`
  - `packages/simulation-domain/tests/simulationEngine.test.ts`
- **Solución técnica**:
  - Se agregó `inflHist` (vector de hasta 12 meses) en `InflationBreakdown`.
  - Se implementó `computeInterannualFromHistory` con la productoria geométrica estricta de los 12 meses:
    $$\text{inflacionAnual} = \prod_{i=1}^{12} \left(1 + \frac{\text{infl\_mes}_i}{100}\right) - 1$$
  - Inercia con smoothing en `computeInertiaFromHistory` promediando los últimos 3 meses ponderados.
  - Actualización mensual del Tipo de Cambio Real (`tcReal` base 100) y del Nivel de Precios (`priceLevel` base 100) ajustado por devaluación e inflación.
  - Feedback no-lineal en `computeParallelExchangeRates` con penalizaciones por superación de brecha (umbrales 15 % y 28 %) y corrida cambiaria suave cuando las reservas caen por debajo de los niveles de alarma.
  - Calibración de los indicadores iniciales para Presidente: Inflación mensual 1,9 %, interanual 33 %, dólar $1.450, brecha 8 %, reservas 50 mil M USD, riesgo país 620 pb, pobreza 32 %, desempleo 7,6 %, informalidad 42 %.
  - 23 tests unitarios pasando en Vitest y 68 archivos superando la auditoría de $CC \le 5$ y $MI \ge 75$.

---

### FIX-008: Fase 2 RIGI Dinámico y 6 Problemáticas Institucionales de Intervención Federal
- **Commit**: `e6cac5b`
- **Archivos**:
  - `packages/simulation-domain/src/engine/rigiEngine.ts`
  - `packages/simulation-domain/src/models/PartyAndSetupTypes.ts`
  - `packages/simulation-domain/src/models/SimulationTypes.ts`
  - `packages/simulation-domain/src/politics/judicialLaborAndOpinionEngine.ts`
  - `packages/simulation-domain/src/engine/PolicyActionHandler.ts`
  - `packages/simulation-infrastructure/src/datasets/provinces2027Dataset.ts`
  - `packages/web-presentation/src/features/game-shell/RigiSectorsSection.tsx`
  - `packages/web-presentation/src/features/game-shell/BudgetAndTaxesView.tsx`
  - `packages/web-presentation/src/features/campaign/CampaignPartidoProvinciasView.tsx`
  - `packages/web-presentation/src/App.tsx`
  - `packages/simulation-domain/tests/simulationEngine.test.ts`
- **Solución técnica**:
  - Motor de RIGI (`rigiEngine.ts`): arranque en 0/29 con catálogo estratégico de proyectos (`STRATEGIC_RIGI_PROJECTS_POOL`), cola mensual `advanceRigiMonthlyQueue` que genera propuestas al habilitar sectores y las desiste automáticamente tras 4 meses de inacción. Aprobación individual (`approveRigiProject`) o masiva (`approveAllRigiProjects`) sumando inversión acumulada, proyectos activos y madurez.
  - Intervención Federal: Formosa inicia con 6 problemáticas institucionales (`expresion`, `justicia`, `corrupcion`, `fraude`, `legislatura`, `represion`) y Santiago del Estero con 4. Contador de 24 meses continuos con $\ge 5$ problemáticas en `stepProvincesState`. Acción `INTERVENE_PROVINCE` en `PolicyActionHandler` con destitución del gobernador provincial, designación de comisionado interventor federal y convocatoria a elecciones provinciales obligatorias en 6 meses con cuenta regresiva mensual.
  - Corrección de visualización provincial: En `CampaignPartidoProvinciasView.tsx`, eliminación de la etiqueta redundante `"Tu fórmula (tu fórmula)"` mediante `formatVoteRowLabel` y ordenamiento estricto descendente en `transferAllianceVotes`, `returnAllianceVotes` y `handleExecuteAction`, asegurando que la fórmula ganadora siempre encabece el listado y la barra de intención con la insignia `¡Tu fórmula lidera!`.
  - 25 tests unitarios pasando en Vitest, auditoría determinista superada en los 69 archivos de la base de código ($CC \le 5$, $MI \ge 75$) y compilación limpia en TypeScript y Vite.

---

### FIX-009: Fase 3 Negociación Parlamentaria por Bloques en el Congreso y Paridad Territorial en Campaña
- **Commit**: `9e15ff7`
- **Archivos**:
  - `packages/simulation-domain/src/politics/congressEngine.ts`
  - `packages/simulation-domain/src/engine/PolicyActionHandler.ts`
  - `packages/simulation-domain/src/campaign/campaignEngine.ts`
  - `packages/simulation-domain/src/models/SimulationTypes.ts`
  - `packages/simulation-domain/src/index.ts`
  - `packages/simulation-domain/tests/simulationEngine.test.ts`
  - `packages/web-presentation/src/features/game-shell/CongressBillsNegotiationSection.tsx`
  - `packages/web-presentation/src/features/game-shell/CamarasLegislativasView.tsx`
  - `packages/web-presentation/src/features/campaign/ArgentinaRealVectorMap.tsx`
  - `packages/web-presentation/src/features/campaign/districtPollGenerator.ts`
  - `packages/web-presentation/src/App.tsx`
- **Solución técnica**:
  - Motor Parlamentario de Negociación por Bloques (`congressEngine.ts`):
    - Catálogo `INITIAL_PARLIAMENTARY_BLOCS` con las 7 fuerzas legislativas reales (Diputados 257 / Senado 72): `LLA` (38/7, afín 100%), `PRO` (37/6, afín 78%), `PF` (16/6, afín 55%), `PROVINCIALES` (28/7, afín 50%), `UCR` (34/13, afín 42%), `UXP` (99/33, oposición dura 10%), `FIT` (5/0, oposición dura 2%).
    - Posturas parlamentarias dinámicas: `A favor` ($\ge 60\%$), `En duda` ($35-59\%$), `En contra` ($< 35\%$).
    - 4 tipos de concesiones legislativas:
      - Obra Pública / Partidas presupuestarias (`ARGENTUMS`, 30 argentums, $+24\%$ prob).
      - Espacio en Gabinete (`GABINETE`, 10 capital político, $+28\%$ prob).
      - Pacto con Gobernadores (`GOBERNADORES`, $+35\%$ prob en peronismo federal y provinciales).
      - Suavizar articulado del proyecto (`SUAVIZAR`, $+15\%$ probabilidad transversal).
    - Simulación nominal de votación en recinto (`simulateChamberVote`, `executeFullCongressVote`): Quórum y mayoría calificada estricta (129 en Diputados, 37 en Senadores). Si ambas cámaras aprueban, la ley queda sancionada; si alguna rechaza, queda bloqueada con su respectivo dictamen.
    - Acción `ENACT_CONGRESS_BILL` en `PolicyActionHandler`: actualiza PBI, riesgo país, superávit fiscal y aprobación presidencial en el estado de gobierno, registrando la sanción oficial en el historial.
  - UI de Cámaras Legislativas (`CamarasLegislativasView.tsx` y `CongressBillsNegotiationSection.tsx`):
    - Navegación entre solapas: `Rosca y votación de leyes` y `Composición y bancas (257 Dip / 72 Sen)`.
    - Tarjetas de proyección en tiempo real para Diputados y Senado con barras de progreso hacia los umbrales de quórum de 129 y 37.
    - Selector de proyectos de ley (`Ley Bases 2.0`, `Presupuesto Déficit Cero`, `Reforma Laboral`, `Pacto Fiscal Federal`, `Intervención Federal`).
    - Grilla de tarjetas de bloques con botones de concesión y botón principal "Llevar a votación en el recinto".
    - Modal de escrutinio parlamentario (`VoteResultModal`) con el desglose exacto de votos afirmativos, negativos y abstenciones por bloque y cámara.
  - Corrección de bugs territoriales en campaña:
    - Popup de La Pampa: Desacoplado del preset estático del PRO. Cuando el jugador compite por LLA, el mapa vectorial proyecta la interna oficialista real (Javier Milei, Victoria Villarruel, Patricia Bullrich, Santiago Caputo).
    - Recomposición paulatina de campaña: `decayProvincesFatigue` y `decayLocalZonesFatigue` en `advanceCampaignMonth` reducen la fatiga acumulada por visitas mes a mes, restaurando gradualmente la efectividad de las recorridas territoriales.
  - Calidad de software: 26 tests unitarios pasando en Vitest, auditoría determinista superada en los 71 archivos del proyecto ($CC \le 5$, $MI \ge 75$) y compilación TypeScript/Vite libre de errores.

---

### FIX-010: Fase 4 Parser Semántico, Combate Militar Sigmoide, Escrutinio Matemático 100% y Gabinete Inaugural Vacante
- **Commit**: En preparación
- **Archivos**:
  - `packages/simulation-domain/src/engine/semanticParserEngine.ts`
  - `packages/simulation-domain/src/politics/militaryTheaterEngine.ts`
  - `packages/simulation-domain/src/campaign/politicalAffinityEngine.ts`
  - `packages/simulation-infrastructure/src/datasets/partiesAndPoliticians2027.ts`
  - `packages/web-presentation/src/features/campaign/ElectionNightModal.tsx`
  - `packages/web-presentation/src/features/campaign/ElectionResultsSvgMap.tsx`
  - `packages/web-presentation/src/features/campaign/ArgentinaRealVectorMap.tsx`
  - `packages/web-presentation/src/features/campaign/CampaignPartidoProvinciasView.tsx`
  - `packages/web-presentation/src/features/game-shell/CabinetView.tsx`
  - `packages/web-presentation/src/features/game-shell/MinisterReplacementModal.tsx`
  - `packages/web-presentation/src/features/game-shell/BudgetAndTaxesView.tsx`
  - `packages/web-presentation/src/App.tsx`
  - `packages/simulation-domain/tests/fase4Engines.test.ts`
- **Solución técnica**:
  - Mapa vectorial en Noche Electoral (`ElectionResultsSvgMap.tsx`): Integración del mapa SVG interactivo de la República Argentina con los 24 distritos coloreados con la fuerza ganadora del escrutinio y tooltips dinámicos con conteo en vivo.
  - Escrutinio oficial matemáticamente congruente (`ElectionNightModal.tsx`):
    - Se eliminaron las 5 filas estáticas que generaban sumatorias del $119.2\%$.
    - `distributeRivalShares` y `resolveRivalTickets` garantizan que la sumatoria total sea exactamente del $100.0\%$, sin fórmulas repetidas y excluyendo a socios de la coalición del jugador de las candidaturas rivales.
    - Bloqueo en `politicalAffinityEngine.ts` de alianzas inverosímiles entre polos opuestos (`LLA`/`PRO` vs `UxP`/`FIT`).
  - RIGI inicial 0 de 29: Reseteo estricto a `INITIAL_RIGI_SECTORS` (`enabledByDecree: false` en los 29 sectores) al crear o asumir mandato, eliminando cualquier estado residual en `localStorage`.
  - Gabinete presidencial inaugural vacante (`CabinetView.tsx`, `INITIAL_VACANT_CABINET_2027`):
    - Al asumir la presidencia, los 10 ministerios arrancan en estado `'Vacante (A designar)'` con etiqueta `SIN DESIGNAR`.
    - Banner inaugural: *"¡Asumiste la Presidencia! Es momento de armar tu equipo de gobierno"*, con contador de carteras cubiertas y botón directo *"Designar ministro"* para seleccionar candidatos de su propio partido o socios de coalición.
  - Fase 4 - Parser Semántico (`semanticParserEngine.ts`):
    - Evaluación en vivo en `BudgetAndTaxesView.tsx` (`Impuestos Propios`): clasificación ideológica (`LIBERAL`, `ESTATISTA`, `PRAGMATICO`), detección de metas (inflación, inversión, empleo, recaudación, pobreza), cálculo de resistencia parlamentaria y alerta constitucional por confiscatoriedad si la alícuota supera el 35%.
  - Fase 4 - Teatros Militares y Combate Sigmoide (`militaryTheaterEngine.ts`):
    - Fórmula sigmoide $\sigma(z) = \frac{1}{1 + e^{-z}}$ para resolución de combates aeronavales y terrestres en los 4 teatros (`Frontera Norte`, `Rosario y Conurbano`, `Atlántico Sur Milla 200`, `Malvinas y Antártida`).
    - Despliegues operativos (`PATRULLA`, `SATURACION`) y orden de anexión territorial y soberanía plena al superar el 90% de control territorial.
  - Disciplina de calidad: 36 tests pasando en Vitest, auditoría de complejidad superada en los 74 archivos ($CC \le 5$, $MI \ge 75$) y build de Vite exitoso.
- **Archivos**:
  - `packages/simulation-domain/src/politics/congressEngine.ts`
  - `packages/simulation-domain/src/engine/PolicyActionHandler.ts`
  - `packages/simulation-domain/src/campaign/campaignEngine.ts`
  - `packages/simulation-domain/src/models/SimulationTypes.ts`
  - `packages/simulation-domain/src/index.ts`
  - `packages/simulation-domain/tests/simulationEngine.test.ts`
  - `packages/web-presentation/src/features/game-shell/CongressBillsNegotiationSection.tsx`
  - `packages/web-presentation/src/features/game-shell/CamarasLegislativasView.tsx`
  - `packages/web-presentation/src/features/campaign/ArgentinaRealVectorMap.tsx`
  - `packages/web-presentation/src/features/campaign/districtPollGenerator.ts`
  - `packages/web-presentation/src/App.tsx`
- **Solución técnica**:
  - Motor Parlamentario de Negociación por Bloques (`congressEngine.ts`):
    - Catálogo `INITIAL_PARLIAMENTARY_BLOCS` con las 7 fuerzas legislativas reales (Diputados 257 / Senado 72): `LLA` (38/7, afín 100%), `PRO` (37/6, afín 78%), `PF` (16/6, afín 55%), `PROVINCIALES` (28/7, afín 50%), `UCR` (34/13, afín 42%), `UXP` (99/33, oposición dura 10%), `FIT` (5/0, oposición dura 2%).
    - Posturas parlamentarias dinámicas: `A favor` ($\ge 60\%$), `En duda` ($35-59\%$), `En contra` ($< 35\%$).
    - 4 tipos de concesiones legislativas:
      - Obra Pública / Partidas presupuestarias (`ARGENTUMS`, 30 argentums, $+24\%$ prob).
      - Espacio en Gabinete (`GABINETE`, 10 capital político, $+28\%$ prob).
      - Pacto con Gobernadores (`GOBERNADORES`, $+35\%$ prob en peronismo federal y provinciales).
      - Suavizar articulado del proyecto (`SUAVIZAR`, $+15\%$ probabilidad transversal).
    - Simulación nominal de votación en recinto (`simulateChamberVote`, `executeFullCongressVote`): Quórum y mayoría calificada estricta (129 en Diputados, 37 en Senadores). Si ambas cámaras aprueban, la ley queda sancionada; si alguna rechaza, queda bloqueada con su respectivo dictamen.
    - Acción `ENACT_CONGRESS_BILL` en `PolicyActionHandler`: actualiza PBI, riesgo país, superávit fiscal y aprobación presidencial en el estado de gobierno, registrando la sanción oficial en el historial.
  - UI de Cámaras Legislativas (`CamarasLegislativasView.tsx` y `CongressBillsNegotiationSection.tsx`):
    - Navegación entre solapas: `Rosca y votación de leyes` y `Composición y bancas (257 Dip / 72 Sen)`.
    - Tarjetas de proyección en tiempo real para Diputados y Senado con barras de progreso hacia los umbrales de quórum de 129 y 37.
    - Selector de proyectos de ley (`Ley Bases 2.0`, `Presupuesto Déficit Cero`, `Reforma Laboral`, `Pacto Fiscal Federal`, `Intervención Federal`).
    - Grilla de tarjetas de bloques con botones de concesión y botón principal "Llevar a votación en el recinto".
    - Modal de escrutinio parlamentario (`VoteResultModal`) con el desglose exacto de votos afirmativos, negativos y abstenciones por bloque y cámara.
  - Corrección de bugs territoriales en campaña:
    - Popup de La Pampa: Desacoplado del preset estático del PRO. Cuando el jugador compite por LLA, el mapa vectorial proyecta la interna oficialista real (Javier Milei, Victoria Villarruel, Patricia Bullrich, Santiago Caputo).
    - Recomposición paulatina de campaña: `decayProvincesFatigue` y `decayLocalZonesFatigue` en `advanceCampaignMonth` reducen la fatiga acumulada por visitas mes a mes, restaurando gradualmente la efectividad de las recorridas territoriales.
  - Calidad de software: 26 tests unitarios pasando en Vitest, auditoría determinista superada en los 71 archivos del proyecto ($CC \le 5$, $MI \ge 75$) y compilación TypeScript/Vite libre de errores.

