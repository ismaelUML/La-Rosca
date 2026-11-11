import React, { useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';

// Vista de POLÍTICO -> Partido en las provincias (captura de referencia del usuario):
// cronograma electoral provincial desdoblado en 4 turnos de 6 jurisdicciones (2028 a 2031),
// armado de listas locales y dial circular de estado de la formula partidaria.

interface ProvincialElectionItem {
  id: string;
  name: string;
  electionDate: string;
  formulaStartDate: string;
  currentGovernor: string;
  currentParty: string;
}

const ELECTION_TURNS: Record<string, ProvincialElectionItem[]> = {
  '2028': [
    { id: 'TIERRA_DEL_FUEGO', name: 'Tierra del Fuego', electionDate: '12 de marzo de 2028', formulaStartDate: 'marzo de 2027', currentGovernor: 'Gustavo Melella', currentParty: 'UxP' },
    { id: 'MISIONES', name: 'Misiones', electionDate: '9 de abril de 2028', formulaStartDate: 'abril de 2027', currentGovernor: 'Hugo Passalacqua', currentParty: 'FRC' },
    { id: 'LA_PAMPA', name: 'La Pampa', electionDate: '14 de mayo de 2028', formulaStartDate: 'mayo de 2027', currentGovernor: 'Sergio Ziliotto', currentParty: 'UxP' },
    { id: 'MENDOZA', name: 'Mendoza', electionDate: '11 de junio de 2028', formulaStartDate: 'junio de 2027', currentGovernor: 'Alfredo Cornejo', currentParty: 'UCR' },
    { id: 'CHACO', name: 'Chaco', electionDate: '9 de julio de 2028', formulaStartDate: 'julio de 2027', currentGovernor: 'Leandro Zdero', currentParty: 'UCR' },
    { id: 'PBA', name: 'Buenos Aires', electionDate: '10 de septiembre de 2028', formulaStartDate: 'septiembre de 2027', currentGovernor: 'Axel Kicillof', currentParty: 'UxP' }
  ],
  '2029': [
    { id: 'CORDOBA', name: 'Córdoba', electionDate: '24 de junio de 2029', formulaStartDate: 'junio de 2028', currentGovernor: 'Martín Llaryora', currentParty: 'PF' },
    { id: 'SANTA_FE', name: 'Santa Fe', electionDate: '15 de julio de 2029', formulaStartDate: 'julio de 2028', currentGovernor: 'Maximiliano Pullaro', currentParty: 'UCR' },
    { id: 'CABA', name: 'Ciudad de Buenos Aires', electionDate: '21 de octubre de 2029', formulaStartDate: 'octubre de 2028', currentGovernor: 'Jorge Macri', currentParty: 'PRO' },
    { id: 'ENTRE_RIOS', name: 'Entre Ríos', electionDate: '9 de junio de 2029', formulaStartDate: 'junio de 2028', currentGovernor: 'Rogelio Frigerio', currentParty: 'PRO' },
    { id: 'TUCUMAN', name: 'Tucumán', electionDate: '11 de junio de 2029', formulaStartDate: 'junio de 2028', currentGovernor: 'Osvaldo Jaldo', currentParty: 'PJ' },
    { id: 'SALTA', name: 'Salta', electionDate: '14 de mayo de 2029', formulaStartDate: 'mayo de 2028', currentGovernor: 'Gustavo Sáenz', currentParty: 'PF' }
  ]
};

interface CampaignPartidoProvinciasViewProps {
  state: CampaignSimulationState;
}

export function CampaignPartidoProvinciasView({ state: _state }: CampaignPartidoProvinciasViewProps) {
  const [selectedTurn, setSelectedTurn] = useState<'2028' | '2029'>('2028');
  const [selectedProvId, setSelectedProvId] = useState('TIERRA_DEL_FUEGO');

  const items = ELECTION_TURNS[selectedTurn] ?? ELECTION_TURNS['2028']!;
  const currentItem = items.find((p) => p.id === selectedProvId) ?? items[0]!;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
          POLÍTICO
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
          Partido en las provincias
        </h1>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 text-xs text-slate-300 leading-relaxed">
        Las 24 jurisdicciones votan en cuatro turnos de 6 (2028, 2029, 2030 y 2031, y cada cuatro años después); en 2027 no se elige ningún gobernador. La fórmula se elige un año antes de cada elección.
      </div>

      <div className="flex flex-wrap gap-2">
        {(['2028', '2029'] as const).map((turn) => (
          <button
            key={turn}
            type="button"
            onClick={() => setSelectedTurn(turn)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              selectedTurn === turn
                ? 'bg-white text-slate-950 border-white shadow'
                : 'bg-[#10131b] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            Turno {turn}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((prov) => {
          const isSelected = prov.id === selectedProvId;
          return (
            <button
              key={prov.id}
              type="button"
              onClick={() => setSelectedProvId(prov.id)}
              className={`text-left p-4 rounded-2xl bg-[#10131b] border transition flex flex-col justify-between h-48 ${
                isSelected ? 'border-white ring-2 ring-white/50 bg-[#161b2a]' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-extrabold text-white text-sm leading-tight">{prov.name}</div>
                <div className="text-[10px] text-slate-400 mt-1">{prov.electionDate}</div>
              </div>

              <div className="w-16 h-16 mx-auto rounded-full border-4 border-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                sin datos
              </div>

              <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider text-center">
                Fórmula desde {prov.formulaStartDate}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-2">
        <h3 className="text-lg font-extrabold text-white">{currentItem.name}</h3>
        <p className="text-xs text-slate-300">
          Gobierna <strong>{currentItem.currentGovernor}</strong> ({currentItem.currentParty}).
        </p>
        <p className="text-xs text-slate-400">
          La elección es el {currentItem.electionDate}. La fórmula de tu partido se elige desde un año antes para asegurar armado de listas y fiscales.
        </p>
      </div>
    </div>
  );
}

