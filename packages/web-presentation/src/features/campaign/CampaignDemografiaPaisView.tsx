import React, { useEffect, useMemo, useState } from 'react';
import type { CampaignSimulationState, SimulationState } from '@argentina-sim/domain';

// Vista de PAÍS -> Población, Inmigración y Emigración:
// Ahora calcula flujos migratorios y variacion demografica en tiempo real segun inflacion,
// desempleo, PBI y meses transcurridos en vez de clavar numeros estaticos de maqueta.

export type DemografiaCountryTab = 'POBLACION' | 'INMIGRACION' | 'EMIGRACION';

interface CountryMigRow {
  country: string;
  count: number;
  lastMonth: number;
  twelveMonths: number;
  pct: number;
}

const BASE_IMMIGRATION_TABLE: CountryMigRow[] = [
  { country: 'Paraguay', count: 548956, lastMonth: 503, twelveMonths: 5973, pct: 1.1 },
  { country: 'Bolivia', count: 359208, lastMonth: 389, twelveMonths: 4610, pct: 1.3 },
  { country: 'Venezuela', count: 207976, lastMonth: 953, twelveMonths: 10842, pct: 5.5 },
  { country: 'Perú', count: 168516, lastMonth: 225, twelveMonths: 2654, pct: 1.6 },
  { country: 'Chile', count: 70120, lastMonth: 80, twelveMonths: 950, pct: 0.7 },
  { country: 'Uruguay', count: 54200, lastMonth: 45, twelveMonths: 520, pct: 0.5 }
];

const BASE_EMIGRATION_TABLE: CountryMigRow[] = [
  { country: 'España', count: 303128, lastMonth: 404, twelveMonths: 4774, pct: 1.6 },
  { country: 'Estados Unidos', count: 225967, lastMonth: 188, twelveMonths: 2237, pct: 1.0 },
  { country: 'Paraguay', count: 83252, lastMonth: 56, twelveMonths: 661, pct: 0.8 },
  { country: 'Chile', count: 78436, lastMonth: 59, twelveMonths: 700, pct: 0.9 },
  { country: 'Italia', count: 75200, lastMonth: 85, twelveMonths: 1020, pct: 1.4 },
  { country: 'Israel', count: 48900, lastMonth: 35, twelveMonths: 410, pct: 0.6 }
];

interface DemographicDrivers {
  inflationMonthly: number;
  unemploymentPct: number;
  gdpGrowthPct: number;
  elapsedMonths: number;
}

function extractDriversFromCampaign(c?: CampaignSimulationState): DemographicDrivers {
  const mood = c?.countryMood;
  if (!c || !mood) {
    return { inflationMonthly: 3.8, unemploymentPct: 6.9, gdpGrowthPct: 2.8, elapsedMonths: 1 };
  }
  const impliedGdp = Number(((50 - mood.povertyPct) * 0.18 + 2.2).toFixed(1));
  return {
    inflationMonthly: mood.inflationMonthlyPct,
    unemploymentPct: mood.unemploymentPct,
    gdpGrowthPct: impliedGdp,
    elapsedMonths: c.stage.currentMonthIndex
  };
}

function extractDemographicDrivers(
  campaignState?: CampaignSimulationState,
  govState?: SimulationState
): DemographicDrivers {
  if (govState) {
    return {
      inflationMonthly: govState.inflation.realMonthlyIpcPct,
      unemploymentPct: govState.labor.unemploymentPct,
      gdpGrowthPct: govState.gdpGrowthAnnualPct,
      elapsedMonths: govState.turnMonth
    };
  }
  return extractDriversFromCampaign(campaignState);
}

function scaleMigrationRows(rows: CountryMigRow[], mult: number, months: number): CountryMigRow[] {
  return rows.map((row) => {
    const lastMonth = Math.max(12, Math.round(row.lastMonth * mult));
    const twelveMonths = Math.max(140, Math.round(row.twelveMonths * mult));
    const count = Math.round(row.count + lastMonth * (months - 1));
    const pct = Number(((twelveMonths / Math.max(1, count)) * 100).toFixed(2));
    return { ...row, count, lastMonth, twelveMonths, pct };
  });
}

interface ComputedDemographics {
  poblacionMillonesStr: string;
  variacion12MesesStr: string;
  inmigrantesMillonesStr: string;
  inmigrantesTotalStr: string;
  inmigrantes12MesesStr: string;
  emigrantesTotalStr: string;
  emigrantes12MesesStr: string;
  saldoUltimoMesStr: string;
  saldoPositive: boolean;
  immigrationRows: CountryMigRow[];
  emigrationRows: CountryMigRow[];
  driverSummary: string;
}

function computeDynamicDemographics(
  campaignState?: CampaignSimulationState,
  govState?: SimulationState
): ComputedDemographics {
  const d = extractDemographicDrivers(campaignState, govState);
  const immMult = Math.max(
    0.55,
    Math.min(1.85, 1 + (d.gdpGrowthPct - 2.2) * 0.08 - (d.inflationMonthly - 4.0) * 0.035)
  );
  const emiMult = Math.max(
    0.55,
    Math.min(2.4, 1 + (d.inflationMonthly - 3.5) * 0.075 + (d.unemploymentPct - 6.8) * 0.065)
  );

  const immigrationRows = scaleMigrationRows(BASE_IMMIGRATION_TABLE, immMult, d.elapsedMonths);
  const emigrationRows = scaleMigrationRows(BASE_EMIGRATION_TABLE, emiMult, d.elapsedMonths);

  const immMonth = immigrationRows.reduce((acc, r) => acc + r.lastMonth, 0);
  const emiMonth = emigrationRows.reduce((acc, r) => acc + r.lastMonth, 0);
  const saldoMes = immMonth - emiMonth;

  const imm12m = Math.round(35044 * immMult);
  const emi12m = Math.round(16859 * emiMult);
  const immTotal = 2141730 + immMonth * (d.elapsedMonths - 1);
  const emiTotal = 1366430 + emiMonth * (d.elapsedMonths - 1);
  const var12m = Math.round(324500 + imm12m - emi12m);
  const popMillions = 47.61 + (var12m / 12000000) * (d.elapsedMonths - 1);

  return {
    poblacionMillonesStr: popMillions.toFixed(2).replace('.', ','),
    variacion12MesesStr: var12m.toLocaleString('es-AR'),
    inmigrantesMillonesStr: (immTotal / 1000000).toFixed(2).replace('.', ','),
    inmigrantesTotalStr: immTotal.toLocaleString('es-AR'),
    inmigrantes12MesesStr: imm12m.toLocaleString('es-AR'),
    emigrantesTotalStr: emiTotal.toLocaleString('es-AR'),
    emigrantes12MesesStr: emi12m.toLocaleString('es-AR'),
    saldoUltimoMesStr: `${saldoMes >= 0 ? '+' : ''}${saldoMes.toLocaleString('es-AR')}`,
    saldoPositive: saldoMes >= 0,
    immigrationRows,
    emigrationRows,
    driverSummary: `IPC ${d.inflationMonthly.toFixed(1)}% · Desempleo ${d.unemploymentPct.toFixed(1)}% · PBI ${d.gdpGrowthPct >= 0 ? '+' : ''}${d.gdpGrowthPct.toFixed(1)}%`
  };
}

function PoblacionTabPanel({ demo }: { demo: ComputedDemographics }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            POBLACIÓN NACIONAL
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {demo.poblacionMillonesStr}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">millones</span>
          </div>
        </div>
        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
            VARIACIÓN EN 12 MESES
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {demo.variacion12MesesStr}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">hab.</span>
          </div>
        </div>
        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4b26a]">
            PADRÓN ELECTORAL CNE
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            36,26 <span className="text-xs font-sans font-normal text-slate-400">millones</span>
          </div>
        </div>
        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
            INMIGRANTES RESIDENTES
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {demo.inmigrantesMillonesStr}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">millones</span>
          </div>
        </div>
      </div>

      <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-5 space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400">
          <span className="font-mono font-bold uppercase tracking-wider text-white">
            Curva de Población y Saldo Migratorio Nacional
          </span>
          <span className="font-mono text-[11px] text-[#d4b26a]">
             Impulsores macro: {demo.driverSummary}
          </span>
        </div>
        <div className="h-44 w-full flex items-center justify-center border-b border-[#1c2432]">
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
  demo: ComputedDemographics;
}

function resolveMigracionPanelConfig(
  activeTab: 'INMIGRACION' | 'EMIGRACION',
  demo: ComputedDemographics
) {
  if (activeTab === 'INMIGRACION') {
    return {
      table: demo.immigrationRows,
      mainCardTitle: 'INMIGRANTES RESIDENTES',
      mainCardNumber: demo.inmigrantesTotalStr,
      twelveMonthsNumber: demo.inmigrantes12MesesStr,
      listTitle: 'Inmigración por país de origen (RENAPER / DNM)',
      colCountTitle: 'Residentes',
      sparklineStroke: '#2dd4bf'
    };
  }
  return {
    table: demo.emigrationRows,
    mainCardTitle: 'ARGENTINOS EN EL EXTERIOR',
    mainCardNumber: demo.emigrantesTotalStr,
    twelveMonthsNumber: demo.emigrantes12MesesStr,
    listTitle: 'Emigración por país de destino (Consulados / DNM)',
    colCountTitle: 'Argentinos',
    sparklineStroke: '#f43f5e'
  };
}

function MigracionTabPanel({ activeTab, demo }: MigracionTabPanelProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const cfg = resolveMigracionPanelConfig(activeTab, demo);

  const filteredRows = cfg.table.filter((r) =>
    r.country.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
            {cfg.mainCardTitle}
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {cfg.mainCardNumber}
          </div>
        </div>
        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
            VARIACIÓN EN 12 MESES
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {cfg.twelveMonthsNumber}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">pers.</span>
          </div>
        </div>
        <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
            SALDO MIGRATORIO DEL ÚLTIMO MES
          </div>
          <div
            className={`text-2xl md:text-3xl font-mono font-extrabold mt-1 ${
              demo.saldoPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {demo.saldoUltimoMesStr}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">pers.</span>
          </div>
        </div>
      </div>

      <div className="rounded-sm bg-[#0c1119] border border-[#263142] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              {cfg.listTitle}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Sensibilidad macro activa: {demo.driverSummary}
            </div>
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar país..."
            className="bg-[#080b11] border border-[#263142] rounded-sm px-3 py-1.5 text-xs font-mono text-white max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#263142] text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2">País</th>
                <th className="py-2 text-right">{cfg.colCountTitle}</th>
                <th className="py-2 text-right">Último mes</th>
                <th className="py-2 text-right">12 meses</th>
                <th className="py-2 text-right">%</th>
                <th className="py-2 text-center">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2432] font-mono">
              {filteredRows.map((row) => (
                <tr key={row.country} className="hover:bg-[#121926]">
                  <td className="py-2.5 font-sans font-semibold text-white">{row.country}</td>
                  <td className="py-2.5 text-right text-slate-200">{row.count.toLocaleString('es-AR')}</td>
                  <td className="py-2.5 text-right text-emerald-400">+{row.lastMonth}</td>
                  <td className="py-2.5 text-right text-emerald-400">
                    +{row.twelveMonths.toLocaleString('es-AR')}
                  </td>
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
  campaignState?: CampaignSimulationState;
  govState?: SimulationState;
}

export function CampaignDemografiaPaisView({
  initialTab = 'POBLACION',
  campaignState,
  govState
}: CampaignDemografiaPaisViewProps) {
  const [activeTab, setActiveTab] = useState<DemografiaCountryTab>(initialTab);
  const demo = useMemo(
    () => computeDynamicDemographics(campaignState, govState),
    [campaignState, govState]
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#263142] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#d4b26a]">
            CENSO Y FLUJO MIGRATORIO · PAÍS
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mt-0.5">
            {activeTab}
          </h1>
        </div>

        <div className="inline-flex p-1 rounded-sm bg-[#0c1119] border border-[#263142]">
          {(['POBLACION', 'INMIGRACION', 'EMIGRACION'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${
                activeTab === tab
                  ? 'bg-[#d4b26a] text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'POBLACION' ? (
        <PoblacionTabPanel demo={demo} />
      ) : (
        <MigracionTabPanel activeTab={activeTab} demo={demo} />
      )}
    </div>
  );
}
