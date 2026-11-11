import React from 'react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Comodoro Py, la Corte Suprema de 5 miembros y la guerra por la Coparticipacion Federal
// con los 24 Gobernadores (con sus propias reglas de reeleccion, Boleta Unica y cuasimonedas).

interface JudicialAndProvincesViewProps {
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}

function JudiciaryAndLawfareCard({ state, onDispatch }: JudicialAndProvincesViewProps) {
  const { judicial } = state;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Corte Suprema (5 Jueces) y Expedientes en Comodoro Py</CardTitle>
          <Badge variant={judicial.cautelaresBlockingDnuCount > 0 ? 'danger' : 'success'}>
            Cautelares contra DNU/Tarifas: {judicial.cautelaresBlockingDnuCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="space-y-1.5 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
          <div className="font-semibold text-sky-400">Sillones de la Corte Suprema (Regla de 3 votos y Tope 75 años)</div>
          {judicial.supremeCourt.map((j) => (
            <div key={j.id} className="flex items-center justify-between border-b border-slate-800/60 pb-1">
              <div>
                <span className="font-medium text-slate-200">{j.name}</span>
                <span className="text-[11px] text-slate-400 block">
                  {j.age} años · Doctrina {j.doctrine} {j.requiresSenateReconfirmationSoon ? '· [Requiere Pliego Senado Art. 99]' : ''}
                </span>
              </div>
              <Badge variant={j.alignmentWithExecutive > 55 ? 'success' : 'warning'}>
                Afinidad {j.alignmentWithExecutive}%
              </Badge>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-amber-400">Sorteo y Flujo de Causas en Comodoro Py</span>
            <span className="text-[11px] text-slate-400">Rastro Operadores/SIDE: {judicial.judicialInterferenceTraceIndex}%</span>
          </div>
          {judicial.activeCases.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded border border-slate-800 bg-slate-950 px-2.5 py-2">
              <div>
                <div className="font-medium text-slate-200">{c.title}</div>
                <div className="text-[11px] text-slate-400">
                  Target: {c.accusedFaction} · Juez Fed. #{c.judgeId} · Estado: <strong className="text-amber-300">{c.stage}</strong>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDispatch({ type: 'OPERATE_COMODORO_PY_CASE', caseId: c.id, operation: 'FREEZE' })}
                >
                  Dormir (Falta Mérito)
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDispatch({ type: 'OPERATE_COMODORO_PY_CASE', caseId: c.id, operation: 'PUSH' })}
                >
                  Acelerar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProvincesAndOpinionCard({ state, onDispatch }: JudicialAndProvincesViewProps) {
  const { provinces, publicOpinion, treasury } = state;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>24 Jurisdicciones, Coparticipación y 7 Segmentos de Opinión</CardTitle>
          <Badge variant="default">
            Coparticipable: {treasury.coparticipableRevenuePctGdp}% PBI · Exclusivo Nación: {treasury.nonCoparticipableRevenuePctGdp}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 space-y-1">
          <div className="font-semibold text-sky-400">Agenda-Setting Semanal (Medios + Streaming)</div>
          {publicOpinion.agendaSlots.map((topic, idx) => (
            <div key={idx} className="text-slate-300">
              #{idx + 1}: {topic}
            </div>
          ))}
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {provinces.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/70 px-2.5 py-1.5">
              <div>
                <div className="font-medium text-slate-200">
                  {p.name} ({p.nationalDeputiesCount} Dip.) {!p.reelectionAllowed ? '· [Sin Reelección]' : ''}
                </div>
                <div className="text-[11px] text-slate-400">
                  Dep. Copart: {p.coparticipationDependencyPct}% · Fiscal: {p.fiscalBalancePct}% · Fiscalización: {p.apparatusFiscalizacionPct}%
                  {p.quasiCurrencyIssued ? ' · [CUASIMONEDA ACTIVA]' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.governorLoyaltyToPresident > 55 ? 'success' : 'warning'}>
                  Lealtad {p.governorLoyaltyToPresident}%
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onDispatch({ type: 'SEND_ATN_TO_PROVINCE', provinceId: p.id, amountPctGdp: 0.08 })}
                >
                  Girar ATN
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function JudicialAndProvincesView({ state, onDispatch }: JudicialAndProvincesViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <JudiciaryAndLawfareCard state={state} onDispatch={onDispatch} />
      <ProvincesAndOpinionCard state={state} onDispatch={onDispatch} />
    </div>
  );
}

