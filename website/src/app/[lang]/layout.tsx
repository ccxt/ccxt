import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Provider } from '@/components/provider';
import { i18n } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
});

// Enumerate the supported locales so the home page can prerender per-locale; docs
// pages stay on-demand (their page.tsx has no generateStaticParams).
export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function LangLayout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!(i18n.languages as readonly string[]).includes(lang)) notFound();
  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider lang={lang}>{children}</Provider>
      </body>
    </html>
  );
}
