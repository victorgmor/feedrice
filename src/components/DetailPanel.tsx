import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  FIREFOX_REVIEWS_URL,
  REVIEWS_JSON,
  getPage,
  VERSION,
  type MenuSection,
  type PageContent,
} from "@/lib/menu";

function Paras({ text }: { text: string }) {
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block, i) => <p key={i}>{block}</p>);
}

function Section({
  section,
  open,
  onToggle,
}: {
  section: MenuSection;
  open: boolean;
  onToggle: () => void;
}) {
  const body = (
    <>
      {section.body && <Paras text={section.body} />}
      {section.compare && (
        <table className="fee-compare">
          <thead>
            <tr>
              {section.compare.head.map((h, i) => (
                <th key={h} className={i === 2 ? "fee-ours" : undefined}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.compare.rows.map(([label, ours, theirs]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{ours}</td>
                <td className="fee-ours">{theirs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {section.items && section.items.length > 0 && (
        <ul className="page-bullets">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </>
  );

  if (!section.heading) {
    return <section className="page-section">{body}</section>;
  }

  return (
    <div className={`page-accordion${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="page-accordion-title"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span
          className={`tab-title${/^v?\d/.test(section.heading) ? " is-version" : ""}`}
        >
          {section.heading}
        </span>
        <span className="tab-indicator" aria-hidden />
      </button>
      <div className="page-accordion-panel">
        <div className="page-accordion-clip">
          <div className="page-accordion-body">{body}</div>
        </div>
      </div>
    </div>
  );
}

type ReviewRow = {
  id: string;
  score: number;
  body: string | null;
  created: string | null;
  name: string;
  url: string | null;
};

function stars(score: number) {
  const n = Math.max(0, Math.min(5, Math.round(score)));
  return `${"★".repeat(n)}${"☆".repeat(5 - n)}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ReviewsList() {
  const [data, setData] = useState<{
    average: number | null;
    count: number;
    reviews: ReviewRow[];
  } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(REVIEWS_JSON, { signal: AbortSignal.timeout(12000) })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((payload) => {
        setData({
          average: typeof payload?.average === "number" ? payload.average : null,
          count: Number(payload?.count) || 0,
          reviews: Array.isArray(payload?.reviews) ? payload.reviews : [],
        });
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <p className="reviews-empty">
        Couldn’t load Firefox reviews.{" "}
        <a href={FIREFOX_REVIEWS_URL} target="_blank" rel="noreferrer">
          Open them on AMO
        </a>
        .
      </p>
    );
  }

  if (data == null) return <p className="reviews-empty">Loading…</p>;
  if (!data.reviews.length) {
    return <p className="reviews-empty">No Firefox reviews yet.</p>;
  }

  return (
    <div className="reviews">
      <p className="reviews-summary">
        {data.average != null ? `${data.average.toFixed(1)} / 5` : "—"}
        {` · ${data.count} review${data.count === 1 ? "" : "s"} on Firefox`}
      </p>
      <ol className="reviews-list">
        {data.reviews.map((r) => (
          <li key={r.id}>
            <div className="review-meta">
              <span className="review-stars" aria-label={`${r.score} out of 5`}>
                {stars(r.score)}
              </span>
              {r.url ? (
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.name}
                </a>
              ) : (
                <span>{r.name}</span>
              )}
              {r.created && (
                <span className="review-date">{formatDate(r.created)}</span>
              )}
            </div>
            {r.body && <p className="review-body">{r.body}</p>}
          </li>
        ))}
      </ol>
      <p className="page-link">
        <a
          href={FIREFOX_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          className="index-link"
        >
          Read all on Firefox  →
        </a>
      </p>
    </div>
  );
}

function PageBody({
  page,
  isHome,
  onPageChange,
}: {
  page: PageContent;
  isHome: boolean;
  onPageChange: (id: string) => void;
}) {
  const external = Boolean(page.href?.startsWith("http"));
  const sections = page.sections ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setOpenIndex(null);
  }, [page.uri]);

  function goHref(href: string, e?: MouseEvent) {
    if (href.startsWith("http") || href === "#") return;
    e?.preventDefault();
    const id = href === "/" ? "/" : href.replace(/^\//, "");
    onPageChange(id);
  }

  return (
    <div className={`page-body${isHome ? " page-body-home" : ""}`}>
      <Paras text={page.description} />
      {page.uri === "reviews" && <ReviewsList />}
      {sections.map((s, i) => (
        <Section
          key={s.heading ?? s.body?.slice(0, 24)}
          section={s}
          open={openIndex === i}
          onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
        />
      ))}
      {page.ctas && page.ctas.length > 0 ? (
        <div className="launch-btns">
          {page.ctas.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className={`launch-btn${c.ghost ? " is-ghost" : ""}${c.disabled ? " is-disabled" : ""}`}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noreferrer" : undefined}
              aria-disabled={c.disabled || undefined}
              tabIndex={c.disabled ? -1 : undefined}
              onClick={(e) => {
                if (c.disabled) {
                  e.preventDefault();
                  return;
                }
                goHref(c.href, e);
              }}
            >
              {c.icon === "plus" && (
                <span className="launch-btn-plus" aria-hidden>
                  +
                </span>
              )}
              {c.icon === "telegram" && (
                <svg
                  className="launch-btn-icon launch-btn-icon-tg"
                  viewBox="0 0 48 48"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M41.42 7.309s3.885-1.515 3.56 2.164c-.107 1.515-1.078 6.818-1.834 12.553l-2.59 16.99s-.216 2.489-2.159 2.922c-1.942.432-4.856-1.515-5.396-1.948-.432-.325-8.094-5.195-10.792-7.575-.756-.65-1.62-1.948.108-3.463L33.649 18.13c1.295-1.3 2.59-4.33-2.806-.65l-15.11 10.28s-1.727 1.083-4.964.109l-7.016-2.165s-2.59-1.623 1.835-3.246c10.793-5.086 24.068-10.28 35.831-15.15"
                  />
                </svg>
              )}
              {c.icon === "file" && (
                <svg
                  className="launch-btn-icon"
                  viewBox="3.5 2.5 9 11"
                  aria-hidden
                >
                  <path fill="currentColor" d="M4,3V13h8V7H8V3ZM9,3V6h3Z" />
                </svg>
              )}
              {c.label}
            </a>
          ))}
        </div>
      ) : (
        (page.href || page.hrefLabel) && (
          <p className="page-link">
            {page.href ? (
              <a
                href={page.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="index-link"
                onClick={(e) => goHref(page.href!, e)}
              >
                {page.hrefLabel ?? page.href}
              </a>
            ) : (
              <span>{page.hrefLabel}</span>
            )}
          </p>
        )
      )}
    </div>
  );
}

export default function DetailPanel({
  pageId,
  onPageChange,
}: {
  pageId: string;
  onPageChange: (id: string) => void;
}) {
  const page = getPage(pageId) ?? getPage("/")!;
  const isHome = pageId === "/";
  const shellRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const prevH = useRef(0);
  const sizingRef = useRef(false);
  const [panelH, setPanelH] = useState<number | undefined>(undefined);
  const [sizing, setSizing] = useState(false);

  // Page change: animate height, then let CSS auto-size (accordions).
  useLayoutEffect(() => {
    const shell = shellRef.current;
    const inner = innerRef.current;
    if (!shell || !inner) return;

    const next = Math.min(inner.offsetHeight, window.innerHeight * 0.7);
    const from = prevH.current;
    if (!from || Math.abs(from - next) < 1) {
      prevH.current = next;
      setPanelH(undefined);
      setSizing(false);
      return;
    }

    sizingRef.current = true;
    setSizing(true);
    setPanelH(from);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPanelH(next));
    });
  }, [pageId]);

  return (
    <div className={`page${isHome ? " page-home" : ""}`}>
      <div className="page-container">
        <div className="page-stack">
          <div className="panel-heading">
            <div className="tab-titles page-header-titles">
              <span className="tab-icon icon-home" aria-hidden>
                <img src="/icon.svg" alt="" width={16} height={16} />
              </span>
              <span className="tab-title is-brand">feed·rice</span>
              <span className="beta">v{VERSION}</span>
            </div>
          </div>
          <div
            ref={shellRef}
            className={`main-content${sizing ? " is-sizing" : ""}`}
            style={panelH != null ? { height: panelH } : undefined}
            onTransitionEnd={(e) => {
              if (e.propertyName !== "height") return;
              prevH.current = shellRef.current?.offsetHeight ?? 0;
              sizingRef.current = false;
              setPanelH(undefined);
              setSizing(false);
            }}
          >
            <div className="main-content-inner" ref={innerRef}>
              <div className="tab-content">
                <PageBody
                  page={page}
                  isHome={isHome}
                  onPageChange={onPageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
