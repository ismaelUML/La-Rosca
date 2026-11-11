import React from 'react';
import type { GameSetupConfiguration, SimulationState } from '@argentina-sim/domain';
import { PartyEmblemSvg } from '../party-setup/PartyEmblemSvg.js';

// Shell principal dentro de la partida calcado de la captura 1:
// barra superior oscura con bandera, ID de sesion, insignia partidaria, fecha, presupuesto y botones Guardar/Salir,
// mas barra lateral izquierda agrupada por DESPACHO, ECONOMIA, PRESUPUESTO, CONGRESO Y JUSTICIA, FEDERALISMO.

export type InGameSidebarSection =
  | 'DESPACHO_RESUMEN'
  | 'GABINETE'
  | 'REGISTRO'
  | 'INDICADORES'
  | 'POLITICA_ECONOMICA'
  | 'MEDIDAS'
  | 'ENERGIA_Y_PARITARIAS'
  | 'FINANCIAMIENTO'
  | 'IMPUESTOS'
  | 'IMPUESTOS_PROPIOS'
  | 'RIGI'
  | 'CAMARAS'
  | 'CONGRESO_Y_JUSTICIA'
  | 'PROVINCIAS_Y_DEFENSA';

const SIDEBAR_GROUPS: Array<{
  groupTitle: string;
  items: Array<{ id: InGameSidebarSection; label: string }>;
}> = [
  {
    groupTitle: 'DESPACHO',
    items: [
      { id: 'DESPACHO_RESUMEN', label: 'Despacho' },
      { id: 'GABINETE', label: 'Gabinete' },
      { id: 'REGISTRO', label: 'Registro' }
    ]
  },
  {
    groupTitle: 'ECONOMÍA',
    items: [
      { id: 'INDICADORES', label: 'Indicadores' },
      { id: 'POLITICA_ECONOMICA', label: 'Política económica' },
      { id: 'MEDIDAS', label: 'Medidas' },
      { id: 'ENERGIA_Y_PARITARIAS', label: 'CAMMESA y Paritarias' }
    ]
  },
  {
    groupTitle: 'PRESUPUESTO',
    items: [
      { id: 'FINANCIAMIENTO', label: 'Financiamiento' },
      { id: 'IMPUESTOS', label: 'Impuestos' },
      { id: 'IMPUESTOS_PROPIOS', label: 'Impuestos propios' },
      { id: 'RIGI', label: 'RIGI' }
    ]
  },
  {
    groupTitle: 'POLÍTICA Y CONGRESO',
    items: [
      { id: 'CAMARAS', label: 'Cámaras (Diputados y Senado)' },
      { id: 'CONGRESO_Y_JUSTICIA', label: 'Votaciones y Corte Suprema' }
    ]
  },
  {
    groupTitle: 'TERRITORIO Y DEFENSA',
    items: [{ id: 'PROVINCIAS_Y_DEFENSA', label: '24 Provincias y FF.AA.' }]
  }
];

const ROLE_LABELS: Record<GameSetupConfiguration['role'], string> = {
  PRESIDENTE: 'Presidencia',
  GOBERNADOR: 'Gobernación',
  DIPUTADO: 'Diputado Nac.',
  SENADOR: 'Senador Nac.'
};

function formatGameDate(turnMonth: number): string {
  const months = [
    'diciembre',
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre'
  ];
  const idx = (turnMonth - 1) % 12;
  const year = 2027 + Math.floor(turnMonth / 12);
  return `1 de ${months[idx]} de ${year}`;
}

interface GameSidebarLayoutProps {
  setup: GameSetupConfiguration;
  state: SimulationState;
  activeSection: InGameSidebarSection;
  portableSaveBanner: string | null;
  onSelectSection: (sec: InGameSidebarSection) => void;
  onAdvanceTurn: () => void;
  onExportSaveCode: () => void;
  onCloseSaveBanner: () => void;
  onExitToMenu: () => void;
  children: React.ReactNode;
}

export function GameSidebarLayout({
  setup,
  state,
  activeSection,
  portableSaveBanner,
  onSelectSection,
  onAdvanceTurn,
  onExportSaveCode,
  onCloseSaveBanner,
  onExitToMenu,
  children
}: GameSidebarLayoutProps) {
  const argentumsBudget = (4132.2 + state.treasury.primaryResultPctGdp * 340).toFixed(1);

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
            <strong>{setup.party.sigla}</strong> · {setup.party.colorName} · {ROLE_LABELS[setup.role]}
          </span>

          <span className="px-2.5 py-1 rounded-full bg-[#131722] border border-slate-800 text-xs text-slate-200 whitespace-nowrap">
            {formatGameDate(state.turnMonth)}
          </span>

          <span className="px-2.5 py-1 rounded-full bg-[#131722] border border-slate-800 text-xs font-semibold text-white">
            Gobierno
          </span>

          <span className="px-2.5 py-1 rounded-full bg-[#131722] border border-slate-800 text-xs text-slate-200 whitespace-nowrap">
            ¥ Presupuesto <strong>{argentumsBudget}</strong> argentums
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-amber-400 text-xs px-1 select-none hidden sm:inline">★</span>
          <button
            type="button"
            onClick={onAdvanceTurn}
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
        <aside className="w-56 shrink-0 bg-[#0b0d14] border-r border-slate-800/80 overflow-y-auto p-3 space-y-5">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.groupTitle}>
              <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {group.groupTitle}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
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
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-6 max-w-6xl">
          {portableSaveBanner ? (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/70 flex items-center justify-between gap-4">
              <div className="text-xs text-emerald-200 truncate">
                Partida guardada en este dispositivo con compresión Zlib Base64URL (sin errores 500 de JSON):{' '}
                <code className="font-mono text-emerald-300">{portableSaveBanner}</code>
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

