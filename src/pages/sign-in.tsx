import { Geist } from "next/font/google";
import { authClient } from "@/lib/auth-client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Seo from "@/components/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  if (session && !isPending) {
    router.push("/");
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });


    if (error) {
      setError(error.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div
      className={`${geistSans.className} flex min-h-screen items-center justify-center bg-[#1a1a1a] font-sans`}
    >
      <Seo
        title="Sign in"
        description="Sign in to dropoff to manage your listings."
      />
      <main className="w-full max-w-sm px-6">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-white">
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-300">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-10 rounded-md bg-[#303030] px-3 text-sm text-white outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-300">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-10 rounded-md bg-[#303030] px-3 text-sm text-white outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </label>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 rounded-md bg-white text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-white"
          >
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
