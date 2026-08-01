// The official CCXT mark (from docs.ccxt.com/v2): a solid square in the current
// color with the "CCXT" letters knocked out in the page background — so it adapts
// to light/dark automatically (dark square + light letters in light mode, and the
// inverse in dark mode).
export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" role="img" aria-label="CCXT">
      <rect width="90" height="90" fill="currentColor" />
      <g style={{ fill: "hsl(var(--background))" }}>
        <path d="M10 10h30v10H20v10h20v10H10z" />
        <path d="M50 10h30v10H60v10h20v10H50z" />
        <rect x="10" y="50" width="10" height="10" />
        <rect x="30" y="50" width="10" height="10" />
        <rect x="20" y="60" width="10" height="10" />
        <rect x="10" y="70" width="10" height="10" />
        <rect x="30" y="70" width="10" height="10" />
        <path d="M50 50h30v10H70v20h-10V60H50z" />
      </g>
    </svg>
  );
}
