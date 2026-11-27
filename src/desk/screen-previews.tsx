import { ArrowUpRight, Copy, Mail, MapPin } from "lucide-react"
import { GithubIcon as Github, LinkedinIcon as Linkedin } from "@/components/brand-icons"
import { coursesNow, currentProjects, facts, finishedProjects, profile, work } from "@/data/content"

// Miniature versions of the pages, laid out at a fixed design size and scaled down inside
// the hover card. They are pictures of the pages, so they stay out of the a11y tree.

function MiniBar({ current }: { current: "experience" | "about" | "contact" }) {
  const item = (id: string, label: string) => (
    <span className={id === current ? "text-foreground" : "text-faint"}>{label}</span>
  )
  return (
    <div className="flex items-center justify-between border-b px-12 py-6 text-[22px]">
      <span className="font-display text-[26px] font-bold tracking-tight">{profile.name}</span>
      <span className="flex gap-9 font-medium">
        {item("desk", "Desk")}
        {item("experience", "Experience")}
        {item("about", "About me")}
        {item("contact", "Contact")}
      </span>
    </div>
  )
}

export function MonitorPreview() {
  const projects = [...currentProjects.slice(0, 3), finishedProjects[0]]
  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <MiniBar current="experience" />
      <div className="grid flex-1 grid-cols-[1.05fr_1fr_1fr_0.9fr] gap-12 px-12 pt-9">
        <div>
          <h2 className="font-display text-[76px] leading-[0.95] font-bold tracking-[-0.03em]">Experience</h2>
          <p className="mt-5 text-[23px] leading-snug text-muted-foreground">
            Where I've worked, what I'm building, and the courses I'm taking.
          </p>
          <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent-fill px-5 py-2 text-[20px] font-semibold text-on-accent">
            Open <ArrowUpRight className="size-5" strokeWidth={2.5} />
          </span>
        </div>
        <MiniColumn title="Work">
          {work.slice(0, 4).map((j) => (
            <MiniRow key={j.role} title={j.short} sub={j.when} />
          ))}
        </MiniColumn>
        <MiniColumn title="Projects">
          {projects.map((p) => (
            <MiniRow key={p.id} title={p.title} sub={p.stack.slice(0, 2).join(" · ")} />
          ))}
        </MiniColumn>
        <MiniColumn title="Courses now">
          {coursesNow.map((c) => (
            <MiniRow key={c.code} title={c.code} sub={c.title} />
          ))}
        </MiniColumn>
      </div>
    </div>
  )
}

function MiniColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="border-b pb-3 font-display text-[28px] font-bold">{title}</h3>
      <div className="divide-y">{children}</div>
    </div>
  )
}

function MiniRow({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="py-3">
      <div className="truncate text-[22px] font-medium leading-tight">{title}</div>
      <div className="truncate text-[18px] text-muted-foreground">{sub}</div>
    </div>
  )
}

export function LaptopPreview() {
  const shown = facts.filter((f) => ["School", "Degree", "Graduating", "Focus"].includes(f.label))
  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b px-12 py-7 text-[26px]">
        <span className="font-display text-[30px] font-bold tracking-tight">{profile.name}</span>
        <span className="text-faint">About me</span>
      </div>
      <div className="flex flex-1 gap-12 px-12 pt-12">
        <img src={profile.photo} alt="" className="h-[330px] w-[264px] flex-none rounded-2xl object-cover" />
        <div className="min-w-0">
          <h2 className="font-display text-[86px] leading-[0.95] font-bold tracking-[-0.03em]">Hi, I'm Long.</h2>
          <p className="mt-5 text-[30px] leading-snug text-muted-foreground">
            EE student at Cal Poly SLO, CS minor. RTL, computer architecture, verification.
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-10 gap-y-5 border-t px-12 py-8">
        {shown.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="text-[19px] tracking-wide text-faint uppercase">{f.label}</dt>
            <dd className="truncate text-[27px]">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function ContactPreview() {
  const rows = [
    { icon: Github, text: "GitHub" },
    { icon: Linkedin, text: "LinkedIn" },
    { icon: MapPin, text: profile.basedIn },
  ]
  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <MiniBar current="contact" />
      <div className="flex-1 px-12 pt-11">
        <h2 className="font-display text-[86px] leading-[0.95] font-bold tracking-[-0.03em]">Get in touch</h2>
        <div className="mt-9 border-y py-7">
          <div className="truncate font-display text-[50px] leading-tight font-bold tracking-tight">{profile.email}</div>
          <div className="mt-5 flex gap-4 text-[22px] font-medium">
            <span className="inline-flex items-center gap-3 rounded-full border px-6 py-2.5"><Copy className="size-6" /> Copy email</span>
            <span className="inline-flex items-center gap-3 rounded-full border px-6 py-2.5"><Mail className="size-6" /> Open in mail app</span>
          </div>
        </div>
        <div className="flex gap-12 py-7 text-[25px]">
          {rows.map(({ icon: Icon, text }) => (
            <span key={text} className="flex min-w-0 items-center gap-3">
              <Icon className="size-7 flex-none text-accent" />
              <span className="truncate">{text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
