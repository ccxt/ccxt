import type { RawEntry, SourceConfig } from '../types.ts';

// RawEntry plus adapter-only hints that never leave the collector.
export interface ParsedEntry extends RawEntry {
    categories?: string[];      // rss/atom categories (titleFilter also matches these)
    context?: string;           // text of the enclosing higher-level heading (date fallback, e.g. "## 2026-11-05")
    partition?: string;         // month sources: "YYYY-MM" of the file the entry came from (set by collect)
    tags?: string[];            // synthetic entries (spec): these tags replace the rule tags of src/tags.ts
}

export interface AdapterInput {
    source: SourceConfig;
    body: string;               // response body
    contentType: string;
    url: string;                // fetched url (base for relative links)
    previousSnapshot: string | null;
    now: Date;
}

export interface AdapterOutput {
    entries: ParsedEntry[];
    snapshot: string;           // normalized text stored in snapshots/<sourceId>.txt (hash input)
}

export type Adapter = (input: AdapterInput) => AdapterOutput | Promise<AdapterOutput>;

export function absoluteUrl (href: string | undefined, base: string): string | undefined {
    if (!href) {
        return undefined;
    }
    try {
        return new URL (href, base).toString ();
    } catch {
        return undefined;
    }
}
