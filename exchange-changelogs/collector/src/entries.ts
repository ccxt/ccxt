// ParsedEntry (adapter output) -> ChangelogEntry candidate: filters, dates, ids, links, tags.
import { SCHEMA_VERSION } from './types.ts';
import type { ChangelogEntry, SourceConfig, VenueConfig } from './types.ts';
import type { ParsedEntry } from './adapters/types.ts';
import { extractDate, findDate, findEffectiveDate, isoDay, type DateOrder } from './dates.ts';
import { entryHash, entryId, entryKey, sha256 } from './ids.ts';
import { cleanBody, cleanTitle, cutSummary, makeExcerpt, markdownToPlain, oneLine } from './normalize.ts';
import { sharedTargets, type Registry } from './registry.ts';
import { ruleTags } from './tags.ts';

// Display titles built from a body summary are cut at a sentence end (else a word boundary) within this length.
export const SUMMARY_TITLE_CHARS = 140;

export interface BuildContext {
    venue: VenueConfig;
    source: SourceConfig;
    affects: string[];
    now: Date;
    firstRun: boolean;
    partitions?: Map<string, string>;   // filled with entry id -> ParsedEntry.partition (month sources)
}

// Anchor -> url fragment: percent-encoded, but "/" (valid in a fragment, kept by Mintlify ids) stays.
export function anchorFragment (anchor: string): string {
    return encodeURIComponent (anchor).replace (/%2F/gi, '/');
}

export function sourceLink (source: SourceConfig): string {
    return source.link ?? source.url;
}

export function hostAllowed (host: string, domains: string[]): boolean {
    const h = host.toLowerCase ();
    return domains.some ((d) => h === d.toLowerCase () || h.endsWith ('.' + d.toLowerCase ()));
}

// https and on one of the venue's registry domains, else null
export function checkLink (href: string | undefined, domains: string[]): string | null {
    if (!href) {
        return null;
    }
    try {
        const u = new URL (href);
        return (u.protocol === 'https:' && hostAllowed (u.hostname, domains)) ? u.toString () : null;
    } catch {
        return null;
    }
}

export function applyFilters (source: SourceConfig, entries: ParsedEntry[]): ParsedEntry[] {
    const keep = source.titleFilter ? new RegExp (source.titleFilter, 'i') : null;
    const drop = source.excludeFilter ? new RegExp (source.excludeFilter, 'i') : null;
    return entries.filter ((e) => {
        if (keep && !keep.test (e.title) && !(e.categories ?? []).some ((c) => keep.test (c))) {
            return false;
        }
        return !(drop && drop.test (e.title));
    });
}

// Anchors are slugs ("november-12-2026", "27-october-2026-—-spot"): retry with dashes as spaces.
export function anchorDate (anchor: string | undefined, order: DateOrder | undefined, now: Date, pattern?: string): string | null {
    if (!anchor) {
        return null;
    }
    return extractDate (anchor, pattern, order, now) ?? extractDate (anchor.replace (/[-_]+/g, ' '), pattern, order, now);
}

// The date the venue put on the entry, from the configured location (stable: used in the id).
export function baseDate (raw: ParsedEntry, title: string, body: string, source: SourceConfig, now: Date): string | null {
    const cfg = source.date ?? {};
    const from = cfg.from ?? (source.type === 'rss' ? 'pubDate' : undefined);
    const order = cfg.order;
    const pick = (text: string | undefined) => extractDate (text, cfg.pattern, order, now);
    if (from === 'anchor') {
        return anchorDate (raw.anchor, order, now, cfg.pattern) ?? findDate (raw.context, order, now);
    }
    if (from) {
        const text = { title, body, pubDate: raw.dateText }[from];
        return pick (text) ?? findDate (raw.context, order, now);
    }
    return pick (raw.dateText) ?? pick (title) ?? findDate (raw.context, order, now) ?? anchorDate (raw.anchor, order, now, cfg.pattern) ?? pick (body);
}

// True when a text says nothing beyond a date or version ("2026-11-05", "v1.2.0 (2026-11-05)",
// "Release 10.11.2026", "Release Note 2026-03-20").
export function dateOrVersionOnly (text: string): boolean {
    const words = text.replace (/\b(?:20\d\d|\d{1,2}(?:st|nd|rd|th)?|jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*|v?\d+(?:\.\d+)+|release(?: notes?)?|update[sd]?|changelog|change log|changes|version)\b/gi, '')
        .replace (/[^\p{L}]+/gu, '');
    return words.length < 3;
}

// Section labels and product names that say nothing about the change: "Added", "Changed",
// "Bug fixes", "REST API", "WebSocket", "Docs", "UI", "Exchange API", "Market Data Pro WebSocket API".
const GENERIC_WORDS = new Set ([
    'added', 'add', 'adds', 'new', 'changed', 'change', 'changes', 'modified', 'updated', 'update', 'updates', 'improved', 'improvement',
    'improvements', 'enhancement', 'enhancements', 'fixed', 'fix', 'fixes', 'bug', 'bugs', 'bugfix', 'bugfixes', 'removed', 'remove',
    'deprecated', 'deprecation', 'deprecations', 'breaking', 'other', 'others', 'misc', 'miscellaneous', 'general', 'note', 'notes',
    'summary', 'overview', 'highlights', 'feature', 'features', 'docs', 'doc', 'documentation', 'rest', 'api', 'apis', 'ws', 'websocket',
    'websockets', 'http', 'public', 'private', 'spot', 'futures', 'future', 'margin', 'option', 'options', 'perp', 'perps', 'perpetual',
    'perpetuals', 'derivatives', 'sdk', 'sdks', 'ui', 'exchange', 'institutional', 'market', 'data', 'pro', 'feed', 'feeds', 'stream',
    'streams', 'endpoint', 'endpoints', 'and', 'the',
]);

export function genericLabel (text: string): boolean {
    // "Added (16)", "Changed (3)": a count does not make a label specific
    const words = markdownToPlain (text).toLowerCase ().replace (/\(\s*\d+\s*\)/g, '').replace (/[:.]+$/, '').split (/[\s&/,+()-]+/).filter ((w) => w.length > 0);
    return words.length > 0 && words.length <= 6 && words.every ((w) => GENERIC_WORDS.has (w));
}

// "| 2026.07.13 18:00 | /v2/x.do | Added | User adds a deposit address |" (a table row item):
// "/v2/x.do (Added): User adds a deposit address" (date cells and "*" placeholders left out).
export function tableRowTitle (title: string): string | null {
    const cells = title.replace (/^\s*\|/, '').replace (/\|\s*$/, '').split ('|').map ((c) => c.trim ());
    if (cells.length < 3) {
        return null;
    }
    // date cells ("2026.07.13 18:00") go; word-only cells ("Update", "Added") stay
    const kept = cells.filter ((c) => c && !/^[-*–—]+$/.test (c) && !(/\d/.test (c) && dateOrVersionOnly (c)));
    if (!kept.length) {
        return null;
    }
    if (kept.length === 1) {
        return cleanTitle (kept[0]);
    }
    const head = (kept.length >= 3) ? `${kept[0]} (${kept[1]})` : kept[0];
    const rest = (kept.length >= 3) ? kept.slice (2).join (' ') : kept[1];
    return cleanTitle (`${head}: ${cutSummary (rest, SUMMARY_TITLE_CHARS)}`);
}

export interface TitleContext {
    date?: string | null;   // the date the entry is filed under (baseDate): a leading copy of it is dropped
    keepVersion?: boolean;  // SDK/release sources keep a leading version (keepsVersion)
    order?: DateOrder;      // the source's date order (SourceConfig.date.order), for "8/11/2022: ..."
}

// SDK and package release sources (id or scope names one SDK, PyPI/npm feeds, GitHub releases):
// the version names the release, so display titles keep it. "SDKs" in a scope ("REST, WebSocket,
// SDKs, platform"), "release" ("announced before release", "release notes") and generated SDK
// artifacts ("generated Python SDK types", "SDK spec") do not make a source an SDK.
const SDK_ID = /\bsdk\b|\bpypi\b|\bnpm\b/i;
const SDK_SCOPE = /\bsdk\b/i;
const SDK_ARTIFACT = /\bgenerated\b|\bspec\b|\bartifacts?\b/i;

export function keepsVersion (source: SourceConfig): boolean {
    const scope = source.scope ?? '';
    return (SDK_SCOPE.test (scope) && !SDK_ARTIFACT.test (scope)) || SDK_ID.test (source.id.replace (/-/g, ' ')) || /\/\/(?:pypi\.org|registry\.npmjs\.org|www\.npmjs\.com)\/|\/releases\.atom(?:$|[?#])/.test (source.url);
}

// "Add: /api/v6/x" (HTX), "Update: Public market data APIs" (BingX): imperative labels read as
// past tense in a timeline.
const VERB_LABELS: Record<string, string> = {
    add: 'Added', update: 'Updated', delete: 'Removed', remove: 'Removed', modify: 'Modified', optimize: 'Optimized',
    optimise: 'Optimised', fix: 'Fixed', change: 'Changed', deprecate: 'Deprecated', adjust: 'Adjusted', offline: 'Removed',
};

// "[Add] UTA WebSocket ..." (KuCoin) reads "Added: UTA WebSocket ...".
export function readableLabel (title: string): string {
    return title.replace (/^(?:(add|update|delete|remove|modify|optimi[sz]e|fix|change|deprecate|adjust|offline)\s*:|\[(add|update|delete|remove|modify|optimi[sz]e|fix|change|deprecate|adjust|offline)\])\s*/i, (_m, a: string | undefined, b: string | undefined) => `${VERB_LABELS[(a ?? b ?? '').toLowerCase ()]}: `);
}

// A leading "2026-10-30: ", "September 1, 2026 — ", "[November 4, 2026] ", "v4.106.179: ",
// "1.6.1 - 2026-10-09: " segment (date/version text only, then a separator), or the whole title.
// A ":" followed by a digit is part of a time ("2026-11-05 10:00 UTC: X"), not a separator.
const LEADING_SEGMENT = /^\s*(?:\[([^\]\n]{1,40})\]\s*|(.{1,40}?)\s*(?::(?!\d)|\s[-\u2013\u2014|]\s|$)\s*)/;
const VERSION_TOKEN = /\bv?\d+(?:\.\d+)+(?:[-+.][\w.]+)?\b/i;
// a clock time in a leading segment ("10:00 UTC", "08:00 (UTC+8)"): the segment says when, keep it
const TIME_TOKEN = /\b\d{1,2}:\d{2}\b/;
// numeric dates, removed before looking for a version next to them ("2025-06-11(1.3.0)")
const NUMERIC_DATE = /\b20\d\d[-./]\d{1,2}[-./]\d{1,2}\b|\b\d{1,2}[-./]\d{1,2}[-./]20\d\d\b|\b20\d\d\d{4}\b/g;

// The version written next to a date in one segment: "2025-06-11(1.3.0)" -> "1.3.0",
// "2025-01-02(GO 1.2.1)" -> "GO 1.2.1", "1.6.1 (2026-10-09)" -> "1.6.1".
function versionBesideDate (seg: string): string | null {
    const rest = seg.replace (NUMERIC_DATE, ' ').replace (/[()[\]]/g, ' ').replace (/\s+/g, ' ').trim ();
    const v = VERSION_TOKEN.exec (rest);
    if (!v) {
        return null;
    }
    return (rest.length <= 20) ? rest : v[0];
}

// Title words that only name a product or section ("Derivatives REST v1", "Prediction Markets - REST").
const SECTION_WORDS = /\b(?:v\d+|prediction|markets|account|accounts|services|wallet|trading|copy|unified|classic|broker|earn|fix|sbe|grpc)\b/gi;

function labelOnly (text: string): boolean {
    const rest = text.replace (SECTION_WORDS, ' ').replace (/\s+/g, ' ').trim ();
    return !rest || genericLabel (rest);
}

// Drops leading date/version segments that repeat what the timeline already shows: a date equal
// to ctx.date (the day heading), or a version (kept as "1.6.1" for SDK/release sources, see
// keepsVersion). Returns
// the remaining title and the version to keep, or null when a segment carries a different date
// (it says something: "Release 11.08.2026" on an entry published 2026-08-21).
function stripLeading (title: string, ctx: TitleContext): { rest: string; version: string | null } | null {
    let rest = title;
    let version: string | null = null;
    for (let i = 0; i < 4 && rest; i++) {
        const m = LEADING_SEGMENT.exec (rest);
        const seg = m ? (m[1] ?? m[2] ?? '').trim () : '';
        if (!m || !seg || !/\d/.test (seg) || TIME_TOKEN.test (seg) || !dateOrVersionOnly (seg)) {
            break;
        }
        const date = findDate (seg, ctx.order);
        if (date) {
            if (date !== ctx.date) {
                return null;
            }
            version = version ?? versionBesideDate (seg);
        } else {
            const v = VERSION_TOKEN.exec (seg);
            if (!v) {
                break;
            }
            version = version ?? v[0];
        }
        rest = rest.slice (m[0].length).trim ();
    }
    return { rest, version: (version && ctx.keepVersion) ? version : null };
}

// Headings like "2026-11-05", "v1.2.0 (2026-11-05)" or a product name ("Exchange API", repeated on
// every release) say nothing in a timeline: they get a summary of the body (see bodySummary), cut at
// a sentence end (cutSummary). With a TitleContext, a leading date that repeats the entry date and a
// leading version (outside SDK/release sources) are dropped ("2026-10-30: Added X" -> "Added X",
// "v4.106.138: Add Y" -> "Add Y", SDK "1.6.1 - 2026-10-09: Z" -> "1.6.1: Z"), and "Add:" labels read
// "Added:". Table-row titles drop their pipes (tableRowTitle). Ids still use the raw title.
export function displayTitle (title: string, body: string, ctx?: TitleContext): string {
    const row = tableRowTitle (title);
    if (row) {
        return row;
    }
    if (!ctx) {
        return withSummary (title, body);
    }
    const stripped = stripLeading (title, ctx);
    if (!stripped) {
        return readableLabel (withSummary (title, body));
    }
    const { rest, version } = stripped;
    const summary = bodySummary (body);
    if (!rest || dateOrVersionOnly (rest) || labelOnly (rest)) {
        if (!summary || summary === rest) {
            return rest ? readableLabel ([ version, rest ].filter (Boolean).join (': ')) : title;
        }
        const label = dateOrVersionOnly (rest) ? '' : rest.replace (/[\s:\u2013\u2014-]+$/, '');
        const head = [ version, label ].filter (Boolean).join (': ');
        return readableLabel (cleanTitle (head ? `${head}: ${cutSummary (summary, SUMMARY_TITLE_CHARS)}` : cutSummary (summary, SUMMARY_TITLE_CHARS)));
    }
    return readableLabel (version ? `${version}: ${rest}` : rest);
}

// The title, or "title: summary" when the title is only a date/version or a generic label.
function withSummary (title: string, body: string): string {
    if (!dateOrVersionOnly (title) && !genericLabel (title)) {
        return title;
    }
    const summary = bodySummary (body);
    if (!summary || summary === title) {
        return title;
    }
    // "2026-10-21:" / "2026-10-21 -" would otherwise read "2026-10-21:: summary"
    const head = title.replace (/[\s:\u2013\u2014-]+$/, '');
    return cleanTitle (`${head}: ${cutSummary (summary, SUMMARY_TITLE_CHARS)}`);
}

const BULLET = /^[-*+]\s+|^\d+[.)]\s+/;
const HEADING = /^ {0,3}#{1,6}\s+(.*?)\s*#*\s*$/;
const SKIP_LINE = /^(?:#{1,6}\s|\||```|~~~|>\s*\[!|(?:-{3,}|\*{3,}|_{3,})\s*$)/;
// "Testnet: Jul 10th, 2026 06:00 UTC", "**Mainnet:** ...": rollout schedule lines, not the change
const SCHEDULE_BULLET = /^(?:\*\*|__)?(?:testnet|mainnet|demo(?: trading)?|production|prod|live(?: trading)?|sandbox|staging|uat|downtime|release date|effective (?:date|time)|date|time)(?:\*\*|__)?\s*:/i;
// "**Release Date:** October 1, 2026", "**Breaking Changes:** No": metadata, not the change (a
// one-line paragraph of at most LABEL_VALUE_CHARS; "**Notice:** <two lines of text>" is content)
const LABEL_VALUE = /^(?:\*\*|__)[^*_\n]{1,40}?(?::(?:\*\*|__)|(?:\*\*|__)\s*:)/;
const LABEL_VALUE_CHARS = 100;
// a line that is only bold text ("**Docs**", "**REST API**")
const BOLD_ONLY = /^(?:\*\*|__)([^*_\n]+?)(?:\*\*|__)\s*:?$/;
const HEADING_LIKE_WORDS = 16;
const HEADING_LIKE_CHARS = 120;
// a list item ending in a preposition continues in its first nested item ("Added 60020 error code in" / "errors.md")
const DANGLING = /\b(?:in|to|for|on|of|at|with|from|into|under)\s*:?$/i;

function nextNonBlank (lines: string[], i: number): string | undefined {
    for (const l of lines.slice (i + 1)) {
        if (l.trim ()) {
            return l;
        }
    }
    return undefined;
}

// Metadata and section labels in front of the change: "**Release Date:** ...", a generic "REST API"
// / "**Docs**" line, or a one-word "Authentication" line right above a list ("**Crypto Loan
// (Fixed-Term)**" above a list stays: it names the change).
function labelLine (lines: string[], i: number): boolean {
    const t = lines[i].trim ().replace (/^>\s*/, '');
    const next = nextNonBlank (lines, i);
    const oneLineParagraph = !(lines[i + 1] ?? '').trim ();
    if (LABEL_VALUE.test (t) && oneLineParagraph && t.length <= LABEL_VALUE_CHARS) {
        return true;
    }
    const plain = markdownToPlain (t);
    if (genericLabel (plain)) {
        return true;
    }
    const aboveList = next !== undefined && BULLET.test (next.trim ());
    return aboveList && !/\s/.test (plain) && !/[.!?]$/.test (plain);
}

// First paragraph of lines (plain text), from line index `from` up to `to` (exclusive), label lines left out.
function firstParagraph (lines: string[], from: number, to: number): string {
    const parts: string[] = [];
    for (let i = from; i < to; i++) {
        const t = lines[i].trim ().replace (/^>\s*/, '');
        if (!t || SKIP_LINE.test (t) || (!parts.length && labelLine (lines, i))) {
            if (parts.length) {
                break;
            }
            continue;
        }
        parts.push (t);
    }
    return markdownToPlain (parts.join (' '));
}

// A short line that reads like a heading ("Delayed publication of large Block RFQ trades"), not a
// sentence ("No removed endpoints. Two behaviour changes ..."), a label ("REST and WebSocket API:")
// or a bare date (Gate: "2026-11-03" above the list).
function headingLike (text: string): boolean {
    return text.length > 0 && text.length <= HEADING_LIKE_CHARS && text.split (/\s+/).length <= HEADING_LIKE_WORDS && !/[.:;,!?]$/.test (text) && !dateOrVersionOnly (text) && !genericLabel (text);
}

// The topic sub-heading the body opens with, past metadata/label lines, notes (blockquotes) and
// generic section headings: "### Added" then "#### nonceWindow — Optional Request Deadline", or a
// heading followed by prose ("#### Underlying Security Type" + a paragraph). A first heading right
// above a list is a category ("### Documentation (V1)" + "- Account GET ..."): null, like a body
// that opens with prose or a list.
function openingHeading (lines: string[]): string | null {
    let afterGeneric = false;
    for (const [ i, l ] of lines.entries ()) {
        const t = l.trim ();
        if (!t || /^>/.test (t) || /^(?:-{3,}|\*{3,}|_{3,})$/.test (t)) {
            continue;
        }
        const h = HEADING.exec (l);
        if (h) {
            const text = markdownToPlain (h[1]);
            if (!text || genericLabel (text) || dateOrVersionOnly (text)) {
                afterGeneric = true;
                continue;
            }
            const next = nextNonBlank (lines, i);
            const aboveList = next !== undefined && BULLET.test (next.trim ());
            return (text.length <= HEADING_LIKE_CHARS && (afterGeneric || !aboveList)) ? text : null;
        }
        if (labelLine (lines, i)) {
            continue;
        }
        return null;
    }
    return null;
}

// Text of the list item at line `i` with its continuation lines (indented, not a nested item).
function listItem (lines: string[], i: number): { text: string; end: number } {
    const parts: string[] = [ lines[i].trim ().replace (BULLET, '') ];
    let j = i + 1;
    for (; j < lines.length; j++) {
        const l = lines[j];
        if (!l.trim () || !/^\s+\S/.test (l) || BULLET.test (l.trim ())) {
            break;
        }
        parts.push (l.trim ());
    }
    return { text: parts.join (' '), end: j };
}

// First nested list item right below the item ending at line `end`.
function nestedItem (lines: string[], end: number): string | null {
    const l = lines[end];
    if (l === undefined || !/^\s+/.test (l) || !BULLET.test (l.trim ())) {
        return null;
    }
    return listItem (lines, end).text;
}

// A heading-like first paragraph before any list (Deribit RSS: "Delayed publication of ...", then
// prose, then bullets), else the topic sub-heading the body opens with (openingHeading), else the
// first top-level bullet that is not a rollout schedule line ("Testnet: <date>"), with its
// continuation lines (a bold-only label bullet "**REST**" gives way to its first nested item, a
// dangling "... error code in" is completed by it), else the first paragraph. Metadata lines
// ("**Release Date:** ...") and list labels ("**Docs**" above a list) are skipped throughout.
export function bodySummary (body: string): string {
    const lines = body.split ('\n');
    const bullets = lines.map ((l, i) => (BULLET.test (l) ? i : -1)).filter ((i) => i !== -1);
    const firstBullet = bullets.length ? bullets[0] : lines.length;
    const lead = firstParagraph (lines, 0, firstBullet);
    if (bullets.length && headingLike (lead)) {
        return lead;
    }
    const heading = openingHeading (lines);
    if (heading) {
        return heading;
    }
    // not a rollout schedule line, not a bold-only label without nested items ("* **REST API**" then "* Added ...")
    const usable = (i: number) => {
        const item = listItem (lines, i);
        return !SCHEDULE_BULLET.test (item.text) && !(BOLD_ONLY.test (item.text) && nestedItem (lines, item.end) === null);
    };
    const start = bullets.find (usable) ?? bullets[0];
    if (start === undefined) {
        return firstParagraph (lines, 0, lines.length).replace (/[:;,]\s*$/, '');
    }
    const item = listItem (lines, start);
    let text = item.text;
    const child = nestedItem (lines, item.end);
    if (child && BOLD_ONLY.test (text.trim ())) {
        text = child;
    } else if (child && DANGLING.test (markdownToPlain (text))) {
        text = `${text.replace (/\s*:\s*$/, '')} ${child}`;
    }
    return markdownToPlain (text).replace (/[:;,]\s*$/, '');
}

// SourceConfig.section: the body cut to the sections whose heading text matches `pattern` (heading
// line included, up to the next heading of the same or a higher level); null when none matches.
export function sectionBody (body: string, pattern: string): string | null {
    const re = new RegExp (pattern, 'i');
    const out: string[] = [];
    let level = 0;      // level of the open matching section, 0 = outside
    let fence = false;
    for (const line of body.split ('\n')) {
        if (/^\s*(?:```|~~~)/.test (line)) {
            fence = !fence;
        }
        const h = fence ? null : /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec (line);
        if (h) {
            const n = h[1].length;
            if (level && n <= level) {
                level = 0;
            }
            if (!level && re.test (markdownToPlain (h[2]))) {
                level = n;
                if (out.length) {
                    out.push ('');
                }
            }
        }
        if (level) {
            out.push (line);
        }
    }
    const text = out.join ('\n').trim ();
    return text ? text : null;
}

// Body characters that tell apart entries sharing a key (same date and title, or same undated title).
const DISCRIMINATOR_CHARS = 200;

// Ids for one run. The key is `source|guid` or `source|date|title`, where `date` never comes from
// the body (a body edit must stay a revision, not re-key the entry). Keys shared by several
// entries are disambiguated by content, counting from the bottom of the page: the bottom-most
// keeps the plain key (changelogs are newest first, so a new item on top never takes over an
// older item's id), the others get a hash of the start of their body, and only identical bodies
// fall back to a position suffix (also counted from the bottom).
export function assignKeys (items: { base: string; body: string }[]): string[] {
    const groups = new Map<string, number[]> ();
    items.forEach ((it, i) => groups.set (it.base, [ ...(groups.get (it.base) ?? []), i ]));
    const keys = items.map ((it) => it.base);
    for (const [ base, idx ] of groups) {
        if (idx.length < 2) {
            continue;
        }
        const used = new Set<string> ([ base ]);
        for (const i of idx.slice (0, -1).reverse ()) {
            const withBody = `${base}|b:${sha256 (oneLine (items[i].body).toLowerCase ().slice (0, DISCRIMINATOR_CHARS)).slice (0, 16)}`;
            let key = withBody;
            for (let n = 2; used.has (key); n++) {
                key = `${withBody}|#${n}`;
            }
            used.add (key);
            keys[i] = key;
        }
    }
    return keys;
}

// Sources whose entries are generated by the collector from a diff (always dateKind firstSeen).
export function isSynthetic (source: SourceConfig): boolean {
    return source.type === 'hash' || source.type === 'spec';
}

export function buildEntries (raws: ParsedEntry[], ctx: BuildContext): ChangelogEntry[] {
    const { venue, source, now } = ctx;
    const nowIso = now.toISOString ();
    const today = isoDay (now);
    const link = sourceLink (source);
    const prepared: { raw: ParsedEntry; title: string; body: string; date: string | null; base: string }[] = [];
    for (const raw of applyFilters (source, raws)) {
        const title = cleanTitle (raw.title);
        if (!title) {
            continue;
        }
        let body = cleanBody (raw.body ?? '');
        if (source.section) {
            const kept = sectionBody (body, source.section);
            if (kept === null) {
                continue;
            }
            body = kept;
        }
        // hash/spec sources: the body lists added page lines or operations, any date in them is not the change date
        const synthetic = isSynthetic (source);
        const date = synthetic ? null : baseDate (raw, title, body, source, now);
        const idDate = synthetic ? null : baseDate (raw, title, '', source, now);
        prepared.push ({ raw, title, body, date, base: entryKey (source.id, raw.guid, idDate, title) });
    }
    const keys = assignKeys (prepared);
    const out: ChangelogEntry[] = [];
    prepared.forEach (({ raw, title, body, date }, i) => {
        const synthetic = isSynthetic (source);
        const stated = synthetic ? null : findEffectiveDate (title + '\n' + body, source.date?.order, now);
        // rss: a dated link fragment that differs from pubDate is the scheduled date (Kalshi "#november-12-2026")
        let fragment: string | null = null;
        if (source.type === 'rss' && raw.anchor) {
            const f = anchorDate (raw.anchor, source.date?.order, now);
            fragment = (f && f !== extractDate (raw.dateText, undefined, source.date?.order, now)) ? f : null;
        }
        let publishedAt: string | null = date;
        let effectiveDate: string | undefined = fragment ?? stated ?? undefined;
        if (date && date > today) {
            // future-dated heading/item = scheduled change. A date read with an explicit
            // date.pattern is the one the registry chose ("live trading expected on <date>"), so it
            // wins over the first effective-date phrase in the body ("demo trading on <date>").
            publishedAt = null;
            effectiveDate = source.date?.pattern ? (fragment ?? date) : (effectiveDate ?? date);
        }
        if (effectiveDate && publishedAt && effectiveDate === publishedAt) {
            effectiveDate = undefined;
        }
        const candidateUrl = raw.link ?? (raw.anchor ? `${link.split ('#')[0]}#${anchorFragment (raw.anchor)}` : undefined);
        const checked = checkLink (candidateUrl, venue.domains);
        const tags = raw.tags ? [ ...raw.tags ] : ruleTags (title, body);
        if (candidateUrl && !checked) {
            tags.push ('link-rewritten');
        }
        const id = entryId (keys[i]);
        if (raw.partition && ctx.partitions) {
            ctx.partitions.set (id, raw.partition);
        }
        out.push ({
            schemaVersion: SCHEMA_VERSION,
            id,
            kind: venue.kind,
            exchange: venue.id,
            affects: ctx.affects,
            source: source.id,
            sourceType: source.type,
            sourceLink: link,
            ...(source.scope ? { scope: source.scope } : {}),
            title: displayTitle (title, body, { date, keepVersion: keepsVersion (source), order: source.date?.order }),
            excerpt: makeExcerpt (body) || title,
            body,
            url: checked ?? link,
            publishedAt,
            ...(effectiveDate ? { effectiveDate } : {}),
            dateKind: effectiveDate ? 'effective' : (publishedAt ? 'published' : 'firstSeen'),
            firstSeen: nowIso,
            lastSeen: nowIso,
            hash: entryHash (title, body),
            backfill: ctx.firstRun,
            tags,
            ccxt: { status: 'new' },
        });
    });
    return out;
}

// ccxt ids an entry affects: the venue, its subclasses, and every sharedWith venue (+ subclasses).
export function affectsFor (venue: VenueConfig, source: SourceConfig, registry: Registry): string[] {
    const ids = [ venue.id, ...(venue.subclasses ?? []) ];
    for (const other of sharedTargets (registry, venue, source)) {
        ids.push (other.id, ...(other.subclasses ?? []));
    }
    return [ ...new Set (ids) ];
}
