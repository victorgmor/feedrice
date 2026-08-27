import { useEffect, useState } from "react";
import {
  LICENSE_LOOKUP_JSON,
  SUCCESS_KEY_JSON,
  SUPPORT_EMAIL,
} from "@/lib/menu";

function checkoutSessionId() {
  if (typeof window === "undefined") return null;
  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  return sessionId?.startsWith("cs_") ? sessionId : null;
}

function LicenseKeyBlock({
  licenseKey,
  copied,
  onCopy,
}: {
  licenseKey: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-8 space-y-4">
      <p className="break-all rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 font-mono text-sm text-primary">
        {licenseKey}
      </p>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-secondary transition hover:bg-primary/80"
      >
        {copied ? "Copied!" : "Copy key"}
      </button>
    </div>
  );
}

function LicenseActivateHelp() {
  return (
    <div className="mt-10 space-y-4">
      <p className="font-medium text-primary">How to activate</p>
      <ol className="list-decimal space-y-2 pl-5 text-primary/60">
        <li>Open the feed·rice extension in Firefox or Chrome</li>
        <li>
          Click <em>Have a license? Activate here</em>
        </li>
        <li>
          Paste your key and click <em>Activate Pro</em>
        </li>
      </ol>
      <p className="text-sm text-primary/60">
        Pro subscription · up to 3 browsers · Manage billing from the extension.
        Need help?{" "}
        <a className="underline hover:text-primary" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
      </p>
    </div>
  );
}

export default function LicensePanel({
  mode,
}: {
  mode: "lookup" | "checkout";
}) {
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (mode !== "checkout") return;
    const sessionId = checkoutSessionId();
    if (!sessionId) {
      setError(
        "Missing checkout session. If you just paid, check License in the menu or write to us.",
      );
      return;
    }

    let cancelled = false;
    let timer = 0;

    const poll = () => {
      fetch(`${SUCCESS_KEY_JSON}?session_id=${encodeURIComponent(sessionId)}`, {
        signal: AbortSignal.timeout(12000),
      })
        .then((r) => (r.ok || r.status === 400 ? r.json() : Promise.reject()))
        .then((payload) => {
          if (cancelled) return;
          if (typeof payload?.licenseKey === "string" && payload.licenseKey) {
            setLicenseKey(payload.licenseKey);
            setError(null);
            return;
          }
          timer = window.setTimeout(poll, 2000);
        })
        .catch(() => {
          if (!cancelled) timer = window.setTimeout(poll, 2000);
        });
    };

    poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mode]);

  async function copyKey() {
    if (!licenseKey) return;
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function lookupKey(event: { preventDefault(): void }) {
    event.preventDefault();
    const next = email.trim();
    if (!next) {
      setError("Enter the email you used to subscribe.");
      return;
    }

    setChecking(true);
    setError(null);
    try {
      const res = await fetch(LICENSE_LOOKUP_JSON, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: next }),
        signal: AbortSignal.timeout(15000),
      });
      const payload = await res.json();
      if (typeof payload?.licenseKey === "string" && payload.licenseKey) {
        setLicenseKey(payload.licenseKey);
        setError(null);
      } else {
        setLicenseKey(null);
        setError(
          typeof payload?.error === "string"
            ? payload.error
            : "No license for that email.",
        );
      }
    } catch {
      setLicenseKey(null);
      setError("Could not look up that email. Try again.");
    } finally {
      setChecking(false);
    }
  }

  if (mode === "checkout") {
    return (
      <div>
        {licenseKey ? (
          <LicenseKeyBlock
            licenseKey={licenseKey}
            copied={copied}
            onCopy={copyKey}
          />
        ) : error ? (
          <p className="mt-6 text-primary/60">{error}</p>
        ) : (
          <p className="mt-6 text-primary/60">Generating your license key…</p>
        )}
        <LicenseActivateHelp />
      </div>
    );
  }

  return (
    <div>
      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={lookupKey}
      >
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Billing email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 flex-1 border-0 border-b border-primary/20 bg-transparent px-0 text-sm text-primary placeholder:text-primary/40 focus:border-primary focus:ring-0"
        />
        <button
          type="submit"
          disabled={checking}
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-secondary transition hover:bg-primary/80 disabled:opacity-55"
        >
          {checking ? "Checking…" : "Check"}
        </button>
      </form>
      {licenseKey ? (
        <LicenseKeyBlock
          licenseKey={licenseKey}
          copied={copied}
          onCopy={copyKey}
        />
      ) : error ? (
        <p className="mt-6 text-primary/60">{error}</p>
      ) : null}
      <LicenseActivateHelp />
    </div>
  );
}
