import React, { useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';

// Comando de campana provincial:
// En Argentina las 24 provincias desdoblan sus elecciones en cuatro turnos de 6 distritos.
// Si no pones plata en las campanas provinciales y cerras las formulas con un ano de anticipacion,
// los caudillos locales te comen el partido vivo.

export interface ProvincialElectionData {
  id: string;
  name: string;
  electionDate: string;
  myFormulaPct: number;
  rivalsShares: [number, number, number];
  isLeading: boolean;
  statusBadge: string;
  currentGovernor: string;
  currentParty: string;
  loyaltyIndex: number;
  isIntervened: boolean;
}

const ELECTION_TURNS_DATA: Record<string, ProvincialElectionData[]> = {
  '2032': [
    {
      id: 'TIERRA_DEL_FUEGO',
      name: 'Tierra del Fuego',
      electionDate: '14 de marzo de 2032',
      myFormulaPct: 29.6,
      rivalsShares: [38.2, 20.4, 11.8],
      isLeading: false,
      statusBadge: 'FALTAN 3 MESES',
      currentGovernor: 'Gustavo Melella',
      currentParty: 'UxP',
      loyaltyIndex: 32,
      isIntervened: false
    },
    {
      id: 'MISIONES',
      name: 'Misiones',
      electionDate: '11 de abril de 2032',
      myFormulaPct: 38.0,
      rivalsShares: [32.5, 18.2, 11.3],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Hugo Passalacqua',
      currentParty: 'FRC / Frente Renovador',
      loyaltyIndex: 74,
      isIntervened: false
    },
    {
      id: 'LA_PAMPA',
      name: 'La Pampa',
      electionDate: '9 de mayo de 2032',
      myFormulaPct: 21.8,
      rivalsShares: [44.6, 22.1, 11.5],
      isLeading: false,
      statusBadge: 'FALTAN 5 MESES',
      currentGovernor: 'Sergio Ziliotto',
      currentParty: 'UxP',
      loyaltyIndex: 28,
      isIntervened: false
    },
    {
      id: 'MENDOZA',
      name: 'Mendoza',
      electionDate: '13 de junio de 2032',
      myFormulaPct: 47.5,
      rivalsShares: [28.2, 14.1, 10.2],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Alfredo Cornejo',
      currentParty: 'UCR / Cambia Mendoza',
      loyaltyIndex: 82,
      isIntervened: false
    },
    {
      id: 'CHACO',
      name: 'Chaco',
      electionDate: '11 de julio de 2032',
      myFormulaPct: 42.8,
      rivalsShares: [34.1, 14.9, 8.2],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Leandro Zdero',
      currentParty: 'UCR / JxC',
      loyaltyIndex: 78,
      isIntervened: false
    },
    {
      id: 'PBA',
      name: 'Buenos Aires',
      electionDate: '12 de septiembre de 2032',
      myFormulaPct: 30.4,
      rivalsShares: [39.8, 18.6, 11.2],
      isLeading: false,
      statusBadge: 'FALTAN 9 MESES',
      currentGovernor: 'Axel Kicillof',
      currentParty: 'UxP',
      loyaltyIndex: 18,
      isIntervened: false
    }
  ],
  '2030': [
    {
      id: 'NEUQUEN',
      name: 'Neuquén',
      electionDate: '16 de abril de 2030',
      myFormulaPct: 34.2,
      rivalsShares: [31.5, 22.0, 12.3],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Rolando Figueroa',
      currentParty: 'Comunidad / Neuquinizate',
      loyaltyIndex: 68,
      isIntervened: false
    },
    {
      id: 'RIO_NEGRO',
      name: 'Río Negro',
      electionDate: '16 de abril de 2030',
      myFormulaPct: 28.5,
      rivalsShares: [38.2, 21.0, 12.3],
      isLeading: false,
      statusBadge: 'FALTAN 4 MESES',
      currentGovernor: 'Alberto Weretilneck',
      currentParty: 'Juntos Somos Río Negro',
      loyaltyIndex: 62,
      isIntervened: false
    },
    {
      id: 'JUJUY',
      name: 'Jujuy',
      electionDate: '7 de mayo de 2030',
      myFormulaPct: 44.1,
      rivalsShares: [30.4, 15.2, 10.3],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Carlos Sadir',
      currentParty: 'UCR / Cambia Jujuy',
      loyaltyIndex: 76,
      isIntervened: false
    },
    {
      id: 'SAN_JUAN',
      name: 'San Juan',
      electionDate: '14 de mayo de 2030',
      myFormulaPct: 36.8,
      rivalsShares: [32.1, 19.3, 11.8],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Marcelo Orrego',
      currentParty: 'Producción y Trabajo',
      loyaltyIndex: 72,
      isIntervened: false
    },
    {
      id: 'SAN_LUIS',
      name: 'San Luis',
      electionDate: '11 de junio de 2030',
      myFormulaPct: 39.4,
      rivalsShares: [33.8, 16.5, 10.3],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Claudio Poggi',
      currentParty: 'Avanzar San Luis',
      loyaltyIndex: 79,
      isIntervened: false
    },
    {
      id: 'CORRIENTES',
      name: 'Corrientes',
      electionDate: '8 de octubre de 2030',
      myFormulaPct: 31.0,
      rivalsShares: [42.5, 16.8, 9.7],
      isLeading: false,
      statusBadge: 'FALTAN 8 MESES',
      currentGovernor: 'Gustavo Valdés',
      currentParty: 'UCR / ECO',
      loyaltyIndex: 75,
      isIntervened: false
    }
  ],
  '2031': [
    {
      id: 'CORDOBA',
      name: 'Córdoba',
      electionDate: '25 de junio de 2031',
      myFormulaPct: 35.6,
      rivalsShares: [39.2, 15.8, 9.4],
      isLeading: false,
      statusBadge: 'FALTAN 6 MESES',
      currentGovernor: 'Martín Llaryora',
      currentParty: 'Hacemos Unidos por Córdoba',
      loyaltyIndex: 58,
      isIntervened: false
    },
    {
      id: 'FORMOSA',
      name: 'Formosa',
      electionDate: '25 de junio de 2031',
      myFormulaPct: 22.4,
      rivalsShares: [58.1, 12.3, 7.2],
      isLeading: false,
      statusBadge: 'FALTAN 6 MESES',
      currentGovernor: 'Gildo Insfrán',
      currentParty: 'PJ / UxP',
      loyaltyIndex: 12,
      isIntervened: false
    },
    {
      id: 'SANTA_FE',
      name: 'Santa Fe',
      electionDate: '10 de septiembre de 2031',
      myFormulaPct: 41.2,
      rivalsShares: [33.5, 16.1, 9.2],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Maximiliano Pullaro',
      currentParty: 'UCR / Unidos',
      loyaltyIndex: 84,
      isIntervened: false
    },
    {
      id: 'ENTRE_RIOS',
      name: 'Entre Ríos',
      electionDate: '22 de octubre de 2031',
      myFormulaPct: 37.8,
      rivalsShares: [34.1, 18.2, 9.9],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Rogelio Frigerio',
      currentParty: 'PRO / Juntos por Entre Ríos',
      loyaltyIndex: 88,
      isIntervened: false
    },
    {
      id: 'CHUBUT',
      name: 'Chubut',
      electionDate: '30 de julio de 2031',
      myFormulaPct: 33.1,
      rivalsShares: [36.4, 19.5, 11.0],
      isLeading: false,
      statusBadge: 'FALTAN 7 MESES',
      currentGovernor: 'Ignacio Torres',
      currentParty: 'PRO / Despierta Chubut',
      loyaltyIndex: 65,
      isIntervened: false
    },
    {
      id: 'SANTA_CRUZ',
      name: 'Santa Cruz',
      electionDate: '13 de agosto de 2031',
      myFormulaPct: 26.5,
      rivalsShares: [42.1, 20.8, 10.6],
      isLeading: false,
      statusBadge: 'FALTAN 7 MESES',
      currentGovernor: 'Claudio Vidal',
      currentParty: 'Por Santa Cruz',
      loyaltyIndex: 54,
      isIntervened: false
    }
  ],
  '2033': [
    {
      id: 'CABA',
      name: 'Ciudad de Buenos Aires',
      electionDate: '22 de octubre de 2033',
      myFormulaPct: 48.2,
      rivalsShares: [29.1, 14.5, 8.2],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Jorge Macri',
      currentParty: 'PRO / Juntos por el Cambio',
      loyaltyIndex: 91,
      isIntervened: false
    },
    {
      id: 'CATAMARCA',
      name: 'Catamarca',
      electionDate: '22 de octubre de 2033',
      myFormulaPct: 32.5,
      rivalsShares: [46.8, 12.5, 8.2],
      isLeading: false,
      statusBadge: 'FALTAN 10 MESES',
      currentGovernor: 'Raúl Jalil',
      currentParty: 'PJ / UxP',
      loyaltyIndex: 64,
      isIntervened: false
    },
    {
      id: 'LA_RIOJA',
      name: 'La Rioja',
      electionDate: '7 de mayo de 2033',
      myFormulaPct: 27.9,
      rivalsShares: [49.2, 14.1, 8.8],
      isLeading: false,
      statusBadge: 'FALTAN 5 MESES',
      currentGovernor: 'Ricardo Quintela',
      currentParty: 'PJ / Federalismo',
      loyaltyIndex: 14,
      isIntervened: false
    },
    {
      id: 'SANTIAGO',
      name: 'Santiago del Estero',
      electionDate: '14 de noviembre de 2033',
      myFormulaPct: 24.1,
      rivalsShares: [59.4, 10.2, 6.3],
      isLeading: false,
      statusBadge: 'FALTAN 11 MESES',
      currentGovernor: 'Gerardo Zamora',
      currentParty: 'Frente Cívico por Santiago',
      loyaltyIndex: 44,
      isIntervened: false
    },
    {
      id: 'TUCUMAN',
      name: 'Tucumán',
      electionDate: '11 de junio de 2033',
      myFormulaPct: 36.2,
      rivalsShares: [34.5, 18.2, 11.1],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Osvaldo Jaldo',
      currentParty: 'PJ Independiente',
      loyaltyIndex: 78,
      isIntervened: false
    },
    {
      id: 'SALTA',
      name: 'Salta',
      electionDate: '14 de mayo de 2033',
      myFormulaPct: 38.9,
      rivalsShares: [35.2, 16.4, 9.5],
      isLeading: true,
      statusBadge: 'TU FÓRMULA LIDERA',
      currentGovernor: 'Gustavo Sáenz',
      currentParty: 'Identidad Salteña',
      loyaltyIndex: 71,
      isIntervened: false
    }
  ]
};

function DonutSvg({
  myPct,
  rivals
}: {
  myPct: number;
  rivals: [number, number, number];
}) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const colors = ['#a855f7', '#0ea5e9', '#10b981', '#f43f5e'];
  const allShares = [myPct, rivals[0], rivals[1], rivals[2]];

  let currentOffset = 0;
  const slices = allShares.map((share, idx) => {
    const dash = (share / 100) * c;
    const sliceOffset = currentOffset;
    currentOffset -= dash;
    return {
      dash,
      offset: sliceOffset,
      color: colors[idx] ?? '#64748b'
    };
  });

  return (
    <div className="relative w-24 h-24 mx-auto my-2 flex items-center justify-center">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="transparent" stroke="#1e293b" strokeWidth="8" />
        {slices.map((s, idx) => (
          <circle
            key={idx}
            cx="40"
            cy="40"
            r={r}
            fill="transparent"
            stroke={s.color}
            strokeWidth="8"
            strokeDasharray={`${s.dash} ${c}`}
            strokeDashoffset={s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs font-mono font-extrabold text-white leading-none">
          {myPct.toFixed(1).replace('.', ',')} %
        </span>
        <span className="text-[9px] text-slate-400 mt-0.5 leading-none">tu fórmula</span>
      </div>
    </div>
  );
}

function ProvincialElectionCard({
  prov,
  onInvest
}: {
  prov: ProvincialElectionData;
  onInvest: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-[#0b0e15] border border-slate-800/90 p-4 flex flex-col justify-between text-center gap-2 shadow-md hover:border-slate-700 transition">
      <div>
        <h4 className="font-extrabold text-white text-sm leading-tight">{prov.name}</h4>
        <div className="text-[10px] text-slate-400 mt-0.5">{prov.electionDate}</div>
      </div>

      <DonutSvg myPct={prov.myFormulaPct} rivals={prov.rivalsShares} />

      <div className="space-y-2 pt-1 border-t border-slate-800/60">
        <div
          className={`text-[10px] font-extrabold tracking-wider ${
            prov.isLeading ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          {prov.statusBadge}
        </div>

        <button
          type="button"
          onClick={() => onInvest(prov.id)}
          className="w-full py-1.5 rounded-lg text-[10px] font-bold bg-[#141926] hover:bg-slate-800 text-slate-300 border border-slate-800"
        >
          Reforzar campaña
        </button>
      </div>
    </div>
  );
}

function GovernorsMapTable({
  provinces,
  onIntervene
}: {
  provinces: ProvincialElectionData[];
  onIntervene: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-[#0b0e15] border border-slate-800 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-base font-extrabold text-white">
          Mapa de los 24 Gobernadores e Intervención Federal (Art. 6 CN)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          El Poder Ejecutivo puede decretar o pedir al Congreso la intervención federal si la provincia desconoce la Constitución, cae en cesación de pagos o se niega a acatar leyes federales.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#080a10] border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400">
            <tr>
              <th className="py-3 px-4">PROVINCIA</th>
              <th className="py-3 px-4">GOBERNADOR ACTUAL</th>
              <th className="py-3 px-4">ESPACIO POLÍTICO</th>
              <th className="py-3 px-4 text-center">LEALTAD ROSADA</th>
              <th className="py-3 px-4 text-right">ACCIÓN CONSTITUCIONAL</th>
            </tr>
          </thead>
          <tbody>
            {provinces.map((prov) => (
              <tr key={prov.id} className="border-b border-slate-800/50 hover:bg-slate-900/40">
                <td className="py-3 px-4 font-bold text-white">{prov.name}</td>
                <td className="py-3 px-4 text-slate-300">{prov.currentGovernor}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                    {prov.currentParty}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-sky-400">
                  {prov.loyaltyIndex} %
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onIntervene(prov.id)}
                    className="px-3 py-1 rounded-lg text-[10px] font-bold bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60"
                  >
                    Intervención Federal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface CampaignPartidoProvinciasViewProps {
  state?: CampaignSimulationState;
}

export function CampaignPartidoProvinciasView({ state: _state }: CampaignPartidoProvinciasViewProps) {
  const [selectedTurn, setSelectedTurn] = useState<'2030' | '2031' | '2032' | '2033' | 'MAPA'>('2032');
  const [turnsState, setTurnsState] = useState(ELECTION_TURNS_DATA);
  const [campaignBudget, setCampaignBudget] = useState(880);

  const activeProvinces = selectedTurn !== 'MAPA' ? turnsState[selectedTurn] ?? [] : [];
  const allProvinces = Object.values(turnsState).flat();

  const handleInvestInProvince = (provId: string) => {
    if (campaignBudget < 50) return;
    setCampaignBudget((prev) => prev - 50);
    setTurnsState((prev) => {
      const next = { ...prev };
      for (const turnKey of Object.keys(next)) {
        const turnItems = next[turnKey];
        if (turnItems) {
          next[turnKey] = turnItems.map((p) =>
            p.id === provId
              ? {
                  ...p,
                  myFormulaPct: Math.min(65, Number((p.myFormulaPct + 2.5).toFixed(1))),
                  isLeading: p.myFormulaPct + 2.5 > p.rivalsShares[0],
                  statusBadge: p.myFormulaPct + 2.5 > p.rivalsShares[0] ? 'TU FÓRMULA LIDERA' : p.statusBadge
                }
              : p
          );
        }
      }
      return next;
    });
  };

  const handleIntervene = (provId: string) => {
    setTurnsState((prev) => {
      const next = { ...prev };
      for (const turnKey of Object.keys(next)) {
        const turnItems = next[turnKey];
        if (turnItems) {
          next[turnKey] = turnItems.map((p) =>
            p.id === provId
              ? {
                  ...p,
                  currentGovernor: 'Interventor Federal Designado',
                  loyaltyIndex: 100,
                  isIntervened: true
                }
              : p
          );
        }
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/80 pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-purple-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              POLÍTICO
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
            Partido en las provincias
          </h1>
        </div>
        <div className="text-xs text-slate-400">
          Guardada · se puede seguir con el código desde cualquier dispositivo
        </div>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-purple-900/40 p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center font-bold text-lg text-purple-300">
            🕊️
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Comando de campaña provincial</h3>
            <p className="text-xs text-slate-300">
              Manejás las fórmulas, las coaliciones y las campañas de tus candidatos provinciales en cualquier fase.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="text-slate-400 uppercase text-[10px]">Presupuesto de las campañas</div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {campaignBudget}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="text-slate-400 uppercase text-[10px]">Campañas en curso</div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">6</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="text-slate-400 uppercase text-[10px]">Gobernaciones ganadas</div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
              18 <span className="text-xs text-slate-400 font-normal">de 24</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0b0e15] border border-slate-800">
            <div className="text-slate-400 uppercase text-[10px]">Gobernadores propios</div>
            <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
              18 <span className="text-xs text-slate-400 font-normal">de 24</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
          Las 24 jurisdicciones votan en cuatro turnos de 6 (2028, 2029, 2030 y 2031, y cada cuatro años después): en 2027 no se elige ningún gobernador. La fórmula se elige un año antes de cada elección.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['Turno 2030', 'Turno 2031', 'Turno 2032', 'Turno 2033', 'Mapa de gobernadores'] as const).map(
          (tabLabel) => {
            const tabKey =
              tabLabel === 'Mapa de gobernadores'
                ? 'MAPA'
                : (tabLabel.replace('Turno ', '') as '2030' | '2031' | '2032' | '2033');
            const isSelected = selectedTurn === tabKey;
            return (
              <button
                key={tabLabel}
                type="button"
                onClick={() => setSelectedTurn(tabKey)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  isSelected
                    ? 'bg-white text-slate-950 border-white shadow'
                    : 'bg-[#10131b] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {tabLabel}
              </button>
            );
          }
        )}
      </div>

      {selectedTurn === 'MAPA' ? (
        <GovernorsMapTable provinces={allProvinces} onIntervene={handleIntervene} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {activeProvinces.map((prov) => (
            <ProvincialElectionCard
              key={prov.id}
              prov={prov}
              onInvest={handleInvestInProvince}
            />
          ))}
        </div>
      )}
    </div>
  );
}
