import React from 'react';
import type { CampaignSimulationState, GameSetupConfiguration } from '@argentina-sim/domain';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';

export type CampaignNavSection =
  | 'RESUMEN'
  | 'IMAGEN_Y_MAPA'
  | 'ACCIONES_CAMPAÑA'
  | 'APOYOS'
  | 'CANDIDATURA_COALICIONES'
  | 'PARTIDO_PROVINCIAS'
  | 'APOYO_PROVINCIAS'
  | 'GOBERNANTES'
  | 'POBLACION'
  | 'INMIGRACION'
  | 'EMIGRACION'
  | 'REGISTRO_DIARIO';

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

const CAMPAIGN_NAV_GROUPS = [
  {
    title: 'SITUACIÓN',
    items: [
      { id: 'RESUMEN' as const, label: 'Resumen' },
      { id: 'IMAGEN_Y_MAPA' as const, label: 'Imagen y mapa' }
    ]
  },
  {
    title: 'ESTRATEGIA',
    items: [
      { id: 'ACCIONES_CAMPAÑA' as const, label: 'Acciones' },
      { id: 'APOYOS' as const, label: 'Apoyos' }
    ]
  },
  {
    title: 'POLÍTICO',
    items: [
      { id: 'CANDIDATURA_COALICIONES' as const, label: 'Candidatura y coaliciones' },
      { id: 'PARTIDO_PROVINCIAS' as const, label: 'Partido en las provincias' },
      { id: 'APOYO_PROVINCIAS' as const, label: 'Apoyo en Provincias' },
      { id: 'GOBERNANTES' as const, label: 'Gobernantes' }
    ]
  },
  {
    title: 'PAÍS',
    items: [
      { id: 'POBLACION' as const, label: 'Población' },
      { id: 'INMIGRACION' as const, label: 'Inmigración' },
      { id: 'EMIGRACION' as const, label: 'Emigración' }
    ]
  },
  {
    title: 'DIARIO',
    items: [{ id: 'REGISTRO_DIARIO' as const, label: 'Registro' }]
  }
];

function findActiveCampaignGroup(activeSection: CampaignNavSection) {
  const found = CAMPAIGN_NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeSection));
  return found ?? CAMPAIGN_NAV_GROUPS[0]!;
}

function CampaignTopBar({
  setup,
  state,
  onAdvanceMonth,
  onSkipToGovernment,
  onExportSaveCode,
  onExitToMenu
}: Omit<
  CampaignSidebarLayoutProps,
  'activeSection' | 'portableSaveBanner' | 'onSelectSection' | 'onCloseSaveBanner' | 'children'
>) {
  return (
    <header className="hoi-header-steel px-4 py-2 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-sm bg-[#090d14] border border-[#c9a24d]/70">
            <PartyEmblemSvg config={setup.party.emblem} size={22} />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-serif font-black uppercase tracking-wider text-amber-100">
              CAMPAÑA 2027 · {setup.party.sigla} · {state.candidateName}
            </div>
            <div className="text-[10px] font-mono text-slate-300">
              {state.stage.formattedDate} · {state.stage.stageLabel}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#283447] text-xs font-mono">
            <span className="text-slate-400 mr-1">CAJA:</span>
            <strong className="text-amber-300">${state.budgetArgentums.toFixed(1)}M</strong>
          </div>
          <button
            type="button"
            onClick={onSkipToGovernment}
            className="px-2.5 py-1.5 rounded-sm bg-[#162133] hover:bg-[#1f2e47] border border-[#7d6230]/80 text-[11px] font-mono font-bold text-amber-200"
          >
            Ir a Dic 2027
          </button>
          <button
            type="button"
            onClick={onAdvanceMonth}
            className="hoi-btn-gold px-3.5 py-1.5 rounded-sm font-extrabold text-xs uppercase tracking-wider transition"
          >
            Avanzar Mes
          </button>
          <button
            type="button"
            onClick={onExportSaveCode}
            className="px-2.5 py-1.5 rounded-sm bg-[#0b1018] hover:bg-[#172233] border border-[#334155] text-xs font-semibold text-slate-200"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onExitToMenu}
            className="px-2.5 py-1.5 rounded-sm bg-[#2b1015] hover:bg-[#41171f] border border-rose-800/60 text-xs font-semibold text-rose-200"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}

function CampaignDockNav({
  activeSection,
  objectiveTitle,
  onSelectSection
}: {
  activeSection: CampaignNavSection;
  objectiveTitle: string;
  onSelectSection: (sec: CampaignNavSection) => void;
}) {
  const activeGroup = findActiveCampaignGroup(activeSection);

  return (
    <nav className="bg-[#0b1018] border-b border-[#283447]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-[#1d2738]">
          <div className="flex flex-wrap gap-1">
            {CAMPAIGN_NAV_GROUPS.map((group) => {
              const isGroupActive = group.title === activeGroup.title;
              const cls = isGroupActive
                ? 'bg-[#17253b] text-amber-100 border-t-2 border-x border-[#c9a24d] border-x-[#2e415e]'
                : 'bg-[#0e141f] text-slate-400 hover:text-slate-200 border border-[#1f293b]';
              return (
                <button
                  key={group.title}
                  type="button"
                  onClick={() => {
                    const first = group.items[0];
                    if (first) onSelectSection(first.id);
                  }}
                  className={`px-3 py-1.5 rounded-t-sm text-[11px] font-mono font-bold uppercase tracking-wider transition ${cls}`}
                >
                  {group.title}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-amber-300 pb-1">
            OBJETIVO: <span className="text-slate-100">{objectiveTitle}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 py-2">
          {activeGroup.items.map((item) => {
            const isSelected = activeSection === item.id;
            const itemCls = isSelected
              ? 'bg-[#1d3250] text-amber-200 border-[#c9a24d]'
              : 'bg-[#101622] text-slate-300 hover:bg-[#162032] border-[#283447]';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`px-3 py-1 rounded-sm border text-xs font-semibold transition ${itemCls}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

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
    <div className="min-h-screen text-slate-100 flex flex-col">
      <CampaignTopBar
        setup={setup}
        state={state}
        onAdvanceMonth={onAdvanceMonth}
        onSkipToGovernment={onSkipToGovernment}
        onExportSaveCode={onExportSaveCode}
        onExitToMenu={onExitToMenu}
      />

      <CampaignDockNav
        activeSection={activeSection}
        objectiveTitle={state.stage.objectiveTitle}
        onSelectSection={onSelectSection}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {portableSaveBanner ? (
          <div className="mb-4 p-3 rounded-sm bg-[#0f291e] border border-emerald-700/70 flex items-center justify-between gap-4">
            <div className="text-xs text-emerald-200 truncate font-mono">
              Código portable de campaña: <code className="text-emerald-300">{portableSaveBanner}</code>
            </div>
            <button
              type="button"
              onClick={onCloseSaveBanner}
              className="text-xs font-bold uppercase text-emerald-300 hover:text-white shrink-0"
            >
              Cerrar
            </button>
          </div>
        ) : null}

        {children}
      </main>
    </div>
  );
}
