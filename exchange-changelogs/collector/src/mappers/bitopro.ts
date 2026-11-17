// BitoPro changelog (https://github.com/bitoex/bitopro-offical-api-docs/blob/master/changelog.md),
// fetched raw from raw.githubusercontent.com. The file is one markdown table, newest first:
//   | Date       | Version | Description |
//   | 2026/10/08 | v3.5.19 | Update [Create Withdraw Invoice API](./api/v3/private/...md) to add ... |
//   |            |         | (blank date and version: continues the row above) |
// Some releases also span several dated rows with the same date and version (v3.5.10). All rows of
// one date + version become one entry: title = version, body = one bullet per row (links become
// their text), link = the first doc page the rows link to, made absolute on github.com.
// The engine shows the title as "v3.5.19: <first bullet>".
import type { RawEntry } from '../types.ts';

const BLOB = 'https://github.com/bitoex/bitopro-offical-api-docs/blob/master/';

function absolute (href: string): string {
    if (/^https?:\/\//i.test (href)) {
        return href;
    }
    if (href.startsWith ('#')) {
        return BLOB + 'changelog.md' + href;
    }
    return BLOB + href.replace (/^\.\//, '').replace (/^\/+/, '');
}

function cells (line: string): string[] {
    const inner = line.trim ().replace (/^\|/, '').replace (/\|$/, '');
    return inner.split (/(?<!\\)\|/).map ((c) => c.trim ());
}

interface Group {
    date: string;
    version: string;
    rows: string[];
    link?: string;
}

export default function bitopro (_data: unknown, raw: string): RawEntry[] {
    const lines = raw.split (/\r?\n/).filter ((l) => l.trim ().startsWith ('|'));
    const groups: Group[] = [];
    let headerSeen = false;
    for (const line of lines) {
        const c = cells (line);
        if (c.length < 3) {
            continue;
        }
        if (!headerSeen) {
            if (/^date$/i.test (c[0]) && /^version$/i.test (c[1])) {
                headerSeen = true;
            }
            continue;
        }
        if (c.every ((x) => /^:?-+:?$/.test (x) || x === '')) {
            continue; // alignment row
        }
        const [ date, version ] = c;
        const desc = c.slice (2).join (' | ').trim ();
        if (!desc) {
            continue;
        }
        const href = /\[[^\]]*\]\(([^)\s]+)\)/.exec (desc)?.[1];
        const firstHref = href !== undefined ? absolute (href) : undefined;
        const text = desc.replace (/\[([^\]]*)\]\([^)\s]+\)/g, '$1');
        const last = groups[groups.length - 1];
        const continues = last !== undefined && ((!date && !version) || (date === last.date && version === last.version));
        if (continues) {
            last.rows.push (text);
            last.link ??= firstHref;
        } else if (date) {
            groups.push ({ date, version, rows: [ text ], link: firstHref });
        }
    }
    if (!headerSeen) {
        throw new Error ('bitopro: changelog table header (| Date | Version | Description |) not found');
    }
    return groups.map ((g) => ({
        title: g.version || g.date,
        body: g.rows.map ((r) => `- ${r}`).join ('\n'),
        dateText: g.date,
        link: g.link,
    }));
}
