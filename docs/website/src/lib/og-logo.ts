import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The CCXT mark, read once at module load and inlined as a data URL so Satori (next/og) can
// render it without a network fetch. Used as the icon on the social-card / Open Graph images
// (replacing fumadocs' default circle). Falls back to undefined — fumadocs' default icon — if
// the asset can't be read, so og generation never crashes.
let ccxtMarkDataUrl: string | undefined;
try {
  const buffer = readFileSync(join(process.cwd(), 'public', 'ccxt-mark-white.png'));
  ccxtMarkDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
} catch {
  ccxtMarkDataUrl = undefined;
}

export { ccxtMarkDataUrl };

// og-card palette — monochrome / on-brand (CCXT black & white, shadcn-subtle) instead of
// fumadocs' default purple. primaryColor tints the accent lines (bottom bar + dashed divider);
// primaryTextColor tints the site name. The card background stays near-black (#0c0c0c).
export const ogPrimaryColor = 'rgba(255,255,255,0.18)';
export const ogPrimaryTextColor = '#fafafa';
