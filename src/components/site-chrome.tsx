import { useEffect, type CSSProperties, type ReactNode } from "react"
import { ArrowLeft, ArrowUpRight, Laptop, Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { profile } from "@/data/content"
import { useTheme } from "@/lib/theme"

type Page = "experience" | "about"

const links = [
  { id: "experience" as const, href: "/experience/", label: "Experience", icon: Monitor },
  { id: "about" as const, href: "/about/", label: "About + contact", icon: Laptop },
]

const SCREEN = { experience: "monitor", about: "laptop" } as const

/** Stagger slot for the entrance played when the page is entered through a desk screen. */
export const enter = (i: number) => ({ "data-enter": "", style: { "--i": i } as CSSProperties })

export function SiteHeader({ current }: { current: Page }) {
  // Leave a note for the desk, so coming back (link or back button) pulls out of this page's screen.
  useEffect(() => {
    const note = () => {
      try { sessionStorage.setItem("desk:return", JSON.stringify({ id: SCREEN[current], t: Date.now() })) } catch { /* ignore */ }
    }
    window.addEventListener("pagehide", note)
    return () => window.removeEventListener("pagehide", note)
  }, [current])
  return (
    <header className="site-header sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="/" className="group flex min-w-0 items-center gap-3 text-foreground no-underline">
          <span
            aria-hidden
            className="relative h-8 w-12 flex-none overflow-hidden rounded-md border bg-cover"
            style={{ backgroundImage: "url(/assets/desk/desk-1200.webp)", backgroundPosition: "47% 34%", backgroundSize: "260%" }}
          >
            <span className="absolute inset-0 grid place-items-center bg-background/55 opacity-0 transition-opacity group-hover:opacity-100">
              <ArrowLeft className="size-4" />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[17px] leading-tight font-bold tracking-tight">{profile.name}</span>
            <span className="block text-xs text-muted-foreground group-hover:text-foreground">Back to the desk</span>
          </span>
        </a>
        <nav aria-label="Pages" className="flex gap-1">
          {links.map(({ id, href, label, icon: Icon }) => (
            <a
              key={id}
              href={href}
              aria-current={current === id ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium no-underline transition-colors sm:px-4",
                current === id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon aria-hidden className="size-4" />
              <span className={cn(current !== id && "max-sm:sr-only")}>{label}</span>
            </a>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === "light" ? "dark" : "light"
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="group ml-1 grid size-9 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <span className="relative size-4">
        <Sun aria-hidden className={cn("absolute inset-0 size-4 transition-[opacity,rotate,scale] duration-300 ease-out-expo", theme === "light" ? "scale-50 -rotate-90 opacity-0" : "")} />
        <Moon aria-hidden className={cn("absolute inset-0 size-4 transition-[opacity,rotate,scale] duration-300 ease-out-expo", theme === "dark" ? "scale-50 rotate-90 opacity-0" : "")} />
      </span>
    </button>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:px-8">
        <span>{profile.name} · {profile.tagline}</span>
        <span className="flex gap-6">
          <a href="/" className="text-muted-foreground hover:text-foreground">The desk</a>
          <a href="/v1/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            The first version of this site <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        </span>
      </div>
    </footer>
  )
}

/** A section with its heading in a left rail on wide screens. */
export function Section({ id, title, aside, children, enterAt }: { id: string; title: string; aside?: ReactNode; children: ReactNode; enterAt?: number }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} {...(enterAt !== undefined ? enter(enterAt) : {})} className="mx-auto mt-24 grid max-w-6xl gap-x-12 gap-y-6 px-5 sm:px-8 lg:grid-cols-[13rem_1fr]">
      <div>
        <h2 id={`${id}-h`} className="font-display text-3xl font-bold tracking-tight lg:sticky lg:top-24">
          {title}
        </h2>
        {aside && <div className="mt-3 text-sm text-muted-foreground lg:sticky lg:top-36">{aside}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

/** Something Long still has to write. Shown plainly so it never passes as finished copy. */
export function TodoNote({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-dashed border-todo/60 px-4 py-3 text-sm text-todo", className)}>
      <span className="font-medium">To fill in{title ? `: ${title}` : ""}.</span> <span className="text-todo/80">{children}</span>
    </div>
  )
}

export function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-1.5" aria-label="Tools">
      {items.map((t) => (
        <li key={t} className="rounded-full bg-secondary px-2.5 py-0.5 font-detail text-xs text-muted-foreground">
          {t}
        </li>
      ))}
    </ul>
  )
}
