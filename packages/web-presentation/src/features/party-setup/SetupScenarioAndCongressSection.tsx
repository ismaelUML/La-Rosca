import React from 'react';
import {
  Activity,
  Building2,
  Compass,
  Flag,
  Landmark,
  SlidersHorizontal
} from 'lucide-react';
import type {
  CharacterArchetypeId,
  CongressStartScenario,
  DifficultyLevel,
  GameStartMode
} from '@argentina-sim/domain';
import {
  CHARACTER_ARCHETYPE_CATALOG,
  CONGRESS_SCENARIO_CATALOG,
  DIFFICULTY_CATALOG
} from '@argentina-sim/domain';

interface SetupScenarioAndCongressSectionProps {
  difficulty: DifficultyLevel;
  characterArchetype: CharacterArchetypeId;
  congressScenario: CongressStartScenario;
  startMode: GameStartMode;
  onChangeDifficulty: (d: DifficultyLevel) => void;
  onChangeArchetype: (a: CharacterArchetypeId) => void;
  onChangeCongressScenario: (c: CongressStartScenario) => void;
  onChangeStartMode: (m: GameStartMode) => void;
}

const DIFFICULTY_ACCENT: Record<DifficultyLevel, string> = {
  VIENTO_DE_COLA: 'text-emerald-300 border-emerald-700/60 bg-emerald-950/35',
  ESTANDAR_2027: 'text-amber-300 border-amber-700/60 bg-amber-950/30',
  HERENCIA_MALDITA: 'text-orange-300 border-orange-700/60 bg-orange-950/35',
  TORMENTA_PERFECTA: 'text-rose-300 border-rose-700/60 bg-rose-950/35',
  DICIEMBRE_2001: 'text-rose-200 border-rose-600/80 bg-rose-950/55'
};

export function CharacterArchetypeSelector({
  value,
  onChange
}: {
  value: CharacterArchetypeId;
  onChange: (next: CharacterArchetypeId) => void;
}) {
  return (
    <div className="pt-3 border-t border-[#1e293b]">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-amber-300 mb-2">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Trayectoria y Perfil de Conducción (Aplica modificadores reales)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {CHARACTER_ARCHETYPE_CATALOG.map((item) => {
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`text-left p-2.5 rounded-sm border transition ${
                active
                  ? 'bg-[#17253b] border-[#b89342] shadow-[inset_0_0_0_1px_rgba(184,147,66,0.35)]'
                  : 'bg-[#0b1018] border-[#263142] hover:border-slate-500'
              }`}
            >
              <div className="text-xs font-bold text-slate-100">{item.label}</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">{item.tagline}</div>
              <div className="text-[10px] font-mono text-amber-300/95 mt-1.5 pt-1.5 border-t border-[#1e293b]">
                {item.tradeoffSummary}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MacroDifficultyGrid({
  difficulty,
  onChange
}: {
  difficulty: DifficultyLevel;
  onChange: (d: DifficultyLevel) => void;
}) {
  return (
    <section className="hoi-panel rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#243042]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            04 · Escenario Macroeconómico Inicial (BCRA, Riesgo e Inflación)
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase">Customizable para cualquier líder</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {DIFFICULTY_CATALOG.map((item) => {
          const active = difficulty === item.id;
          const badgeStyle = DIFFICULTY_ACCENT[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`text-left p-3 rounded-sm border transition ${
                active
                  ? 'bg-[#17253b] border-[#b89342] shadow-[inset_0_0_0_1px_rgba(184,147,66,0.4)]'
                  : 'bg-[#0b1018] border-[#263142] hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-100">{item.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${badgeStyle}`}>
                  {item.climateLabel}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2 text-[10px] font-mono">
                <div className="bg-[#080c13] border border-[#1d2736] rounded-sm px-1.5 py-1">
                  <div className="text-slate-500">RESERVAS</div>
                  <div className="text-slate-200 font-semibold">{item.reservesLabel}</div>
                </div>
                <div className="bg-[#080c13] border border-[#1d2736] rounded-sm px-1.5 py-1">
                  <div className="text-slate-500">EMBI</div>
                  <div className="text-slate-200 font-semibold">{item.riskLabel}</div>
                </div>
                <div className="bg-[#080c13] border border-[#1d2736] rounded-sm px-1.5 py-1">
                  <div className="text-slate-500">IPC MES</div>
                  <div className="text-slate-200 font-semibold">{item.inflationLabel}</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-snug">{item.note}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CongressAndStartModePanel({
  congressScenario,
  startMode,
  onChangeCongress,
  onChangeStartMode
}: {
  congressScenario: CongressStartScenario;
  startMode: GameStartMode;
  onChangeCongress: (c: CongressStartScenario) => void;
  onChangeStartMode: (m: GameStartMode) => void;
}) {
  return (
    <section className="hoi-panel rounded-sm p-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#243042]">
        <Landmark className="w-4 h-4 text-amber-400" />
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          05 · Correlación Parlamentaria y Modalidad de Despegue
        </h2>
      </div>

      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
          Modalidad de Inicio
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChangeStartMode('CAMPAIGN')}
            className={`text-left p-3 rounded-sm border transition ${
              startMode === 'CAMPAIGN'
                ? 'bg-[#17253b] border-[#b89342]'
                : 'bg-[#0b1018] border-[#263142] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <Flag className="w-3.5 h-3.5 text-amber-300" />
              Campaña Electoral 2027 (PASO · Generales · Balotaje)
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Disputá votos provincia por provincia, cerrá coaliciones y heredá en Casa Rosada tu legitimidad y bancas reales ganadas.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChangeStartMode('DIRECT_GOVERNMENT')}
            className={`text-left p-3 rounded-sm border transition ${
              startMode === 'DIRECT_GOVERNMENT'
                ? 'bg-[#17253b] border-[#b89342]'
                : 'bg-[#0b1018] border-[#263142] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              Asunción Directa · 10 de Diciembre 2027
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Saltá la campaña y asumí el sillón de Rivadavia desde el turno 1 con el escenario macro, perfil y Congreso elegidos acá.
            </p>
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-[#1e293b]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            Equilibrio Inicial en Diputados (257) y Senado (72)
          </div>
          {startMode === 'CAMPAIGN' ? (
            <span className="text-[10px] font-mono text-amber-300/80">
              En campaña define afinidad base; tu voto final ajusta las bancas
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {CONGRESS_SCENARIO_CATALOG.map((item) => {
            const active = congressScenario === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeCongress(item.id)}
                className={`text-left p-2.5 rounded-sm border transition ${
                  active
                    ? 'bg-[#17253b] border-[#b89342]'
                    : 'bg-[#0b1018] border-[#263142] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100">{item.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#080c13] border border-[#2c3a4f] text-amber-300">
                    {item.seatTag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SetupScenarioAndCongressSection({
  difficulty,
  congressScenario,
  startMode,
  onChangeDifficulty,
  onChangeCongressScenario,
  onChangeStartMode
}: Omit<SetupScenarioAndCongressSectionProps, 'characterArchetype' | 'onChangeArchetype'>) {
  return (
    <>
      <MacroDifficultyGrid difficulty={difficulty} onChange={onChangeDifficulty} />
      <CongressAndStartModePanel
        congressScenario={congressScenario}
        startMode={startMode}
        onChangeCongress={onChangeCongressScenario}
        onChangeStartMode={onChangeStartMode}
      />
    </>
  );
}

