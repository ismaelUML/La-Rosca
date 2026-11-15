import React, { useMemo, useState } from 'react';
import {
  computeEscrutinio,
  type CampaignSimulationState,
  type CandidateVoteResult,
  type ElectionStageType,
  type EscrutinioData,
  type PlayableRole
} from '@argentina-sim/domain';
import { ElectionResultsSvgMap } from './ElectionResultsSvgMap.js';

export type { ElectionStageType, EscrutinioData };
export { computeEscrutinio };

// Modal de Noche Electoral y Escrutinio Oficial (QQG Capturas 9 y 10):
// La logica matematica de calculo y balotaje vive ahora en @argentina-sim/domain (electionEngine.ts).

const ASSUME_ROLE_BUTTON_LABEL: Record<PlayableRole, string> = {
  PRESIDENTE: 'Asumir la Presidencia de la Nación (10 de diciembre de 2027) ▶',
  GOBERNADOR: 'Asumir la Gobernación Provincial (10 de diciembre de 2027) ▶',
  DIPUTADO: 'Jurar Banca en la Cámara de Diputados (10 de diciembre de 2027) ▶',
  SENADOR: 'Jurar Banca en el Senado de la Nación (10 de diciembre de 2027) ▶'
};

const STAGE_HEADER_LABELS: Record<ElectionStageType, string> = {
  INTERNA: 'INTERNA PARTIDARIA ABIERTA · 25 DE ABRIL DE 2027',
  PASO: 'ELECCIONES PRIMARIAS (PASO) · 8 DE AGOSTO DE 2027',
  GENERALES: 'ELECCIONES GENERALES · 24 DE OCTUBRE DE 2027',
  BALOTAJE: 'SEGUNDA VUELTA · 21 DE NOVIEMBRE DE 2027'
};

function resolveElectionStageHeader(stageType: ElectionStageType): string {
  return STAGE_HEADER_LABELS[stageType];
}

function resolveElectionProceedButtonLabel(
  stageType: ElectionStageType,
  escrutinio: EscrutinioData,
  role: PlayableRole
): string {
  if (stageType === 'INTERNA') {
    return 'Consagrar Fórmula Oficial y pasar a las PASO ▶';
  }
  if (escrutinio.isRunoff) {
    return 'Ir al Balotaje (21 de noviembre de 2027) ▶';
  }
  if (stageType !== 'PASO' && escrutinio.isVictory) {
    return ASSUME_ROLE_BUTTON_LABEL[role];
  }
  return 'Continuar campaña ▶';
}

function ElectionResultsTable({ results }: { results: CandidateVoteResult[] }) {
  return (
    <div className="rounded-sm bg-[#0c1119] border border-[#263142] overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#080a10] border-b border-[#263142] text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
          <tr>
            <th className="py-3 px-4">FUERZA / LISTA</th>
            <th className="py-3 px-4">CANDIDATO</th>
            <th className="py-3 px-4 text-right">VOTOS</th>
            <th className="py-3 px-4 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr
              key={r.fuerza}
              className={`border-b border-[#1c2432] ${
                r.isPlayer ? 'bg-[#1a1812] font-bold border-l-2 border-l-[#c5a059]' : ''
              }`}
            >
              <td className="py-3 px-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: r.color }} />
                <span className="text-white">{r.fuerza}</span>
              </td>
              <td className="py-3 px-4 text-slate-300">{r.candidato}</td>
              <td className="py-3 px-4 text-right font-mono text-white">
                {r.votos.toLocaleString('es-AR')}
              </td>
              <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-200">
                {r.pct.toFixed(1).replace('.', ',')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ElectionStatsGrid({ escrutinio }: { escrutinio: EscrutinioData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-sm bg-[#0c1119] border border-[#263142] text-xs">
      <div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Participación
        </div>
        <div className="text-sm font-mono font-extrabold text-white mt-0.5">
          {escrutinio.participacionPct.toFixed(1).replace('.', ',')} %{' '}
          <span className="text-xs font-sans font-normal text-slate-400">
            de {escrutinio.padronTotal.toLocaleString('es-AR')} electores
          </span>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Votos en blanco / nulos
        </div>
        <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
          {escrutinio.votosBlancos.toLocaleString('es-AR')} /{' '}
          {escrutinio.votosNulos.toLocaleString('es-AR')}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Abstención
        </div>
        <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
          {escrutinio.abstencion.toLocaleString('es-AR')}
        </div>
      </div>
    </div>
  );
}

interface ElectionNightModalProps {
  isOpen: boolean;
  stageType: ElectionStageType;
  state: CampaignSimulationState;
  onProceed: () => void;
  onRetryCampaign?: () => void;
  onNewGameSetup?: () => void;
  onBreakPartySplit?: () => void;
}

function DefeatModalFooter({
  stageType,
  onRetry,
  onNewGameSetup,
  onBreakPartySplit
}: {
  stageType: ElectionStageType;
  onRetry: () => void;
  onNewGameSetup?: () => void;
  onBreakPartySplit?: () => void;
}) {
  const isInternaLoss = stageType === 'INTERNA' && Boolean(onBreakPartySplit);
  return (
    <div className="p-4 md:p-6 bg-[#080a10] border-t border-[#263142] flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 border border-rose-800 px-3 py-1.5 rounded-sm">
        {stageType === 'INTERNA'
          ? 'Derrota en la Interna · Perdiste el sello oficial del partido'
          : 'Derrota electoral · Quedaste fuera de la asunción del 10 de diciembre'}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {isInternaLoss ? (
          <button
            type="button"
            onClick={onBreakPartySplit}
            className="px-4 py-2.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border border-[#8a6d33] transition"
          >
            Romper e ir con Boleta Corta (-15 Apoyo)
          </button>
        ) : null}
        {onNewGameSetup ? (
          <button
            type="button"
            onClick={onNewGameSetup}
            className="px-4 py-2.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider bg-[#121926] hover:bg-[#1a2334] text-slate-200 border border-[#2c384b] transition"
          >
            Configurar nueva partida
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-3 rounded-sm text-xs md:text-sm font-mono font-extrabold uppercase tracking-wider bg-rose-700 hover:bg-rose-600 text-white border border-rose-500 transition shadow-lg"
        >
          Intentar de nuevo ↻
        </button>
      </div>
    </div>
  );
}

function ElectionModalFooter({
  stageType,
  escrutinio,
  role,
  onProceed,
  onRetryCampaign,
  onNewGameSetup,
  onBreakPartySplit
}: {
  stageType: ElectionStageType;
  escrutinio: EscrutinioData;
  role: PlayableRole;
  onProceed: () => void;
  onRetryCampaign?: () => void;
  onNewGameSetup?: () => void;
  onBreakPartySplit?: () => void;
}) {
  if (escrutinio.isDefeat) {
    return (
      <DefeatModalFooter
        stageType={stageType}
        onRetry={onRetryCampaign ?? onProceed}
        onNewGameSetup={onNewGameSetup}
        onBreakPartySplit={onBreakPartySplit}
      />
    );
  }

  const isBalotajeWin = stageType === 'BALOTAJE' && escrutinio.isVictory;
  const proceedBtnLabel = resolveElectionProceedButtonLabel(stageType, escrutinio, role);

  return (
    <div className="p-4 md:p-6 bg-[#080a10] border-t border-[#263142] flex items-center justify-between">
      {isBalotajeWin ? (
        <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-sm">
          Logro desbloqueado: Ganaste el balotaje
        </div>
      ) : (
        <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
          Telegrama CNE / DINE verificado · Mesas escrutadas 99,4%
        </div>
      )}

      <button
        type="button"
        onClick={onProceed}
        className="px-6 py-3 rounded-sm text-xs md:text-sm font-mono font-extrabold uppercase tracking-wider bg-gradient-to-b from-[#d8b76c] to-[#9b7a38] hover:from-[#e6c87d] hover:to-[#b08c42] text-slate-950 border border-[#f3d893]/40 transition shadow-lg"
      >
        {proceedBtnLabel}
      </button>
    </div>
  );
}

function OfficialResultsMapSection({
  state,
  escrutinio
}: {
  state: CampaignSimulationState;
  escrutinio: EscrutinioData;
}) {
  const [mapMode, setMapMode] = useState<'PROVINCIA' | 'DEPARTAMENTO'>('PROVINCIA');

  return (
    <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-100">
            Mapa de resultados oficial
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Pintado con la fuerza ganadora en los 24 distritos electorales y los 527 departamentos IGN.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMapMode('PROVINCIA')}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${
              mapMode === 'PROVINCIA'
                ? 'bg-[#d4b26a] text-slate-950 shadow'
                : 'bg-[#121926] text-slate-300 border border-[#263142] hover:bg-[#192334]'
            }`}
          >
            Por provincia
          </button>
          <button
            type="button"
            onClick={() => setMapMode('DEPARTAMENTO')}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${
              mapMode === 'DEPARTAMENTO'
                ? 'bg-[#d4b26a] text-slate-950 shadow'
                : 'bg-[#121926] text-slate-300 border border-[#263142] hover:bg-[#192334]'
            }`}
          >
            Por departamento
          </button>
        </div>
      </div>
      <div className="pt-1">
        <ElectionResultsSvgMap
          provinces={state.provinces}
          mode={mapMode}
          results={escrutinio.results}
        />
      </div>
    </div>
  );
}

export function ElectionNightModal({
  isOpen,
  stageType,
  state,
  onProceed,
  onRetryCampaign,
  onNewGameSetup,
  onBreakPartySplit
}: ElectionNightModalProps) {
  const escrutinio = useMemo(() => computeEscrutinio(stageType, state), [stageType, state]);

  if (!isOpen) {
    return null;
  }

  const stageHeader = resolveElectionStageHeader(stageType);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#090d14] border-2 border-[#8a6d33]/80 rounded-sm w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8 bg-gradient-to-r from-[#131924] via-[#101620] to-[#171410] border-b border-[#263142] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#d4b26a]">
              {stageHeader}
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-[#0b0f17] border border-[#2c384b] text-[10px] font-mono text-slate-400">
              CÁMARA NACIONAL ELECTORAL
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">{escrutinio.verdictTitle}</h1>
          <p className="text-sm text-slate-300 font-medium">{escrutinio.verdictSubtitle}</p>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <ElectionResultsTable results={escrutinio.results} />
          <ElectionStatsGrid escrutinio={escrutinio} />

          <div className="space-y-2">
            {escrutinio.results.map((r) => (
              <div key={r.fuerza} className="space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                  <span>{r.fuerza}</span>
                  <span>{r.pct.toFixed(1).replace('.', ',')} %</span>
                </div>
                <div className="w-full h-2 rounded-sm bg-[#0c1119] border border-[#1d2636] overflow-hidden">
                  <div
                    style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                    className="h-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <OfficialResultsMapSection state={state} escrutinio={escrutinio} />
        </div>

        <ElectionModalFooter
          stageType={stageType}
          escrutinio={escrutinio}
          role={state.targetRole}
          onProceed={onProceed}
          onRetryCampaign={onRetryCampaign}
          onNewGameSetup={onNewGameSetup}
          onBreakPartySplit={onBreakPartySplit}
        />
      </div>
    </div>
  );
}
