// RSS 2.0 and Atom. Item HTML (content:encoded / description / content / summary) -> light markdown.
// The item link's #fragment becomes the entry anchor; entries.ts uses a dated fragment that differs
// from pubDate as the effective date (Kalshi links scheduled changes as "#november-12-2026").
import { XMLParser } from 'fast-xml-parser';
import { htmlToText } from '../htmltext.ts';
import type { Adapter, ParsedEntry } from './types.ts';
import { absoluteUrl } from './types.ts';

type Node = Record<string, unknown>;

const parser = new XMLParser ({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    textNodeName: '#text',
    cdataPropName: false,
    processEntities: true,
    htmlEntities: true,
    parseTagValue: false,
    trimValues: true,
    isArray: (name) => [ 'item', 'entry', 'category', 'link' ].includes (name),
});

function text (value: unknown): string {
    if (value === undefined || value === null) {
        return '';
    }
    if (typeof value === 'string' || typeof value === 'number') {
        return String (value);
    }
    if (Array.isArray (value)) {
        return text (value[0]);
    }
    if (typeof value === 'object') {
        const node = value as Node;
        return text (node['#text'] ?? node['@term'] ?? '');
    }
    return '';
}

function atomLink (links: unknown): string | undefined {
    if (!Array.isArray (links)) {
        return undefined;
    }
    const nodes = links.map ((l) => (typeof l === 'string' ? { '@href': l } : l as Node));
    const alt = nodes.find ((l) => !l['@rel'] || l['@rel'] === 'alternate') ?? nodes[0];
    return alt ? text (alt['@href'] ?? alt['#text']) : undefined;
}

function fragmentOf (href: string | undefined): string | undefined {
    if (!href) {
        return undefined;
    }
    try {
        const hash = new URL (href).hash.slice (1);
        return hash ? decodeURIComponent (hash) : undefined;
    } catch {
        return undefined;
    }
}

export const rss: Adapter = ({ body, url }) => {
    const doc = parser.parse (body) as Node;
    const channel = (doc['rss'] as Node | undefined)?.['channel'] as Node | undefined;
    const rdf = doc['rdf:RDF'] as Node | undefined;
    const feed = doc['feed'] as Node | undefined;
    const items = ((channel?.['item'] ?? rdf?.['item'] ?? feed?.['entry']) ?? []) as Node[];
    if (!channel && !rdf && !feed) {
        throw new Error ('not an RSS/Atom document');
    }
    const entries: ParsedEntry[] = items.map ((item) => {
        const isAtom = feed !== undefined;
        const html = text (item['content:encoded']) || text (item['content']) || text (item['description']) || text (item['summary']);
        const link = isAtom ? atomLink (item['link']) : (text (item['link']) || undefined);
        const guid = text (item['guid']) || text (item['id']) || undefined;
        const categories = ((item['category'] ?? []) as unknown[]).map (text).filter (Boolean);
        const dateText = text (item['pubDate']) || text (item['dc:date']) || text (item['published']) || text (item['updated']) || undefined;
        const abs = absoluteUrl (link, url);
        return {
            title: htmlToText (text (item['title'])),
            body: htmlToText (html),
            dateText,
            anchor: fragmentOf (abs),
            link: abs,
            guid,
            categories,
        };
    });
    const snapshot = entries.map ((e) => `${e.dateText ?? ''} ${e.title}\n${e.body}`).join ('\n\n');
    return { entries, snapshot };
};
