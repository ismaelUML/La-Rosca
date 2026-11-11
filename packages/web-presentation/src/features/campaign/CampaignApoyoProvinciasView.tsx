import React, { useState } from 'react';
import type { CampaignSimulationState } from '@argentina-sim/domain';

// Vista de POLÍTICO -> Apoyo en Provincias (captura de referencia del usuario):
// busqueda de apoyos y cooptacion territorial con intendentes del Conurbano y caudillos locales.

interface LocalMayorLeader {
  id: string;
  name: string;
  partyName: string;
  partySigla: string;
  district: string;
  roleText: string;
  styleTrait: 'Dialoguista' | 'Dogmático';
  isOfficial: boolean;
  relevance: number;
  influence: number;
  supportPct: number;
  defectionChancePct: number;
}

const LOCAL_LEADERS_PBA: LocalMayorLeader[] = [
  { id: 'NARDINI', name: 'Leonardo Nardini', partyName: 'Unión por la Patria', partySigla: 'UxP', district: 'Malvinas Argentinas', roleText: 'Intendente de Malvinas Argentinas', styleTrait: 'Dialoguista', isOfficial: true, relevance: 28, influence: 34, supportPct: 39, defectionChancePct: 19 },
  { id: 'SAMID', name: 'Alberto Samid', partyName: 'Principios y Valores', partySigla: 'PyV', district: 'La Matanza', roleText: 'Dirigente de Principios y Valores, empresario de la carne', styleTrait: 'Dialoguista', isOfficial: false, relevance: 26, influence: 26, supportPct: 45, defectionChancePct: 25 },
  { id: 'BIONDINI', name: 'Alejandro Biondini', partyName: 'Frente Patriota Federal', partySigla: 'FPF', district: 'Buenos Aires', roleText: 'Referente nacionalista de Frente Patriota Federal', styleTrait: 'Dogmático', isOfficial: false, relevance: 23, influence: 27, supportPct: 12, defectionChancePct: 5 },
  { id: 'VALENZUELA', name: 'Diego Valenzuela', partyName: 'Propuesta Republicana / LLA', partySigla: 'PRO', district: 'Tres de Febrero', roleText: 'Intendente de Tres de Febrero, historiador y promotor de bajas impositivas', styleTrait: 'Dialoguista', isOfficial: true, relevance: 42, influence: 48, supportPct: 58, defectionChancePct: 40 },
  { id: 'MAYRA_MENDOZA', name: 'Mayra Mendoza', partyName: 'Unión por la Patria', partySigla: 'UxP', district: 'Quilmes', roleText: 'Intendenta de Quilmes, referente de La Cámpora', styleTrait: 'Dogmático', isOfficial: true, relevance: 50, influence: 56, supportPct: 20, defectionChancePct: 8 },
  { id: 'SOLEDAD_MARTINEZ', name: 'Soledad Martínez', partyName: 'Propuesta Republicana', partySigla: 'PRO', district: 'Vicente López', roleText: 'Intendenta de Vicente López', styleTrait: 'Dialoguista', isOfficial: true, relevance: 36, influence: 42, supportPct: 65, defectionChancePct: 50 }
];

interface CampaignApoyoProvinciasViewProps {
  state: CampaignSimulationState;
}

export function CampaignApoyoProvinciasView({ state: _state }: CampaignApoyoProvinciasViewProps) {
  const [selectedProvince, setSelectedProvince] = useState('Buenos Aires');
  const [partyFilter, setPartyFilter] = useState('TODOS');
  const [endorsedLeaderIds, setEndorsedLeaderIds] = useState<Set<string>>(new Set());

  const filtered = LOCAL_LEADERS_PBA.filter(
    (l) => partyFilter === 'TODOS' || l.partySigla === partyFilter
  );

  const handleToggleLeader = (id: string) => {
    const next = new Set(endorsedLeaderIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setEndorsedLeaderIds(next);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
          POLÍTICO
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
          Apoyo en Provincias
        </h1>
      </div>

      <div className="max-w-xs space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300">Provincia</label>
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="w-full bg-[#10131c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
        >
          <option value="Buenos Aires">Buenos Aires (PBA)</option>
          <option value="Córdoba">Córdoba</option>
          <option value="Santa Fe">Santa Fe</option>
          <option value="Mendoza">Mendoza</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {['TODOS', 'UxP', 'PRO', 'LLA', 'PyV', 'FPF'].map((sigla) => (
          <button
            key={sigla}
            type="button"
            onClick={() => setPartyFilter(sigla)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              partyFilter === sigla
                ? 'bg-white text-slate-950 border-white shadow'
                : 'bg-[#10131b] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {sigla === 'TODOS' ? 'Todos (6)' : sigla}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {filtered.map((leader) => {
          const isEndorsed = endorsedLeaderIds.has(leader.id);
          return (
            <div
              key={leader.id}
              className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="font-bold text-white text-sm">{leader.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {leader.partyName} · {leader.district}
                </div>

                <div className="flex gap-1.5 my-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                    {leader.styleTrait.toUpperCase()}
                  </span>
                  {leader.isOfficial ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-950/70 border border-sky-800/60 text-sky-300">
                      FUNCIONARIO
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{leader.roleText}</p>

                <div className="text-[11px] text-slate-400 mt-2 font-mono">
                  Relevancia {leader.relevance} · Influencia {leader.influence}
                </div>

                <div className="mt-2 text-xs">
                  Apoyo estimado: <strong className="text-emerald-400">{leader.supportPct} %</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/70 space-y-2">
                <button
                  type="button"
                  onClick={() => handleToggleLeader(leader.id)}
                  className={`w-full py-1.5 rounded-xl text-xs font-semibold transition ${
                    isEndorsed
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'bg-white hover:bg-slate-200 text-slate-950 font-bold'
                  }`}
                >
                  {isEndorsed ? '✓ Apoyo asegurado' : 'Pedir apoyo'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
