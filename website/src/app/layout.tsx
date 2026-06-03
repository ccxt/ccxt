import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Provider } from '@/components/provider';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

// Belt-and-suspenders noindex for the /v2 staging build (alongside robots.txt).
export const metadata: Metadata = process.env.NEXT_BASE_PATH
  ? { robots: { index: false, follow: false } }
  : {};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
