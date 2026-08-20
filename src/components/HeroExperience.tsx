import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { chooseCapabilityTier, type CapabilityTier } from "@/lib/capability-tier";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

const fallbackGarments = [
  { src: "/assets/new-arrivals-1.png", className: "fashion-garment fashion-garment--a" },
  { src: "/assets/top-selling-1.png", className: "fashion-garment fashion-garment--b" },
  { src: "/assets/you-might-also-like-3.png", className: "fashion-garment fashion-garment--c" },
];

export default function HeroExperience() {
  const [tier, setTier] = useState<CapabilityTier>("A");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      const navigatorWithHints = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      setTier(chooseCapabilityTier({
        reducedMotion: reducedMotion.matches,
        saveData: Boolean(navigatorWithHints.connection?.saveData),
        width: window.innerWidth,
        dpr: window.devicePixelRatio,
        cores: navigator.hardwareConcurrency,
        memory: navigatorWithHints.deviceMemory,
      }));
    };

    sync();
    reducedMotion.addEventListener("change", sync);

    return () => {
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className={`hero-experience fashion-hero ${tier !== "A" ? "is-enhanced" : ""}`} data-capability-tier={tier} aria-hidden="true">
      <div className="fashion-rack-static">
        <span className="fashion-rack__rail" />
        <span className="fashion-rack__leg fashion-rack__leg--left" />
        <span className="fashion-rack__leg fashion-rack__leg--right" />
        {fallbackGarments.map((garment) => (
          <div className={garment.className} key={garment.src}>
            <span className="fashion-garment__hanger" />
            <Image src={garment.src} alt="" width={300} height={360} sizes="30vw" />
          </div>
        ))}
      </div>

      {tier !== "A" ? <HeroScene /> : null}

      <div className="hero-experience-meta">
        <span>Garment edit / 003</span>
        <span>SHOP.CO / digital rack</span>
      </div>
    </div>
  );
}
