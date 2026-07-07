import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';
import { ccxtMarkDataUrl, ogPrimaryColor, ogPrimaryTextColor } from '@/lib/og-logo';

// Homepage OG/social-card image. Referenced from the home metadata as
// `${basePath}/og/home` so the URL is /v2-aware (Next doesn't prepend basePath to
// metadata image URLs); the per-doc cards live under /og/docs.
export const revalidate = false;

// eslint-disable-next-line @next/next/no-img-element
const ccxtIcon = ccxtMarkDataUrl ? <img src={ccxtMarkDataUrl} width={84} height={84} alt="" /> : undefined;

export async function GET() {
  const image = new ImageResponse(
    (
      <DefaultImage
        title="Connect to any exchange"
        description="One unified crypto trading API across 100+ exchanges — JavaScript, Python, PHP, C#, Go and Java."
        site={appName}
        icon={ccxtIcon}
        primaryColor={ogPrimaryColor}
        primaryTextColor={ogPrimaryTextColor}
      />
    ),
    { width: 1200, height: 630 },
  );
  // Buffer the streamed PNG so the response carries a Content-Length. Telegram's link-preview
  // crawler needs it to fetch the og:image (Discord/Twitter are lenient); ImageResponse streams
  // chunked by default, which is why the Telegram preview stopped expanding after the cutover.
  const png = await image.arrayBuffer();
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': String(png.byteLength),
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
}
