import { AUTOMATION_STATUSES } from "@ureg/shared";
import { StatusBadge } from "../components/StatusBadge.js";

/** Overview (docs/plan.md §24). Data wiring arrives in Phase 2. */
export function AutomationsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Automations</h1>
      <p className="text-gray-600">
        No automations yet. Declare them in <code>automations.yaml</code> and run{" "}
        <code>ureg apply</code>.
      </p>
      <div className="flex flex-wrap gap-2">
        {AUTOMATION_STATUSES.map((s) => (
          <StatusBadge key={s} status={s} />
        ))}
      </div>
    </section>
  );
}
