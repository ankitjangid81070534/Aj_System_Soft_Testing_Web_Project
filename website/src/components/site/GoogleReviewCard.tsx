import { MapPin, Star } from "lucide-react";

/**
 * Google Business Profile card: embedded map + one-click "Write a review".
 * The review link opens the profile with the reviews panel (`!9m1!1b1`) where
 * the visitor taps the stars and posts directly.
 */
const PLACE_NAME = "Ankit jangid software engineer ( AJS )";
const MAPS_URL =
  "https://www.google.com/maps/place/Ankit+jangid+software+engineer+(+AJS+)/@26.862318,75.9017122,17z/data=!4m8!3m7!1s0x396db97e41e9448b:0xf03fd987e7c5524d!8m2!3d26.8623132!4d75.9042871!9m1!1b1!16s%2Fg%2F11y89dlr97";
// Direct star-box link from Google Business Profile → "Ask for reviews" (g.page/r/...).
const REVIEW_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || MAPS_URL;
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(PLACE_NAME)}&ll=26.8623132,75.9042871&z=16&output=embed`;

export function GoogleReviewCard() {
  return (
    <section
      aria-labelledby="google-reviews"
      className="mt-14 overflow-hidden rounded-3xl border border-line bg-surface shadow-e1"
    >
      <div className="grid lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-brand-600 uppercase">
            <MapPin aria-hidden="true" className="h-4 w-4" />
            Find us on Google
          </p>
          <h2 id="google-reviews" className="text-lg font-semibold tracking-tight text-ink">
            Worked with us? Leave a Google review
          </h2>
          <p className="text-sm text-ink-muted">
            Search <strong className="text-ink">{PLACE_NAME}</strong> on Google Maps, or tap the
            button — the review page opens directly. Pick your stars and post in one click.
          </p>
          <div aria-hidden="true" className="flex gap-1 text-amber-400">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="h-6 w-6 fill-current" />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#1d5bbf] px-5 py-2.5 text-sm font-semibold text-white shadow-e1 transition hover:bg-[#174a9c]"
            >
              <Star aria-hidden="true" className="h-4 w-4 fill-current" />
              Write a Google review
            </a>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-50"
            >
              <MapPin aria-hidden="true" className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>
        </div>
        <iframe
          title={`${PLACE_NAME} on Google Maps`}
          src={MAP_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full border-0 lg:h-full lg:min-h-80"
        />
      </div>
    </section>
  );
}
