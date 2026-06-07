// Official CCXT logo: a filled rounded square with the CC / XT pixel glyphs
// knocked out of it (a 2x2 grid of C, C, X-checker, T on a 90x90 grid).
//
// Theme-adaptive in a single asset — the box is `currentColor` (the surrounding
// foreground) and the glyphs are the page background, so it renders as a dark box
// with light glyphs in light mode and a light box with dark glyphs in dark mode.
// No basePath-aware <img> URL or separate light/dark files needed.
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
      <rect width="90" height="90" rx="16" fill="currentColor" />
      {/* glyphs knocked out in the page background colour */}
      <g style={{ fill: 'var(--color-fd-background)' }}>
        {/* top-left C */}
        <path d="M10 10h30v8H18v14h22v8H10z" />
        {/* top-right C */}
        <path d="M50 10h30v8H58v14h22v8H50z" />
        {/* bottom-left X (checker) */}
        <rect x="10" y="50" width="8" height="8" />
        <rect x="32" y="50" width="8" height="8" />
        <rect x="21" y="61" width="8" height="8" />
        <rect x="10" y="72" width="8" height="8" />
        <rect x="32" y="72" width="8" height="8" />
        {/* bottom-right T */}
        <path d="M50 50h30v8H69v22h-8V58H50z" />
      </g>
    </svg>
  );
}
