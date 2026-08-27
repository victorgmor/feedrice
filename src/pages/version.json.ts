import type { APIRoute } from "astro";

export const prerender = false;

const SLUG = "sort-download-instagram-tiktok";
const AMO = "https://addons.mozilla.org/api/v5";
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "feedrice-site/1.0 (+https://github.com/victorgmor/feedrice)",
};

function parseVersion(value: unknown) {
  if (typeof value !== "string") return null;
  const version = value.trim().replace(/^v/i, "");
  return /^\d+(?:\.\d+){0,3}$/.test(version) ? version : null;
}

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(`${AMO}/addons/addon/${SLUG}/`, { headers: HEADERS });
    if (!res.ok) throw new Error("amo");

    const addon = (await res.json()) as {
      current_version?: { version?: string };
    };
    const version = parseVersion(addon.current_version?.version);
    if (!version) throw new Error("version");

    return Response.json(
      { version },
      {
        headers: {
          "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return Response.json(
      { version: null },
      {
        status: 503,
        headers: { "cache-control": "no-store" },
      },
    );
  }
};
