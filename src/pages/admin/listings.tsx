import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/status-badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Seo from "@/components/seo";
import { getAdminPageProps } from "@/lib/api-helpers";
import type { GetServerSideProps } from "next";

interface ListingImage {
  id: string;
  url: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  userName: string;
  userEmail: string;
  pickupName: string;
  pickupDate: string;
  condition: string;
  suggestedPrice: number;
  soldPrice: number | null;
  status: string;
  ebayListingId: string | null;
  ebayListingUrl: string | null;
  createdAt: string;
  images: ListingImage[];
}

const NEXT_STATUS: Record<string, string> = {
  submitted: "accepted",
  accepted: "picked_up",
  picked_up: "listed",
};

const ACTION_LABELS: Record<string, string> = {
  submitted: "Accept",
  accepted: "Mark Picked Up",
  picked_up: "Mark Listed",
};

const PAGE_SIZE = 20;

export default function AdminListings() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["admin", "listings", filter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      return fetch(`/api/admin/listings?${params}`).then((r) => r.json());
    },
    enabled: !!session,
  });

  function rejectListing(id: string) {
    if (!confirm("Reject this listing?")) return;
    patchMutation.mutate({ id, body: { status: "rejected" } });
  }

  const patchMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, string> }) => {
      await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "listings"] }),
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  function advanceStatus(id: string, currentStatus: string) {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;
    patchMutation.mutate({ id, body: { status: nextStatus } });
  }

  function markSold(id: string) {
    const price = prompt("Sale price ($):");
    if (!price) return;
    patchMutation.mutate({ id, body: { status: "sold", soldPrice: price } });
  }

  function markUnsold(id: string) {
    patchMutation.mutate({ id, body: { status: "unsold" } });
  }

  if (isPending || isLoading) {
    return <p className="py-12 text-center text-sm text-zinc-400">Loading…</p>;
  }

  if (!session) return null;

  const filtered = listings.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !l.title.toLowerCase().includes(q) &&
        !l.userName.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div className="py-8">
      <Seo title="All Listings · Admin" noIndex />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-white">All Listings</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-md bg-[#303030]py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-zinc-500 w-48"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md bg-[#303030] px-3 py-1.5 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="rejected">Rejected</option>
          <option value="accepted">Accepted</option>
          <option value="picked_up">Picked Up</option>
          <option value="listed">Listed</option>
          <option value="sold">Sold</option>
          <option value="unsold">Unsold</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className="text-sm text-zinc-500">
          {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
        </span>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <p className="text-sm text-zinc-400">No listings found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-[#303030]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Item</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">User</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Pickup Date</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Price</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {listing.images[0] && (
                        <img
                          src={listing.images[0].url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{listing.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {listing.userName}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {new Date(listing.pickupDate).toLocaleDateString(undefined, { timeZone: "UTC" })}
                  </td>
                  <td className="px-4 py-3">
                    ${(listing.suggestedPrice / 100).toFixed(2)}
                    {listing.soldPrice != null && (
                      <span className="ml-1 text-green-400">
                        (sold ${(listing.soldPrice / 100).toFixed(2)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={listing.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {ACTION_LABELS[listing.status] && (
                        <button
                          onClick={() =>
                            advanceStatus(listing.id, listing.status)
                          }
                          className="text-xs font-medium text-white underline hover:text-zinc-300"
                        >
                          {ACTION_LABELS[listing.status]}
                        </button>
                      )}

                      {listing.status === "submitted" && (
                        <button
                          onClick={() => rejectListing(listing.id)}
                          className="text-xs font-medium text-red-400 underline hover:text-red-300"
                        >
                          Reject
                        </button>
                      )}

                      {listing.status === "listed" && (
                        <>
                          {listing.ebayListingUrl && (
                            <a
                              href={listing.ebayListingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-400 underline hover:text-blue-300"
                            >
                              View on eBay
                            </a>
                          )}
                          <button
                            onClick={() => markSold(listing.id)}
                            className="text-xs font-medium text-green-400 underline hover:text-green-300"
                          >
                            Sold
                          </button>
                          <button
                            onClick={() => markUnsold(listing.id)}
                            className="text-xs font-medium text-zinc-400 underline hover:text-zinc-300"
                          >
                            Unsold
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
          <span>
            Page {safePage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-md bg-[#303030] px-2.5 py-1 text-white hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &lsaquo;
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-md bg-[#303030] px-2.5 py-1 text-white hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &rsaquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = getAdminPageProps;
