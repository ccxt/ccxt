import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSans } from "@remotion/google-fonts/SpaceGrotesk";

export const mono = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
}).fontFamily;
export const sans = loadSans("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const C = {
  bg: "#06070a",
  panel: "#0e1118",
  border: "#252a36",
  grid: "rgba(0, 240, 168, 0.10)",
  text: "#eef0f5",
  dim: "#8b92a5",
  accent: "#00f0a8",
  green: "#3ddc84",
  cyan: "#5ccfe6",
  string: "#e6c07b",
  claude: "#d97757",
};

export const gradientText: React.CSSProperties = {
  backgroundImage: "linear-gradient(90deg, #00f5a0 0%, #00c2ff 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
