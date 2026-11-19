import React, { useState } from 'react';
import { Handshake, Landmark, Scale, ShieldAlert, Users, X } from 'lucide-react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';
import { ViewportModalPortal } from '@/components/ui/ViewportModalPortal';

// Cumbre Federal de Gobernadores ("Pacto de Mayo / Rosca Federal")
// y Comision de Juicio Politico / Lealtad del Vicepresidente.

interface GovernorLeagueSpec {
  id: string;
  name: string;
  provincesLabel: string;
  senatorsControlled: number;
  deputiesControlled: number;
  demandTitle: string;
  fiscalCostLabel: string;
  loyaltyBoost: number;
}

const GOVERNOR_LEAGUES: GovernorLeagueSpec[] = [
  {
    id: 'LIGA_PATAGONICA',
    name: 'Liga de Gobernadores Patagónicos',
    provincesLabel: 'Neuquén, Río Negro, Chubut, Santa Cruz y Tierra del Fuego',
    senatorsControlled: 15,
    deputiesControlled: 24,
    demandTitle: 'Coparticipación de Regalías Hidrocarburíferas y Tarifas Zona Fría',
    fiscalCostLabel: '0,12% PBI en giros federales',
    loyaltyBoost: 14
  },
  {
    id: 'NORTE_GRANDE',
    name: 'Consejo Regional del Norte Grande (NOA + NEA)',
    provincesLabel: 'Tucumán, Salta, Jujuy, Santiago, Chaco, Misiones, Corrientes, Formosa, Catamarca y La Rioja',
    senatorsControlled: 30,
    deputiesControlled: 69,
    demandTitle: 'Fondo Compensador de Transporte Público y Obras Corredor Bioceánico',
    fiscalCostLabel: '0,18% PBI en ATN y Vialidad',
    loyaltyBoost: 16
  },
  {
    id: 'REGION_CENTRO',
    name: 'Junta Ejecutiva de la Región Centro',
    provincesLabel: 'Córdoba, Santa Fe y Entre Ríos',
    senatorsControlled: 9,
    deputiesControlled: 46,
    demandTitle: 'Transferencia de Cajas Previsionales No Transferidas (ANSES) y Baja de Retenciones',
    fiscalCostLabel: '0,15% PBI en compensación previsional',
    loyaltyBoost: 15
  },
  {
    id: 'LIGA_CUYO',
    name: 'Bloque Federal de Cuyo',
    provincesLabel: 'Mendoza, San Juan y San Luis',
    senatorsControlled: 9,
    deputiesControlled: 21,
    demandTitle: 'Cupo de Infraestructura Hídrica, Minería y Rutas Andinas',
    fiscalCostLabel: '0,08% PBI en obras estratégicas',
    loyaltyBoost: 12
  }
];

function computeImpeachmentRisk(state: SimulationState) {
  const approval = state.publicOpinion.managementApprovalPct;
  const inflation = state.inflation.realMonthlyIpcPct;
  const avgLoyalty =
    state.provinces.reduce((acc, p) => acc + p.governorLoyaltyToPresident, 0) /
    Math.max(1, state.provinces.length);

  const rawRisk = Math.round(
    Math.max(5, Math.min(96, 62 - approval * 0.65 + inflation * 3.2 - (avgLoyalty - 50) * 0.45))
  );
  const oppositionVotes = Math.round(Math.min(195, Math.max(85, 118 + (rawRisk - 35) * 0.95)));
  const vpLoyalty = Math.round(Math.max(15, Math.min(98, 78 - (50 - approval) * 0.7)));

  return { rawRisk, oppositionVotes, vpLoyalty, avgLoyalty: Math.round(avgLoyalty) };
}

function LeagueNegotiationCard({
  league,
  signed,
  onSignPact
}: {
  league: GovernorLeagueSpec;
  signed: boolean;
  onSignPact: (league: GovernorLeagueSpec) => void;
}) {
  return (
    <div className="p-3.5 rounded-sm bg-[#11080d] border border-white/15 flex flex-col justify-between space-y-2.5">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#f472b6]">
              {league.senatorsControlled} Senadores · {league.deputiesControlled} Diputados
            </span>
            <h4 className="text-sm font-serif font-bold text-slate-100">{league.name}</h4>
          </div>
          {signed ? (
            <span className="px-2 py-0.5 rounded-sm bg-emerald-950/60 border border-emerald-600 text-[9px] font-mono font-bold text-emerald-300">
              ✓ PACTO SELLADO
            </span>
          ) : null}
        </div>
        <p className="text-[11px] font-mono text-slate-400">{league.provincesLabel}</p>
        <div className="p-2 rounded-sm bg-[#090407] border border-white/10 text-xs text-[#F5EFE6]">
          Reclamo: <strong>{league.demandTitle}</strong>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono">
        <span className="text-slate-400">Costo: <strong className="text-rose-300">{league.fiscalCostLabel}</strong></span>
        <button
          type="button"
          disabled={signed}
          onClick={() => onSignPact(league)}
          className={`px-3 py-1.5 rounded-sm font-bold uppercase text-[10px] transition ${
            signed
              ? 'bg-[#162032] text-emerald-300 border border-emerald-800/60 cursor-default'
              : 'hoi-btn-gold'
          }`}
        >
          {signed ? `Lealtad +${league.loyaltyBoost} pts activa` : `Firmar Acuerdo (+${league.loyaltyBoost} Lealtad)`}
        </button>
      </div>
    </div>
  );
}

function resolveDangerConfig(isDanger: boolean) {
  if (isDanger) {
    return {
      badgeCls: 'bg-rose-950/60 text-rose-300 border-rose-600',
      badgeText: '⚠ PELIGRO DE ACUSACIÓN (2/3 ALCANZADOS)',
      barCls: 'bg-rose-600'
    };
  }
  return {
    badgeCls: 'bg-emerald-950/50 text-emerald-300 border-emerald-700',
    badgeText: '✓ ESCUDO LEGISLATIVO INTACTO (< 172 VOTOS)',
    barCls: 'bg-amber-500'
  };
}

function ImpeachmentAndViceShieldPanel({
  state,
  shielded,
  onActivateShield
}: {
  state: SimulationState;
  shielded: boolean;
  onActivateShield: () => void;
}) {
  const metrics = computeImpeachmentRisk(state);
  const effectiveVotes = shielded ? Math.max(70, metrics.oppositionVotes - 26) : metrics.oppositionVotes;
  const cfg = resolveDangerConfig(effectiveVotes >= 172);
  const barPct = Math.min(100, (effectiveVotes / 257) * 100);

  return (
    <div className="hoi-panel rounded-sm p-4 bg-[#090407] border border-[#EB3F7D]/55 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#f472b6] block">
            COMISIÓN DE JUICIO POLÍTICO Y SUCESIÓN CONSTITUCIONAL (ART. 53 CN)
          </span>
          <h4 className="text-sm font-serif font-bold uppercase text-[#F5EFE6]">
            Termómetro de Destitución, Escudo de 1/3 y Lealtad del Vicepresidente
          </h4>
        </div>
        <span className={`px-2.5 py-1 rounded-sm border text-[10px] font-mono font-bold ${cfg.badgeCls}`}>
          {cfg.badgeText}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-xs">
        <div className="p-3 rounded-sm bg-[#11080d] border border-white/10">
          <span className="text-[10px] text-slate-400 block">VOTOS ACUSADORES EN DIPUTADOS</span>
          <strong className="text-lg text-[#f472b6]">{effectiveVotes} / 172 (2/3)</strong>
        </div>
        <div className="p-3 rounded-sm bg-[#11080d] border border-white/10">
          <span className="text-[10px] text-slate-400 block">RELACIÓN CON VICEPRESIDENTE</span>
          <strong className="text-lg text-sky-300">{metrics.vpLoyalty}% Lealtad en Senado</strong>
        </div>
        <div className="p-3 rounded-sm bg-[#11080d] border border-white/10">
          <span className="text-[10px] text-slate-400 block">LEALTAD MEDIA GOBERNADORES</span>
          <strong className="text-lg text-emerald-300">{metrics.avgLoyalty}% Federal</strong>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Umbral constitucional de Juicio Político: 172 Diputados (66,9% del recinto)</span>
          <span className="text-[#EFE9DA]">{effectiveVotes} bancas opositoras</span>
        </div>
        <div className="w-full h-3.5 rounded-sm bg-[#0b0508] border border-white/15 relative overflow-hidden">
          <div style={{ width: `${barPct}%` }} className={`h-full transition-all ${cfg.barCls}`} />
          <div
            style={{ left: '66.9%' }}
            className="absolute top-0 bottom-0 w-0.5 bg-rose-300"
            title="172 votos (2/3)"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="text-[11px] font-mono text-slate-400">
          Si la oposición reúne 172 manos en Diputados, habilita la suspensión y juzgamiento en el Senado.
        </span>
        <button
          type="button"
          disabled={shielded}
          onClick={onActivateShield}
          className="px-3.5 py-1.5 rounded-sm bg-[#1c0e16] hover:bg-[#1f2e47] border border-[#EB3F7D] text-xs font-mono font-bold text-[#EFE9DA] disabled:opacity-50"
        >
          {shielded ? '✓ Blindaje de Comisión Activado (-26 votos)' : 'Blindar Comisión de Juicio Político'}
        </button>
      </div>
    </div>
  );
}

export function FederalSummitAndCrisisModal({
  open,
  state,
  onDispatch,
  onClose
}: {
  open: boolean;
  state: SimulationState;
  onDispatch?: (action: PolicyAction) => void;
  onClose: () => void;
}) {
  const [signedLeagues, setSignedLeagues] = useState<Record<string, boolean>>({});
  const [shielded, setShielded] = useState(false);

  if (!open) return null;

  const handleSignLeague = (league: GovernorLeagueSpec) => {
    playUiSound('stamp');
    setSignedLeagues((prev) => ({ ...prev, [league.id]: true }));
    const firstProv = state.provinces[0];
    if (firstProv && onDispatch) {
      onDispatch({ type: 'SEND_ATN_TO_PROVINCE', provinceId: firstProv.id, amountPctGdp: 0.08 });
    }
  };

  return (
    <ViewportModalPortal>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto my-auto hoi-panel rounded-lg p-4 sm:p-6 space-y-4 border border-[#EB3F7D]/55 shadow-2xl">
        <div className="hoi-header-steel p-3.5 rounded-sm flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f472b6] flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#EB3F7D]" />
              CONSEJO FEDERAL DE GOBERNADORES Y SALA DE SITUACIÓN INSTITUCIONAL
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-extrabold uppercase tracking-wide text-[#F5EFE6] mt-0.5">
              Cumbre del Pacto Federal y Blindaje contra Juicio Político
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {GOVERNOR_LEAGUES.map((league) => (
            <LeagueNegotiationCard
              key={league.id}
              league={league}
              signed={Boolean(signedLeagues[league.id])}
              onSignPact={handleSignLeague}
            />
          ))}
        </div>

        <ImpeachmentAndViceShieldPanel
          state={state}
          shielded={shielded}
          onActivateShield={() => {
            playUiSound('stamp');
            setShielded(true);
          }}
        />

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span className="inline-flex items-center gap-1.5">
            <Handshake className="w-3.5 h-3.5 text-[#f472b6]" />
            Los pactos con ligas regionales aseguran quórum en el Senado y desactivan rebeliones provinciales.
          </span>
          <span className="inline-flex items-center gap-1 text-sky-300">
            <Scale className="w-3.5 h-3.5" />
            Control Constitucional Activo
          </span>
        </div>
        </div>
      </div>
    </ViewportModalPortal>
  );
}
