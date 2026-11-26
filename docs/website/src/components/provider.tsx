'use client';
import SearchDialog from '@/components/search';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { translations } from '@/lib/i18n-ui';
import { type ReactNode, useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

export function Provider({ lang, children }: { lang: string; children: ReactNode }) {
  // analytics: a visitor switching the docs language (the layout re-renders with the new lang)
  const previous = useRef(lang);
  useEffect(() => {
    if (previous.current !== lang) track('docs_language_changed', { from: previous.current, to: lang });
    previous.current = lang;
  }, [lang]);
  return (
    <RootProvider i18n={i18nProvider(translations, lang)} search={{ SearchDialog }}>
      {children}
    </RootProvider>
  );
}
