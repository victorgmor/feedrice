import { useEffect, useState } from "react";
import {
  CHROME_REVIEW_URL,
  FIREFOX_REVIEWS_URL,
  REVIEWS_JSON,
} from "@/lib/menu";

type Store = "firefox" | "chrome";

type ReviewRow = {
  id: string;
  score: number;
  body: string | null;
  created: string | null;
  name: string;
  url: string | null;
  store?: Store;
};

function stars(score: number) {
  const n = Math.max(0, Math.min(5, Math.round(score)));
  return `${"★".repeat(n)}${"☆".repeat(5 - n)}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function storeLabel(store?: Store) {
  if (store === "chrome") return "Chrome";
  if (store === "firefox") return "Firefox";
  return null;
}

export default function ReviewsPanel() {
  const [data, setData] = useState<{
    average: number | null;
    count: number;
    reviews: ReviewRow[];
  } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(REVIEWS_JSON, { signal: AbortSignal.timeout(12000) })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((payload) => {
        setData({
          average: typeof payload?.average === "number" ? payload.average : null,
          count: Number(payload?.count) || 0,
          reviews: Array.isArray(payload?.reviews) ? payload.reviews : [],
        });
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <p className="text-primary/60">
        Couldn’t load reviews.{" "}
        <a
          href={FIREFOX_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-primary"
        >
          Firefox
        </a>
        {" · "}
        <a
          href={CHROME_REVIEW_URL}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-primary"
        >
          Chrome
        </a>
        .
      </p>
    );
  }

  if (data == null) return <p className="text-primary/60">Loading…</p>;
  if (!data.reviews.length) {
    return <p className="text-primary/60">No reviews yet.</p>;
  }

  return (
    <div>
      <p className="font-mono text-xs font-medium uppercase text-primary/60">
        {data.average != null ? `${data.average.toFixed(1)} / 5` : "—"}
        {` · ${data.count} review${data.count === 1 ? "" : "s"} on Firefox and Chrome`}
      </p>
      <ol className="mt-8 divide-y divide-primary/10 border-y border-primary/10">
        {data.reviews.map((r) => {
          const store = storeLabel(r.store);
          return (
            <li key={r.id} className="py-6">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span
                  aria-label={`${r.score} out of 5`}
                  className="text-xl leading-none tracking-tight"
                >
                  {stars(r.score)}
                </span>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                  >
                    {r.name}
                  </a>
                ) : (
                  <span className="font-medium">{r.name}</span>
                )}
                {store && (
                  <span className="text-primary/40">{store}</span>
                )}
                {r.created && (
                  <span className="text-primary/40">{formatDate(r.created)}</span>
                )}
              </div>
              {r.body && <p className="mt-3 text-primary/60">{r.body}</p>}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 flex flex-wrap gap-4 text-sm">
        <a
          href={FIREFOX_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-primary"
        >
          Read all on Firefox →
        </a>
        <a
          href={CHROME_REVIEW_URL}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-primary"
        >
          Read all on Chrome →
        </a>
      </p>
    </div>
  );
}
