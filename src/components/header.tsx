import Link from "next/link";
import { useRouter } from "next/router";
import { Home, LogOut } from "lucide-react";
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
  const isAdminPage = router.pathname.includes("/admin");

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#1a1a1a]/80 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <Link
            href="/"
            aria-label="Home"
            className="rounded-md p-2 text-zinc-300 transition-colors hover:bg-[#3a3a3a] hover:text-white"
          >
            <Home size={20} />
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && !isAdminPage && (
              <Link
                href="/admin"
                className="rounded-md bg-[#303030] px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-[#3a3a3a] hover:text-white"
              >
                Admin
              </Link>
            )}
            {isLoggedIn && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-md bg-[#303030] px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-[#3a3a3a] hover:text-white"
              >
                <LogOut size={16} />
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
