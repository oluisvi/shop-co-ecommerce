export default function Rating({ value }: { value: number }) {
  return <div className="rating" aria-label={`${value} out of 5 stars`}><span aria-hidden="true">★★★★★</span><small>{value}/5</small></div>;
}
