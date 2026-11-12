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
