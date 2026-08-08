import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';
import { basePath } from '@/lib/shared';

export const revalidate = false;

export function GET() {
  let text = llms(source).index();
  // root-relative links in the index aren't basePath-aware — prefix them under /v2.
  if (basePath) text = text.replaceAll('](/', `](${basePath}/`);
  return new Response(text);
}
