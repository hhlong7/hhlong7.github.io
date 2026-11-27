// Coordinates are pixels in the original photo (public/assets/desk/desk.jpg, 2000×1547).
// Traced by hand from zoomed crops; see docs/desk-photo.md before replacing the photo.

export const PHOTO = { w: 2000, h: 1547 }

export type Pt = readonly [number, number]

export type Screen = {
  id: "monitor" | "laptop"
  href: string
  label: string
  /** Glass corners: top-left, top-right, bottom-right, bottom-left. Used to aim the zoom. */
  quad: readonly [Pt, Pt, Pt, Pt]
  /** The visible glass, including the curve and the webcam notch. Hit area and spotlight. */
  outline: readonly Pt[]
  /** Size the page miniature is laid out at before the hover card scales it down. */
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
