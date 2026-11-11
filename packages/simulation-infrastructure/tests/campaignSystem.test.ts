import { describe, expect, it } from 'vitest';
import {
  advanceCampaignMonth,
  canExecuteCampaignAction,
  executeCampaignAction
} from '@argentina-sim/domain';
import {
  CAMPAIGN_ACTIONS_CATALOG,
  createInitialCampaignState,
  INITIAL_ECONOMIC_LEVERS,
  POLITICAL_PARTIES_2027
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
});
