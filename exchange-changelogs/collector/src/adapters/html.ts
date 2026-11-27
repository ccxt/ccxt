// Server-rendered HTML pages (Slate, Docusaurus, ReadMe, Mintlify, GitBook ...).
//
// strip           CSS selectors removed first (script/style/nav/noscript/template are always removed)
// slice.selector  container holding the changelog (default: body)
// split.heading   CSS selector list of entry headings, e.g. "h2" or "h2, h3". An entry is the heading
//                 plus its following siblings until the next matching element, or a real heading
//                 (h1-h6) of the same or higher level (h1 ends an h2 entry). The split element may be
//                 a non-heading ("p > strong", "p:has(> strong)"): then any real heading ends it, and
//                 ordinary siblings (p, ul, table ...) belong to the entry.
// split.item      CSS selector for row-style changelogs (table rows, cards); each match is one entry,
//                 titled by its first heading/strong/first cell.
// anchor          heading id (or id of a child/anchor inside it); single-quoted ids are fine.
import * as cheerio from 'cheerio';
import type { Adapter, ParsedEntry } from './types.ts';
import { absoluteUrl } from './types.ts';
import { nodesToText, type DomNode } from '../htmltext.ts';
import { normalizeWhitespace, oneLine } from '../normalize.ts';

type Cheerio = ReturnType<cheerio.CheerioAPI>;

const ALWAYS_STRIP = [ 'script', 'style', 'nav', 'noscript', 'template', 'iframe', 'svg' ];

const INLINE = new Set ([ 'strong', 'b', 'em', 'i', 'span', 'a', 'code', 'u', 'mark', 'time' ]);

function headingLevel (node: DomNode): number {
    const m = /^h([1-6])$/i.exec (node.name ?? '');
    return m ? Number (m[1]) : 7;
}

function anchorOf ($: cheerio.CheerioAPI, el: Cheerio): string | undefined {
    const own = el.attr ('id');
    if (own) {
        return own;
    }
    const child = el.find ('[id]').first ().attr ('id') ?? el.find ('a[name]').first ().attr ('name');
    if (child) {
        return child;
    }
    const href = el.find ('a[href^="#"]').first ().attr ('href');
    if (href && href.length > 1) {
        return href.slice (1);
    }
    const parentId = el.parent ().attr ('id');
    return parentId && $ (el.parent ()).children ().first ().is (el) ? parentId : undefined;
}

export function loadContainer (body: string, strip: string[] | undefined, selector: string | undefined): { $: cheerio.CheerioAPI; container: Cheerio } {
    const $ = cheerio.load (body);
    for (const sel of [ ...ALWAYS_STRIP, ...(strip ?? []) ]) {
        $ (sel).remove ();
    }
    const container = selector ? $ (selector).first () : $ ('body');
    if (selector && container.length === 0) {
        throw new Error (`slice.selector "${selector}" not found`);
    }
    return { $, container: container.length ? container : $.root () };
}

function splitByHeading ($: cheerio.CheerioAPI, container: Cheerio, selector: string, base: string): ParsedEntry[] {
    const headings = container.find (selector).toArray ();
    const matching = new Set (headings);
    const entries: ParsedEntry[] = [];
    for (const h of headings) {
        const node = h as unknown as DomNode;
        const level = headingLevel (node);
        const parts: DomNode[] = [];
        // an inline split element ("p > strong") stands for its block: the rest of that block
        // and the block's following siblings form the entry
        let block = $ (h);
        if (INLINE.has ((node.name ?? '').toLowerCase ()) && block.parent ().length && !container.is (block.parent ())) {
            const parent = block.parent ();
            const kids = parent.contents ().toArray ();
            parts.push (...(kids.slice (kids.indexOf (h) + 1) as unknown as DomNode[]));
            block = parent;
        }
        let sib = block.next ();
        while (sib.length) {
            const sibNode = sib.get (0) as unknown as DomNode;
            const sibLevel = headingLevel (sibNode);
            if (matching.has (sib.get (0)!) || (sibLevel < 7 && sibLevel <= level)) {
                break;
            }
            // a sibling wrapping the next entry heading ends this one
            if (sib.find (selector).toArray ().some ((el) => matching.has (el))) {
                break;
            }
            parts.push (sibNode);
            sib = sib.next ();
        }
        // nearest preceding higher-level heading (e.g. the h1 date above an h2 entry)
        let context: string | undefined;
        if (level < 7) {
            const higher = Array.from ({ length: level - 1 }, (_v, i) => `h${i + 1}`).join (',');
            if (higher) {
                const prev = $ (h).prevAll (higher).first ();
                context = prev.length ? oneLine (prev.text ()) : undefined;
            }
        }
        const anchor = anchorOf ($, $ (h));
        entries.push ({
            title: oneLine ($ (h).text ()),
            body: nodesToText (parts),
            anchor,
            link: anchor ? absoluteUrl ('#' + anchor, base) : undefined,
            context,
        });
    }
    return entries;
}

function splitByItem ($: cheerio.CheerioAPI, container: Cheerio, selector: string, base: string): ParsedEntry[] {
    return container.find (selector).toArray ().map ((el) => {
        const item = $ (el);
        const titleEl = item.find ('h1, h2, h3, h4, h5, h6, strong, b').first ();
        const full = nodesToText ([ el as unknown as DomNode ]);
        const title = titleEl.length ? oneLine (titleEl.text ()) : oneLine (full.split ('\n')[0].replace (/^\|\s*|\s*\|$/g, ''));
        // The title element is not repeated in the body ("<li><strong>2025-11-13</strong> - Update
        // 35=D</li>" -> body "Update 35=D"); an inline title's separator goes with it.
        let body = full;
        if (titleEl.length) {
            const clone = item.clone ();
            clone.find ('h1, h2, h3, h4, h5, h6, strong, b').first ().remove ();
            body = nodesToText (clone.toArray () as unknown as DomNode[]);
            const rest = full.trimStart ();
            if (/^(?:strong|b)$/i.test (titleEl.prop ('tagName') ?? '') && rest.startsWith (title) && /^[ \t]*[-–—:|]/.test (rest.slice (title.length))) {
                body = body.replace (/^[ \t]*[-–—:|][ \t]*/, '');
            }
            if (!body.trim ()) {
                body = full;
            }
        }
        const href = item.find ('a[href]').first ().attr ('href');
        const anchor = item.attr ('id') ?? item.find ('[id]').first ().attr ('id');
        return {
            title,
            body,
            anchor,
            link: anchor ? absoluteUrl ('#' + anchor, base) : absoluteUrl (href, base),
        };
    });
}

export const html: Adapter = ({ source, body, url }) => {
    const { $, container } = loadContainer (body, source.strip, source.slice?.selector);
    const base = source.link ?? url;
    let entries: ParsedEntry[];
    if (source.split?.item) {
        entries = splitByItem ($, container, source.split.item, base);
    } else {
        entries = splitByHeading ($, container, source.split?.heading ?? 'h2', base);
    }
    const snapshot = normalizeWhitespace (nodesToText (container.toArray () as unknown as DomNode[]));
    return { entries: entries.filter ((e) => e.title.length > 0), snapshot };
};
