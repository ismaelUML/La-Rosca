import React, { useState } from 'react';
import {
  FastForward,
  LogOut,
  Map as MapIcon,
  Menu,
  Plus,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { RoscaLogoMark } from '../../components/ui/RoscaLogoMark.js';
import { isSoundEnabled, playUiSound, setSoundEnabled } from '../../lib/gameFeedback.js';

// Shell visual 1:1 de La Rosca (Obsidiana + Rosado Casa Rosada + Papel Crema):
// Topbar centrado con 3 KPIs display, pildora de objetivo, menu hamburguesa y dock lateral 01..05.

export interface HudKpiMetric {
  label: string;
  value: string;
  deltaText?: string;
  deltaTone?: 'positive' | 'negative' | 'neutral';
}

export interface NumberedNavItem<TSection extends string> {
  id: TSection;
  label: string;
}

export interface NumberedNavGroup<TSection extends string> {
  title: string;
  subtitle: string;
  items: NumberedNavItem<TSection>[];
}

interface RoscaTopBarProps {
  dateAndModeLabel: string;
  kpis: [HudKpiMetric, HudKpiMetric, HudKpiMetric];
  objectiveText: string;
  advanceLabel: string;
  hasVisibleWindows: boolean;
  onAdvanceTurn: () => void;
  onExportSaveCode: () => void;
  onToggleDesktop: () => void;
  onResetLayout: () => void;
  onExitToMenu: () => void;
  onSkipToGovernment?: () => void;
}

function TopBarUtilityMenu({
  hasVisibleWindows,
  onExportSaveCode,
  onToggleDesktop,
  onResetLayout,
  onExitToMenu,
  onSkipToGovernment,
  onClose
}: {
  hasVisibleWindows: boolean;
  onExportSaveCode: () => void;
  onToggleDesktop: () => void;
  onResetLayout: () => void;
  onExitToMenu: () => void;
  onSkipToGovernment?: () => void;
  onClose: () => void;
}) {
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playUiSound('tab');
  };

  return (
    <div className="absolute top-12 left-4 z-50 w-60 bg-[#10090d] border border-[#EB3F7D]/65 p-1.5 shadow-2xl space-y-1 rosca-panel-enter">
      <button
        type="button"
        onClick={() => {
          onToggleDesktop();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-mono text-[#F5EFE6] hover:bg-[#EB3F7D]/20 text-left"
      >
        <MapIcon className="w-3.5 h-3.5 text-[#EB3F7D]" />
        <span>{hasVisibleWindows ? 'Minimizar Ventanas (Ver Mapa)' : 'Mostrar Ventanas'}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onResetLayout();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-mono text-[#F5EFE6] hover:bg-[#EB3F7D]/20 text-left"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
        <span>Reordenar Ventanas</span>
      </button>

      <button
        type="button"
        onClick={() => {
          playUiSound('tab');
          onExportSaveCode();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-mono text-[#F5EFE6] hover:bg-[#EB3F7D]/20 text-left"
      >
        <Save className="w-3.5 h-3.5 text-slate-300" />
        <span>Guardar / Exportar Código</span>
      </button>

      <button
        type="button"
        onClick={handleToggleSound}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-mono text-[#F5EFE6] hover:bg-[#EB3F7D]/20 text-left"
      >
        {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#EB3F7D]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
        <span>{soundOn ? 'Sonidos: Activados' : 'Sonidos: Silenciados'}</span>
      </button>

      {onSkipToGovernment ? (
        <button
          type="button"
          onClick={() => {
            onSkipToGovernment();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-mono text-[#EB3F7D] hover:bg-[#EB3F7D]/20 text-left border-t border-white/10"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Ir directo a Dic 2027</span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => {
          onExitToMenu();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-mono text-rose-300 hover:bg-rose-950/60 text-left border-t border-white/10"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Salir al Menú Principal</span>
      </button>
    </div>
  );
}

function resolveDeltaBadgeTone(tone?: HudKpiMetric['deltaTone']): string {
  if (tone === 'positive') return 'text-emerald-300';
  if (tone === 'negative') return 'text-rose-400';
  return 'text-slate-400';
}

function HudKpiItem({ kpi }: { kpi: HudKpiMetric }) {
  return (
    <div className="leading-none text-center sm:text-left">
      <div className="flex items-center justify-center sm:justify-start gap-1.5">
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
          {kpi.label}
        </span>
        {kpi.deltaText ? (
          <span className={`text-[9px] font-mono font-bold ${resolveDeltaBadgeTone(kpi.deltaTone)}`}>
            {kpi.deltaText}
          </span>
        ) : null}
      </div>
      <div className="font-display text-2xl sm:text-[28px] leading-none text-[#F5EFE6] mt-0.5 tabular-nums">
        {kpi.value}
      </div>
    </div>
  );
}

export function RoscaTopBar({
  dateAndModeLabel,
  kpis,
  objectiveText,
  advanceLabel,
  hasVisibleWindows,
  onAdvanceTurn,
  onExportSaveCode,
  onToggleDesktop,
  onResetLayout,
  onExitToMenu,
  onSkipToGovernment
}: RoscaTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative bg-[#090407]/95 border-b border-white/10 px-4 pt-3 pb-2.5 z-40 shrink-0">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playUiSound('tab');
              setMenuOpen((o) => !o);
            }}
            aria-label="Abrir menú de partida"
            className="w-9 h-9 bg-[#EB3F7D] hover:bg-[#f45b93] text-[#090407] flex items-center justify-center transition shrink-0"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <RoscaLogoMark size={28} />

          <div className="leading-none">
            <div className="font-display text-xl tracking-wide uppercase text-[#F5EFE6]">LA ROSCA</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">
              {dateAndModeLabel}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-6 sm:gap-9">
            {kpis.map((kpi) => (
              <HudKpiItem key={kpi.label} kpi={kpi} />
            ))}
          </div>

          <div className="px-3 py-0.5 border border-[#EB3F7D]/65 bg-[#12070c] text-[10px] font-mono text-slate-200 max-w-md truncate">
            <span className="text-[#EB3F7D] font-bold uppercase tracking-wider mr-2">OBJETIVO</span>
            <span>{objectiveText}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playUiSound('turn');
            onAdvanceTurn();
          }}
          className="px-4 py-2 bg-[#14080e] hover:bg-[#EB3F7D] border border-[#EB3F7D] text-[#F5EFE6] hover:text-[#090407] font-mono text-xs font-extrabold uppercase tracking-wider transition active:scale-[0.98] shrink-0"
        >
          {advanceLabel}
        </button>
      </div>

      {menuOpen ? (
        <TopBarUtilityMenu
          hasVisibleWindows={hasVisibleWindows}
          onExportSaveCode={onExportSaveCode}
          onToggleDesktop={onToggleDesktop}
          onResetLayout={onResetLayout}
          onExitToMenu={onExitToMenu}
          onSkipToGovernment={onSkipToGovernment}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
    </header>
  );
}

export function RoscaNumberedNav<TSection extends string>({
  groups,
  browsedGroupTitle,
  activeSection,
  subDrawerOpen,
  onSelectGroup,
  onSelectSection,
  onCloseSubDrawer
}: {
  groups: NumberedNavGroup<TSection>[];
  browsedGroupTitle: string;
  activeSection: TSection;
  subDrawerOpen: boolean;
  onSelectGroup: (title: string) => void;
  onSelectSection: (sec: TSection, openParallel?: boolean) => void;
  onCloseSubDrawer: () => void;
}) {
  const activeGroup = groups.find((g) => g.title === browsedGroupTitle) ?? groups[0]!;

  return (
    <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-start gap-2.5">
      <div className="pointer-events-auto w-56 sm:w-60 bg-[#0d060a]/95 border border-white/20 shadow-2xl divide-y divide-white/10">
        {groups.map((grp, idx) => {
          const isCurrent = grp.title === activeGroup.title;
          const numLabel = String(idx + 1).padStart(2, '0');
          return (
            <button
              key={grp.title}
              type="button"
              onClick={() => {
                playUiSound('tab');
                onSelectGroup(grp.title);
              }}
              className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition ${
                isCurrent
                  ? 'bg-[#EB3F7D] text-[#090407]'
                  : 'text-[#F5EFE6] hover:bg-white/5'
              }`}
            >
              <span
                className={`text-[10px] font-mono font-bold mt-1 shrink-0 ${
                  isCurrent ? 'text-[#090407]/80' : 'text-slate-400'
                }`}
              >
                {numLabel}
              </span>
              <div className="min-w-0">
                <div className="font-display text-lg leading-none uppercase tracking-wide">
                  {grp.title}
                </div>
                <div
                  className={`text-[11px] mt-1 truncate ${
                    isCurrent ? 'text-[#090407]/85 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {grp.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {subDrawerOpen ? (
        <div className="pointer-events-auto w-60 bg-[#0d060a]/95 border border-[#EB3F7D]/65 p-2 shadow-2xl space-y-1 rosca-panel-enter">
          <div className="flex items-center justify-between px-1.5 pb-1.5 border-b border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D]">
              {activeGroup.title}
            </span>
            <button
              type="button"
              onClick={onCloseSubDrawer}
              title="Ocultar lista"
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {activeGroup.items.map((item) => {
            const isSelected = activeSection === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between border transition ${
                  isSelected
                    ? 'bg-[#EB3F7D]/20 border-[#EB3F7D] text-[#F5EFE6]'
                    : 'bg-[#140a10] border-white/10 text-slate-200 hover:border-[#EB3F7D]/60'
                }`}
              >
                <button
                  type="button"
                  onClick={(ev) => onSelectSection(item.id, ev.shiftKey)}
                  className="flex-1 text-left px-2.5 py-1.5 text-xs font-semibold truncate"
                >
                  {item.label}
                </button>
                <button
                  type="button"
                  title={`Abrir "${item.label}" en ventana paralela`}
                  onClick={() => onSelectSection(item.id, true)}
                  className="px-2 py-1.5 text-slate-400 hover:text-[#EB3F7D]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
