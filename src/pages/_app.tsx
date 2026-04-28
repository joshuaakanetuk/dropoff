import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout";
import Seo from "@/components/seo";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const { user, ...rest } = pageProps;

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Seo />
      <Layout user={user}>
        <Component {...rest} />
      </Layout>
    </QueryClientProvider>
  );
}
