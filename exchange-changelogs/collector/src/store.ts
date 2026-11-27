// Data directory layout (default exchange-changelogs/data, override with --data):
//
//   state/sources/<sourceId>.json    SourceState (etag, lastModified, contentHash, health, ...)
//   snapshots/<sourceId>.txt         normalized text of the last successful fetch
//   entries/<kind>/<venueId>.jsonl   every entry ever seen for the venue, one JSON per line
//   feed/                            written by build-feed (latest.json, <kind>/<id>.json, health.json, sources.json)
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ChangelogEntry, VenueKind } from './types.ts';
import type { SourceState } from './state.ts';

export const DEFAULT_DATA_DIR = resolve (dirname (fileURLToPath (import.meta.url)), '..', '..', 'data');
export const DEFAULT_REGISTRY_DIR = resolve (dirname (fileURLToPath (import.meta.url)), '..', '..', 'registry');

const SAFE_ID = /^[a-z0-9][a-z0-9_-]*$/;

function safe (id: string): string {
    if (!SAFE_ID.test (id)) {
        throw new Error (`unsafe id for a file name: "${id}"`);
    }
    return id;
}

export async function readText (path: string): Promise<string | null> {
    try {
        return await readFile (path, 'utf8');
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }
        throw e;
    }
}

// Atomic write: temp file + rename, so a crash never leaves half a file behind.
export async function writeText (path: string, content: string): Promise<void> {
    await mkdir (dirname (path), { recursive: true });
    const tmp = `${path}.${process.pid}.tmp`;
    await writeFile (tmp, content);
    await rename (tmp, path);
}

export async function listFiles (dir: string, ext: string): Promise<string[]> {
    try {
        return (await readdir (dir)).filter ((f) => f.endsWith (ext)).sort ().map ((f) => join (dir, f));
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw e;
    }
}

export class Store {
    constructor (readonly dir: string) {}

    statePath (sourceId: string): string {
        return join (this.dir, 'state', 'sources', `${safe (sourceId)}.json`);
    }

    snapshotPath (sourceId: string): string {
        return join (this.dir, 'snapshots', `${safe (sourceId)}.txt`);
    }

    entriesPath (kind: VenueKind, venueId: string): string {
        return join (this.dir, 'entries', safe (kind), `${safe (venueId)}.jsonl`);
    }

    feedPath (...parts: string[]): string {
        return join (this.dir, 'feed', ...parts);
    }

    async loadState (sourceId: string): Promise<SourceState | null> {
        const text = await readText (this.statePath (sourceId));
        return text ? JSON.parse (text) as SourceState : null;
    }

    async saveState (state: SourceState): Promise<void> {
        await writeText (this.statePath (state.id), JSON.stringify (state, null, 2) + '\n');
    }

    // the file ends with one '\n' that saveSnapshot added: return what was saved
    async loadSnapshot (sourceId: string): Promise<string | null> {
        const text = await readText (this.snapshotPath (sourceId));
        return text === null ? null : text.replace (/\n$/, '');
    }

    async saveSnapshot (sourceId: string, text: string): Promise<void> {
        await writeText (this.snapshotPath (sourceId), text.endsWith ('\n') ? text : text + '\n');
    }

    async loadEntries (kind: VenueKind, venueId: string): Promise<Map<string, ChangelogEntry>> {
        const text = await readText (this.entriesPath (kind, venueId));
        const map = new Map<string, ChangelogEntry> ();
        for (const line of (text ?? '').split ('\n')) {
            if (line.trim ()) {
                const entry = JSON.parse (line) as ChangelogEntry;
                map.set (entry.id, entry);
            }
        }
        return map;
    }

    async saveEntries (kind: VenueKind, venueId: string, entries: Iterable<ChangelogEntry>): Promise<void> {
        const sorted = sortEntries ([ ...entries ]);
        await writeText (this.entriesPath (kind, venueId), sorted.map ((e) => JSON.stringify (e)).join ('\n') + (sorted.length ? '\n' : ''));
    }

    async loadAllEntries (): Promise<ChangelogEntry[]> {
        const all: ChangelogEntry[] = [];
        for (const kind of [ 'exchange', 'prediction' ] as VenueKind[]) {
            for (const file of await listFiles (join (this.dir, 'entries', kind), '.jsonl')) {
                const text = await readText (file);
                for (const line of (text ?? '').split ('\n')) {
                    if (line.trim ()) {
                        all.push (JSON.parse (line) as ChangelogEntry);
                    }
                }
            }
        }
        return all;
    }
}

// coalesce(effectiveDate, publishedAt, firstSeen date)
export function sortDate (e: Pick<ChangelogEntry, 'effectiveDate' | 'publishedAt' | 'firstSeen'>): string {
    return e.effectiveDate ?? e.publishedAt ?? e.firstSeen.slice (0, 10);
}

// newest first; ties: most recently first seen, then id for stability
export function sortEntries<T extends ChangelogEntry | Omit<ChangelogEntry, 'body' | 'revisions'>> (entries: T[]): T[] {
    return entries.sort ((a, b) => {
        const da = sortDate (a);
        const db = sortDate (b);
        if (da !== db) {
            return da < db ? 1 : -1;
        }
        if (a.firstSeen !== b.firstSeen) {
            return a.firstSeen < b.firstSeen ? 1 : -1;
        }
        return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
    });
}
