import React, { useMemo } from 'react';
import {
  computeEscrutinio,
  type CampaignSimulationState,
  type CandidateVoteResult,
  type ElectionStageType,
  type EscrutinioData
} from '@argentina-sim/domain';
import { ElectionResultsSvgMap } from './ElectionResultsSvgMap.js';

export type { ElectionStageType, EscrutinioData };
export { computeEscrutinio };

// Modal de Noche Electoral y Escrutinio Oficial (QQG Capturas 9 y 10):
// La logica matematica de calculo y balotaje vive ahora en @argentina-sim/domain (electionEngine.ts).

function resolveElectionStageHeader(stageType: ElectionStageType): string {
  if (stageType === 'BALOTAJE') {
    return 'SEGUNDA VUELTA · 21 DE NOVIEMBRE DE 2027';
  }
  if (stageType === 'GENERALES') {
    return 'ELECCIONES GENERALES · 24 DE OCTUBRE DE 2027';
  }
  return 'ELECCIONES PRIMARIAS (PASO) · 8 DE AGOSTO DE 2027';
}

function resolveElectionProceedButtonLabel(stageType: ElectionStageType, isRunoff: boolean): string {
  if (stageType === 'BALOTAJE') {
    return 'Asumir la Presidencia de la Nación (10 de diciembre de 2027) ▶';
  }
  if (stageType === 'GENERALES' && isRunoff) {
    return 'Ir al Balotaje Presidencial (21 de noviembre de 2027) ▶';
  }
  return 'Continuar campaña ▶';
}

function ElectionResultsTable({ results }: { results: CandidateVoteResult[] }) {
  return (
    <div className="rounded-2xl bg-[#0f131c] border border-slate-800 overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#080a10] border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400">
          <tr>
            <th className="py-3 px-4">FUERZA</th>
            <th className="py-3 px-4">CANDIDATO</th>
            <th className="py-3 px-4 text-right">VOTOS</th>
            <th className="py-3 px-4 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr
              key={r.fuerza}
              className={`border-b border-slate-800/60 ${
                r.isPlayer ? 'bg-purple-950/20 font-bold' : ''
              }`}
            >
              <td className="py-3 px-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-white">{r.fuerza}</span>
              </td>
              <td className="py-3 px-4 text-slate-300">{r.candidato}</td>
              <td className="py-3 px-4 text-right font-mono text-white">
                {r.votos.toLocaleString('es-AR')}
              </td>
              <td className="py-3 px-4 text-right font-mono font-extrabold text-white">
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0f131c] border border-slate-800 text-xs">
      <div>
        <div className="text-[10px] font-bold uppercase text-slate-400">Participación</div>
        <div className="text-sm font-extrabold text-white mt-0.5">
          {escrutinio.participacionPct.toFixed(1).replace('.', ',')} %{' '}
          <span className="text-xs font-normal text-slate-400">
            de {escrutinio.padronTotal.toLocaleString('es-AR')} electores
          </span>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase text-slate-400">Votos en blanco / nulos</div>
        <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
          {escrutinio.votosBlancos.toLocaleString('es-AR')} /{' '}
          {escrutinio.votosNulos.toLocaleString('es-AR')}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase text-slate-400">Abstención</div>
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
}

export function ElectionNightModal({
  isOpen,
  stageType,
  state,
  onProceed
}: ElectionNightModalProps) {
  const escrutinio = useMemo(() => computeEscrutinio(stageType, state), [stageType, state]);

  if (!isOpen) {
    return null;
  }

  const stageHeader = resolveElectionStageHeader(stageType);
  const proceedBtnLabel = resolveElectionProceedButtonLabel(stageType, escrutinio.isRunoff);
  const isBalotajeWin = stageType === 'BALOTAJE' && escrutinio.isVictory;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0e15] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8 border-b border-slate-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
            {stageHeader}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">{escrutinio.verdictTitle}</h1>
          <p className="text-sm text-slate-300 font-medium">{escrutinio.verdictSubtitle}</p>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <ElectionResultsTable results={escrutinio.results} />
          <ElectionStatsGrid escrutinio={escrutinio} />

          <div className="space-y-2">
            {escrutinio.results.map((r) => (
              <div key={r.fuerza} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{r.fuerza}</span>
                  <span className="font-mono">{r.pct.toFixed(1).replace('.', ',')} %</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[#0f131c] border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Mapa de resultados oficial</span>
              <span className="text-[10px] font-mono text-slate-400">Padrón CNE escrutado 100%</span>
            </div>
            <p className="text-xs text-slate-400">
              Pintado con la fuerza ganadora en los 24 distritos electorales del país.
            </p>
            <div className="flex gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-950 shadow">
                Por provincia
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
                Por departamento
              </span>
            </div>
            <div className="pt-2">
              <ElectionResultsSvgMap provinces={state.provinces} />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-[#080a10] border-t border-slate-800 flex items-center justify-between">
          {isBalotajeWin ? (
            <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl">
              Logro desbloqueado: Ganaste un balotaje
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono">
              Escrutinio provisorio definitivo verificado
            </div>
          )}

          <button
            type="button"
            onClick={onProceed}
            className="px-6 py-3 rounded-2xl text-xs md:text-sm font-extrabold bg-white hover:bg-slate-200 text-slate-950 transition shadow-lg"
          >
            {proceedBtnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
