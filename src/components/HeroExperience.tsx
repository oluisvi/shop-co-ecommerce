import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setEnhanced(!reducedMotion.matches);
    };

    sync();
    reducedMotion.addEventListener("change", sync);

    return () => {
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className={`hero-experience fashion-hero ${enhanced ? "is-enhanced" : ""}`} aria-hidden="true">
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

      {enhanced ? <HeroScene /> : null}

      <div className="hero-experience-meta">
        <span>Garment edit / 003</span>
        <span>SHOP.CO / digital rack</span>
      </div>
    </div>
  );
}
