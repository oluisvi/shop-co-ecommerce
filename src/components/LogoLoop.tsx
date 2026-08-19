import Image from "next/image";

export default function LogoLoop({ brands }: { brands: string[] }) {
  const renderLogos = (hidden: boolean) => (
    <ul className="logo-loop__list" aria-hidden={hidden || undefined}>
      {brands.map((brand) => (
        <li key={`${hidden ? "copy" : "source"}-${brand}`}>
          <Image
            src={`/assets/${brand}.svg`}
            alt={hidden ? "" : brand === "calvin-klein" ? "Calvin Klein" : brand[0].toUpperCase() + brand.slice(1)}
            width={150}
            height={42}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="logo-loop" aria-label="Featured brands">
      <div className="logo-loop__track">
        {renderLogos(false)}
        {renderLogos(true)}
      </div>
    </div>
  );
}
