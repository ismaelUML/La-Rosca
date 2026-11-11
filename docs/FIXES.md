# Especificación Técnica de Soluciones y Arquitectura de Corrección (FIXES)

> Documento de diseño arquitectónico y matemático previo a la implementación para dar respuesta integral a todos los puntos de `docs/BUGS.md`.

---

## FIX-01: Personaje Personalizado (`MI_PERSONAJE`) y Flujo de Identidad

### Diagnóstico Técnico
En `App.tsx` y `NewGameSetupScreen.tsx`, el estado inicial caía en el fallback de `REAL_POLITICIANS_2027[0]` ("Mauricio Macri") porque `candidateObj` no construía una entidad independiente cuando `characterMode === 'MI_PERSONAJE'`.

### Solución Arquitectónica
1. **Generador de Entidad Candidato**:
   ```typescript
   function createCustomPlayerCandidate(
     setup: GameSetupConfiguration
   ): { id: string; name: string } {
     return {
       id: `PLAYER_CUSTOM_${setup.sessionId}`,
       name: setup.characterName.trim() || 'Candidato del Pueblo'
     };
   }
   ```
2. **Inicialización de Atributos**:
   - En `createInitialCampaignState`, si el ID empieza con `PLAYER_CUSTOM_`, los atributos personales se derivan del balance ideológico del partido del jugador y la dificultad seleccionada:
     - `inteligenciaPercibida`: 55 pts
     - `convencimiento`: 60 pts
     - `relevancia`: 40 pts
     - `apoyoPartidario`: 70 pts
     - `vulnerabilidad`: 15 pts
     - `negociacion`: 50 pts
3. **Persistencia Garantizada**:
   - Se guarda en `localStorage` con la bandera `characterMode: 'MI_PERSONAJE'` y el nombre exacto asignado.

---

## FIX-02: Rendimientos Decrecientes y Curva de Fatiga en Acciones de Campaña

### Diagnóstico Técnico
Las acciones de campaña aplican sus deltas de forma lineal independientemente de la frecuencia de uso en el catálogo.

### Modelo Matemático de Fatiga
Para cada acción $a \in \text{CampaignActionId}$, mantenemos un registro de usos recientes $U_a \in \mathbb{N}_0$.
El multiplicador de efectividad $M(U_a)$ responde a una hipérbola de saturación mediática:

$$M(U_a) = \frac{1}{1 + 0.40 \cdot U_a}$$

- **Primer uso ($U_a = 0$)**: $M(0) = 1.00$ (100 % de efectividad).
- **Segundo uso consecutivo ($U_a = 1$)**: $M(1) = 0.71$ (71 % de efectividad).
- **Tercer uso consecutivo ($U_a = 2$)**: $M(2) = 0.55$ (55 % de efectividad).
- **Cuarto uso ($U_a = 3$)**: $M(3) = 0.45$ (45 % de efectividad).

### Regeneración Mes a Mes
Al llamar a `advanceCampaignMonth(state)`:
$$\forall a, \quad U_a^{(t+1)} = \max(0, U_a^{(t)} - 1)$$
De este modo, diversificar las acciones premia al jugador, mientras que repetir monótonamente la misma acción agota a la opinión pública.

---

## FIX-03 & FIX-12: Sistema de Apoyos, Tirada Probabilística y Cooldown de 5 Meses

### Diagnóstico Técnico
Falta un registro de rechazos pasados que inhabilite nuevas solicitudes durante un período de enfriamiento constitucional/partidario.

### Estructura de Datos
En `CampaignSimulationState`:
```typescript
export interface PoliticianSupportState {
  politicianId: string;
  hasGivenSupport: boolean;
  hasJoinedParty: boolean;
  cooldownUntilMonth: number; // Índice de mes hasta el cual no se puede volver a pedir
  lastRejectionReason?: string;
}
```

### Regla de Cooldown
1. Cuando el jugador pulsa **Pedir apoyo** o **Invitar a tu partido**:
   - Se evalúa la probabilidad de éxito $P_{éxito}$.
   - Si la tirada falla:
     - `cooldownUntilMonth = currentMonthIndex + 5`.
     - El botón se desactiva y muestra: `Rechazó la propuesta · Disponible en X meses`.
2. Durante 5 turnos mensuales consecutivos no se puede reiterar la invitación a ese dirigente.

---

## FIX-04 & FIX-05: Candidatura Confirmada, Exclusividad y Límite de 2 Partidos Aliados

### Diagnóstico Técnico
Falta la restricción normativa de alianzas electorales argentinas (Ley 26.571 de Partidos Políticos) y la exclusividad del binomio presidencial.

### Reglas del Sistema
1. **Confirmación de Candidatura**:
   - Se almacena `isCandidacyConfirmed: boolean` en `CampaignSimulationState`.
   - Cuando se confirma:
     - `apoyoPartidario += 5` pp.
     - Se bloquea la postulación de cualquier otro precandidato dentro del espacio.
     - La fórmula queda sellada para la elección general.
2. **Límite de Coaliciones**:
   - La lista de socios en coalición se limita a un **máximo estricto de 2 partidos aliados**:
   $$\text{len}(\text{coalitionPartyIds}) \le 2$$
   - Si el jugador intenta sumar un 3° socio, la interfaz deshabilita la acción e informa:
     > *"Límite de coalición alcanzado: la ley electoral y los equilibrios internos no admiten sumar más de dos partidos aliados sin romper la disciplina de bancada."*

---

## FIX-06: Modelo Psicométrico Contextual para la Concesión de Apoyos

### Fórmula de Probabilidad
La probabilidad de que un dirigente $d$ otorgue su apoyo depende de tres vectores:

$$P(apoyo) = \text{clamp}\Big(B_{base} - 0.7 \cdot \Delta_{ideol} + 0.3 \cdot (\text{Aprobación} - 45) + \text{Bono}_{rasgo},\; 5\%,\; 95\%\Big)$$

Donde:
- $\Delta_{ideol} = \sqrt{(\text{Econ}_d - \text{Econ}_j)^2 + (\text{Cult}_d - \text{Cult}_j)^2}$: Distancia ideológica euclidiana.
- Si $d$ es `DOGMÁTICO` y $\Delta_{ideol} > 22$, entonces $P = 0\%$ (rechazo automático).
- Si $d$ es `DIALOGUISTA`, $\text{Bono}_{rasgo} = +15\%$.
- Si el contexto socioeconómico (`countryMood.governmentApprovalPct`) es menor a 35 %, se aplica una penalización de $-20\%$ (nadie apoya a un barco que se hunde).

---

## FIX-07: Selección de Gabinete según Partido/Coalición con Matriz de Idoneidad

### Pool de Elegibilidad
Un dirigente político solo puede ser nombrado ministro si:
1. Pertenece al partido propio del Presidente, O
2. Pertenece a un partido formalmente integrado a la coalición de gobierno.

### Matriz de Idoneidad Ministerial (`MINISTRY_SUITABILITY`)
| Cartera | Dirigentes Idóneos de Referencia | Penalización si no es idóneo |
| :--- | :--- | :--- |
| **Seguridad** | Patricia Bullrich, etc. | $-25$ pts desempeño, $+20$ riesgo |
| **Economía** | Luis Caputo, Carlos Melconian, Martín Lousteau | $-30$ pts desempeño, $+25$ riesgo |
| **Desregulación e Infraestructura** | Federico Sturzenegger, Guillermo Ferraro | $-20$ pts desempeño |
| **Relaciones Exteriores** | Diana Mondino, etc. | $-20$ pts desempeño |
| **Capital Humano** | Sandra Pettovello, etc. | $-20$ pts desempeño |
| **Jefatura de Gabinete** | Guillermo Francos, etc. | $-15$ pts desempeño |

---

## FIX-08: RIGI Inicial en 0/29

### Corrección del Dataset
En `INITIAL_RIGI_SECTORS`:
- Se modifican los 29 sectores para que al 10 de diciembre de 2027 arranquen con:
  - `enabledByDecree: false`
  - `activeProjectsCount: 0`
  - `accumulatedInvestmentMillionUsd: 0`
  - `maturityPct: 0`
- El encabezado de la vista mostrará inicialmente:
  > **Régimen de Incentivo para Grandes Inversiones**: `0 de 29 sectores habilitados · Inversión acumulada: 0 M USD`.
- El Presidente debe emitir los Decretos de Necesidad y Urgencia o Decretos Reglamentarios para ir habilitando cada sector a medida que consiga sustento fiscal y político.

---

## FIX-09: Alícuotas Impositivas Vigentes (AFIP / ARCA)

### Tabla de Calibración
| Impuesto | Alícuota Real Actual | Vía Legal |
| :--- | :--- | :--- |
| **Derechos de Exportación - Soja** | 33,0 % | Decreto (Facultad delegada) |
| **Derechos de Exportación - Maíz y Trigo** | 12,0 % | Decreto |
| **Derechos de Exportación - Carne y Lácteos** | 9,0 % | Decreto |
| **Derechos de Exportación - Minería e Industria** | 4,5 % | Decreto |
| **Aranceles de Importación Promedio** | 12,5 % | Decreto |
| **Impuesto PAIS (si estuviera vigente/reinstalado)** | 0,0 % (vencido) / 7,5 % | Decreto |
| **IVA General** | 21,0 % | Ley del Congreso |
| **IVA Canasta Básica** | 10,5 % | Ley del Congreso |
| **Ganancias Sociedades** | 35,0 % | Ley del Congreso |
| **Ganancias 4ta Categoría (Altos Ingresos)** | Escalas progresivas (hasta 35 %) | Ley del Congreso |
| **Créditos y Débitos Bancarios (Cheque)** | 0,6 % | Ley del Congreso |
| **Bienes Personales** | 1,25 % | Ley del Congreso |
| **Combustibles Líquidos (ICL)** | Suma fija actualizable por IPC | Ley del Congreso |

---

## FIX-10: Capacidad de Negociación y Bancadas Iniciales Realistas

1. **Capacidad de Negociación Inicial**:
   - Ajustar el valor inicial de `negotiationCapacity` a **38,5 / 100** (en vez de 99,9).
   - Aumenta al ceder fondos a provincias, otorgar ministerios de coalición o sostener alta aprobación popular.
2. **Bancadas Iniciales en Cámaras**:
   - Ajustar la composición predeterminada de 2027 a un escenario de minoría parlamentaria:
     - **Diputados**: Bloque propio 38 bancas (de 257). Requiere alianzas para quórum (129).
     - **Senado**: Bloque propio 7 bancas (de 72). Requiere alianzas para quórum (37).

---

## FIX-11: Relación Autónoma y Dinámica con Fuerzas Políticas

### Regla de Negocio
- La relación numérica (0 a 100) con `LLA`, `PRO`, `UCR`, `UxP`, `PF`, `FIT` **no se puede editar a mano**.
- Se recalcula al cierre de cada mes en base a:
  1. **Alineamiento de Decretos y Medidas**: si firmás desregulación o bajas retenciones, sube la relación con LLA y PRO, y baja con UxP y FIT.
  2. **Transferencias no automáticas y ATNs a gobernadores**: si mandás fondos a gobernadores radicales o provinciales, sube la relación con UCR y PF.
  3. **Vetos Presidenciales**: vetar leyes previsionales o universitarias hunde la relación con los bloques impulsores.

---

## FIX-13: Rediseño Integral de "Partido en las Provincias" (Fórmulas, Encuestas Reales y Calendario)

### 1. Cronograma Electoral Real de Provincias Argentinas
Las provincias eligen Gobernador cada 4 años, pero la gran mayoría **desdobla** sus comicios respecto de la elección presidencial nacional (que ocurrió en octubre/noviembre de 2027). Por lo tanto, el calendario cronológico escalonado de renovación de gobernaciones comienza en **2028**:

- **Turno 2028** (Fórmulas habilitadas desde 2027):
  1. *Tierra del Fuego*: 12 de marzo de 2028 (con balotaje si no supera el 50 %).
  2. *Misiones*: 9 de abril de 2028.
  3. *La Pampa*: 14 de mayo de 2028.
  4. *Mendoza*: 11 de junio de 2028.
  5. *Chaco*: 9 de julio de 2028.
  6. *Buenos Aires*: 10 de septiembre de 2028.
- **Turno 2029** (Fórmulas habilitadas desde 2028):
  1. *Jujuy*: 8 de abril de 2029.
  2. *Tucumán*: 13 de mayo de 2029.
  3. *Córdoba*: 10 de junio de 2029.
  4. *San Luis*: 8 de julio de 2029.
  5. *Corrientes*: 9 de septiembre de 2029.
  6. *Santiago del Estero*: 11 de noviembre de 2029.
- **Turno 2030**:
  - Santa Fe, Neuquén, Río Negro, San Juan, Salta, Formosa.
- **Turno 2031**:
  - CABA, Entre Ríos, Catamarca, La Rioja, Chubut, Santa Cruz.

### 2. Vista de Detalle Provincial (Capturas 2 y 3)
Al seleccionar una provincia en carrera:
- **Encabezado**: Nombre de la provincia, fecha de elección, sistema electoral (mayoría simple vs balotaje) y gobernador actual con badge de cuenta regresiva (`FALTAN X MESES`).
- **Gráfico de Barra Apilada Segmentada**: Intención de voto de cada fuerza en carrera con colores oficiales:
  - *Provincias Unidas* (naranja), *Tu fórmula / LLA* (violeta), *UxP* (celeste), *Defendamos TDF / provincial* (azul), *FIT* (rojo), *UCR* (rojo/blanco), etc.
- **Selectores de Fórmula Provincial**:
  - Dropdown interactivo de **GOBERNADOR** con dirigentes provinciales de tu espacio y su índice de relevancia.
  - Dropdown interactivo de **VICEGOBERNADOR** con dirigentes afines.
- **Información del Electorado**:
  - Desglose ideológico territorial (% izquierda, % centro, % derecha).
- **Sub-pestañas de Comando Local**:
  - `Campaña (4 acciones)`: Entrevista, Publicidad, Acto partidario, Formación de equipos, Debate, Plan de gobierno, etc., con presupuesto específico local.
  - `Coalición`: Cierre de alianzas distritales.
  - `Perfil del candidato`: Atributos del binomio provincial.
