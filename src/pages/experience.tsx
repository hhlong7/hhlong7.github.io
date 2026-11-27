import { ProjectShowcase, type ShowcaseProject } from "@/components/ui/project-showcase"
import { Section, SiteFooter, SiteHeader, Tags, TodoNote } from "@/components/site-chrome"
import {
  coursesDone,
  coursesNow,
  coursesPlanned,
  currentProjects,
  facts,
  finishedProjects,
  work,
  type Course,
  type Project,
} from "@/data/content"

function toShowcase(p: Project): ShowcaseProject {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    year: p.year,
    link: p.link,
    image: p.image,
    stack: p.stack,
    stat: p.stats?.[0],
    details: <ProjectDetails p={p} />,
  }
}

function ProjectDetails({ p }: { p: Project }) {
  return (
    <div className="max-w-[68ch] space-y-4 text-[15px] text-muted-foreground">
      <p className="font-mono text-xs text-faint">{p.meta}</p>
      {p.body.map((t) => (
        <p key={t}>{t}</p>
      ))}
      {p.bullets && (
        <ul className="list-disc space-y-1.5 pl-5 marker:text-faint">
          {p.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {p.stats && (
        <dl className="flex flex-wrap gap-x-8 gap-y-3 border-y py-3">
          {p.stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-mono text-base text-foreground tabular-nums">
                {s.value} <span className="font-sans text-sm text-muted-foreground">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {p.todo && <TodoNote title={p.todo.title}>{p.todo.text}</TodoNote>}
      {p.after && <p>{p.after}</p>}
      <Tags items={p.stack} />
    </div>
  )
}

function CourseList({ courses }: { courses: Course[] }) {
  return (
    <ul className="divide-y border-y">
      {courses.map((c) => (
        <li key={c.code} className="grid gap-x-6 gap-y-0.5 py-3.5 sm:grid-cols-[6.5rem_1fr]">
          <span className="font-mono text-sm text-accent tabular-nums">{c.code}</span>
          <span>
            <span className="font-medium">{c.title}</span>
            {c.note && <span className="block text-sm text-muted-foreground">{c.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

const jump = [
  { href: "#work", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
]

export function ExperiencePage() {
  const school = Object.fromEntries(facts.map((f) => [f.label, f.value]))
  return (
    <>
      <SiteHeader current="experience" />
      <main>
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-24">
          <h1 className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.92] font-bold tracking-[-0.035em]">Experience</h1>
          <p className="mt-6 max-w-[52ch] text-lg text-muted-foreground sm:text-xl">
            Where I've worked, what I'm building, and the courses I'm taking. Open any project for the full write-up.
          </p>
          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
            {jump.map((j) => (
              <a
                key={j.href}
                href={j.href}
                className="rounded-full border px-4 py-1.5 text-sm font-medium text-foreground no-underline transition-colors hover:border-accent hover:text-accent"
              >
                {j.label}
              </a>
            ))}
          </nav>
        </div>

        <Section id="work" title="Work">
          <ol className="divide-y border-y">
            {work.map((j) => (
              <li key={j.role} className="grid gap-x-8 gap-y-1 py-6 md:grid-cols-[11rem_1fr]">
                <span className="pt-0.5 font-mono text-sm text-muted-foreground tabular-nums">
                  {j.todo ? <span className="text-todo">Dates to fill in</span> : j.when}
                </span>
                <div className="max-w-[68ch]">
                  <h3 className="text-lg leading-snug font-medium">{j.role}</h3>
                  <p className="text-sm text-faint">{j.org}</p>
                  <p className="mt-2 text-muted-foreground">{j.body}</p>
                  {j.todo && <TodoNote className="mt-3" title={j.todo}>Waiting on Long.</TodoNote>}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="projects" title="Projects" aside="Hover for a preview, click to open.">
          <div className="space-y-16">
            <ProjectShowcase heading="Building now" projects={currentProjects.map(toShowcase)} />
            <ProjectShowcase heading="Finished" projects={finishedProjects.map(toShowcase)} />
          </div>
        </Section>

        <Section id="education" title="Education">
          <div className="border-y py-6">
            <h3 className="text-xl font-medium">{school.School}</h3>
            <p className="text-muted-foreground">
              {school.Degree} · graduating {school.Graduating}
            </p>
            <p className="mt-2 text-sm text-faint">Focus: {school.Focus}</p>
          </div>

          <div className="mt-12 space-y-12">
            <div>
              <h3 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">Taking now</h3>
              <CourseList courses={coursesNow} />
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">Spring 2027 · planned</h3>
              <CourseList courses={coursesPlanned} />
            </div>
            {coursesDone.map((g) => (
              <div key={g.name}>
                <h3 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">{g.name}</h3>
                <CourseList courses={g.courses} />
              </div>
            ))}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  )
}
