import Link from "next/link";
import { useRouter } from "next/router";
import { authClient } from "@/lib/auth-client";

export default function Header({ user }: { user?: { role: string } }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const isLoggedIn = !!user || !!session;
  const isAdmin = user?.role === "admin" ||
    (session?.user as { role?: string } | undefined)?.role === "admin";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-zinc-900">
        dropoff
      </Link>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Admin
          </Link>
        )}
        {isLoggedIn && (
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
