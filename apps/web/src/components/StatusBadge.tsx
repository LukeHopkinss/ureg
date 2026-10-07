import { STATUS_COPY, type AutomationStatus } from "@ureg/shared";

const tone: Record<AutomationStatus, string> = {
  HEALTHY: "bg-green-100 text-green-800",
  MISSED: "bg-amber-100 text-amber-800",
  MISSING: "bg-red-100 text-red-800",
  STALE: "bg-amber-100 text-amber-800",
  UNREGISTERED: "bg-blue-100 text-blue-800",
  FAILING: "bg-red-100 text-red-800",
  REMOVED: "bg-gray-100 text-gray-600",
  UNKNOWN: "bg-gray-100 text-gray-600",
};

export function StatusBadge({ status }: { status: AutomationStatus }) {
  const copy = STATUS_COPY[status];
  return (
    <span
      title={copy.description}
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone[status]}`}
    >
      {copy.label}
    </span>
  );
}
