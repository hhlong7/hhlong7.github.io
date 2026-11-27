import { useState } from "react"
import { ArrowUpRight, Check, Copy, FileText, Mail, MapPin } from "lucide-react"
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons"
import { SiteFooter, SiteHeader, enter } from "@/components/site-chrome"
import { profile } from "@/data/content"

function CopyEmail() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setState("copied")
    } catch {
      // Clipboard blocked: select the address so a manual copy is one keystroke away.
      const el = document.getElementById("email-address")
      if (el) window.getSelection()?.selectAllChildren(el)
      setState("failed")
    }
    window.setTimeout(() => setState("idle"), 1800)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
    >
      {state === "copied" ? <Check aria-hidden className="size-4 text-accent" /> : <Copy aria-hidden className="size-4" />}
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Selected, copy it now" : "Copy email"}</span>
    </button>
  )
}

export function ContactPage() {
  const links = [
    { icon: GithubIcon, label: "GitHub", text: profile.github.label, href: profile.github.href },
    { icon: LinkedinIcon, label: "LinkedIn", text: profile.linkedin.label, href: profile.linkedin.href },
  ]
  return (
    <>
      <SiteHeader current="contact" />
      <main className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-24">
        <h1 {...enter(0)} className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.92] font-bold tracking-[-0.035em]">Get in touch</h1>
        <p {...enter(1)} className="mt-6 max-w-[52ch] text-lg text-muted-foreground sm:text-xl">
          Internships, research, projects, or just hi. Email is the fastest way to reach me.
        </p>

        <div {...enter(2)} className="mt-14 border-y py-8">
          <a
            id="email-address"
            href={`mailto:${profile.email}`}
            className="block font-display text-[clamp(1.6rem,4.6vw,3.25rem)] leading-tight font-bold tracking-tight break-all text-foreground decoration-accent/60 hover:text-accent"
          >
            {profile.email}
          </a>
          <div className="mt-5 flex flex-wrap gap-2">
            <CopyEmail />
            <a
              href={`mailto:${profile.email}?subject=${encodeURIComponent("Hi Long")}`}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:border-accent hover:text-accent"
            >
              <Mail aria-hidden className="size-4" /> Open in mail app
            </a>
          </div>
        </div>

        <ul {...enter(3)} className="divide-y border-b">
          {links.map(({ icon: Icon, label, text, href }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener" className="group flex items-center gap-4 py-4 text-foreground no-underline">
                <Icon className="size-5 text-muted-foreground group-hover:text-accent" />
                <span className="w-20 text-sm text-faint">{label}</span>
                <span className="group-hover:text-accent">{text}</span>
                <ArrowUpRight aria-hidden className="ml-auto size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
              </a>
            </li>
          ))}
          <li className="flex items-center gap-4 py-4">
            <FileText aria-hidden className="size-5 text-muted-foreground" />
            <span className="w-20 text-sm text-faint">Résumé</span>
            {profile.resume.available ? (
              <a href={profile.resume.href} download className="text-foreground">Download (PDF)</a>
            ) : (
              <span className="text-muted-foreground">Coming soon</span>
            )}
          </li>
          <li className="flex items-center gap-4 py-4">
            <MapPin aria-hidden className="size-5 text-muted-foreground" />
            <span className="w-20 text-sm text-faint">Based in</span>
            <span>{profile.basedIn}</span>
          </li>
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
