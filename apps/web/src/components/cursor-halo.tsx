import { useEffect, useRef } from "react";
import "./cursor-halo.css";

/** Decorative mouse follower; the native pointer remains responsible for precision. */
export function CursorHalo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const halo = ref.current!;
    const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let visible = false;
    let x = 0;
    let y = 0;
    let interactive = false;

    function hide() {
      cancelAnimationFrame(frame);
      frame = 0;
      visible = false;
      halo.dataset.visible = "false";
      halo.dataset.pressed = "false";
    }

    function paint() {
      // Position the first appearance immediately; subsequent moves get a gentle CSS lag.
      halo.style.transition = visible ? "" : "none";
      halo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      halo.dataset.interactive = String(interactive);
      halo.dataset.visible = "true";
      visible = true;
      frame = 0;
    }

    function move(event: PointerEvent) {
      const target = event.target instanceof Element ? event.target : null;
      if (!preference.matches || event.pointerType !== "mouse" || target?.closest('input, textarea, select, [contenteditable="true"], dialog')) {
        hide();
        return;
      }
      x = event.clientX - 16;
      y = event.clientY - 16;
      interactive = Boolean(target?.closest('a[href], button:not(:disabled), summary, [role="button"]:not([aria-disabled="true"])'));
      // Coalesce pointer events into one write per frame; nothing runs while the mouse is idle.
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function press(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button === 0) halo.dataset.pressed = "true";
    }
    function release() { halo.dataset.pressed = "false"; }

    const controller = new AbortController();
    const options = { passive: true, signal: controller.signal };
    window.addEventListener("pointermove", move, options);
    window.addEventListener("pointerdown", press, options);
    window.addEventListener("pointerup", release, options);
    window.addEventListener("pointercancel", hide, options);
    window.addEventListener("blur", hide, options);
    window.addEventListener("keydown", hide, options);
    document.documentElement.addEventListener("pointerleave", hide, options);
    document.addEventListener("visibilitychange", hide, options);
    preference.addEventListener("change", hide);
    return () => {
      controller.abort();
      preference.removeEventListener("change", hide);
      hide();
    };
  }, []);

  return <div ref={ref} className="cursor-halo" aria-hidden="true"><span /></div>;
}
