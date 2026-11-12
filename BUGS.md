# BUGS.md — Registro Central de Incidentes y Desvíos de La Rosca

Este documento recopila y cataloga todos los bugs, desvíos respecto a *¿Quién quiere gobernar?* (QQG) y fallas de experiencia de usuario detectadas durante el desarrollo de la simulación.

---

## Índice de Estados
- 🔴 **ABIERTO / PENDIENTE**: Identificado pero aún no implementado en código.
- 🟡 **EN PROCESO**: En desarrollo o verificación técnica.
- 🟢 **RESUELTO**: Implementado, probado y commiteado en el repositorio principal.

---

## 1. Persistencia y Ciclo de Vida de Partida

### [BUG-001] Pérdida de estado al recargar la página (F5 vuelve al inicio)
- **Severidad**: Crítica.
- **Descripción**: Al apretar F5 o recargar el navegador, el estado de la campaña y de la simulación se reiniciaba al menú de inicio por falta de sincronización reactiva en `localStorage`.
- **Estado**: 🟢 RESUELTO (Commit `b535b44` / `d596495`).
- **Impacto**: La partida se autoguarda por mes y acción en `localStorage` y se puede restaurar con el código de partida de 12 dígitos.

### [BUG-002] El personaje creado se reemplaza por un político real cualquiera
- **Severidad**: Crítica.
- **Descripción**: Al terminar el creador de personajes, la simulación pisaba el avatar, nombre e ideología con un dirigente predeterminado del catálogo (ej. Milei, Macri, Cristina).
- **Estado**: 🟢 RESUELTO (Commit `d596495`).
- **Impacto**: `customCandidate` se vincula con prioridad 1 en el estado de simulación.

---

## 2. Sistema Electoral y de Campaña

### [BUG-003] Confirmar candidatura no se guardaba ni afectaba la competencia
- **Severidad**: Alta.
- **Descripción**: El switch de "Confirmar candidatura" no persistía en el state, no descontaba recursos ni impedía que otro dirigente encabezara la boleta de tu propio espacio.
- **Estado**: 🟢 RESUELTO (Commit `d596495`).
- **Impacto**: Bloquea que un tercero te represente una vez confirmada la postulación propia.

### [BUG-004] Apoyos políticos eran un toggle instantáneo ("Apoyo asegurado") sin algoritmo
- **Severidad**: Alta.
- **Descripción**: Tanto en Apoyos Nacionales como en Apoyo en Provincias, tocar el botón sumaba al intendente/referente inmediatamente sin calcular afinidad ni probabilidad de rechazo.
- **Estado**: 🟢 RESUELTO (Commit `b05a353`).
- **Impacto**: Se incorporó el motor estocástico `computeLeaderEffectiveProb` con afinidad ideológica, imagen positiva y rasgo Dialoguista vs Dogmático.

### [BUG-005] Falta de cooldown de 5 meses tras el rechazo de un dirigente
- **Severidad**: Media.
- **Descripción**: Si un político no aceptaba apoyar, se podía volver a clickear indefinidamente en el mismo turno.
- **Estado**: 🟢 RESUELTO (Commit `b05a353`).
- **Impacto**: Si rechaza, se clava un cooldown estricto de 5 meses en `politicianCooldowns`.

### [BUG-006] Coaliciones sin límite de 2 partidos y sin validación de compatibilidad
- **Severidad**: Alta.
- **Descripción**: Se podían sumar infinitas fuerzas a la coalición, incluso fuerzas extremas con afinidad cero o negativa.
- **Estado**: 🟢 RESUELTO (Commit `d596495` y `b05a353`).
- **Impacto**: Límite estricto de hasta 2 partidos aliados tanto a nivel nacional como distrital.

### [BUG-007] La interna de un partido mostraba dirigentes de otros partidos en el mapa
- **Severidad**: Media.
- **Descripción**: Al jugar con La Libertad Avanza (o partido propio), el popup del mapa de interna en La Pampa mostraba a Macri, Torres, Vidal y Larreta (candidatos del PRO).
- **Estado**: 🟢 RESUELTO (Commit `e69b915`).
- **Impacto**: Vinculación dinámica con `internalCandidates` del estado de simulación.

### [BUG-008] En provincias donde el jugador lidera, aparecía segundo y sin cartel
- **Severidad**: Media.
- **Descripción**: En Tierra del Fuego (y otras provincias), teniendo 36,8 % vs 29,6 % de Provincias Unidas, la lista y la barra mostraban primero a Provincias Unidas y faltaba el cartel de victoria.
- **Estado**: 🟢 RESUELTO (Commit `b05a353`).
- **Impacto**: Ordenamiento descendente (`sortedShares`), primer puesto automático, barra con color propio y etiqueta `¡Tu fórmula lidera!`.

### [BUG-009] Solapa "Coalición" en el comando provincial vacía ("no aparece nadie")
- **Severidad**: Media.
- **Descripción**: Al entrar a la solapa Coalición de una provincia, solo había un texto estático sin lista de fuerzas locales ni botones para acordar.
- **Estado**: 🟢 RESUELTO (Commit `b05a353`).
- **Impacto**: Grid interactivo con todas las fuerzas distritales, cálculo de aporte electoral (+X %) y absorción directa de votos a la fórmula provincial.

### [BUG-010] Acciones de campaña sin degradación por fatiga ni visitas repetidas
- **Severidad**: Alta.
- **Descripción**: Repetir recorridas o actos en una misma provincia rendía siempre el 100 % sin reflejar el desgaste que tiene QQG (`+2,4/+9,7` cayendo a `0/+1,2`).
- **Estado**: 🟢 RESUELTO (Commit `b05a353`).
- **Impacto**: Escalamiento dinámico de píldoras y multiplicador de fatiga que disminuye con el uso continuo y se recupera mes a mes.

---

## 3. Despacho y Gestión de Gobierno (Presidencia / Gobernación)

### [BUG-011] RIGI iniciaba con 29/29 proyectos habilitados de fábrica
- **Severidad**: Media.
- **Descripción**: Al asumir como Presidente el RIGI venía completamente prendido en lugar de arrancar vacío (`rigi: {}`) para ser habilitado proyecto a proyecto.
- **Estado**: 🟢 RESUELTO (Commit `d596495`).
- **Impacto**: El RIGI arranca en 0/29 y el jugador decide cuándo y qué sector activar.

### [BUG-012] Relación diplomática con partidos modificable a mano
- **Severidad**: Media.
- **Descripción**: Las relaciones partidarias no deben ser un slider manual sino una derivación matemática de las medidas tomadas y el sesgo ideológico.
- **Estado**: 🟢 RESUELTO (Commit `d596495`).
- **Impacto**: Ledger diplomático automatizado por medidas y acciones.

### [BUG-013] Saltos ilógicos en el cronograma electoral (ej. 2027 a 2030 sin turnos)
- **Severidad**: Alta.
- **Descripción**: Las elecciones provinciales no seguían el esquema de turnos constitucionales escalonados.
- **Estado**: 🟢 RESUELTO (Commit `d596495`).
- **Impacto**: Motor `electionCalendarEngine` con las 24 provincias agrupadas en 4 turnos de 6 distritos (2028, 2029, 2030, 2031).

### [BUG-014] Falta de asignación de Gabinete con correspondencia de rol
- **Severidad**: Media.
- **Descripción**: Al asumir, se podía colocar cualquier dirigente en cualquier ministerio sin validar afinidad ni idoneidad sectorial (ej. Patricia Bullrich en Capital Humano en vez de Seguridad).
- **Estado**: 🟢 RESUELTO (Commit `d596495`).
- **Impacto**: Validación de área ministerial y ponderación de idoneidad y lealtad.

---

## 4. Requerimientos de Paridad 1:1 con QQG (En Hoja de Ruta)

### [FEAT-001] Inercia de 3-6 meses en inflación y productoria geométrica interanual de 12 meses
- **Severidad**: Alta (Fidelidad Macroeconómica).
- **Descripción**: La inflación mensual no debe impactar de golpe al mes siguiente sino suavizarse con una inercia de 3-6 meses y acumular un historial de 12 meses para la productoria anual.
- **Estado**: 🟡 EN PLANIFICACIÓN.

### [FEAT-002] Feedback dinámico Reservas $\rightarrow$ Brecha (penalizaciones 15 % y 25-30 %) $\rightarrow$ Corrida suave
- **Severidad**: Alta (Régimen Cambiario).
- **Descripción**: Al caer las reservas brutas/netas, la brecha debe disparar no linealmente empujando dólar, precios y destruyendo confianza.
- **Estado**: 🟡 EN PLANIFICACIÓN.

### [FEAT-003] Flujo dinámico de RIGI con cola `rigiPending`, sectores y desistimiento por tiempo
- **Severidad**: Media (Módulo RIGI).
- **Descripción**: Habilitar sectores productivos para que generen proyectos pendientes con `minUsd` que pueden aprobarse o desistir si expiran.
- **Estado**: 🟡 EN PLANIFICACIÓN.

### [FEAT-004] Negociación de leyes bloque por bloque con posturas (a favor / en duda / en contra) y concesiones
- **Severidad**: Alta (Módulo Congreso).
- **Descripción**: Negociar con jefes de bloque ofreciendo partidas en Argentum, ministerios en Gabinete o suavización de artículos.
- **Estado**: 🟡 EN PLANIFICACIÓN.

### [FEAT-005] Catálogo de 6 problemáticas institucionales de Intervención Federal con Formosa y Santiago
- **Severidad**: Media (Módulo Político / Territorio).
- **Descripción**: Formosa inicia con 6 problemáticas institucionales (`expresion`, `justicia`, `corrupcion`, `fraude`, `legislatura`, `represion`) y Santiago con 4. Al cumplir 2 años continuos con $\ge 5$, se habilita el envío de ley de intervención al Congreso.
- **Estado**: 🟡 EN PLANIFICACIÓN.

### [FEAT-006] Combate militar con sigmoide ponderada y anexión territorial al superar el 90 %
- **Severidad**: Media (Módulo Territorio / Militar).
- **Descripción**: Resolución de conflictos con $\sigma(\Delta \text{poder} + \text{gasto} + \text{control\_previo} + \text{bloque} - \text{defensa})$ y absorción definitiva del país enemigo.
- **Estado**: 🟡 EN PLANIFICACIÓN.

### [FEAT-007] Parser semántico (regex + scoring) para Leyes Propias e Impuestos Propios
- **Severidad**: Media (Módulo Legislativo / Tributario).
- **Descripción**: Formulario de texto libre que analiza dirección, variables afectadas, financiamiento y emite alertas de inviabilidad.
- **Estado**: 🟡 EN PLANIFICACIÓN.

