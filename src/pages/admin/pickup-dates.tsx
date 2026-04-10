import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Pickup {
  id: string;
  name: string;
  pickupDate: string;
  status: string;
  createdAt: string;
}

export default function AdminPickupDates() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    pickupDate: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      fetchPickups();
    }
  }, [session]);

  async function fetchPickups() {
    const res = await fetch("/api/admin/pickup-dates");
    if (res.ok) {
      setPickups(await res.json());
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/pickup-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create pickup date");
      return;
    }

    setForm({ name: "", pickupDate: "" });
    setShowForm(false);
    fetchPickups();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/admin/pickup-dates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchPickups();
  }

  if (isPending || loading) {
    return <p className="py-12 text-center text-sm text-zinc-500">Loading…</p>;
  }

  if (!session) return null;

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Pickup Dates
      </h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-zinc-400">
          {pickups.length} {pickups.length === 1 ? "date" : "dates"}
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <span>+</span> {showForm ? "Cancel" : "Add date"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-4 rounded-lg border border-zinc-200 bg-white p-4 space-y-4"
        >
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., March Week 3 Pickup"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Pickup Date
            </label>
            <input
              type="date"
              value={form.pickupDate}
              onChange={(e) =>
                setForm({ ...form, pickupDate: e.target.value })
              }
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create Pickup Date
          </button>
        </form>
      )}

      {pickups.length === 0 ? (
        <p className="text-sm text-zinc-500">No pickup dates yet. Create one to get started.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Pickup Date</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 last:border-b-0">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {new Date(p.pickupDate).toLocaleDateString(undefined, { timeZone: "UTC" })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "open"
                          ? "bg-green-100 text-green-700"
                          : p.status === "closed"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "open" && (
                      <button
                        onClick={() => handleStatusChange(p.id, "closed")}
                        className="text-xs font-medium text-black underline hover:text-zinc-600"
                      >
                        Close
                      </button>
                    )}
                    {p.status === "closed" && (
                      <button
                        onClick={() => handleStatusChange(p.id, "completed")}
                        className="text-xs font-medium text-black underline hover:text-zinc-600"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
