import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function useSmoothScroll() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      anchors: false,
      stopInertiaOnNavigate: true,
      // Touch keeps native inertia; Lenis honors reduced motion, including live changes.
      syncTouch: false,
    });
    function handleSectionLink(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const section = document.getElementById(link.hash.slice(1));
      if (!section) return;
      event.preventDefault();
      // Keep section navigation out of the URL while preserving keyboard focus at its destination.
      lenis.scrollTo(section, {
        onComplete: () => {
          if (!section.hasAttribute("tabindex")) {
            section.setAttribute("tabindex", "-1");
            section.addEventListener("blur", () => section.removeAttribute("tabindex"), { once: true });
          }
          section.focus({ preventScroll: true });
        },
      });
    }
    window.addEventListener("click", handleSectionLink);
    if (navigationType === "PUSH") lenis.scrollTo(0, { immediate: true });
    return () => {
      window.removeEventListener("click", handleSectionLink);
      lenis.destroy();
    };
  }, [pathname, navigationType]);
}
