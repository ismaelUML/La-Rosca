import React, { useState } from 'react';
import type {
  CampaignSimulationState,
  DemographicSegmentItem
} from '@argentina-sim/domain';
import { ArgentinaRealVectorMap } from './ArgentinaRealVectorMap.js';

// Vista de SITUACION -> Imagen y mapa en estetica tactica acero/bronce:
// desglose de imagen por ideologia, edad y poder adquisitivo + mapa cartografico vectorial de interna.

interface DemographicColumnProps {
  title: string;
  items: DemographicSegmentItem[];
}

function DemographicColumn({ title, items }: DemographicColumnProps) {
  return (
    <div className="rounded-sm bg-[#090d14] border border-[#263142] p-4 space-y-3.5">
      <div className="text-xs font-serif font-bold uppercase tracking-wider text-amber-100 border-b border-[#1e293b] pb-2">
        {title}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="flex items-center gap-2 text-slate-200">
                <span
                  style={{ backgroundColor: item.dotColor }}
                  className="w-2.5 h-2.5 rounded-sm inline-block border border-black/40"
                />
                <span>{item.name}</span>
              </span>
              <span className="font-mono font-bold text-amber-300">{item.approvalPct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-sm bg-[#141c28] border border-[#263142] overflow-hidden">
              <div
                style={{ width: `${item.approvalPct}%`, backgroundColor: item.dotColor }}
                className="h-full"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              Peso en padrón nacional: {item.electorateWeightPct}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CampaignImageAndMapViewProps {
  state: CampaignSimulationState;
}

export function CampaignImageAndMapView({ state }: CampaignImageAndMapViewProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState(state.targetProvinceId || 'PBA');
  const [mapDivision, setMapDivision] = useState<'PROVINCIA' | 'DEPARTAMENTO'>('PROVINCIA');

  const selectedProv =
    state.provinces.find((p) => p.provinceId === selectedProvinceId) ?? state.provinces[0]!;

  return (
    <div className="space-y-6">
      <header className="hoi-panel hoi-header-steel rounded-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
            SITUACIÓN · TELEMETRÍA Y CARTOGRAFÍA ELECTORAL
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 mt-0.5 uppercase tracking-wide">
            Imagen y mapa
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#263142] text-slate-300">
            positiva: <strong className="text-emerald-400">{state.image.imagenPositiva.toFixed(1)}%</strong>
          </span>
          <span className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#8a6d33]/70 text-amber-200">
            interna: <strong>{state.votingIntention.tuInterna.toFixed(1)}%</strong>
          </span>
        </div>
      </header>

      <section className="hoi-panel rounded-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#263142] pb-2.5">
          <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-amber-100">
            Imagen positiva según el segmento demográfico
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Ponderado por Censo e INDEC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <DemographicColumn title="Por ideología" items={state.demographics.byIdeology} />
          <DemographicColumn title="Por rango etario" items={state.demographics.byAge} />
          <DemographicColumn title="Por poder adquisitivo" items={state.demographics.byIncome} />
        </div>

        <p className="text-xs font-mono text-slate-400">
          La imagen positiva dentro de cada corte alimenta el techo electoral y la transferencia de votos hacia el balotaje.
        </p>
      </section>

      <section className="hoi-panel rounded-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#263142] pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
              DESPLIEGUE TERRITORIAL IGN
            </div>
            <h2 className="text-base font-serif font-bold uppercase tracking-wider text-amber-100">
              Mapa de intención de voto en la interna
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-sm bg-[#090d14] border border-[#263142]">
              <button
                type="button"
                onClick={() => setMapDivision('PROVINCIA')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${
                  mapDivision === 'PROVINCIA'
                    ? 'bg-[#b89342] text-[#090d14]'
                    : 'text-slate-300 hover:bg-[#151e2c]'
                }`}
              >
                Por provincia
              </button>
              <button
                type="button"
                onClick={() => setMapDivision('DEPARTAMENTO')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${
                  mapDivision === 'DEPARTAMENTO'
                    ? 'bg-[#b89342] text-[#090d14]'
                    : 'text-slate-300 hover:bg-[#151e2c]'
                }`}
              >
                Por departamento
              </button>
            </div>
          </div>
        </div>

        <ArgentinaRealVectorMap
          mode={mapDivision}
          provinces={state.provinces}
          selectedProvinceId={selectedProvinceId}
          partySigla={state.partySigla}
          internalCandidates={state.internalPoll?.candidates}
          onSelectProvince={setSelectedProvinceId}
        />

        <div className="p-3.5 rounded-sm bg-[#090d14] border border-[#263142] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div>
            Distrito seleccionado: <strong className="text-amber-100">{selectedProv.provinceName}</strong> · Visitas acumuladas:{' '}
            <strong className="text-sky-400">{selectedProv.visitsCount}</strong>
          </div>
          <div className="text-slate-400">
            Afinidad ideológica: <strong className="text-amber-300">{selectedProv.ideologicalAffinity}</strong> · Multiplicador territorial:{' '}
            <strong className="text-emerald-400">×{selectedProv.affinityMultiplier}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
