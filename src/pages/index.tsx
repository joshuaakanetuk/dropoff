import Link from "next/link";
import StatusBadge from "@/components/status-badge";
import { InferSelectModel } from "drizzle-orm";
import { listing, listingImage } from "@/db/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

type ListingWithImages = InferSelectModel<typeof listing> & {
  pickupName: string;
  images: (InferSelectModel<typeof listingImage> & { url: string })[];
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return { redirect: { destination: "/sign-in", permanent: false } };
  }

  return {
    props: {
      user: { role: session.user.role ?? "user" },
    },
  };
};

export default function Home() {
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery<ListingWithImages[]>({
    queryKey: ["listings"],
    queryFn: () => fetch("/api/listings").then((r) => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete listing");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings"] }),
    onError: (err: Error) => alert(err.message),
  });

  function deleteListing(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    deleteMutation.mutate(id);
  }

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-zinc-500">Loading…</p>;
  }

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
