/** Map navigation nodes. Each has its own info page. */
export type MenuSection = {
  heading?: string;
  body?: string;
  items?: string[];
  /** 3-col comparison: [label, ours, theirs] */
  compare?: { head: [string, string, string]; rows: [string, string, string][] };
};

export type NodeShape = "triangle" | "square" | "circle" | "hex";

export type MenuNode = {
  id: string;
  title: string;
  shape: NodeShape;
  body: string;
  sections?: MenuSection[];
  href?: string;
  hrefLabel?: string;
};

export type PageContent = {
  title: string;
  uri: string;
  description: string;
  sections?: MenuSection[];
  href?: string;
  hrefLabel?: string;
  ctas?: {
    href: string;
    label: string;
    icon?: "telegram" | "file" | "plus";
    ghost?: boolean;
    disabled?: boolean;
  }[];
};

export const FIREFOX_URL =
  "https://addons.mozilla.org/en-US/firefox/addon/feedrice-sort-instagram-tiktok/";
export const FIREFOX_REVIEWS_URL = `${FIREFOX_URL}reviews/`;
export const REVIEWS_JSON = "/reviews.json";
export const VERSION_JSON = "/version.json";
export const SUCCESS_KEY_JSON = "/success-key.json";
export const STRIPE_MONTHLY_URL = "https://buy.stripe.com/7sY28s804eUa9CGgzI3AY0f";
export const STRIPE_ANNUAL_URL = "https://buy.stripe.com/8x2bJ2cgk8vM9CG3MW3AY0h";
export const SUPPORT_EMAIL = "esvictorg@gmail.com";
export const VERSION = "6.14";

export const MENU_NODES: MenuNode[] = [
  {
    id: "how-it-works",
    title: "How it works",
    shape: "circle",
    body: "A browser extension that sorts Instagram, TikTok, and YouTube by the numbers that matter — then lets you export or download the result.",
    sections: [
      {
        heading: "Get started",
        body: "Open Instagram, TikTok, or YouTube, then click the feed·rice icon in the toolbar. Pick how many items to scan and the metric to sort by. The page reorders in place.\n\nFree covers the latest 25 items. Pro unlocks larger batches, exports, and downloads.",
      },
      {
        heading: "Instagram",
        body: "Works on a profile’s Posts and Reels tabs.",
        items: [
          "Sort Posts or Reels by likes, views, comments, or oldest first.",
          "Views sorting is for Reels. Posts sort by likes, comments, or date.",
          "Export the visible set to CSV, JSON, or Excel.",
          "Download media in one click (Pro).",
        ],
      },
      {
        heading: "TikTok",
        body: "Works on a creator’s video grid.",
        items: [
          "Sort by likes, views, shares, comments, saves, or oldest first.",
          "Accuracy drops past about 1K videos — use a smaller batch when you can.",
          "Export the sorted set to CSV, JSON, or Excel.",
        ],
      },
      {
        heading: "YouTube",
        body: "Works on a channel’s Videos and Shorts tabs.",
        items: [
          "Sort by views or oldest first.",
          "Export the sorted set to CSV, JSON, or Excel.",
        ],
      },
      {
        heading: "Export & download",
        body: "After a sort, export engagement data as CSV, JSON, or Excel. On Instagram, Pro can also download the media itself. Everything runs in your browser — we do not upload the feed.",
      },
      {
        heading: "Activate Pro",
        body: "Subscribe from the extension or this site. After payment you land on this site with your license key. Open feed·rice, tap Activate here, and paste the key.",
      },
      {
        heading: "Privacy",
        body: "feed·rice runs locally in your browser.",
        items: [
          "Sorting, exporting, and downloads happen on the page you already opened.",
          "We do not collect your Instagram, TikTok, or YouTube content.",
          "License checks talk only to our license server when you activate or renew Pro.",
          "We do not sell personal data.",
        ],
      },
      {
        heading: "Terms",
        body: "feed·rice is an independent tool and is not affiliated with Instagram, Meta, TikTok, or YouTube. All trademarks and content belong to their owners.\n\nPlatform updates can briefly break sorting. We watch for that and ship fixes as soon as we can. You are responsible for how you use exported data and downloads.",
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    shape: "circle",
    body: "Start free on the latest 25 items. Go Pro for unlimited sorts, exports, and downloads.",
    sections: [
      {
        body: "Pay monthly, or save 75% on the annual plan.",
        compare: {
          head: ["", "Free", "Pro"],
          rows: [
            ["Limit", "25", "Unlimited"],
            ["Sort metrics", "Included", "Included"],
            ["CSV / JSON / Excel", "—", "Included"],
            ["Instagram downloads", "—", "Included"],
            ["Price", "$0", "$12/mo or $3/mo billed yearly"],
          ],
        },
      },
    ],
    ctas: [
      { href: STRIPE_ANNUAL_URL, label: "Annual — $3/mo", icon: "plus" },
      { href: STRIPE_MONTHLY_URL, label: "Monthly — $12", ghost: true },
    ],
  },
  {
    id: "reviews",
    title: "Reviews",
    shape: "circle",
    body: "What people wrote on the Firefox add-on listing. Pulled live from AMO.",
  },
  {
    id: "support",
    title: "Support",
    shape: "circle",
    body: `Questions, bugs, or a stuck license — write to ${SUPPORT_EMAIL}.\n\nInclude the site you were on (Instagram, TikTok, or YouTube) and what you clicked. That is usually enough to reproduce it.`,
  },
];

export const PAGES: Record<string, PageContent> = {
  success: {
    title: "feed·rice",
    uri: "success",
    description: "Thanks for subscribing to feed·rice Pro. Here is your license key.",
  },
  "/": {
    title: "feed·rice",
    uri: "/",
    description:
      "Sort Instagram, TikTok, and YouTube by likes, views, comments, and more. Export the numbers. Download the clips. All in the browser.",
    ctas: [
      { href: FIREFOX_URL, label: "Add to Firefox", icon: "plus" },
      { href: "/pricing", label: "Get Pro", ghost: true },
    ],
  },
  ...Object.fromEntries(
    MENU_NODES.map((n) => [
      n.id,
      {
        title: n.title,
        uri: n.id,
        description: n.body,
        sections: n.sections,
        href: n.href,
        hrefLabel: n.hrefLabel,
        ctas: n.ctas,
      } satisfies PageContent,
    ]),
  ),
};

PAGES.docs = PAGES["how-it-works"];

export function getPage(id: string | null): PageContent | null {
  if (!id) return null;
  return PAGES[id] ?? null;
}
