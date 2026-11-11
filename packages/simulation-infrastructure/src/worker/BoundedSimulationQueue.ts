import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import { advanceSimulationMonth, applyPolicyAction } from '@argentina-sim/domain';

// Contrapresion (Backpressure) obligatoria: si el usuario aprieta velocidad 5x o spamea
// botones como loco, rechazamos tareas cuando la cola llega a MaxQueueSize para no reventar la RAM.

export type SimulationTask =
  | { kind: 'ADVANCE_MONTH' }
  | { kind: 'APPLY_ACTION'; action: PolicyAction };

export class BoundedSimulationQueue {
  private readonly maxQueueSize: number;
  private readonly queue: SimulationTask[] = [];

  constructor(maxQueueSize = 32) {
    this.maxQueueSize = maxQueueSize;
  }

  enqueue(task: SimulationTask): boolean {
    if (this.queue.length >= this.maxQueueSize) {
      return false;
    }
    this.queue.push(task);
    return true;
  }

  drainOnState(initialState: SimulationState): SimulationState {
    let current = initialState;
    while (this.queue.length > 0) {
      const nextTask = this.queue.shift()!;
      current =
        nextTask.kind === 'ADVANCE_MONTH'
          ? advanceSimulationMonth(current)
          : applyPolicyAction(current, nextTask.action);
    }
    return current;
  }

  pendingCount(): number {
    return this.queue.length;
  }
}

