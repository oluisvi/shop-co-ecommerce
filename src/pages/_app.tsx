import "@/styles/globals.css";
import "@/styles/fixes.css";
import "@/styles/experience.css";
import "@/styles/phase2.css";
import "@/styles/polish.css";
import "@/styles/phase3.css";
import type { AppProps } from "next/app";
import { Bodoni_Moda } from "next/font/google";
import localFont from "next/font/local";
import { CommerceProvider } from "@/context/CommerceContext";

const satoshi = localFont({ src: "../styles/Fontes/Satoshi/Satoshi-Variable.woff2", variable: "--font-satoshi", display: "swap", fallback: ["Arial", "sans-serif"] });
const integral = localFont({ src: "../styles/Fontes/Integral_CF/Fontspring-DEMO-integralcf-bold.otf", variable: "--font-integral", weight: "700", display: "swap", fallback: ["Arial Black", "sans-serif"] });
const bodoni = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-bodoni", display: "swap" });
export default function App({ Component, pageProps }: AppProps) {
  return <CommerceProvider><div className={`${satoshi.variable} ${integral.variable} ${bodoni.variable}`}><Component {...pageProps} /></div></CommerceProvider>;
}
