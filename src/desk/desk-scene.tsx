import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type MouseEvent } from "react"
import { ArrowUpRight, Laptop, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { profile } from "@/data/content"
import { FOCUS, FOCUS_NARROW, PHOTO, bbox, frame, polygonCss, polygonSvg, quadToMatrix, screens, type Screen } from "./geometry"
import { LaptopPreview, MonitorPreview } from "./screen-previews"
import { PHOTO_PLACEHOLDER } from "./placeholder"

type Id = Screen["id"]

const SRC = {
  jpg: "/assets/desk/desk.jpg",
  set: "/assets/desk/desk-1200.webp 1200w, /assets/desk/desk-2000.webp 2000w",
}
const ICON = { monitor: Monitor, laptop: Laptop } as const
const PREVIEW = { monitor: MonitorPreview, laptop: LaptopPreview } as const
// Where the hover chip sits: on the wall above the light bar, and on the keyboard below the laptop.
const CHIP = { monitor: { x: 990, y: 352 }, laptop: { x: 979, y: 1212 } } as const

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

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
  const [zooming, setZooming] = useState<Id | null>(null)
  const [touched, setTouched] = useState(false)
  const [photo, setPhoto] = useState<"loading" | "ready" | "failed">("loading")

  // Coming back with the browser's back button restores this page from cache mid-zoom.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => {
      if (e.persisted) { setZooming(null); setActive(null) }
    }
    window.addEventListener("pageshow", reset)
    return () => window.removeEventListener("pageshow", reset)
  }, [])

  const home = useMemo(() => frame(vp.w, vp.h, vp.w < vp.h ? FOCUS_NARROW : FOCUS), [vp])
  // When the photo is smaller than the window on an axis, feather that edge into the room fill.
  const feather = [
    PHOTO.h * home.s < vp.h - 1 && "linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)",
    PHOTO.w * home.s < vp.w - 1 && "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
  ].filter(Boolean) as string[]
  const cam = useMemo(() => {
    if (!zooming) return home
    // Push in until the screen fills the window, so the page seems to come out of it.
    const b = bbox(screens.find((s) => s.id === zooming)!.quad)
    const s = Math.max(vp.w / b.w, vp.h / b.h) * 1.04
    return { s, tx: vp.w / 2 - (b.x + b.w / 2) * s, ty: vp.h / 2 - (b.y + b.h / 2) * s }
  }, [zooming, home, vp])

  const show = useCallback((id: Id | null) => {
    setActive(id)
    if (id) setTouched(true)
  }, [])

  const open = useCallback((e: MouseEvent<HTMLAnchorElement | SVGAElement>, screen: Screen) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (reducedMotion() || photo !== "ready") return
    e.preventDefault()
    setActive(screen.id)
    setZooming(screen.id)
    window.setTimeout(() => window.location.assign(screen.href), 720)
  }, [photo])

  const lit = zooming ?? active

  return (
    <main
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
        className={cn(
          "absolute top-0 left-0 origin-top-left will-change-transform",
          zooming ? "transition-transform duration-[720ms] ease-dolly" : "transition-transform duration-500 ease-out-expo",
        )}
        style={{ width: PHOTO.w, height: PHOTO.h, transform: `translate3d(${cam.tx}px, ${cam.ty}px, 0) scale(${cam.s})` }}
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

        {/* The real screens stay soft at rest; they're private. Same photo, blurred, clipped to the glass. */}
        {photo !== "failed" &&
          screens.map((sc) => (
            <div
              key={sc.id}
              aria-hidden
              className={cn("absolute inset-0 transition-opacity duration-700", photo === "ready" ? "opacity-100" : "opacity-0")}
              style={{ clipPath: polygonCss(sc.outline) }}
            >
              <img src={SRC.jpg} alt="" className="absolute inset-0 size-full blur-[7px] brightness-90 saturate-[.8]" />
            </div>
          ))}

        {/* Spotlight: everything except the lit screen dims a little. */}
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

        {/* The page itself, wired onto the glass. */}
        {screens.map((sc) => {
          const Preview = PREVIEW[sc.id]
          const on = lit === sc.id
          return (
            <div key={sc.id} aria-hidden className="pointer-events-none absolute inset-0" style={{ clipPath: polygonCss(sc.outline) }}>
              <div
                className={cn(
                  "absolute top-0 left-0 origin-top-left transition-[opacity,filter] ease-out-expo",
                  on ? "opacity-100 blur-0 brightness-100 duration-300" : "opacity-0 blur-[6px] brightness-[1.8] duration-200",
                )}
                style={{ width: sc.design.w, height: sc.design.h, transform: quadToMatrix(sc.design.w, sc.design.h, sc.quad) }}
              >
                <Preview />
              </div>
            </div>
          )
        })}

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
              onFocus={() => show(sc.id)}
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
          {!touched &&
            screens.map((sc) => {
              const b = bbox(sc.quad)
              return (
                <g key={sc.id} className="pointer-events-none" transform={`translate(${b.x + b.w / 2} ${b.y + b.h / 2})`}>
                  <circle r={9 / home.s} className="fill-accent" />
                  <circle r={9 / home.s} className="origin-center [transform-box:fill-box] fill-none stroke-accent motion-safe:animate-[halo_2.4s_ease-out_infinite]" strokeWidth={2 / home.s} />
                </g>
              )
            })}
        </svg>

        {/* Label chip for the lit screen. Counter-scaled so it reads at the same size at any zoom. */}
        {screens.map((sc) => {
          const Icon = ICON[sc.id]
          const p = CHIP[sc.id]
          return (
            <div
              key={sc.id}
              aria-hidden
              className={cn(
                "pointer-events-none absolute flex items-center gap-2 rounded-full border bg-background/90 px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap shadow-[0_6px_20px_-6px_oklch(0_0_0/.7)] transition-[opacity,translate] duration-200 ease-out-expo",
                active === sc.id && !zooming ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
              )}
              style={{ left: p.x, top: p.y, transform: `translate(-50%, -50%) scale(${1 / home.s})` }}
            >
              <Icon className="size-4 text-accent" />
              {sc.label}
              <span className="text-muted-foreground">· click to open</span>
            </div>
          )
        })}
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
          <p className="mt-1.5 font-mono text-[11px] tracking-[0.12em] whitespace-nowrap text-muted-foreground uppercase">{profile.tagline}</p>
        </div>
        <p
          className={cn(
            "flex items-center gap-2 pt-1 text-right text-[13px] text-muted-foreground drop-shadow-[0_1px_8px_oklch(0_0_0/.6)] transition-opacity duration-500",
            touched && "opacity-0",
          )}
        >
          <span className="size-2 flex-none rounded-full bg-accent motion-safe:animate-pulse" />
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
                onPointerEnter={() => show(sc.id)}
                onPointerLeave={() => !zooming && show(null)}
                onFocus={() => show(sc.id)}
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
