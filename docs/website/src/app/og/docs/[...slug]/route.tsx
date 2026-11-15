import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';
import { ccxtMarkDataUrl, ogPrimaryColor, ogPrimaryTextColor } from '@/lib/og-logo';

// generated on demand + cached forever (not baked into the image for every page)
export const revalidate = false;

// eslint-disable-next-line @next/next/no-img-element
const ccxtIcon = ccxtMarkDataUrl ? <img src={ccxtMarkDataUrl} width={84} height={84} alt="" /> : undefined;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const image = new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
      site={appName}
      icon={ccxtIcon}
      primaryColor={ogPrimaryColor}
      primaryTextColor={ogPrimaryTextColor}
    />,
    {
      width: 1200,
      height: 630,
    },
  );
  // Buffer the streamed PNG so the response carries a Content-Length — Telegram's link-preview
  // crawler needs it to fetch the og:image (Discord/Twitter are lenient).
  const png = await image.arrayBuffer();
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': String(png.byteLength),
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
}
