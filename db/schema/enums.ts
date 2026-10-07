import { pgEnum } from "drizzle-orm/pg-core";
import {
  AUTOMATION_STATUSES,
  DESIRED_STATES,
  EXECUTION_STATUSES,
  MANAGED_BY,
  MEMBER_ROLES,
  OBSERVED_STATES,
  SOURCE_TYPES,
  STATUS_REASONS,
} from "@ureg/shared";

export const memberRole = pgEnum("member_role", MEMBER_ROLES);
export const automationStatus = pgEnum("automation_status", AUTOMATION_STATUSES);
export const statusReason = pgEnum("status_reason", STATUS_REASONS);
export const desiredState = pgEnum("desired_state", DESIRED_STATES);
export const observedState = pgEnum("observed_state", OBSERVED_STATES);
export const sourceType = pgEnum("source_type", SOURCE_TYPES);
export const managedBy = pgEnum("managed_by", MANAGED_BY);
export const executionStatus = pgEnum("execution_status", EXECUTION_STATUSES);
