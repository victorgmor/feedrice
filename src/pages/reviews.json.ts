import type { APIRoute } from "astro";

export const prerender = false;

const SLUG = "sort-download-instagram-tiktok";
const AMO = "https://addons.mozilla.org/api/v5";
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "feedrice-site/1.0 (+https://github.com/victorgmor/feedrice)",
};

type AmoRating = {
  id?: number;
  score?: number;
  body?: string | null;
  created?: string;
  is_deleted?: boolean;
  user?: { name?: string; url?: string };
};

function empty() {
  return { average: null as number | null, count: 0, reviews: [] as unknown[] };
}

export const GET: APIRoute = async () => {
  try {
    const [addonRes, ratingsRes] = await Promise.all([
      fetch(`${AMO}/addons/addon/${SLUG}/`, { headers: HEADERS }),
      fetch(`${AMO}/ratings/rating/?addon=${SLUG}&page_size=50`, {
        headers: HEADERS,
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
        id: String(r.id ?? ""),
        score: Number(r.score),
        body: typeof r.body === "string" && r.body.trim() ? r.body.trim() : null,
        created: typeof r.created === "string" ? r.created : null,
        name: String(r.user?.name ?? "Firefox user"),
        url: typeof r.user?.url === "string" ? r.user.url : null,
      }))
      .filter((r) => r.id);

    return Response.json(
      {
        average:
          typeof addon.ratings?.average === "number" ? addon.ratings.average : null,
        count:
          typeof addon.ratings?.count === "number"
            ? addon.ratings.count
            : reviews.length,
        reviews,
      },
      {
        headers: {
          "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return Response.json(empty(), {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
};
