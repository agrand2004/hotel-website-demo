import { useLayoutEffect, type RefObject } from "react";

/** Prepare below-fold elements before paint so entering the viewport never resets their position. */
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || preference.matches || !("IntersectionObserver" in window)) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting || !(target instanceof HTMLElement)) return;
        observer.unobserve(target);
        const animation = target.animate(
          [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }],
          { duration: target.dataset.reveal === "photo" ? 900 : 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        target.classList.remove("reveal-pending");
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }, { threshold: 0 });

    // Batch geometry reads before adding styles. Restored/deep-linked content stays immediately visible.
    const pending = targets.filter((target) => target.getBoundingClientRect().top >= window.innerHeight);
    pending.forEach((target) => {
      target.classList.add("reveal-pending");
      observer.observe(target);
    });
    const revealAll = () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      targets.forEach((target) => target.classList.remove("reveal-pending"));
    };
    const onPreferenceChange = () => { if (preference.matches) revealAll(); };
    preference.addEventListener("change", onPreferenceChange);
    // A keyboard jump should never focus an invisible control.
    const revealFocused = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const target = event.target.closest<HTMLElement>("[data-reveal]");
      if (!target) return;
      observer.unobserve(target);
      target.classList.remove("reveal-pending");
      animations.forEach((animation) => {
        if ((animation.effect as KeyframeEffect).target === target) {
          animation.cancel();
          animations.delete(animation);
        }
      });
    };
    root.addEventListener("focusin", revealFocused);
    return () => {
      revealAll();
      preference.removeEventListener("change", onPreferenceChange);
      root.removeEventListener("focusin", revealFocused);
    };
  }, [rootRef]);
}
