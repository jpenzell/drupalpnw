import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Guarantees a slide never gets cut off on the fixed 1920x1080 stage.
 * Measures the rendered slide and, if it overflows vertically or
 * horizontally, scales it down about the center until it fits.
 */
export const FitToStage = ({ children, deps }: { children: ReactNode; deps?: unknown }) => {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState(1);

  const measure = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const outer = el.parentElement as HTMLElement | null;
    const prevTransform = outer?.style.transform ?? "";
    // Measure at natural (unscaled) size.
    if (outer) outer.style.transform = "";
    const base = el.getBoundingClientRect();
    const top = base.top;
    let bottom = base.bottom;
    let left = base.left;
    let right = base.right;

    const visit = (node: HTMLElement) => {
      for (const child of Array.from(node.children) as HTMLElement[]) {
        const style = getComputedStyle(child);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (style.position === "fixed") continue;
        const r = child.getBoundingClientRect();
        if (r.width || r.height) {
          if (r.bottom > bottom) bottom = r.bottom;
          if (r.left < left) left = r.left;
          if (r.right > right) right = r.right;
        }
        // Content inside a clipping box can't overflow the stage.
        const clips = /hidden|clip|auto|scroll/.test(style.overflowY + style.overflowX);
        if (!clips) visit(child);
      }
    };
    visit(el);

    const h = bottom - top;
    const w = right - left;
    if (outer) outer.style.transform = prevTransform;
    // 1.5% breathing room so nothing kisses the edge of the stage.
    const next = Math.min(1, base.height / Math.max(h * 1.025, 1), base.width / Math.max(w * 1.01, 1));
    setFit((prev) => (Math.abs(prev - next) > 0.004 ? next : prev));
  }, []);

  useLayoutEffect(() => {
    setFit(1);
    // Measure after reset paints, then again once fonts/images settle.
    const raf1 = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    // Re-measure as fonts, images, iframes and animations settle.
    const timers = [120, 350, 800, 1600, 2600].map((ms) => setTimeout(measure, ms));
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf1);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
    };
  }, [measure, deps]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    const mo = new MutationObserver(() => measure());
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [measure]);

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        transform: fit < 1 ? `scale(${fit})` : undefined,
        transformOrigin: "top center",
      }}
    >
      <div ref={innerRef} className="w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
