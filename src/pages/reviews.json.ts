import type { APIRoute } from "astro";
import { CHROME_ITEM_ID } from "@/lib/menu";

export const prerender = false;

const SLUG = "sort-download-instagram-tiktok";
const AMO = "https://addons.mozilla.org/api/v5";
const AMO_HEADERS = {
  Accept: "application/json",
  "User-Agent": "feedrice-site/1.0 (+https://github.com/victorgmor/feedrice)",
};
const CWS_HEADERS = {
  Accept: "text/html",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Cookie: "SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_L3UBg",
};

type Store = "firefox" | "chrome";

type ReviewRow = {
  id: string;
  score: number;
  body: string | null;
  created: string | null;
  name: string;
  url: string | null;
  store: Store;
};

type StoreBundle = {
  average: number | null;
  count: number;
  reviews: ReviewRow[];
};

type AmoRating = {
  id?: number;
  score?: number;
  body?: string | null;
  created?: string;
  is_deleted?: boolean;
  user?: { name?: string; url?: string };
};

function empty(): StoreBundle {
  return { average: null, count: 0, reviews: [] };
}

function unixPairToIso(pair: unknown): string | null {
  if (!Array.isArray(pair) || typeof pair[0] !== "number") return null;
  const ms = pair[0] * 1000 + (typeof pair[1] === "number" ? pair[1] / 1e6 : 0);
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseAfData(html: string, key: string): unknown | null {
  const marker = `AF_initDataCallback({key: '${key}'`;
  const start = html.indexOf(marker);
  if (start < 0) return null;
  const dataAt = html.indexOf("data:", start);
  const sideAt = html.indexOf(", sideChannel", dataAt);
  if (dataAt < 0 || sideAt < 0) return null;
  try {
    return JSON.parse(html.slice(dataAt + 5, sideAt));
  } catch {
    return null;
  }
}

async function firefoxReviews(): Promise<StoreBundle> {
  const [addonRes, ratingsRes] = await Promise.all([
    fetch(`${AMO}/addons/addon/${SLUG}/`, { headers: AMO_HEADERS }),
    fetch(`${AMO}/ratings/rating/?addon=${SLUG}&page_size=50`, {
      headers: AMO_HEADERS,
    }),
  ]);
  if (!addonRes.ok || !ratingsRes.ok) throw new Error("amo");

  const addon = (await addonRes.json()) as {
    ratings?: { average?: number; count?: number };
  };
  const ratings = (await ratingsRes.json()) as { results?: AmoRating[] };

  const reviews = (ratings.results ?? [])
    .filter((r) => !r.is_deleted && typeof r.score === "number")
    .map((r) => ({
      id: `firefox:${r.id ?? ""}`,
      score: Number(r.score),
      body: typeof r.body === "string" && r.body.trim() ? r.body.trim() : null,
      created: typeof r.created === "string" ? r.created : null,
      name: String(r.user?.name ?? "Firefox user"),
      url: typeof r.user?.url === "string" ? r.user.url : null,
      store: "firefox" as const,
    }))
    .filter((r) => r.id !== "firefox:");

  return {
    average:
      typeof addon.ratings?.average === "number" ? addon.ratings.average : null,
    count:
      typeof addon.ratings?.count === "number"
        ? addon.ratings.count
        : reviews.length,
    reviews,
  };
}

async function chromeReviews(): Promise<StoreBundle> {
  const res = await fetch(
    `https://chromewebstore.google.com/detail/${CHROME_ITEM_ID}/reviews?hl=en&gl=US`,
    { headers: CWS_HEADERS, redirect: "follow" },
  );
  if (!res.ok) throw new Error("cws");
  const html = await res.text();
  const data = parseAfData(html, "ds:1");
  if (!Array.isArray(data)) return empty();

  const rows = Array.isArray(data[1]) ? data[1] : [];
  const listed =
    typeof data[2] === "number" && data[2] > 0 ? data[2] : rows.length;

  const reviews: ReviewRow[] = [];
  for (const row of rows) {
    if (!Array.isArray(row) || typeof row[0] !== "string") continue;
    if (typeof row[2] !== "number") continue;
    const author = Array.isArray(row[1]) ? row[1] : [];
    const body = typeof row[3] === "string" && row[3].trim() ? row[3].trim() : null;
    reviews.push({
      id: `chrome:${row[0]}`,
      score: Number(row[2]),
      body,
      created: unixPairToIso(row[4]),
      name: typeof author[0] === "string" && author[0] ? author[0] : "Chrome user",
      url: null,
      store: "chrome",
    });
  }

  const sum = reviews.reduce((n, r) => n + r.score, 0);
  return {
    average: reviews.length ? sum / reviews.length : null,
    count: listed,
    reviews,
  };
}

function merge(a: StoreBundle, b: StoreBundle): StoreBundle {
  const reviews = [...a.reviews, ...b.reviews].sort((left, right) => {
    const lt = left.created ? Date.parse(left.created) : 0;
    const rt = right.created ? Date.parse(right.created) : 0;
    return rt - lt;
  });
  const count = a.count + b.count;
  const weighted: number[] = [];
  if (a.average != null && a.count) weighted.push(a.average * a.count);
  if (b.average != null && b.count) weighted.push(b.average * b.count);
  const weight = (a.average != null ? a.count : 0) + (b.average != null ? b.count : 0);
  return {
    average: weight ? weighted.reduce((n, v) => n + v, 0) / weight : null,
    count,
    reviews,
  };
}

export const GET: APIRoute = async () => {
  const [amo, cws] = await Promise.allSettled([
    firefoxReviews(),
    chromeReviews(),
  ]);
  const firefox = amo.status === "fulfilled" ? amo.value : empty();
  const chrome = cws.status === "fulfilled" ? cws.value : empty();
  if (amo.status === "rejected" && cws.status === "rejected") {
    return Response.json(empty(), {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }

  return Response.json(merge(firefox, chrome), {
    headers: {
      "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
};
