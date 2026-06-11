import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';

// Homepage OG/social-card image. Referenced from the home metadata as
// `${basePath}/og/home` so the URL is /v2-aware (Next doesn't prepend basePath to
// metadata image URLs); the per-doc cards live under /og/docs.
export const revalidate = false;

export function GET() {
  return new ImageResponse(
    (
      <DefaultImage
        title="Connect to any exchange"
        description="One unified crypto trading API across 100+ exchanges — JavaScript, Python, PHP, C#, Go and Java."
        site={appName}
      />
    ),
    { width: 1200, height: 630 },
  );
}
