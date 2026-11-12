import type { CampaignSimulationState } from '@argentina-sim/domain';

// Catálogo de Dilemas Emergentes de Campaña ("Situación del Mes", QQG Captura 7):
// En la política argentina ningún candidato llega limpio al cuarto oscuro: o te cae un
// empresario de la obra pública con bolsos a prometerte fiscales a cambio de no tocarle
// las concesiones viales, o te filtran un audio operado en la tele un domingo a la noche.
// Cada elección es una bomba de tiempo entre plata, ética y costo electoral.

export interface DilemmaEffectBadge {
  label: string;
  isPositive: boolean;
}

export interface CampaignDilemmaOption {
  id: string;
  title: string;
  badges: DilemmaEffectBadge[];
  apply: (state: CampaignSimulationState) => CampaignSimulationState;
}

export interface CampaignMonthlyDilemma {
  id: string;
  monthIndex: number;
  formattedDate: string;
  title: string;
  description: string;
  options: [CampaignDilemmaOption, CampaignDilemmaOption];
}

export const CAMPAIGN_DILEMMAS_CATALOG: CampaignMonthlyDilemma[] = [
  {
    id: 'DILEMMA_MES_5_EMPRESARIO',
    monthIndex: 5,
    formattedDate: '1 de mayo de 2027',
    title: 'Un empresario ofrece un aporte',
    description:
      'Un empresario de la construcción te ofrece un aporte de campaña significativo a cambio de que no toques ciertas licitaciones en caso de asumir. Nadie más lo sabe por ahora, pero aumentaría tu vulnerabilidad ante filtraciones judiciales.',
    options: [
      {
        id: 'ACEPTAR_DINERO',
        title: 'Aceptar el dinero',
        badges: [
          { label: 'PRESUPUESTO +22 ARGENTUMS', isPositive: true },
          { label: 'VULNERABILIDAD +3,5', isPositive: false },
          { label: 'DEPENDENCIA EMPRESARIAL +5,0', isPositive: false }
        ],
        apply: (state: CampaignSimulationState) => ({
          ...state,
          budgetArgentums: Math.round((state.budgetArgentums + 22.0) * 10) / 10,
          image: {
            ...state.image,
            imagenNegativa: Math.min(88, Math.round((state.image.imagenNegativa + 0.8) * 10) / 10)
          },
          attributes: {
            ...state.attributes,
            relevancia: Math.min(100, Math.round((state.attributes.relevancia + 1.2) * 10) / 10)
          },
          historyLog: [
            'Situación del mes: aceptaste el aporte del empresario de la construcción (+22 argentums, +3.5 vulnerabilidad).',
            ...state.historyLog
          ]
        })
      },
      {
        id: 'RECHAZAR_DINERO',
        title: 'Rechazarlo',
        badges: [
          { label: 'INTELIGENCIA PERCIBIDA +1,2', isPositive: true },
          { label: 'CONVENCIMIENTO +0,8', isPositive: true }
        ],
        apply: (state: CampaignSimulationState) => ({
          ...state,
          attributes: {
            ...state.attributes,
            inteligenciaPercibida: Math.min(
              100,
              Math.round((state.attributes.inteligenciaPercibida + 1.2) * 10) / 10
            ),
            convencimiento: Math.min(
              100,
              Math.round((state.attributes.convencimiento + 0.8) * 10) / 10
            )
          },
          image: {
            ...state.image,
            imagenPositiva: Math.min(88, Math.round((state.image.imagenPositiva + 0.6) * 10) / 10)
          },
          historyLog: [
            'Situación del mes: rechazaste el dinero turbio (+1.2 inteligencia percibida, +0.8 convencimiento).',
            ...state.historyLog
          ]
        })
      }
    ]
  },
  {
    id: 'DILEMMA_MES_7_FILTRACION',
    monthIndex: 7,
    formattedDate: '1 de julio de 2027',
    title: 'Operación mediática en la previa a las PASO',
    description:
      'Un canal de noticias asegura tener un audio de un armador tuyo negociando concejalías en el Conurbano. Amenazan con difundirlo el próximo domingo en horario central si no pagás pauta publicitaria anticipada.',
    options: [
      {
        id: 'SILENCIAR_PAUTA',
        title: 'Pautar y operar el silenciamiento',
        badges: [
          { label: 'PRESUPUESTO -15 ARGENTUMS', isPositive: false },
          { label: 'BLINDAJE MEDIÁTICO TEMPORAL', isPositive: true }
        ],
        apply: (state: CampaignSimulationState) => ({
          ...state,
          budgetArgentums: Math.max(0, Math.round((state.budgetArgentums - 15.0) * 10) / 10),
          historyLog: [
            'Situación del mes: pautaste para frenar la filtración mediática (-15 argentums).',
            ...state.historyLog
          ]
        })
      },
      {
        id: 'DENUNCIAR_EXTORSION',
        title: 'Dar la cara y denunciar extorsión',
        badges: [
          { label: 'RELEVANCIA +3,0', isPositive: true },
          { label: 'CONVENCIMIENTO +2,0', isPositive: true },
          { label: 'IMAGEN NEGATIVA +1,5', isPositive: false }
        ],
        apply: (state: CampaignSimulationState) => ({
          ...state,
          attributes: {
            ...state.attributes,
            relevancia: Math.min(100, Math.round((state.attributes.relevancia + 3.0) * 10) / 10),
            convencimiento: Math.min(
              100,
              Math.round((state.attributes.convencimiento + 2.0) * 10) / 10
            )
          },
          image: {
            ...state.image,
            imagenNegativa: Math.min(88, Math.round((state.image.imagenNegativa + 1.5) * 10) / 10)
          },
          historyLog: [
            'Situación del mes: fuiste a los medios a denunciar la opereta (+3 relevancia, +2 convencimiento, +1.5 negativa).',
            ...state.historyLog
          ]
        })
      }
    ]
  },
  {
    id: 'DILEMMA_MES_9_BARONES',
    monthIndex: 9,
    formattedDate: '1 de septiembre de 2027',
    title: 'Pacto de no agresión en el Conurbano',
    description:
      'Intendentes de peso te ofrecen cuidar tus boletas presidenciales en las mesas de votación si bajás la intensidad de tus recorridas territoriales para no amenazar su control del concejo deliberante.',
    options: [
      {
        id: 'CERRAR_PACTO',
        title: 'Cerrar el pacto y asegurar fiscales',
        badges: [
          { label: 'VOTOS GENERALES +2,2 %', isPositive: true },
          { label: 'APOYO PARTIDARIO -2,0', isPositive: false }
        ],
        apply: (state: CampaignSimulationState) => ({
          ...state,
          votingIntention: {
            ...state.votingIntention,
            intencionVotoGeneral:
              Math.round((state.votingIntention.intencionVotoGeneral + 2.2) * 10) / 10
          },
          attributes: {
            ...state.attributes,
            apoyoPartidario: Math.max(
              5,
              Math.round((state.attributes.apoyoPartidario - 2.0) * 10) / 10
            )
          },
          historyLog: [
            'Situación del mes: pactaste fiscalización con los caciques distritales (+2.2% votos generales, -2 apoyo partidario).',
            ...state.historyLog
          ]
        })
      },
      {
        id: 'RECHAZAR_PACTO',
        title: 'Rechazar y redoblar caravanas',
        badges: [
          { label: 'APOYO MILITANTE +4,0', isPositive: true },
          { label: 'RIESGO DE BOLETA CORTADA', isPositive: false }
        ],
        apply: (state: CampaignSimulationState) => ({
          ...state,
          attributes: {
            ...state.attributes,
            apoyoPartidario: Math.min(
              100,
              Math.round((state.attributes.apoyoPartidario + 4.0) * 10) / 10
            )
          },
          image: {
            ...state.image,
            imagenPositiva: Math.min(88, Math.round((state.image.imagenPositiva + 1.5) * 10) / 10)
          },
          historyLog: [
            'Situación del mes: rechazaste el apriete distrital y metiste caravana propia (+4 apoyo partidario, +1.5 positiva).',
            ...state.historyLog
          ]
        })
      }
    ]
  }
];

export function resolveMonthlyDilemma(
  monthIndex: number,
  resolvedIds?: string[]
): CampaignMonthlyDilemma | null {
  const resolved = resolvedIds ?? [];
  const match = CAMPAIGN_DILEMMAS_CATALOG.find(
    (d) => d.monthIndex === monthIndex && !resolved.includes(d.id)
  );
  return match ?? null;
}
