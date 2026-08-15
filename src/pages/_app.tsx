import "@/styles/globals.css";
import "@/styles/fixes.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";

const satoshi = localFont({
  src: "../styles/Fontes/Satoshi/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const integral = localFont({
  src: "../styles/Fontes/Integral_CF/Fontspring-DEMO-integralcf-bold.otf",
  variable: "--font-integral",
  weight: "700",
  display: "swap",
  fallback: ["Arial Black", "sans-serif"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${satoshi.variable} ${integral.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
