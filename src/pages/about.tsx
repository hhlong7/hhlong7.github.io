import { Mail } from "lucide-react"
import { Section, SiteFooter, SiteHeader, TodoNote, enter } from "@/components/site-chrome"
import { bio, community, facts, interests, profile } from "@/data/content"

export function AboutPage() {
  const shownFacts = facts.filter((f) => f.label !== "GitHub")
  return (
    <>
      <SiteHeader current="about" />
      <main>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-16 sm:px-8 sm:pt-24 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-14">
          <img
            {...enter(1)}
            src={profile.photo}
            width={480}
            height={600}
            alt="Long Hoang Ho"
            className="aspect-[4/5] w-full max-w-80 rounded-2xl object-cover shadow-[0_24px_60px_-24px_oklch(0_0_0/.8)]"
          />
          <div>
            <h1 {...enter(0)} className="font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.92] font-bold tracking-[-0.035em]">Hi, I'm Long.</h1>
            <div {...enter(2)} className="mt-7 max-w-[64ch] space-y-4 text-lg text-muted-foreground">
              {bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <dl {...enter(3)} className="mt-9 grid max-w-[64ch] gap-x-8 border-t sm:grid-cols-2">
              {shownFacts.map((f) => (
                <div key={f.label} className="border-b py-3">
                  <dt className="text-xs tracking-wide text-faint uppercase">{f.label}</dt>
                  <dd className="mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
            <a
              {...enter(4)}
              href="/contact/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-fill px-5 py-2.5 font-medium text-on-accent no-underline ring-1 ring-accent/25 transition-[filter,box-shadow] ring-inset hover:brightness-125 hover:ring-accent/50"
            >
              <Mail aria-hidden className="size-4" /> Get in touch
            </a>
          </div>
        </div>

        <Section id="interests" title="Interests">
          <ul className="grid gap-x-10 border-t sm:grid-cols-2">
            {interests.map((it) => (
              <li key={it.title} className="border-b py-6">
                <h3 className="text-lg font-medium">{it.title}</h3>
                <p className="mt-1 text-foreground/80">{it.line}</p>
                <p className="mt-2 text-[15px] text-muted-foreground">{it.more}</p>
                {it.todo && <TodoNote className="mt-3">Draft. Waiting on Long to confirm this line.</TodoNote>}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="community" title="Community">
          <div className="space-y-12">
            {[
              { name: "Organizations", items: community.orgs },
              { name: "Volunteering", items: community.volunteering },
            ].map((g) => (
              <div key={g.name}>
                <h3 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">{g.name}</h3>
                <ul className="divide-y border-y">
                    {g.items.map((o: { name: string; meta: string; body?: string }) => (
                    <li key={o.name} className="py-4">
                      <span className="font-medium">{o.name}</span>
                      <span className="block text-sm text-faint">{o.meta}</span>
                      {o.body && <p className="mt-1.5 text-muted-foreground">{o.body}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">Leadership</h3>
              <TodoNote>{community.leadershipTodo}</TodoNote>
            </div>
          </div>
        </Section>

      </main>
      <SiteFooter />
    </>
  )
}
