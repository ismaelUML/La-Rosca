import React, { useState } from 'react';
import { OfficialInstitutionLogo } from './OfficialLogoBadge.js';
import { RoscaLogoMark } from '../../components/ui/RoscaLogoMark.js';

// Pantalla de inicio en estetica La Rosca (Obsidiana + Rosado Casa Rosada + Papel Crema):
// portada editorial de estrategia politica argentina 2027.

interface LandingScreenProps {
  hasSavedSession: boolean;
  importError?: string | null;
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onImportPortableCode: (code: string) => boolean;
  onClearImportError?: () => void;
}

const BRIEFING_ITEMS = [
  { code: 'FRENTE 01', title: 'Banco Central y Dólar', detail: 'Reservas netas, brecha cambiaria, tasa e inflación mensual.' },
  { code: 'FRENTE 02', title: 'Congreso y Gobernadores', detail: 'Negociación por voto en Cámaras, ATN y coparticipación.' },
  { code: 'FRENTE 03', title: 'Energía, Gremios y Corte', detail: 'Subsidios CAMMESA, paritarias sectoriales y Comodoro Py.' }
];

function CodeImportBox({
  codeText,
  importError,
  onChangeCode,
  onSubmit,
  onRetry
}: {
  codeText: string;
  importError?: string | null;
  onChangeCode: (val: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="mt-4 p-3 rounded-sm bg-[#0e070b] border border-white/20 space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={codeText}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder="Pegá acá tu código ARG2027Z:..."
          className="flex-1 bg-[#090407] border border-white/15 rounded-sm px-3 py-2 text-xs font-mono text-[#EFE9DA]"
        />
        <button
          type="button"
          onClick={onSubmit}
          className="hoi-btn-gold px-4 py-2 rounded-sm text-xs font-extrabold uppercase tracking-wider"
        >
          Cargar
        </button>
      </div>
      {importError ? (
        <div className="p-2.5 rounded-sm bg-rose-950/70 border border-rose-700/70 flex items-center justify-between gap-2 text-xs text-rose-200">
          <span>{importError}</span>
          <button
            type="button"
            onClick={onRetry}
            className="px-2 py-1 rounded-sm bg-rose-800 hover:bg-rose-700 text-white font-semibold shrink-0"
          >
            Reintentar
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function LandingScreen({
  hasSavedSession,
  importError,
  onStartNewGame,
  onContinueGame,
  onImportPortableCode,
  onClearImportError
}: LandingScreenProps) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeText, setCodeText] = useState('');

  const handleLoadCode = () => {
    if (!codeText.trim()) return;
    if (onImportPortableCode(codeText.trim())) {
      setShowCodeModal(false);
    }
  };

  const continueLabel = hasSavedSession ? 'Continuar Operación' : 'Escenario Rápido (2027)';

  return (
    <div className="min-h-screen rosca-obsidian-stage flex items-center justify-center p-4 sm:p-8">
      <div className="hoi-panel rounded-lg w-full max-w-5xl overflow-hidden border border-[#EB3F7D]/45 shadow-2xl">
        <div className="bg-[#16080f] border-b border-[#EB3F7D]/40 px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <OfficialInstitutionLogo institution="ESCUDO_NACIONAL" heightPx={26} />
            <OfficialInstitutionLogo institution="PRESIDENCIA" heightPx={24} />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#F5EFE6]">
              REPÚBLICA ARGENTINA · SALA DE SITUACIÓN 2027
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#EB3F7D]">
            SIMULADOR DE ALTA ESTRATEGIA POLÍTICA
          </span>
        </div>

        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2 border-l-4 border-[#EB3F7D] pl-4">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#EB3F7D]">
                <RoscaLogoMark size={20} />
                <span>COMANDO NACIONAL</span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl tracking-wide uppercase text-[#F5EFE6] leading-none">
                LA ROSCA
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1 max-w-lg">
                Campaña presidencial, interna partidaria y 48 meses de gobierno bajo fuego real: dólar, Congreso,
                gobernadores, sindicatos y Comodoro Py.
              </p>
            </div>

            <div className="space-y-2.5 max-w-md">
              <button
                type="button"
                onClick={onStartNewGame}
                className="hoi-btn-gold w-full py-3 px-5 rounded text-sm font-extrabold uppercase tracking-wider flex items-center justify-between transition"
              >
                <span>Nueva Campaña / Gobierno</span>
                <span className="text-[10px] font-mono opacity-85">INICIAR →</span>
              </button>

              <button
                type="button"
                onClick={onContinueGame}
                className="w-full py-2.5 px-5 rounded bg-[#EFE9DA] hover:bg-[#f7f2e7] border border-[#d6cebc] text-[#090407] text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition"
              >
                <span>{continueLabel}</span>
                <span className="text-[10px] font-mono text-[#B82358] font-bold">REANUDAR</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCodeModal(!showCodeModal)}
                className="w-full py-2.5 px-5 rounded bg-[#140b10] hover:bg-[#1e1018] border border-white/15 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center justify-between transition"
              >
                <span>Importar Código Zlib</span>
                <span className="text-[10px] font-mono text-slate-400">ARG2027Z</span>
              </button>
            </div>

            {showCodeModal ? (
              <CodeImportBox
                codeText={codeText}
                importError={importError}
                onChangeCode={(val) => {
                  setCodeText(val);
                  onClearImportError?.();
                }}
                onSubmit={handleLoadCode}
                onRetry={handleLoadCode}
              />
            ) : null}
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="bg-[#180b12] border-b border-[#EB3F7D]/50 px-3.5 py-2 rounded-t">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#EFE9DA]">
                DOSSIER OPERATIVO · TABLERO 2027
              </span>
            </div>
            <div className="space-y-2">
              {BRIEFING_ITEMS.map((item) => (
                <div
                  key={item.code}
                  className="rounded bg-[#0b0508] border border-white/15 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#EB3F7D]">{item.code}</span>
                    <span className="text-[10px] font-mono text-slate-400">ACTIVO</span>
                  </div>
                  <div className="text-xs font-bold text-[#F5EFE6]">{item.title}</div>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
