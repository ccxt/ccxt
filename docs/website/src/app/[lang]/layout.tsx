import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Provider } from '@/components/provider';
import { i18n } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
});

// All routes render on demand (nginx caches). We deliberately do NOT prerender per
// locale: with hideLocale: 'default-locale' + basePath, a statically prerendered /en
// home redirects to / and the root rewrite can't resolve it (the bare /<basePath> 404s).
// Keeping it dynamic lets the locale-routing proxy serve / as the default-locale home.

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
