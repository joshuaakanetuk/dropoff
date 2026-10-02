import { useRouter } from "next/router";
import Header from "./header";

const AUTH_ROUTES = new Set(["/sign-in", "/sign-up"]);

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useRouter();

  if (AUTH_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <main>{children}</main>
      </div>
    </>
  );
}
