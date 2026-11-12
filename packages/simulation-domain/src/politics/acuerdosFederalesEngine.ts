// Acuerdos y herramientas federales Nación–Provincia (La(...) en QQG):
// Ecosistema de negociación bilateral entre el Presidente y los 24 gobernadores,
// regulando giros de fondos, apoyo parlamentario, pactos fiscales y transferencias.

export type FederalAgreementDirection = 'NACION_A_PROVINCIA' | 'PROVINCIA_A_NACION';

export interface FederalAgreementTool {
  id: string;
  name: string;
  direction: FederalAgreementDirection;
  costArgentums: number;
  politicalCost: number;
  governorLoyaltyDelta: number;
  legislativeVoteSupportDelta: number;
  description: string;
  effectSummary: string;
}

export const FEDERAL_AGREEMENTS_CATALOG: FederalAgreementTool[] = [
  // Nación -> Provincia
  {
    id: 'ATN_DISCRECIONAL',
    name: 'Aportes del Tesoro Nacional (ATN)',
    direction: 'NACION_A_PROVINCIA',
    costArgentums: 25,
    politicalCost: 5,
    governorLoyaltyDelta: 15,
    legislativeVoteSupportDelta: 20,
    description: 'Envío de fondos de emergencia del Ministerio del Interior para auxilio financiero inmediato.',
    effectSummary: 'Lealtad del gobernador +15, apoyo de sus legisladores nacionales +20%.'
  },
  {
    id: 'CONVENIO_OBRA_PUBLICA',
    name: 'Convenio federal de obra pública',
    direction: 'NACION_A_PROVINCIA',
    costArgentums: 45,
    politicalCost: 8,
    governorLoyaltyDelta: 22,
    legislativeVoteSupportDelta: 28,
    description: 'Reanudación o financiamiento conjunto de rutas, cloacas y obras hídricas estratégicas.',
    effectSummary: 'Lealtad +22, apoyo legislativo +28%, empleo provincial en suba.'
  },
  {
    id: 'PACTO_FISCAL_RECORTE',
    name: 'Pacto fiscal de austeridad provincial',
    direction: 'NACION_A_PROVINCIA',
    costArgentums: 0,
    politicalCost: 15,
    governorLoyaltyDelta: -8,
    legislativeVoteSupportDelta: 12,
    description: 'Compromiso de congelamiento de vacantes públicas provinciales a cambio de aval para crédito externo.',
    effectSummary: 'Déficit provincial a la baja, tensión con sindicatos estatales locales.'
  },
  {
    id: 'ADHESION_RIGI_PROVINCIAL',
    name: 'Adhesión provincial expresa al RIGI',
    direction: 'NACION_A_PROVINCIA',
    costArgentums: 10,
    politicalCost: 6,
    governorLoyaltyDelta: 12,
    legislativeVoteSupportDelta: 18,
    description: 'Aprobación en la legislatura local de estabilidad fiscal y exención de tasas municipales a grandes proyectos.',
    effectSummary: 'Desbloquea inversiones mineras y energéticas en la provincia.'
  },
  {
    id: 'CONVENIO_SEGURIDAD_FUERZAS_FEDERALES',
    name: 'Convenio de seguridad con fuerzas federales',
    direction: 'NACION_A_PROVINCIA',
    costArgentums: 18,
    politicalCost: 4,
    governorLoyaltyDelta: 14,
    legislativeVoteSupportDelta: 15,
    description: 'Despliegue conjunto de Gendarmería, Prefectura y Policía Federal para patrullaje antinarcóticos.',
    effectSummary: 'Baja del delito y apoyo del electorado local en seguridad.'
  },
  {
    id: 'REFINANCIAR_DEUDA_PROVINCIAL',
    name: 'Refinanciación de deuda con el Fondo Fiduciario',
    direction: 'NACION_A_PROVINCIA',
    costArgentums: 20,
    politicalCost: 10,
    governorLoyaltyDelta: 18,
    legislativeVoteSupportDelta: 25,
    description: 'Prórroga de amortizaciones de bonos provinciales y canje de títulos con el Tesoro nacional.',
    effectSummary: 'Alivio financiero al gobernador a cambio del voto de sus senadores.'
  },
  {
    id: 'ARMONIZACION_CAJA_PREVISIONAL',
    name: 'Armonización de caja previsional provincial',
    direction: 'NACION_A_PROVINCIA',
    costArgentums: 30,
    politicalCost: 12,
    governorLoyaltyDelta: 10,
    legislativeVoteSupportDelta: 15,
    description: 'Compensación del déficit de la caja no transferida con la condición de alinear edades con ANSES.',
    effectSummary: 'Fin de privilegios previsionales provinciales y orden fiscal.'
  },
  {
    id: 'RETENER_FONDOS_CONDICIONADOS',
    name: 'Retención de fondos y presión política',
    direction: 'NACION_A_PROVINCIA',
    costArgentums: 0,
    politicalCost: 25,
    governorLoyaltyDelta: -30,
    legislativeVoteSupportDelta: -20,
    description: 'Corte de transferencias discrecionales y fondos fiduciarios para disciplinar gobernadores rebeldes.',
    effectSummary: 'Deterioro de la relación institucional y riesgo de reclamos en la Corte Suprema.'
  },

  // Provincia -> Nación
  {
    id: 'OFRECER_VOTOS_LEGISLATIVOS',
    name: 'Ofrecer votos del bloque de legisladores',
    direction: 'PROVINCIA_A_NACION',
    costArgentums: 0,
    politicalCost: 10,
    governorLoyaltyDelta: 20,
    legislativeVoteSupportDelta: 40,
    description: 'El gobernador ordena a sus diputados y senadores votar a favor de una ley clave del Ejecutivo.',
    effectSummary: 'Garantiza quórum y mayoría a cambio de obras o fondos.'
  },
  {
    id: 'BLOQUE_GOBERNADORES_REGIONAL',
    name: 'Conformación de bloque de gobernadores',
    direction: 'PROVINCIA_A_NACION',
    costArgentums: 12,
    politicalCost: 8,
    governorLoyaltyDelta: 16,
    legislativeVoteSupportDelta: 25,
    description: 'Alianza interprovincial (Norte Grande, Patagonia o Región Centro) para negociar en bloque ante Nación.',
    effectSummary: 'Poder de veto conjunto y defensa coordinada de los recursos coparticipables.'
  }
];

export function executeFederalAgreement(
  tool: FederalAgreementTool,
  currentLoyalty: number,
  playerArgentums: number
): { success: boolean; newLoyalty: number; newArgentums: number; message: string } {
  if (playerArgentums < tool.costArgentums) {
    return {
      success: false,
      newLoyalty: currentLoyalty,
      newArgentums: playerArgentums,
      message: `Presupuesto insuficiente (${playerArgentums} Argentums). Se requieren ${tool.costArgentums} Argentums.`
    };
  }

  const updatedLoyalty = Math.max(0, Math.min(100, currentLoyalty + tool.governorLoyaltyDelta));
  const updatedArgentums = playerArgentums - tool.costArgentums;

  return {
    success: true,
    newLoyalty: updatedLoyalty,
    newArgentums: updatedArgentums,
    message: `✓ Acuerdo federal ejecutado: ${tool.name}. ${tool.effectSummary}`
  };
}
