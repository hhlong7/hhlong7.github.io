# Desk landing: interaction spec

The landing page (`/`) is a photo of Long's desk. Three things on it are live: the curved monitor, the MacBook screen, and Long's name in the top-left corner. Each leads to a real page.

| Screen | Hover / focus shows | Click / Enter / tap goes to |
|---|---|---|
| Monitor | a pop-up card beside the pointer with a miniature of the Experience page (work, projects, courses now) | `/experience/` |
| Laptop | a pop-up card with a miniature of the About page (photo, intro, school, degree, graduation, focus) | `/about/` |
| Name (top left) | a pop-up card under the name with a miniature of the Contact page (email, copy and mail buttons, GitHub, LinkedIn, location); an arrow appears beside the name | `/contact/` |

## States

| State | What you see |
|---|---|
| Loading | room-colored backdrop and a tiny blurred stand-in, then the photo fades in (0.7s) |
| Idle | the photo as taken, screens unblurred; blue dots on each screen and the hint "Hover a screen to look, click to go in" until the first hover |
| Preview | the rest of the photo dims and a card pops up beside the pointer (fades and scales in over 250ms), then trails the pointer with a slight ease. Its caption names the page and says "Click to open". It flips to the other side of the pointer near the window edges |
| Zooming | the camera pushes straight into the clicked screen, pivoting on its center (850ms). The glass lights up to the page color over the last half, a room-colored veil covers the window, then the page loads |
| Arriving | a page entered through a screen fades its header in and resolves its content top-down: title, intro, then the rest, each rising 20px out of a slight blur (0.8s, 70ms apart). Visiting a page directly skips this |
| Returning | "Back to the desk" (or the back button) opens the desk zoomed inside the screen you left, then pulls back out to the whole desk (1s) |
| Photo failed | a note in the middle; the bottom bar still reaches both pages |

## Rules

- Clicking the name doesn't zoom (there is no screen to fly into): the photo fades to the page color over 320ms, then Contact builds in the same way the other pages do. Coming back fades the desk back in.
- The bottom bar ("Experience", "About me") always works and mirrors hover: pointing at a button lights its screen and shows the card above the button.
- Touch: no hover and no card; a tap zooms and goes straight to the page.
- Keyboard: Tab reaches both screens (accent outline on the glass) and both buttons. Focus shows the card next to the focused item.
- Modifier-click or middle-click opens the page normally in a new tab, no zoom.
- `prefers-reduced-motion`: no zoom, no fades, no pulsing dots; links navigate at once.
- Back button from a page: the desk pulls back out of that page's screen. If the browser restores the desk from cache instead, it shows at home framing.
- Light mode: the Experience and About pages follow the system setting until the visitor uses the sun/moon button at the right of the header. That choice is saved in the browser and applies to both pages; switching back to the system's own mode clears it, so the site follows the system again. In light mode the background takes the dark mode's text color, text takes the dark background, and the blue becomes #4470AD. The desk itself stays dark either way, since it is a photo of a dark room; clicking a screen still fades into the page's own background color.
- Framing: on wide windows the photo fills the window; on portrait windows it fits the two screens and feathers its edges into a blurred copy of the room.

## Experience page projects

The project list uses `src/components/ui/project-showcase.tsx`. Hovering a row floats a preview card beside the pointer. Rows open in place for the full write-up and GitHub link. Each project can take `image` in `src/data/content.ts`; until it has one, the preview shows a card built from the project's own facts.
