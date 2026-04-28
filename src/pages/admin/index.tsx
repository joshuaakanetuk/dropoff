import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo";

interface Stats {
  submitted: number;
  accepted: number;
  picked_up: number;
  listed: number;
  sold: number;
  unsold: number;
}

export default function Admin() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin", "listings-stats"],
    queryFn: () =>
      fetch("/api/admin/listings")
        .then((r) => r.json())
        .then((listings: Array<{ status: string }>) => {
          const s: Stats = {
            submitted: 0,
            accepted: 0,
            picked_up: 0,
            listed: 0,
            sold: 0,
            unsold: 0,
          };
          listings.forEach((l) => {
            if (l.status in s) s[l.status as keyof Stats]++;
          });
          return s;
        }),
    enabled: !!session,
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  if (isPending) {
    return <p className="py-12 text-center text-sm text-zinc-500">Loading…</p>;
  }

  if (!session) return null;

  return (
    <div className="py-8">
      <Seo title="Admin" noIndex />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <button
          onClick={handleSignOut}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Sign out
        </button>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
            <p className="text-2xl font-semibold">{stats.submitted}</p>
            <p className="text-xs text-zinc-500">Pending Review</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
            <p className="text-2xl font-semibold">{stats.listed}</p>
            <p className="text-xs text-zinc-500">Listed</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
            <p className="text-2xl font-semibold">{stats.sold}</p>
            <p className="text-xs text-zinc-500">Sold</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="space-y-3">
        <Link
          href="/admin/listings"
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div>
            <p className="font-medium">Listings</p>
            <p className="text-sm text-zinc-500">
              View and manage all item listings
            </p>
          </div>
          <span className="text-zinc-400">&rarr;</span>
        </Link>
        <Link
          href="/admin/pickup-dates"
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div>
            <p className="font-medium">Pickup Dates</p>
            <p className="text-sm text-zinc-500">
              Create and manage pickup schedules
            </p>
          </div>
          <span className="text-zinc-400">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
