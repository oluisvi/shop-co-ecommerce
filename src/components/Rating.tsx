import { getStarStates } from "@/lib/rating";

export default function Rating({ value }: { value: number }) {
  const stars = getStarStates(value);

  return (
    <div className="rating" aria-label={`${value} out of 5 stars`}>
      <span className="rating-stars" aria-hidden="true">
        {stars.map((state, index) => (
          <span key={index} className={`rating-star rating-star--${state}`}>
            ★
          </span>
        ))}
      </span>
      <small>{value}/5</small>
    </div>
  );
}
