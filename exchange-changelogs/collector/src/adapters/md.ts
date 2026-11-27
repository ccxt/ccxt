// Markdown / MDX files (GitHub raw files, docs `.md` exports).
//
// slice.from / slice.to  regexes on whole lines; content = [first `from` line, first `to` line after it)
// split.heading          regex tested against ATX heading lines (default "^##\\s+").
//                        Every matching heading starts an entry; the entry runs until the next
//                        matching heading or the next heading of a higher level (fewer #).
// Headings inside ``` / ~~~ fences are ignored, including fences opened inside list items
// ("  - ```json"); opening and closing fences are recognized by the same rule (FENCE), and a
// fence closes only on the same character with at least the opening length.
// The nearest enclosing higher-level heading is kept as `context` so "### Fix X" under
// "## 2026-11-05" still gets a date. Anchors are GitHub-style slugs, made unique per page with
// -1, -2 ... suffixes counted over every heading of the file (as GitHub/Docusaurus do); "_" is kept,
// and "/" too on Mintlify exports (they start with the "> ## Documentation Index" preamble).
// Text outside code: markdown backslash escapes are unescaped ("transfer\_id", "\[NEW]", "\{id}"),
// a trailing "\" (hard line break) is dropped and autolinks "<https://...>" become their url.
import type { Adapter, ParsedEntry } from './types.ts';
import { normalizeWhitespace } from '../normalize.ts';

const ATX = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
// optional indentation and list markers ("  - ", "1. ", "> "), then ``` or ~~~ (3+)
// (an info string after ``` may not contain backticks: "- ```a``` b" is inline code, not a fence)
const FENCE = /^\s*(?:(?:[-*+]|\d+[.)]|>)\s+)*(`{3,}|~{3,})(.*)$/;

function fenceOf (line: string): { marker: string; info: string } | null {
    const m = FENCE.exec (line);
    if (!m || (m[1][0] === '`' && m[2].includes ('`'))) {
        return null;
    }
    return { marker: m[1], info: m[2].trim () };
}

// Tracks fenced code blocks line by line. Returns true for lines that are inside a fence
// (fence lines included), so callers never treat them as headings.
export class FenceTracker {
    private open: string | null = null;
    inside (line: string): boolean {
        const f = fenceOf (line);
        if (this.open === null) {
            if (f) {
                this.open = f.marker;
                return true;
            }
            return false;
        }
        // closing fence: same character, at least as long, no info string
        if (f && !f.info && f.marker[0] === this.open[0] && f.marker.length >= this.open.length) {
            this.open = null;
        }
        return true;
    }
}

export function sliceRange (lines: string[], from?: string, to?: string): [ number, number ] {
    let start = 0;
    if (from) {
        const re = new RegExp (from, 'i');
        start = lines.findIndex ((l) => re.test (l));
        if (start === -1) {
            throw new Error (`slice.from /${from}/ not found`);
        }
    }
    let end = lines.length;
    if (to) {
        const re = new RegExp (to, 'i');
        const rel = lines.slice (start + 1).findIndex ((l) => re.test (l));
        if (rel !== -1) {
            end = start + 1 + rel;
        }
    }
    return [ start, end ];
}

export function sliceLines (lines: string[], from?: string, to?: string): string[] {
    const [ start, end ] = sliceRange (lines, from, to);
    return lines.slice (start, end);
}

// line index -> unique anchor for every heading outside fences
export function headingAnchors (lines: string[], opts: SlugOptions = {}): Map<number, string> {
    const fences = new FenceTracker ();
    const counts = new Map<string, number> ();
    const out = new Map<number, string> ();
    lines.forEach ((line, i) => {
        if (fences.inside (line)) {
            return;
        }
        const m = ATX.exec (line);
        if (!m) {
            return;
        }
        const slug = slugify (lightMarkdown ([ m[2] ]), opts);
        const n = counts.get (slug) ?? 0;
        counts.set (slug, n + 1);
        out.set (i, n ? `${slug}-${n}` : slug);
    });
    return out;
}

export interface SlugOptions {
    keepSlash?: boolean;        // Mintlify keeps "/" ("adding-new-put-/address-book/id-rest-endpoint")
}

// GitHub / Docusaurus style heading slug ("_" is kept, like github-slugger).
export function slugify (title: string, opts: SlugOptions = {}): string {
    const drop = opts.keepSlash ? /[`*~[\]()<>!?'".,:;\\@#$%^&+=|{}]/g : /[`*~[\]()<>!?'".,:;/\\@#$%^&+=|{}]/g;
    return title.toLowerCase ().trim ()
        .replace (drop, '')
        .replace (/\s+/g, '-');
}

// Mintlify `.md` exports open with this preamble.
const MINTLIFY_PREAMBLE = /^\s*>\s*#{1,6}\s*Documentation Index\s*\n>\s*Fetch the complete documentation index at:/i;

export function isMintlifyExport (text: string): boolean {
    return MINTLIFY_PREAMBLE.test (text);
}

const ESCAPE = /\\([!-/:-@[-`{-~])/g;

// Backslash escapes outside code spans ("transfer\_id" -> "transfer_id", "\[NEW]" -> "[NEW]"); a
// trailing "\" (markdown hard line break) is dropped.
export function unescapeMarkdown (line: string): string {
    return line.split (/(`+[^`]*`+)/).map ((part, i) => ((i % 2) ? part : part.replace (ESCAPE, '$1'))).join ('').replace (/\\$/, '');
}

// Markdown/MDX body cleanup: links -> text, autolinks -> url, images/JSX/imports dropped,
// backslash escapes undone outside code fences and code spans.
export function lightMarkdown (lines: string[]): string {
    const fences = new FenceTracker ();
    const out = lines
        .filter ((l) => !/^\s*(?:import|export)\s.+(?:from\s+)?['"].*['"];?\s*$/.test (l))
        .map ((l) => {
            if (fences.inside (l)) {
                return l;
            }
            return unescapeMarkdown (l
                .replace (/!\[[^\]]*\]\([^)]*\)/g, '')
                .replace (/\[([^\]]*)\]\([^)]*\)/g, '$1')
                .replace (/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
                .replace (/<(https?:\/\/[^\s<>]+)>/g, '$1')
                .replace (/<\/?[A-Za-z][^<>]*>/g, ''));
        });
    return normalizeWhitespace (out.join ('\n'));
}

export const md: Adapter = ({ source, body }) => {
    const all = body.replace (/\r\n?/g, '\n').replace (/^---\n[\s\S]*?\n---\n/, '').split ('\n');
    const [ start, end ] = sliceRange (all, source.slice?.from, source.slice?.to);
    const lines = all.slice (start, end);
    const anchors = headingAnchors (all, { keepSlash: isMintlifyExport (body) });
    const headingRe = new RegExp (source.split?.heading ?? '^##\\s+');
    const entries: ParsedEntry[] = [];
    const ancestors: { level: number; text: string }[] = [];
    let current: { level: number; title: string; anchor?: string; context?: string; lines: string[] } | undefined;
    const fences = new FenceTracker ();
    const flush = () => {
        if (current) {
            entries.push ({
                title: lightMarkdown ([ current.title ]),
                body: lightMarkdown (current.lines),
                anchor: current.anchor,
                context: current.context,
            });
        }
        current = undefined;
    };
    for (const [ offset, line ] of lines.entries ()) {
        const m = fences.inside (line) ? null : ATX.exec (line);
        if (m) {
            const level = m[1].length;
            const matches = headingRe.test (line);
            while (ancestors.length && ancestors[ancestors.length - 1].level >= level) {
                ancestors.pop ();
            }
            if (matches || (current && level < current.level)) {
                flush ();
            }
            if (matches) {
                current = { level, title: m[2], anchor: anchors.get (start + offset), context: ancestors.map ((a) => a.text).join (' / ') || undefined, lines: [] };
            } else if (current) {
                current.lines.push (line);
            }
            ancestors.push ({ level, text: m[2] });
            continue;
        }
        if (current) {
            current.lines.push (line);
        }
    }
    flush ();
    return { entries, snapshot: normalizeWhitespace (lines.join ('\n')) };
};
