import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <title>dropoff - Sell your stuff</title>
      </Head>
      <body className="antialiased bg-zinc-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
