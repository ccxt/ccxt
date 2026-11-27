import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SourceConfig, VenueConfig } from '../src/types.ts';
import { ADAPTERS } from '../src/adapters/index.ts';
import type { AdapterOutput } from '../src/adapters/index.ts';

export const NOW = new Date ('2026-11-08T12:00:00Z');
export const FIXTURES = join (dirname (fileURLToPath (import.meta.url)), 'fixtures');

export function fixture (name: string): string {
    return readFileSync (join (FIXTURES, name), 'utf8');
}

export async function parse (source: SourceConfig, body: string, previousSnapshot: string | null = null, now = NOW): Promise<AdapterOutput> {
    return ADAPTERS[source.type] ({ source, body, contentType: '', url: source.url, previousSnapshot, now });
}

export function venueOf (id: string, domains: string[], sources: SourceConfig[], kind: VenueConfig['kind'] = 'exchange'): VenueConfig {
    return { id, kind, name: id, domains, sources };
}

export const KALSHI: SourceConfig = { id: 'kalshi-changelog', type: 'rss', url: 'https://docs.kalshi.com/changelog/rss.xml', link: 'https://docs.kalshi.com/changelog' };
export const BYBIT: SourceConfig = {
    id: 'bybit-v5',
    type: 'md',
    url: 'https://raw.githubusercontent.com/bybit-exchange/docs/master/docs/changelog/v5.mdx',
    link: 'https://bybit-exchange.github.io/docs/changelog/v5',
    split: { heading: '^##\\s+\\d{4}-\\d{2}-\\d{2}' },
};
export const OKX: SourceConfig = {
    id: 'okx-log',
    type: 'html',
    url: 'https://www.okx.com/docs-v5/log_en/',
    slice: { selector: '.content' },
    split: { heading: 'h2' },
    date: { from: 'anchor', pattern: '^(\\d{4}-\\d{2}-\\d{2})' },
};
