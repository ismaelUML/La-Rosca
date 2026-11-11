import React, { useState } from 'react';
import type { RigisectorItem } from '@argentina-sim/domain';

// El RIGI no es un chiste de barritas: aca estan los 29 sectores reales de la Ley Bases
// con sus 200/500 palos verdes de piso, madurez de proyectos y el costo fiscal
// que te carcome la recaudacion mientras esperas que lluevan los dolares de exportacion.

const RIGI_BRANCHES = [
  'TODAS',
  'Minería',
  'Energía',
  'Infraestructura',
  'Tecnología',
  'Industria',
  'Agro',
  'Marítimo',
  'Servicios',
  'Construcción'
] as const;

export interface RigiSectorsSectionProps {
  rigiSectors: RigisectorItem[];
  onToggleRigi: (id: string) => void;
}

const BRANCH_BADGE_MAP: Record<string, string> = {
  'Minería': 'bg-amber-950/70 border-amber-600/70 text-amber-300',
  'Energía': 'bg-yellow-950/70 border-yellow-600/70 text-yellow-300',
  'Infraestructura': 'bg-cyan-950/70 border-cyan-600/70 text-cyan-300',
  'Tecnología': 'bg-violet-950/70 border-violet-600/70 text-violet-300',
  'Industria': 'bg-blue-950/70 border-blue-600/70 text-blue-300',
  'Agro': 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300'
};

function resolveBranchBadgeClass(branch: string): string {
  return BRANCH_BADGE_MAP[branch] ?? 'bg-slate-900 border-slate-700 text-slate-300';
}

function formatEmploymentDelta(unemploymentDeltaPp: number): string {
  const sign = unemploymentDeltaPp <= 0 ? '−' : '+';
  const val = Math.abs(unemploymentDeltaPp).toFixed(3).replace('.', ',');
  return `${sign}${val} pp desempleo`;
}

function RigiMetricsGrid({ sector }: { sector: RigisectorItem }) {
  const invLabel = `+${sector.regimeInvestmentPpGdp.toFixed(2).replace('.', ',')} pp PIB`;
  const expLabel = `+${sector.exportsBillionUsd.toFixed(1).replace('.', ',')} mil M USD`;
  const empLabel = formatEmploymentDelta(sector.unemploymentDeltaPp);
  const costLabel = `${sector.fiscalCostPctGdp.toFixed(3).replace('.', ',')} % PIB`;
  const conflictLabel = `${sector.monthlyConflictRiskPct} % mensual`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-1">
      <div className="p-2 rounded-lg bg-[#0b0e15] border border-slate-800/80">
        <div className="text-[10px] text-slate-500 uppercase">Proyecto mínimo</div>
        <div className="font-mono font-bold text-slate-200 mt-0.5">{sector.minProjectMillionUsd} M USD</div>
      </div>
      <div className="p-2 rounded-lg bg-[#0b0e15] border border-slate-800/80">
        <div className="text-[10px] text-slate-500 uppercase">Inversión a régimen</div>
        <div className="font-mono font-bold text-emerald-400 mt-0.5">{invLabel}</div>
      </div>
      <div className="p-2 rounded-lg bg-[#0b0e15] border border-slate-800/80">
        <div className="text-[10px] text-slate-500 uppercase">Exportaciones</div>
        <div className="font-mono font-bold text-sky-400 mt-0.5">{expLabel}</div>
      </div>
      <div className="p-2 rounded-lg bg-[#0b0e15] border border-slate-800/80">
        <div className="text-[10px] text-slate-500 uppercase">Empleo</div>
        <div className="font-mono font-bold text-emerald-300 mt-0.5">{empLabel}</div>
      </div>
      <div className="p-2 rounded-lg bg-[#0b0e15] border border-slate-800/80">
        <div className="text-[10px] text-slate-500 uppercase">Costo fiscal</div>
        <div className="font-mono font-bold text-rose-300 mt-0.5">{costLabel}</div>
      </div>
      <div className="p-2 rounded-lg bg-[#0b0e15] border border-slate-800/80">
        <div className="text-[10px] text-slate-500 uppercase">Conflictividad</div>
        <div className="font-mono font-bold text-amber-300 mt-0.5">{conflictLabel}</div>
      </div>
    </div>
  );
}

function RigiMaturityBar({
  maturity,
  dateText,
  projects,
  accumulated
}: {
  maturity: number;
  dateText: string;
  projects: number;
  accumulated: string;
}) {
  return (
    <div className="pt-2 border-t border-slate-800/70 space-y-1">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{dateText} · {projects} proyectos · {accumulated} M USD</span>
        <span className="font-mono font-bold text-slate-200">madurez {maturity} %</span>
      </div>
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, maturity))}%` }}
        />
      </div>
    </div>
  );
}

function RigiSectorCard({
  sector,
  onToggle
}: {
  sector: RigisectorItem;
  onToggle: () => void;
}) {
  const badgeClass = resolveBranchBadgeClass(sector.branch);
  const dateText = sector.enabledDateLabel ?? 'Habilitado desde 10 de diciembre de 2027';
  const accumulated = sector.accumulatedInvestmentMillionUsd.toLocaleString('es-AR');
  const btnClass = sector.enabledByDecree
    ? 'bg-rose-950/40 border border-rose-700/70 text-rose-300 hover:bg-rose-900/50'
    : 'bg-white hover:bg-slate-200 text-slate-950';

  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 md:p-5 flex flex-col justify-between gap-3 shadow-lg">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-white leading-snug">{sector.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-1 ${badgeClass}`}>
              {sector.branch}
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
            Piso: {sector.minProjectMillionUsd} M USD
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{sector.description}</p>
        <RigiMetricsGrid sector={sector} />
        <RigiMaturityBar
          maturity={sector.maturityPct}
          dateText={dateText}
          projects={sector.activeProjectsCount}
          accumulated={accumulated}
        />
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onToggle}
          className={`w-full py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition shadow ${btnClass}`}
        >
          {sector.enabledByDecree ? 'Quitar el régimen' : 'Habilitar el régimen'}
        </button>
      </div>
    </div>
  );
}

export function RigiSectorsSection({ rigiSectors, onToggleRigi }: RigiSectorsSectionProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>('TODAS');

  const filtered = rigiSectors.filter(
    (s) => selectedBranch === 'TODAS' || s.branch === selectedBranch
  );

  const enabledCount = rigiSectors.filter((s) => s.enabledByDecree).length;
  const totalInvPp = rigiSectors
    .filter((s) => s.enabledByDecree)
    .reduce((acc, s) => acc + (s.regimeInvestmentPpGdp ?? 0), 0);
  const totalExpMilM = rigiSectors
    .filter((s) => s.enabledByDecree)
    .reduce((acc, s) => acc + (s.exportsBillionUsd ?? 0), 0);
  const totalProjects = rigiSectors.reduce((acc, s) => acc + (s.activeProjectsCount ?? 0), 0);
  const totalMUsd = rigiSectors.reduce((acc, s) => acc + (s.accumulatedInvestmentMillionUsd ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
          PRESUPUESTO · RÉGIMEN DE GRANDES INVERSIONES (RIGI)
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">RIGI (Ley 27.742)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Beneficios aduaneros, tributarios y libre disponibilidad de divisas a 30 años para proyectos estratégicos de más de 200 M USD.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-[#10131b] border border-slate-800">
            <div className="text-slate-400">Sectores habilitados</div>
            <div className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">
              {enabledCount} de {rigiSectors.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#10131b] border border-slate-800">
            <div className="text-slate-400">Inversión a régimen</div>
            <div className="text-lg font-mono font-extrabold text-sky-400 mt-0.5">
              +{totalInvPp.toFixed(2).replace('.', ',')} pp PIB
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#10131b] border border-slate-800">
            <div className="text-slate-400">Exportaciones proyectadas</div>
            <div className="text-lg font-mono font-extrabold text-amber-400 mt-0.5">
              +{totalExpMilM.toFixed(1).replace('.', ',')} mil M USD
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#10131b] border border-slate-800">
            <div className="text-slate-400">Proyectos en cartera</div>
            <div className="text-lg font-mono font-extrabold text-white mt-0.5">
              {totalProjects} ({totalMUsd.toLocaleString('es-AR')} M USD)
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pb-1">
        {RIGI_BRANCHES.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setSelectedBranch(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedBranch === b
                ? 'bg-white text-slate-950 shadow'
                : 'bg-[#10131b] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sec) => (
          <RigiSectorCard
            key={sec.id}
            sector={sec}
            onToggle={() => onToggleRigi(sec.id)}
          />
        ))}
      </div>
    </div>
  );
}
