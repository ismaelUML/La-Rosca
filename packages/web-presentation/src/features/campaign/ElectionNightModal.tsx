import React, { useMemo } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';
import { ElectionResultsSvgMap } from './ElectionResultsSvgMap.js';

// Modal de Noche Electoral y Escrutinio Oficial (QQG Capturas 9 y 10):
// En Argentina la noche de las urnas es sagrada y dramática: las pantallas del Correo Argentino,
// el padrón oficial de 36.262.373 electores, los votos nominales exactos, el conteo de blancos
// y nulos, y el cálculo constitucional de balotaje (Artículos 97 y 98 de la Constitución Nacional).

export type ElectionStageType = 'PASO' | 'GENERALES' | 'BALOTAJE';

interface CandidateVoteResult {
  fuerza: string;
  candidato: string;
  votos: number;
  pct: number;
  color: string;
  isPlayer: boolean;
}

export interface EscrutinioData {
  padronTotal: number;
  participacionPct: number;
  votosPositivos: number;
  votosBlancos: number;
  votosNulos: number;
  abstencion: number;
  results: CandidateVoteResult[];
  verdictTitle: string;
  verdictSubtitle: string;
  isVictory: boolean;
  isRunoff: boolean;
}

const PADRON_NACIONAL = 36262373;

function resolveCoalitionLabel(partySigla: string, coalitionParties?: string[]): string {
  if (coalitionParties && coalitionParties.length > 0) {
    return `${partySigla} + ${coalitionParties.join(' + ')}`;
  }
  return partySigla;
}

function resolveEscrutinioTitle(isDirectVictory: boolean, isPlayerWinner: boolean, isPaso: boolean): string {
  if (isDirectVictory) {
    return isPlayerWinner ? 'Ganaste en primera vuelta' : 'Ganó la oposición en primera vuelta';
  }
  if (isPaso) {
    return isPlayerWinner ? 'Ganaste las PASO' : 'Quedaste posicionado para las Generales';
  }
  return 'Vas a segunda vuelta';
}

interface NationalPresetTicket {
  partySigla: string;
  fuerza: string;
  candidato: string;
  color: string;
  baseWeight: number;
}

const NATIONAL_TICKETS_POOL: NationalPresetTicket[] = [
  {
    partySigla: 'UxP',
    fuerza: 'UxP + FIT',
    candidato: 'Axel Kicillof (fórmula presidencial con vicepresidencia)',
    color: '#0284c7',
    baseWeight: 44
  },
  {
    partySigla: 'LLA',
    fuerza: 'La Libertad Avanza',
    candidato: 'Javier Milei (fórmula presidencial con vicepresidencia)',
    color: '#8b5cf6',
    baseWeight: 44
  },
  {
    partySigla: 'PRO',
    fuerza: 'Propuesta Republicana (PRO)',
    candidato: 'Mauricio Macri (fórmula presidencial con vicepresidencia)',
    color: '#eab308',
    baseWeight: 20
  },
  {
    partySigla: 'PF',
    fuerza: 'Provincias Unidas / Peronismo Federal',
    candidato: 'Juan Schiaretti (fórmula presidencial con vicepresidencia)',
    color: '#2563eb',
    baseWeight: 16
  },
  {
    partySigla: 'UCR',
    fuerza: 'Unión Cívica Radical',
    candidato: 'Maximiliano Pullaro (fórmula presidencial con vicepresidencia)',
    color: '#dc2626',
    baseWeight: 14
  },
  {
    partySigla: 'FIT',
    fuerza: 'Frente de Izquierda',
    candidato: 'Myriam Bregman (fórmula presidencial con vicepresidencia)',
    color: '#ef4444',
    baseWeight: 6
  }
];

function resolveRivalTickets(playerPartySigla: string, coalitionParties: string[] = []): NationalPresetTicket[] {
  const allied = new Set([playerPartySigla, ...coalitionParties]);
  return NATIONAL_TICKETS_POOL.filter((t) => !allied.has(t.partySigla));
}

function distributeRivalShares(
  rivals: NationalPresetTicket[],
  remainingPct: number,
  votosValidos: number
): CandidateVoteResult[] {
  const sumWeights = rivals.reduce((acc, r) => acc + r.baseWeight, 0) || 1;
  let allocatedPct = 0;
  const results: CandidateVoteResult[] = [];

  for (let i = 0; i < rivals.length; i++) {
    const r = rivals[i]!;
    const isLast = i === rivals.length - 1;
    const share = isLast
      ? Math.max(0.5, Math.round((remainingPct - allocatedPct) * 10) / 10)
      : Math.round(((r.baseWeight / sumWeights) * remainingPct) * 10) / 10;
    allocatedPct += share;
    results.push({
      fuerza: r.fuerza,
      candidato: r.candidato,
      votos: Math.round((votosValidos * share) / 100),
      pct: share,
      color: r.color,
      isPlayer: false
    });
  }
  return results;
}

function computeBalotajeEscrutinio(
  state: CampaignSimulationState,
  votosValidos: number,
  participacionPct: number,
  votosBlancos: number,
  votosNulos: number,
  abstencion: number,
  coalitionLabel: string
): EscrutinioData {
  const playerShare = Math.min(80, Math.max(20, state.votingIntention.intencionVotoGeneral));
  const playerPct = Math.min(78, Math.max(48, Math.round(playerShare * 1.35 * 10) / 10));
  const rivalPct = Math.round((100 - playerPct) * 10) / 10;
  const playerVotes = Math.round((votosValidos * playerPct) / 100);
  const rivalVotes = votosValidos - playerVotes;
  const isPlayerWinner = playerPct > rivalPct;

  const rivals = resolveRivalTickets(state.partySigla, state.coalitionParties);
  const topRival = rivals[0] ?? NATIONAL_TICKETS_POOL[0]!;

  const results: CandidateVoteResult[] = [
    {
      fuerza: coalitionLabel,
      candidato: `${state.candidateName} (fórmula presidencial con vicepresidencia)`,
      votos: playerVotes,
      pct: playerPct,
      color: state.partyColor || '#8b5cf6',
      isPlayer: true
    },
    {
      fuerza: topRival.fuerza,
      candidato: topRival.candidato,
      votos: rivalVotes,
      pct: rivalPct,
      color: topRival.color,
      isPlayer: false
    }
  ];

  return {
    padronTotal: PADRON_NACIONAL,
    participacionPct,
    votosPositivos: votosValidos,
    votosBlancos,
    votosNulos,
    abstencion,
    results,
    verdictTitle: isPlayerWinner ? 'Ganaste la Presidencia' : 'Fuiste derrotado en el balotaje',
    verdictSubtitle: `Sacaste ${playerPct.toFixed(1).replace('.', ',')} % (${playerVotes.toLocaleString('es-AR')} votos).`,
    isVictory: isPlayerWinner,
    isRunoff: false
  };
}

function checkConstitutionalFirstRoundWin(firstPct: number, diffPct: number): boolean {
  if (firstPct >= 45) {
    return true;
  }
  return firstPct >= 40 && diffPct >= 10;
}

function computeGeneralesEscrutinio(
  state: CampaignSimulationState,
  votosValidos: number,
  participacionPct: number,
  votosBlancos: number,
  votosNulos: number,
  abstencion: number,
  coalitionLabel: string,
  stage: ElectionStageType
): EscrutinioData {
  const playerShare = Math.min(80, Math.max(15, state.votingIntention.intencionVotoGeneral));
  const playerPct = Math.round(playerShare * 10) / 10;
  const remainingPct = Math.round((100 - playerPct) * 10) / 10;
  const playerVotes = Math.round((votosValidos * playerPct) / 100);

  const rivals = resolveRivalTickets(state.partySigla, state.coalitionParties);
  const rivalResults = distributeRivalShares(rivals, remainingPct, votosValidos);

  const playerResult: CandidateVoteResult = {
    fuerza: coalitionLabel,
    candidato: `${state.candidateName} (fórmula presidencial con vicepresidencia)`,
    votos: playerVotes,
    pct: playerPct,
    color: state.partyColor || '#8b5cf6',
    isPlayer: true
  };

  const rawResults = [playerResult, ...rivalResults].sort((a, b) => b.pct - a.pct);

  const first = rawResults[0]!;
  const second = rawResults[1] ?? first;
  const diff = first.pct - second.pct;
  const directVictory = checkConstitutionalFirstRoundWin(first.pct, diff);
  const title = resolveEscrutinioTitle(directVictory, first.isPlayer, stage === 'PASO');
  const isRunoff = stage === 'GENERALES' ? !directVictory : false;

  return {
    padronTotal: PADRON_NACIONAL,
    participacionPct,
    votosPositivos: votosValidos,
    votosBlancos,
    votosNulos,
    abstencion,
    results: rawResults,
    verdictTitle: title,
    verdictSubtitle: `Sacaste ${playerPct.toFixed(1).replace('.', ',')} % (${playerVotes.toLocaleString('es-AR')} votos).`,
    isVictory: directVictory && first.isPlayer,
    isRunoff
  };
}

export function computeEscrutinio(
  stage: ElectionStageType,
  state: CampaignSimulationState
): EscrutinioData {
  const isBalotaje = stage === 'BALOTAJE';
  const participacionPct = isBalotaje ? 76.2 : 75.1;
  const electoresVotantes = Math.round((PADRON_NACIONAL * participacionPct) / 100);
  const abstencion = PADRON_NACIONAL - electoresVotantes;
  const votosBlancos = isBalotaje ? 667473 : 530558;
  const votosNulos = isBalotaje ? 370700 : 314092;
  const votosValidos = electoresVotantes - votosBlancos - votosNulos;
  const coalitionLabel = resolveCoalitionLabel(state.partySigla, state.coalitionParties);

  if (isBalotaje) {
    return computeBalotajeEscrutinio(
      state,
      votosValidos,
      participacionPct,
      votosBlancos,
      votosNulos,
      abstencion,
      coalitionLabel
    );
  }

  return computeGeneralesEscrutinio(
    state,
    votosValidos,
    participacionPct,
    votosBlancos,
    votosNulos,
    abstencion,
    coalitionLabel,
    stage
  );
}

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
              🏆 Logro desbloqueado: Ganaste un balotaje
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
