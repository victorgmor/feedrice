import { useEffect, useState } from "react";
import DetailPanel from "./DetailPanel";
import BgHole from "./BgHole";
import { getPage, MENU_NODES } from "@/lib/menu";
function pathToPageId(pathname: string): string {
  const id = pathname === "/" ? "/" : pathname.replace(/^\//, "");
  return getPage(id) ? id : "/";
}

function pageIdToPath(id: string): string {
  return id === "/" ? "/" : `/${id}`;
}

export default function AppShell({ pathname: initialPath }: { pathname: string }) {
  const [pathname, setPathname] = useState(initialPath);
  const pageId = pathToPageId(pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(id: string) {
    const next = pageIdToPath(getPage(id) ? id : "/");
    if (next === pathname) return;
    history.pushState(null, "", next);
    setPathname(next);
  }

  return (
    <>
      <BgHole />
      <header className="site-header">
        <nav className="site-nav">
          <button
            type="button"
            className={pageId === "/" ? "is-active" : undefined}
            onClick={() => go("/")}
          >
            Home
          </button>
          {MENU_NODES.map((n) =>
            n.href?.startsWith("http") && n.id !== "support" ? (
              <a
                key={n.id}
                href={n.href}
                target="_blank"
                rel="noreferrer"
              >
                {n.title}
              </a>
            ) : (
              <button
                key={n.id}
                type="button"
                className={pageId === n.id ? "is-active" : undefined}
                onClick={() => go(n.id)}
              >
                {n.title}
              </button>
            ),
          )}
        </nav>
      </header>
      <DetailPanel pageId={pageId} onPageChange={go} />
    </>
  );
}
