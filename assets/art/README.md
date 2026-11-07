# Desk art

The scene is one photo of the real desk, shown inside the SVG at `0 0 1600 1200` (4:3).

| File | Size | Used for |
|---|---|---|
| `desk-1200.webp` | 1200×900 | phones (screen width × DPR ≤ 1400) and the blurred backdrop |
| `desk-2400.webp` | 2400×1800 | laptops and desktops |
| `desk-4032.webp` | 4032×3024 | loaded after the first zoom, for sharp close-ups |
| `ipad-v1.webp` | 900 wide | screenshot of `/v1/` shown on the iPad |
| `../me.jpg` | 480×600 | About panel photo (cropped from `v1/P1040944.jpg`) |
| `../og-image.jpg` | 1200×630 | link preview |

## How the photo was made

1. `IMG_4585.DNG` converted to JPEG.
2. Monitor and iPad screens blurred, so nothing private shows.
3. Certificate, corkboard, framed picture, bookshelf and book stack were added with Canva's AI edit. Only those regions were blended back onto the full-resolution photo.
4. The AI's fake text was painted out and replaced with real labels: experience on the certificate, interests on the notes, project names on the shelf spines and course names on the book stack. The portrait in the frame is from v1.
5. The LED clock digits were dimmed so the live clock in `desk.js` can draw the current time on top.

## Replacing the photo

Keep the same framing (4:3, same camera spot) and export the three WebP sizes:

```bash
cwebp -q 80 -m 6 -resize 2400 1800 desk.png -o desk-2400.webp
```

If objects move, update the traced `.shape` polygons in `index.html` (press `H` on the desk to see them), the book spine x-ranges and clock digit positions in `js/desk.js`, and the monitor/iPad clip paths.
