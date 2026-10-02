import Link from "next/link";
import { useRouter } from "next/router";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetch("/api/auth/me").then((r) => r.json()),
    enabled: !!session,
  });

  const isLoggedIn = !!session;
  const isAdmin = me?.role === "admin";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-white">
        dropoff
      </Link>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="text-sm text-zinc-300 hover:text-white"
          >
            Admin
          </Link>
        )}
        {isLoggedIn && (
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-300 hover:text-white"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
