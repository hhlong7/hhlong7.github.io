import { useEffect, useState } from "react"

export type Theme = "light" | "dark"

const KEY = "theme"
const SYSTEM_LIGHT = "(prefers-color-scheme: light)"
const META = { light: "#eceee8", dark: "#121610" }

const current = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark")

function apply(t: Theme, fade: boolean) {
  const root = document.documentElement
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  if (fade && !reduce) {
    root.classList.add("theme-switching")
    window.setTimeout(() => root.classList.remove("theme-switching"), 350)
  }
  root.dataset.theme = t
  const meta = document.querySelector<HTMLMetaElement>("meta[name=theme-color]")
  if (meta && !root.classList.contains("theme-dark")) meta.content = META[t]
}

/** The page's theme. Starts from what the head script set; follows the system until the visitor picks one. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current)

  useEffect(() => {
    const mq = matchMedia(SYSTEM_LIGHT)
    const onSystem = () => {
      let saved: string | null = null
      try { saved = localStorage.getItem(KEY) } catch { /* ignore */ }
      if (saved === "light" || saved === "dark") return
      const t: Theme = mq.matches ? "light" : "dark"
      apply(t, true)
      setTheme(t)
    }
    mq.addEventListener("change", onSystem)
    return () => mq.removeEventListener("change", onSystem)
  }, [])

  const toggle = () => {
    const t: Theme = theme === "light" ? "dark" : "light"
    apply(t, true)
    setTheme(t)
    try {
      // Matching the system again clears the choice, so the site goes back to following it.
      if (t === (matchMedia(SYSTEM_LIGHT).matches ? "light" : "dark")) localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, t)
    } catch { /* ignore */ }
  }

  return { theme, toggle }
}
