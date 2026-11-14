import { describe, expect, it } from 'vitest';
import {
  INITIAL_PARLIAMENTARY_BLOCS,
  advanceCampaignMonth,
  advanceSimulationMonth,
  applyConcessionToBloc,
  applyPolicyAction,
  buildDynamicParliamentaryBlocs,
  computeEscrutinio,
  stepJudicialAndLawfare
} from '@argentina-sim/domain';
import {
  POLITICAL_PARTIES_2027,
  createInitialCampaignState,
  createInitialSimulationState2027
} from '@argentina-sim/infrastructure';

describe('Algoritmos e IA determinista sin LLM', () => {
  it('Utility AI rival en campaña evoluciona polling e historial de forma determinista', () => {
    const base = createInitialCampaignState(
      { id: 'JAVIER_MILEI', name: 'Javier Milei' },
      POLITICAL_PARTIES_2027[0]!,
      'PRESIDENTE',
      'CABA'
    );
    const runA = advanceCampaignMonth(base);
    const runB = advanceCampaignMonth(base);

    expect(runA.rivalLastTurnSummary).toBeDefined();
    expect(runA.rivalLastTurnSummary!.length).toBeGreaterThanOrEqual(4);
    expect(runA.rivalLastTurnSummary).toEqual(runB.rivalLastTurnSummary);
    expect(runA.countryMood?.partyPolling).toEqual(runB.countryMood?.partyPolling);
    expect(runA.historyLog[0]).toBe(runA.rivalLastTurnSummary![0]);
  });

  it('el escrutinio electoral refleja el polling dinamico de countryMood en Generales y Balotaje', () => {
    const base = createInitialCampaignState(
      { id: 'JAVIER_MILEI', name: 'Javier Milei' },
      POLITICAL_PARTIES_2027[0]!,
      'PRESIDENTE',
      'CABA'
    );
    const strongProState = {
      ...base,
      countryMood: {
        ...base.countryMood!,
        partyPolling: { ...base.countryMood!.partyPolling, UxP: 8, PRO: 42 }
      }
    };

    const generales = computeEscrutinio('GENERALES', strongProState);
    const proRow = generales.results.find((r) => r.fuerza.includes('PRO'));
    const uxpRow = generales.results.find((r) => r.fuerza.includes('UxP'));
    expect(proRow!.pct).toBeGreaterThan(uxpRow!.pct);

    const balotaje = computeEscrutinio('BALOTAJE', strongProState);
    expect(balotaje.results.some((r) => !r.isPlayer && r.fuerza.includes('PRO'))).toBe(true);
  });

  it('Congreso diferencia votos por categoria de ley y aplica fatiga decreciente por concesiones repetidas', () => {
    const state = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const laborBlocs = buildDynamicParliamentaryBlocs(state, 'LABORAL');
    const socialBlocs = buildDynamicParliamentaryBlocs(state, 'PRODUCCION_SOCIAL');

    const uxpLabor = laborBlocs.find((b) => b.id === 'UXP')!.probabilityYes;
    const uxpSocial = socialBlocs.find((b) => b.id === 'UXP')!.probabilityYes;
    const llaLabor = laborBlocs.find((b) => b.id === 'LLA')!.probabilityYes;
    const llaSocial = socialBlocs.find((b) => b.id === 'LLA')!.probabilityYes;

    expect(uxpSocial).toBeGreaterThan(uxpLabor);
    expect(llaLabor).toBeGreaterThan(llaSocial);

    const ucr = INITIAL_PARLIAMENTARY_BLOCS.find((b) => b.id === 'UCR')!;
    const afterOne = applyConcessionToBloc(ucr, 'ARGENTUMS', 50, false, 'FISCAL_PRESUPUESTO', 52);
    const afterTwo = applyConcessionToBloc(afterOne, 'GABINETE', 50, false, 'FISCAL_PRESUPUESTO', 52);
    const gainFirst = afterOne.probabilityYes - ucr.probabilityYes;
    const gainSecond = afterTwo.probabilityYes - afterOne.probabilityYes;
    expect(gainFirst).toBeGreaterThan(0);
    expect(gainSecond).toBeGreaterThan(0);
    expect(gainSecond).toBeLessThan(gainFirst);
  });

  it('Corte Suprema reacciona distinto por doctrina y Comodoro Py avanza causas de sindicatos bajo paro', () => {
    const state = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const judicialCustom = {
      ...state.judicial,
      judicialInterferenceTraceIndex: 40,
      supremeCourt: [
        {
          id: 'J_INST',
          name: 'Ministro Institucionalista',
          age: 66,
          doctrine: 'INSTITUCIONALISTA' as const,
          requiresSenateReconfirmationSoon: false,
          alignmentWithExecutive: 55
        },
        {
          id: 'J_MKT',
          name: 'Ministro Pro Mercado',
          age: 64,
          doctrine: 'PRO_MERCADO' as const,
          requiresSenateReconfirmationSoon: false,
          alignmentWithExecutive: 55
        }
      ],
      activeCases: [
        {
          id: 'CAUSA_GREMIO',
          title: 'Causa Obra Social',
          accusedFaction: 'SINDICATOS' as const,
          stage: 'INSTRUCCION' as const,
          judgeId: 1,
          monthsStalled: 0,
          politicalImpact: 60
        }
      ]
    };

    const nextJudicial = stepJudicialAndLawfare(judicialCustom, 60, 8.5, {
      activeNationalStrike: true,
      trustCongress: 30,
      trustMarkets: 82
    });

    const inst = nextJudicial.supremeCourt.find((j) => j.id === 'J_INST')!;
    const mkt = nextJudicial.supremeCourt.find((j) => j.id === 'J_MKT')!;
    expect(mkt.alignmentWithExecutive).toBeGreaterThan(inst.alignmentWithExecutive);
    expect(nextJudicial.activeCases[0]!.stage).toBe('INDAGATORIA');
  });

  it('la cola de rezagos macro distribuye shocks en meses siguientes y el Trust Ledger decae gradualmente', () => {
    const initial = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const intervened = applyPolicyAction(initial, { type: 'TOGGLE_INDEC_INTERVENTION', intervene: true });
    expect(intervened.trustLedger?.MERCADOS).toBeLessThan(50);

    const devalued = applyPolicyAction(intervened, { type: 'DISCRETE_DEVALUATION', devaluationPct: 40 });
    expect(devalued.laggedMacroShocks?.length).toBe(1);
    expect(devalued.laggedMacroShocks![0]!.monthsRemaining).toBe(3);

    const m1 = advanceSimulationMonth(devalued);
    expect(m1.laggedMacroShocks![0]!.monthsRemaining).toBe(2);
    expect(m1.trustLedger!.MERCADOS).toBeGreaterThan(devalued.trustLedger!.MERCADOS);

    const m2 = advanceSimulationMonth(m1);
    expect(m2.laggedMacroShocks![0]!.monthsRemaining).toBe(1);

    const m3 = advanceSimulationMonth(m2);
    expect(m3.laggedMacroShocks!.length).toBe(0);
  });
});

