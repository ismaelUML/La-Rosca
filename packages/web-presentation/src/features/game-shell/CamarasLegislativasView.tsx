import React, { useMemo, useState } from 'react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';

// En el Congreso no se gobierna con discursos bonitos: se gobierna con el quorum de 129
// en Diputados y los 37 senadores en la Camara Alta. Si no tenes los votos,
// cualquier proyecto se te cae en particular o te lo devuelven con modificaciones.

export interface PartySeatShare {
  id: string;
  name: string;
  shortLabel: string;
  deputiesSeats: number;
  senateSeats: number;
  color: string;
  colorName: string;
  badgeBg: string;
  relation: number;
}

const INITIAL_CONGRESS_FORCES: PartySeatShare[] = [
  {
    id: 'LLA',
    name: 'La Libertad Avanza (Oficialismo)',
    shortLabel: 'LLA',
    deputiesSeats: 38,
    senateSeats: 7,
    color: '#a855f7',
    colorName: 'Violeta',
    badgeBg: 'bg-purple-600 text-white',
    relation: 100
  },
  {
    id: 'PRO',
    name: 'Propuesta Republicana (PRO)',
    shortLabel: 'PRO',
    deputiesSeats: 37,
    senateSeats: 6,
    color: '#facc15',
    colorName: 'Amarillo',
    badgeBg: 'bg-amber-400 text-slate-950',
    relation: 78
  },
  {
    id: 'UCR',
    name: 'Unión Cívica Radical',
    shortLabel: 'UCR',
    deputiesSeats: 34,
    senateSeats: 13,
    color: '#dc2626',
    colorName: 'Rojo y blanco',
    badgeBg: 'bg-red-600 text-white',
    relation: 42
  },
  {
    id: 'PF',
    name: 'Peronismo Federal / Provincias Unidas',
    shortLabel: 'PF',
    deputiesSeats: 16,
    senateSeats: 6,
    color: '#2563eb',
    colorName: 'Azul',
    badgeBg: 'bg-blue-600 text-white',
    relation: 55
  },
  {
    id: 'PROVINCIALES',
    name: 'Bloques Provinciales y Fuerzas Locales',
    shortLabel: 'PROV',
    deputiesSeats: 28,
    senateSeats: 7,
    color: '#10b981',
    colorName: 'Verde',
    badgeBg: 'bg-emerald-600 text-white',
    relation: 50
  },
  {
    id: 'UXP',
    name: 'Unión por la Patria',
    shortLabel: 'UxP',
    deputiesSeats: 99,
    senateSeats: 33,
    color: '#38bdf8',
    colorName: 'Celeste',
    badgeBg: 'bg-sky-500 text-slate-950',
    relation: 0
  },
  {
    id: 'FIT',
    name: 'Frente de Izquierda y de Trabajadores',
    shortLabel: 'FIT',
    deputiesSeats: 5,
    senateSeats: 0,
    color: '#ef4444',
    colorName: 'Rojo',
    badgeBg: 'bg-red-700 text-white',
    relation: 0
  }
];

function computeRowRadii(rowsCount: number, rMin: number, rMax: number): number[] {
  const radii: number[] = [];
  for (let i = 0; i < rowsCount; i++) {
    radii.push(rMin + (i * (rMax - rMin)) / (rowsCount - 1));
  }
  return radii;
}

function computeRowSeats(radii: number[], totalSeats: number): number[] {
  const sumRadii = radii.reduce((a, b) => a + b, 0);
  const seats = radii.map((r) => Math.round((r / sumRadii) * totalSeats));
  const diff = totalSeats - seats.reduce((a, b) => a + b, 0);
  const lastIndex = Math.max(0, seats.length - 1);
  const prevLast = seats[lastIndex] ?? 0;
  seats[lastIndex] = prevLast + diff;
  return seats;
}

function createRowPoints(radius: number, seatsCount: number): Array<{ x: number; y: number; angle: number }> {
  const points: Array<{ x: number; y: number; angle: number }> = [];
  const denominator = Math.max(1, seatsCount - 1);
  for (let i = 0; i < seatsCount; i++) {
    const angle = Math.PI - (i / denominator) * Math.PI;
    const x = Number((radius * Math.cos(angle)).toFixed(1));
    const y = Number((-radius * Math.sin(angle)).toFixed(1));
    points.push({ x, y, angle });
  }
  return points;
}

function generateHemicycleDots(totalSeats: number, rowsCount: number, rMin: number, rMax: number) {
  const radii = computeRowRadii(rowsCount, rMin, rMax);
  const rowSeats = computeRowSeats(radii, totalSeats);
  const points: Array<{ x: number; y: number; angle: number }> = [];

  for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    const r = radii[rowIndex] ?? rMin;
    const n = Math.max(1, rowSeats[rowIndex] ?? 1);
    points.push(...createRowPoints(r, n));
  }
  points.sort((a, b) => b.angle - a.angle);
  return points;
}

function getOrderedForces(forces: PartySeatShare[]): PartySeatShare[] {
  const order = ['FIT', 'UXP', 'UCR', 'PF', 'PRO', 'LLA'];
  return order
    .map((id) => forces.find((f) => f.id === id))
    .filter((f): f is PartySeatShare => f !== undefined);
}

function getChamberSeats(f: PartySeatShare, chamber: 'deputies' | 'senate'): number {
  return chamber === 'deputies' ? f.deputiesSeats : f.senateSeats;
}

function assignColorsToDots(
  dots: Array<{ x: number; y: number }>,
  forces: PartySeatShare[],
  chamber: 'deputies' | 'senate'
) {
  const orderedForces = getOrderedForces(forces);
  const colored: Array<{ x: number; y: number; color: string }> = [];
  let dotIndex = 0;

  for (const f of orderedForces) {
    const seatCount = getChamberSeats(f, chamber);
    for (let s = 0; s < seatCount && dotIndex < dots.length; s++) {
      const currentDot = dots[dotIndex];
      if (currentDot) {
        colored.push({ x: currentDot.x, y: currentDot.y, color: f.color });
      }
      dotIndex++;
    }
  }
  return colored;
}

function HemicycleCard({
  title,
  count,
  dots,
  legendList,
  quorumNeeded,
  labelSub
}: {
  title: string;
  count: number;
  dots: Array<{ x: number; y: number; color: string }>;
  legendList: PartySeatShare[];
  quorumNeeded: number;
  labelSub: string;
}) {
  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 flex flex-col justify-between gap-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
        <h3 className="text-base font-extrabold text-white">{title}</h3>
        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300">
          Quórum: {quorumNeeded}
        </span>
      </div>

      <div className="flex justify-center items-center py-2 relative">
        <svg viewBox="0 0 360 195" className="w-full max-w-[340px] overflow-visible">
          {dots.map((p, idx) => (
            <circle
              key={idx}
              cx={180 + p.x}
              cy={175 + p.y}
              r={count > 100 ? 3.4 : 4.6}
              fill={p.color}
              className="transition-colors duration-200"
            />
          ))}
          <text x="180" y="162" textAnchor="middle" className="text-3xl font-extrabold fill-white">
            {count}
          </text>
          <text x="180" y="180" textAnchor="middle" className="text-[10px] font-bold uppercase tracking-wider fill-slate-400">
            {labelSub}
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-slate-800/60">
        {legendList.map((f) => {
          const seats = title.includes('Diputados') ? f.deputiesSeats : f.senateSeats;
          if (seats === 0) return null;
          return (
            <div
              key={f.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b0e15] border border-slate-800 text-xs"
            >
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${f.badgeBg}`}>
                {f.shortLabel}
              </span>
              <span className="font-mono font-bold text-white">{seats}</span>
              <span className="text-[11px] text-slate-400">· {f.colorName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function resolveRelationLabel(relation: number): { label: string; badgeClass: string } {
  if (relation >= 80) {
    return { label: 'Aliado estratégico', badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' };
  }
  if (relation >= 60) {
    return { label: 'Diálogo abierto', badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800' };
  }
  if (relation >= 40) {
    return { label: 'Negociación puntual', badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800' };
  }
  if (relation >= 20) {
    return { label: 'Oposición moderada', badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-800' };
  }
  return { label: 'Oposición dura', badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800' };
}

function CongressTopMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl bg-[#10131b] border border-slate-800/90 shadow-sm flex flex-col justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          BLOQUE PROPIO
        </div>
        <div className="text-3xl font-mono font-extrabold text-white mt-2">38</div>
        <div className="text-[11px] text-slate-500 mt-1">38 diputados · 7 senadores (Minoría parlamentaria)</div>
      </div>

      <div className="p-4 rounded-2xl bg-[#10131b] border border-slate-800/90 shadow-sm flex flex-col justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          GOBERNABILIDAD
        </div>
        <div className="text-3xl font-mono font-extrabold text-white mt-2">36 %</div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-2">
          <div className="bg-amber-500 h-full rounded-full" style={{ width: '36%' }} />
        </div>
        <div className="text-[11px] text-slate-500 mt-1">Baja: requiere acuerdos con aliados para quórum</div>
      </div>

      <div className="p-4 rounded-2xl bg-[#10131b] border border-slate-800/90 shadow-sm flex flex-col justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          CAPACIDAD DE NEGOCIACIÓN
        </div>
        <div className="text-3xl font-mono font-extrabold text-white mt-2">38,5</div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-2">
          <div className="bg-purple-600 h-full rounded-full" style={{ width: '38.5%' }} />
        </div>
        <div className="text-[11px] text-slate-500 mt-1">Capacidad inicial limitada por minoría estricta</div>
      </div>
    </div>
  );
}

function PoliticalForceTableRow({ force }: { force: PartySeatShare }) {
  const relInfo = resolveRelationLabel(force.relation);
  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-900/40 transition">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${force.badgeBg}`}>
            {force.shortLabel}
          </span>
          <span className="font-semibold text-slate-200 text-xs md:text-sm">{force.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-center font-mono font-bold text-slate-200 text-sm">
        {force.deputiesSeats}
      </td>
      <td className="py-3 px-4 text-center font-mono font-bold text-slate-200 text-sm">
        {force.senateSeats}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="inline-flex items-center gap-2 justify-end">
          <span className="font-mono font-extrabold text-sm text-slate-200">
            {force.relation}%
          </span>
          <span className={`px-2.5 py-0.5 rounded border text-[11px] font-semibold ${relInfo.badgeClass}`}>
            {relInfo.label}
          </span>
        </div>
      </td>
    </tr>
  );
}

export interface CamarasLegislativasViewProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

export function CamarasLegislativasView({
  state: _state,
  onDispatch: _onDispatch
}: CamarasLegislativasViewProps) {
  const [forces] = useState<PartySeatShare[]>(INITIAL_CONGRESS_FORCES);

  const rawDeputiesDots = useMemo(() => generateHemicycleDots(257, 8, 70, 150), []);
  const rawSenateDots = useMemo(() => generateHemicycleDots(72, 4, 70, 140), []);

  const deputiesColored = useMemo(
    () => assignColorsToDots(rawDeputiesDots, forces, 'deputies'),
    [rawDeputiesDots, forces]
  );
  const senateColored = useMemo(
    () => assignColorsToDots(rawSenateDots, forces, 'senate'),
    [rawSenateDots, forces]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/80 pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              POLÍTICO
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">Cámaras</h1>
        </div>
        <div className="text-xs text-slate-400">
          Guardada · se puede seguir con el código desde cualquier dispositivo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HemicycleCard
          title="Cámara de Diputados"
          count={257}
          dots={deputiesColored}
          legendList={forces}
          quorumNeeded={129}
          labelSub="DIPUTADOS"
        />
        <HemicycleCard
          title="Senado"
          count={72}
          dots={senateColored}
          legendList={forces}
          quorumNeeded={37}
          labelSub="SENADORES"
        />
      </div>

      <CongressTopMetrics />

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 overflow-hidden shadow-lg">
        <div className="p-4 md:p-5 border-b border-slate-800/80">
          <h3 className="text-base font-extrabold text-white leading-tight">
            | Relación con cada fuerza
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Nivel de afinidad y disciplina parlamentaria con los bloques. Determina si bajan a dar quórum y cómo votan en particular.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0e15] border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">FUERZA</th>
                <th className="py-3 px-4 text-center">CÁMARA DE DIPUTADOS</th>
                <th className="py-3 px-4 text-center">SENADO</th>
                <th className="py-3 px-4 text-right">RELACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {forces.map((force) => (
                <PoliticalForceTableRow
                  key={force.id}
                  force={force}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
