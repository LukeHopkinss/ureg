export const EXECUTION_STATUSES = ["started", "success", "failed", "cancelled", "unknown"] as const;
export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];
