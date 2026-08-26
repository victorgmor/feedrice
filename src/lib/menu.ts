/** Map navigation nodes. Each has its own info page. */
export type MenuSection = {
  heading?: string;
  body?: string;
  items?: string[];
  href?: string;
  hrefLabel?: string;
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
export const LICENSE_LOOKUP_JSON = "/license-lookup.json";
export const STRIPE_MONTHLY_URL = "https://buy.stripe.com/7sY28s804eUa9CGgzI3AY0f";
export const STRIPE_ANNUAL_URL = "https://buy.stripe.com/8x2bJ2cgk8vM9CG3MW3AY0h";
export const SUPPORT_EMAIL = "esvictorg@gmail.com";
export const HOW_IT_WORKS_VIDEO_URL = "https://youtu.be/49WtCqrZTvo";
export const VERSION = "6.17";

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
        href: HOW_IT_WORKS_VIDEO_URL,
        hrefLabel: "Watch the video",
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
        href: "/privacy",
        hrefLabel: "Full privacy policy",
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
    id: "license",
    title: "License",
    shape: "circle",
    body: "Enter the email you used to subscribe and we’ll show your license key.",
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
    href: "/privacy",
    hrefLabel: "Privacy policy",
  },
  {
    id: "privacy",
    title: "Privacy",
    shape: "circle",
    body: "Last updated: August 26, 2026.\n\nfeed·rice values your privacy. This policy explains what we collect, how we use it, and your rights when you use the extension or this site.",
    sections: [
      {
        heading: "Information we collect",
        body: "We collect a limited set of information to run Pro licenses and support:",
        items: [
          "Billing email — from Stripe checkout, or when you look up your key on this site",
          "License key — created after you subscribe, used to activate Pro",
          "Device id — a random id stored in the extension, sent when you activate so one key can cover up to 3 browsers",
          "Subscription status and plan — so Pro stays in sync with Stripe",
          "Checkout session id — maps a Stripe payment to your license key",
          "Lookup IP — kept for about two minutes to rate-limit email lookups",
          "Optional issue reports — if you send one: page URL, extension version, device id, browser info, and what you wrote",
        ],
      },
      {
        heading: "What we do not collect",
        body: "We do not collect or store your browsing history, Instagram, TikTok, or YouTube content, posts viewed, likes, comments, or account passwords.\n\nSorting, exporting, and downloads run on the page you already opened. That feed data stays in your browser. We do not upload it.",
      },
      {
        heading: "How we use the information",
        body: "Your data is used only to:",
        items: [
          "Create, look up, and activate a Pro license",
          "Limit a key to 3 browsers",
          "Keep subscription status current",
          "Receive optional issue reports",
          "Respond when you write to support",
        ],
      },
      {
        heading: "We do not sell data",
        body: "We never sell, share, or rent your personal information. Third parties below only get what they need to do their job.",
      },
      {
        heading: "Firefox permissions",
        body: "The extension asks for storage, tabs, alarms, and downloads, plus access to Instagram, TikTok, our license server, and the report form. Those permissions exist so we can sort the page you opened, save settings, download files you asked for, and check a license. They do not let us read your browsing history or other sites.",
      },
      {
        heading: "Third-party services",
        body: "We use a few providers to make the product work:",
        items: [
          "Stripe — payments, receipts, and billing portal",
          "Cloudflare Workers and KV — license checks and storage",
          "Vercel — this website",
          "Web3Forms — optional issue reports you send",
          "Mozilla Add-ons — the public listing and reviews",
        ],
      },
      {
        heading: "Storage and security",
        body: "License records live in Cloudflare KV. Payment card details are handled by Stripe, not by us. Settings and the device id stay in your Firefox storage.",
      },
      {
        heading: "Data retention",
        body: "We keep license data while the subscription is needed to provide Pro, or as required by law. Rate-limit records expire in about two minutes. Checkout session maps are leftovers after payment.\n\nIf you ask us to delete your data, we will remove your license record from our systems.",
      },
      {
        heading: "Your rights",
        body: `You can ask us to delete or correct your data at any time by writing to ${SUPPORT_EMAIL}. We will respond in a reasonable time.\n\nIf you are in the European Union, we process this information on the basis of legitimate interest and your consent where required (GDPR).`,
      },
      {
        heading: "Children",
        body: "feed·rice is not directed at children under 13. We do not knowingly collect their personal information. If you believe a child has given us data, write to us and we will delete it.",
      },
      {
        heading: "Analytics and cookies",
        body: "feed·rice does not use Google Analytics, advertising cookies, or tracking scripts. We do not collect data about your browsing or how you use Instagram, TikTok, or YouTube.",
      },
      {
        heading: "Data controller",
        body: `The person responsible for this information is the creator of feed·rice.\n\nEmail: ${SUPPORT_EMAIL}`,
      },
      {
        heading: "Changes",
        body: "We may update this policy. The current version will always be at feedrice.xyz/privacy.",
      },
      {
        heading: "Contact",
        body: `Questions about this policy or your data: ${SUPPORT_EMAIL}`,
      },
    ],
  },
];

export const PAGES: Record<string, PageContent> = {
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
PAGES.success = {
  title: "feed·rice",
  uri: "success",
  description: "Thanks for subscribing to feed·rice Pro. Here is your license key.",
};

export function getPage(id: string | null): PageContent | null {
  if (!id) return null;
  return PAGES[id] ?? null;
}
