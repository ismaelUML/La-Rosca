import React, { useState } from 'react';
import type { CabinetMinister } from '@argentina-sim/domain';
import { RefreshCw, Shield, UserCheck, UserPlus } from 'lucide-react';
import { MinisterReplacementModal } from './MinisterReplacementModal.js';

// Vista de Gabinete: placas de carteras ministeriales con monograma tecnico,
// barras de desempeno, riesgo de desgaste y recambio de coalicion.

interface CabinetViewProps {
  ministers: CabinetMinister[];
  onReinforceMinister: (id: string) => void;
  onReplaceMinister?: (id: string) => void;
  onAppointMinister?: (ministryId: string, newMinister: CabinetMinister) => void;
  playerPartySigla?: string;
  coalitionParties?: string[];
}

function checkIsMinisterVacant(m: CabinetMinister): boolean {
  return m.ministerName.includes('Vacante') || m.competence === 0;
}

function extractInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'VAC';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

function CabinetInaugurationBanner({ assignedCount }: { assignedCount: number }) {
  if (assignedCount >= 10) return null;

  return (
    <div className="p-4 rounded-sm bg-[#162233] border border-[#8a6d33] flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
          NOMBRAMIENTO INICIAL DEL GABINETE NACIONAL
        </div>
        <p className="text-sm font-bold text-slate-100">
          Carteras pendientes de designación presidencial
        </p>
        <p className="text-xs text-slate-300">
          Designá titulares para cada ministerio según competencia técnica, lealtad y cuotas de coalición.
        </p>
      </div>
      <div className="shrink-0 px-3 py-1.5 rounded-sm bg-[#0b1018] border border-[#263142] text-xs font-mono font-bold text-amber-200 text-center">
        {assignedCount} / 10 CUBIERTAS
      </div>
    </div>
  );
}

function MinisterBadge({ minister, isVacant }: { minister: CabinetMinister; isVacant: boolean }) {
  if (isVacant) {
    return (
      <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#2d210b] text-amber-300 border border-amber-700/70 uppercase tracking-wider">
        VACANTE
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#17202e] text-slate-200 border border-[#334155]">
        {minister.partySigla} · {minister.affinityPct}%
      </span>
      {minister.isCoalitionQuota ? (
        <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#2d210b] text-amber-300 border border-amber-700/60">
          CUOTA
        </span>
      ) : null}
    </div>
  );
}

function MinisterActionButtons({
  isVacant,
  onReinforce,
  onDesignar
}: {
  isVacant: boolean;
  onReinforce: () => void;
  onDesignar: () => void;
}) {
  if (isVacant) {
    return (
      <button
        type="button"
        onClick={onDesignar}
        className="hoi-btn-gold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-extrabold uppercase tracking-wider transition"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Designar</span>
      </button>
    );
  }

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={onReinforce}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#162233] hover:bg-[#1f3047] border border-[#2c3f59] text-[11px] font-semibold text-slate-200"
      >
        <Shield className="w-3 h-3 text-emerald-400" />
        <span>Respaldar</span>
      </button>
      <button
        type="button"
        onClick={onDesignar}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#141922] hover:bg-[#361318] border border-[#2a3648] text-[11px] font-semibold text-slate-300"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Relevar</span>
      </button>
    </div>
  );
}

function MinisterPortrait({ minister, isVacant }: { minister: CabinetMinister; isVacant: boolean }) {
  if (isVacant) {
    return (
      <div className="w-11 h-11 shrink-0 rounded-sm border bg-[#2d210b] border-[#8a6d33] text-amber-300 flex items-center justify-center font-mono">
        <UserPlus className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div className="w-11 h-11 shrink-0 rounded-sm border bg-[#17253b] border-[#354b6e] text-amber-100 flex flex-col items-center justify-center font-mono">
      <span className="text-xs font-extrabold leading-none">{extractInitials(minister.ministerName)}</span>
      <UserCheck className="w-3 h-3 mt-0.5 opacity-70" />
    </div>
  );
}

function MinisterCard({
  minister,
  onReinforce,
  onOpenReplace
}: {
  minister: CabinetMinister;
  onReinforce: () => void;
  onOpenReplace: () => void;
}) {
  const isVacant = checkIsMinisterVacant(minister);
  const borderCls = isVacant ? 'border-[#8a6d33]' : 'border-[#263142]';
  const nameCls = isVacant ? 'text-amber-300' : 'text-slate-100';
  const effectCls = isVacant ? 'text-amber-300' : 'text-emerald-300';

  return (
    <div className={`rounded-sm bg-[#11161f] border p-4 flex flex-col justify-between gap-3.5 ${borderCls}`}>
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <MinisterPortrait minister={minister} isVacant={isVacant} />
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                {minister.ministryName}
              </div>
              <div className={`text-sm font-extrabold mt-0.5 ${nameCls}`}>
                {minister.ministerName}
              </div>
            </div>
          </div>
          <MinisterBadge minister={minister} isVacant={isVacant} />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3.5 text-xs">
          <div className="p-2 rounded-sm bg-[#0b1018] border border-[#222c3c]">
            <div className="text-[10px] font-mono uppercase text-slate-400">Idoneidad</div>
            <div className="font-mono font-bold text-slate-100 text-sm">{minister.competence}</div>
          </div>
          <div className="p-2 rounded-sm bg-[#0b1018] border border-[#222c3c]">
            <div className="text-[10px] font-mono uppercase text-slate-400">Lealtad</div>
            <div className="font-mono font-bold text-emerald-400 text-sm">{minister.loyalty}</div>
          </div>
          <div className="p-2 rounded-sm bg-[#0b1018] border border-[#222c3c]">
            <div className="text-[10px] font-mono uppercase text-slate-400">Desgaste</div>
            <div className="font-mono font-bold text-amber-400 text-sm">{minister.risk}</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400 uppercase">Gestión de cartera</span>
            <span className="font-bold text-slate-100">{minister.performance}/100</span>
          </div>
          <div className="w-full h-1.5 rounded-sm bg-[#0b1018] border border-[#222c3c] overflow-hidden">
            <div style={{ width: `${minister.performance}%` }} className="h-full bg-[#b89342]" />
          </div>
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#222c3c] flex items-center justify-between gap-2">
        <span className={`text-[11px] font-mono line-clamp-1 ${effectCls}`}>
          {minister.monthlyEffectText}
        </span>
        <MinisterActionButtons
          isVacant={isVacant}
          onReinforce={onReinforce}
          onDesignar={onOpenReplace}
        />
      </div>
    </div>
  );
}

export function CabinetView({
  ministers,
  onReinforceMinister,
  onReplaceMinister,
  onAppointMinister,
  playerPartySigla,
  coalitionParties
}: CabinetViewProps) {
  const [replacingMinistry, setReplacingMinistry] = useState<CabinetMinister | null>(null);

  const handleConfirmReplacement = (newMinister: CabinetMinister) => {
    if (!replacingMinistry) return;
    if (onAppointMinister) {
      onAppointMinister(replacingMinistry.id, newMinister);
    } else {
      onReplaceMinister?.(replacingMinistry.id);
    }
    setReplacingMinistry(null);
  };

  const assignedCount = ministers.filter((m) => !checkIsMinisterVacant(m)).length;

  return (
    <div className="space-y-4">
      <div className="border-b border-[#263142] pb-3">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
          DESPACHO PRESIDENCIAL · 10 CARTERAS
        </div>
        <h1 className="text-2xl font-serif font-black text-slate-100 mt-0.5">Gabinete Nacional</h1>
      </div>

      <CabinetInaugurationBanner assignedCount={assignedCount} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {ministers.map((m) => (
          <MinisterCard
            key={m.id}
            minister={m}
            onReinforce={() => onReinforceMinister(m.id)}
            onOpenReplace={() => setReplacingMinistry(m)}
          />
        ))}
      </div>

      {replacingMinistry ? (
        <MinisterReplacementModal
          ministry={replacingMinistry}
          playerPartySigla={playerPartySigla ?? 'LLA'}
          coalitionParties={coalitionParties ?? []}
          onConfirm={handleConfirmReplacement}
          onClose={() => setReplacingMinistry(null)}
        />
      ) : null}
    </div>
  );
}
