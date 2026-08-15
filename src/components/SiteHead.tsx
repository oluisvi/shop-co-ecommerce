import Head from "next/head";

type Props = { title: string; description: string; path: string };
const siteUrl = "https://shop-co-ecommerce-three.vercel.app";

export default function SiteHead({ title, description, path }: Props) {
  const canonical = `${siteUrl}${path}`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SHOP.CO" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${siteUrl}/assets/main-couple.png`} />
    </Head>
  );
}
