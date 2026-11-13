import { describe, expect, it } from 'vitest';
import { applyCampaignBridgeToGovernment } from '@argentina-sim/domain';
import {
  createInitialCampaignState,
  createInitialSimulationState2027,
  POLITICAL_PARTIES_2027
} from '@argentina-sim/infrastructure';

describe('Puente Campaña -> Gobierno', () => {
  it('traslada coaliciones, bancas del Congreso, aprobacion inicial y lealtad provincial al asumir', () => {
    const campaign = createInitialCampaignState(
      { id: 'JAVIER_MILEI', name: 'Javier Milei' },
      POLITICAL_PARTIES_2027[0]!,
      'PRESIDENTE',
      'CABA'
    );
    const boostedCampaign = {
      ...campaign,
      coalitionParties: ['PRO', 'UCR'],
      runningMateId: 'PATRICIA_BULLRICH',
      votingIntention: { ...campaign.votingIntention, intencionVotoGeneral: 52.4 },
      image: { ...campaign.image, imagenPositiva: 54 }
    };

    const baseGov = createInitialSimulationState2027('PRESIDENTE', 'ESTANDAR_2027', 'CABA');
    const bridged = applyCampaignBridgeToGovernment(baseGov, boostedCampaign);

    expect(bridged.coalitionParties).toEqual(['PRO', 'UCR']);
    expect(bridged.runningMateId).toBe('PATRICIA_BULLRICH');
    expect(bridged.congressBlocs).toBeDefined();

    const totalDeputies = bridged.congressBlocs!.reduce((acc, b) => acc + b.deputiesSeats, 0);
    expect(totalDeputies).toBe(257);

    const proBloc = bridged.congressBlocs!.find((b) => b.id === 'PRO');
    const ucrBloc = bridged.congressBlocs!.find((b) => b.id === 'UCR');
    expect(proBloc?.relation).toBeGreaterThanOrEqual(85);
    expect(ucrBloc?.relation).toBeGreaterThanOrEqual(85);
    expect(bridged.eventLog[0]).toContain('52.4%');
  });
});

