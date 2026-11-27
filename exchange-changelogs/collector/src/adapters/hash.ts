// Pages without a changelog: watch the normalized text and emit one synthetic
// "Docs changed: <scope or page path>" entry whenever lines were added or removed, listing the
// added lines. First run only stores the snapshot. Both snapshots are normalized before the
// comparison (the stored file ends with a newline), and a change that only reorders lines
// emits nothing. HTML is reduced to text with strip/slice.selector;
// any other content type is hashed as text. A change smaller than `minChange` characters of added
// (or removed) text, default DEFAULT_MIN_CHANGE, emits nothing; the snapshot is still updated.
import { loadContainer } from './html.ts';
import { nodesToText, type DomNode } from '../htmltext.ts';
import { normalizeWhitespace } from '../normalize.ts';
import { sha256 } from '../ids.ts';
import type { SourceConfig } from '../types.ts';
import type { Adapter, ParsedEntry } from './types.ts';

const MAX_LISTED_LINES = 60;
export const DEFAULT_MIN_CHANGE = 40;

// Volatile bits that change on every request and must not count as a change.
const VOLATILE: RegExp[] = [
    /\b20\d\d-\d\d-\d\d[T ]\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:?\d\d)?\b/g,   // ISO timestamps with time
    /\b\d{1,2}:\d\d:\d\d(?:\s?[AP]M)?\b/gi,                                       // clock times
    /\b1[5-9]\d{8}(?:\d{3})?\b/g,                                                 // unix seconds / ms
    /\b(?:csrf|xsrf|nonce|token|_token|authenticity_token)\b\s*[:=]\s*["']?[\w+/=-]{8,}["']?/gi,
    /\b[0-9a-f]{32,}\b/gi,                                                         // build hashes, request ids
    /\bcf-ray\b[^\n]*/gi,
];

export function normalizeForHash (text: string): string {
    let out = text;
    for (const re of VOLATILE) {
        out = out.replace (re, '');
    }
    return normalizeWhitespace (out.split ('\n').map ((l) => l.replace (/\s+/g, ' ').trim ()).join ('\n'));
}

export function addedLines (previous: string, current: string): string[] {
    const before = new Map<string, number> ();
    for (const line of previous.split ('\n')) {
        if (line.trim ()) {
            before.set (line, (before.get (line) ?? 0) + 1);
        }
    }
    const added: string[] = [];
    for (const line of current.split ('\n')) {
        if (!line.trim ()) {
            continue;
        }
        const n = before.get (line) ?? 0;
        if (n > 0) {
            before.set (line, n - 1);
        } else {
            added.push (line);
        }
    }
    return added;
}

function looksLikeHtml (body: string, contentType: string): boolean {
    return /html|xml/i.test (contentType) || /^\s*</.test (body);
}

// "Docs changed: spot REST" / "Docs changed: /docs/api/info" (scope, else the page path)
export function hashTitle (source: SourceConfig): string {
    if (source.scope?.trim ()) {
        return `Docs changed: ${source.scope.trim ()}`;
    }
    const link = source.link ?? source.url;
    try {
        const u = new URL (link);
        const path = decodeURIComponent (u.pathname + u.hash);
        return `Docs changed: ${path && path !== '/' ? path : u.hostname}`;
    } catch {
        return 'Docs changed';
    }
}

export const hash: Adapter = ({ source, body, contentType, previousSnapshot }) => {
    let text: string;
    if (looksLikeHtml (body, contentType)) {
        const { container } = loadContainer (body, [ ...(source.strip ?? []), 'input', 'meta', 'link' ], source.slice?.selector);
        text = nodesToText (container.toArray () as unknown as DomNode[]);
    } else {
        text = body;
    }
    const snapshot = normalizeForHash (text);
    const entries: ParsedEntry[] = [];
    const previous = previousSnapshot === null ? null : normalizeForHash (previousSnapshot);
    if (previous !== null && previous !== snapshot) {
        const added = addedLines (previous, snapshot);
        const removed = addedLines (snapshot, previous);
        const removedCount = removed.length;
        if (added.length === 0 && removedCount === 0) {
            return { entries, snapshot };
        }
        // noise control: a few changed characters (a counter, a version string) are not a docs change
        const chars = (lines: string[]) => lines.reduce ((n, l) => n + l.length, 0);
        if (Math.max (chars (added), chars (removed)) < (source.minChange ?? DEFAULT_MIN_CHANGE)) {
            return { entries, snapshot };
        }
        const listed = added.slice (0, MAX_LISTED_LINES).map ((l) => '+ ' + l);
        if (added.length > MAX_LISTED_LINES) {
            listed.push (`… and ${added.length - MAX_LISTED_LINES} more added lines`);
        }
        const summary = `${added.length} line(s) added, ${removedCount} line(s) removed.`;
        entries.push ({
            title: hashTitle (source),
            body: summary + (listed.length ? '\n\n' + listed.join ('\n') : ''),
            guid: 'snapshot:' + sha256 (snapshot).slice (0, 16),
        });
    }
    return { entries, snapshot };
};
