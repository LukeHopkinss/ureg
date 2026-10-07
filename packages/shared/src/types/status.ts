/**
 * Automation health status. Deterministic, small, and shared by the
 * reconciler, API, CLI, and dashboard. See docs/plan.md §5.
 */
export const AUTOMATION_STATUSES = [
  "HEALTHY",
  "MISSED",
  "MISSING",
  "STALE",
  "UNREGISTERED",
  "FAILING",
  "REMOVED",
  "UNKNOWN",
] as const;

export type AutomationStatus = (typeof AUTOMATION_STATUSES)[number];

/** Machine-readable reason stored alongside every computed status. */
export const STATUS_REASONS = [
  "EXECUTION_CURRENT",
  "MISSED_EXPECTED_EXECUTION",
  "SOURCE_NOT_OBSERVED",
  "DISCOVERED_NOT_DECLARED",
  "SDK_LEASE_EXPIRED",
  "RECENT_EXECUTION_FAILED",
  "INTENTIONALLY_REMOVED",
  "INSUFFICIENT_EVIDENCE",
] as const;

export type StatusReason = (typeof STATUS_REASONS)[number];

/** Plain-language copy for non-technical users. */
export const STATUS_COPY: Record<AutomationStatus, { label: string; description: string }> = {
  HEALTHY: { label: "Healthy", description: "Running normally." },
  MISSED: { label: "Missed", description: "This automation was expected to run but did not." },
  MISSING: {
    label: "Missing",
    description: "This automation is declared but cannot currently be found.",
  },
  STALE: { label: "Stale", description: "UReg has not seen this automation recently." },
  UNREGISTERED: {
    label: "Unregistered",
    description: "UReg discovered this automation, but it is not registered.",
  },
  FAILING: {
    label: "Failing",
    description: "This automation is running but recent executions are failing.",
  },
  REMOVED: { label: "Removed", description: "This automation was intentionally removed." },
  UNKNOWN: {
    label: "Unknown",
    description: "UReg does not yet have enough information to determine health.",
  },
};

/** Desired state: what the organization says should exist. */
export const DESIRED_STATES = ["declared", "not_declared", "removed"] as const;
export type DesiredState = (typeof DESIRED_STATES)[number];

/** Observed state: what UReg can independently see does exist. */
export const OBSERVED_STATES = ["observed", "not_observed", "unverifiable"] as const;
export type ObservedState = (typeof OBSERVED_STATES)[number];

/** Where an automation's record came from. */
export const SOURCE_TYPES = ["config", "manual", "github_actions", "python_sdk", "cli"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

/** Who controls the infrastructure fields of an automation (§28). */
export const MANAGED_BY = ["config", "dashboard", "integration"] as const;
export type ManagedBy = (typeof MANAGED_BY)[number];
