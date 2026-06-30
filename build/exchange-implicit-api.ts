/* eslint-disable */
// Generate the per-exchange "Implicit API" reference from each exchange's `api`
// block in describe(). Every endpoint listed there becomes an implicit method
// (e.g. `publicGetExchangesPairTicker`) created by Exchange.defineRestApi(); this
// renders the full catalogue of those methods so callers can discover the raw
// exchange endpoints CCXT exposes beyond the unified API.
//
// Loads the COMPILED library from js/ccxt.js (so a `tsBuild` must precede it, same
// as jsdoc2md.js which reads js/src) and writes wiki/exchanges-implicit/<id>.md. It
// runs as the third stage of `build-docs`, alongside jsdoc2md/examples2md, so the
// output is committed with the rest of wiki/ by the build bot. build/wiki-to-fumadocs.ts
// then reads those committed files (no library load at convert time) and turns each
// into a /docs/exchanges/<id>/implicit-api page.
//
// Run:   npx tsx build/exchange-implicit-api.ts            # write all wiki pages
//        npx tsx build/exchange-implicit-api.ts --print binance   # print one (debug)

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = path.resolve (import.meta.dirname, '..');
const WIKI_IMPLICIT_DIR = path.join (ROOT, 'wiki', 'exchanges-implicit');

// Exchange.capitalize — first char upper, rest untouched (see ts/src/base/functions/string.ts).
function capitalize (s: string): string {
    return s.length ? (s.charAt (0).toUpperCase () + s.slice (1)) : s;
}

// Endpoints whose key is an HTTP verb. Mirrors the regex in Exchange.defineRestApi
// (note: 'options' is intentionally excluded — it clashes with the 'options' url path).
const HTTP_METHOD_RE = /^(?:get|post|put|delete|head|patch)$/i;

type Endpoint = { group: string; paths: string[]; method: string; path: string; cost: number | undefined };

// Walk the nested `api` dict exactly like Exchange.defineRestApi: the key directly
// above an endpoint is the HTTP verb, and `paths` is every key from the top group
// down to (not including) that verb. Leaves are arrays of paths or { path: cost } dicts.
function collectEndpoints (api: any): Endpoint[] {
    const out: Endpoint[] = [];
    function walk (node: any, paths: string[]) {
        if (!node || typeof node !== 'object') {
            return;
        }
        const keys = Object.keys (node);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = node[key];
            const group = paths.length ? paths[0] : key;
            if (Array.isArray (value)) {
                for (let k = 0; k < value.length; k++) {
                    out.push ({ 'group': group, 'paths': paths, 'method': key, 'path': String (value[k]).trim (), 'cost': undefined });
                }
            } else if (HTTP_METHOD_RE.test (key)) {
                const endpoints = Object.keys (value);
                for (let j = 0; j < endpoints.length; j++) {
                    const endpoint = endpoints[j];
                    const config = value[endpoint];
                    let cost: number | undefined = undefined;
                    if (typeof config === 'number') {
                        cost = config;
                    } else if (config && typeof config === 'object' && typeof config['cost'] === 'number') {
                        cost = config['cost'];
                    }
                    out.push ({ 'group': group, 'paths': paths, 'method': key, 'path': endpoint.trim (), 'cost': cost });
                }
            } else {
                walk (value, paths.concat ([ key ]));
            }
        }
    }
    walk (api, []);
    return out;
}

// Reproduce Exchange.defineRestApiEndpoint's camelCase + snake_case method names.
function methodNames (paths: string[], method: string, p: string): { camel: string; snake: string } {
    const splitPath = p.split (/[^a-zA-Z0-9]/);
    const camelcaseSuffix = splitPath.map (capitalize).join ('');
    const underscoreSuffix = splitPath.map ((x) => x.trim ().toLowerCase ()).filter ((x) => x.length > 0).join ('_');
    const camelcasePrefix = [ paths[0] ].concat (paths.slice (1).map (capitalize)).join ('');
    const underscorePrefix = [ paths[0] ].concat (paths.slice (1).map ((x) => x.trim ()).filter ((x) => x.length > 0)).join ('_');
    const lower = method.toLowerCase ();
    const camel = camelcasePrefix + capitalize (lower) + capitalize (camelcaseSuffix);
    const snake = underscorePrefix + '_' + lower + '_' + underscoreSuffix;
    return { 'camel': camel, 'snake': snake };
}

function mdEscape (s: string): string {
    // pipes would break the table; backslash-escape them (rare in url paths but possible).
    return s.replace (/\|/g, '\\|');
}

// The exchange's own API documentation links, from urls.doc (string | string[]),
// falling back to urls.www. Returns deduped markdown links labelled by hostname.
function docLinksFor (ex: any): string[] {
    const urls = (ex && ex.urls) || {};
    const doc = (urls['doc'] !== undefined && urls['doc'] !== null) ? urls['doc'] : urls['www'];
    if (!doc) {
        return [];
    }
    const arr = Array.isArray (doc) ? doc : [ doc ];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of arr) {
        if (typeof u !== 'string' || !u || seen.has (u)) {
            continue;
        }
        seen.add (u);
        let label = u;
        try {
            label = new URL (u).host.replace (/^www\./, '');
        } catch (e) {
            // non-URL string — keep as-is for the label
        }
        out.push (`[${label}](${u})`);
    }
    return out;
}

// Render one exchange's implicit-API page body (no frontmatter). Returns '' when the
// exchange declares no endpoints (alias / unusual exchange) so the caller can skip it.
export function renderImplicitApi (ex: any): string {
    const id = ex.id;
    const endpoints = collectEndpoints (ex.api || {});
    if (!endpoints.length) {
        return '';
    }
    const urlsApi = (ex.urls && ex.urls['api']) || {};
    // group -> endpoints, preserving first-seen order of groups
    const groupOrder: string[] = [];
    const byGroup: Record<string, Endpoint[]> = {};
    for (const e of endpoints) {
        if (!(e.group in byGroup)) {
            byGroup[e.group] = [];
            groupOrder.push (e.group);
        }
        byGroup[e.group].push (e);
    }
    const sample = endpoints[0];
    const sampleNames = methodNames (sample.paths, sample.method, sample.path);
    const samplePascal = capitalize (sampleNames.camel);
    const lines: string[] = [];
    // No top-level H1 here: the Fumadocs page title (frontmatter) renders as the H1,
    // and build/wiki-to-fumadocs.ts adds it. A second H1 would duplicate the heading.
    lines.push (`Every endpoint in \`${id}\`'s \`api\` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [unified API](/docs/exchanges/${id}) does not cover.`);
    lines.push ('');
    lines.push (`These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. \`${sampleNames.camel}\`); the snake_case alias (\`${sampleNames.snake}\`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (\`${samplePascal}\`). Switch tabs for the call in each language:`);
    lines.push ('');
    // docsify-style language tabs — build/wiki-to-fumadocs.ts turns these into Fumadocs
    // code tabs. Each language uses its own idiomatic instantiation + the method-name
    // casing it exposes (camelCase in JS/TS/C#, snake_case in Python/PHP, PascalCase in Go).
    const cap = capitalize (id);
    const tabs: Array<{ label: string; lang: string; code: string[] }> = [
        { 'label': 'JavaScript', 'lang': 'javascript', 'code': [ `const ${id} = new ccxt.${id} ();`, `const response = await ${id}.${sampleNames.camel} (params);` ] },
        { 'label': 'TypeScript', 'lang': 'typescript', 'code': [ `import ccxt from 'ccxt';`, `const ${id} = new ccxt.${id} ();`, `const response = await ${id}.${sampleNames.camel} (params);` ] },
        { 'label': 'Python', 'lang': 'python', 'code': [ `import ccxt`, `${id} = ccxt.${id}()`, `response = ${id}.${sampleNames.snake}(params)` ] },
        { 'label': 'PHP', 'lang': 'php', 'code': [ `$${id} = new \\ccxt\\${id}();`, `$response = $${id}->${sampleNames.snake}($params);` ] },
        { 'label': 'C#', 'lang': 'csharp', 'code': [ `using ccxt;`, `var ${id} = new ${cap}();`, `var response = await ${id}.${sampleNames.camel}(parameters);` ] },
        { 'label': 'Go', 'lang': 'go', 'code': [ `${id} := ccxt.New${cap}(nil)`, `response := <-${id}.${samplePascal}(params)` ] },
    ];
    lines.push ('<!-- tabs:start -->');
    lines.push ('');
    for (const t of tabs) {
        lines.push (`#### **${t.label}**`);
        lines.push ('');
        lines.push ('```' + t.lang);
        for (const c of t.code) {
            lines.push (c);
        }
        lines.push ('```');
        lines.push ('');
    }
    lines.push ('<!-- tabs:end -->');
    lines.push ('');
    lines.push (`Path parameters wrapped in \`{}\` (e.g. \`{pair}\`) are substituted from \`params\`; everything else in \`params\` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.`);
    lines.push ('');
    const docLinks = docLinksFor (ex);
    if (docLinks.length) {
        lines.push (`📚 **Official ${id} API documentation:** ${docLinks.join (' · ')}`);
        lines.push ('');
    }
    lines.push (`> ${endpoints.length} implicit endpoint${endpoints.length === 1 ? '' : 's'} across ${groupOrder.length} access group${groupOrder.length === 1 ? '' : 's'}.`);
    lines.push ('');
    for (const group of groupOrder) {
        lines.push (`## ${group}`);
        lines.push ('');
        const baseUrl = (typeof urlsApi === 'object' && typeof urlsApi[group] === 'string') ? urlsApi[group] : undefined;
        if (baseUrl) {
            lines.push (`**Base URL**: \`${baseUrl}\``);
            lines.push ('');
        }
        lines.push ('| Method | HTTP | Endpoint | Cost |');
        lines.push ('| --- | --- | --- | --- |');
        for (const e of byGroup[group]) {
            const names = methodNames (e.paths, e.method, e.path);
            const cost = (e.cost === undefined) ? '' : String (e.cost);
            lines.push (`| \`${names.camel}\` | ${e.method.toUpperCase ()} | \`${mdEscape (e.path)}\` | ${cost} |`);
        }
        lines.push ('');
    }
    return lines.join ('\n');
}

let _ccxtPromise: Promise<any> | undefined;
async function loadCcxt (): Promise<any> {
    if (_ccxtPromise === undefined) {
        const entry = pathToFileURL (path.join (ROOT, 'js', 'ccxt.js')).href;
        _ccxtPromise = import (entry).then ((m) => m.default || m);
    }
    return _ccxtPromise;
}

// Build the implicit-API page bodies for the given exchange ids (default: all).
// Returns id -> markdown body (skips ids that fail to instantiate or have no endpoints).
// Never throws for a single exchange — a bad exchange must not break the docs build.
export async function buildImplicitApiPages (ids?: string[]): Promise<Record<string, string>> {
    const ccxt = await loadCcxt ();
    const list = ids && ids.length ? ids : ccxt.exchanges;
    const out: Record<string, string> = {};
    for (const id of list) {
        try {
            if (!ccxt[id]) {
                continue;
            }
            const ex = new ccxt[id] ();
            const body = renderImplicitApi (ex);
            if (body) {
                out[id] = body;
            }
        } catch (e) {
            console.warn (`  ⚠ implicit-api: skipped ${id}: ${(e as Error).message}`);
        }
    }
    return out;
}

// Write wiki/exchanges-implicit/<id>.md for every exchange that declares endpoints.
// Wipes the dir first (like jsdoc2md.js wipes wiki/exchanges/) so a renamed/removed
// exchange never leaves a stale page behind.
export async function writeWikiImplicitPages (ids?: string[]): Promise<number> {
    const pages = await buildImplicitApiPages (ids);
    fs.mkdirSync (WIKI_IMPLICIT_DIR, { recursive: true });
    for (const f of fs.readdirSync (WIKI_IMPLICIT_DIR)) {
        if (f.endsWith ('.md')) {
            fs.unlinkSync (path.join (WIKI_IMPLICIT_DIR, f));
        }
    }
    const keys = Object.keys (pages);
    for (const id of keys) {
        fs.writeFileSync (path.join (WIKI_IMPLICIT_DIR, `${id}.md`), pages[id] + '\n');
    }
    return keys.length;
}

if (import.meta.url === pathToFileURL (process.argv[1] || '').href) {
    const args = process.argv.slice (2);
    if (args[0] === '--print') {
        const id = args[1];
        buildImplicitApiPages (id ? [ id ] : undefined).then ((p) => console.log (id ? (p[id] || `(no implicit api for ${id})`) : Object.keys (p).join ('\n')));
    } else {
        writeWikiImplicitPages (args.length ? args : undefined).then ((n) =>
            console.log (`📰 wrote ${n} implicit-api pages to wiki/exchanges-implicit/`));
    }
}
