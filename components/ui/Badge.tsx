export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

export function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 uppercase tracking-wide">
      {label}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition?: string | null }) {
  const isReconditionne = condition === "reconditionne";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
        isReconditionne ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
      }`}
    >
      {isReconditionne ? "Reconditionné" : "Neuf"}
    </span>
  );
}

const DISPO_COLORS: Record<string, string> = {
  "24h": "bg-green-100 text-green-700",
  "48h": "bg-amber-100 text-amber-700",
  "72h": "bg-orange-100 text-orange-700",
};

export function DisponibiliteBadge({ disponibilite }: { disponibilite?: string | null }) {
  if (!disponibilite) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${DISPO_COLORS[disponibilite] ?? "bg-gray-100 text-gray-600"}`}>
      ⏱ {disponibilite}
    </span>
  );
}
