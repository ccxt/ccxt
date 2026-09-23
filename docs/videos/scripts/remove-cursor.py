"""Erase the OS pointer that screenshots of a live product always contain.

If the video draws its own animated cursor — and it should, a static pointer in
a moving shot looks broken — then every capture shows two pointers. This finds
the arrow near a location you give it and fills its footprint.

    python3 scripts/remove-cursor.py public/shots/workspace.png 757,415

Two details matter, both learned by getting them wrong:

  * Fill from a ring around the arrow, never from a blur of the box containing
    it. The box contains a white arrow, so blurring it smears a bright blob back
    over the UI — worse than the pointer was.
  * Measure the footprint, do not assume a box. A fixed box big enough for the
    arrow also erased digits out of a price in one capture; a box small enough
    to be safe left the outline behind.

Needs Pillow and numpy (pip install pillow numpy). Optional tool — if the
capture has no pointer in it, you do not need this.
"""
import sys
from collections import deque

try:
    from PIL import Image, ImageFilter
    import numpy as np
except ImportError:  # pragma: no cover - dependency hint only
    sys.exit("remove-cursor: needs Pillow and numpy (pip install pillow numpy)")

SEARCH = 26      # how far to hunt for the arrow around the given point
MAX_W, MAX_H = 26, 34   # the pointer is never bigger than this
RING = 16        # thickness of the ring sampled for the fill colour
BRIGHT = 150     # the arrow's white body plus its anti-aliased skirt


def find_arrow(lum, cx, cy):
    best, best_score = (cx, cy), -1.0
    for dy in range(-SEARCH, SEARCH + 1, 2):
        for dx in range(-SEARCH, SEARCH + 1, 2):
            x, y = cx + dx, cy + dy
            win = lum[max(0, y - 9):y + 9, max(0, x - 7):x + 7]
            if win.size and (score := float((win > 205).sum())) > best_score:
                best_score, best = score, (x, y)
    return best, best_score


def footprint(lum, cx, cy):
    """Flood fill the bright glyph, clamped so it cannot run into nearby text."""
    x0b, y0b = max(0, cx - MAX_W // 2), max(0, cy - MAX_H // 2)
    sub = lum[y0b:y0b + MAX_H, x0b:x0b + MAX_W]
    if not sub.size:
        return None
    sy, sx = np.unravel_index(int(np.argmax(sub)), sub.shape)
    seen = np.zeros(sub.shape, bool)
    seen[sy, sx] = True
    q, pts = deque([(sy, sx)]), []
    while q:
        y, x = q.popleft()
        pts.append((y, x))
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < sub.shape[0] and 0 <= nx < sub.shape[1] and not seen[ny, nx]:
                if sub[ny, nx] > BRIGHT:
                    seen[ny, nx] = True
                    q.append((ny, nx))
    ys, xs, pad = [p[0] for p in pts], [p[1] for p in pts], 3
    return (x0b + max(0, min(xs) - pad), y0b + max(0, min(ys) - pad),
            x0b + min(sub.shape[1], max(xs) + pad + 1),
            y0b + min(sub.shape[0], max(ys) + pad + 1))


def main(path, near):
    cx, cy = (int(v) for v in near.split(","))
    im = Image.open(path).convert("RGB")
    a = np.array(im)
    lum = 0.299 * a[:, :, 0] + 0.587 * a[:, :, 1] + 0.114 * a[:, :, 2]

    (fx, fy), score = find_arrow(lum, cx, cy)
    if score < 12:
        sys.exit(f"remove-cursor: no pointer near ({cx},{cy}) in {path}")
    box = footprint(lum, fx, fy)
    if box is None:
        sys.exit("remove-cursor: could not measure the pointer")
    x0, y0, x1, y1 = box

    rx0, ry0 = max(0, x0 - RING), max(0, y0 - RING)
    rx1, ry1 = min(im.width, x1 + RING), min(im.height, y1 + RING)
    ring = a[ry0:ry1, rx0:rx1].reshape(-1, 3).astype(np.float32)
    keep = max(1, len(ring) - (x1 - x0) * (y1 - y0))
    fill = np.median(ring[np.argsort(ring.sum(axis=1))[:keep]], axis=0)

    patch = Image.new("RGB", (x1 - x0, y1 - y0), tuple(int(v) for v in fill))
    mask = Image.new("L", (x1 - x0, y1 - y0), 0)
    mask.paste(Image.new("L", (max(1, x1 - x0 - 4), max(1, y1 - y0 - 4)), 255), (2, 2))
    im.paste(patch, (x0, y0), mask.filter(ImageFilter.GaussianBlur(2)))
    im.save(path, quality=94)
    print(f"{path}: removed {x1 - x0}x{y1 - y0}px pointer at ({fx},{fy})")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__.split("\n\n")[1].strip())
    main(sys.argv[1], sys.argv[2])
