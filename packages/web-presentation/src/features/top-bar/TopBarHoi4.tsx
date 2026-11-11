import React from 'react';
import type { DifficultyLevel, PlayableRole, SimulationState } from '@argentina-sim/domain';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Barra superior estilo Hearts of Iron IV: siempre visible arriba para que cuando toques
// una tarifa o devalues veas en el mismo segundo como sangran las Reservas Netas o el CCL.

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

interface TopBarHoi4Props {
  state: SimulationState;
  onAdvanceMonth: () => void;
  onResetScenario: (role: PlayableRole, difficulty: DifficultyLevel, provinceId: string) => void;
  onExportCode: () => void;
}

function getNetReservesVariant(netReserves: number): 'success' | 'warning' | 'danger' {
  if (netReserves < 0) return 'danger';
  if (netReserves < 6) return 'warning';
  return 'success';
}

export function TopBarHoi4({
  state,
  onAdvanceMonth,
  onResetScenario,
  onExportCode
}: TopBarHoi4Props) {
  const monthLabel = MONTH_NAMES[(state.currentMonthOfYear - 1) % 12] ?? 'Dic';
  const netVariant = getNetReservesVariant(state.centralBank.netLiquidReservesBillionUsd);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 py-3">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-sky-500/10 border border-sky-500/30 px-3 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-sky-400 font-semibold">
              Argentina 2027 · Turno #{state.turnMonth}
            </div>
            <div className="text-sm font-bold text-white">
              {monthLabel} {state.currentYear} · {state.role} ({state.selectedProvinceId})
            </div>
          </div>

          <select
            aria-label="Seleccionar Rol"
            value={state.role}
            onChange={(e) => onResetScenario(e.target.value as PlayableRole, state.difficulty, state.selectedProvinceId)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="PRESIDENTE">Rol: Presidente de la Nación</option>
            <option value="GOBERNADOR">Rol: Gobernador Provincial</option>
            <option value="DIPUTADO">Rol: Diputado Nacional (1/257)</option>
            <option value="SENADOR">Rol: Senador Nacional (1/72)</option>
          </select>

          <select
            aria-label="Seleccionar Dificultad"
            value={state.difficulty}
            onChange={(e) => onResetScenario(state.role, e.target.value as DifficultyLevel, state.selectedProvinceId)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="VIENTO_DE_COLA">1. Fácil: Viento de Cola (Soja USD 600)</option>
            <option value="ESTANDAR_2027">2. Normal: Argentina Año Verde (2027)</option>
            <option value="HERENCIA_MALDITA">3. Difícil: Herencia Maldita</option>
            <option value="TORMENTA_PERFECTA">4. Muy Difícil: Tormenta Perfecta (Niña)</option>
            <option value="DICIEMBRE_2001">5. Extremo: Diciembre de 2001 (Sin Red)</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">
            Oficial ${state.centralBank.officialDollarArs} · CCL ${state.centralBank.cclDollarArs} (Brecha {state.centralBank.exchangeBrechaPct}%)
          </Badge>
          <Badge variant={netVariant}>
            Res. Brutas {state.centralBank.grossReservesBillionUsd}B · Netas {state.centralBank.netLiquidReservesBillionUsd}B USD
          </Badge>
          <Badge variant="warning">
            IPC Real {state.inflation.realMonthlyIpcPct}%/mes (INDEC {state.inflation.officialIndecIpcPct}%)
          </Badge>
          <Badge variant="default">
            Riesgo País {state.countryRiskEmbiPb} pb · Imagen {state.publicOpinion.presidentialPersonalImagePct}%
          </Badge>

          <Button size="sm" variant="outline" onClick={onExportCode}>
            Código Zlib
          </Button>
          <Button size="sm" onClick={onAdvanceMonth}>
            Avanzar Mes (+1 Tick)
          </Button>
        </div>
      </div>
    </header>
  );
}
