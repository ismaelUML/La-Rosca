# Registro Oficial de Bugs y Desviaciones del Simulador Argentino 2027

> Documento generado a partir del relevamiento de fallas funcionales, inconsistencias de simulación y discrepancias con las capturas de referencia del usuario.

---

## 1. BUG-01: Selección de "Mi personaje" inicializa como político real predeterminado
- **Severidad**: Alta (Bloqueante de inmersión / UX).
- **Componente**: `packages/web-presentation/src/features/party-setup/NewGameSetupScreen.tsx` y `App.tsx`.
- **Comportamiento Actual**:
  - Al marcar la opción "Mi personaje" e ingresar un nombre personalizado (ej. "Ana Rivas"), el motor arranca la partida asignando por defecto los datos y el ID de un político real (Mauricio Macri / `MAURICIO_MACRI`).
  - Los atributos personales del candidato (`inteligenciaPercibida`, `convencimiento`, `relevancia`, `apoyoPartidario`) se pisan o no se transfieren al `CampaignSimulationState`.
- **Comportamiento Esperado**:
  - Si `characterMode === 'MI_PERSONAJE'`, el candidato debe generarse con un ID único (`CUSTOM_${Date.now()}`), con el nombre exacto escrito por el jugador, su insignia partidaria propia y un set de atributos iniciales balanceados según la dificultad elegida, sin referenciar a ningún político preexistente.

---

## 2. BUG-02: Acciones de campaña sin fatiga ni rendimientos decrecientes
- **Severidad**: Media-Alta (Gameplay desbalanceado).
- **Componente**: `packages/simulation-domain/src/campaign/campaignEngine.ts` y `CampaignActionsView.tsx`.
- **Comportamiento Actual**:
  - Un jugador puede spamear 10 veces la misma acción ("Entrevista" o "Publicidad") en el mismo mes o en meses consecutivos y obtiene siempre el 100 % del impacto proyectado.
- **Comportamiento Esperado**:
  - **Rendimientos decrecientes**: Cada vez que se ejecuta una acción, su efectividad marginal disminuye por saturación de agenda (`factor = 1 / (1 + 0.45 * usosRecientes)`).
  - **Recuperación mes a mes**: Al avanzar de turno, el desgaste decae progresivamente hasta restaurar los valores nominales originales de la tarjeta.

---

## 3. BUG-03: Módulo de Apoyos sin rechazos reales ni cooldown ante negativas
- **Severidad**: Media.
- **Componente**: `packages/simulation-domain/src/campaign/politicalAffinityEngine.ts` y `CampaignApoyosView.tsx`.
- **Comportamiento Actual**:
  - Si se invita a un dirigente a tu partido o se le pide apoyo, el switch no almacena rechazo formal y permite volver a intentar en el mismo turno o inmediatamente después sin consecuencias.
- **Comportamiento Esperado**:
  - Si la figura rechaza la propuesta (probabilidad < tirada PRNG o incompatibilidad ideológica insalvable), la figura entra en **cooldown estricto de 5 meses**.
  - Durante esos 5 meses el interruptor y el botón de invitación deben figurar deshabilitados con la leyenda: `Rechazó la propuesta · Disponible en X meses`.

---

## 4. BUG-04: Confirmar candidatura es un botón sin efecto ni persistencia
- **Severidad**: Media.
- **Componente**: `packages/web-presentation/src/features/campaign/CampaignCoalicionesView.tsx`.
- **Comportamiento Actual**:
  - Tocar "Confirmar candidatura" no persiste en `localStorage` ni modifica variables del motor; es meramente decorativo.
- **Comportamiento Esperado**:
  - Debe guardar `isCandidacyConfirmed: true` en el estado de la campaña.
  - Al confirmarse: consolida el apoyo partidario (+5 pp), bloquea que otros dirigentes del partido compitan por la misma fórmula presidencial y penaliza fuertemente (-15 pp de imagen) si el jugador intenta bajarse o cambiar de partido más adelante.

---

## 5. BUG-05: Falta de exclusividad de candidatura y coaliciones sin tope
- **Severidad**: Media-Alta.
- **Componente**: `CampaignCoalicionesView.tsx` y `campaignEngine.ts`.
- **Comportamiento Actual**:
  - Si el jugador confirma su candidatura, la interfaz aún permite que un tercero lo represente en la misma boleta.
  - Se pueden agregar ilimitados partidos a la coalición, desvirtuando el mapa político real.
- **Comportamiento Esperado**:
  - Si el jugador confirma su postulación, queda fijado como cabeza de fórmula.
  - Se restringe la alianza a un **máximo estricto de 2 partidos aliados** (3 sellos en total contando el propio). Al intentar sumar un 3°, el sistema bloquea la acción indicando que la legislación electoral y la rosca interna impiden frentes más amplios sin fractura.

---

## 6. BUG-06: Aceptación de apoyos plana e insensible al humor social
- **Severidad**: Media.
- **Componente**: `packages/simulation-domain/src/campaign/politicalAffinityEngine.ts`.
- **Comportamiento Actual**:
  - Las probabilidades de apoyo son fijas y no consideran el contexto nacional ni la distancia ideológica real.
- **Comportamiento Esperado**:
  - La probabilidad debe depender dinámicamente de:
    1. Distancia ideológica euclidiana (Eje Económico y Eje Cultural).
    2. Rasgo del dirigente (`DIALOGUISTA` tolera distancias de hasta 35 pts; `DOGMÁTICO` rechaza automáticamente si la distancia supera 20 pts).
    3. `countryMood` (inflación, desempleo, aprobación presidencial). Ningún caudillo provincial apoya a un candidato que cae en picada.

---

## 7. BUG-07: Selección de gabinete sin filtro de coalición ni idoneidad de rol
- **Severidad**: Media-Alta.
- **Componente**: `packages/web-presentation/src/features/game-shell/CabinetView.tsx` e infraestructura de ministros.
- **Comportamiento Actual**:
  - El gabinete viene predeterminado y permite recambios genéricos sin validar si el dirigente pertenece al partido gobernante o a los socios de la coalición, pudiendo colocar a cualquier figura en cualquier cartera.
- **Comportamiento Esperado**:
  - Solo se pueden designar ministros de: **tu propio partido** o de **los partidos con los que cerraste coalición**.
  - Idoneidad por área: cada figura política debe tener asignado su campo de especialización (Seguridad, Economía, Relaciones Exteriores, etc.). Designar a una figura fuera de su especialidad (ej. Bullrich en Capital Humano en vez de Seguridad) acarrea penalización de desempeño inicial y riesgo de crisis de gestión.

---

## 8. BUG-08: RIGI arranca con los 29 sectores habilitados al 100 %
- **Severidad**: Alta (Error de diseño histórico y macroeconómico).
- **Componente**: `packages/simulation-infrastructure/src/datasets/partiesAndPoliticians2027.ts`.
- **Comportamiento Actual**:
  - Al comenzar la presidencia, los 29 sectores del RIGI figuran con `enabledByDecree: true` (29 de 29 activos con madurez y proyectos en marcha).
- **Comportamiento Esperado**:
  - Al asumir en diciembre de 2027, el RIGI debe comenzar en **0 de 29 sectores habilitados** (`0/29`).
  - El Presidente debe emitir los Decretos Reglamentarios sector por sector (Cobre, Litio, GNL, Vaca Muerta, etc.) evaluando el costo fiscal y el riesgo de conflictividad local.

---

## 9. BUG-09: Alícuotas de impuestos descalibradas de los valores reales
- **Severidad**: Media.
- **Componente**: `packages/simulation-infrastructure/src/datasets/initialState2027Factory.ts`.
- **Comportamiento Actual**:
  - Algunos porcentajes de impuestos diferían de las alícuotas efectivas vigentes en el régimen tributario nacional.
- **Comportamiento Esperado**:
  - Alinear los 17 impuestos oficiales a sus porcentajes reales actuales (Retenciones Soja 33%, Trigo/Maíz 12%, IVA 21%, Ganancias Sociedades 35%, Débitos y Créditos 0,6%, etc.).

---

## 10. BUG-10: Capacidad de negociación y bancadas iniciales infladas
- **Severidad**: Media.
- **Componente**: `initialState2027Factory.ts` y `CamarasLegislativasView.tsx`.
- **Comportamiento Actual**:
  - El Presidente arranca con capacidad de negociación de 99,9 y una bancada propia dominante (154 diputados y 51 senadores).
- **Comportamiento Esperado**:
  - La capacidad de negociación debe arrancar baja/moderada (35 a 45 puntos sobre 100).
  - Las bancadas iniciales deben reflejar la fragmentación parlamentaria real de minoría (ej. 38 diputados y 7 senadores propios si se emula el escenario 2023-2027), obligando a negociar con aliados y provincialistas para alcanzar quórum.

---

## 11. BUG-11: Relación con bloques partidarios no automatizada
- **Severidad**: Media.
- **Componente**: `CamarasLegislativasView.tsx`.
- **Comportamiento Actual**:
  - La columna de relación con cada fuerza no respondía dinámicamente a los decretos y medidas de gobierno.
- **Comportamiento Esperado**:
  - El jugador no puede alterar la relación de forma directa con un slider o botón: la relación debe ser un cálculo emergente automático derivado de la afinidad ideológica de las medidas aplicadas, las transferencias a gobernadores y los vetos presidenciales.

---

## 12. BUG-12: Partido en las Provincias reducido a botón genérico y sin turnos cronológicos reales
- **Severidad**: Alta (Discrepancia total con las capturas de referencia).
- **Componente**: `CampaignPartidoProvinciasView.tsx`.
- **Comportamiento Actual**:
  - Solo permitía tocar un botón de "Reforzar campaña" con turnos fijos 2030-2033, sin contemplar que la elección nacional es en 2027 y los mandatos provinciales vencen a partir de 2028.
  - No mostraba el desglose de intención de voto multi-partidario por barras apiladas, ni la elección de Gobernador y Vicegobernador provincial.
- **Comportamiento Esperado (Capturas 2, 3, 4 y 5)**:
  - **Cronograma real argentino**: Turno 2028 (Tierra del Fuego, Misiones, La Pampa, Mendoza, Chaco, Buenos Aires con fórmulas abiertas desde 2027), Turno 2029 (Jujuy, Tucumán, Córdoba, San Luis, Corrientes, Santiago del Estero), Turno 2030 y Turno 2031.
  - **Gráfico de barras apiladas / multi-partido**: Visualización de intención de voto por fuerza (Provincias Unidas, LLA, UxP, fuerzas locales, FIT, UCR, etc.).
  - **Selectores de Fórmula Provincial**: Dropdowns interactivos para designar Gobernador y Vicegobernador según los dirigentes locales de tu fuerza.
  - **Manejo de campaña provincial profunda**: Presupuesto propio asignado por distrito, tabs de `Campaña (4 acciones)`, `Coalición` y `Perfil del candidato`.
