// BingX docs-v3 changelog (https://bingx-api.github.io/docs-v3/#/en/changes/logs).
// The SPA has no API: the changelog is a JSON module compiled into static/js/app.<hash>.js, and
// the hash changes on every deploy. The registry source uses `discover` to find the current
// bundle in the docs index.html, so this mapper gets the raw (non-JSON) bundle text:
//   type:"CHANGELOGS",logs:{zh:[...],en:[{updateTime:"..",path:"..",type,info,model,link}, ...]}
// The bundle's source map (app.<hash>.js.map, JSON with sourcesContent holding
//   module.exports = {"type":"CHANGELOGS","logs":{"zh":[...],"en":[...]}}) is accepted too.
import type { RawEntry } from '../types.ts';

interface BingxLog {
    updateTime?: string;
    path?: string;
    type?: string;
    info?: string;
    model?: string;
    link?: string;
}

const BASE = 'https://bingx-api.github.io/docs-v3/';

function fromModule (text: string): BingxLog[] | null {
    const i = text.indexOf ('{"type":"CHANGELOGS"');
    if (i === -1) {
        return null;
    }
    const end = text.lastIndexOf ('}');
    const parsed = JSON.parse (text.slice (i, end + 1)) as { logs?: { en?: BingxLog[] } };
    return parsed.logs?.en ?? null;
}

// minified bundle: type:"CHANGELOGS",logs:{zh:[...],en:[{updateTime:"..",path:"..",...}, ...]}
function fromBundle (text: string): BingxLog[] | null {
    const i = text.indexOf ('type:"CHANGELOGS"');
    if (i === -1) {
        return null;
    }
    const en = text.indexOf ('en:[', i);
    if (en === -1) {
        return null;
    }
    const logs: BingxLog[] = [];
    const item = /\{updateTime:("(?:[^"\\]|\\.)*")((?:,[a-zA-Z]+:(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))*)\}/y;
    const field = /,([a-zA-Z]+):("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
    let pos = en + 4;
    while (true) {
        item.lastIndex = pos;
        const m = item.exec (text);
        if (!m) {
            break;
        }
        const log: Record<string, string> = { updateTime: JSON.parse (m[1]) as string };
        for (const f of m[2].matchAll (field)) {
            const v = f[2].startsWith ("'") ? f[2].slice (1, -1) : JSON.parse (f[2]) as string;
            log[f[1]] = v;
        }
        logs.push (log);
        pos = item.lastIndex;
        if (text[pos] !== ',') {
            break;
        }
        pos++;
    }
    return logs;
}

export default function bingx (data: unknown, raw: string): RawEntry[] {
    let logs: BingxLog[] | null = null;
    if (data === undefined || typeof data === 'string') {
        const text = typeof data === 'string' ? data : raw;
        logs = fromBundle (text) ?? fromModule (text);
    } else {
        const contents = (data as { sourcesContent?: unknown })?.sourcesContent;
        if (!Array.isArray (contents)) {
            throw new Error ('bingx: expected a source map with sourcesContent');
        }
        for (const c of contents) {
            if (typeof c === 'string' && c.includes ('"type":"CHANGELOGS"')) {
                logs = fromModule (c);
                break;
            }
        }
    }
    if (!logs || !Array.isArray (logs)) {
        throw new Error ('bingx: CHANGELOGS module with an "en" list not found');
    }
    const seen = new Set<string> ();
    const out: RawEntry[] = [];
    for (const r of logs) {
        const path = (r.path ?? '').trim ();
        const info = (r.info ?? '').trim ();
        const date = (r.updateTime ?? '').trim ();
        const key = `${date}|${path}|${info}`;
        if ((!path && !info) || seen.has (key)) {
            continue;
        }
        seen.add (key);
        const kind = (r.type ?? 'Update').trim ();
        const model = (r.model ?? '').trim ();
        // guid without the text: an edited `info` is a revision; logs that share date + path + type +
        // model are told apart by their text in entries.ts (assignKeys)
        const guid = `${date}|${path}|${kind}|${model}`;
        const link = (r.link ?? '').trim ();
        out.push ({
            // general notices have no path: "Update: Market Data"
            title: path ? `${kind}: ${path}` + (model ? ` (${model})` : '') : `${kind}: ${model || 'General'}`,
            body: info,
            dateText: date,
            link: link.startsWith ('#/') ? BASE + link : undefined,
            guid,
        });
    }
    return out;
}
