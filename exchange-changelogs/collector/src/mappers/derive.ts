// Derive API changelog, the Mintlify markdown export https://docs.derive.xyz/changelog.md (the
// body is not JSON). Layout, newest first:
//   **October 29, 2026**            <- date of the Mintlify <Update> block (a bold line, not a heading)
//   ## Parameter updates for ...    <- one change; a block can hold several "##" changes
//   ### DRV / * bullets ...
//   ...
//   ## Related topics               <- page footer (skipped), then "This documentation is built ..."
// The md adapter splits on headings, which leaves each date line at the end of the previous
// entry; the RSS feed (/changelog/rss.xml) has one item per date titled only with the date, a
// pubDate that is not the change date, and only the newest 15 dates. This mapper pairs every "##"
// change with the bold date above it: title = the heading, dateText = the date, body = the lines up
// to the next "##" or date line (links become their text, "\$" unescaped), anchor = Mintlify's date anchor
// ("october-29-2026", the same fragment the RSS links use; a second block with the same date is
// "september-17-2026-2", a third "-3", and every change under one date line shares its anchor).
import type { MapperContext } from '../adapters/json.ts';
import type { RawEntry } from '../types.ts';

const DATE_LINE = /^\*\*\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},\s+20\d\d)\s*\*\*$/i;
const HEADING = /^##\s+(.+?)\s*#*\s*$/;
const FENCE = /^\s*(```|~~~)/;
const FOOTER = /^(?:related topics|see also)$/i;

function slug (text: string): string {
    return text.toLowerCase ().replace (/[^a-z0-9\s-]/g, '').trim ().replace (/\s+/g, '-');
}

function plainLinks (line: string): string {
    return line.replace (/!?\[([^\]]*)\]\([^)\s]*\)/g, '$1').replace (/\\([$<>])/g, '$1'); // "\$30M" -> "$30M"
}

interface Open {
    title: string;
    date: string;
    anchor: string;
    lines: string[];
}

export default function derive (_data: unknown, raw: string, ctx: MapperContext): RawEntry[] {
    const base = ctx.source.link ?? ctx.url;
    const out: RawEntry[] = [];
    let date: string | undefined;
    let anchor = '';
    const seen = new Map<string, number> ();
    let open: Open | undefined;
    let skipping = false;
    let fenced = false;
    const close = () => {
        if (open) {
            const { anchor } = open;
            out.push ({
                title: open.title,
                body: open.lines.join ('\n').replace (/\n{3,}/g, '\n\n').trim (),
                dateText: open.date,
                anchor,
                link: new URL ('#' + anchor, base).toString (),
            });
        }
        open = undefined;
    };
    for (const line of raw.split (/\r?\n/)) {
        if (FENCE.test (line)) {
            fenced = !fenced;
        }
        if (!fenced) {
            const d = DATE_LINE.exec (line.trim ());
            if (d) {
                close ();
                date = d[1].replace (/\s+/g, ' ');
                const base = slug (date);
                const n = (seen.get (base) ?? 0) + 1;
                seen.set (base, n);
                anchor = (n > 1) ? `${base}-${n}` : base;
                skipping = false;
                continue;
            }
            const h = HEADING.exec (line);
            if (h) {
                close ();
                const title = plainLinks (h[1]).trim ();
                skipping = FOOTER.test (title) || date === undefined;
                if (!skipping && date !== undefined) {
                    open = { title, date, anchor, lines: [] };
                }
                continue;
            }
        }
        if (open && !skipping) {
            open.lines.push (plainLinks (line));
        }
    }
    close ();
    if (!out.length) {
        throw new Error ('derive: no "## <title>" under a "**<Month D, YYYY>**" date line');
    }
    return out;
}
