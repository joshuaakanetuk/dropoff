import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo";
import { getAdminPageProps } from "@/lib/api-helpers";
import type { GetServerSideProps } from "next";

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
    return <p className="py-12 text-center text-sm text-zinc-400">Loading…</p>;
  }

  if (!session) return null;

  return (
    <div className="py-8">
      <Seo title="Admin" noIndex />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Admin</h1>
      </div>

      {/* Bento grid */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="row-span-2 flex flex-col items-center justify-center rounded-lg bg-[#303030] p-6 text-center">
            <p className="text-5xl font-bold text-white">{stats.submitted}</p>
            <p className="mt-2 text-sm text-zinc-400">Pending Review</p>
          </div>
          <div className="rounded-lg bg-[#303030] p-4 text-center">
            <p className="text-3xl font-semibold text-white">{stats.listed}</p>
            <p className="mt-1 text-xs text-zinc-400">Listed</p>
          </div>
          <div className="rounded-lg bg-[#303030] p-4 text-center">
            <p className="text-3xl font-semibold text-white">{stats.sold}</p>
            <p className="mt-1 text-xs text-zinc-400">Sold</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/listings"
          className="flex items-center justify-between rounded-lg bg-[#303030] p-5 hover:bg-[#3a3a3a]"
        >
          <div>
            <p className="font-medium text-white">Listings</p>
            <p className="text-sm text-zinc-400">
              View and manage all item listings
            </p>
          </div>
          <span className="text-zinc-500">&rarr;</span>
        </Link>
        <Link
          href="/admin/pickup-dates"
          className="flex items-center justify-between rounded-lg bg-[#303030] p-5 hover:bg-[#3a3a3a]"
        >
          <div>
            <p className="font-medium text-white">Pickup Dates</p>
            <p className="text-sm text-zinc-400">
              Create and manage pickup schedules
            </p>
          </div>
          <span className="text-zinc-500">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = getAdminPageProps;
