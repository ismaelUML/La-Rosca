# Hoja de Ruta y Auditoría Crítica de Simulación (La Rosca 2027)

> **Documento de Auditoría y Prioridades Operativas**
> Extraído y formalizado a partir del análisis crítico de balance, arquitectura de software y experiencia de juego.

---

## 1. Cambiaría (Lo más urgente)

### 1.1 Balance del Motor Macroeconómico (Eliminación de Atractores Pasivos)
- **Diagnóstico Crítico:** Un jugador que no toca absolutamente ninguna medida ni palanca macro puede cruzar los 48 meses y terminar el mandato sin caerse. La inflación mensual converge automáticamente hacia un atractor artificial de $\approx 2,3\%$, mientras que la aprobación presidencial y el humor social tienden a recuperarse solos en todas las dificultades.
- **Acción Requerida:**
  - Desarmar los atractores de convergencia pasiva en `inflationEngine.ts` y `SimulationEngine.ts`.
  - Implementar **inercia inflacionaria real** (3 a 6 meses de memoria inercial dependiente de emisión rezagada, devaluación y expectativas).
  - Hacer que el **déficit fiscal consuma reservas internacionales brutas y líquidas de forma acumulativa mes a mes** si el Tesoro no financia la brecha ni recorta gasto primario.
  - Que cada nivel de dificultad (`VIENTO_DE_COLA`, `ESTANDAR_2027`, `TORMENTA_PERFECTA`) modifique la **dinámica diferencial de las ecuaciones diferenciales/recurrentes** (elasticidad de demanda, velocidad de fuga de capitales, rigidez de gasto), y no únicamente el vector de condiciones iniciales del mes 1.

---

### 1.2 Desconexión entre Campaña y Gobierno
- **Diagnóstico Crítico:** `startPresidentialGovernment` inicializa el estado de gobierno recibiendo únicamente `rol`, `dificultad` y `provincia`. Todo el esfuerzo político de la campaña (socios de coalición, candidato a vicepresidente elegido, apoyos territoriales negociados, caudal de votos en primera vuelta y balotaje) queda huérfano y no impacta en el Congreso ni en la gobernabilidad.
- **Acción Requerida:**
  - Diseñar el puente `startPresidentialGovernmentFromCampaign(campaignState)`.
  - **Reparto de bancas:** El caudal electoral y los partidos de la coalición deben alimentar la composición de Diputados (257) y Senadores (72), otorgando quórum propio o forzando negociación según la amplitud del frente.
  - **Compromisos de Gabinete:** Si ganaste en coalición con PRO o UCR, exigir cuotas ministeriales reservadas (ej. Economía, Interior o Defensa); incumplirlas debe romper el bloque legislativo y encarecer las leyes.

---

### 1.3 Mover Gabinete, Medidas, RIGI e Impuestos al Dominio Puro
- **Diagnóstico Crítico:** Variables de estado críticas como `ministers`, `measures`, `rigiSectors`, `customTaxes` y `rigiPending` viven dispersas en el estado local de React (`useState` en `App.tsx`), por fuera de `SimulationState`.
- **Acción Requerida:**
  - Migrar `ministers`, `measures`, `rigiSectors`, `customTaxes` y `rigiPending` adentro de la interfaz `SimulationState` en `@argentina-sim/domain`.
  - Esto habilita que los eventos de crisis (CGT, corridas, causas judiciales) puedan forzar renuncias de ministros (`onDismissMinister`), frenar proyectos RIGI por cautelares judiciales, o derogar medidas sectoriales por falta de presupuesto en el motor de dominio sin depender del ciclo de vida de React.

---

### 1.4 Elecciones Nacionales al Dominio
- **Diagnóstico Crítico:** La noche electoral y el escrutinio provincial residen en `ElectionNightModal.tsx`, calculando porcentajes contra un único rival predefinido en la capa de presentación.
- **Acción Requerida:**
  - Migrar el escrutinio, sistema D'Hondt y balotaje hacia un motor puro de dominio (`electoralNightEngine.ts`).
  - Competir contra un tablero multipartidario real (LLA, UxP, PRO, UCR, Provincias Unidas, FIT) con traspaso de votos en segunda vuelta según afinidades ideológicas.

---

### 1.5 Eliminación de `Math.random()` y Persistencia de Negociación Territorial
- **Diagnóstico Crítico:** `CampaignApoyoProvinciasView` utilizaba `Math.random()`, y los contadores de cooldown por rechazo de dirigentes quedaban en estado local efímero, perdiéndose al recargar la página.
- **Acción Requerida:**
  - Utilizar exclusivamente `rollNegotiation` con funciones de hashing determinista pseudoaleatorio alimentadas por semilla (`${leader.id}-${state.stage.currentMonthIndex}`).
  - Persistir `politicianCooldowns` y registros de adhesión en `CampaignSimulationState.diplomacy`.

---

## 2. Agregaría (Nuevas Capacidades Clave)

1. **Catálogo Extendido de Eventos Encadenados:**
   - Escalar de 11 a más de 40 situaciones de gobierno con consecuencias diferidas (ej. filtración de audios o sobreprecios que explotan en un juicio político o procesamiento 6 meses después).
   - Eventos condicionados al perfil del ministro del área y al quórum del Congreso.
2. **Dilemas de Campaña Completos:**
   - Expandir los dilemas mensuales de campaña para cubrir el cronograma completo de 12 meses de campaña (actualmente solo en meses 5, 7 y 9).
3. **Rol Gobernador Provincial:**
   - Aprovechar las 24 provincias ya modeladas, el motor de coparticipación federal, ATN y endeudamiento subnacional para habilitar la campaña y mandato como mandatario provincial.
4. **Rivales Electorales Activos:**
   - Fuerzas opositoras que ejecutan actos de campaña, sellan alianzas entre sí y capitalizan los errores del jugador en el debate o en el territorio.
5. **Mandato con Hitos Estructurados:**
   - En lugar de 48 meses idénticos, incorporar hitos de calendario:
     - **Marzo:** Apertura de sesiones ordinarias del Congreso y paritarias docentes/estatales calientes.
     - **Septiembre:** Envío del Presupuesto Nacional.
     - **Mes 24 (Octubre año 2):** Elecciones legislativas de medio término que renuevan un tercio del Senado y la mitad de la Cámara de Diputados.
6. **Cierre de Partida y Resumen Compartible:**
   - Pantalla de desenlace con opción de reinicio inmediato y generación de tarjeta/código exportable con el balance histórico del mandato.
7. **Guía y Tutorial In-Game:**
   - Asistente de inicio rápido ("Qué hacer este mes") para guiar al jugador en su primer turno.
8. **Test de Balance Automatizado en CI/CD:**
   - Simulación headless automática de 48 meses ejecutada en Vitest con 3 perfiles arquetípicos:
     - *Pasivo:* No toma ninguna medida ni altera palancas.
     - *Agresivo:* Shock total de gasto o ajuste desmedido.
     - *Racional:* Balance fiscal con contención social.

---

## 3. Expandiría (Profundización de Mecánicas Existentes)

1. **Mesa de Dinero, Deuda y Energía:**
   - Conectar las corridas cambiarias y la tensión de reservas directamente con el balance del BCRA, el rollover de deuda en pesos (Lecaps/Bonos) y el riesgo de apagones en picos de verano/invierno.
2. **Rosca Parlamentaria y Costo Político:**
   - Pasar de negociaciones aisladas a un sistema de favores, compromisos y traiciones que perduren a lo largo del mandato parlamentario.
3. **Opinión Pública, Relato y Prensa:**
   - Incorporar impacto mediático de conferencias diarias, operaciones de prensa y conferencias de gabinete sobre los segmentos sociales.

---

## 4. Quitaría o Recortaría (Limpieza y Deuda Técnica)

1. **Selector de Rol/Dificultad en Barra Superior:**
   - Eliminar o bloquear los combos de la barra superior durante la partida activa, ya que resetean el estado sin confirmación previa y exhiben opciones no implementadas.
2. **Duplicación de Archivos Markdown:**
   - Unificar la documentación técnica: eliminar redundancias entre la raíz del repositorio y la carpeta `/docs`.
3. **Consolidación de Vistas de Campaña:**
   - Reducir la dispersión entre *Apoyos*, *Apoyo en Provincias*, *Partido en las Provincias*, *Demografía* e *Imagen y Mapa*.
   - Refactorizar y modularizar `CampaignPartidoProvinciasView.tsx` (1.600+ líneas).
4. **Carga Gradual de Dirigentes:**
   - Mantener el catálogo de 158 figuras reales pero paginarlas o filtrarlas según relevancia y distrito activo, evitando la carga masiva en una sola vista.

---

## 5. Orden Recomendado de Ejecución

```
1. Balance del motor macro (Eliminación de atractores y quiebre por inacción)
   └── 2. Conectar campaña con gobierno (Transferencia de votos, bancas y coaliciones)
       └── 3. Mover gabinete, RIGI, medidas e impuestos a SimulationState (Dominio puro)
           └── 4. Ampliar eventos de gobierno encadenados y dilemas
               └── 5. Elecciones en dominio con rivales activos y medio término
```
