import { createHash } from 'node:crypto';
import { normalizeWhitespace, oneLine } from './normalize.ts';

export function sha256 (s: string): string {
    return createHash ('sha256').update (s).digest ('hex');
}

export function normalizedTitle (title: string): string {
    return oneLine (title).toLowerCase ();
}

// types.ts: id = sha256(`${sourceId}|${guid ?? (date + '|' + normalizedTitle)}`)
// `date` is the date found at the configured location (title/anchor/pubDate/body), '' if none.
export function entryKey (sourceId: string, guid: string | undefined, date: string | null, title: string): string {
    return `${sourceId}|${guid ?? ((date ?? '') + '|' + normalizedTitle (title))}`;
}

export function entryId (key: string): string {
    return sha256 (key);
}

// Content hash: changes here produce a revisions[] item on an existing id.
export function entryHash (title: string, body: string): string {
    return sha256 (normalizedTitle (title) + '\n' + normalizeWhitespace (body));
}
