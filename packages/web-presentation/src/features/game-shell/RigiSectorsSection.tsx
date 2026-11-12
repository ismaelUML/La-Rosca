import React, { useState } from 'react';
import type { RigisectorItem, RigiPendingProject } from '@argentina-sim/domain';

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
  pendingProjects?: RigiPendingProject[];
  onApproveProject?: (id: string) => void;
  onRejectProject?: (id: string) => void;
  onApproveAllProjects?: () => void;
}

function RigiPendingCard({
  project,
  onApprove,
  onReject
}: {
  project: RigiPendingProject;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const remaining = Math.max(1, project.expiresInMonths - project.monthsWaiting);
  return (
    <div className="p-4 rounded-2xl bg-[#0b0e15] border border-amber-900/50 flex flex-col justify-between space-y-3 shadow-md">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded">
          {project.sectorName}
        </span>
        <h4 className="text-sm font-extrabold text-white mt-1">{project.name}</h4>
        <div className="text-xs text-slate-300">
          Inversión mínima: <strong className="text-emerald-400 font-mono font-bold">{project.minProjectMillionUsd} M USD</strong>
        </div>
        <div className="text-[11px] text-slate-400">
          Estado: espera resolución (<strong className="text-amber-300">{remaining} meses</strong> para desistir).
        </div>
      </div>
      <div className="flex gap-2 pt-1 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => onApprove?.(project.id)}
          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow"
        >
          ✓ Aprobar
        </button>
        <button
          type="button"
          onClick={() => onReject?.(project.id)}
          className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition"
        >
          ✕ Rechazar
        </button>
      </div>
    </div>
  );
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

function RigiHeaderOverview({
  enabledCount,
  totalSectors,
  totalInvPp,
  totalExpMilM,
  totalProjects,
  totalMUsd
}: {
  enabledCount: number;
  totalSectors: number;
  totalInvPp: number;
  totalExpMilM: number;
  totalProjects: number;
  totalMUsd: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
      <div className="p-3 rounded-xl bg-[#10131b] border border-slate-800">
        <div className="text-slate-400">Sectores habilitados</div>
        <div className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">
          {enabledCount} de {totalSectors}
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
        <div className="text-slate-400">Proyectos aprobados</div>
        <div className="text-lg font-mono font-extrabold text-white mt-0.5">
          {totalProjects} / 29 ({totalMUsd.toLocaleString('es-AR')} M USD)
        </div>
      </div>
    </div>
  );
}

function RigiSectorsTab({
  sectors,
  selectedBranch,
  onSelectBranch,
  onToggle
}: {
  sectors: RigisectorItem[];
  selectedBranch: string;
  onSelectBranch: (b: string) => void;
  onToggle: (id: string) => void;
}) {
  const filtered = sectors.filter(
    (s) => selectedBranch === 'TODAS' || s.branch === selectedBranch
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 pb-1">
        {RIGI_BRANCHES.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onSelectBranch(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedBranch === b
                ? 'bg-purple-600 text-white shadow'
                : 'bg-[#10131b] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sec) => (
          <RigiSectorCard key={sec.id} sector={sec} onToggle={() => onToggle(sec.id)} />
        ))}
      </div>
    </div>
  );
}

function RigiPendingTab({
  pendingProjects,
  onApprove,
  onReject
}: {
  pendingProjects: RigiPendingProject[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  if (pendingProjects.length === 0) {
    return (
      <div className="rounded-2xl bg-[#0b0e15] border border-slate-800 p-8 text-center text-xs text-slate-400">
        No hay proyectos pendientes en este momento. Habilitá sectores del RIGI para atraer inversiones estratégicas.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pendingProjects.map((p) => (
        <RigiPendingCard key={p.id} project={p} onApprove={onApprove} onReject={onReject} />
      ))}
    </div>
  );
}

function sumActiveInvestment(rigiSectors: RigisectorItem[]) {
  let count = 0;
  let inv = 0;
  let exp = 0;
  for (const s of rigiSectors) {
    if (s.enabledByDecree) {
      count += 1;
      inv += s.regimeInvestmentPpGdp;
      exp += s.exportsBillionUsd;
    }
  }
  return { enabledCount: count, totalInvPp: inv, totalExpMilM: exp };
}

function sumProjectVolumes(rigiSectors: RigisectorItem[]) {
  let count = 0;
  let usd = 0;
  for (const s of rigiSectors) {
    count += s.activeProjectsCount;
    usd += s.accumulatedInvestmentMillionUsd;
  }
  return { totalProjects: count, totalMUsd: usd };
}

function computeRigiTotals(rigiSectors: RigisectorItem[]) {
  const active = sumActiveInvestment(rigiSectors);
  const projects = sumProjectVolumes(rigiSectors);
  return { ...active, ...projects };
}

function canShowApproveAll(subTab: string, pendingCount: number, onApproveAll?: () => void): boolean {
  if (subTab !== 'PENDIENTES') return false;
  if (pendingCount <= 0) return false;
  return Boolean(onApproveAll);
}

function RigiApproveAllButton({ pendingCount, onApproveAll }: { pendingCount: number; onApproveAll?: () => void }) {
  return (
    <button
      type="button"
      onClick={onApproveAll}
      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition"
    >
      Aprobar todos ({pendingCount})
    </button>
  );
}

function RigiPendingBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-extrabold">
      {count}
    </span>
  );
}

function RigiNavigationHeader({
  subTab,
  enabledCount,
  pendingCount,
  onSelectTab,
  onApproveAll
}: {
  subTab: 'SECTORES' | 'PENDIENTES';
  enabledCount: number;
  pendingCount: number;
  onSelectTab: (tab: 'SECTORES' | 'PENDIENTES') => void;
  onApproveAll?: () => void;
}) {
  const showApprove = canShowApproveAll(subTab, pendingCount, onApproveAll);
  const isSectores = subTab === 'SECTORES';
  const secClass = isSectores ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white';
  const pendClass = !isSectores ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white';

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSelectTab('SECTORES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${secClass}`}
        >
          Sectores ({enabledCount} de 29)
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('PENDIENTES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${pendClass}`}
        >
          <span>Proyectos pendientes</span>
          <RigiPendingBadge count={pendingCount} />
        </button>
      </div>

      {showApprove && <RigiApproveAllButton pendingCount={pendingCount} onApproveAll={onApproveAll} />}
    </div>
  );
}

export function RigiSectorsSection({
  rigiSectors,
  onToggleRigi,
  pendingProjects = [],
  onApproveProject,
  onRejectProject,
  onApproveAllProjects
}: RigiSectorsSectionProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>('TODAS');
  const [subTab, setSubTab] = useState<'SECTORES' | 'PENDIENTES'>('SECTORES');
  const totals = computeRigiTotals(rigiSectors);

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

        <RigiHeaderOverview
          enabledCount={totals.enabledCount}
          totalSectors={rigiSectors.length}
          totalInvPp={totals.totalInvPp}
          totalExpMilM={totals.totalExpMilM}
          totalProjects={totals.totalProjects}
          totalMUsd={totals.totalMUsd}
        />
      </div>

      <RigiNavigationHeader
        subTab={subTab}
        enabledCount={totals.enabledCount}
        pendingCount={pendingProjects.length}
        onSelectTab={setSubTab}
        onApproveAll={onApproveAllProjects}
      />

      {subTab === 'SECTORES' ? (
        <RigiSectorsTab
          sectors={rigiSectors}
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
          onToggle={onToggleRigi}
        />
      ) : (
        <RigiPendingTab
          pendingProjects={pendingProjects}
          onApprove={onApproveProject}
          onReject={onRejectProject}
        />
      )}
    </div>
  );
}
