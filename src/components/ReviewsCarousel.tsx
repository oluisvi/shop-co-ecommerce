import { useEffect, useState } from "react";
import type { Review } from "@/types/store";
import Rating from "./Rating";
import { ArrowIcon } from "./Icons";

export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const [interactionPause, setInteractionPause] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (
      reviews.length < 2 ||
      manualPause ||
      interactionPause ||
      reducedMotion
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % reviews.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [interactionPause, manualPause, reducedMotion, reviews.length]);

  if (!reviews.length) return null;

  const goTo = (index: number) => {
    const normalized = (index + reviews.length) % reviews.length;
    setActive(normalized);
  };

  return (
    <section
      className="review-carousel"
      aria-roledescription="carousel"
      aria-label="Customer reviews"
      onPointerEnter={() => setInteractionPause(true)}
      onPointerLeave={() => setInteractionPause(false)}
      onFocus={() => setInteractionPause(true)}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          setInteractionPause(false);
        }
      }}
    >
      <div className="review-carousel__viewport">
        <div
          className="review-carousel__track"
          style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
        >
          {reviews.map((review, index) => (
            <article
              className="review-carousel__slide"
              key={review.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${reviews.length}`}
            >
              <blockquote className="review-carousel__quote">
                “{review.quote}”
              </blockquote>

              <div className="review-carousel__meta">
                <Rating value={review.rating} />
                <div>
                  <strong>{review.author}</strong>
                  <span>Verified customer</span>
                </div>
                <span className="review-carousel__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="review-carousel__controls">
        <div className="review-carousel__buttons">
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous review">
            <span className="review-carousel__arrow review-carousel__arrow--prev" aria-hidden="true">
              <ArrowIcon />
            </span>
          </button>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Next review">
            <span className="review-carousel__arrow" aria-hidden="true">
              <ArrowIcon />
            </span>
          </button>
        </div>

        <div className="review-carousel__dots" aria-label="Choose review">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              className={index === active ? "is-active" : ""}
              aria-label={`Show review ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>

        <button
          className="review-carousel__pause"
          type="button"
          aria-pressed={manualPause || reducedMotion}
          disabled={reducedMotion}
          onClick={() => setManualPause((value) => !value)}
        >
          {reducedMotion ? "Motion reduced" : manualPause ? "Play" : "Pause"}
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        Review {active + 1} of {reviews.length}
      </p>
    </section>
  );
}
