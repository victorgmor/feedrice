import { useEffect, useState } from "react";
import { CHROME_URL, FIREFOX_URL } from "@/lib/menu";

export default function StoreButton({ className = "" }: { className?: string }) {
  const [firefox, setFirefox] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent)) {
      setFirefox(true);
    }
  }, []);

  const href = firefox ? FIREFOX_URL : CHROME_URL;
  const label = firefox ? "Add to Firefox" : "Add to Chrome";
  const icon = firefox ? "/icons/firefox.svg" : "/icons/chrome.svg";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-secondary transition hover:bg-primary/80 ${className}`.trim()}
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
