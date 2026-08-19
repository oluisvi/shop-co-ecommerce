import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

export default function HeroExperience() {
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setEnhanced(desktop.matches && !reducedMotion.matches);
    };

    sync();
    desktop.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className={`hero-experience ${enhanced ? "is-enhanced" : ""}`} aria-hidden="true">
      <div className="hero-art-static">
        <span className="hero-art-orbit hero-art-orbit--a" />
        <span className="hero-art-orbit hero-art-orbit--b" />
        <span className="hero-art-core" />
        <span className="hero-art-line hero-art-line--a" />
        <span className="hero-art-line hero-art-line--b" />
      </div>

      {enhanced ? <HeroScene /> : null}

      <div className="hero-experience-meta">
        <span>Object 001</span>
        <span>SHOP.CO / motion study</span>
      </div>
    </div>
  );
}
