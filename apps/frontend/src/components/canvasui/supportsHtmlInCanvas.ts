/**
 * Lives apart from VHS.tsx on purpose: VHSHero needs the capability probe to
 * decide whether to render the canvas at all, and importing it from VHS.tsx
 * dragged the whole WebGL module (shaders included) into the entry chunk even
 * though VHS itself is lazy-loaded.
 */

export type PaintableCanvas = HTMLCanvasElement & {
  onpaint?: (() => void) | null;
  requestPaint?: () => void;
};

export type ElementImageContext = CanvasRenderingContext2D & {
  drawElementImage?: (element: Element, x: number, y: number) => void;
};

/**
 * Android can expose the API, but renderer crashes were reported on effect
 * pages (issue #50). A process crash cannot be caught in JavaScript. Keep
 * Android on the DOM/overlay fallback until native capture is validated there.
 * Neither Chrome's flag nor its default-on support (Chrome 157+) may bypass it.
 */
export function isHtmlInCanvasBlocked(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform = (navigator as Navigator & {
    userAgentData?: { platform?: string };
  }).userAgentData?.platform;
  return platform === "Android" || /Android/i.test(navigator.userAgent);
}

export function supportsHtmlInCanvas(): boolean {
  if (typeof document === "undefined" || isHtmlInCanvasBlocked()) return false;
  const probe = document.createElement("canvas") as PaintableCanvas;
  const ctx = probe.getContext("2d") as ElementImageContext | null;
  return Boolean(
    ctx &&
    typeof ctx.drawElementImage === "function" &&
    typeof probe.requestPaint === "function",
  );
}
