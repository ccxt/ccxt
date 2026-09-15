// The official square CCXT mark, same geometry as docs/playground/components/Logo.tsx:
// a solid square with the "CCXT" letters knocked out.
export const CcxtMark: React.FC<{
  size: number;
  style?: React.CSSProperties;
}> = ({ size, style }) => (
  <svg width={size} height={size} viewBox="0 0 90 90" style={style}>
    <rect width="90" height="90" fill="#fafafa" />
    <g fill="#06070a">
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
