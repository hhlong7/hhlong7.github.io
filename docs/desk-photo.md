# Desk photo

The landing page is one photo of Long's real desk, used exactly as he supplied it.

| File | Size | Used for |
|---|---|---|
| `public/assets/desk/desk.jpg` | 2000×1547 | the original photo, unedited; fallback for browsers without WebP |
| `public/assets/desk/desk-2000.webp` | 2000×1547 | laptops and desktops |
| `public/assets/desk/desk-1200.webp` | 1200 wide | phones, the room fill behind the photo, the header thumbnail |
| `src/desk/placeholder.ts` | 48 wide, inline | paints before the photo arrives |
| `public/assets/me.jpg` | 480×600 | About page portrait |
| `public/assets/og-image.jpg` | 1200×630 | link preview |

The screens are shown as they are in the photo, unblurred, by Long's choice.

## Replacing the photo

Export the two WebP sizes from the new photo:

```bash
cwebp -q 84 -m 6 desk.jpg -o desk-2000.webp
```

```bash
cwebp -q 80 -m 6 -resize 1200 0 desk.jpg -o desk-1200.webp
```

Then retrace the screens in `src/desk/geometry.ts`, in original-photo pixels:

- `quad`: the four glass corners (top-left, top-right, bottom-right, bottom-left). The click zoom aims at these.
- `outline`: the visible glass, including the curve of the monitor and the webcam notch. Used for the hit area and the spotlight.
- `FOCUS` / `FOCUS_NARROW`: the area that must stay in view on wide and portrait windows.

Zoomed crops with a pixel ruler are the quickest way to read the corners.
