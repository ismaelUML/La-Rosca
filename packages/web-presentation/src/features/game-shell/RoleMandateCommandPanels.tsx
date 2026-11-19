import React from 'react';
import {
  getOrInitGovernorMandate,
  getOrInitLegislatorMandate,
  type GameSetupConfiguration,
  type PolicyAction,
  type RoleActionId,
  type SimulationState
} from '@argentina-sim/domain';
import type { InGameSidebarSection } from './GameSidebarLayout.js';

// Tableros de mando especificos para cuando el jugador no es Presidente:
// Gobernador maneja su provincia (IIBB, obras, policia, intendentes, cuasimonedas y pelea por ATN)
// y Diputado/Senador opera desde su banca (proyectos, comisiones, pliegos/interpelaciones y recinto).

interface RoleActionCardSpec {
  id: RoleActionId;
  title: string;
  subtitle: string;
  effectBadge: string;
  toneClass: string;
}

const GOVERNOR_ACTIONS: RoleActionCardSpec[] = [
  {
    id: 'LICITAR_OBRA_PROVINCIAL',
    title: 'Licitar Rutas, Escuelas y Hospitales',
    subtitle: 'Inversión directa con caja provincial para sostener empleo y gestión.',
    effectBadge: '-$75B · +11% Obra · +3,2% Aprob.',
    toneClass: 'border-emerald-700/60 hover:border-emerald-500'
  },
  {
    id: 'EXIGIR_COPARTICIPACION_Y_ATN',
    title: 'Plantar Bandera por Coparticipación y ATN',
    subtitle: 'Reclamo frontal a Casa Rosada junto a la Liga de Gobernadores.',
    effectBadge: '+$110B Caja · +6 Proyección · -10 Lealtad',
    toneClass: 'border-amber-700/60 hover:border-amber-500'
  },
  {
    id: 'BAJAR_IIBB_PROVINCIAL',
    title: 'Reducir Alícuota de Ingresos Brutos (-0,5%)',
    subtitle: 'Alivio fiscal al comercio, industria y agro de la provincia.',
    effectBadge: '-$38B Caja · +0,18% PBI · +2,4% Aprob.',
    toneClass: 'border-sky-700/60 hover:border-sky-500'
  },
  {
    id: 'SUBIR_IIBB_PROVINCIAL',
    title: 'Subir Ingresos Brutos (+0,5%)',
    subtitle: 'Recaudación rápida para blindar el tesoro local a costa del humor social.',
    effectBadge: '+$65B Caja · -2,8% Aprobación',
    toneClass: 'border-slate-700 hover:border-slate-500'
  },
  {
    id: 'BLINDAR_SEGURIDAD_PROVINCIAL',
    title: 'Reforzar Comando y Patrullaje Policial',
    subtitle: 'Compra de patrulleros, chalecos y anillos digitales en accesos.',
    effectBadge: '-$55B · +10 Seguridad · +2,5% Aprob.',
    toneClass: 'border-indigo-700/60 hover:border-indigo-500'
  },
  {
    id: 'PACTO_INTENDENTES_Y_LEGISLATURA',
    title: 'Acuerdo con Intendentes y Legislatura Local',
    subtitle: 'Giro de fondos municipales para asegurar mayoría en la Legislatura.',
    effectBadge: '-$45B · +9% Legislatura · +1,5% Aprob.',
    toneClass: 'border-purple-700/60 hover:border-purple-500'
  },
  {
    id: 'CERRAR_PARITARIA_DOCENTE_POLICIAL',
    title: 'Homologar Cláusula Gatillo Docente y Policial',
    subtitle: 'Desactiva paros de escuelas, hospitales y acuartelamientos.',
    effectBadge: '-$60B · Levanta Conflicto · +3,8% Aprob.',
    toneClass: 'border-teal-700/60 hover:border-teal-500'
  },
  {
    id: 'EMITIR_CUASIMONEDA_PROVINCIAL',
    title: 'Emitir Bono / Cuasimoneda Provincial',
    subtitle: 'Liquidez de emergencia para pagar sueldos sin depender de Nación.',
    effectBadge: '+$240B Caja · Cuasimoneda Activa · -3,5% Aprob.',
    toneClass: 'border-rose-800/70 hover:border-rose-500'
  }
];

function KpiStatBox({
  label,
  value,
  subtext,
  accentClass
}: {
  label: string;
  value: string;
  subtext: string;
  accentClass: string;
}) {
  return (
    <div className="rounded-sm bg-[#0b0508] border border-[#243044] p-3.5">
      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className={`text-xl font-mono font-extrabold mt-1 ${accentClass}`}>{value}</div>
      <div className="text-[11px] font-mono text-slate-400 mt-1">{subtext}</div>
    </div>
  );
}

function RoleActionButtonsGrid({
  actions,
  onExecute
}: {
  actions: RoleActionCardSpec[];
  onExecute: (id: RoleActionId) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {actions.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onExecute(item.id)}
          className={`text-left rounded-sm bg-[#0b0508] hover:bg-[#170c12] border p-3.5 transition group ${item.toneClass}`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-extrabold text-white group-hover:text-[#EFE9DA]">
              {item.title}
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-[#06080d] border border-white/15 text-[10px] font-mono font-bold text-[#EB3F7D] shrink-0">
              {item.effectBadge}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.subtitle}</p>
        </button>
      ))}
    </div>
  );
}

export function GovernorCommandPanel({
  setup,
  state,
  onDispatch
}: {
  setup: GameSetupConfiguration;
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
}) {
  const gov = getOrInitGovernorMandate(state);
  const prov = state.provinces.find((p) => p.id === gov.provinceId) ?? state.provinces[0]!;

  return (
    <div className="rounded-sm bg-[#11080d] border border-white/15 border-t-2 border-t-[#8a6d33] p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#243044] pb-3.5">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D]">
            CASA DE GOBIERNO PROVINCIAL · {prov.name.toUpperCase()} ({prov.region})
          </div>
          <h2 className="text-lg font-serif font-bold text-white mt-0.5">
            Comando Ejecutivo de Gobernación · {setup.characterName}
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Motor productivo: <strong className="text-slate-200">{prov.keyEconomicDriver}</strong> · Bancas nacionales del distrito: <strong className="text-sky-300">{prov.nationalDeputiesCount} Diputados / 3 Senadores</strong>
          </p>
        </div>

        {gov.activeTeacherOrPoliceConflict ? (
          <span className="px-3 py-1.5 rounded-sm bg-rose-950/80 border border-rose-700 text-xs font-mono font-bold text-rose-200">
            Conflicto gremial docente/policial activo
          </span>
        ) : (
          <span className="px-3 py-1.5 rounded-sm bg-emerald-950/60 border border-emerald-800 text-xs font-mono font-bold text-emerald-300">
            Paritarias provinciales en orden
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiStatBox
          label="Aprobación Provincial"
          value={`${gov.provincialApprovalPct}%`}
          subtext={`Lealtad con Rosada: ${prov.governorLoyaltyToPresident}%`}
          accentClass="text-emerald-400"
        />
        <KpiStatBox
          label="Tesoro Provincial"
          value={`$${gov.provincialTreasuryArsBillion}B`}
          subtext={prov.quasiCurrencyIssued ? 'Cuasimoneda en circulación' : 'Moneda nacional (ARS)'}
          accentClass="text-[#f472b6]"
        />
        <KpiStatBox
          label="Ingresos Brutos (IIBB)"
          value={`${gov.iibbRatePct}%`}
          subtext={`Dependencia Copart.: ${prov.coparticipationDependencyPct}%`}
          accentClass="text-sky-400"
        />
        <KpiStatBox
          label="Obra Pública Local"
          value={`${gov.publicWorksExecutionPct}%`}
          subtext={`Resultado fiscal: ${prov.fiscalBalancePct}%`}
          accentClass="text-orange-400"
        />
        <KpiStatBox
          label="Seguridad y Policía"
          value={`${gov.securityAndPoliceIndex}/100`}
          subtext="Comando urbano y rural"
          accentClass="text-indigo-400"
        />
        <KpiStatBox
          label="Legislatura / Proyección"
          value={`${gov.localLegislatureSupportPct}%`}
          subtext={`Proyección nacional: ${gov.nationalProjectionIndex}/100`}
          accentClass="text-purple-400"
        />
      </div>

      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2.5">
          Decisiones de Gestión Provincial
        </h3>
        <RoleActionButtonsGrid
          actions={GOVERNOR_ACTIONS}
          onExecute={(actionId) => onDispatch({ type: 'EXECUTE_ROLE_ACTION', actionId })}
        />
      </div>
    </div>
  );
}

function buildLegislatorActions(isSenate: boolean, provinceId: string): RoleActionCardSpec[] {
  return [
    {
      id: 'PRESENTAR_PROYECTO_PROPIO',
      title: 'Presentar Proyecto de Ley Propio',
      subtitle: 'Ingresa iniciativa parlamentaria por Mesa de Entradas para forzar tratamiento.',
      effectBadge: '+1 Proyecto · +5 Muñeca · +2,5% Distrito',
      toneClass: 'border-emerald-700/60 hover:border-emerald-500'
    },
    {
      id: 'DISCURSO_ENCENDIDO_RECINTO',
      title: 'Cuestión de Privilegio y Discurso en Recinto',
      subtitle: 'Intervención de alto impacto en sesión para marcar agenda nacional.',
      effectBadge: '+9 Impacto Recinto · +1,5% Imagen',
      toneClass: 'border-amber-700/60 hover:border-amber-500'
    },
    {
      id: 'ROSCA_EN_COMISION',
      title: 'Destrabar Dictamen de Mayoría en Comisión',
      subtitle: 'Negocia firmas con bloques dialoguistas para controlar el temario.',
      effectBadge: '+1 Comisión · +7 Muñeca · +4 Relación Bloques',
      toneClass: 'border-sky-700/60 hover:border-sky-500'
    },
    {
      id: 'INTERPELAR_MINISTRO_O_PLIEGO',
      title: isSenate
        ? 'Dictaminar Pliegos Judiciales y Embajadores'
        : 'Citar a Interpelación al Jefe de Gabinete (Art. 71)',
      subtitle: isSenate
        ? 'Usa la llave constitucional del Senado sobre conjueces, fiscales y pliegos.'
        : 'Exige explicaciones presenciales al Ejecutivo en el recinto de Diputados.',
      effectBadge: isSenate ? '+1 Pliego · +8 Peso Federal' : '+1 Interpelación · +8 Peso Político',
      toneClass: 'border-purple-700/60 hover:border-purple-500'
    },
    {
      id: 'DEFENDER_PARTIDAS_PROVINCIALES',
      title: `Condicionar Quórum a Obras para ${provinceId}`,
      subtitle: 'Ata el voto de tu banca a transferencias e infraestructura para tu provincia.',
      effectBadge: '+5,5% Respaldo Local · +0,5% Caja Prov.',
      toneClass: 'border-teal-700/60 hover:border-teal-500'
    },
    {
      id: 'ROMPER_O_ALINEAR_BLOQUE',
      title: 'Jugar Voto Propio / Negociar Conducción de Bloque',
      subtitle: 'Tensa la cuerda con el jefe de bancada para cobrar peso propio en el Congreso.',
      effectBadge: '+6 Muñeca · +5 Recinto · Ajusta Disciplina',
      toneClass: 'border-rose-700/60 hover:border-rose-500'
    }
  ];
}

export function LegislatorCommandPanel({
  setup,
  state,
  onDispatch,
  onNavigate
}: {
  setup: GameSetupConfiguration;
  state: SimulationState;
  onDispatch: (action: PolicyAction) => void;
  onNavigate: (sec: InGameSidebarSection) => void;
}) {
  const leg = getOrInitLegislatorMandate(state);
  const isSenate = leg.chamber === 'SENADO';
  const actions = buildLegislatorActions(isSenate, leg.provinceId);

  return (
    <div className="rounded-sm bg-[#11080d] border border-white/15 border-t-2 border-t-[#8a6d33] p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#243044] pb-3.5">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400">
            {isSenate
              ? 'HONORABLE SENADO DE LA NACIÓN · BANCA FEDERAL (1/72)'
              : 'HONORABLE CÁMARA DE DIPUTADOS · BANCA NACIONAL (1/257)'}
          </div>
          <h2 className="text-lg font-serif font-bold text-white mt-0.5">
            Despacho Parlamentario · {setup.characterName} ({setup.party.sigla} · {leg.provinceId})
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Comisión cabecera: <strong className="text-slate-200">{leg.activeCommitteeName}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('CAMARAS')}
          className="px-3.5 py-2 rounded-sm bg-[#EB3F7D] hover:bg-[#f45b93] border border-[#f472b6]/60 text-xs font-mono font-extrabold uppercase tracking-wider text-slate-950 transition"
        >
          Ir al Hemiciclo y Votar Leyes →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiStatBox
          label="Peso Parlamentario"
          value={`${leg.parliamentaryCloutIndex}/100`}
          subtext="Capacidad de poroteo en el recinto"
          accentClass="text-[#f472b6]"
        />
        <KpiStatBox
          label="Impacto en Recinto"
          value={`${leg.floorSpeechImpactIndex}/100`}
          subtext="Debates y exposición en medios"
          accentClass="text-sky-400"
        />
        <KpiStatBox
          label="Proyectos Propios"
          value={`${leg.authoredBillsApproved} / ${leg.authoredBillsSubmitted}`}
          subtext="Con dictamen / Presentados"
          accentClass="text-emerald-400"
        />
        <KpiStatBox
          label="Comisiones Activas"
          value={`${leg.committeeControlCount} / 6`}
          subtext={leg.activeCommitteeName}
          accentClass="text-purple-400"
        />
        <KpiStatBox
          label={`Respaldo en ${leg.provinceId}`}
          value={`${leg.territorialBackingPct}%`}
          subtext="Base electoral en tu provincia"
          accentClass="text-orange-400"
        />
        <KpiStatBox
          label={isSenate ? 'Pliegos / Disciplina' : 'Interpelaciones / Bloque'}
          value={`${leg.pliegosOrInterpelacionesCount} · ${leg.blocDisciplineAlignmentPct}%`}
          subtext="Acciones de control y orgánica"
          accentClass="text-indigo-400"
        />
      </div>

      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2.5">
          Acciones Legislativas desde tu Banca
        </h3>
        <RoleActionButtonsGrid
          actions={actions}
          onExecute={(actionId) => onDispatch({ type: 'EXECUTE_ROLE_ACTION', actionId })}
        />
      </div>
    </div>
  );
}
