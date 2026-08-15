export default function SectionHeader({ index, label, title }: { index: string; label: string; title: string }) {
  return <header className="section-header"><div><span>{index}</span><p>{label}</p></div><h2>{title}</h2></header>;
}
