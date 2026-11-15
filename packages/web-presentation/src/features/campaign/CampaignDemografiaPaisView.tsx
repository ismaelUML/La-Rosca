import React, { useEffect, useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import type { CampaignSimulationState, SimulationState } from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';

// Vista integral de PAÍS (presente tanto en Campaña como en Presidencia / Gobierno):
// Demografía, Inmigración, Emigración, Tejido Social (Salud/Educación/Vivienda) y Matriz Productiva.

export type DemografiaCountryTab =
  | 'POBLACION'
  | 'INMIGRACION'
  | 'EMIGRACION'
  | 'TEJIDO_SOCIAL'
  | 'MATRIZ_PRODUCTIVA';

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
  { country: 'Uruguay', count: 54200, lastMonth: 45, twelveMonths: 520, pct: 0.5 },
  { country: 'Brasil', count: 49810, lastMonth: 112, twelveMonths: 1320, pct: 2.6 },
  { country: 'Colombia', count: 46340, lastMonth: 145, twelveMonths: 1690, pct: 3.6 }
];

const BASE_EMIGRATION_TABLE: CountryMigRow[] = [
  { country: 'España', count: 303128, lastMonth: 404, twelveMonths: 4774, pct: 1.6 },
  { country: 'Estados Unidos', count: 225967, lastMonth: 188, twelveMonths: 2237, pct: 1.0 },
  { country: 'Paraguay', count: 83252, lastMonth: 56, twelveMonths: 661, pct: 0.8 },
  { country: 'Chile', count: 78436, lastMonth: 59, twelveMonths: 700, pct: 0.9 },
  { country: 'Italia', count: 75200, lastMonth: 85, twelveMonths: 1020, pct: 1.4 },
  { country: 'Israel', count: 48900, lastMonth: 35, twelveMonths: 410, pct: 0.6 },
  { country: 'Uruguay', count: 42150, lastMonth: 64, twelveMonths: 760, pct: 1.8 },
  { country: 'Alemania', count: 31400, lastMonth: 42, twelveMonths: 495, pct: 1.5 }
];

interface DemographicDrivers {
  inflationMonthly: number;
  unemploymentPct: number;
  gdpGrowthPct: number;
  povertyPct: number;
  elapsedMonths: number;
}

function extractDriversFromCampaign(c?: CampaignSimulationState): DemographicDrivers {
  const mood = c?.countryMood;
  if (!c || !mood) {
    return {
      inflationMonthly: 3.8,
      unemploymentPct: 6.9,
      gdpGrowthPct: 2.8,
      povertyPct: 36.5,
      elapsedMonths: 1
    };
  }
  const impliedGdp = Number(((50 - mood.povertyPct) * 0.18 + 2.2).toFixed(1));
  return {
    inflationMonthly: mood.inflationMonthlyPct,
    unemploymentPct: mood.unemploymentPct,
    gdpGrowthPct: impliedGdp,
    povertyPct: mood.povertyPct,
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
      povertyPct: govState.inflation.povertyCbtPct,
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
  drivers: DemographicDrivers;
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
    drivers: d,
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
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            POBLACIÓN NACIONAL
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {demo.poblacionMillonesStr}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">millones</span>
          </div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
            VARIACIÓN EN 12 MESES
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {demo.variacion12MesesStr}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">hab.</span>
          </div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d4b26a]">
            PADRÓN ELECTORAL CNE
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            36,26 <span className="text-xs font-sans font-normal text-slate-400">millones</span>
          </div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
            INMIGRANTES RESIDENTES
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {demo.inmigrantesMillonesStr}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">millones</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono text-xs">
        <div className="hoi-panel rounded-sm p-3.5 bg-[#090d14]">
          <div className="text-[10px] text-slate-400 uppercase">Esperanza de Vida</div>
          <div className="text-lg font-extrabold text-emerald-400 mt-0.5">77,4 años</div>
          <div className="text-[10px] text-slate-500">Mujeres 80,6 · Hombres 74,2</div>
        </div>
        <div className="hoi-panel rounded-sm p-3.5 bg-[#090d14]">
          <div className="text-[10px] text-slate-400 uppercase">Tasa de Urbanización</div>
          <div className="text-lg font-extrabold text-sky-400 mt-0.5">92,5 %</div>
          <div className="text-[10px] text-slate-500">AMBA concentra 35,8% nac.</div>
        </div>
        <div className="hoi-panel rounded-sm p-3.5 bg-[#090d14]">
          <div className="text-[10px] text-slate-400 uppercase">Edad Mediana</div>
          <div className="text-lg font-extrabold text-amber-300 mt-0.5">33,1 años</div>
          <div className="text-[10px] text-slate-500">Bono demográfico activo</div>
        </div>
        <div className="hoi-panel rounded-sm p-3.5 bg-[#090d14]">
          <div className="text-[10px] text-slate-400 uppercase">Tasa de Natalidad</div>
          <div className="text-lg font-extrabold text-slate-200 mt-0.5">11,2 ‰</div>
          <div className="text-[10px] text-slate-500">Fecundidad: 1,54 hijos/mujer</div>
        </div>
      </div>

      <div className="hoi-panel rounded-sm p-5 space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400">
          <span className="font-serif font-bold uppercase tracking-wider text-amber-100">
            Curva de Población y Saldo Migratorio Nacional (RENAPER / INDEC)
          </span>
          <span className="font-mono text-[11px] text-[#d4b26a]">
            Impulsores macro: {demo.driverSummary}
          </span>
        </div>
        <div className="h-44 w-full flex items-center justify-center border-b border-[#1c2432] bg-[#070a10] rounded-sm p-2">
          <svg viewBox="0 0 500 120" className="w-full h-full">
            <line x1="20" y1="30" x2="480" y2="30" stroke="#1b2333" strokeDasharray="3 3" />
            <line x1="20" y1="70" x2="480" y2="70" stroke="#1b2333" strokeDasharray="3 3" />
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
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
            {cfg.mainCardTitle}
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {cfg.mainCardNumber}
          </div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
            VARIACIÓN EN 12 MESES
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-white mt-1">
            {cfg.twelveMonthsNumber}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">pers.</span>
          </div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
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

      <div className="hoi-panel rounded-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-serif font-bold uppercase tracking-wider text-amber-100">
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

function TejidoSocialTabPanel({ demo }: { demo: ComputedDemographics }) {
  const pov = demo.drivers.povertyPct;
  const middleClass = Math.max(25, Math.min(58, Number((68 - pov * 0.65).toFixed(1))));
  const upperClass = 6.8;
  const vulnerable = Number(Math.max(8, 100 - upperClass - middleClass - pov).toFixed(1));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono">
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] text-amber-300 uppercase">Clase Media Integrada</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{middleClass.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">EPH 31 Aglomerados Urbanos</div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] text-rose-300 uppercase">Pobreza Urbana (CBT)</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{pov.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Vulnerables no pobres: {vulnerable}%</div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] text-sky-300 uppercase">Alfabetización y Escolaridad</div>
          <div className="text-2xl font-extrabold text-sky-300 mt-1">99,1%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">2,48M alumnos universitarios</div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] text-teal-300 uppercase">Déficit Habitacional</div>
          <div className="text-2xl font-extrabold text-amber-200 mt-1">3,65M</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Hogares (1,3M cuantitativo)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="hoi-panel rounded-sm p-5 space-y-3 text-xs">
          <div className="border-b border-[#263142] pb-2">
            <span className="text-[10px] font-mono text-amber-300 uppercase block">SALUD Y SEGURIDAD SOCIAL</span>
            <h3 className="text-sm font-serif font-bold uppercase text-amber-100">
              Cobertura del Sistema Sanitario Argentino
            </h3>
          </div>
          <div className="space-y-2 font-mono">
            <div className="flex justify-between p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
              <span className="text-slate-300">Obras Sociales Sindicales y PAMI</span>
              <strong className="text-sky-300">48,6 %</strong>
            </div>
            <div className="flex justify-between p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
              <span className="text-slate-300">Red Hospitalaria Pública Exclusiva</span>
              <strong className="text-amber-300">37,2 %</strong>
            </div>
            <div className="flex justify-between p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
              <span className="text-slate-300">Medicina Prepaga Privada</span>
              <strong className="text-emerald-400">14,2 %</strong>
            </div>
          </div>
        </div>

        <div className="hoi-panel rounded-sm p-5 space-y-3 text-xs">
          <div className="border-b border-[#263142] pb-2">
            <span className="text-[10px] font-mono text-amber-300 uppercase block">EDUCACIÓN Y CIENCIA</span>
            <h3 className="text-sm font-serif font-bold uppercase text-amber-100">
              Indicadores Educativos y Universitarios
            </h3>
          </div>
          <div className="space-y-2 font-mono">
            <div className="flex justify-between p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
              <span className="text-slate-300">Egreso Secundario en Tiempo y Forma</span>
              <strong className="text-amber-200">61,4 %</strong>
            </div>
            <div className="flex justify-between p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
              <span className="text-slate-300">Universidades Nacionales (57 casas)</span>
              <strong className="text-emerald-400">2,02M estudiantes</strong>
            </div>
            <div className="flex justify-between p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
              <span className="text-slate-300">Investigadores CONICET / I+D</span>
              <strong className="text-sky-300">11.850 científicos</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatrizProductivaTabPanel({ demo }: { demo: ComputedDemographics }) {
  const gdp = demo.drivers.gdpGrowthPct;
  const oilBbl = Math.round(455 + demo.drivers.elapsedMonths * 8 + gdp * 6);
  const agroTons = Math.round(131 + gdp * 1.8);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono">
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] text-amber-300 uppercase">Crudo Vaca Muerta</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{oilBbl}k bbl/d</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cuenca Neuquina + Golfo San Jorge</div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] text-sky-300 uppercase">Cosecha Granaria Total</div>
          <div className="text-2xl font-extrabold text-amber-200 mt-1">{agroTons} M Ton</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Soja, Maíz, Trigo y Girasol</div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] text-teal-300 uppercase">Carbonato de Litio</div>
          <div className="text-2xl font-extrabold text-sky-300 mt-1">138k Ton</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Jujuy, Salta y Catamarca (3º mundial)</div>
        </div>
        <div className="hoi-panel rounded-sm p-4">
          <div className="text-[10px] text-emerald-300 uppercase">Economía del Conocimiento</div>
          <div className="text-2xl font-extrabold text-white mt-1">8,9B USD</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Software, satélites y biotecnología</div>
        </div>
      </div>

      <div className="hoi-panel rounded-sm p-5 space-y-3 text-xs">
        <div className="border-b border-[#263142] pb-2">
          <span className="text-[10px] font-mono text-amber-300 uppercase block">COMPLEJOS EXPORTADORES Y PRODUCTIVOS</span>
          <h3 className="text-sm font-serif font-bold uppercase text-amber-100">
            Motores Regionales del PBI Argentino
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
          <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142] space-y-1">
            <div className="text-amber-200 font-bold">1. Polo Agroindustrial Pampeano</div>
            <div className="text-[11px] text-slate-400">
              PBA, Santa Fe, Córdoba y Entre Ríos · 54% de las divisas FOB por harinas, aceites y granos.
            </div>
          </div>
          <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142] space-y-1">
            <div className="text-sky-300 font-bold">2. Corredor Energético Patagónico</div>
            <div className="text-[11px] text-slate-400">
              Neuquén, Río Negro, Chubut y Santa Cruz · Gasoductos troncales, petróleo shale y terminales GNL.
            </div>
          </div>
          <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142] space-y-1">
            <div className="text-emerald-300 font-bold">3. Arco Minero Andino y NOA</div>
            <div className="text-[11px] text-slate-400">
              San Juan, Catamarca, Salta y Jujuy · Megaproyectos de cobre porfírico y salares de litio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const COUNTRY_TABS_META: Array<{ id: DemografiaCountryTab; label: string }> = [
  { id: 'POBLACION', label: 'Población y Censo' },
  { id: 'INMIGRACION', label: 'Inmigración' },
  { id: 'EMIGRACION', label: 'Emigración' },
  { id: 'TEJIDO_SOCIAL', label: 'Salud, Educación y Sociedad' },
  { id: 'MATRIZ_PRODUCTIVA', label: 'Matriz Productiva y Energía' }
];

interface CampaignDemografiaPaisViewProps {
  initialTab?: DemografiaCountryTab;
  campaignState?: CampaignSimulationState;
  govState?: SimulationState;
}

function CountryTabContent({
  activeTab,
  demo
}: {
  activeTab: DemografiaCountryTab;
  demo: ComputedDemographics;
}) {
  if (activeTab === 'POBLACION') return <PoblacionTabPanel demo={demo} />;
  if (activeTab === 'TEJIDO_SOCIAL') return <TejidoSocialTabPanel demo={demo} />;
  if (activeTab === 'MATRIZ_PRODUCTIVA') return <MatrizProductivaTabPanel demo={demo} />;
  return <MigracionTabPanel activeTab={activeTab} demo={demo} />;
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

  const currentTabLabel = COUNTRY_TABS_META.find((t) => t.id === activeTab)?.label ?? activeTab;

  return (
    <div className="space-y-5 rosca-panel-enter">
      <div className="hoi-panel hoi-header-steel rounded-sm p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#090d14] border border-[#8a6d33] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
              RADIOGRAFÍA ESTRUCTURAL DE LA REPÚBLICA ARGENTINA · PAÍS
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-extrabold uppercase tracking-wide text-amber-100 mt-0.5">
              {currentTabLabel}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COUNTRY_TABS_META.map((tab) => {
            const isSelected = activeTab === tab.id;
            const cls = isSelected
              ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
              : 'bg-[#090d14] text-slate-300 border-[#263142] hover:border-[#8a6d33]';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playUiSound('tab');
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider border transition ${cls}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <CountryTabContent activeTab={activeTab} demo={demo} />
    </div>
  );
}
