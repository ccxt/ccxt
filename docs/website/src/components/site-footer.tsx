import Link from 'next/link';
import { i18n } from '@/lib/i18n';

// Site-wide footer: copyright plus a link to the /contact page (which lists the
// email and community channels). Rendered below every layout from [lang]/layout.tsx.
export function SiteFooter({ lang }: { lang: string }) {
  // default locale keeps un-prefixed URLs (/contact); others get /<locale>/contact
  const prefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t py-6 text-sm text-fd-muted-foreground">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-4">
        <p>
          © {year} CCXT ·{' '}
          <Link href={`${prefix}/about-us`} className="transition-colors hover:text-fd-foreground">
            About
          </Link>{' '}
          ·{' '}
          <Link href={`${prefix}/contact`} className="transition-colors hover:text-fd-foreground">
            Contact
          </Link>
        </p>
      </div>
    </footer>
  );
}
