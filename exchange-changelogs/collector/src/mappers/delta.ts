// Delta Exchange API changelog: a section of the single Slate page https://docs.delta.exchange/
// (server-rendered HTML; the body is not JSON). Layout inside div.content:
//   <h1 id='changelog'>Changelog</h1>
//   <h2 id='16-10-26'>16.10.26</h2> <ol>...</ol> <p>...</p>   (newest first)
//   ...
//   <h2 id='18-10-2024'>18.10.2024</h2> ...                    (older entries: four-digit year)
//   <h2 id='v2-rest-api'>V2 Rest Api</h2> <h3>...</h3> ...     (undated legacy notes: skipped)
//   <h1 id='security'>Security</h1>                            (end of the section)
// Dates are DD.MM.YY, which the generic date parser does not read (it needs a four-digit year),
// hence this mapper: each dated h2 is one entry, titled and dated with the ISO date
// ("2026-10-16"; the engine appends a summary of the first list item), body = the siblings up to
// the next h2/h1, anchor = the h2 id ("16-10-26").
import * as cheerio from 'cheerio';
import { nodesToText, type DomNode } from '../htmltext.ts';
import type { MapperContext } from '../adapters/json.ts';
import type { RawEntry } from '../types.ts';

const DATE = /^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/;

function isoDate (text: string): string | undefined {
    const m = DATE.exec (text);
    if (!m) {
        return undefined;
    }
    const year = (m[3].length === 2) ? `20${m[3]}` : m[3];
    return `${year}-${m[2].padStart (2, '0')}-${m[1].padStart (2, '0')}`;
}

export default function delta (_data: unknown, raw: string, ctx: MapperContext): RawEntry[] {
    const $ = cheerio.load (raw);
    $ ('script, style, nav, noscript, template, iframe, svg').remove ();
    const start = $ ('h1#changelog').first ();
    if (!start.length) {
        throw new Error ('delta: <h1 id="changelog"> not found');
    }
    const base = ctx.url;
    const out: RawEntry[] = [];
    let sib = start.next ();
    while (sib.length) {
        const tag = (sib.prop ('tagName') ?? '').toLowerCase ();
        if (tag === 'h1') {
            break;
        }
        if (tag !== 'h2') {
            sib = sib.next ();
            continue;
        }
        const heading = sib.text ().replace (/\s+/g, ' ').trim ();
        const anchor = sib.attr ('id');
        const parts: DomNode[] = [];
        sib = sib.next ();
        while (sib.length && !/^h[12]$/i.test (sib.prop ('tagName') ?? '')) {
            parts.push (sib.get (0) as unknown as DomNode);
            sib = sib.next ();
        }
        const date = isoDate (heading);
        if (date === undefined) {
            continue; // "V2 Rest Api" and other undated sections
        }
        out.push ({
            title: date,
            body: nodesToText (parts),
            dateText: date,
            anchor,
            link: anchor ? new URL ('#' + anchor, base).toString () : undefined,
        });
    }
    if (!out.length) {
        throw new Error ('delta: no dated <h2> (DD.MM.YY) under the Changelog heading');
    }
    return out;
}
