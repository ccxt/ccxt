import type { Metadata } from 'next';
import { appName, siteUrl } from '@/lib/shared';
import './global.css';

// The real <html>/<body> + providers live in app/[lang]/layout.tsx so the document
// language and i18n provider follow the active locale. This root layout is a
// pass-through that only carries site-wide metadata.
export const metadata: Metadata = {
  // metadataBase = origin only (image URLs already carry the basePath); fixes the
  // "using localhost:3000" warning. noindex on the /v2 staging build.
  metadataBase: new URL(siteUrl),
  // Site-wide og:site_name (Discord shows it above the title). Pages that set their own
  // openGraph re-declare siteName, since Next replaces the openGraph object per segment.
  openGraph: { type: 'website', siteName: appName },
  ...(process.env.NEXT_PUBLIC_BASE_PATH ? { robots: { index: false, follow: false } } : {}),
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return children;
}
