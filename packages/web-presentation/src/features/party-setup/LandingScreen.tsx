import React, { useState } from 'react';

// Pantalla de inicio calcada de la captura 2: titulo gigante, bandera argentina
// inclinada con Sol de Mayo, botones de accion y grilla inferior de 8 tarjetas.

interface LandingScreenProps {
  hasSavedSession: boolean;
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onImportPortableCode: (code: string) => void;
}

function ArgentineFlagIllustration() {
  return (
    <div className="relative w-72 h-44 md:w-80 md:h-48 rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 transform -rotate-3 hover:rotate-0 transition-transform duration-300 select-none">
      <div className="h-1/3 bg-[#74acdf]" />
      <div className="h-1/3 bg-white flex items-center justify-center">
        <svg width="54" height="54" viewBox="0 0 100 100" aria-label="Sol de Mayo">
          <g stroke="#f6b40e" strokeWidth="3.5" strokeLinecap="round">
            <line x1="50" y1="6" x2="50" y2="94" />
            <line x1="6" y1="50" x2="94" y2="50" />
            <line x1="19" y1="19" x2="81" y2="81" />
            <line x1="81" y1="19" x2="19" y2="81" />
            <line x1="33" y1="9" x2="67" y2="91" />
            <line x1="9" y1="33" x2="91" y2="67" />
            <line x1="9" y1="67" x2="91" y2="33" />
            <line x1="33" y1="91" x2="67" y2="9" />
          </g>
          <circle cx="50" cy="50" r="20" fill="#f6b40e" stroke="#d99b00" strokeWidth="2.5" />
          <circle cx="44" cy="46" r="2" fill="#926500" />
          <circle cx="56" cy="46" r="2" fill="#926500" />
          <path d="M44,56 Q50,60 56,56" fill="none" stroke="#926500" strokeWidth="2" />
        </svg>
      </div>
      <div className="h-1/3 bg-[#74acdf]" />
    </div>
  );
}

const LANDING_MENU_CARDS: Array<{ id: string; icon: string; label: string; detail: string }> = [
  { id: 'PARTIDAS', icon: '▤', label: 'Mis partidas', detail: 'Slots locales guardados en navegador y códigos Zlib' },
  { id: 'LOGROS', icon: '★', label: 'Logros (41/122)', detail: 'Hitos desbloqueados: Plan Austral, Pacto de Mayo, 2001' },
  { id: 'HISTORIAL', icon: '↺', label: 'Historial', detail: 'Crónicas presidenciales y autopsias macroeconómicas' },
  { id: 'COMO_JUGAR', icon: '?', label: 'Cómo se juega', detail: 'Guía de BCRA, CAMMESA, Paritarias, Congreso y Corte' },
  { id: 'MODOS', icon: '✦', label: 'Modos de pago', detail: 'Mecenazgo, aportes de campaña, pauta y bonos militantes' },
  { id: 'AJUSTES', icon: '⚙', label: 'Ajustes', detail: 'Velocidad de simulación, semillas PRNG y accesibilidad' },
  { id: 'CONTACTO', icon: '✉', label: 'Contacto', detail: 'Comunidad de modding y reporte de escenarios históricos' },
  { id: 'ONLINE', icon: '●', label: 'Jugadores conectados: 182', detail: 'Simulando campañas y presupuestos en simultáneo' }
];

export function LandingScreen({
  hasSavedSession,
  onStartNewGame,
  onContinueGame,
  onImportPortableCode
}: LandingScreenProps) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeText, setCodeText] = useState('');
  const [selectedInfoCard, setSelectedInfoCard] = useState<string | null>(null);

  const handleLoadCode = () => {
    if (!codeText.trim()) {
      return;
    }
    onImportPortableCode(codeText.trim());
    setShowCodeModal(false);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full px-6 pt-14 pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 pb-12 border-b border-slate-800/80">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 border border-slate-700/80 text-slate-300 mb-5">
              República Argentina · 2027
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              ¿Quién quiere
              <br />
              gobernar?
            </h1>
            <p className="text-slate-400 text-base md:text-lg mt-4 leading-relaxed">
              Estrategia política argentina. Ganá tu interna, la elección y el gobierno; manejá la economía, el Congreso y el mundo.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-7">
              <button
                onClick={onStartNewGame}
                className="px-6 py-3 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition shadow-lg"
              >
                Nueva partida
              </button>
              <button
                onClick={onContinueGame}
                className="px-5 py-3 rounded-xl bg-[#0e121b] border border-slate-700/80 text-slate-200 font-medium text-sm hover:bg-slate-800/70 transition"
              >
                {hasSavedSession ? 'Continuar' : 'Continuar (Escenario rápido)'}
              </button>
              <button
                onClick={() => setShowCodeModal(!showCodeModal)}
                className="px-5 py-3 rounded-xl bg-[#0e121b] border border-slate-700/80 text-slate-200 font-medium text-sm hover:bg-slate-800/70 transition"
              >
                Continuar con código
              </button>
            </div>

            {showCodeModal ? (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  placeholder="Pegá acá tu código ARG2027Z:..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300"
                />
                <button
                  onClick={handleLoadCode}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Cargar partida
                </button>
              </div>
            ) : null}
          </div>

          <ArgentineFlagIllustration />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-8">
          {LANDING_MENU_CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedInfoCard(card.detail)}
              className="text-left px-5 py-4 rounded-xl bg-[#10131c] hover:bg-[#161b26] border border-slate-800/90 transition flex items-center gap-3"
            >
              <span className={card.id === 'ONLINE' ? 'text-emerald-400 text-xs' : 'text-slate-400 text-sm'}>
                {card.icon}
              </span>
              <span className="text-sm font-medium text-slate-200">{card.label}</span>
            </button>
          ))}
        </div>

        {selectedInfoCard ? (
          <div className="mt-4 px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>{selectedInfoCard}</span>
            <button onClick={() => setSelectedInfoCard(null)} className="text-slate-400 hover:text-white">
              Cerrar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

