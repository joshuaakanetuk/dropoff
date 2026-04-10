import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Pickup {
  id: string;
  name: string;
  pickupDate: string;
  status: string;
}

const MAX_IMAGE_COUNT = 16;

export default function NewListing() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    condition: "",
    pickupId: "",
    suggestedPrice: "",
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/pickup-dates")
        .then((r) => r.json())
        .then((data) =>
          setPickups(
            (data as Pickup[]).filter((p: Pickup) => p.status === "open")
          )
        );
    }
  }, [session]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const total = files.length + selected.length;
    if (total > MAX_IMAGE_COUNT) {
      setError(`Maximum ${MAX_IMAGE_COUNT} images allowed`);
      return;
    }
    setError("");
    const newFiles = [...files, ...selected].slice(0, MAX_IMAGE_COUNT);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(index: number) {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (files.length === 0) {
      setError("Please add at least one photo");
      return;
    }

    setSubmitting(true);

    try {
      // Create the listing first
      const listingRes = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!listingRes.ok) {
        const data = await listingRes.json();
        setError(data.error || "Failed to create listing");
        setSubmitting(false);
        return;
      }

      const listing = await listingRes.json();

      // Upload images
      const formData = new FormData();
      formData.append("listingId", listing.id);
      files.forEach((f) => formData.append("file", f));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        setError("Listing created but image upload failed");
        setSubmitting(false);
        return;
      }

      router.push("/");
    } catch {
      setError("Something went wrong");
      setSubmitting(false);
    }
  }

  if (isPending) {
    return <p className="py-12 text-center text-sm text-zinc-500">Loading…</p>;
  }

  if (!session) return null;

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        List an Item
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Photos ({files.length}/{MAX_IMAGE_COUNT})
          </label>
          <div className="flex gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative h-24 w-24">
                <img
                  src={src}
                  alt=""
                  className="h-24 w-24 rounded-md object-cover border border-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                >
                  x
                </button>
              </div>
            ))}
            {files.length < MAX_IMAGE_COUNT && (
              <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-zinc-300 text-zinc-400 hover:border-zinc-400">
                <span className="text-2xl">+</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What are you selling?"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the item..."
            rows={3}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            required
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Condition
          </label>
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Select condition</option>
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        {/* Pickup Date */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Pickup Date
          </label>
          {pickups.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No open pickup dates available right now.
            </p>
          ) : (
            <select
              value={form.pickupId}
              onChange={(e) => setForm({ ...form, pickupId: e.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              required
            >
              <option value="">Select a pickup date</option>
              {pickups.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Pickup{" "}
                  {new Date(p.pickupDate).toLocaleDateString(undefined, { timeZone: "UTC" })}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Suggested Price ($)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={form.suggestedPrice}
            onChange={(e) =>
              setForm({ ...form, suggestedPrice: e.target.value })
            }
            placeholder="25.00"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            required
          />
          <small className="text-xs text-zinc-500">
            This is just a suggestion. The final price will be determined by the
            buyer.
          </small>
        </div>

        <button
          type="submit"
          disabled={submitting || pickups.length === 0}
          className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Listing"}
        </button>
      </form>
    </div>
  );
}
