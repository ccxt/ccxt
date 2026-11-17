// Foxbit API changelogs, rendered by Redoc (server-rendered HTML; the body is not JSON):
//   https://docs.foxbit.com.br/rest/v3/changelog/   (REST v3)
//   https://docs.foxbit.com.br/ws/v3/changelog/     (WebSocket v3; not in the sitemap)
// The page embeds the changelog as an OpenAPI document in `const __redoc_state = {...}`: every tag
// is one day (name "2026-11-03", newest first) and its markdown description holds one
// "## <title>" section per change (bullets, sometimes an inline-HTML notice box and a trailing
// <hr>). The rendered DOM nests the headings in styled-components divs, so the html adapter cannot
// pair them with their text; this mapper reads the tags instead. One entry per "##" section:
// title = the heading, dateText = the tag name, body = the section as light markdown (inline HTML
// reduced to text, links to their text). Anchors are Redoc's section ids, taken from the page's
// data-section-id="tag/<date>/<slug>" attributes in document order (Redoc's own slugs, which
// encode inline <code> as "lesscodegreater"), falling back to the day section "tag/<date>".
import { redocSpec } from '../adapters/spec.ts';
import { decodeEntities } from '../normalize.ts';
import type { MapperContext } from '../adapters/json.ts';
import type { RawEntry } from '../types.ts';

const DAY = /^20\d\d-\d\d-\d\d$/;

function toText (markdown: string): string {
    return markdown
        .replace (/<br\s*\/?>/gi, '\n')
        .replace (/<\/(?:div|p|li)>/gi, '\n')
        .replace (/<hr\s*\/?>/gi, '')
        .replace (/<[^>]+>/g, '')
        .replace (/!?\[([^\]]*)\]\([^)\s]*\)/g, '$1')
        .split ('\n')
        .map ((l) => decodeEntities (l).replace (/\s+$/, ''))
        .join ('\n')
        .replace (/\n{3,}/g, '\n\n')
        .trim ();
}

function sectionIds (raw: string): Map<string, string[]> {
    const ids = new Map<string, string[]> ();
    const re = /data-section-id="tag\/(20\d\d-\d\d-\d\d)\/([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec (raw)) !== null) {
        const list = ids.get (m[1]) ?? [];
        list.push (`tag/${m[1]}/${decodeEntities (m[2])}`);
        ids.set (m[1], list);
    }
    return ids;
}

export default function foxbit (_data: unknown, raw: string, ctx: MapperContext): RawEntry[] {
    const spec = redocSpec (raw) as { tags?: { name?: unknown; description?: unknown }[] };
    const tags = Array.isArray (spec.tags) ? spec.tags : [];
    const ids = sectionIds (raw);
    const base = ctx.source.link ?? ctx.url;
    const out: RawEntry[] = [];
    for (const tag of tags) {
        const day = (typeof tag.name === 'string') ? tag.name.trim () : '';
        if (!DAY.test (day)) {
            continue;
        }
        const description = (typeof tag.description === 'string') ? tag.description : '';
        const anchors = ids.get (day) ?? [];
        const sections = description.split (/^##\s+/m);
        const preamble = toText (sections.shift () ?? '');
        if (!sections.length) {
            if (preamble) {
                out.push ({ title: day, body: preamble, dateText: day, anchor: `tag/${day}`, link: new URL (`#tag/${day}`, base).toString () });
            }
            continue;
        }
        sections.forEach ((section, i) => {
            const nl = section.indexOf ('\n');
            const title = toText ((nl === -1) ? section : section.slice (0, nl)).replace (/\s+/g, ' ');
            const text = toText ((nl === -1) ? '' : section.slice (nl + 1));
            const body = (i === 0 && preamble) ? `${preamble}\n\n${text}` : text;
            const anchor = anchors[i] ?? `tag/${day}`;
            out.push ({
                title: title || day,
                body,
                dateText: day,
                anchor,
                link: new URL ('#' + anchor, base).toString (),
            });
        });
    }
    if (!out.length) {
        throw new Error ('foxbit: no dated tags (YYYY-MM-DD) in __redoc_state');
    }
    return out;
}
