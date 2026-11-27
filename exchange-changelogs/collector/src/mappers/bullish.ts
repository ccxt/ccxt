// Bullish API changelogs (Docusaurus, server-rendered HTML; the body is not JSON):
//   https://docs.exchange.bullish.com/rest/changelog
//   https://docs.exchange.bullish.com/websocket/ws-api-change-log
// Layout: h2 "2026 Changes", then one h3 per month "[2026-09]" holding h4 "Added" / "Changed" /
// "Deprecated" sub-sections with bullet lists. Months are the only dates on the page, which the
// html adapter cannot read (a date needs a day), so each month becomes one entry dated the first
// day of that month (dateText "2026-09-01"); the title keeps the month as published ("[2026-09]")
// and the engine appends a summary of the first bullet. Anchor = the h3 id ("2026-09").
import * as cheerio from 'cheerio';
import { nodesToText, type DomNode } from '../htmltext.ts';
import type { MapperContext } from '../adapters/json.ts';
import type { RawEntry } from '../types.ts';

const MONTH = /^\[?\s*(20\d\d)-(0[1-9]|1[0-2])\s*\]?$/;

export default function bullish (_data: unknown, raw: string, ctx: MapperContext): RawEntry[] {
    const $ = cheerio.load (raw);
    $ ('script, style, nav, noscript, template, iframe, svg, a.hash-link').remove ();
    const container = $ ('article .theme-doc-markdown').first ();
    if (!container.length) {
        throw new Error ('bullish: article .theme-doc-markdown not found');
    }
    const base = ctx.source.link ?? ctx.url;
    const out: RawEntry[] = [];
    for (const h of container.find ('h3').toArray ()) {
        const title = $ (h).text ().replace (/[​\s]+/g, ' ').trim ();
        const m = MONTH.exec (title);
        if (!m) {
            continue;
        }
        const parts: DomNode[] = [];
        let sib = $ (h).next ();
        while (sib.length && !/^h[1-3]$/i.test (sib.prop ('tagName') ?? '')) {
            parts.push (sib.get (0) as unknown as DomNode);
            sib = sib.next ();
        }
        const anchor = $ (h).attr ('id');
        out.push ({
            title: `[${m[1]}-${m[2]}]`,
            body: nodesToText (parts),
            dateText: `${m[1]}-${m[2]}-01`,
            anchor,
            link: anchor ? new URL ('#' + anchor, base).toString () : undefined,
        });
    }
    return out;
}
