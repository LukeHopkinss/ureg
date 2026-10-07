import { CronExpressionParser } from "cron-parser";

export function isValidCron(expression: string): boolean {
  try {
    CronExpressionParser.parse(expression, { tz: "UTC" });
    return true;
  } catch {
    return false;
  }
}
