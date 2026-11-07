# Desk portfolio: interaction spec

The scene is a photo of Long's real desk (`assets/art/desk-*.webp`). The objects that aren't on the real desk were AI-edited in. Every clickable object is an invisible SVG shape traced over the photo. The two screens (monitor and iPad) and the LED clock are live overlays, so their text stays crisp and real.

## 1. States

```
            load ──► LOADING ──(low-res photo ready)──► INTRO ──(push-in done)──► IDLE
                        │                                                       ▲   │
                        └──(photo fails)──► FALLBACK (vector-free, dock only)   │   │ hover / focus
                                                                                │   ▼
                                                                                │ PREVIEW (object lit, label shown)
                                                                                │   │ click / Enter / Space / dock / #hash
                                                                                │   ▼
                                                     Esc / Back / veil / back ──┴─ ZOOMING ──(~560ms)──► OPEN
                                                                                       ▲                  │
                                                                                       └── other object ◄─┘ (dock or hash: re-zoom)
iPad: PREVIEW ──click──► new tab /v1/ (scene stays IDLE)
Books on shelf: click ──► ZOOMING(done) ──► OPEN + scroll to that card
```

| State | Scene | Panel | Focus |
|---|---|---|---|
| LOADING | dark wall color + blurred 24px placeholder | none | body |
| INTRO | camera eases from 118% to home, 1.6s | none | body |
| IDLE | home framing, pulse dots on objects until first interaction | none | last opener or body |
| PREVIEW | rest of photo dims to 70%, object gets a soft light edge, label chip appears | none | the object |
| ZOOMING | camera flies to object, veil fades in | hidden | unchanged |
| OPEN | object framed at left (desktop) or top (phone), others dimmed | visible, focus trapped | Back button |
| FALLBACK | photo hidden, dock is the navigation | works as normal | dock |

## 2. Micro-interactions

| Trigger | Rule | Feedback | Loop / mode |
|---|---|---|---|
| Pointer enters object | none while OPEN | spotlight dim of others (180ms), label chip | ends on leave |
| Focus object (Tab) | same as hover | same plus a 2px focus outline traced on the shape | ends on blur |
| Click / Enter / Space | open its view | zoom + panel, dock item marked current | – |
| Book spine on shelf | open Past projects | zoom, then scroll to card + 1.4s accent flash | – |
| Sticky note | toggle | expands paragraph, straightens rotation | – |
| Copy email | clipboard write | label becomes "Copied" for 1.6s, fallback selects text | – |
| Resume link | file missing | row text becomes "Resume coming soon" | – |

## 3. Motion

- Camera: cubic in-out on viewBox, 950ms open, 850ms close. Zoom is geometric (scale interpolated in log space) so it feels like a dolly, not a jump.
- Panel: 400ms fade + 34px slide (desktop) or bottom-sheet slide (phone), starts 560ms into the zoom.
- Idle life (quiet): the clock colon blinks each second, a VS Code cursor blinks at 1.06s, the light bar glow breathes over 6s at ±8% opacity, and the monitor gets a 0.6% brightness flicker every ~9s.
- `prefers-reduced-motion`: no camera tweening (instant cut), no breathing, no flicker, no pulse halos. The colon stays solid.

## 4. Gestures

- Tap = click. No hover on touch: the first tap opens directly (no two-tap preview).
- Hit areas are at least 44×44 CSS px at home framing. Small objects (the photo frame) get an enlarged invisible hit pad.
- Swipe down on the bottom-sheet handle closes the panel on phones. Browser back closes via the hash.
- No pinch-zoom hijack: the page keeps the browser's own zoom.

## 5. Feedback

- First visit: green pulse dots on each object and the hint "Click anything on the desk". Both disappear after the first interaction.
- Hover/focus label chip names the destination ("Experience", "Old portfolio ↗").
- Current view is mirrored in the dock (`aria-current`) and in the URL hash.

## 6. Errors

- Photo fails to load: FALLBACK state. The scene shows the wall color with a note, and the dock and deep links still work.
- JavaScript off: the `<noscript>` block lists every section's content.
- Unknown hash: ignored, stays IDLE.
- Missing `me.jpg` / `resume.pdf`: degrade as above, no broken image icon.

## 7. Loading

- A tiny inline blurred preview (≈1KB data URI) paints immediately at the right aspect ratio, so there's no layout shift.
- 2400px WebP loads next (eager, `fetchpriority=high`). The full-res photo is fetched only after the first zoom, then swapped in for sharp close-ups.
- Fonts use `display=swap`, and screen overlays render with system fallbacks until the fonts arrive.
