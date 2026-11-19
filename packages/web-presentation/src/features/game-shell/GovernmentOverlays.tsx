import React from 'react';
import {
  countAlliedDeputiesForVeto,
  describeEventEffects,
  findGovernmentEvent,
  getGovernmentRuntime,
  type GovernmentEventDefinition,
  type GovernmentEventOption,
  type PolicyAction,
  type SimulationState
} from '@argentina-sim/domain';

import { NewspaperEventModal } from '../events-newspaper/NewspaperEventModal.js';
import { MidtermElection2029Modal } from './MidtermElection2029Modal.js';
import { MandateEndModal } from './MandateEndModal.js';
import { DebtMilestoneModal } from './DebtMilestoneModal.js';
import { OppositionBillModal } from './OppositionBillModal.js';

// Capas que se montan por encima del tablero de gobierno: Fin de Mandato histórico,
// Legislativas 2029, Megavencimientos de Deuda/FMI y Situaciones de Gobierno en tapa de diario.

function GovernmentEventModal({
  event,
  monthLabel,
  onChoose
}: {
  event: GovernmentEventDefinition;
  monthLabel: string;
  onChoose: (optionId: string) => void;
}) {
  const options = event.options.map((o: GovernmentEventOption) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    badges: describeEventEffects(o.effects)
  }));

  return (
    <NewspaperEventModal
      eventId={event.id}
      category={event.category}
      dateLabel={monthLabel}
      title={event.title}
      description={event.description}
      footerLeft="EXPEDIENTE URGENTE · REQUIERE RESOLUCIÓN PRESIDENCIAL"
      footerRight="EL MES NO AVANZA HASTA DECIDIR"
      ctaLabel="Ejecutar decisión"
      options={options}
      onChoose={onChoose}
    />
  );
}

interface GovernmentOverlaysProps {
  state: SimulationState;
  monthLabel: string;
  onChooseEventOption: (optionId: string) => void;
  onDispatch?: (action: PolicyAction) => void;
  onExitToMenu: () => void;
}

function shouldShowMidtermModal(state: SimulationState, onDispatch?: (action: PolicyAction) => void): boolean {
  const m = state.midterm2029Result;
  return Boolean(m && !m.dismissed && onDispatch);
}

function renderOppositionBillOverlay(
  state: SimulationState,
  onDispatch?: (action: PolicyAction) => void
): React.ReactNode {
  if (!state.pendingOppositionBill || !onDispatch) return null;
  return (
    <OppositionBillModal
      bill={state.pendingOppositionBill}
      alliedDeputies={countAlliedDeputiesForVeto(state)}
      onResolve={(resolution) => onDispatch({ type: 'RESOLVE_OPPOSITION_BILL', resolution })}
    />
  );
}

function renderInteractiveMilestoneOverlay(
  state: SimulationState,
  onDispatch?: (action: PolicyAction) => void
): React.ReactNode {
  if (shouldShowMidtermModal(state, onDispatch)) {
    return (
      <MidtermElection2029Modal
        result={state.midterm2029Result!}
        onDismiss={() => onDispatch!({ type: 'DISMISS_MIDTERM_MODAL' })}
      />
    );
  }
  if (state.pendingDebtMilestone && onDispatch) {
    return (
      <DebtMilestoneModal
        milestone={state.pendingDebtMilestone}
        netReservesUsdB={state.centralBank.netLiquidReservesBillionUsd}
        countryRiskPb={state.countryRiskEmbiPb}
        onChoose={(option) => onDispatch({ type: 'RESOLVE_DEBT_MILESTONE', option })}
      />
    );
  }
  return renderOppositionBillOverlay(state, onDispatch);
}

export function GovernmentOverlays({
  state,
  monthLabel,
  onChooseEventOption,
  onDispatch,
  onExitToMenu
}: GovernmentOverlaysProps) {
  const gov = getGovernmentRuntime(state);
  if (gov.mandateStatus !== 'EN_CURSO') {
    return (
      <MandateEndModal
        state={state}
        status={gov.mandateStatus}
        onStartReelection={onDispatch ? () => onDispatch({ type: 'START_REELECTION_TERM' }) : undefined}
        onExitToMenu={onExitToMenu}
      />
    );
  }
  const milestoneModal = renderInteractiveMilestoneOverlay(state, onDispatch);
  if (milestoneModal) return milestoneModal;
  const event = findGovernmentEvent(gov.pendingEventId);
  return event ? <GovernmentEventModal event={event} monthLabel={monthLabel} onChoose={onChooseEventOption} /> : null;
}
