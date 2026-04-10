import Link from "next/link";
import { useRouter } from "next/router";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
      <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        dropoff
      </Link>
      <div className="flex items-center gap-4">
        {(session?.user as { role?: string } | undefined)?.role === "admin" && (
          <Link
            href="/admin"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Admin
          </Link>
        )}
        { session && (
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
