import Head from "next/head";
import { useRouter } from "next/router";

const SITE_NAME = "dropoff";
const DEFAULT_TITLE = "dropoff — sell your stuff";
const DEFAULT_DESCRIPTION =
  "Drop off your stuff and we'll list, sell, and ship it for you.";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "";
const DEFAULT_OG_IMAGE = "/api/og";

type SeoProps = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
};

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: SeoProps) {
  const { asPath } = useRouter();
  const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
  const url = SITE_URL ? `${SITE_URL}${asPath.split("?")[0]}` : undefined;
  const absoluteImage = image.startsWith("http")
    ? image
    : SITE_URL
    ? `${SITE_URL}${image}`
    : image;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {url && <link rel="canonical" href={url} />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {url && <meta property="og:url" content={url} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
    </Head>
  );
}
