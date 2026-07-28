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
