# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters and hiring engineers at chip, GPU and CPU companies screening Long for hardware internships. They give the site a minute or two and need to see real RTL and computer-architecture depth quickly.

## Product Purpose

The personal portfolio of Long Hoang Ho, an Electrical Engineering student (CS minor) at Cal Poly San Luis Obispo, graduating 2028. It exists to support Long's search for Summer 2027 internships in GPU or CPU architecture, RTL design and verification, and physical design. Success means a screener leaves knowing what Long has built, what he is building now, and how to reach him.

## Positioning

The site opens on an unedited photo of Long's real desk. The two screens on it are the navigation: hovering the curved monitor pops up a preview of the Experience page, hovering the laptop pops up About + contact, and clicking either zooms into that screen and opens the page. The work shown is hardware-level and verifiable: a 7-stage RV32IMAC core with measured test and cycle results, an RV32IM GPU fork, and KV-cache research.

## Operating Context

- Visitors arrive from a résumé, application, LinkedIn or GitHub link, on desktop or phone.
- Three real pages: `/` (the desk), `/experience/` (work, projects, education and courses) and `/about/` (about me, interests, community, contact at `#contact`).
- The first portfolio stays live at `/v1/`, linked from every page footer.
- Interaction rules for the desk are in `docs/interaction-spec.md`; photo files and how to retrace the screens are in `docs/desk-photo.md`.

## Capabilities and Constraints

- Vite + React + TypeScript + Tailwind CSS v4, shadcn project structure (`components.json`, UI components in `src/components/ui`). Built by GitHub Actions (`.github/workflows/deploy.yml`) and served by GitHub Pages; static files live in `public/`.
- All site copy lives in `src/data/content.ts`.
- The landing is one photo (`public/assets/desk/`) with screen outlines traced in `src/desk/geometry.ts`. A new photo means retracing them.
- Must degrade cleanly: photo failure leaves the bottom bar working, missing files never show broken images. With JavaScript off, a `<noscript>` note gives the email and GitHub link.
- Open content items, waiting on Long's own wording (do not fill in): KBR internship title and dates, the out-of-order core description, Long's part in the CPE 5350 team project, leadership roles, and confirmation of the FPT and AI-ethics drafts. The "what I'm looking for" line and the "Up next" plans are held off the site until Long approves them.
- Project preview images: Long will supply his own (screenshots, waveforms, board photos). Until then the preview shows a card built from the project's facts. No stock imagery.
- `resume.pdf` does not exist yet; the link shows "Resume coming soon".

## Brand Commitments

- Name as shown: Long Hoang Ho. Tagline: "EE + CS · Cal Poly SLO".
- Voice: first person, plain and specific, honest about status ("Still early, so no big conclusions yet", "Plans, not results").
- Landing page: the desk photo Long supplied (`public/assets/desk/desk.jpg`) is used as given, never edited. Its screens are shown unblurred, by Long's choice; previews pop up beside the pointer rather than covering the screens.

## Evidence on Hand

- Project facts and metrics already in `index.html`: 23/23 directed tests, 16/16 seeded random runs, 914 vs 1047 cycles (7-stage vs 5-stage), FreeRTOS boot and CoreMark in simulation, 13 re-assembled GPU kernels.
- Assets: the desk photo (`public/assets/desk/`), `public/assets/me.jpg` (from `public/v1/P1040944.jpg`), `public/assets/og-image.jpg`.
- GitHub: github.com/hhlong7.
- No testimonials, references, employer endorsements or publications exist. Do not invent them, and do not add metrics beyond those Long has stated.

## Product Principles

1. Depth over breadth: lead with the hardware work a screener can verify.
2. Honest status: label in-progress and planned work as such, and leave TODOs for Long rather than guessing.
3. The desk is the interface, not decoration: every object leads somewhere real.
4. Never trap the visitor: the bottom bar, real page URLs and the header nav always reach every page.

## Accessibility & Inclusion

- Both desk screens are keyboard-reachable with a visible focus outline, and the bottom bar duplicates them as plain links.
- The browser's own pinch zoom is never hijacked.
- `prefers-reduced-motion` removes the zoom, fades, pulsing dots and the page entrance.
