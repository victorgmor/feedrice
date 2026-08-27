import { useEffect, useState } from "react";
import { CHROME_URL, FIREFOX_URL } from "@/lib/menu";

function isChromium() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/firefox/i.test(ua)) return false;
  return /chrome|chromium|crios|edg/i.test(ua);
}

export default function StoreButton() {
  const [firefox, setFirefox] = useState(true);

  useEffect(() => {
    if (isChromium()) setFirefox(false);
  }, []);

  const href = firefox ? FIREFOX_URL : CHROME_URL;
  const label = firefox ? "Add to Firefox" : "Add to Chrome";
  const icon = firefox ? "/icons/firefox.svg" : "/icons/chrome.svg";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-secondary transition hover:bg-primary/80"
    >
      <span className="inline-flex items-baseline gap-4">
        <img
          src={icon}
          alt=""
          width={16}
          height={16}
          className="size-4 shrink-0 translate-y-[3px]"
        />
        <span>{label}</span>
      </span>
    </a>
  );
}
