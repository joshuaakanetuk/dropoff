import Header from "./header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <main>{children}</main>
      </div>
    </>
  );
}
