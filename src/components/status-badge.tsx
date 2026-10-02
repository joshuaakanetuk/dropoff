const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-900/40 text-blue-300",
  accepted: "bg-purple-900/40 text-purple-300",
  picked_up: "bg-yellow-900/40 text-yellow-300",
  listed: "bg-orange-900/40 text-orange-300",
  sold: "bg-green-900/40 text-green-300",
  unsold: "bg-zinc-700/40 text-zinc-300",
  rejected: "bg-red-900/40 text-red-300",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  accepted: "Accepted",
  picked_up: "Picked Up",
  listed: "Listed",
  sold: "Sold",
  unsold: "Unsold",
  rejected: "Rejected",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-zinc-700/40 text-zinc-300"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
