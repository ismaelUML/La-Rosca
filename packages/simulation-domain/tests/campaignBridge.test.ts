import { describe, expect, it } from 'vitest';
import {
  advanceSimulationMonth,
  applyCampaignBridgeToGovernment,
  applyPolicyAction,
  computeEscrutinio,
  getOrInitGovernorMandate,
  getOrInitLegislatorMandate
} from '@argentina-sim/domain';
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

  it('calcula el escrutinio constitucional en dominio (primera vuelta >= 45% vs balotaje)', () => {
    const campaign = createInitialCampaignState(
      { id: 'JAVIER_MILEI', name: 'Javier Milei' },
      POLITICAL_PARTIES_2027[0]!,
      'PRESIDENTE',
      'CABA'
    );

    const directWin = computeEscrutinio('GENERALES', {
      ...campaign,
      votingIntention: { ...campaign.votingIntention, intencionVotoGeneral: 46.5 }
    });
    expect(directWin.isVictory).toBe(true);
    expect(directWin.isRunoff).toBe(false);

    const runoff = computeEscrutinio('GENERALES', {
      ...campaign,
      votingIntention: { ...campaign.votingIntention, intencionVotoGeneral: 36.0 }
    });
    expect(runoff.isVictory).toBe(false);
    expect(runoff.isRunoff).toBe(true);
    expect(runoff.isDefeat).toBe(false);

    const balotajeDefeat = computeEscrutinio('BALOTAJE', {
      ...campaign,
      votingIntention: { ...campaign.votingIntention, intencionVotoGeneral: 28.0 }
    });
    expect(balotajeDefeat.isVictory).toBe(false);
    expect(balotajeDefeat.isDefeat).toBe(true);
    expect(balotajeDefeat.verdictTitle).toBe('Fuiste derrotado en el balotaje');
    expect(balotajeDefeat.results[0]!.isPlayer).toBe(false);
  });

  it('ejecuta el bucle jugable propio de Gobernador, Diputado y Senador', () => {
    let govState = createInitialSimulationState2027('GOBERNADOR', 'ESTANDAR_2027', 'CORDOBA');
    const baseGov = getOrInitGovernorMandate(govState);
    expect(baseGov.provinceId).toBe('CORDOBA');

    govState = applyPolicyAction(govState, { type: 'EXECUTE_ROLE_ACTION', actionId: 'LICITAR_OBRA_PROVINCIAL' });
    govState = applyPolicyAction(govState, { type: 'EXECUTE_ROLE_ACTION', actionId: 'EXIGIR_COPARTICIPACION_Y_ATN' });
    govState = advanceSimulationMonth(govState);
    expect(govState.governorMandate?.publicWorksExecutionPct).toBeGreaterThan(baseGov.publicWorksExecutionPct);
    expect(govState.governorMandate?.nationalProjectionIndex).toBeGreaterThan(baseGov.nationalProjectionIndex);

    let depState = createInitialSimulationState2027('DIPUTADO', 'ESTANDAR_2027', 'PBA');
    depState = applyPolicyAction(depState, { type: 'EXECUTE_ROLE_ACTION', actionId: 'PRESENTAR_PROYECTO_PROPIO' });
    depState = applyPolicyAction(depState, { type: 'EXECUTE_ROLE_ACTION', actionId: 'DISCURSO_ENCENDIDO_RECINTO' });
    depState = advanceSimulationMonth(depState);
    expect(depState.legislatorMandate?.chamber).toBe('DIPUTADOS');
    expect(depState.legislatorMandate?.authoredBillsSubmitted).toBe(1);

    let senState = createInitialSimulationState2027('SENADOR', 'ESTANDAR_2027', 'MENDOZA');
    const initSen = getOrInitLegislatorMandate(senState);
    expect(initSen.chamber).toBe('SENADO');
    senState = applyPolicyAction(senState, { type: 'EXECUTE_ROLE_ACTION', actionId: 'INTERPELAR_MINISTRO_O_PLIEGO' });
    senState = applyPolicyAction(senState, { type: 'EXECUTE_ROLE_ACTION', actionId: 'DEFENDER_PARTIDAS_PROVINCIALES' });
    expect(senState.legislatorMandate?.pliegosOrInterpelacionesCount).toBe(1);
    expect(senState.legislatorMandate?.territorialBackingPct).toBeGreaterThan(initSen.territorialBackingPct);
  });
});

