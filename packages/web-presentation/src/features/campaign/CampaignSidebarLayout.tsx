import React from 'react';
import type { CampaignSimulationState, GameSetupConfiguration } from '@argentina-sim/domain';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';

export type CampaignNavSection = 'RESUMEN' | 'IMAGEN_Y_MAPA' | 'ACCIONES_CAMPAÑA';

interface CampaignSidebarLayoutProps {
  setup: GameSetupConfiguration;
  state: CampaignSimulationState;
  activeSection: CampaignNavSection;
  portableSaveBanner: string | null;
  onSelectSection: (sec: CampaignNavSection) => void;
  onAdvanceMonth: () => void;
  onSkipToGovernment: () => void;
  onExportSaveCode: () => void;
  onCloseSaveBanner: () => void;
  onExitToMenu: () => void;
  children: React.ReactNode;
}

const CAMPAIGN_NAV_ITEMS: Array<{ id: CampaignNavSection; label: string }> = [
  { id: 'RESUMEN', label: 'Resumen' },
  { id: 'IMAGEN_Y_MAPA', label: 'Imagen y mapa' },
  { id: 'ACCIONES_CAMPAÑA', label: 'Acciones de campaña' }
];

export function CampaignSidebarLayout({
  setup,
  state,
  activeSection,
  portableSaveBanner,
  onSelectSection,
  onAdvanceMonth,
  onSkipToGovernment,
  onExportSaveCode,
  onCloseSaveBanner,
  onExitToMenu,
  children
}: CampaignSidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col">
      <header className="h-14 px-4 bg-[#0b0d14] border-b border-slate-800/90 flex items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-2.5 overflow-x-auto">
          <span className="font-extrabold text-white text-sm whitespace-nowrap flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded-sm bg-gradient-to-b from-sky-400 via-white to-sky-400" />
            ¿Quién quiere gobernar?
          </span>

          <span className="px-2.5 py-1 rounded-full bg-[#131722] border border-slate-800 text-[11px] font-mono text-slate-400">
            {setup.sessionId}
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131722] border border-slate-700/80 text-xs text-slate-200 whitespace-nowrap">
            <PartyEmblemSvg config={setup.party.emblem} size={16} />
            <strong>{setup.party.sigla}</strong> · {setup.party.colorName} · {state.candidateName}
          </span>

          <span className="px-2.5 py-1 rounded-full bg-[#131722] border border-slate-800 text-xs text-slate-200 whitespace-nowrap">
            {state.stage.formattedDate}
          </span>

          <span className="px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-600/60 text-xs font-semibold text-amber-300">
            {state.stage.stageLabel}
          </span>

          <span className="px-2.5 py-1 rounded-full bg-[#131722] border border-slate-800 text-xs text-slate-200 whitespace-nowrap">
            ¥ Presupuesto <strong>{state.budgetArgentums.toFixed(1)}</strong> argentums
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAdvanceMonth}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition shadow"
          >
            Avanzar Mes →
          </button>
          <button
            type="button"
            onClick={onExportSaveCode}
            className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onExitToMenu}
            className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-rose-950/60 border border-slate-700 text-xs font-semibold text-slate-300"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 shrink-0 bg-[#0b0d14] border-r border-slate-800/80 overflow-y-auto p-3 space-y-5 flex flex-col justify-between">
          <div>
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              ■ SITUACIÓN
            </div>
            <div className="space-y-0.5">
              {CAMPAIGN_NAV_ITEMS.map((item) => {
                const isSelected = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-[#1a1f2e] text-white font-semibold'
                        : 'text-slate-300 hover:bg-[#121622] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/70">
            <button
              type="button"
              onClick={onSkipToGovernment}
              className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 transition"
            >
              ⚡ Pasar directamente al Gobierno (Diciembre 2027)
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 max-w-6xl">
          {portableSaveBanner ? (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/70 flex items-center justify-between gap-4">
              <div className="text-xs text-emerald-200 truncate">
                Código portable de campaña: <code className="font-mono text-emerald-300">{portableSaveBanner}</code>
              </div>
              <button
                type="button"
                onClick={onCloseSaveBanner}
                className="text-xs font-semibold text-emerald-300 hover:text-white shrink-0"
              >
                Cerrar
              </button>
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}

