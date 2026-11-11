import React, { useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';

// Vista de POLÍTICO -> Gobernantes (captura de referencia del usuario):
// mapa de las 24 provincias coloreadas por bloque de poder (Derecha 7, Centro 11, Izquierda 6)
// y ficha de relacion politica, posicion institucional y afinidad de cada mandatario provincial.

interface GovernorInfo {
  provinceId: string;
  provinceName: string;
  governorName: string;
  partyName: string;
  sinceDate: string;
  faction: 'DERECHA' | 'CENTRO' | 'IZQUIERDA';
  factionLabel: string;
  politicalPosition: number;
  affinityWithPlayerPct: number;
  relationshipScore: number;
  color: string;
}

const GOVERNORS_DATASET: GovernorInfo[] = [
  { provinceId: 'PBA', provinceName: 'Buenos Aires', governorName: 'Axel Kicillof', partyName: 'Unión por la Patria', sinceDate: '10 de diciembre de 2023', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -45, affinityWithPlayerPct: 31, relationshipScore: 42, color: '#ef4444' },
  { provinceId: 'CABA', provinceName: 'Ciudad de Buenos Aires', governorName: 'Jorge Macri', partyName: 'PRO', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 65, affinityWithPlayerPct: 84, relationshipScore: 78, color: '#2563eb' },
  { provinceId: 'CORDOBA', provinceName: 'Córdoba', governorName: 'Martín Llaryora', partyName: 'Hacemos Unidos por Córdoba', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 15, affinityWithPlayerPct: 62, relationshipScore: 68, color: '#14b8a6' },
  { provinceId: 'SANTA_FE', provinceName: 'Santa Fe', governorName: 'Maximiliano Pullaro', partyName: 'Unidos para Cambiar Santa Fe', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 30, affinityWithPlayerPct: 71, relationshipScore: 75, color: '#14b8a6' },
  { provinceId: 'MENDOZA', provinceName: 'Mendoza', governorName: 'Alfredo Cornejo', partyName: 'Cambia Mendoza (UCR)', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 55, affinityWithPlayerPct: 75, relationshipScore: 72, color: '#2563eb' },
  { provinceId: 'ENTRE_RIOS', provinceName: 'Entre Ríos', governorName: 'Rogelio Frigerio', partyName: 'Juntos por Entre Ríos', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 52, affinityWithPlayerPct: 80, relationshipScore: 82, color: '#2563eb' },
  { provinceId: 'TUCUMAN', provinceName: 'Tucumán', governorName: 'Osvaldo Jaldo', partyName: 'Partido Justicialista', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: -10, affinityWithPlayerPct: 55, relationshipScore: 60, color: '#14b8a6' },
  { provinceId: 'SALTA', provinceName: 'Salta', governorName: 'Gustavo Sáenz', partyName: 'Identidad Salteña', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 5, affinityWithPlayerPct: 58, relationshipScore: 64, color: '#14b8a6' },
  { provinceId: 'CHUBUT', provinceName: 'Chubut', governorName: 'Ignacio Torres', partyName: 'Despierta Chubut (PRO)', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 48, affinityWithPlayerPct: 78, relationshipScore: 70, color: '#2563eb' },
  { provinceId: 'CHACO', provinceName: 'Chaco', governorName: 'Leandro Zdero', partyName: 'Juntos por el Cambio', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 46, affinityWithPlayerPct: 72, relationshipScore: 70, color: '#2563eb' },
  { provinceId: 'CORRIENTES', provinceName: 'Corrientes', governorName: 'Gustavo Valdés', partyName: 'ECO + Vamos Corrientes', sinceDate: '10 de diciembre de 2021', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 35, affinityWithPlayerPct: 69, relationshipScore: 68, color: '#14b8a6' },
  { provinceId: 'FORMOSA', provinceName: 'Formosa', governorName: 'Gildo Insfrán', partyName: 'Partido Justicialista', sinceDate: '10 de diciembre de 1995', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -60, affinityWithPlayerPct: 18, relationshipScore: 25, color: '#ef4444' },
  { provinceId: 'LA_RIOJA', provinceName: 'La Rioja', governorName: 'Ricardo Quintela', partyName: 'Frente de Todos', sinceDate: '10 de diciembre de 2019', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -55, affinityWithPlayerPct: 22, relationshipScore: 30, color: '#ef4444' },
  { provinceId: 'TIERRA_DEL_FUEGO', provinceName: 'Tierra del Fuego', governorName: 'Gustavo Melella', partyName: 'FORJA / UxP', sinceDate: '10 de diciembre de 2019', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -40, affinityWithPlayerPct: 28, relationshipScore: 35, color: '#ef4444' },
  { provinceId: 'SANTA_CRUZ', provinceName: 'Santa Cruz', governorName: 'Claudio Vidal', partyName: 'Por Santa Cruz', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 8, affinityWithPlayerPct: 54, relationshipScore: 58, color: '#14b8a6' },
  { provinceId: 'NEUQUEN', provinceName: 'Neuquén', governorName: 'Rolando Figueroa', partyName: 'Comunidad', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 12, affinityWithPlayerPct: 60, relationshipScore: 65, color: '#14b8a6' },
  { provinceId: 'RIO_NEGRO', provinceName: 'Río Negro', governorName: 'Alberto Weretilneck', partyName: 'Juntos Somos Río Negro', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 10, affinityWithPlayerPct: 58, relationshipScore: 62, color: '#14b8a6' },
  { provinceId: 'MISIONES', provinceName: 'Misiones', governorName: 'Hugo Passalacqua', partyName: 'Frente Renovador de la Concordia', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 5, affinityWithPlayerPct: 55, relationshipScore: 59, color: '#14b8a6' },
  { provinceId: 'SAN_JUAN', provinceName: 'San Juan', governorName: 'Marcelo Orrego', partyName: 'Cambia San Juan', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 45, affinityWithPlayerPct: 74, relationshipScore: 72, color: '#2563eb' },
  { provinceId: 'SAN_LUIS', provinceName: 'San Luis', governorName: 'Claudio Poggi', partyName: 'Cambia San Luis', sinceDate: '10 de diciembre de 2023', faction: 'DERECHA', factionLabel: 'DERECHA', politicalPosition: 44, affinityWithPlayerPct: 73, relationshipScore: 74, color: '#2563eb' },
  { provinceId: 'JUJUY', provinceName: 'Jujuy', governorName: 'Carlos Sadir', partyName: 'Frente Cambia Jujuy', sinceDate: '10 de diciembre de 2023', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: 28, affinityWithPlayerPct: 67, relationshipScore: 68, color: '#14b8a6' },
  { provinceId: 'CATAMARCA', provinceName: 'Catamarca', governorName: 'Raúl Jalil', partyName: 'Frente de Todos', sinceDate: '10 de diciembre de 2019', faction: 'CENTRO', factionLabel: 'CENTRO', politicalPosition: -15, affinityWithPlayerPct: 48, relationshipScore: 52, color: '#14b8a6' },
  { provinceId: 'SANTIAGO_ESTERO', provinceName: 'Santiago del Estero', governorName: 'Gerardo Zamora', partyName: 'Frente Cívico por Santiago', sinceDate: '10 de diciembre de 2005', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -35, affinityWithPlayerPct: 34, relationshipScore: 40, color: '#ef4444' },
  { provinceId: 'LA_PAMPA', provinceName: 'La Pampa', governorName: 'Sergio Ziliotto', partyName: 'Frente Justicialista Pampeano', sinceDate: '10 de diciembre de 2019', faction: 'IZQUIERDA', factionLabel: 'IZQUIERDA', politicalPosition: -42, affinityWithPlayerPct: 32, relationshipScore: 38, color: '#ef4444' }
];

interface CampaignGobernantesViewProps {
  state: CampaignSimulationState;
}

export function CampaignGobernantesView({ state: _state }: CampaignGobernantesViewProps) {
  const [selectedProvId, setSelectedProvId] = useState('PBA');

  const selectedGov =
    GOVERNORS_DATASET.find((g) => g.provinceId === selectedProvId) ?? GOVERNORS_DATASET[0]!;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
            POLÍTICO
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Gobernantes</h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 font-bold">
            ● Derecha · 7 jurisdicciones
          </span>
          <span className="px-2.5 py-1 rounded-full bg-teal-950/70 border border-teal-800/60 text-teal-300 font-bold">
            ● Centro · 11 jurisdicciones
          </span>
          <span className="px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-800/60 text-rose-300 font-bold">
            ● Izquierda · 6 jurisdicciones
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-3">
          <div className="text-xs text-slate-400 font-medium">
            Mapa de distribución de poder provincial en 2027:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GOVERNORS_DATASET.map((gov) => {
              const isSelected = gov.provinceId === selectedProvId;
              return (
                <button
                  key={gov.provinceId}
                  type="button"
                  onClick={() => setSelectedProvId(gov.provinceId)}
                  className={`text-left p-2.5 rounded-xl border transition ${
                    isSelected
                      ? 'bg-[#181d2c] border-white text-white font-bold'
                      : 'bg-[#0d1017] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      style={{ backgroundColor: gov.color }}
                      className="w-2.5 h-2.5 rounded-full inline-block"
                    />
                    <span className="truncate text-xs font-bold">{gov.provinceName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{gov.governorName}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-[#10131b] border border-slate-800/90 p-6 space-y-5">
          <div>
            <div className="text-xl font-extrabold text-white">{selectedGov.provinceName}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-bold text-white">{selectedGov.governorName}</span>
              <span
                style={{
                  backgroundColor:
                    selectedGov.faction === 'IZQUIERDA'
                      ? '#450a0a'
                      : selectedGov.faction === 'DERECHA'
                      ? '#172554'
                      : '#042f2e',
                  borderColor: selectedGov.color,
                  color: selectedGov.color
                }}
                className="px-2 py-0.5 rounded text-[10px] font-black border"
              >
                {selectedGov.factionLabel}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              ● {selectedGov.partyName} · desde {selectedGov.sinceDate}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800/70 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Posición política:</span>
                <strong className="font-mono text-white">
                  {selectedGov.politicalPosition > 0
                    ? `+${selectedGov.politicalPosition}`
                    : selectedGov.politicalPosition}{' '}
                  (de -100 izq a +100 der)
                </strong>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Afinidad con tu espacio:</span>
                <strong className="font-mono text-amber-400">
                  {selectedGov.affinityWithPlayerPct} %
                </strong>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${selectedGov.affinityWithPlayerPct}%` }}
                  className="h-full bg-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Relación política:</span>
                <strong className="font-mono text-sky-400">{selectedGov.relationshipScore} / 100</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${selectedGov.relationshipScore}%` }}
                  className="h-full bg-sky-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

