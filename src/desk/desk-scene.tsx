import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type TransitionEvent } from "react"
import { ArrowUpRight, Laptop, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { profile } from "@/data/content"
import { FOCUS, FOCUS_NARROW, PHOTO, bbox, frame, polygonSvg, screens, type Screen } from "./geometry"
import { LaptopPreview, MonitorPreview } from "./screen-previews"
import { PHOTO_PLACEHOLDER } from "./placeholder"

type Id = Screen["id"]

const SRC = {
  jpg: "/assets/desk/desk.jpg",
  set: "/assets/desk/desk-1200.webp 1200w, /assets/desk/desk-2000.webp 2000w",
}
const ICON = { monitor: Monitor, laptop: Laptop } as const
const PREVIEW = { monitor: MonitorPreview, laptop: LaptopPreview } as const

// The hover card: a scaled-down copy of the page, with a caption strip under it.
const CARD = {
  monitor: { w: 480, scale: 480 / 1500 },
  laptop: { w: 340, scale: 340 / 1000 },
} as const
const CAPTION_H = 44
const cardSize = (id: Id) => {
  const sc = screens.find((s) => s.id === id)!
  return { w: CARD[id].w, h: Math.round(sc.design.h * CARD[id].scale) + CAPTION_H }
}
const GAP = 22
const EDGE = 12

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

// Hand-off with the two pages (see the inline script in experience/ and about/ index.html).
// desk:enter tells the page it was entered through a screen; desk:return tells the desk which
// screen the visitor is coming back out of. A return note older than a few seconds is ignored.
function readReturn(): Id | null {
  try {
    const raw = sessionStorage.getItem("desk:return")
    sessionStorage.removeItem("desk:return")
    if (!raw) return null
    const { id, t } = JSON.parse(raw) as { id: Id; t: number }
    return Date.now() - t < 5000 && screens.some((s) => s.id === id) ? id : null
  } catch {
    return null
  }
}

const prefetched = new Set<string>()
function prefetch(href: string) {
  if (prefetched.has(href)) return
  prefetched.add(href)
  const l = document.createElement("link")
  l.rel = "prefetch"
  l.href = href
  document.head.appendChild(l)
}

const center = (id: Id) => {
  const b = bbox(screens.find((s) => s.id === id)!.quad)
  return { x: b.x + b.w / 2, y: b.y + b.h / 2, b }
}

function useViewport() {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight })
  const [vp, setVp] = useState(read)
  useLayoutEffect(() => {
    const on = () => setVp(read())
    window.addEventListener("resize", on)
    return () => window.removeEventListener("resize", on)
  }, [])
  return vp
}

export function DeskScene() {
  const vp = useViewport()
  const [active, setActive] = useState<Id | null>(null)
  // Coming back from a page starts inside that screen and pulls back out.
  const [returnFrom] = useState(() => (reducedMotion() ? null : readReturn()))
  const [zooming, setZooming] = useState<Id | null>(returnFrom)
  const [pivot, setPivot] = useState<Id>(returnFrom ?? "monitor")
  // `settling`: holding inside the screen until the photo can be shown, then pulling back.
  // `snapping`: one frame with transitions off while the pivot moves (the picture doesn't change).
  const [settling, setSettling] = useState(returnFrom !== null)
  const [snapping, setSnapping] = useState(false)
  const instant = settling || snapping
  const [touched, setTouched] = useState(returnFrom !== null)
  const [photo, setPhoto] = useState<"loading" | "ready" | "failed">("loading")
  const leaving = useRef(false)
  const sceneRef = useRef<HTMLDivElement>(null)
  const pendingZoom = useRef<Id | null>(null)
  // Commit the current transform with transitions off, so the next change animates from it.
  const flush = () => { if (sceneRef.current) void getComputedStyle(sceneRef.current).transform }

  const cardRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const anchor = useRef<DOMRect | null>(null) // set when keyboard focus or the bottom bar opens the card
  const pos = useRef<{ x: number; y: number } | null>(null)

  // Pull back out once the photo is there to pull back to.
  useEffect(() => {
    if (!settling) return
    // One painted frame inside the screen first. If the photo is slow, pull back anyway
    // rather than holding the visitor on a blank field.
    const t = window.setTimeout(() => {
      flush()
      setSettling(false)
      setZooming(null)
    }, photo === "loading" ? 1800 : 40)
    return () => window.clearTimeout(t)
  }, [settling, photo])

  // The back button can restore this page from cache still inside the screen: pull back out.
  useEffect(() => {
    const restore = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      leaving.current = false
      setActive(null)
      setZooming(null)
    }
    window.addEventListener("pageshow", restore)
    return () => window.removeEventListener("pageshow", restore)
  }, [])

  const home = useMemo(() => frame(vp.w, vp.h, vp.w < vp.h ? FOCUS_NARROW : FOCUS), [vp])
  // When the photo is smaller than the window on an axis, feather that edge into the room fill.
  const feather = [
    PHOTO.h * home.s < vp.h - 1 && "linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)",
    PHOTO.w * home.s < vp.w - 1 && "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
  ].filter(Boolean) as string[]
  // The camera pivots on the chosen screen's center, so the screen travels in a straight line
  // to the middle of the window while it grows, instead of swinging in from a corner.
  const cam = useMemo(() => {
    const p = center(pivot)
    let s = home.s, tx = home.tx, ty = home.ty
    if (zooming) {
      const { b } = center(zooming)
      s = Math.max(vp.w / b.w, vp.h / b.h) * 1.06
      tx = vp.w / 2 - p.x * s
      ty = vp.h / 2 - p.y * s
    }
    // Same picture, rewritten for transform-origin at the pivot.
    return { s, x: tx - p.x * (1 - s), y: ty - p.y * (1 - s), ox: p.x, oy: p.y }
  }, [zooming, pivot, home, vp])

  // Where the card wants to be: beside the pointer, or above whatever opened it from the keyboard.
  const target = useCallback((id: Id) => {
    const { w, h } = cardSize(id)
    let x: number, y: number
    if (anchor.current) {
      const r = anchor.current
      x = r.left + r.width / 2 - w / 2
      y = r.top - h - GAP
      if (y < EDGE) y = r.bottom + GAP
    } else {
      const p = pointer.current
      x = p.x + GAP
      y = p.y + GAP
      if (x + w > vp.w - EDGE) x = p.x - GAP - w
      if (y + h > vp.h - EDGE) y = p.y - GAP - h
    }
    return {
      x: Math.min(Math.max(EDGE, x), vp.w - w - EDGE),
      y: Math.min(Math.max(EDGE, y), vp.h - h - EDGE),
    }
  }, [vp])

  // Ease the card after the pointer, the same way the project list's preview moves.
  useEffect(() => {
    if (!active || zooming) return
    const still = reducedMotion()
    let raf = 0
    const tick = () => {
      const t = target(active)
      const k = still || !pos.current ? 1 : 0.18
      const cur = pos.current ?? t
      pos.current = { x: cur.x + (t.x - cur.x) * k, y: cur.y + (t.y - cur.y) * k }
      if (cardRef.current) cardRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, zooming, target])

  const show = useCallback((id: Id | null, from?: Element) => {
    if (leaving.current) return
    anchor.current = from ? from.getBoundingClientRect() : null
    if (!id) pos.current = null
    setActive(id)
    if (id) {
      setTouched(true)
      prefetch(screens.find((s) => s.id === id)!.href)
    }
  }, [])

  const go = useCallback((id: Id) => {
    try { sessionStorage.setItem("desk:enter", id) } catch { /* private mode: page just skips its entrance */ }
    window.location.assign(screens.find((s) => s.id === id)!.href)
  }, [])

  const open = useCallback((e: MouseEvent<HTMLAnchorElement | SVGAElement>, screen: Screen) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    // Reduced motion, no photo yet, or still holding inside a screen on the way back:
    // just follow the link.
    if (reducedMotion() || photo !== "ready" || settling) return
    e.preventDefault()
    if (leaving.current) return
    leaving.current = true
    setActive(null)
    // Move the pivot with transitions off (same picture); the layout effect below starts the camera.
    pendingZoom.current = screen.id
    setSnapping(true)
    setPivot(screen.id)
    window.setTimeout(() => go(screen.id), 1400) // in case transitionend never comes
  }, [photo, go, settling])

  useLayoutEffect(() => {
    if (!snapping || !pendingZoom.current) return
    const id = pendingZoom.current
    pendingZoom.current = null
    flush()
    setSnapping(false)
    setZooming(id)
  }, [snapping])

  const onVeilEnd = (e: TransitionEvent) => {
    if (e.propertyName !== "opacity" || !zooming || !leaving.current) return
    go(zooming)
  }

  const lit = zooming ?? active
  const size = active ? cardSize(active) : null

  return (
    <main
      onPointerMove={(e) => { pointer.current = { x: e.clientX, y: e.clientY } }}
      className="fixed inset-0 overflow-hidden bg-background select-none"
      style={{ backgroundImage: `url(${PHOTO_PLACEHOLDER})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Room fill around the photo when the window is a different shape than the picture. */}
      <div
        aria-hidden
        className="absolute -inset-16 scale-110 bg-cover bg-center blur-[40px] brightness-[.38] saturate-[.85]"
        style={{ backgroundImage: `url(/assets/desk/desk-1200.webp), url(${PHOTO_PLACEHOLDER})` }}
      />

      <div
        ref={sceneRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          width: PHOTO.w,
          height: PHOTO.h,
          transformOrigin: `${cam.ox}px ${cam.oy}px`,
          transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`,
          // In: moves the moment you click, then a confident push. Out: fast release, long settle.
          transition: instant
            ? "none"
            : zooming
              ? "transform 850ms cubic-bezier(0.5, 0, 0.15, 1)"
              : "transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <picture
          className="absolute inset-0"
          style={feather.length ? { maskImage: feather.join(","), maskComposite: "intersect", WebkitMaskImage: feather.join(","), WebkitMaskComposite: "source-in" } : undefined}
        >
          <source type="image/webp" srcSet={SRC.set} sizes={`${Math.ceil(PHOTO.w * home.s)}px`} />
          <img
            src={SRC.jpg}
            width={PHOTO.w}
            height={PHOTO.h}
            alt="Long's desk: a curved LG monitor with a light bar on top, a MacBook below it, a mug, a watch and a plant."
            fetchPriority="high"
            decoding="async"
            onLoad={() => setPhoto("ready")}
            onError={() => setPhoto("failed")}
            className={cn("absolute inset-0 size-full transition-opacity duration-700", photo === "ready" ? "opacity-100" : "opacity-0")}
          />
        </picture>

        {/* Spotlight: everything except the screen you're pointing at dims a little. */}
        <svg aria-hidden className="pointer-events-none absolute inset-0" width={PHOTO.w} height={PHOTO.h} viewBox={`0 0 ${PHOTO.w} ${PHOTO.h}`}>
          <defs>
            {screens.map((sc) => (
              <mask key={sc.id} id={`spot-${sc.id}`}>
                <rect width={PHOTO.w} height={PHOTO.h} fill="white" />
                <polygon points={polygonSvg(sc.outline)} fill="black" />
              </mask>
            ))}
          </defs>
          {screens.map((sc) => (
            <rect
              key={sc.id}
              width={PHOTO.w}
              height={PHOTO.h}
              mask={`url(#spot-${sc.id})`}
              className={cn("fill-[oklch(0.12_0.01_135)] transition-opacity duration-300", lit === sc.id ? "opacity-45" : "opacity-0")}
            />
          ))}
        </svg>

        {/* As the camera arrives, the glass lights up to the page's own background. */}
        {screens.map((sc) => (
          <div
            key={sc.id}
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-page"
            style={{
              clipPath: `polygon(${sc.outline.map(([x, y]) => `${x}px ${y}px`).join(",")})`,
              opacity: zooming === sc.id ? 1 : 0,
              transition: instant ? "none" : zooming === sc.id ? "opacity 400ms cubic-bezier(0.4, 0, 1, 1) 300ms" : "opacity 520ms ease-out 140ms",
            }}
          />
        ))}

        {/* Hit areas traced on the glass. */}
        <svg className="absolute inset-0" width={PHOTO.w} height={PHOTO.h} viewBox={`0 0 ${PHOTO.w} ${PHOTO.h}`}>
          {screens.map((sc) => (
            <a
              key={sc.id}
              href={sc.href}
              aria-label={sc.id === "monitor" ? "Experience: work, projects and courses" : "About me and contact"}
              className="group cursor-pointer outline-none"
              onPointerEnter={() => show(sc.id)}
              onPointerLeave={() => !zooming && show(null)}
              onFocus={(e) => show(sc.id, e.currentTarget)}
              onBlur={() => !zooming && show(null)}
              onClick={(e) => open(e, sc)}
            >
              <polygon
                points={polygonSvg(sc.outline)}
                className="fill-transparent stroke-transparent transition-[stroke] duration-200 [vector-effect:non-scaling-stroke] group-hover:stroke-[oklch(0.97_0.02_90/.75)] group-focus-visible:stroke-accent"
                strokeWidth={2}
              />
            </a>
          ))}
          {!touched && !zooming &&
            screens.map((sc) => {
              const b = bbox(sc.quad)
              return (
                <g key={sc.id} className="pointer-events-none" transform={`translate(${b.x + b.w / 2} ${b.y + b.h / 2})`}>
                  <circle r={9 / home.s} className="fill-accent-fill stroke-accent" strokeWidth={2 / home.s} />
                  <circle r={9 / home.s} className="origin-center [transform-box:fill-box] fill-none stroke-accent motion-safe:animate-[halo_2.4s_ease-out_infinite]" strokeWidth={2 / home.s} />
                </g>
              )
            })}
        </svg>
      </div>

      {/* Catches the bezel at the edges in the last moment, so the page arrives on a clean field. */}
      <div
        aria-hidden
        onTransitionEnd={onVeilEnd}
        className="pointer-events-none fixed inset-0 z-40 bg-page"
        style={{
          opacity: zooming ? 1 : 0,
          transition: instant ? "none" : zooming ? "opacity 180ms ease-in 660ms" : "opacity 380ms ease-out",
        }}
      />

      {/* The hover card: a live miniature of the page this screen opens. */}
      <div
        ref={cardRef}
        aria-hidden
        className={cn(
          "pointer-events-none fixed top-0 left-0 z-20 hidden [@media(hover:hover)]:block",
          active && !zooming ? "opacity-100" : "opacity-0",
        )}
        style={{ transition: "opacity .25s cubic-bezier(.4,0,.2,1)" }}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border bg-background shadow-[0_28px_60px_-18px_oklch(0_0_0/.85)] transition-[width,height,scale] duration-300 ease-out-expo",
            active && !zooming ? "scale-100" : "scale-[.88]",
          )}
          style={{ width: size?.w ?? CARD.monitor.w, height: size?.h ?? 200, transformOrigin: "top left" }}
        >
          {screens.map((sc) => {
            const Preview = PREVIEW[sc.id]
            const Icon = ICON[sc.id]
            const on = active === sc.id
            const { w, h } = cardSize(sc.id)
            return (
              <div
                key={sc.id}
                className="absolute top-0 left-0 transition-[opacity,filter] duration-300 ease-out"
                style={{ width: w, height: h, opacity: on ? 1 : 0, filter: on ? "none" : "blur(8px)" }}
              >
                <div className="overflow-hidden" style={{ width: w, height: h - CAPTION_H }}>
                  <div className="origin-top-left" style={{ width: sc.design.w, height: sc.design.h, transform: `scale(${CARD[sc.id].scale})` }}>
                    <Preview />
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t px-3.5 text-[13px] font-medium" style={{ height: CAPTION_H }}>
                  <Icon className="size-4 text-accent" />
                  {sc.label}
                  <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                    Click to open <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`@keyframes halo{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.6);opacity:0}}`}</style>

      {/* Chrome that lives in the window, not the photo. */}
      <header
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 px-5 pt-5 transition-opacity duration-300 sm:px-7 sm:pt-6",
          zooming && "opacity-0",
        )}
      >
        <div className="drop-shadow-[0_1px_8px_oklch(0_0_0/.6)]">
          <h1 className="font-display text-xl leading-none font-bold tracking-tight sm:text-2xl">{profile.name}</h1>
          <p className="mt-1.5 font-detail text-[11px] tracking-[0.12em] whitespace-nowrap text-muted-foreground uppercase">{profile.tagline}</p>
        </div>
        <p
          className={cn(
            "flex items-center gap-2 pt-1 text-right text-[13px] text-muted-foreground drop-shadow-[0_1px_8px_oklch(0_0_0/.6)] transition-opacity duration-500",
            touched && "opacity-0",
          )}
        >
          <span className={cn("size-2 flex-none rounded-full bg-accent", !touched && "motion-safe:animate-pulse")} />
          <span className="[@media(hover:none)]:hidden">Hover a screen to look, click to go in</span>
          <span className="hidden [@media(hover:none)]:inline">Tap the monitor or the laptop</span>
        </p>
      </header>

      {photo === "failed" && (
        <p className="absolute top-1/2 left-1/2 max-w-[80%] -translate-1/2 rounded-xl border bg-background px-4 py-3 text-center text-sm">
          The desk photo didn't load. Both pages are in the buttons below.
        </p>
      )}

      <nav
        aria-label="Pages"
        className={cn(
          "absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-opacity duration-300",
          zooming && "opacity-0",
        )}
      >
        <div className="flex gap-1 rounded-full border bg-background/85 p-1 shadow-[0_10px_30px_-10px_oklch(0_0_0/.8)] backdrop-blur-md">
          {screens.map((sc) => {
            const Icon = ICON[sc.id]
            return (
              <a
                key={sc.id}
                href={sc.href}
                onPointerEnter={(e) => show(sc.id, e.currentTarget)}
                onPointerLeave={() => !zooming && show(null)}
                onFocus={(e) => show(sc.id, e.currentTarget)}
                onBlur={() => !zooming && show(null)}
                onClick={(e) => open(e, sc)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium no-underline transition-colors duration-200",
                  lit === sc.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {sc.label}
                <ArrowUpRight className={cn("size-3.5 transition-opacity", lit === sc.id ? "opacity-100" : "opacity-0")} />
              </a>
            )
          })}
        </div>
      </nav>
    </main>
  )
}
