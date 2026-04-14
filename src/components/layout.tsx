import Header from "./header";

export default function Layout({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { role: string };
}) {
  return (
    <>
      <Header user={user} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <main>{children}</main>
      </div>
    </>
  );
}
