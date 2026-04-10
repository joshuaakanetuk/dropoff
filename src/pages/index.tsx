import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/status-badge";
import { InferSelectModel } from "drizzle-orm";
import { listing, listingImage } from "@/db/schema";

type ListingWithImages = InferSelectModel<typeof listing> & {
  pickupName: string;
  images: (InferSelectModel<typeof listingImage> & { url: string })[];
};

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/listings")
        .then((r) => r.json())
        .then((data) => {
          setListings(data);
          setLoading(false);
        });
    }
  }, [session]);

  async function deleteListing(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l.id !== id));
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to delete listing");
    }
  }

  if (isPending || loading) {
    return <p className="py-12 text-center text-sm text-zinc-500">Loading…</p>;
  }

  if (!session) return null;

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Listings</h1>
        <Link
          href="/listings/new"
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          List an Item
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            You haven&apos;t listed anything yet.
          </p>
          <Link
            href="/listings/new"
            className="mt-3 inline-block text-sm font-medium text-black underline"
          >
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4"
            >
              {listing.images[0] && (
                <img
                  src={listing.images[0].url}
                  alt=""
                  className="h-20 w-20 rounded-md object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium truncate">{listing.title}</p>
                  <StatusBadge status={listing.status} />
                </div>
                <p className="text-sm text-zinc-500 mt-0.5">
                  ${(listing.suggestedPrice / 100).toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-zinc-400">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                  {listing.status === "submitted" && (
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
