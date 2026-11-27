"use client"

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Based on the 21st.dev ProjectShowcase. Changes from the original:
// - projects come in as props instead of a hard-coded list;
// - each row opens in place to show the full write-up (rows were bare links before);
// - the floating preview is positioned inside the section and only animates while it is
//   visible, writing its transform directly instead of re-rendering every frame;
// - with no image, the preview shows a spec card built from the project's own facts.

export interface ShowcaseProject {
  id: string
  title: string
  description: string
  year: string
  link?: string
  image?: string
  stack: string[]
  stat?: { value: string; label: string }
  details: ReactNode
}

interface ProjectShowcaseProps {
  heading: string
  projects: ShowcaseProject[]
  className?: string
}

const PREVIEW = { w: 280, h: 180, dx: 28, dy: -110 }

export function ProjectShowcase({ heading, projects, className }: ProjectShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())
  const containerRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })
  const frame = useRef<number | null>(null)
  const headingId = useId()

  const hovered = hoveredIndex === null ? null : projects[hoveredIndex]
  const isVisible = hovered !== null && !openIds.has(hovered.id)

  useEffect(() => {
    if (!isVisible) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      const k = still ? 1 : 0.15
      smooth.current = { x: lerp(smooth.current.x, target.current.x, k), y: lerp(smooth.current.y, target.current.y, k) }
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${smooth.current.x + PREVIEW.dx}px, ${smooth.current.y + PREVIEW.dy}px, 0)`
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [isVisible])

  const handleMouseMove = (e: MouseEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Keep the card inside the section so it never hangs off the right edge of the page.
    const x = Math.min(e.clientX - rect.left, rect.width - PREVIEW.w - PREVIEW.dx)
    target.current = { x, y: e.clientY - rect.top }
  }

  const handleMouseEnter = (index: number, e: MouseEvent) => {
    if (hoveredIndex === null) {
      handleMouseMove(e)
      smooth.current = { ...target.current }
    }
    setHoveredIndex(index)
  }

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      aria-labelledby={headingId}
      className={cn("relative w-full", className)}
    >
      <h3 id={headingId} className="mb-5 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {heading}
      </h3>

      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-20 hidden overflow-hidden rounded-xl shadow-[0_24px_48px_-16px_oklch(0_0_0/.75)] [@media(hover:hover)]:block"
        style={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8,
          transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="relative overflow-hidden rounded-xl bg-secondary" style={{ width: PREVIEW.w, height: PREVIEW.h }}>
          {projects.map((project, index) => {
            const on = hoveredIndex === index
            const style = { opacity: on ? 1 : 0, scale: on ? 1 : 1.1, filter: on ? "none" : "blur(10px)" }
            const cls = "absolute inset-0 size-full transition-all duration-500 ease-out"
            return project.image ? (
              <img key={project.id} src={project.image} alt="" className={cn(cls, "object-cover")} style={style} />
            ) : (
              <SpecCard key={project.id} project={project} className={cls} style={style} />
            )
          })}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>
      </div>

      <ul className="space-y-0">
        {projects.map((project, index) => {
          const isHovered = hoveredIndex === index
          const isOpen = openIds.has(project.id)
          const panelId = `${headingId}-${project.id}`
          return (
            <li key={project.id} className="border-t border-border">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(project.id)}
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative block w-full cursor-pointer py-5 text-left focus-visible:outline-offset-4"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 -mx-4 rounded-lg bg-secondary/50 transition-all duration-300 ease-out",
                    isHovered || isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
                  )}
                />
                <span className="relative flex items-start justify-between gap-4">
                  <span className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-lg font-medium tracking-tight text-foreground">
                        <span className="relative">
                          {project.title}
                          <span
                            aria-hidden
                            className={cn(
                              "absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-300 ease-out",
                              isHovered ? "w-full" : "w-0",
                            )}
                          />
                        </span>
                      </span>
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "size-4 text-muted-foreground transition-all duration-300 ease-out",
                          isOpen
                            ? "translate-x-0 translate-y-0 rotate-180 opacity-100"
                            : isHovered
                              ? "translate-x-0 translate-y-0 opacity-100"
                              : "-translate-x-2 -translate-y-1 opacity-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-sm leading-relaxed transition-all duration-300 ease-out",
                        isHovered ? "text-foreground/75" : "text-muted-foreground",
                      )}
                    >
                      {project.description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "pt-1 font-detail text-xs tabular-nums transition-all duration-300 ease-out",
                      isHovered ? "text-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {project.year}
                  </span>
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-label={project.title}
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-400 ease-out-expo",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
                inert={!isOpen}
              >
                <div className="overflow-hidden">
                  <div className="pt-1 pb-7">
                    {project.details}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener"
                        className="mt-5 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:border-accent hover:text-accent"
                      >
                        View on GitHub <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="border-t border-border" />
    </section>
  )
}

function SpecCard({
  project,
  className,
  style,
}: {
  project: ShowcaseProject
  className: string
  style: React.CSSProperties
}) {
  return (
    <div className={cn(className, "flex flex-col justify-between bg-secondary p-5")} style={style}>
      <div className="font-display text-xl leading-tight font-bold tracking-tight text-balance">{project.title}</div>
      {project.stat && (
        <div>
          <div className="font-detail text-2xl font-medium text-accent tabular-nums">{project.stat.value}</div>
          <div className="text-xs text-muted-foreground">{project.stat.label}</div>
        </div>
      )}
      <div className="truncate font-detail text-[11px] text-muted-foreground">{project.stack.slice(0, 4).join(" · ")}</div>
    </div>
  )
}
