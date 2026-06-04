// CCXT wordmark glyph rendered as inline SVG so it adapts to any theme via
// `currentColor` and needs no basePath-aware asset URL. Pixel grid matches the
// official ccxt mark: a 2x2 arrangement of C, C, X (checker), T on a 9x9 grid.
import type { SVGProps } from 'react';

export function CcxtMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 90 90"
      role="img"
      aria-label="CCXT"
      fill="currentColor"
      {...props}
    >
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
    </svg>
  );
}
