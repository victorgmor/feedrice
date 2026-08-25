import type { APIRoute } from "astro";

export const prerender = false;

const WORKER = "https://feed-rice.victorgmor-336.workers.dev/lookup";

export const POST: APIRoute = async ({ request }) => {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = typeof body?.email === "string" ? body.email.trim() : "";
  } catch {
    email = "";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json(
      { licenseKey: null, error: "Enter a valid email." },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const res = await fetch(WORKER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as {
      licenseKey?: string | null;
      error?: string | null;
    };
    return Response.json(
      {
        licenseKey: data.licenseKey ?? null,
        error: data.error ?? null,
      },
      {
        status: res.status === 429 ? 429 : 200,
        headers: { "cache-control": "no-store" },
      },
    );
  } catch {
    return Response.json(
      { licenseKey: null, error: "Could not look up that email. Try again." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
};
