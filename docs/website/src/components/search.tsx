'use client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const { search, setSearch, query } = useDocsSearch({
    // Server-side search: send the query (+ locale) to /api/search and let the server
    // query the right per-locale Orama index. No index is downloaded to the browser.
    type: 'fetch',
    // basePath-aware: under /v2 the route lives at /v2/api/search (Next doesn't prepend
    // basePath to fetch()). Empty for the root build.
    api: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/search`,
    locale,
  });

  // one analytics event per settled search (1 s after typing stops): the query's length and
  // how many results it found, never the query text
  const results = Array.isArray(query.data) ? query.data.length : 0;
  useEffect(() => {
    const length = search.trim().length;
    if (length < 2 || query.isLoading) return;
    const timer = setTimeout(() => track('docs_search', { query_length: length, results, locale: locale ?? 'en' }), 1000);
    return () => clearTimeout(timer);
  }, [search, results, query.isLoading, locale]);

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
