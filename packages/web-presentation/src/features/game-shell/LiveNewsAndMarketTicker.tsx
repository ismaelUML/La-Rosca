import React, { useEffect, useState } from 'react';
import { Activity, Radio } from 'lucide-react';
import type { CampaignSimulationState, SimulationState } from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';
import type { MediaOutletLogoId } from '../party-setup/officialLogosCatalog.js';
import { OfficialInstitutionLogo, OfficialMediaLogo } from '../party-setup/OfficialLogoBadge.js';

// Zocalo Dinamico de Television Argentina ("Placa Roja / Ultimo Momento")
// y Cinta Financiera en Vivo (Bloomberg / Ambito / BCRA) acoplado al pie de pantalla.

const TV_ROTATION_CHANNELS: MediaOutletLogoId[] = [
  'CRONICA_TV',
  'TN',
  'LN_MAS',
  'C5N',
  'A24',
  'CANAL_26',
  'TV_PUBLICA'
];

function resolveActiveTvChannel(idx: number, redAlert: boolean): MediaOutletLogoId {
  if (redAlert) return 'CRONICA_TV';
  return TV_ROTATION_CHANNELS[idx % TV_ROTATION_CHANNELS.length] ?? 'TN';
}

function TickerSourceLogos({
  isTvMode,
  channel
}: {
  isTvMode: boolean;
  channel: MediaOutletLogoId;
}) {
  if (isTvMode) {
    return <OfficialMediaLogo media={channel} heightPx={20} />;
  }
  return (
    <span className="hidden sm:inline-flex items-center gap-1 shrink-0">
      <OfficialInstitutionLogo institution="BCRA" heightPx={20} />
      <OfficialMediaLogo media="BLOOMBERG" heightPx={18} />
      <OfficialMediaLogo media="AMBITO" heightPx={18} />
    </span>
  );
}

function buildGovDynamicPool(state: SimulationState): string[] {
  const ofi = state.centralBank.officialDollarArs;
  const ccl = state.centralBank.cclDollarArs;
  const brecha = state.centralBank.exchangeBrechaPct.toFixed(0);
  const ipc = state.inflation.realMonthlyIpcPct;
  const embi = state.countryRiskEmbiPb;
  const res = state.centralBank.netLiquidReservesBillionUsd;
  const ap = state.publicOpinion.managementApprovalPct;
  const cov = state.energy.userTariffCoveragePct;
  const month = state.turnMonth;

  return [
    `CASA ROSADA · APROBACIÓN DE GESTIÓN EN ${ap}% · RESERVAS NETAS USD ${res}B`,
    `MERCADO CAMBIARIO · DÓLAR OFICIAL $${ofi} · CCL $${ccl} (BRECHA ${brecha}%)`,
    `ENERGÍA Y VACA MUERTA · COBERTURA TARIFARIA AL ${cov}% · RIESGO PAÍS ${embi} PB`,
    `LICITACIÓN DEL TESORO · EL EQUIPO ECONÓMICO ABSORBE PESOS EN EL MES ${month} DE GESTIÓN`,
    `BCRA EN VIVO · MESAS DE DINERO OPERAN CON DÓLAR A3500 EN $${ofi} Y TASA REAL POSITIVA`,
    `PALACIO DE HACIENDA · RECAUDACIÓN REAL SIGUE LA REGLA DE EQUILIBRIO PRIMARIO SIN EMISIÓN`,
    `PARITARIAS CALIENTES · GREMIOS DEL TRANSPORTE Y INDUSTRIA ANALIZAN IPC DEL ${ipc}%`,
    `CONGRESO NACIONAL · JEFES DE BLOQUE NEGOCIAN QUÓRUM PARA REFORMAS Y PRESUPUESTO`,
    `SENADO EN COMISIÓN · GOBERNADORES DEL INTERIOR EXIGEN COPARTICIPACIÓN DE IMPUESTOS`,
    `INDEC · CANASTA BÁSICA Y PRECIOS REGULADOS PRESIONAN EL HUMOR EN EL GRAN BUENOS AIRES`,
    `CITY PORTEÑA · BONOS SOBERANOS REACCIONAN AL EMBI+ DE ${embi} PUNTOS BÁSICOS`,
    `HIDROVÍA Y PUERTOS · BUQUES GRANEROS EN ROSARIO ACELERAN LIQUIDACIÓN DE COSECHA`,
    `LITIO EN EL NOA · NUEVAS SOLICITUDES DE ESTABILIDAD FISCAL BAJO EL PARAGUAS RIGI`,
    `GASODUCTOS DEL SUR · REFUERZAN COMPRESIÓN EN NEUQUÉN PARA SUMAR SALDO EXPORTADOR`,
    `COMODORO PY · TRIBUNALES FEDERALES REVISAN CAUTELARES SOBRE DECRETOS DEL EJECUTIVO`,
    `CUENTAS PÚBLICAS · TESORERÍA DIFUNDE EJECUCIÓN MENSUAL CON SUPERÁVIT OPERATIVO`,
    `BANCOS Y CRÉDITO · CONSULTAN POR LÍNEAS HIPOTECARIAS Y TASAS PARA PYMES`,
    `CONSUMO MASIVO · SUPERMERCADOS REPORTAN PROMOCIONES FUERTES ANTE CAÍDA DE DEMANDA`,
    `FONDO MONETARIO · MESA TÉCNICA EVALÚA CUMPLIMIENTO DE RESERVAS NETAS (USD ${res}B)`,
    `MERCOSUR Y COMERCIO · EXPORTADORES AUTOMOTRICES RECLAMAN BAJA DE CARGAS INTERNAS`,
    `SALUD Y UNIVERSIDADES · RECTORES Y HOSPITALES NACIONALES DEMANDAN ACTUALIZACIÓN DE PARTIDAS`,
    `TRANSPORTE AMBA · DEBATE POR BRECHA DE SUBSIDIOS ENTRE EL CONURBANO Y EL INTERIOR`,
    `WALL STREET · ANALISTAS PROYECTAN FLUJO DE DIVISAS ENERGETICAS CON RIESGO PAÍS EN ${embi}`,
    `ENCUESTAS DE OPINIÓN · IMAGEN DE GESTIÓN MARCA ${ap}% TRAS LOS ANUNCIOS DEL MES ${month}`,
    `SEGURIDAD FEDERAL · DESPLIEGUE DE FUERZAS CONJUNTAS EN ACCESOS A ROSARIO Y GBA`,
    `ECONOMÍA DIGITAL · EXPORTADORES DE SOFTWARE RECLAMAN LIBRE GIRO DE HONORARIOS`,
    `BOLETÍN OFICIAL · PUBLICAN REGLAMENTACIONES CLAVE DE DESREGULACIÓN Y ADUANAS`
  ];
}

function buildGovBreakingHeadlines(state: SimulationState): string[] {
  const alerts: string[] = [];
  if (state.labor.activeNationalStrike) {
    alerts.push('ÚLTIMO MOMENTO · PARO NACIONAL DE LA CGT CON CORTES EN ACCESOS A CABA Y TRANSPORTE');
  }
  if (state.inflation.realMonthlyIpcPct >= 5.5) {
    alerts.push(
      `ALERTA INFLACIONARIA · EL IPC MENSUAL MARCA ${state.inflation.realMonthlyIpcPct}% Y RECALIENTA PARITARIAS`
    );
  }
  if (state.countryRiskEmbiPb >= 1200) {
    alerts.push(
      `TENSIÓN EN LA CITY · EL RIESGO PAÍS ESCALA A ${state.countryRiskEmbiPb} PUNTOS BÁSICOS Y PRESIONA AL CCL`
    );
  }
  return [...alerts, ...buildGovDynamicPool(state)];
}

function buildCampaignBreakingHeadlines(campaign: CampaignSimulationState): string[] {
  const cand = campaign.candidateName.toUpperCase();
  const sigla = campaign.partySigla.toUpperCase();
  const voto = campaign.votingIntention.intencionVotoGeneral.toFixed(1);
  const piso = campaign.votingIntention.piso.toFixed(1);
  const techo = campaign.votingIntention.techo.toFixed(1);
  const caja = campaign.budgetArgentums.toFixed(1);
  const pos = campaign.image.imagenPositiva.toFixed(1);
  const neg = campaign.image.imagenNegativa.toFixed(1);
  const apoyo = campaign.attributes.apoyoPartidario.toFixed(0);
  const rel = campaign.attributes.relevancia.toFixed(0);
  const intel = campaign.attributes.inteligenciaPercibida.toFixed(0);
  const prov = campaign.targetProvinceId.replace(/_/g, ' ');
  const fecha = campaign.stage.formattedDate.toUpperCase();

  return [
    `CAMPAÑA 2027 · ${fecha} · ${cand} (${sigla}) MIDE ${voto}% EN ENCUESTAS NACIONALES`,
    `INTERNA Y TERRITORIO · PISO ELECTORAL EN ${piso}% Y TECHO EN ${techo}% · CAJA $${caja}M`,
    `IMAGEN PÚBLICA · POSITIVA ${pos}% VS NEGATIVA ${neg}% · APOYO PARTIDARIO ${apoyo}/100`,
    `PRIME TIME TV · CRECE LA EXPECTATIVA POR LOS CRUCES DE ${cand} RUMBO A LAS URNAS`,
    `ENCUESTADORAS DE LA CITY · EL VOTO INDECISO EN ${prov} DEFINE LA ELECCIÓN PAREJA`,
    `RELEVANCIA MEDIÁTICA · ${cand} ALCANZA ${rel} PUNTOS DE INSTALACIÓN EN REDES Y CANALES`,
    `FISCALIZACIÓN NACIONAL · COMANDOS DE ${sigla} ACELERAN ARMADO DE MESAS Y BOLETAS`,
    `CÍRCULO ROJO · EMPRESARIOS PIDEN DEFINICIONES A ${cand} SOBRE DÓLAR, CEPO Y RIGI`,
    `ESTRATEGIAS DIGITALES · GUERRA DE CLIPS EN TIKTOK Y STREAMERS EN TRAMO DECISIVO`,
    `CÁMARA NACIONAL ELECTORAL · AVANZA EL CRONOGRAMA HACIA LA BOLETA ÚNICA DE PAPEL`,
    `PERCEPCIÓN TÉCNICA · LOS EQUIPO DE ${sigla} SUMAN ${intel}/100 EN INTELIGENCIA PERCIBIDA`,
    `ROSCA CON GOBERNADORES · MANDATARIOS DEL INTERIOR MIDEN APOYO SEGÚN COPARTICIPACIÓN`,
    `ESTUDIO EN VIVO · LOS CANALES DE NOTICIAS PREPARAN COBERTURA ESPECIAL DE DEBATES`,
    `TERMÓMETRO SOCIAL · SALARIOS, SEGURIDAD E INFLACIÓN DOMINAN LOS FOCUS GROUPS DE ${fecha}`,
    `COMANDO DE CAMPAÑA · ${sigla} EVALÚA NUEVAS RECORRIDAS Y PAUTA EN EL INTERIOR PRODUCTIVO`,
    `ALIANZAS Y FÓRMULA · RUMORES DE ACUERDOS PARLAMENTARIOS AGITAN LA PREVIA ELECTORAL`,
    `CONURBANO BONAERENSE · INTENDENTES REFUERZAN TERRITORIO CON CAMINATAS Y ACTOS`,
    `CORREDOR CENTRO · CÓRDOBA Y SANTA FE SE CONSOLIDAN COMO BASTIONES DISPUTADOS POR ${sigla}`,
    `OPINIÓN JUVENIL · SUB-30 DEMANDAN EMPLEO FORMAL, ESTABILIDAD Y DÓLAR SIN TRABAS`,
    `CIERRE DE PADRÓN · APODERADOS DE ${sigla} VERIFICAN PADRONES EN LOS 24 DISTRITOS`,
    `CLIMA DE MERCADOS · BONOS ARGENTINOS SIGUEN DE CERCA EL ${voto}% PROYECTADO PARA ${sigla}`,
    `RADIOS FEDERALES · ${cand} REFUERZA PRESENCIA EN EMISORAS DEL NORTE Y PATAGONIA`,
    `MESAS DE CAMPAÑA · JEFES DE PRENSA REPORTAN ALTA POLARIZACIÓN CON TECHO DE ${techo}%`,
    `CINTURÓN INDUSTRIAL · PYMES RECLAMAN BAJA TRIBUTARIA Y CRÉDITO A TASA ESTABLE`,
    `CAMPAÑA PRESIDENCIAL · TODO LISTO PARA EL PRÓXIMO ROUND TELEVISADO EN CADENA`,
    `SÍNTESIS ELECTORAL · ${cand} SOSTIENE PISO DE ${piso}% MIENTRAS DISPUTA EL VOTO BLANDO`
  ];
}

function isRedAlertActive(govState?: SimulationState): boolean {
  if (!govState) return false;
  return (
    govState.labor.activeNationalStrike ||
    govState.inflation.realMonthlyIpcPct >= 6.0 ||
    govState.countryRiskEmbiPb >= 1350
  );
}

function MarketQuotesStrip({ govState }: { govState?: SimulationState }) {
  const ofi = govState ? govState.centralBank.officialDollarArs : 1380;
  const ccl = govState ? govState.centralBank.cclDollarArs : 1590;
  const embi = govState ? govState.countryRiskEmbiPb : 695;
  const res = govState ? govState.centralBank.netLiquidReservesBillionUsd : 5.4;

  return (
    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
      <span className="text-slate-300">
        OFICIAL A3500: <strong className="text-white">${ofi}</strong>
      </span>
      <span className="text-slate-300">
        DÓLAR CCL: <strong className="text-amber-300">${ccl}</strong>
      </span>
      <span className="text-slate-300">
        EMBI+ JPM: <strong className="text-rose-300">{embi} pb</strong>
      </span>
      <span className="text-slate-300">
        RES. NETAS: <strong className="text-emerald-400">USD {res}B</strong>
      </span>
      <span className="text-slate-300 hidden md:inline">
        SOJA ROSARIO: <strong className="text-emerald-300">USD 418/tn</strong>
      </span>
      <span className="text-slate-300 hidden lg:inline">
        BRENT VACA MUERTA: <strong className="text-sky-300">USD 76,4/bbl</strong>
      </span>
    </div>
  );
}

function resolveTickerBarTheme(redAlert: boolean, mode: 'TV' | 'MARKET') {
  if (mode === 'MARKET') {
    return {
      barCls: 'bg-[#070b12]/95 border-t border-[#263142]',
      badgeCls: 'bg-emerald-900/80 text-emerald-200 border-emerald-600',
      badgeText: 'PIZARRA BCRA / BYMA'
    };
  }
  if (redAlert) {
    return {
      barCls: 'bg-gradient-to-r from-[#6b0505] via-[#8b0000] to-[#4c0505] border-t border-amber-400/70',
      badgeCls: 'bg-white text-rose-900 border-white',
      badgeText: 'PLACA ROJA · URGENTE'
    };
  }
  return {
    barCls: 'bg-[#090e17]/95 border-t border-[#8a6d33]/70',
    badgeCls: 'bg-amber-500/20 text-amber-200 border-[#b89342]',
    badgeText: 'EN VIVO · EL TICKER DE LA ROSCA'
  };
}

function resolveHeadlinesList(
  govState?: SimulationState,
  campaignState?: CampaignSimulationState
): string[] {
  if (govState) return buildGovBreakingHeadlines(govState);
  if (campaignState) return buildCampaignBreakingHeadlines(campaignState);
  return ['TRANSMISIÓN OFICIAL EN VIVO'];
}

export function LiveNewsAndMarketTicker({
  govState,
  campaignState
}: {
  govState?: SimulationState;
  campaignState?: CampaignSimulationState;
}) {
  const [mode, setMode] = useState<'TV' | 'MARKET'>('TV');
  const [idx, setIdx] = useState(0);

  const headlines = resolveHeadlinesList(govState, campaignState);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % Math.max(1, headlines.length));
    }, 5500);
    return () => window.clearInterval(timer);
  }, [headlines.length]);

  const redAlert = isRedAlertActive(govState);
  const theme = resolveTickerBarTheme(redAlert, mode);
  const activeHeadline = headlines[idx % headlines.length] ?? headlines[0]!;
  const isTvMode = mode === 'TV';
  const activeChannel = resolveActiveTvChannel(idx, redAlert);

  return (
    <footer className={`z-30 shrink-0 px-3 py-1.5 transition-colors ${theme.barCls}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <TickerSourceLogos isTvMode={isTvMode} channel={activeChannel} />

          <span
            className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono font-extrabold uppercase shrink-0 inline-flex items-center gap-1 ${theme.badgeCls}`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            {theme.badgeText}
          </span>

          {isTvMode ? (
            <div className="text-xs font-mono font-bold text-slate-100 truncate tracking-wide">
              {activeHeadline}
            </div>
          ) : (
            <MarketQuotesStrip govState={govState} />
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            setMode(isTvMode ? 'MARKET' : 'TV');
          }}
          className="px-2.5 py-0.5 rounded-sm bg-[#090d14]/90 hover:bg-[#162234] border border-[#334155] text-[10px] font-mono font-bold text-amber-200 shrink-0 inline-flex items-center gap-1"
        >
          <Activity className="w-3 h-3 text-amber-400" />
          <span>{isTvMode ? 'Ver Pizarra Financiera' : 'Ver Zócalo TV'}</span>
        </button>
      </div>
    </footer>
  );
}
