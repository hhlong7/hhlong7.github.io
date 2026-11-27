// Coordinates are pixels in the original photo (public/assets/desk/desk.jpg, 2000×1547).
// Traced by hand from zoomed crops; see docs/desk-photo.md before replacing the photo.

export const PHOTO = { w: 2000, h: 1547 }

export type Pt = readonly [number, number]

export type Screen = {
  id: "monitor" | "laptop"
  href: string
  label: string
  /** Corners for the projective map: top-left, top-right, bottom-right, bottom-left. */
  quad: readonly [Pt, Pt, Pt, Pt]
  /** The visible glass, including the curve and anything sitting in front of it. */
  outline: readonly Pt[]
  /** Size the preview is laid out at before it is mapped onto the glass. */
  design: { w: number; h: number }
}

export const screens: Screen[] = [
  {
    id: "monitor",
    href: "/experience/",
    label: "Experience",
    quad: [[408, 397], [1571, 401], [1523, 867], [455, 866]],
    outline: [
      [408, 397], [522, 398], [524, 408], [636, 408], [638, 399],
      [1000, 403], [1571, 401], [1547, 634], [1523, 867],
      [1260, 858], [1000, 853], [740, 858], [455, 866], [431, 632],
    ],
    design: { w: 1500, h: 600 },
  },
  {
    id: "laptop",
    href: "/about/",
    label: "About me + contact",
    quad: [[778, 876], [1178, 876], [1186, 1172], [772, 1172]],
    outline: [[778, 876], [1178, 876], [1186, 1172], [772, 1172]],
    design: { w: 1000, h: 740 },
  },
]

/** The part of the photo that has to stay in view on any screen: both screens and the keyboard. */
export const FOCUS = { x: 380, y: 330, w: 1360, h: 1000 }
/** On portrait screens, frame just the two screens so they stay big enough to tap. */
export const FOCUS_NARROW = { x: 400, y: 340, w: 1190, h: 860 }

/** CSS matrix3d that maps a w×h box (origin top-left) onto the quad. */
export function quadToMatrix(w: number, h: number, q: Screen["quad"]): string {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3
  let g = 0, k = 0
  if (dx3 !== 0 || dy3 !== 0) {
    const det = dx1 * dy2 - dx2 * dy1
    g = (dx3 * dy2 - dx2 * dy3) / det
    k = (dx1 * dy3 - dx3 * dy1) / det
  }
  const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, c = x0
  const d = y1 - y0 + g * y1, e = y3 - y0 + k * y3, f = y0
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, c, f, 0, 1]
  return `matrix3d(${m.map((n) => +n.toFixed(8)).join(",")})`
}

export const polygonCss = (pts: readonly Pt[]) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(",")})`
export const polygonSvg = (pts: readonly Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(" ")

export function bbox(pts: readonly Pt[]) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const x = Math.min(...xs), y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

/**
 * Where to put the photo in a viewport. Fills the viewport when that keeps the focus area
 * in view; otherwise fits the focus area and lets the blurred backdrop show around it.
 */
export function frame(vw: number, vh: number, box = FOCUS) {
  const cover = Math.max(vw / PHOTO.w, vh / PHOTO.h)
  const fit = Math.min(vw / box.w, vh / box.h)
  const s = Math.min(cover, fit)
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2
  let tx = vw / 2 - cx * s, ty = vh / 2 - cy * s
  // Never pull a photo edge into view when the photo is big enough to cover that axis.
  const clamp = (t: number, view: number, size: number) =>
    size * s >= view ? Math.min(0, Math.max(view - size * s, t)) : t
  tx = clamp(tx, vw, PHOTO.w)
  ty = clamp(ty, vh, PHOTO.h)
  return { s, tx, ty }
}
