import React from 'react';
import type { MidtermElection2029Result } from '@argentina-sim/domain';
import { ViewportModalPortal } from '../../components/ui/ViewportModalPortal.js';
import { formatArNumber } from '../../lib/formatters.js';

// Modal de Legislativas de Medio Término (Octubre 2029): se monta por portal en body
// para no quedar recortado dentro de ninguna ventana flotante del escritorio.

function formatSignedSeats(delta: number): string {
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

function resolveDeltaTone(delta: number): string {
  if (delta > 0) return 'text-emerald-300';
  if (delta < 0) return 'text-rose-400';
  return 'text-[#EFE9DA]';
}

function MidtermStatTile({
  label,
  value,
  toneClass = 'text-[#F5EFE6]'
}: {
  label: string;
  value: string;
  toneClass?: string;
}) {
  return (
    <div className="bg-[#12080d] border border-white/15 p-3.5 rounded-sm">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`font-display text-2xl tracking-wide mt-1 ${toneClass}`}>{value}</div>
    </div>
  );
}

export function MidtermElection2029Modal({
  result,
  onDismiss
}: {
  result: MidtermElection2029Result;
  onDismiss: () => void;
}) {
  return (
    <ViewportModalPortal>
      <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
        <div className="my-auto w-full max-w-2xl bg-[#0b0508] border-2 border-[#EB3F7D] shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-6 md:p-8 space-y-6">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#EB3F7D] text-[#090407] text-[10px] font-mono font-extrabold uppercase tracking-widest">
              ESCRUTINIO PROVISORIO · LEGISLATIVAS OCTUBRE 2029
            </div>
            <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wide text-[#F5EFE6] leading-tight">
              {result.verdictLabel}
            </h2>
            <p className="text-sm text-[#EFE9DA]/85 leading-relaxed">{result.headline}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MidtermStatTile
              label="Tu Fuerza"
              value={`${formatArNumber(result.playerVotePct, 1)} %`}
              toneClass="text-[#EB3F7D]"
            />
            <MidtermStatTile
              label="Primera Oposición"
              value={`${formatArNumber(result.oppositionVotePct, 1)} %`}
            />
            <MidtermStatTile
              label="Diputados (127 ren.)"
              value={`${formatSignedSeats(result.deputiesDelta)} bancas`}
              toneClass={resolveDeltaTone(result.deputiesDelta)}
            />
            <MidtermStatTile
              label="Senadores (24 ren.)"
              value={`${formatSignedSeats(result.senateDelta)} bancas`}
              toneClass={resolveDeltaTone(result.senateDelta)}
            />
          </div>

          <div className="text-xs font-mono text-slate-300 bg-[#140b10] border border-white/10 p-3.5">
            La nueva composición ya impactó en ambas Cámaras (257 Diputados / 72 Senadores). Revisá tus votos en{' '}
            <strong className="text-[#EB3F7D]">Política y Congreso → Cámaras</strong>.
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-3 bg-[#EB3F7D] hover:bg-[#f2558d] text-[#090407] font-mono font-extrabold text-xs uppercase tracking-widest transition"
          >
            Continuar Mandato con el Nuevo Congreso →
          </button>
        </div>
      </div>
    </ViewportModalPortal>
  );
}
