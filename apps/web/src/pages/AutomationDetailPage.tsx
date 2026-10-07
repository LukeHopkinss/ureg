import { useParams } from "react-router";

/** Automation detail (docs/plan.md §25). Business info above technical details. */
export function AutomationDetailPage() {
  const { id } = useParams();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{id}</h1>
      <p className="text-gray-600">Automation details will appear here.</p>
    </section>
  );
}
