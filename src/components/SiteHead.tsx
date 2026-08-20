import Head from "next/head";

type Props = { title: string; description: string; path: string };
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop-co-store.vercel.app").replace(/\/$/, "");

export default function SiteHead({ title, description, path }: Props) {
  const canonical = `${siteUrl}${path}`;
  const socialImage = `${siteUrl}/assets/main-couple.png`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="SHOP.CO" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:alt" content="SHOP.CO urban fashion journal cover" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={socialImage} />
    </Head>
  );
}
