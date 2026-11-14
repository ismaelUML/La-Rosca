import React, { useState } from 'react';

// Pantalla de inicio estilo comando estrategico (HOI4 / Millennium Dawn):
// panel central metalico con cabecera carmesi, menu de operaciones en bronce/acero
// y dossier de situacion nacional 2027.

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
    <div className="mt-4 p-3 rounded-sm bg-[#0b1018] border border-[#334155] space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={codeText}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder="Pegá acá tu código ARG2027Z:..."
          className="flex-1 bg-[#070a0f] border border-[#283447] rounded-sm px-3 py-2 text-xs font-mono text-amber-200"
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="hoi-panel rounded-sm w-full max-w-5xl overflow-hidden">
        <div className="hoi-header-crimson px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-5 h-3.5 border border-amber-300/60 bg-gradient-to-b from-sky-400 via-white to-sky-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-100">
              REPÚBLICA ARGENTINA · SALA DE SITUACIÓN 2027
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-200/80">
            SIMULADOR DE ALTA ESTRATEGIA POLÍTICA
          </span>
        </div>

        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2 border-l-2 border-[#c9a24d] pl-4">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-400">
                COMANDO NACIONAL
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-amber-50 leading-none">
                LA ROSCA
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                Campaña presidencial, interna partidaria y 48 meses de gobierno bajo fuego real: dólar, Congreso,
                gobernadores, sindicatos y Comodoro Py.
              </p>
            </div>

            <div className="space-y-2.5 max-w-md">
              <button
                type="button"
                onClick={onStartNewGame}
                className="hoi-btn-gold w-full py-3 px-5 rounded-sm text-sm font-extrabold uppercase tracking-wider flex items-center justify-between transition"
              >
                <span>Nueva Campaña / Gobierno</span>
                <span className="text-[10px] font-mono opacity-80">INICIAR</span>
              </button>

              <button
                type="button"
                onClick={onContinueGame}
                className="w-full py-2.5 px-5 rounded-sm bg-[#162133] hover:bg-[#1e2d45] border border-[#344661] text-slate-100 text-xs font-bold uppercase tracking-wider flex items-center justify-between transition"
              >
                <span>{continueLabel}</span>
                <span className="text-[10px] font-mono text-amber-400">REANUDAR</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCodeModal(!showCodeModal)}
                className="w-full py-2.5 px-5 rounded-sm bg-[#101722] hover:bg-[#172131] border border-[#283447] text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-between transition"
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
            <div className="hoi-header-steel px-3.5 py-2 rounded-t-sm">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-200">
                DOSSIER OPERATIVO · TABLERO 2027
              </span>
            </div>
            <div className="space-y-2">
              {BRIEFING_ITEMS.map((item) => (
                <div
                  key={item.code}
                  className="rounded-sm bg-[#0b1018] border border-[#283447] p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400">{item.code}</span>
                    <span className="text-[10px] font-mono text-slate-500">ACTIVO</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100">{item.title}</div>
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
