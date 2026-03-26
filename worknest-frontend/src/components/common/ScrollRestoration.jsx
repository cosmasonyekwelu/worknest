import { useEffect } from "react";
import { useLocation } from "react-router";

export default function ScrollRestoration() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        const target =
          document.querySelector(hash) ||
          document.getElementById(hash.replace("#", ""));

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
