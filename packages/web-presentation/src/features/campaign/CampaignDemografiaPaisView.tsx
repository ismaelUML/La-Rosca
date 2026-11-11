import React, { useEffect, useState } from 'react';

// Vista de PAÍS -> Población, Inmigración y Emigración (capturas de referencia del usuario):
// estadísticas demográficas nacionales, padrón electoral, saldos migratorios y tablas por país.

export type DemografiaCountryTab = 'POBLACION' | 'INMIGRACION' | 'EMIGRACION';

interface CountryMigRow {
  country: string;
  count: number;
  lastMonth: number;
  twelveMonths: number;
  pct: number;
}

const IMMIGRATION_TABLE: CountryMigRow[] = [
  { country: 'Paraguay', count: 548956, lastMonth: 503, twelveMonths: 5973, pct: 1.1 },
  { country: 'Bolivia', count: 359208, lastMonth: 389, twelveMonths: 4610, pct: 1.3 },
  { country: 'Venezuela', count: 207976, lastMonth: 953, twelveMonths: 10842, pct: 5.5 },
  { country: 'Perú', count: 168516, lastMonth: 225, twelveMonths: 2654, pct: 1.6 },
  { country: 'Chile', count: 70120, lastMonth: 80, twelveMonths: 950, pct: 0.7 },
  { country: 'Uruguay', count: 54200, lastMonth: 45, twelveMonths: 520, pct: 0.5 }
];

const EMIGRATION_TABLE: CountryMigRow[] = [
  { country: 'España', count: 303128, lastMonth: 404, twelveMonths: 4774, pct: 1.6 },
  { country: 'Estados Unidos', count: 225967, lastMonth: 188, twelveMonths: 2237, pct: 1.0 },
  { country: 'Paraguay', count: 83252, lastMonth: 56, twelveMonths: 661, pct: 0.8 },
  { country: 'Chile', count: 78436, lastMonth: 59, twelveMonths: 700, pct: 0.9 },
  { country: 'Italia', count: 75200, lastMonth: 85, twelveMonths: 1020, pct: 1.4 },
  { country: 'Israel', count: 48900, lastMonth: 35, twelveMonths: 410, pct: 0.6 }
];

const MIGRATION_CONFIG = {
  INMIGRACION: {
    table: IMMIGRATION_TABLE,
    mainCardTitle: 'INMIGRANTES RESIDENTES',
    mainCardNumber: '2.141.730',
    twelveMonthsNumber: '35.044',
    listTitle: 'Inmigración por país de origen (todos los países)',
    colCountTitle: 'Residentes',
    sparklineStroke: '#2dd4bf'
  },
  EMIGRACION: {
    table: EMIGRATION_TABLE,
    mainCardTitle: 'ARGENTINOS EN EL EXTERIOR',
    mainCardNumber: '1.366.430',
    twelveMonthsNumber: '16.859',
    listTitle: 'Emigración por país de destino (todos los países)',
    colCountTitle: 'Argentinos',
    sparklineStroke: '#f43f5e'
  }
} as const;

function PoblacionTabPanel() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
          <div className="text-[10px] font-bold uppercase text-slate-400">POBLACIÓN NACIONAL</div>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            47,61 <span className="text-sm font-normal text-slate-400">millones</span>
          </div>
        </div>
        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
          <div className="text-[10px] font-bold uppercase text-teal-400">VARIACIÓN EN 12 MESES</div>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            342.758 <span className="text-sm font-normal text-slate-400">hab.</span>
          </div>
        </div>
        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
          <div className="text-[10px] font-bold uppercase text-purple-400">PADRÓN LEGISLATIVAS 2025</div>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            36,26 <span className="text-sm font-normal text-slate-400">millones</span>
          </div>
        </div>
        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
          <div className="text-[10px] font-bold uppercase text-amber-400">INMIGRANTES RESIDENTES</div>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            2,14 <span className="text-sm font-normal text-slate-400">millones</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="font-bold text-white">Curva de Población Nacional</span>
          <span>Millones de habitantes</span>
        </div>
        <div className="h-44 w-full flex items-center justify-center border-b border-slate-800">
          <svg viewBox="0 0 500 120" className="w-full h-full">
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              points="20,105 100,90 180,75 260,60 340,42 420,25 480,12"
            />
            <circle cx="480" cy="12" r="5" fill="#38bdf8" />
          </svg>
        </div>
      </div>
    </div>
  );
}

interface MigracionTabPanelProps {
  activeTab: 'INMIGRACION' | 'EMIGRACION';
}

function MigracionTabPanel({ activeTab }: MigracionTabPanelProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const cfg = MIGRATION_CONFIG[activeTab];

  const filteredRows = cfg.table.filter((r) =>
    r.country.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
          <div className="text-[10px] font-bold uppercase text-amber-400">{cfg.mainCardTitle}</div>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {cfg.mainCardNumber}
          </div>
        </div>
        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
          <div className="text-[10px] font-bold uppercase text-teal-400">VARIACIÓN EN 12 MESES</div>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {cfg.twelveMonthsNumber} <span className="text-sm font-normal text-slate-400">pers.</span>
          </div>
        </div>
        <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-4">
          <div className="text-[10px] font-bold uppercase text-sky-400">SALDO MIGRATORIO DEL ÚLTIMO MES</div>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            1.585 <span className="text-sm font-normal text-slate-400">pers.</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-white">{cfg.listTitle}</div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar país..."
            className="bg-[#0b0e15] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2">País</th>
                <th className="py-2 text-right">{cfg.colCountTitle}</th>
                <th className="py-2 text-right">Último mes</th>
                <th className="py-2 text-right">12 meses</th>
                <th className="py-2 text-right">%</th>
                <th className="py-2 text-center">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRows.map((row) => (
                <tr key={row.country} className="hover:bg-slate-900/40">
                  <td className="py-2.5 font-sans font-semibold text-white">{row.country}</td>
                  <td className="py-2.5 text-right text-slate-200">{row.count.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-emerald-400">+{row.lastMonth}</td>
                  <td className="py-2.5 text-right text-emerald-400">+{row.twelveMonths.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-slate-300">+{row.pct.toFixed(2)} %</td>
                  <td className="py-2.5 text-center">
                    <svg className="w-16 h-3 inline-block" viewBox="0 0 60 12">
                      <path
                        d="M 2 10 C 20 8, 38 5, 58 2"
                        fill="none"
                        stroke={cfg.sparklineStroke}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface CampaignDemografiaPaisViewProps {
  initialTab?: DemografiaCountryTab;
}

export function CampaignDemografiaPaisView({ initialTab = 'POBLACION' }: CampaignDemografiaPaisViewProps) {
  const [activeTab, setActiveTab] = useState<DemografiaCountryTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">PAÍS</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
            {activeTab}
          </h1>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[#10131b] border border-slate-800">
          {(['POBLACION', 'INMIGRACION', 'EMIGRACION'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === tab ? 'bg-white text-slate-950 shadow' : 'text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'POBLACION' ? (
        <PoblacionTabPanel />
      ) : (
        <MigracionTabPanel activeTab={activeTab} />
      )}
    </div>
  );
}
