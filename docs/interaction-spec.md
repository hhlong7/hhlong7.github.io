# Desk landing: interaction spec

The landing page (`/`) is a photo of Long's desk. Two things on it are live: the curved monitor and the MacBook screen. Each leads to a real page.

| Screen | Hover / focus shows | Click / Enter / tap goes to |
|---|---|---|
| Monitor | a miniature of the Experience page (work, projects, courses now) mapped onto the glass | `/experience/` |
| Laptop | a miniature of the About page (photo, intro, email, GitHub, LinkedIn, location) | `/about/` |

## States

| State | What you see |
|---|---|
| Loading | room-colored backdrop and a tiny blurred stand-in, then the photo fades in (0.7s) |
| Idle | both screens blurred for privacy; green dots on each screen and the hint "Hover a screen to look, click to go in" until the first hover |
| Preview | the screen lights up with its page (300ms), the rest of the photo dims, a label chip names the destination |
| Zooming | the camera pushes into the screen until it fills the window (720ms), then the page loads; the browser's view transition crossfades the rest |
| Photo failed | a note in the middle; the bottom bar still reaches both pages |

## Rules

- The bottom bar ("Experience", "About me + contact") always works and mirrors hover: pointing at a button lights its screen.
- Touch: no hover, so a tap zooms and goes straight to the page.
- Keyboard: Tab reaches both screens (accent outline on the glass) and both buttons. Focus shows the preview.
- Modifier-click or middle-click opens the page normally in a new tab, no zoom.
- `prefers-reduced-motion`: no zoom, no fades, no pulsing dots; links navigate at once.
- Back button: the page is restored from cache at home framing.
- Framing: on wide windows the photo fills the window; on portrait windows it fits the two screens and feathers its edges into a blurred copy of the room.

## Experience page projects

The project list uses `src/components/ui/project-showcase.tsx`. Hovering a row floats a preview card beside the pointer. Rows open in place for the full write-up and GitHub link. Each project can take `image` in `src/data/content.ts`; until it has one, the preview shows a card built from the project's own facts.
