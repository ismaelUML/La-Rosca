import React, { useState } from 'react';
import type {
  CampaignSimulationState,
  DemographicSegmentItem
} from '@argentina-sim/domain';
import { ArgentinaRealVectorMap } from './ArgentinaRealVectorMap.js';

// Vista de SITUACIÓN -> Imagen y mapa (capturas 4 y 5):
// desgloses de imagen por ideologia, edad y poder adquisitivo,
// y mapa cartografico vectorial autentico de Argentina por provincia y por departamento.

interface DemographicColumnProps {
  title: string;
  items: DemographicSegmentItem[];
}

function DemographicColumn({ title, items }: DemographicColumnProps) {
  return (
    <div className="rounded-2xl bg-[#10131b] border border-slate-800/90 p-5 space-y-4">
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="space-y-3.5">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="flex items-center gap-2 text-slate-200">
                <span
                  style={{ backgroundColor: item.dotColor }}
                  className="w-2.5 h-2.5 rounded-full inline-block"
                />
                {item.name}
              </span>
              <span className="font-mono font-bold text-white">{item.approvalPct.toFixed(1)} %</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${item.approvalPct}%`, backgroundColor: item.dotColor }}
                className="h-full rounded-full"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              pesa {item.electorateWeightPct} % del padrón
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
      <div className="border-b border-slate-800/80 pb-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
            SITUACIÓN
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
            Imagen y mapa
          </h1>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Guardado · se puede seguir con el código desde cualquier dispositivo
        </span>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-slate-500">|</span> Imagen positiva según el segmento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <DemographicColumn title="Por ideología" items={state.demographics.byIdeology} />
          <DemographicColumn title="Por edad" items={state.demographics.byAge} />
          <DemographicColumn
            title="Por poder adquisitivo"
            items={state.demographics.byIncome}
          />
        </div>

        <p className="text-xs text-slate-400">
          Es la imagen positiva de tu candidatura dentro de cada segmento; el peso de cada grupo en el electorado se indica debajo de cada barra.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-slate-500">|</span> Mapa de intención de voto en la interna
          </h2>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-[#10131b] border border-slate-800">
              <button
                type="button"
                onClick={() => setMapDivision('PROVINCIA')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  mapDivision === 'PROVINCIA' ? 'bg-white text-slate-950' : 'text-slate-300'
                }`}
              >
                Por provincia
              </button>
              <button
                type="button"
                onClick={() => setMapDivision('DEPARTAMENTO')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  mapDivision === 'DEPARTAMENTO' ? 'bg-white text-slate-950' : 'text-slate-300'
                }`}
              >
                Por departamento
              </button>
            </div>
            <span className="text-xs text-slate-400 hidden md:inline">
              Proyección de la elección general
            </span>
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

        <div className="p-4 rounded-xl bg-[#10131b] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            Distrito seleccionado: <strong className="text-white">{selectedProv.provinceName}</strong> · Visitas acumuladas: <strong className="text-sky-400">{selectedProv.visitsCount}</strong>
          </div>
          <div className="text-slate-400">
            Afinidad ideológica: <strong className="text-amber-400">{selectedProv.ideologicalAffinity}</strong> · Multiplicador territorial: <strong className="text-emerald-400">×{selectedProv.affinityMultiplier}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
