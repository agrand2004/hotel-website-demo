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
      anchors: true,
      stopInertiaOnNavigate: true,
      // Touch keeps native inertia; Lenis honors reduced motion, including live changes.
      syncTouch: false,
    });
    if (navigationType === "PUSH") lenis.scrollTo(0, { immediate: true });
    return () => lenis.destroy();
  }, [pathname, navigationType]);
}
