import React, { useState } from 'react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionStripCard } from '@/features/game-shell/ActionStripCard';

// Aca manejas la relacion con la Corte Suprema, los expedientes de Comodoro Py
// y la caja de ATN con los 24 gobernadores para juntar votos y gobernabilidad.

interface JudicialAndProvincesViewProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

type JudicialProvincesTab = 'judicial' | 'provinces';
type ProvinceFilter = 'all' | 'critical' | 'allied';

function buildJudicialAlert(state: SimulationState): string {
  const { judicial } = state;
  if (judicial.cautelaresBlockingDnuCount > 0) {
    return `Tenés ${judicial.cautelaresBlockingDnuCount} cautelar(es) frenando DNU o tarifas: necesitás mayoría de 3 votos en la Corte para destrabarlas.`;
  }
  if (judicial.judicialInterferenceTraceIndex > 55) {
    return `Rastro de operadores muy alto (${judicial.judicialInterferenceTraceIndex}%): si seguís apretando jueces, puede explotar un escándalo mediático.`;
  }
  return 'Frente judicial sin cautelares activas contra tus decretos; mantené controlado el rastro de operadores.';
}

function buildProvincesAlert(state: SimulationState): string {
  const quasiCount = state.provinces.filter((p) => p.quasiCurrencyIssued).length;
  if (quasiCount > 0) {
    return `Hay ${quasiCount} provincia(s) emitiendo cuasimonedas: te complica la unificación monetaria y la recaudación.`;
  }
  const hostileCount = state.provinces.filter((p) => p.governorLoyaltyToPresident < 45).length;
  if (hostileCount >= 8) {
    return `${hostileCount} gobernadores están enfrentados con la Rosada: te pueden trabar leyes clave en el Congreso.`;
  }
  return 'Los gobernadores responden a la caja de ATN y la coparticipación: usalos para asegurar votos en el Senado y Diputados.';
}

function SupremeCourtList({ state }: { state: SimulationState }) {
  const { judicial } = state;
  return (
    <div className="space-y-1.5 rounded-sm bg-[#090d14] p-3 border border-[#263142]">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-mono font-bold uppercase tracking-wider text-amber-300">Corte Suprema (5 Jueces · mayoría de 3)</span>
        <span className="text-[11px] font-mono text-slate-400">Tope 75 años</span>
      </div>
      {judicial.supremeCourt.map((j) => (
        <div key={j.id} className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 last:border-b-0 last:pb-0 text-xs">
          <div>
            <span className="font-medium text-slate-200">{j.name}</span>
            <span className="text-[11px] text-slate-400 block">
              {j.age} años · Doctrina {j.doctrine}
              {j.requiresSenateReconfirmationSoon ? ' · Requiere acuerdo Senado' : ''}
            </span>
          </div>
          <Badge variant={j.alignmentWithExecutive > 55 ? 'success' : 'warning'}>
            Afinidad {j.alignmentWithExecutive}%
          </Badge>
        </div>
      ))}
    </div>
  );
}

function JudicialTabContent({ state, onDispatch }: JudicialAndProvincesViewProps) {
  const { judicial } = state;

  return (
    <div className="space-y-3">
      <SupremeCourtList state={state} />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Expedientes en Comodoro Py
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          Rastro operadores: {judicial.judicialInterferenceTraceIndex}%
        </span>
      </div>

      <div className="space-y-2">
        {judicial.activeCases.map((c) => (
          <ActionStripCard
            key={c.id}
            icon="PY"
            iconTileClass="bg-[#231b10] text-amber-300"
            urgentLabel={c.stage}
            urgentClass="bg-amber-600 text-white"
            title={c.title}
            subtitle={`Acusado: ${c.accusedFaction} · Juzgado Federal #${c.judgeId}`}
            tradeoff="Dormir frena la causa pero suma rastro de operadores; acelerar mete presión política."
          >
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDispatch({ type: 'OPERATE_COMODORO_PY_CASE', caseId: c.id, operation: 'FREEZE' })}
              >
                Dormir (Falta mérito)
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDispatch({ type: 'OPERATE_COMODORO_PY_CASE', caseId: c.id, operation: 'PUSH' })}
              >
                Acelerar causa
              </Button>
            </div>
          </ActionStripCard>
        ))}
      </div>

      <div className="rounded-sm border border-[#263142] bg-[#0b1018] px-3.5 py-2.5 text-xs">
        <span className="font-mono font-bold uppercase text-amber-400 mr-1.5">ESTADO:</span>
        <span className="text-slate-300">{buildJudicialAlert(state)}</span>
      </div>
    </div>
  );
}

function filterProvinces(provinces: SimulationState['provinces'], filter: ProvinceFilter) {
  if (filter === 'critical') {
    return provinces.filter((p) => p.governorLoyaltyToPresident <= 50 || p.quasiCurrencyIssued);
  }
  if (filter === 'allied') {
    return provinces.filter((p) => p.governorLoyaltyToPresident > 50);
  }
  return provinces;
}

function resolveProvinceLoyaltyStyle(loyalty: number) {
  if (loyalty > 55) {
    return { iconTileClass: 'bg-emerald-950/80 text-emerald-300', variant: 'done' as const };
  }
  return { iconTileClass: 'bg-amber-950/80 text-amber-300', variant: 'primary' as const };
}

function ProvinceStripRow({
  province,
  onSendAtn
}: {
  province: SimulationState['provinces'][number];
  onSendAtn: (provinceId: string) => void;
}) {
  const loyaltyUi = resolveProvinceLoyaltyStyle(province.governorLoyaltyToPresident);
  const icon = province.quasiCurrencyIssued ? 'CM' : 'ATN';
  const urgentLabel = province.quasiCurrencyIssued ? 'Cuasimoneda' : undefined;
  const reelectionTag = province.reelectionAllowed ? '' : ' · Sin reelección';

  return (
    <ActionStripCard
      icon={icon}
      iconTileClass={loyaltyUi.iconTileClass}
      urgentLabel={urgentLabel}
      urgentClass="bg-rose-600 text-white"
      title={`${province.name} · ${province.nationalDeputiesCount} Dip.`}
      subtitle={`Lealtad: ${province.governorLoyaltyToPresident}% · Dep. Copart.: ${province.coparticipationDependencyPct}% · Fiscal: ${province.fiscalBalancePct}%${reelectionTag}`}
      rightAction={{
        label: 'Girar ATN',
        sublabel: '0.08% PBI',
        variant: loyaltyUi.variant,
        onClick: () => onSendAtn(province.id)
      }}
    />
  );
}

function ProvincesTabContent({ state, onDispatch }: JudicialAndProvincesViewProps) {
  const [filter, setFilter] = useState<ProvinceFilter>('all');
  const { provinces, publicOpinion, treasury } = state;
  const visibleProvinces = filterProvinces(provinces, filter);
  const handleSendAtn = (provinceId: string) =>
    onDispatch({ type: 'SEND_ATN_TO_PROVINCE', provinceId, amountPctGdp: 0.08 });

  return (
    <div className="space-y-3">
      <div className="rounded-sm bg-[#090d14] p-3 border border-[#263142] space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold uppercase tracking-wider text-amber-300">Agenda Semanal en Medios y Streaming</span>
          <span className="text-[11px] text-slate-400 font-mono">
            Nación {treasury.nonCoparticipableRevenuePctGdp}% · Copart. {treasury.coparticipableRevenuePctGdp}%
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {publicOpinion.agendaSlots.map((topic, idx) => (
            <div key={idx} className="rounded-sm bg-[#11161f] border border-[#263142] px-2.5 py-1.5 text-slate-300">
              <span className="text-amber-400 font-mono mr-1">#{idx + 1}</span>
              {topic}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
          24 Jurisdicciones · Giro de ATN
        </span>
        <div className="flex gap-1 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-sm border ${filter === 'all' ? 'bg-[#b89342] border-[#c9a24d] text-[#100e09] font-bold' : 'bg-[#090d14] border-[#263142] text-slate-400'}`}
          >
            Todas ({provinces.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-2.5 py-1 rounded-sm border ${filter === 'critical' ? 'bg-rose-800 border-rose-600 text-white font-bold' : 'bg-[#090d14] border-[#263142] text-slate-400'}`}
          >
            Críticas
          </button>
          <button
            type="button"
            onClick={() => setFilter('allied')}
            className={`px-2.5 py-1 rounded-sm border ${filter === 'allied' ? 'bg-emerald-800 border-emerald-600 text-white font-bold' : 'bg-[#090d14] border-[#263142] text-slate-400'}`}
          >
            Aliadas
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
        {visibleProvinces.map((p) => (
          <ProvinceStripRow key={p.id} province={p} onSendAtn={handleSendAtn} />
        ))}
      </div>

      <div className="rounded-sm border border-[#263142] bg-[#0b1018] px-3.5 py-2.5 text-xs">
        <span className="font-mono font-bold uppercase text-amber-400 mr-1.5">ESTADO:</span>
        <span className="text-slate-300">{buildProvincesAlert(state)}</span>
      </div>
    </div>
  );
}

export function JudicialAndProvincesView({ state, onDispatch }: JudicialAndProvincesViewProps) {
  const [activeTab, setActiveTab] = useState<JudicialProvincesTab>('judicial');
  const tabClass = (tab: JudicialProvincesTab) =>
    activeTab === tab
      ? 'bg-[#1a2b44] text-amber-100 border-b-2 border-amber-400'
      : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent';

  return (
    <Card>
      <CardHeader className="pb-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Justicia, Corte y Provincias</CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant={state.judicial.cautelaresBlockingDnuCount > 0 ? 'danger' : 'success'}>
              Cautelares DNU: {state.judicial.cautelaresBlockingDnuCount}
            </Badge>
            <Badge variant="default">
              Coparticipable: {state.treasury.coparticipableRevenuePctGdp}% PBI
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 rounded-sm bg-[#0b1018] border border-[#283447]">
          <button
            type="button"
            onClick={() => setActiveTab('judicial')}
            className={`py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${tabClass('judicial')}`}
          >
            Justicia y Corte
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('provinces')}
            className={`py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${tabClass('provinces')}`}
          >
            24 Provincias y Agenda
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'judicial' ? (
          <JudicialTabContent state={state} onDispatch={onDispatch} />
        ) : (
          <ProvincesTabContent state={state} onDispatch={onDispatch} />
        )}
      </CardContent>
    </Card>
  );
}
