// Loads registry/<kind>/<id>.json and validates it by hand (field reference: registry/README.md).
import { existsSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import type { SourceConfig, VenueConfig, VenueKind } from './types.ts';
import { listFiles, readText } from './store.ts';
import { commitsApiUrl, commitsPageUrl, REPO } from './adapters/ghcommits.ts';

const KINDS: VenueKind[] = [ 'exchange', 'prediction' ];
const TYPES = [ 'rss', 'md', 'html', 'json', 'hash', 'spec', 'gh-commits' ];
const SPEC_FORMATS = [ 'openapi', 'postman', 'asyncapi', 'redoc' ];
const VENUE_KEYS = new Set ([ 'id', 'kind', 'name', 'subclasses', 'domains', 'sources', 'unmonitored' ]);
const SOURCE_KEYS = new Set ([ 'id', 'type', 'url', 'link', 'months', 'discover', 'role', 'scope', 'headers', 'sharedWith', 'expectBlocked', 'slice', 'split', 'date', 'titleFilter', 'excludeFilter', 'section', 'mapper', 'strip', 'minEntries', 'minChange', 'specFormat', 'repo', 'ref', 'path' ]);
const MAPPERS_DIR = resolve (dirname (fileURLToPath (import.meta.url)), 'mappers');
const HOSTNAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

// A venue is identified by kind + id: exchange/binance and prediction/binance are two venues.
export interface Registry {
    venues: VenueConfig[];
    byKey: Map<string, VenueConfig>;    // "kind/id"
}

export function venueKey (venue: Pick<VenueConfig, 'kind' | 'id'>): string {
    return `${venue.kind}/${venue.id}`;
}

export function makeRegistry (venues: VenueConfig[]): Registry {
    const resolved = venues.map (withDerivedFields);
    return { venues: resolved, byKey: new Map (resolved.map ((v) => [ venueKey (v), v ])) };
}

// gh-commits sources have no `url`/`link` in the registry file: url is the GitHub API commits
// endpoint, link the commit history page (both from repo/ref/path).
export function withDerivedFields (venue: VenueConfig): VenueConfig {
    if (!venue.sources.some ((s) => s.type === 'gh-commits')) {
        return venue;
    }
    return {
        ...venue,
        sources: venue.sources.map ((s) => (s.type === 'gh-commits' ? { ...s, url: s.url || commitsApiUrl (s), link: s.link ?? commitsPageUrl (s) } : s)),
    };
}

const VENUE_REF = /^(?:(exchange|prediction)\/)?([a-z0-9]+)$/;

// "kind/id" -> that venue; "id" -> every kind with that id, `preferKind` first.
export function findVenues (registry: Registry, ref: string, preferKind?: VenueKind): VenueConfig[] {
    const m = VENUE_REF.exec (ref);
    if (!m) {
        return [];
    }
    const kinds = m[1] ? [ m[1] as VenueKind ] : (preferKind ? [ preferKind, ...KINDS.filter ((k) => k !== preferKind) ] : KINDS);
    return kinds.map ((k) => registry.byKey.get (`${k}/${m[2]}`)).filter ((v): v is VenueConfig => v !== undefined);
}

// sharedWith "id" resolves within the owner's kind first, then the other kind; "kind/id" is exact.
export function resolveShared (registry: Registry, owner: VenueConfig, ref: string): VenueConfig | undefined {
    return findVenues (registry, ref, owner.kind)[0];
}

// Venues (other than the owner) that a source's entries also belong to.
export function sharedTargets (registry: Registry, owner: VenueConfig, source: SourceConfig): VenueConfig[] {
    const out = new Map<string, VenueConfig> ();
    for (const ref of source.sharedWith ?? []) {
        const v = resolveShared (registry, owner, ref);
        if (v && venueKey (v) !== venueKey (owner)) {
            out.set (venueKey (v), v);
        }
    }
    return [ ...out.values () ];
}

// ---------------------------------------------------------------------------
// month-partitioned urls: {yyyy} and {mm} (UTC)
// ---------------------------------------------------------------------------

const PLACEHOLDER = /\{(yyyy|mm)\}/g;

export function hasMonthPlaceholders (url: string | undefined): boolean {
    return !!url && /\{(?:yyyy|mm)\}/.test (url);
}

export function expandMonth (template: string, year: number, month: number): string {
    return template.replace (PLACEHOLDER, (_m, k: string) => (k === 'yyyy' ? String (year) : String (month).padStart (2, '0')));
}

// Default `months`: the previous month too, so the 1st of a month (current file still 404) is not
// an empty run, and late entries of the previous month are still seen after the month turns.
export const DEFAULT_MONTHS = 2;

// The months a source fetches, newest first: [{ key: "2026-11", year, month }, ...].
export function sourceMonths (source: SourceConfig, now: Date): { key: string; year: number; month: number }[] {
    const n = hasMonthPlaceholders (source.url) ? (source.months ?? DEFAULT_MONTHS) : 1;
    const out: { key: string; year: number; month: number }[] = [];
    for (let i = 0; i < n; i++) {
        const d = new Date (Date.UTC (now.getUTCFullYear (), now.getUTCMonth () - i, 1));
        const year = d.getUTCFullYear ();
        const month = d.getUTCMonth () + 1;
        out.push ({ key: `${year}-${String (month).padStart (2, '0')}`, year, month });
    }
    return out;
}

// url/link with the placeholders filled for the current month (identity for other sources).
export function currentSource (source: SourceConfig, now: Date): SourceConfig {
    if (!hasMonthPlaceholders (source.url) && !hasMonthPlaceholders (source.link)) {
        return source;
    }
    const y = now.getUTCFullYear ();
    const m = now.getUTCMonth () + 1;
    return { ...source, url: expandMonth (source.url, y, m), ...(source.link ? { link: expandMonth (source.link, y, m) } : {}) };
}

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray (v);
const isStrArray = (v: unknown): v is string[] => Array.isArray (v) && v.every ((x) => typeof x === 'string');

function checkRegex (errors: string[], where: string, value: unknown): void {
    if (value === undefined) {
        return;
    }
    if (typeof value !== 'string') {
        errors.push (`${where} must be a string (regex)`);
        return;
    }
    try {
        new RegExp (value);
    } catch (e) {
        errors.push (`${where} is not a valid regex: ${(e as Error).message}`);
    }
}

function checkSelector (errors: string[], where: string, value: unknown): void {
    if (value === undefined) {
        return;
    }
    if (typeof value !== 'string' || !value.trim ()) {
        errors.push (`${where} must be a non-empty CSS selector`);
        return;
    }
    try {
        cheerio.load ('<div></div>') (value);
    } catch (e) {
        errors.push (`${where} is not a valid CSS selector: ${(e as Error).message}`);
    }
}

function checkHttps (errors: string[], where: string, value: unknown): URL | null {
    if (typeof value !== 'string') {
        errors.push (`${where} must be a string`);
        return null;
    }
    try {
        const u = new URL (value);
        if (u.protocol !== 'https:') {
            errors.push (`${where} must be https`);
        }
        return u;
    } catch {
        errors.push (`${where} is not a valid URL`);
        return null;
    }
}

function checkKeys (errors: string[], where: string, obj: Obj, allowed: Iterable<string>): void {
    const set = new Set (allowed);
    for (const key of Object.keys (obj)) {
        if (!set.has (key)) {
            errors.push (`${where}: unknown field "${key}"`);
        }
    }
}

function validateSource (s: unknown, venue: Obj, where: string, errors: string[]): void {
    if (!isObj (s)) {
        errors.push (`${where} must be an object`);
        return;
    }
    checkKeys (errors, where, s, SOURCE_KEYS);
    const venueId = String (venue['id']);
    if (typeof s['id'] !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test (s['id']) || !s['id'].startsWith (venueId + '-')) {
        errors.push (`${where}.id must look like "${venueId}-<slug>" (lowercase, dashes)`);
    }
    const type = s['type'];
    if (typeof type !== 'string' || !TYPES.includes (type)) {
        errors.push (`${where}.type must be one of ${TYPES.join ('|')}`);
    }
    if (type === 'gh-commits') {
        validateGhCommits (s, where, errors);
    } else {
        for (const key of [ 'repo', 'ref', 'path' ]) {
            if (s[key] !== undefined) {
                errors.push (`${where}.${key} is only used by gh-commits sources`);
            }
        }
    }
    if (type !== 'spec' && s['specFormat'] !== undefined) {
        errors.push (`${where}.specFormat is only used by spec sources`);
    } else if (s['specFormat'] !== undefined && !SPEC_FORMATS.includes (s['specFormat'] as string)) {
        errors.push (`${where}.specFormat must be one of ${SPEC_FORMATS.join ('|')}`);
    }
    if (s['minChange'] !== undefined) {
        if (type !== 'hash') {
            errors.push (`${where}.minChange is only used by hash sources`);
        } else if (!(Number.isInteger (s['minChange']) && (s['minChange'] as number) >= 0)) {
            errors.push (`${where}.minChange must be an integer >= 0 (characters)`);
        }
    }
    for (const key of [ 'url', 'link' ]) {
        const v = s[key];
        if (typeof v === 'string' && /\{(?!(?:yyyy|mm)\})[^}]*\}/.test (v)) {
            errors.push (`${where}.${key}: only the {yyyy} and {mm} placeholders are supported`);
        }
    }
    const filled = (v: unknown) => (typeof v === 'string' ? expandMonth (v, 2026, 1) : v);
    // gh-commits: url/link derived from repo/ref/path (validateGhCommits reports a bad repo)
    const gh = type === 'gh-commits' && typeof s['repo'] === 'string' && REPO.test (s['repo']);
    const ghFields = { repo: s['repo'] as string, ref: s['ref'] as string | undefined, path: s['path'] as string | undefined };
    const url = gh ? commitsApiUrl (ghFields) : s['url'];
    const link = s['link'] ?? (gh ? commitsPageUrl (ghFields) : s['url']);
    const linkUrl = (type === 'gh-commits' && !gh && s['link'] === undefined) ? null : checkHttps (errors, `${where}.link ?? url`, filled (link));
    if (type !== 'gh-commits') {
        checkHttps (errors, `${where}.url`, filled (url));
    }
    const monthly = typeof s['url'] === 'string' && hasMonthPlaceholders (s['url']);
    if (monthly && (type === 'spec' || type === 'gh-commits')) {
        errors.push (`${where}: {yyyy}/{mm} placeholders are not supported by ${type} sources`);
    }
    if (s['months'] !== undefined) {
        if (!(Number.isInteger (s['months']) && (s['months'] as number) >= 1 && (s['months'] as number) <= 12)) {
            errors.push (`${where}.months must be an integer 1..12`);
        } else if (!monthly) {
            errors.push (`${where}.months needs {yyyy}/{mm} placeholders in url`);
        }
    }
    const discover = s['discover'];
    if (discover !== undefined) {
        if (!isObj (discover)) {
            errors.push (`${where}.discover must be an object { url, pattern }`);
        } else {
            checkKeys (errors, `${where}.discover`, discover, [ 'url', 'pattern' ]);
            checkHttps (errors, `${where}.discover.url`, discover['url']);
            if (typeof discover['pattern'] !== 'string') {
                errors.push (`${where}.discover.pattern must be a string (regex with one capture group)`);
            } else {
                checkRegex (errors, `${where}.discover.pattern`, discover['pattern']);
                try {
                    // "a|" always matches '': the result length is 1 + the number of groups
                    if (new RegExp (discover['pattern'] + '|').exec ('')!.length < 2) {
                        errors.push (`${where}.discover.pattern needs a capture group (the url)`);
                    }
                } catch {
                    // reported by checkRegex
                }
            }
            if (monthly) {
                errors.push (`${where}: discover and {yyyy}/{mm} placeholders cannot be combined`);
            }
        }
    }
    const domains = isStrArray (venue['domains']) ? venue['domains'] : [];
    if (linkUrl && !domains.some ((d) => linkUrl.hostname === d || linkUrl.hostname.endsWith ('.' + d))) {
        errors.push (`${where}: host of link ?? url (${linkUrl.hostname}) must be in the venue "domains"`);
    }
    if (s['role'] !== undefined && s['role'] !== 'primary' && s['role'] !== 'secondary') {
        errors.push (`${where}.role must be "primary" or "secondary"`);
    }
    for (const key of [ 'scope', 'expectBlocked', 'mapper' ]) {
        if (s[key] !== undefined && typeof s[key] !== 'string') {
            errors.push (`${where}.${key} must be a string`);
        }
    }
    if (s['headers'] !== undefined && (!isObj (s['headers']) || !Object.values (s['headers']).every ((v) => typeof v === 'string'))) {
        errors.push (`${where}.headers must be an object of strings`);
    }
    if (s['sharedWith'] !== undefined && !(isStrArray (s['sharedWith']) && s['sharedWith'].every ((x) => VENUE_REF.test (x)))) {
        errors.push (`${where}.sharedWith must be an array of venue refs ("id" or "kind/id")`);
    }
    if (s['strip'] !== undefined) {
        if (!isStrArray (s['strip'])) {
            errors.push (`${where}.strip must be an array of CSS selectors`);
        } else {
            s['strip'].forEach ((sel, i) => checkSelector (errors, `${where}.strip[${i}]`, sel));
        }
    }
    if (s['minEntries'] !== undefined && !(Number.isInteger (s['minEntries']) && (s['minEntries'] as number) >= 0)) {
        errors.push (`${where}.minEntries must be an integer >= 0`);
    }
    const slice = s['slice'];
    if (slice !== undefined && (type === 'spec' || type === 'gh-commits' || type === 'json' || type === 'rss')) {
        errors.push (`${where}.slice is only used by md, html and hash sources`);
    } else if (slice !== undefined) {
        if (!isObj (slice)) {
            errors.push (`${where}.slice must be an object`);
        } else {
            checkKeys (errors, `${where}.slice`, slice, [ 'from', 'to', 'selector' ]);
            if (type === 'md') {
                checkRegex (errors, `${where}.slice.from`, slice['from']);
                checkRegex (errors, `${where}.slice.to`, slice['to']);
                if (slice['selector'] !== undefined) {
                    errors.push (`${where}.slice.selector is for html/hash sources; md uses slice.from/to`);
                }
            } else {
                if (slice['from'] !== undefined || slice['to'] !== undefined) {
                    errors.push (`${where}.slice.from/to are for md sources; use slice.selector`);
                }
                checkSelector (errors, `${where}.slice.selector`, slice['selector']);
            }
        }
    }
    const split = s['split'];
    if (split !== undefined) {
        if (!isObj (split)) {
            errors.push (`${where}.split must be an object`);
        } else {
            checkKeys (errors, `${where}.split`, split, [ 'heading', 'item' ]);
            if (type === 'md') {
                checkRegex (errors, `${where}.split.heading`, split['heading']);
                if (split['item'] !== undefined) {
                    errors.push (`${where}.split.item is for html sources`);
                }
            } else if (type === 'html') {
                checkSelector (errors, `${where}.split.heading`, split['heading']);
                checkSelector (errors, `${where}.split.item`, split['item']);
                if (split['heading'] !== undefined && split['item'] !== undefined) {
                    errors.push (`${where}.split: use heading or item, not both`);
                }
            } else {
                errors.push (`${where}.split is only used by md and html sources`);
            }
        }
    }
    const date = s['date'];
    if (date !== undefined) {
        if (!isObj (date)) {
            errors.push (`${where}.date must be an object`);
        } else {
            checkKeys (errors, `${where}.date`, date, [ 'from', 'pattern', 'order' ]);
            if (date['from'] !== undefined && ![ 'title', 'body', 'pubDate', 'anchor' ].includes (date['from'] as string)) {
                errors.push (`${where}.date.from must be title|body|pubDate|anchor`);
            }
            if (date['order'] !== undefined && ![ 'ymd', 'mdy', 'dmy' ].includes (date['order'] as string)) {
                errors.push (`${where}.date.order must be ymd|mdy|dmy`);
            }
            checkRegex (errors, `${where}.date.pattern`, date['pattern']);
        }
    }
    checkRegex (errors, `${where}.titleFilter`, s['titleFilter']);
    checkRegex (errors, `${where}.excludeFilter`, s['excludeFilter']);
    checkRegex (errors, `${where}.section`, s['section']);
    if (s['section'] !== undefined && (type === 'hash' || type === 'spec' || type === 'gh-commits')) {
        errors.push (`${where}.section is not used by ${type} sources`);
    }
    if (type === 'json') {
        if (typeof s['mapper'] !== 'string' || !/^[a-z0-9][a-z0-9_-]*$/.test (s['mapper'])) {
            errors.push (`${where}: json sources need "mapper" (file name in src/mappers/)`);
        } else if (!existsSync (join (MAPPERS_DIR, `${s['mapper']}.ts`))) {
            errors.push (`${where}.mapper: src/mappers/${s['mapper']}.ts does not exist`);
        }
    } else if (s['mapper'] !== undefined) {
        errors.push (`${where}.mapper is only used by json sources`);
    }
}

function validateGhCommits (s: Obj, where: string, errors: string[]): void {
    if (s['url'] !== undefined) {
        errors.push (`${where}: gh-commits sources have no "url" (it is built from repo/ref/path)`);
    }
    if (typeof s['repo'] !== 'string' || !REPO.test (s['repo'])) {
        errors.push (`${where}.repo must be "owner/name"`);
    }
    if (s['ref'] !== undefined && (typeof s['ref'] !== 'string' || !/^[\w./-]{1,200}$/.test (s['ref']) || s['ref'].includes ('..'))) {
        errors.push (`${where}.ref must be a branch, tag or sha`);
    }
    if (s['path'] !== undefined && (typeof s['path'] !== 'string' || !s['path'].trim () || s['path'].includes ('..') || /[?#\s]/.test (s['path']))) {
        errors.push (`${where}.path must be a file or directory path in the repository`);
    }
}

export function validateVenue (v: unknown, file: string, kindDir: VenueKind): string[] {
    const errors: string[] = [];
    if (!isObj (v)) {
        return [ `${file}: must be a JSON object` ];
    }
    checkKeys (errors, file, v, VENUE_KEYS);
    const id = v['id'];
    if (typeof id !== 'string' || !/^[a-z0-9]+$/.test (id)) {
        errors.push (`${file}: id must be a lowercase ccxt id`);
    } else if (basename (file, '.json') !== id) {
        errors.push (`${file}: file name must be ${id}.json`);
    }
    if (v['kind'] !== kindDir) {
        errors.push (`${file}: kind must be "${kindDir}" (matches its directory)`);
    }
    if (typeof v['name'] !== 'string' || !v['name'].trim ()) {
        errors.push (`${file}: name is required`);
    }
    if (v['subclasses'] !== undefined && !(isStrArray (v['subclasses']) && v['subclasses'].every ((x) => /^[a-z0-9]+$/.test (x)))) {
        errors.push (`${file}: subclasses must be an array of ccxt ids`);
    }
    if (!isStrArray (v['domains']) || v['domains'].length === 0 || !v['domains'].every ((d) => HOSTNAME.test (d))) {
        errors.push (`${file}: domains must be a non-empty array of lowercase hostnames (no scheme)`);
    }
    if (!Array.isArray (v['sources'])) {
        errors.push (`${file}: sources must be an array`);
    } else {
        v['sources'].forEach ((s, i) => validateSource (s, v, `${file}: sources[${i}]`, errors));
    }
    if (v['unmonitored'] !== undefined) {
        if (typeof v['unmonitored'] !== 'string' || !v['unmonitored'].trim () || v['unmonitored'].length > 300) {
            errors.push (`${file}: unmonitored must be a non-empty reason (at most 300 characters)`);
        } else if (Array.isArray (v['sources']) && v['sources'].length) {
            errors.push (`${file}: an unmonitored venue must have "sources": []`);
        }
    }
    return errors;
}

export async function loadRegistry (dir: string): Promise<{ registry: Registry; errors: string[] }> {
    const errors: string[] = [];
    const venues: VenueConfig[] = [];
    for (const kind of KINDS) {
        for (const file of await listFiles (join (dir, kind), '.json')) {
            const rel = `${kind}/${basename (file)}`;
            let data: unknown;
            try {
                data = JSON.parse ((await readText (file)) ?? '');
            } catch (e) {
                errors.push (`${rel}: invalid JSON (${(e as Error).message})`);
                continue;
            }
            const errs = validateVenue (data, rel, kind);
            errors.push (...errs);
            if (errs.length === 0) {
                venues.push (withDerivedFields (data as VenueConfig));
            }
        }
    }
    const byKey = new Map<string, VenueConfig> ();
    const sourceIds = new Map<string, string> ();
    for (const venue of venues) {
        const key = venueKey (venue);
        if (byKey.has (key)) {
            errors.push (`duplicate venue "${key}"`);
        }
        byKey.set (key, venue);
        for (const s of venue.sources) {
            const other = sourceIds.get (s.id);
            if (other) {
                errors.push (`duplicate source id "${s.id}" (${other} and ${key})`);
            }
            sourceIds.set (s.id, key);
        }
    }
    // same id under both kinds is fine; venues sort by id, exchange before prediction
    venues.sort ((a, b) => a.id.localeCompare (b.id) || a.kind.localeCompare (b.kind));
    const registry: Registry = { venues, byKey };
    for (const venue of venues) {
        for (const s of venue.sources) {
            for (const shared of s.sharedWith ?? []) {
                const target = resolveShared (registry, venue, shared);
                if (!target) {
                    errors.push (`${venueKey (venue)}.json: source ${s.id} sharedWith unknown venue "${shared}"`);
                } else if (target === venue) {
                    errors.push (`${venueKey (venue)}.json: source ${s.id} sharedWith its own venue "${shared}"`);
                }
            }
        }
    }
    // a venue with no sources must say why (unmonitored) or get another venue's shared source
    const fed = new Set (venues.flatMap ((v) => v.sources.flatMap ((s) => sharedTargets (registry, v, s).map (venueKey))));
    for (const venue of venues) {
        if (!venue.sources.length && !venue.unmonitored && !fed.has (venueKey (venue))) {
            errors.push (`${venueKey (venue)}.json: "sources" is empty: add "unmonitored": "<reason>", or share another venue's source with it (sharedWith)`);
        }
    }
    return { registry, errors };
}

// --venue accepts "id" (every kind with that id) or "kind/id".
export function selectSources (registry: Registry, venueFilter: string[], sourceFilter: string[]): { venue: VenueConfig; sources: SourceConfig[] }[] {
    const wanted = new Set<string> ();
    const unknownVenues: string[] = [];
    for (const ref of venueFilter) {
        const found = findVenues (registry, ref);
        if (!found.length) {
            unknownVenues.push (ref);
        }
        found.forEach ((v) => wanted.add (venueKey (v)));
    }
    if (unknownVenues.length) {
        throw new Error (`unknown venue(s): ${unknownVenues.join (', ')}`);
    }
    const out: { venue: VenueConfig; sources: SourceConfig[] }[] = [];
    for (const venue of registry.venues) {
        if (venueFilter.length && !wanted.has (venueKey (venue))) {
            continue;
        }
        const sources = venue.sources.filter ((s) => !sourceFilter.length || sourceFilter.includes (s.id));
        if (sources.length) {
            out.push ({ venue, sources });
        }
    }
    if (sourceFilter.length) {
        const known = new Set (out.flatMap ((x) => x.sources.map ((s) => s.id)));
        const missing = sourceFilter.filter ((s) => !known.has (s));
        if (missing.length) {
            throw new Error (`unknown source(s): ${missing.join (', ')}`);
        }
    }
    return out;
}
