import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Provider } from '@/components/provider';
import { siteUrl } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

// metadataBase = origin only (image URLs already carry the basePath); fixes the
// "using localhost:3000" warning. noindex on the /v2 staging build.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...(process.env.NEXT_PUBLIC_BASE_PATH ? { robots: { index: false, follow: false } } : {}),
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
