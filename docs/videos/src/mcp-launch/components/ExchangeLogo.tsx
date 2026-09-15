import { sans } from "../../theme";

type Brand = { bg: string; fg: string; label: string; border?: string };

// Typographic stand-ins in each exchange's brand colours. To use official artwork,
// drop SVGs into public/logos/ and render <Img src={staticFile(`logos/${id}.svg`)} /> here.
const BRANDS: Record<string, Brand> = {
  binance: { bg: "#F0B90B", fg: "#1E2026", label: "BINANCE" },
  bybit: {
    bg: "#17181E",
    fg: "#F7A600",
    label: "BYBIT",
    border: "rgba(247, 166, 0, 0.45)",
  },
  kraken: { bg: "#7132F5", fg: "#FFFFFF", label: "kraken" },
};

export const ExchangeLogo: React.FC<{ id: string; size: number }> = ({
  id,
  size,
}) => {
  const brand = BRANDS[id];
  const compact = size < 80;
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size * 0.24,
        background: brand.bg,
        color: brand.fg,
        border: `2px solid ${brand.border ?? "rgba(255, 255, 255, 0.12)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: sans,
        fontWeight: 700,
        fontSize: compact ? size * 0.52 : size * 0.17,
        letterSpacing: compact ? 0 : "0.04em",
        boxShadow: compact
          ? "none"
          : `0 ${size * 0.1}px ${size * 0.35}px ${brand.bg}66`,
      }}
    >
      {compact ? brand.label[0].toUpperCase() : brand.label}
    </div>
  );
};
