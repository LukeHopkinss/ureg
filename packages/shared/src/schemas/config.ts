import { z } from "zod";
import { isValidCron } from "../validation/cron.js";

/**
 * Schema for `automations.yaml` (docs/plan.md §12).
 *
 * Structured data only: no field may ever execute a command (§31 CLI safety).
 */
export const STABLE_KEY_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export const automationConfigSchema = z.strictObject({
  id: z
    .string()
    .regex(STABLE_KEY_PATTERN, "id must be lowercase letters, numbers, and dashes (max 64 chars)"),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  owner: z.string().min(1).max(200).optional(),
  schedule: z
    .string()
    .refine(isValidCron, { message: "schedule must be a valid cron expression" })
    .optional(),
  environment: z.string().min(1).max(100).optional(),
});

export const automationsFileSchema = z
  .strictObject({
    version: z.literal(1),
    automations: z.array(automationConfigSchema),
  })
  .superRefine((file, ctx) => {
    const seen = new Set<string>();
    file.automations.forEach((automation, index) => {
      if (seen.has(automation.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["automations", index, "id"],
          message: `duplicate id "${automation.id}"`,
        });
      }
      seen.add(automation.id);
    });
  });

export type AutomationConfig = z.infer<typeof automationConfigSchema>;
export type AutomationsFile = z.infer<typeof automationsFileSchema>;
