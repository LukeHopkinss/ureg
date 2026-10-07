import type { AutomationStatus, StatusReason } from "@ureg/shared";

/**
 * Pure, deterministic status evaluation (docs/plan.md §19).
 *
 * Scaffold only: handles the state-presence cases. Schedule/grace-window logic
 * (MISSED, STALE) and execution evidence (FAILING) arrive in Phase 4.
 */
export interface EvaluationInput {
  declared: boolean;
  observed: boolean;
  removed: boolean;
  now: Date;
}

export interface EvaluationResult {
  status: AutomationStatus;
  reason: StatusReason;
}

export function evaluate(input: EvaluationInput): EvaluationResult {
  if (input.removed) return { status: "REMOVED", reason: "INTENTIONALLY_REMOVED" };
  if (input.declared && !input.observed)
    return { status: "MISSING", reason: "SOURCE_NOT_OBSERVED" };
  if (!input.declared && input.observed) {
    return { status: "UNREGISTERED", reason: "DISCOVERED_NOT_DECLARED" };
  }
  return { status: "UNKNOWN", reason: "INSUFFICIENT_EVIDENCE" };
}
