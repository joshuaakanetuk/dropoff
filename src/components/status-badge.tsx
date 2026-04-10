const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  accepted: "bg-purple-100 text-purple-700",
  picked_up: "bg-yellow-100 text-yellow-700",
  listed: "bg-orange-100 text-orange-700",
  sold: "bg-green-100 text-green-700",
  unsold: "bg-zinc-100 text-zinc-600",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  accepted: "Accepted",
  picked_up: "Picked Up",
  listed: "Listed",
  sold: "Sold",
  unsold: "Unsold",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-600"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
