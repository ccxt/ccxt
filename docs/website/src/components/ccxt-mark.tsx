// Official CCXT logo: a filled square with the CC / XT pixel glyphs knocked out
// of it, traced 1:1 from the official mark on a 9x9 cell grid (each glyph cell is
// 10 units on the 90x90 viewBox):
//
//   . . . . . . . . .
//   . # # # . # # # .   CC  (cols 1-3 / 5-7 top, col 1 / 5 mid, cols 1-3 / 5-7 bottom)
//   . # . . . # . . .
//   . # # # . # # # .
//   . . . . . . . . .
//   . # . # . # # # .   X  = (1,5)(3,5)(2,6)(1,7)(3,7)   T = top bar + centre stem
//   . . # . . . # . .
//   . # . # . . # . .
//   . . . . . . . . .
//
// Theme-adaptive in a single asset: the box is `currentColor` (the surrounding
// foreground) and the glyphs are the page background, so it shows a dark box with
// light glyphs in light mode and inverts in dark mode. No basePath-aware <img>
// URL or separate light/dark files needed.
import type { SVGProps } from 'react';

export function CcxtMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 90 90"
      role="img"
      aria-label="CCXT"
      {...props}
    >
      {/* box */}
      <rect width="90" height="90" fill="currentColor" />
      {/* glyphs knocked out in the page background colour */}
      <g style={{ fill: 'var(--color-fd-background)' }}>
        {/* top-left C */}
        <path d="M10 10h30v10H20v10h20v10H10z" />
        {/* top-right C */}
        <path d="M50 10h30v10H60v10h20v10H50z" />
        {/* bottom-left X (checker) */}
        <rect x="10" y="50" width="10" height="10" />
        <rect x="30" y="50" width="10" height="10" />
        <rect x="20" y="60" width="10" height="10" />
        <rect x="10" y="70" width="10" height="10" />
        <rect x="30" y="70" width="10" height="10" />
        {/* bottom-right T */}
        <path d="M50 50h30v10H70v20h-10V60H50z" />
      </g>
    </svg>
  );
}
