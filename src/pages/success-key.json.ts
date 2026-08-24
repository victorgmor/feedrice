import type { APIRoute } from "astro";

export const prerender = false;

const WORKER = "https://feed-rice.victorgmor-336.workers.dev/success/key";

export const GET: APIRoute = async ({ url }) => {
  const sessionId = url.searchParams.get("session_id") ?? "";
  if (!sessionId.startsWith("cs_")) {
    return Response.json(
      { ready: false, licenseKey: null, error: "Invalid session" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const res = await fetch(
      `${WORKER}?session_id=${encodeURIComponent(sessionId)}`,
    );
    const data = (await res.json()) as {
      ready?: boolean;
      licenseKey?: string | null;
    };
    return Response.json(
      {
        ready: Boolean(data.ready),
        licenseKey: data.licenseKey ?? null,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ready: false, licenseKey: null, error: "lookup" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
};
