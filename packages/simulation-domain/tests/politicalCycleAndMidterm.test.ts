import { describe, expect, it } from 'vitest';
import {
  advanceSimulationMonth,
  applyCampaignBridgeToGovernment,
  applyPolicyAction,
  buildInitialCampaignPromises,
  countAlliedDeputiesForVeto,
  getPoliticalCapital,
  getUpcomingDebtMilestone,
  previewNextMonthImpact,
  resolveFireOfTheMonth,
  resolvePresidentialLegacy,
  stepTemporalMeasuresLifecycle,
  toggleCampaignPromiseSelection,
  type SectorMeasureCard
} from '@argentina-sim/domain';
import {
  POLITICAL_PARTIES_2027,
  buildIndicatorsCatalog,
  createInitialCampaignState,
  createInitialSimulationState2027
} from '@argentina-sim/infrastructure';

function makeSampleMeasures(): SectorMeasureCard[] {
  return [
    {
      id: 'M_TEMP_1',
      sectorId: 'PRECIOS',
      title: 'Congelamiento de Góndola',
      description: 'Tope transitorio de precios',
      durationType: 'TEMPORAL',
      cooldownMonths: 3,
      active: false,
      fiscalCostPctGdp: 0.1,
      inflationEffectPp: -1.0,
      approvalEffectPp: 1.5
    },
    {
      id: 'M_TEMP_2',
      sectorId: 'PRECIOS',
      title: 'Desregulación Total de Precios',
      description: 'Opuesta al congelamiento',
      durationType: 'PERMANENTE',
      mutuallyExclusiveWith: 'M_TEMP_1',
      active: false,
      fiscalCostPctGdp: -0.05,
      inflationEffectPp: 0.3,
      approvalEffectPp: -0.4
    },
    {
      id: 'M_PERM_3',
      sectorId: 'ENERGIA',
      title: 'Segmentación Eléctrica',
      description: 'Reducción focalizada',
      durationType: 'PERMANENTE',
      active: false,
      fiscalCostPctGdp: -0.1,
      inflationEffectPp: 0.2,
      approvalEffectPp: -0.2
    },
    {
      id: 'M_PERM_4',
      sectorId: 'TRABAJO',
      title: 'Incentivo PyME',
      description: 'Crédito laboral',
      durationType: 'PERMANENTE',
      active: false,
      fiscalCostPctGdp: 0.12,
      inflationEffectPp: 0.1,
      approvalEffectPp: 0.8
    }
  ];
}

describe('Ciclo Político, Medidas Temporales, Legislativas 2029, Promesas y Crisis', () => {
  it('limita el capital político mensual a 3 decretos y lo recarga al avanzar mes', () => {
    const base = {
      ...createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA'),
      measures: makeSampleMeasures()
    };

    let s = applyPolicyAction(base, { type: 'TOGGLE_MEASURE', measureId: 'M_TEMP_1' });
    s = applyPolicyAction(s, { type: 'TOGGLE_MEASURE', measureId: 'M_PERM_3' });
    s = applyPolicyAction(s, { type: 'TOGGLE_MEASURE', measureId: 'M_PERM_4' });
    expect(getPoliticalCapital(s).remaining).toBe(0);

    // 4ta activación en el mismo mes queda bloqueada
    const blocked = applyPolicyAction(s, { type: 'TOGGLE_MEASURE', measureId: 'M_TEMP_2' });
    expect(blocked.measures?.find((m) => m.id === 'M_TEMP_2')?.active).toBe(false);

    // Al avanzar el mes se recarga el capital político y se genera balance causal de 3 bullets
    const nextMonth = advanceSimulationMonth(blocked);
    expect(getPoliticalCapital(nextMonth).remaining).toBeGreaterThanOrEqual(3);
    expect(nextMonth.monthlyBalanceSummary?.length).toBe(3);
  });

  it('respeta mutuallyExclusiveWith derogando la medida opuesta al activar su contraria', () => {
    const base = {
      ...createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA'),
      measures: makeSampleMeasures()
    };

    const s1 = applyPolicyAction(base, { type: 'TOGGLE_MEASURE', measureId: 'M_TEMP_1' });
    expect(s1.measures?.find((m) => m.id === 'M_TEMP_1')?.active).toBe(true);

    const s2 = applyPolicyAction(s1, { type: 'TOGGLE_MEASURE', measureId: 'M_TEMP_2' });
    expect(s2.measures?.find((m) => m.id === 'M_TEMP_2')?.active).toBe(true);
    expect(s2.measures?.find((m) => m.id === 'M_TEMP_1')?.active).toBe(false);
  });

  it('vence medidas temporales con rebote inflacionario y período de enfriamiento', () => {
    const activeLastMonth: SectorMeasureCard[] = [
      { ...makeSampleMeasures()[0]!, active: true, remainingMonths: 1 }
    ];

    const res = stepTemporalMeasuresLifecycle(activeLastMonth);
    expect(res.nextMeasures[0]?.active).toBe(false);
    expect(res.nextMeasures[0]?.cooldownRemainingMonths).toBe(3);
    expect(res.reboundInflationPp).toBeGreaterThan(0);
    expect(res.expiredTitles).toEqual(['Congelamiento de Góndola']);
  });

  it('dispara Legislativas 2029 en el mes 23 manteniendo exactos 257 Diputados y 72 Senadores', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const preMidterm = {
      ...base,
      turnMonth: 22,
      publicOpinion: { ...base.publicOpinion, managementApprovalPct: 62 },
      inflation: { ...base.inflation, realMonthlyIpcPct: 1.4, povertyCbtPct: 30 }
    };

    const afterMidterm = advanceSimulationMonth(preMidterm);
    expect(afterMidterm.turnMonth).toBe(23);
    expect(afterMidterm.midterm2029Done).toBe(true);
    expect(afterMidterm.midterm2029Result).toBeDefined();
    expect(afterMidterm.midterm2029Result?.dismissed).toBe(false);

    const depSum = (afterMidterm.congressBlocs ?? []).reduce((a, b) => a + b.deputiesSeats, 0);
    const senSum = (afterMidterm.congressBlocs ?? []).reduce((a, b) => a + b.senateSeats, 0);
    expect(depSum).toBe(257);
    expect(senSum).toBe(72);

    const dismissed = applyPolicyAction(afterMidterm, { type: 'DISMISS_MIDTERM_MODAL' });
    expect(dismissed.midterm2029Result?.dismissed).toBe(true);
  });

  it('evalúa promesas de campaña, activa tramas de crisis, resuelve vía acción y diagnostica Incendio del Mes', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const stressed = {
      ...base,
      turnMonth: 6,
      campaignPromises: buildInitialCampaignPromises('LLA'),
      centralBank: {
        ...base.centralBank,
        grossReservesBillionUsd: 22,
        cepoStrictnessIndex: 85,
        cclDollarArs: Math.round(base.centralBank.officialDollarArs * 1.45),
        exchangeBrechaPct: 45,
        netLiquidReservesBillionUsd: 6
      },
      inflation: { ...base.inflation, realMonthlyIpcPct: 1.5 }
    };

    const stepped = advanceSimulationMonth(stressed);
    expect(stepped.campaignPromises?.some((p) => p.status === 'CUMPLIDA')).toBe(true);
    expect(stepped.activeCrisisArc?.id).toBe('CORRIDA_CITY');
    expect(resolveFireOfTheMonth(stepped)).toContain('Corrida en la City');

    const resolved = applyPolicyAction(stepped, {
      type: 'RESOLVE_CRISIS_ARC',
      strategy: 'NEGOCIAR'
    });
    expect(resolved.activeCrisisArc).toBeNull();
  });

  it('graba historySnapshots reales mes a mes y los usa en buildIndicatorsCatalog', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const m2 = advanceSimulationMonth(base);
    const m3 = advanceSimulationMonth(m2);
    expect(m3.historySnapshots?.length).toBe(3);

    const catalog = buildIndicatorsCatalog(m3);
    const inf = catalog.find((c) => c.id === 'INF_MENSUAL');
    expect(inf?.points[inf.points.length - 1]?.value).toBe(m3.inflation.realMonthlyIpcPct);
  });

  it('dispara megavencimiento FMI/Deuda en el mes 8, avisa antes y resuelve con las 3 opciones', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const mes6 = { ...base, turnMonth: 6 };
    expect(getUpcomingDebtMilestone(mes6)?.monthsLeft).toBe(2);

    const mes8 = advanceSimulationMonth({ ...base, turnMonth: 7 });
    expect(mes8.pendingDebtMilestone?.id).toBe('FMI_REV_2028');

    const paid = applyPolicyAction(mes8, { type: 'RESOLVE_DEBT_MILESTONE', option: 'PAGAR_RESERVAS' });
    expect(paid.pendingDebtMilestone).toBeNull();
    expect(paid.resolvedDebtMilestones).toContain('FMI_REV_2028');
    expect(paid.countryRiskEmbiPb).toBeLessThan(mes8.countryRiskEmbiPb);
  });

  it('penaliza al desplazar ministro de cuota aliada y dispara renuncia por riesgo extremo', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const withCabinet = {
      ...base,
      congressBlocs: [
        { id: 'LLA', deputiesSeats: 38, senateSeats: 7, relation: 100 },
        { id: 'PRO', deputiesSeats: 37, senateSeats: 6, relation: 78 }
      ],
      ministers: [
        {
          id: 'MIN_SEG',
          ministryName: 'Seguridad',
          ministerName: 'Ministro PRO',
          partySigla: 'PRO',
          affinityPct: 75,
          isCoalitionQuota: true,
          competence: 75,
          loyalty: 20,
          risk: 92,
          performance: 70,
          monthlyEffectText: 'Seguridad'
        }
      ]
    };

    const ousted = applyPolicyAction(withCabinet, { type: 'REPLACE_MINISTER', ministerId: 'MIN_SEG' });
    expect(ousted.congressBlocs?.find((b) => b.id === 'PRO')?.relation).toBe(66);

    const resignedMonth = advanceSimulationMonth(withCabinet);
    expect(resignedMonth.ministers?.[0]?.ministerName).toContain('Renuncia');
  });

  it('permite elegir promesas en campaña con boost de voto y trasladarlas a Gobierno + Reelección', () => {
    const camp = createInitialCampaignState(
      { id: 'JAVIER_MILEI', name: 'Javier Milei' },
      POLITICAL_PARTIES_2027[0]!,
      'PRESIDENTE',
      'CABA'
    );
    const startVote = camp.votingIntention.intencionVotoGeneral;
    const withPromise = toggleCampaignPromiseSelection(camp, 'PROM_POBREZA');
    expect(withPromise.votingIntention.intencionVotoGeneral).toBeGreaterThan(startVote);

    const baseGov = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const bridged = applyCampaignBridgeToGovernment(baseGov, withPromise);
    expect(bridged.campaignPromises?.[0]?.id).toBe('PROM_POBREZA');

    const legacy = resolvePresidentialLegacy(bridged, 'MANDATO_COMPLETADO');
    expect(legacy.canRunReelection).toBe(true);

    const reelected = applyPolicyAction(bridged, { type: 'START_REELECTION_TERM' });
    expect(reelected.government?.mandateTargetMonths).toBe(96);
    expect(reelected.government?.mandateStatus).toBe('EN_CURSO');
  });

  it('proyecta el mes siguiente con previewNextMonthImpact sin mutar el estado', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const snapshotTurn = base.turnMonth;
    const prevBase = previewNextMonthImpact(base);
    expect(base.turnMonth).toBe(snapshotTurn);
    expect(typeof prevBase.nextIpcPct).toBe('number');

    const withHighPeg = applyPolicyAction(base, { type: 'SET_CRAWLING_PEG', monthlyPct: 9 });
    const prevHighPeg = previewNextMonthImpact(withHighPeg);
    expect(prevHighPeg.nextIpcPct).toBeGreaterThan(prevBase.nextIpcPct);
  });

  it('dispara ofensiva opositora en el mes 6 y valida veto blindado (>=86) vs rechazado (<86)', () => {
    const base = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const withShield = {
      ...base,
      turnMonth: 5,
      congressBlocs: [
        { id: 'LLA', deputiesSeats: 50, senateSeats: 10, relation: 100 },
        { id: 'PRO', deputiesSeats: 40, senateSeats: 8, relation: 80 },
        { id: 'UXP', deputiesSeats: 167, senateSeats: 54, relation: 0 }
      ]
    };
    const mes6 = advanceSimulationMonth(withShield);
    expect(mes6.pendingOppositionBill?.id).toBe('OPP_MOVILIDAD_JUB');
    expect(countAlliedDeputiesForVeto(mes6)).toBe(90);

    const vetoOk = applyPolicyAction(mes6, { type: 'RESOLVE_OPPOSITION_BILL', resolution: 'VETAR' });
    expect(vetoOk.pendingOppositionBill).toBeNull();
    expect(vetoOk.treasury.socialProgramsPctGdp).toBe(mes6.treasury.socialProgramsPctGdp);

    const weakHouse = {
      ...mes6,
      congressBlocs: [
        { id: 'LLA', deputiesSeats: 38, senateSeats: 7, relation: 100 },
        { id: 'UXP', deputiesSeats: 219, senateSeats: 65, relation: 0 }
      ]
    };
    const vetoFail = applyPolicyAction(weakHouse, { type: 'RESOLVE_OPPOSITION_BILL', resolution: 'VETAR' });
    expect(vetoFail.treasury.socialProgramsPctGdp).toBeGreaterThan(weakHouse.treasury.socialProgramsPctGdp);
  });

  it('ejecuta Obra Federal y Llamado a Gobernador directo desde el mapa 3D', () => {
    const base = {
      ...createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA'),
      congressBlocs: [
        { id: 'LLA', deputiesSeats: 38, senateSeats: 7, relation: 100 },
        { id: 'PROVINCIALES', deputiesSeats: 28, senateSeats: 7, relation: 50 }
      ]
    };
    const startLoyalty = base.provinces.find((p) => p.id === 'CORDOBA')?.governorLoyaltyToPresident ?? 0;

    const afterWorks = applyPolicyAction(base, { type: 'PROMISE_PROVINCIAL_WORKS', provinceId: 'CORDOBA' });
    const worksLoyalty = afterWorks.provinces.find((p) => p.id === 'CORDOBA')?.governorLoyaltyToPresident ?? 0;
    expect(worksLoyalty).toBeGreaterThan(startLoyalty);
    expect(afterWorks.laggedMacroShocks?.length).toBeGreaterThan(0);

    const afterCall = applyPolicyAction(afterWorks, { type: 'CALL_GOVERNOR_FOR_QUORUM', provinceId: 'CORDOBA' });
    expect(getPoliticalCapital(afterCall).remaining).toBe(2);
    expect(afterCall.congressBlocs?.find((b) => b.id === 'PROVINCIALES')?.relation).toBe(56);
  });
});
