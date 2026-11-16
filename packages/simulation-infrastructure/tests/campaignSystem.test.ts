import { describe, expect, it } from 'vitest';
import {
  advanceCampaignMonth,
  applyDebateOutcomeToCampaign,
  applySkipDebatePenalty,
  buildDebateSession,
  canExecuteCampaignAction,
  evaluateDebateReplyOutcome,
  executeCampaignAction
} from '@argentina-sim/domain';
import {
  CAMPAIGN_ACTIONS_CATALOG,
  CAMPAIGN_DILEMMAS_CATALOG,
  createInitialCampaignState,
  DEBATE_PROMPTS_CATALOG,
  DEBATE_REBUTTALS_CATALOG,
  drawPressConferenceRounds,
  FULL_PRESS_QUESTIONS_CATALOG,
  INITIAL_ECONOMIC_LEVERS,
  POLITICAL_PARTIES_2027,
  resolveMonthlyDilemma
} from '../src/index.js';

describe('Sistema Electoral y Campaña 2027 (Screenshots)', () => {
  it('las 10 palancas de política económica arrancan por DEFAULT en 0 (Neutral)', () => {
    expect(INITIAL_ECONOMIC_LEVERS).toHaveLength(10);
    for (const lever of INITIAL_ECONOMIC_LEVERS) {
      expect(lever.level).toBe(0);
    }
  });

  it('inicia la campaña con el PRO con sus valores reales (Mauricio Macri)', () => {
    const proParty = POLITICAL_PARTIES_2027.find((p) => p.sigla === 'PRO')!;
    const state = createInitialCampaignState(
      { id: 'MAURICIO_MACRI', name: 'Mauricio Macri' },
      proParty,
      'PRESIDENTE',
      'CABA'
    );

    expect(state.stage.stage).toBe('INTERNA');
    expect(state.stage.objectiveTitle).toBe('Ganar la interna partidaria del 25 de abril de 2027');
    expect(state.budgetArgentums).toBe(125.0);
    expect(state.actionsRemainingThisMonth).toBe(4);

    expect(state.attributes.inteligenciaPercibida).toBe(54.4);
    expect(state.attributes.convencimiento).toBe(43.8);
    expect(state.attributes.relevancia).toBe(62.5);
    expect(state.attributes.apoyoPartidario).toBe(56.8);

    expect(state.image.imagenPositiva).toBe(56.6);
    expect(state.image.imagenNegativa).toBe(35.1);
    expect(state.image.desconocimiento).toBe(8.3);

    expect(state.votingIntention.tuInterna).toBe(49.0);
    expect(state.votingIntention.piso).toBe(6.4);
    expect(state.votingIntention.techo).toBe(21.5);

    expect(state.internalPoll.candidates).toHaveLength(4);
    expect(state.internalPoll.candidates[0]?.name).toContain('Mauricio Macri');
    expect(state.internalPoll.candidates[0]?.voteSharePct).toBe(49.0);
  });

  it('valida requisitos y permite ejecutar acciones de campaña reduciendo costo y consumiendo slots', () => {
    const proParty = POLITICAL_PARTIES_2027.find((p) => p.sigla === 'PRO')!;
    let state = createInitialCampaignState(
      { id: 'MAURICIO_MACRI', name: 'Mauricio Macri' },
      proParty,
      'PRESIDENTE',
      'PBA'
    );

    const actoCard = CAMPAIGN_ACTIONS_CATALOG.find((c) => c.id === 'ACTO_PARTIDARIO')!;
    const check = canExecuteCampaignAction(state, actoCard);
    expect(check.allowed).toBe(true);

    state = executeCampaignAction(state, actoCard, { actionId: 'ACTO_PARTIDARIO' });
    expect(state.actionsRemainingThisMonth).toBe(3);
    expect(state.budgetArgentums).toBe(125.0 - 7.2);
    expect(state.attributes.apoyoPartidario).toBeGreaterThan(56.8);

    const recorridaCard = CAMPAIGN_ACTIONS_CATALOG.find((c) => c.id === 'RECORRIDA')!;
    state = executeCampaignAction(state, recorridaCard, {
      actionId: 'RECORRIDA',
      selectedProvinceId: 'PBA'
    });
    expect(state.actionsRemainingThisMonth).toBe(2);
    const pba = state.provinces.find((p) => p.provinceId === 'PBA')!;
    expect(pba.visitsCount).toBe(2);
  });

  it('inicializa también estados de campaña para LLA, UxP y partidos personalizados', () => {
    const llaParty = POLITICAL_PARTIES_2027.find((p) => p.sigla === 'LLA')!;
    const llaState = createInitialCampaignState(
      { id: 'JAVIER_MILEI', name: 'Javier Milei' },
      llaParty,
      'PRESIDENTE',
      'CABA'
    );
    expect(llaState.internalPoll.candidates[0]?.name).toContain('Javier Milei');
    expect(llaState.votingIntention.tuInterna).toBe(58.2);

    const uxpParty = POLITICAL_PARTIES_2027.find((p) => p.sigla === 'UxP')!;
    const uxpState = createInitialCampaignState(
      { id: 'AXEL_KICILLOF', name: 'Axel Kicillof' },
      uxpParty,
      'GOBERNADOR',
      'PBA'
    );
    expect(uxpState.internalPoll.candidates[0]?.name).toContain('Axel Kicillof');
    expect(uxpState.attributes.espacioEstado).toBe('DIVIDIDO');

    const customState = createInitialCampaignState(
      { id: 'CUSTOM', name: 'Ana Rivas' },
      {
        id: 'MIP',
        sigla: 'MIP',
        name: 'Movimiento Integración Productiva',
        colorName: 'Esmeralda',
        primaryColor: '#10b981',
        ideology: 'Centrismo',
        description: 'Partido propio',
        economicPosition: 50,
        culturalPosition: 50,
        socialBase: 'Clases medias',
        emblem: llaParty.emblem
      },
      'PRESIDENTE',
      'CORDOBA'
    );
    expect(customState.candidateName).toBe('Ana Rivas');
    expect(customState.partySigla).toBe('MIP');
    expect(customState.partyAxis).toEqual({ economic: 50, cultural: 50 });

    const leftCustomState = createInitialCampaignState(
      { id: 'CUSTOM', name: 'Lucas Paz' },
      {
        id: 'CUSTOM',
        sigla: 'FLP',
        name: 'Frente Laboral Popular',
        colorName: 'Carmín',
        primaryColor: '#e11d48',
        ideology: 'Izquierda / Socialismo',
        description: 'Partido propio progresista',
        economicPosition: 18,
        culturalPosition: 22,
        socialBase: 'Trabajadores y estudiantes',
        emblem: llaParty.emblem
      },
      'PRESIDENTE',
      'PBA'
    );
    expect(leftCustomState.partyAxis).toEqual({ economic: 18, cultural: 22 });
  });

  it('avanza los meses de campaña hasta desbloquear la asunción en diciembre', () => {
    const proParty = POLITICAL_PARTIES_2027.find((p) => p.sigla === 'PRO')!;
    let state = createInitialCampaignState(
      { id: 'MAURICIO_MACRI', name: 'Mauricio Macri' },
      proParty,
      'PRESIDENTE',
      'CABA'
    );

    for (let m = 1; m < 12; m += 1) {
      state = advanceCampaignMonth(state);
      expect(state.actionsRemainingThisMonth).toBe(4);
    }
    expect(state.stage.stage).toBe('GOBIERNO');
    expect(state.stage.formattedDate).toBe('10 de diciembre de 2027');
  });

  it('aplica rendimientos decrecientes por fatiga al repetir la misma accion y los recupera al mes siguiente', () => {
    const proParty = POLITICAL_PARTIES_2027.find((p) => p.sigla === 'PRO')!;
    let state = createInitialCampaignState(
      { id: 'MAURICIO_MACRI', name: 'Mauricio Macri' },
      proParty,
      'PRESIDENTE',
      'CABA'
    );
    const pubAction = CAMPAIGN_ACTIONS_CATALOG.find((a) => a.id === 'PUBLICIDAD')!;

    const prevRel = state.attributes.relevancia;
    state = executeCampaignAction(state, pubAction, { actionId: 'PUBLICIDAD' });
    const gain1 = state.attributes.relevancia - prevRel;

    const afterFirstRel = state.attributes.relevancia;
    state = executeCampaignAction(state, pubAction, { actionId: 'PUBLICIDAD' });
    const gain2 = state.attributes.relevancia - afterFirstRel;

    // La segunda ejecucion debe rendir menos que la primera por fatiga (hiperbola 1 / (1 + 0.40 * U))
    expect(gain2).toBeLessThan(gain1);
    expect(state.actionUsageCount?.PUBLICIDAD).toBe(2);

    // Al avanzar de mes, la fatiga debe decaer de 2 a 1
    state = advanceCampaignMonth(state);
    expect(state.actionUsageCount?.PUBLICIDAD).toBe(1);
  });

  it('provee +50 acciones, +50 dilemas, +50 preguntas de prensa y +50 bloques de debate sin duplicados', () => {
    expect(CAMPAIGN_ACTIONS_CATALOG.length).toBeGreaterThanOrEqual(50);
    expect(CAMPAIGN_DILEMMAS_CATALOG.length).toBeGreaterThanOrEqual(50);
    expect(DEBATE_PROMPTS_CATALOG.length).toBeGreaterThanOrEqual(50);
    expect(FULL_PRESS_QUESTIONS_CATALOG.length).toBeGreaterThanOrEqual(50);

    expect(new Set(CAMPAIGN_ACTIONS_CATALOG.map((a) => a.id)).size).toBe(CAMPAIGN_ACTIONS_CATALOG.length);
    expect(new Set(CAMPAIGN_DILEMMAS_CATALOG.map((d) => d.id)).size).toBe(CAMPAIGN_DILEMMAS_CATALOG.length);
    expect(new Set(DEBATE_PROMPTS_CATALOG.map((p) => p.id)).size).toBe(DEBATE_PROMPTS_CATALOG.length);
    expect(new Set(FULL_PRESS_QUESTIONS_CATALOG.map((q) => q.id)).size).toBe(FULL_PRESS_QUESTIONS_CATALOG.length);

    // Conferencias de prensa distintas no repiten preguntas dentro de la misma ronda ni devuelven exactamente el mismo set al variar nonce
    const drawA = drawPressConferenceRounds(4, 'Tester', 0);
    const drawB = drawPressConferenceRounds(4, 'Tester', 1);
    expect(drawA).toHaveLength(4);
    expect(drawA.map((r) => r.id).join(',')).not.toBe(drawB.map((r) => r.id).join(','));

    // Todos los meses de campaña 2..11 resuelven dilemas únicos si acumulamos resolvedIds
    const pickedIds: string[] = [];
    for (let m = 2; m <= 11; m += 1) {
      const dil = resolveMonthlyDilemma(m, pickedIds, null, 'RUN_A');
      expect(dil).not.toBeNull();
      expect(pickedIds.includes(dil!.id)).toBe(false);
      pickedIds.push(dil!.id);
    }
  });

  it('arma debates presidenciales 3D de 5 atriles en Generales y 2 cara a cara en Balotaje con impacto real', () => {
    const proParty = POLITICAL_PARTIES_2027.find((p) => p.sigla === 'PRO')!;
    const state = createInitialCampaignState(
      { id: 'MAURICIO_MACRI', name: 'Mauricio Macri' },
      proParty,
      'PRESIDENTE',
      'CABA'
    );

    const generalesSession = buildDebateSession(
      state,
      'GENERALES',
      DEBATE_PROMPTS_CATALOG,
      DEBATE_REBUTTALS_CATALOG,
      0
    );
    expect(generalesSession.podiums).toHaveLength(5);
    expect(generalesSession.rounds).toHaveLength(4);
    expect(generalesSession.isMandatory).toBe(true);

    const balotajeSession = buildDebateSession(
      state,
      'BALOTAJE',
      DEBATE_PROMPTS_CATALOG,
      DEBATE_REBUTTALS_CATALOG,
      2
    );
    expect(balotajeSession.podiums).toHaveLength(2);
    expect(balotajeSession.maxRebuttals).toBe(3);

    // Verifica que chicana con alta vulnerabilidad dispara contragolpe penalizado
    const highVulnState = { ...state, attributes: { ...state.attributes, vulnerabilidad: 42 } };
    const chicanaOpt = generalesSession.rounds[0]!.options[1];
    const evalVuln = evaluateDebateReplyOutcome(highVulnState, chicanaOpt);
    expect(evalVuln.liveTag).toContain('VULNERABILIDAD');
    expect(evalVuln.negDelta).toBeGreaterThan(chicanaOpt.negDelta);

    const afterDebate = applyDebateOutcomeToCampaign(state, 'GENERALES', {
      imageDelta: 3.5,
      negDelta: 0.2,
      convDelta: 4.0,
      voteDelta: 2.2,
      relDelta: 3.0,
      intDelta: 2.5,
      rebuttalsUsed: 1,
      lastHeadline: 'TRIUNFO EN EL ATRIL'
    });
    expect(afterDebate.resolvedDebates).toContain('GENERALES_2027');
    expect(afterDebate.votingIntention.intencionVotoGeneral).toBeGreaterThan(state.votingIntention.intencionVotoGeneral);

    const skipped = applySkipDebatePenalty(state, 'BALOTAJE');
    expect(skipped.resolvedDebates).toContain('BALOTAJE_2027');
    expect(skipped.votingIntention.intencionVotoGeneral).toBeLessThan(state.votingIntention.intencionVotoGeneral);
  });
});
