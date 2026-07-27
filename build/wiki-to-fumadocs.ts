/* eslint-disable */
// Convert the Docsify `wiki/` markdown into Fumadocs `website/content/docs/`.
//
// READS  wiki/*.md (guides, 106 exchanges/, 557 examples/) — never mutates wiki/.
// WRITES website/content/docs/**.md + meta.json (wiped & regenerated each run).
//
// The wiki/ tree is itself generated (jsdoc2md.js / examples2md.js) and is the single
// source of truth shared with the still-live Docsify site + the ccxt.wiki mirror.
// This stage only changes how that markdown is rendered/served by Fumadocs.
//
// Run: npx tsx build/wiki-to-fumadocs.ts

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const WIKI = path.join(ROOT, 'wiki');
const OUT = path.join(ROOT, 'website', 'content', 'docs');

// ---------------------------------------------------------------------------
// Route + title maps for the hand-written guides. Source file -> [route, title].
// Anything not listed and not under exchanges/ or examples/ is skipped.
// ---------------------------------------------------------------------------
const GUIDES: Record<string, { route: string; title: string }> = {
    'README.md':                       { route: 'index',                       title: 'CCXT Documentation' },
    'Manual.md':                       { route: 'manual',                      title: 'Manual' },
    'ccxt.pro.manual.md':              { route: 'pro-manual',                  title: 'CCXT Pro Manual' },
    'ccxt.pro.md':                     { route: 'pro',                         title: 'CCXT Pro' },
    'Install.md':                      { route: 'install',                     title: 'Install' },
    'CLI.md':                          { route: 'cli',                         title: 'CLI' },
    'Examples.md':                     { route: 'examples-overview',           title: 'Examples Overview' },
    'FAQ.md':                          { route: 'faq',                         title: 'FAQ' },
    'Requirements.md':                 { route: 'requirements',                title: 'Requirements' },
    'Awesome.md':                      { route: 'examples/awesome',            title: 'Awesome CCXT' },
    'AI-Skills.md':                    { route: 'ai-skills',                   title: 'AI Skills' },
    'Stats.md':                        { route: 'stats',                       title: 'Statistics' },
    'Certification.md':                { route: 'certification',               title: 'Certification' },
    'baseSpec.md':                     { route: 'base-spec',                   title: 'API Spec by Method' },
    'Exchange-Markets.md':             { route: 'exchange-markets',            title: 'Supported Exchanges' },
    'Exchange-Markets-By-Country.md':  { route: 'exchange-markets-by-country', title: 'Exchanges by Country' },
    'CHANGELOG.md':                    { route: 'changelog',                   title: 'Changelog' },
    'CONTRIBUTING.md':                 { route: 'contributing',                title: 'Contributing' },
};

// Map a docsify "page" token (as it appears in docs.ccxt.com/<page>?id=) to a route.
const PAGE_TO_ROUTE: Record<string, string> = {};
for (const [file, { route }] of Object.entries(GUIDES)) {
    PAGE_TO_ROUTE[file.replace(/\.md$/, '')] = route;       // Manual, ccxt.pro.manual, FAQ, ...
    PAGE_TO_ROUTE[file.replace(/\.md$/, '').toLowerCase()] = route;
}
PAGE_TO_ROUTE['index'] = 'index';
PAGE_TO_ROUTE[''] = 'manual';                                // docs.ccxt.com/?id=X  -> root == Manual
// the prediction guide is the index of the top-level Prediction Markets tab (/docs/prediction),
// not a standalone guide page — so links to Prediction-Markets.md resolve there
PAGE_TO_ROUTE['Prediction-Markets'] = 'prediction';
PAGE_TO_ROUTE['prediction-markets'] = 'prediction';
PAGE_TO_ROUTE['Exchanges'] = 'exchange-markets';             // GitHub-wiki "Exchanges" page

// Page names as they appear in bare relative links / GitHub-wiki URLs (longest first).
const PAGE_NAMES = Object.keys(GUIDES)
    .map ((f) => f.replace (/\.md$/, ''))
    .concat ([ 'Exchanges' ])
    .sort ((a, b) => b.length - a.length)
    .map ((n) => n.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'));
const BARE_PAGE_RE = new RegExp (`\\]\\((?:\\.\\/)?(${PAGE_NAMES.join ('|')})(#[\\w-]+)?\\)`, 'g');

// Pretty tab titles for docsify language tabs.
function tabLabel (s: string): string {
    const map: Record<string, string> = {
        javascript: 'JavaScript', typescript: 'TypeScript', php: 'PHP', python: 'Python',
        java: 'Java', go: 'Go', 'c#': 'C#', csharp: 'C#', rust: 'Rust',
    };
    const t = s.trim ();
    return map[t.toLowerCase ()] ?? t;
}

// ---------------------------------------------------------------------------
// Slug helper (docsify-compatible) — used to build the anchor->page index so a
// bare `?id=anchor` resolves to whichever guide actually owns that heading.
// ---------------------------------------------------------------------------
function docsifySlug (text: string): string {
    return text
        .toLowerCase()
        .replace(/<[^>]+>/g, '')                              // strip inline HTML
        .replace(/[^\w一-龥぀-ヿ\- ]/g, '')   // keep word chars, CJK, hyphen, space
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function headingSlugs (md: string): Set<string> {
    const out = new Set<string>();
    for (const line of md.split('\n')) {
        const m = line.match(/^#{1,6}\s+(.*)$/);
        if (m) out.add(docsifySlug(stripInline(m[1])));
    }
    return out;
}

// Build anchor index from Manual + pro-manual (the two pages that own structure anchors).
let MANUAL_ANCHORS = new Set<string>();
let PRO_ANCHORS = new Set<string>();
// prediction structure anchors (PredictionEvent, …) live in the prediction guide, not the Manual
let PREDICTION_ANCHORS = new Set<string>();

// The English exchanges table is generated from ts/src (by export-exchanges, between these
// markers). Translations carry a frozen copy that drifts — stale referrals, removed
// exchanges, bad domains (e.g. the malware-flagged htx.com.vc). We capture the current
// English table while building the English guides and re-inject it into every translated
// manual/pro-manual at build time, so all locales always show the live table.
const EXCHANGE_TABLE_RE = /<!--- init list -->[\s\S]*?<!--- end list -->/;
let EN_MANUAL_TABLE = '';
let EN_PRO_TABLE = '';

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------
function stripInline (s: string): string {
    return s
        .replace(/\{docsify-ignore(?:-all)?\}/g, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')                 // images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')              // links -> text
        .replace(/[`*_]/g, '')
        .trim();
}

function yamlTitle (s: string): string {
    const clean = stripInline(s).replace(/\s+/g, ' ').trim() || 'CCXT';
    return '"' + clean.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

// Resolve a bare `?id=anchor` to /docs/<page>#anchor based on which guide owns it.
function resolveAnchorPage (anchor: string): string {
    const slug = anchor.toLowerCase();
    if (MANUAL_ANCHORS.has(slug)) return 'manual';
    if (PRO_ANCHORS.has(slug)) return 'pro-manual';
    // prediction structures (prediction-event-structure, …) are documented in the prediction guide
    if (PREDICTION_ANCHORS.has(slug) || slug.startsWith('prediction-')) return 'prediction';
    return 'manual';                                          // default: structure anchors live in Manual
}

// ---------------------------------------------------------------------------
// Link rewriting. Operates on the whole document. Order matters (specific first).
// ---------------------------------------------------------------------------
function rewriteLinks (md: string): string {
    let s = md;

    // readthedocs-style legacy URLs: docs.ccxt.com/en/latest/<page>.html(#a | ?id=a)
    s = s.replace(/https?:\/\/docs\.ccxt\.com\/en\/latest\/([\w.\-]+?)\.html(?:[#?](?:id=)?([\w-]+))?/g,
        (_m, page, anchor) => {
            const route = PAGE_TO_ROUTE[page] ?? PAGE_TO_ROUTE[page.toLowerCase()] ?? 'manual';
            return `/docs/${route}${anchor ? '#' + anchor : ''}`;
        });

    // GitHub-wiki links point at the parallel wiki mirror — pull them back into /docs.
    s = s.replace(/https?:\/\/github\.com\/ccxt\/ccxt\/wiki\/?([\w.\-]+)?(#[\w-]+)?/g,
        (_m, page, frag) => {
            if (!page) return '/docs';
            const route = PAGE_TO_ROUTE[page] ?? PAGE_TO_ROUTE[page.toLowerCase()] ?? 'manual';
            return `/docs/${route}${frag ?? ''}`;
        });

    // pro-manual page (with or without ?id=)
    s = s.replace(/https?:\/\/docs\.ccxt\.com\/ccxt\.pro\.manual(?:\.html)?(?:\?id=([\w-]+))?/g,
        (_m, anchor) => `/docs/pro-manual${anchor ? '#' + anchor : ''}`);

    // root query anchor: docs.ccxt.com/?id=X  or  docs.ccxt.com/#/?id=X
    s = s.replace(/https?:\/\/docs\.ccxt\.com\/(?:#\/)?\?id=([\w-]+)/g,
        (_m, anchor) => `/docs/${resolveAnchorPage(anchor)}#${anchor}`);

    // per-page query anchor: docs.ccxt.com/<page>?id=X
    s = s.replace(/https?:\/\/docs\.ccxt\.com\/([\w.\-]+?)(?:\.html)?\?id=([\w-]+)/g,
        (_m, page, anchor) => {
            const route = PAGE_TO_ROUTE[page] ?? PAGE_TO_ROUTE[page.toLowerCase()] ?? page;
            return `/docs/${route}#${anchor}`;
        });

    // bare page: docs.ccxt.com/<page>
    s = s.replace(/https?:\/\/docs\.ccxt\.com\/([\w.\-]+)\/?(?=[)\s"'#]|$)/g,
        (_m, page) => {
            const route = PAGE_TO_ROUTE[page] ?? PAGE_TO_ROUTE[page.toLowerCase()];
            return route ? `/docs/${route}` : `/docs/manual`;
        });
    // docs.ccxt.com root
    s = s.replace(/https?:\/\/docs\.ccxt\.com\/?(?=[)\s"'#]|$)/g, '/docs/manual');

    // unlink references to removed exchanges (their pages are no longer emitted)
    // -> keep just the link text, so stale baseSpec/markets entries don't 404
    const live = liveExchangeIds();
    if (live) {
        s = s.replace(/\[([^\]]+)\]\((?:\.\/)?\/?exchanges\/([\w]+)\.md(?:#[\w-]+)?\)/g,
            (m, text, ex) => (live.has(ex) ? m : text));
    }

    // generator gap: methods with no exchange context emit /exchanges/<anonymous>.md — unlink.
    s = s.replace(/\[([^\]]+)\]\(\/?(?:docs\/)?exchanges\/(?:&lt;anonymous&gt;|<anonymous>)\.md(?:#[\w-]+)?\)/g, '$1');

    // absolute exchange links: /exchanges/<ex>.md(#m)
    s = s.replace(/\/exchanges\/([\w]+)\.md(#[\w-]+)?/g,
        (_m, ex, frag) => `/docs/exchanges/${ex}${frag ?? ''}`);

    // relative exchange links: exchanges/<ex>.md(#m)  and  ./exchanges/...
    s = s.replace(/\]\((?:\.\/)?exchanges\/([\w]+)\.md(#[\w-]+)?\)/g,
        (_m, ex, frag) => `](/docs/exchanges/${ex}${frag ?? ''})`);

    // example links: ./examples/<lang>/<file>.md -> /docs/examples/<lang>/<file>
    s = s.replace(/\]\((?:\.\/)?examples\/(js|py|ts|php|cs|go|java)\/([\w.\-]+)\.md\)/g, '](/docs/examples/$1/$2)');
    // example dir links: ./examples/<lang>/ -> /docs/examples/<lang>
    s = s.replace(/\]\((?:\.\/)?examples\/(js|py|ts|php|cs|go|java)\/?\)/g, '](/docs/examples/$1)');
    // absolute example links missing the /docs prefix: /examples/<lang>(/file) -> /docs/examples/...
    s = s.replace(/\]\(\/examples\/(js|py|ts|php|cs|go|java)((?:\/[^)]*)?)\)/g, '](/docs/examples/$1$2)');

    // relative guide query-anchor: ](Examples?id=js) / ](Manual?id=x) etc.
    s = s.replace(/\]\((?:\.\/)?([\w.\-]+)\?id=([\w-]+)\)/g, (_m, page, anchor) => {
        const route = PAGE_TO_ROUTE[page] ?? PAGE_TO_ROUTE[page.toLowerCase()];
        return route ? `](/docs/${route}#${anchor})` : `](#${anchor})`;
    });

    // relative guide md links: ](File.md#a) / ](./File.md) / ](File.md)
    s = s.replace(/\]\((?:\.\/)?([\w.\-]+)\.md(#[\w-]+)?\)/g, (_m, name, frag) => {
        const route = PAGE_TO_ROUTE[name] ?? PAGE_TO_ROUTE[name.toLowerCase()] ?? GUIDES[name + '.md']?.route;
        return route ? `](/docs/${route}${frag ?? ''})` : `](/docs/${name.toLowerCase()}${frag ?? ''})`;
    });

    // bare relative page-name links (no .md / no ?id=): ](Manual#x) ](ccxt.pro.manual#watchTicker)
    s = s.replace(BARE_PAGE_RE, (_m, name, frag) => {
        const route = PAGE_TO_ROUTE[name] ?? PAGE_TO_ROUTE[name.toLowerCase()];
        return route ? `](/docs/${route}${frag ?? ''})` : _m;
    });

    // drop links whose URL is literally "undefined" (generator gaps, e.g. an exchange
    // with no website) — keep the link text / image, render `<a href="undefined">` is invalid.
    s = s.replace(/\[(!\[[^\]]*\]\([^)]*\)|[^\][]*)\]\(undefined\)/g, '$1');

    // lowercase fragments of internal links only (github-slugger lowercases all heading
    // ids, so camelCase anchors like #watchOrderBook must become #watchorderbook). Never
    // touch the path (example routes keep their case) or external URLs.
    s = s.replace(/\]\((#[^)\s]+|\/[^)\s#]*#[^)\s]+)\)/g, (_m, target) => {
        const i = target.indexOf('#');
        return `](${target.slice(0, i)}#${target.slice(i + 1).toLowerCase()})`;
    });

    return s;
}

// ---------------------------------------------------------------------------
// Per-file content transform (docsify-isms -> Fumadocs-friendly markdown).
// ---------------------------------------------------------------------------
function transform (md: string): string {
    let s = md.replace(/\r\n/g, '\n');

    // strip <style> hacks (active under rehypeRaw, ugly without)
    s = s.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // docsify tabs -> Fumadocs tabbed code blocks: pair each `#### **Lang**` with the
    // code fence that follows it and move the label into a `tab="Lang"` meta, so
    // consecutive fences render as language tabs (fumadocs remarkCodeTab).
    s = s.replace(/<!--\s*tabs:start\s*-->([\s\S]*?)<!--\s*tabs:end\s*-->/g, (_m, inner) =>
        inner.replace(
            /^[ \t]*####\s+\*\*(.+?)\*\*[ \t]*\n+([ \t]*```+)([A-Za-z][\w#+.-]*)?([^\n]*)\n/gm,
            (_mm: string, label: string, fence: string, lang: string, rest: string) =>
                `${fence}${lang || 'text'}${rest} tab="${tabLabel(label)}"\n`
        )
    );
    // any stray docsify tab comments / labels left unpaired
    s = s.replace(/<!--\s*tabs?:(?:start|end)\s*-->\n?/g, '');
    s = s.replace(/<!--\s*tab:[^>]*-->\n?/g, '');

    // strip {docsify-ignore} from headings (cosmetic + slug hygiene)
    s = s.replace(/^(#{1,6}\s+.*?)\s*\{docsify-ignore(?:-all)?\}\s*$/gm, '$1');
    // any remaining {docsify-ignore} anywhere
    s = s.replace(/\s*\{docsify-ignore(?:-all)?\}/g, '');

    // strip docsify back-arrow heading lines: `# [<-](...)`
    s = s.replace(/^#{0,6}\s*\[<-\]\([^)]*\)\s*$/gm, '');

    // strip empty docsify anchors `<a name="X" id="x"></a>`. Fumadocs already gives the
    // following heading that id, so these only create DUPLICATE ids — which break
    // `#fragment` scrolling (the browser jumps to the empty, scroll-margin-less anchor
    // instead of the heading). e.g. clicking cancelAllOrders on an exchange page.
    s = s.replace(/<a name="[^"]*"[^>]*><\/a>/g, '');

    // normalise code-fence languages: lowercase + alias fixes; drop anything Shiki
    // doesn't know (capitalised labels, typos, stray words) to a plain fence.
    s = s.replace(/^(\s*```+)([A-Za-z][\w#+.-]*)([^\n]*)$/gm, (_m, fence, lang, rest) => {
        let l = (LANG_ALIAS[lang.toLowerCase()] ?? lang.toLowerCase());
        return LANG_OK.has(l) ? `${fence}${l}${rest}` : `${fence}${rest}`;
    });

    s = rewriteLinks(s);

    return s.replace(/\n{4,}/g, '\n\n\n').trimStart();
}

function frontmatter (title: string, description?: string): string {
    let fm = `---\ntitle: ${yamlTitle(title)}\n`;
    if (description) fm += `description: ${yamlTitle(description)}\n`;
    return fm + '---\n\n';
}

function titleCase (slug: string): string {
    return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// First real prose line of a page → frontmatter description (SEO + search snippets).
function firstParagraph (md: string): string {
    let inFence = false;
    for (const raw of md.split('\n')) {
        const line = raw.trim();
        if (line.startsWith('```')) { inFence = !inFence; continue; }
        if (inFence || !line) continue;
        if (/^(#|<|!\[|\||\* \[|- \[|- <|\*\*(Kind|Extends|Returns|Param))/.test(line)) continue;
        if (/^[-=*_]{3,}$/.test(line)) continue;
        const text = stripInline(line);
        if (text.length >= 12) return text.length > 160 ? text.slice(0, 157).replace(/\s+\S*$/, '') + '…' : text;
    }
    return '';
}

const ROUTE_DESC: Record<string, string> = {
    'index': 'CCXT — a unified API for 100+ cryptocurrency and prediction-market exchanges in JavaScript, Python, PHP, C#, Go and Java.',
    'base-spec': 'CCXT unified API specification — every method and the exchanges that implement it.',
    'prediction-markets': 'Trade prediction markets (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid) with the CCXT unified API.',
    'exchange-markets': 'All cryptocurrency and prediction-market exchanges supported by CCXT.',
    'exchange-markets-by-country': 'CCXT-supported cryptocurrency and prediction-market exchanges grouped by country.',
};

// Code-fence languages Shiki recognises (lowercased). Anything else -> plain fence.
const LANG_OK = new Set([
    'javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx', 'python', 'py', 'php',
    'java', 'csharp', 'cs', 'c#', 'go', 'golang', 'bash', 'sh', 'shell', 'zsh',
    'text', 'plaintext', 'txt', 'diff', 'json', 'jsonc', 'yaml', 'yml', 'html',
    'xml', 'css', 'scss', 'sql', 'markdown', 'md', 'ini', 'toml', 'c', 'cpp',
    'rust', 'rs', 'ruby', 'rb', 'graphql', 'dockerfile', 'http',
    // not a Shiki language: the prediction overview swaps its ```mermaid fence (GitHub
    // renders that natively) for ```prediction-diagram, which source.config.ts turns into
    // the <PredictionDataModel/> animated component — keep the tag through transform
    'prediction-diagram',
]);
const LANG_ALIAS: Record<string, string> = {
    javacript: 'javascript', node: 'javascript', nodejs: 'javascript',
    python3: 'python', shell: 'bash', console: 'bash',
};

// ---------------------------------------------------------------------------
// Supported-Exchanges table -> structured rows for the <ExchangesTable/> component.
// Parses the two markdown tables (crypto + prediction) emitted by export-exchanges.js.
// ---------------------------------------------------------------------------
type ExchangeRow = {
    id: string; name: string; site: string; logo: string;
    version: string; doclink: string; type: 'CEX' | 'DEX' | 'Prediction';
    certified: boolean; pro: boolean; docs: string;
};
function parseExchangeMarkets (raw: string): ExchangeRow[] {
    const region = (start: string, end: string): string => {
        const a = raw.indexOf(start);
        const b = raw.indexOf(end, a + 1);
        return (a === -1) ? '' : raw.slice(a, b === -1 ? undefined : b);
    };
    const dataRows = (block: string): string[][] =>
        block.split('\n')
            .filter ((l) => l.trim().startsWith('|') && !/^\|[\s:|-]+\|?$/.test(l.trim()))   // drop separator rows
            .map ((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
            .filter ((cells) => cells.length >= 4 && cells[0].toLowerCase() !== 'logo');       // drop header row
    const firstImg = (cell: string): string => (cell.match(/!\[[^\]]*\]\(([^)\s]+)/) ?? [])[1] ?? '';
    const wrapLink = (cell: string): string => (cell.match(/^\s*\[!\[[^\]]*\]\([^)]+\)\]\(([^)\s]+)\)/) ?? [])[1] ?? '';
    const named = (cell: string): { name: string; url: string } => {
        const m = cell.match(/\[([^\]]+)\]\(([^)\s]+)\)/);
        return m ? { name: m[1], url: m[2] } : { name: cell.replace(/[[\]]/g, ''), url: '' };
    };
    const parseBlock = (block: string, kind: 'crypto' | 'prediction'): ExchangeRow[] =>
        dataRows(block).map ((cells) => {
            const logo = firstImg(cells[0]);
            const site = wrapLink(cells[0]) || named(cells[2]).url;
            const id = cells[1];
            const name = named(cells[2]).name || id;
            const verCell = cells[3] ?? '';
            const version = (verCell.match(/API Version ([^\]]+)\]/) ?? [])[1] ?? '*';
            const lastUrl = (verCell.match(/\]\(([^)\s]+)\)\s*$/) ?? [])[1] ?? '';
            const doclink = lastUrl.indexOf('shields.io') === -1 ? lastUrl : '';
            const typeCell = cells[4] ?? '';
            const type: ExchangeRow['type'] = (kind === 'prediction')
                ? 'Prediction'
                : (/badge\/DEX|\bDEX\b/.test(typeCell) ? 'DEX' : 'CEX');
            const certified = (kind !== 'prediction') && /Certified/.test(cells[5] ?? '');
            const pro = (kind !== 'prediction') && /CCXT[ -]Pro/.test(cells[6] ?? '');
            const docs = (kind === 'prediction') ? `/docs/prediction/${id}` : `/docs/exchanges/${id}`;
            return { id, name, site, logo, version, doclink, type, certified, pro, docs };
        });
    const crypto = parseBlock(region('<!--- init list -->', '<!--- end list -->'), 'crypto');
    const prediction = parseBlock(region('<!--- init prediction list -->', '<!--- end prediction list -->'), 'prediction');
    return crypto.concat(prediction);
}

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------
function rmrf (dir: string) { fs.rmSync(dir, { recursive: true, force: true }); }
function ensure (dir: string) { fs.mkdirSync(dir, { recursive: true }); }
function write (file: string, content: string) {
    ensure(path.dirname(file));
    fs.writeFileSync(file, content);
}
function readWiki (rel: string): string {                    // readFileSync follows symlinks
    return fs.readFileSync(path.join(WIKI, rel), 'utf8');
}

// ---------------------------------------------------------------------------
// Build the exchange order from _sidebar.md (falls back to sorted dir listing).
// ---------------------------------------------------------------------------
// Valid exchange ids = those with a real source file (ts/src/<id>.ts). jsdoc2md
// never deletes pages for removed exchanges and misnames pages for
// inheritance-only exchanges, so wiki/exchanges/ accumulates orphan pages
// (probit, oxfun, …) and stray method-name pages (fetchBidsAsks, …). We use this
// to drop those pages and unlink dangling references. Returns null (→ no
// filtering) if ts/src is unavailable, so the build never empties on a bad cwd.
let _liveIds: Set<string> | null | undefined;
function liveExchangeIds (): Set<string> | null {
    if (_liveIds === undefined) {
        try {
            _liveIds = new Set(fs.readdirSync(path.join(ROOT, 'ts', 'src'))
                .filter((f) => f.endsWith('.ts'))
                .map((f) => f.replace(/\.ts$/, '')));
        } catch { _liveIds = null; }
    }
    return _liveIds ?? null;
}

function exchangeOrder (): string[] {
    const liveIds = liveExchangeIds();
    const isLive = (ex: string) => !liveIds || liveIds.has(ex);
    const order: string[] = [];
    try {
        const sb = readWiki('_sidebar.md');
        const re = /\]\(exchanges\/([\w]+)\.md\)/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(sb))) order.push(m[1]);
    } catch {}
    const onDisk = fs.readdirSync(path.join(WIKI, 'exchanges'))
        .filter((f) => f.endsWith('.md'))
        // skip stray 0-byte files (e.g. fetchCurrencies.md) — they aren't real exchanges
        .filter((f) => fs.statSync(path.join(WIKI, 'exchanges', f)).size > 0)
        .map((f) => f.replace(/\.md$/, ''))
        // drop orphan / misnamed pages with no live source file
        .filter(isLive);
    for (const ex of onDisk) if (!order.includes(ex)) order.push(ex);
    return order.filter((ex) => onDisk.includes(ex));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main () {
    if (!fs.existsSync(WIKI)) throw new Error(`wiki/ not found at ${WIKI}`);
    console.log('🧹 wiping', path.relative(ROOT, OUT));
    rmrf(OUT);
    ensure(OUT);

    // anchor index for ?id= resolution
    try { MANUAL_ANCHORS = headingSlugs(readWiki('Manual.md')); } catch {}
    try { PRO_ANCHORS = headingSlugs(readWiki('ccxt.pro.manual.md')); } catch {}
    try { PREDICTION_ANCHORS = headingSlugs(readWiki('Prediction-Markets.md')); } catch {}

    let count = 0;

    // 1) guides
    for (const [file, { route, title }] of Object.entries(GUIDES)) {
        const src = path.join(WIKI, file);
        if (!fs.existsSync(src)) { console.warn('  ⚠ missing guide', file); continue; }
        // Supported Exchanges: parse the static markdown tables (crypto + prediction) into
        // one dataset and render them via the sortable/filterable <ExchangesTable/> component
        if (route === 'exchange-markets') {
            const rows = parseExchangeMarkets(readWiki(file));
            const cex = rows.filter((r) => r.type === 'CEX').length;
            const dex = rows.filter((r) => r.type === 'DEX').length;
            const pred = rows.filter((r) => r.type === 'Prediction').length;
            // Fail loudly instead of shipping an empty/partial table: parseExchangeMarkets is
            // coupled to export-exchanges.js's markdown (column order + the <!--- init list -->
            // / <!--- init prediction list --> markers). If that format changes — or this runs
            // before export-exchanges.js populated the file — the parse silently yields 0 rows.
            if (cex + dex === 0 || pred === 0) {
                throw new Error(`parseExchangeMarkets parsed ${cex + dex} crypto and ${pred} prediction rows from wiki/${file} — the <ExchangesTable/> would be empty. The table format or its <!--- init list -->/<!--- init prediction list --> markers likely changed; run export-exchanges.js, then update parseExchangeMarkets() in build/wiki-to-fumadocs.ts.`);
            }
            const intro = `CCXT supports **${cex + dex} cryptocurrency** exchanges and **${pred} prediction-market** exchanges. Search, filter by type, and sort any column.`;
            const desc = ROUTE_DESC[route] || intro;
            write(path.join(OUT, `${route}.md`),
                frontmatter(title, desc) + `# ${title}\n\n${intro}\n\n\`\`\`exchanges-table\n${JSON.stringify(rows)}\n\`\`\`\n`);
            count++;
            continue;
        }
        const body = transform(readWiki(file));
        if (route === 'manual') EN_MANUAL_TABLE = (body.match(EXCHANGE_TABLE_RE) ?? [''])[0];
        else if (route === 'pro-manual') EN_PRO_TABLE = (body.match(EXCHANGE_TABLE_RE) ?? [''])[0];
        const desc = ROUTE_DESC[route] || firstParagraph(body);
        write(path.join(OUT, `${route}.md`), frontmatter(title, desc) + body);
        count++;
    }

    // 2) exchanges. Each exchange is a folder: index.md (the unified-API method
    // reference, from jsdoc2md) + implicit-api.md (the raw `api`-block endpoints,
    // generated here from the live library). The folder index keeps the
    // /docs/exchanges/<id> URL unchanged; the sub-page lives at /<id>/implicit-api.
    const exOrder = exchangeOrder();
    ensure(path.join(OUT, 'exchanges'));
    // implicit-api bodies: committed markdown written by build-docs (build/exchange-implicit-api.ts)
    // to wiki/exchanges-implicit/<id>.md. Absent only if that build-docs stage hasn't run yet —
    // then we simply emit the main exchange page without the sub-page.
    const IMPLICIT_DIR = path.join(WIKI, 'exchanges-implicit');
    const implicitAvailable = fs.existsSync(IMPLICIT_DIR)
        ? new Set(fs.readdirSync(IMPLICIT_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')))
        : new Set<string>();
    if (implicitAvailable.size) console.log(`  🔌 implicit-api: ${implicitAvailable.size} exchanges`);
    for (const ex of exOrder) {
        const md = readWiki(path.join('exchanges', `${ex}.md`));
        const h = md.match(/^#{1,6}\s+(.*)$/m);
        const title = h ? stripInline(h[1]) || ex : ex;
        const desc = `${title} cryptocurrency exchange — CCXT unified API: methods, parameters and endpoints.`;
        const hasImplicit = implicitAvailable.has(ex);
        // surface the implicit-API sub-page from the top of the main exchange page.
        const banner = hasImplicit
            ? `> 🔌 Looking for raw exchange endpoints? See the [${ex} implicit API](/docs/exchanges/${ex}/implicit-api) — every endpoint in this exchange's API exposed as an implicit method.\n\n`
            : '';
        write(path.join(OUT, 'exchanges', ex, 'index.md'), frontmatter(title, desc) + banner + transform(md));
        const subPages = ['index'];
        if (hasImplicit) {
            const idesc = `Every raw ${title} endpoint exposed as a CCXT implicit method — names, HTTP verbs, paths and rate-limit costs.`;
            write(path.join(OUT, 'exchanges', ex, 'implicit-api.md'),
                frontmatter(`${title} implicit API`, idesc) + transform(readWiki(path.join('exchanges-implicit', `${ex}.md`))));
            subPages.push('implicit-api');
            count++;
        }
        // per-folder meta: keep the exchange's display title as the sidebar label and
        // order index before the implicit-api sub-page.
        write(path.join(OUT, 'exchanges', ex, 'meta.json'),
            JSON.stringify({ title, pages: subPages }, null, 2));
        count++;
    }
    // root:true -> renders as a sidebar tab (keeps /docs/exchanges/* URLs unchanged)
    write(path.join(OUT, 'exchanges', 'meta.json'),
        JSON.stringify({ title: 'Exchanges', icon: 'ArrowLeftRight', description: 'Per-exchange API support', root: true, pages: exOrder }, null, 2));

    // 2b) prediction-market exchanges (ts/src/prediction) — promoted to their OWN
    // top-level "Prediction Markets" tab, separate from the crypto Exchanges tab
    const predDir = path.join(WIKI, 'exchanges', 'prediction');
    let predOrder: string[] = [];
    if (fs.existsSync(predDir)) {
        predOrder = fs.readdirSync(predDir)
            .filter((f) => f.endsWith('.md') && fs.statSync(path.join(predDir, f)).size > 0)
            .map((f) => f.replace(/\.md$/, ''))
            .sort();
    }
    if (predOrder.length) {
        ensure(path.join(OUT, 'prediction'));
        // per-exchange title from each reference page's H1 (e.g. "polymarket" -> "Polymarket")
        const predTitle: Record<string, string> = {};
        const predMd: Record<string, string> = {};
        for (const ex of predOrder) {
            const md = readWiki(path.join('exchanges', 'prediction', `${ex}.md`));
            predMd[ex] = md;
            const h = md.match(/^#{1,6}\s+(.*)$/m);
            predTitle[ex] = h ? stripInline(h[1]) || ex : ex;
        }
        // the Prediction Markets guide (moved out of Manual.md) is this tab's index page,
        // so /docs/prediction is the overview (data model + diagram) rather than a 404.
        // Append a clickable list of the per-exchange API pages so they're discoverable
        // from the overview body, not only the sidebar.
        let predPages = predOrder;
        if (fs.existsSync(path.join(WIKI, 'Prediction-Markets.md'))) {
            const desc = ROUTE_DESC['prediction-markets'] ?? 'Prediction-market exchanges with the CCXT unified API.';
            const links = predOrder.map((ex) => `- [${predTitle[ex]}](/docs/prediction/${ex}) — unified API methods, parameters and endpoints`).join('\n');
            const exchangesSection = `\n\n## Supported prediction exchanges\n\n${links}\n`;
            // the wiki keeps a ```mermaid fence (GitHub renders it); on the website swap it
            // for the bespoke animated <PredictionDataModel/> via the prediction-diagram fence
            const guideMd = readWiki('Prediction-Markets.md').replace(/```mermaid[\s\S]*?```/, '```prediction-diagram\n```');
            write(path.join(OUT, 'prediction', 'index.md'),
                frontmatter('Prediction Markets', desc) + transform(guideMd) + exchangesSection);
            count++;
            predPages = ['index', ...predOrder];
        }
        for (const ex of predOrder) {
            const title = predTitle[ex];
            const desc = `${title} prediction-market exchange — CCXT unified API: methods, parameters and endpoints.`;
            write(path.join(OUT, 'prediction', `${ex}.md`), frontmatter(title, desc) + transform(predMd[ex]));
            count++;
        }
        // root:true -> its own sidebar tab; index.md (the guide) is the overview landing
        write(path.join(OUT, 'prediction', 'meta.json'),
            JSON.stringify({ title: 'Prediction Markets', icon: 'TrendingUp', description: 'Prediction-market exchanges (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid)', root: true, pages: predPages }, null, 2));
    }

    // 3) examples (js, py, ts, php)
    const LANGS: Record<string, string> = { js: 'JavaScript', py: 'Python', ts: 'TypeScript', php: 'PHP', cs: 'C#', go: 'Go', java: 'Java' };
    const exampleLangs: string[] = [];
    for (const lang of Object.keys(LANGS)) {
        const dir = path.join(WIKI, 'examples', lang);
        if (!fs.existsSync(dir)) continue;
        exampleLangs.push(lang);
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
        const pages: string[] = [];
        for (const f of files) {
            const base = f.replace(/\.md$/, '');
            const md = transform(readWiki(path.join('examples', lang, f)));
            if (base === 'README') {
                write(path.join(OUT, 'examples', lang, 'index.md'),
                    frontmatter(`${LANGS[lang]} Examples`, `Runnable CCXT ${LANGS[lang]} code examples.`) + md);
            } else {
                const t = titleCase(base);
                write(path.join(OUT, 'examples', lang, `${base}.md`),
                    frontmatter(t, `${t} — CCXT ${LANGS[lang]} code example.`) + md);
                pages.push(base);
            }
        }
        write(path.join(OUT, 'examples', lang, 'meta.json'),
            JSON.stringify({ title: `${LANGS[lang]} Examples`, pages: ['index', ...pages] }, null, 2));
        count += files.length;
    }
    // examples/README.md (repo root) — the curated CCXT citations (papers/theses) and
    // "See Also" (tutorials, articles, projects). Auto-sync that section into the docs so
    // it stays current with the README. The Examples index at the top of the README is
    // dropped (the per-language chooser below already covers it).
    let citationsPage = false;
    const examplesReadme = path.join(ROOT, 'examples', 'README.md');
    if (fs.existsSync(examplesReadme)) {
        const raw = fs.readFileSync(examplesReadme, 'utf8');
        const i = raw.search(/^##\s+CCXT Citations/im);
        write(path.join(OUT, 'examples', 'citations.md'),
            frontmatter('Citations & Articles', 'Academic papers, theses, tutorials, articles and projects that cite or build on CCXT.') +
            transform(i >= 0 ? raw.slice(i) : raw));
        citationsPage = true;
    }
    // examples landing page: a language chooser (the Examples nav link points here)
    const langBlurb: Record<string, string> = {
        js: 'Node.js and the browser', py: 'sync and async (asyncio)', ts: 'typed, for Node and bundlers',
        php: 'sync and async (ReactPHP)', cs: '.NET / C#', go: 'Go modules', java: 'Java (JVM)',
    };
    const chooser = exampleLangs
        .map((l) => `- [${LANGS[l]} Examples](/docs/examples/${l}) — ${langBlurb[l] ?? ''}`)
        .join('\n');
    // "Awesome CCXT" (projects/integrations/showcases) is written by the guides loop at
    // examples/awesome.md (its GUIDES route moved under examples) — surface it here too.
    const awesomePage = fs.existsSync(path.join(OUT, 'examples', 'awesome.md'));
    const extras = [
        ...(awesomePage ? ['\nShowcases — see [Awesome CCXT](/docs/examples/awesome), a curated list of projects and integrations built with CCXT.\n'] : []),
        ...(citationsPage ? ['\nSee also [Citations & Articles](/docs/examples/citations) — papers, theses, tutorials and projects that cite or build on CCXT.\n'] : []),
    ].join('');
    write(path.join(OUT, 'examples', 'index.md'),
        frontmatter('Examples', 'Runnable CCXT code examples — pick your language.') +
        'Hundreds of runnable CCXT examples. Pick a language to browse its ready-to-run scripts:\n\n' +
        chooser + '\n' + extras);
    // root:true -> renders as a sidebar tab (keeps /docs/examples/* URLs unchanged)
    const examplePages = ['index', ...exampleLangs, ...(awesomePage ? ['awesome'] : []), ...(citationsPage ? ['citations'] : [])];
    write(path.join(OUT, 'examples', 'meta.json'),
        JSON.stringify({ title: 'Examples', icon: 'Code', description: 'Examples, guides & showcases', root: true, pages: examplePages }, null, 2));

    // 4) top-level (Guides) nav meta.json. exchanges/examples are their own root tabs.
    const topPages = [
        'index', 'install', 'manual', '[Prediction Markets](/docs/prediction)', 'pro-manual', 'pro', 'cli', 'examples-overview',
        'faq', 'requirements', 'contributing',
        '---Reference---', 'base-spec', 'exchange-markets', 'exchange-markets-by-country',
        'ai-skills', 'stats', 'certification', 'changelog',
    ];
    write(path.join(OUT, 'meta.json'),
        JSON.stringify({ title: 'Guide', icon: 'BookOpen', description: 'Install, manual & reference', root: true, pages: topPages }, null, 2));

    // expose the CCXT version (from the root package.json) to the app, so the homepage
    // Java/gradle install line shows the current version instead of a hardcoded one.
    const ccxtVersion = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
    fs.writeFileSync(path.join(ROOT, 'website', 'src', 'lib', 'ccxt-version.json'),
        JSON.stringify({ version: ccxtVersion }, null, 2) + '\n');

    // 5) translated guides: drop the committed per-locale markdown in as
    // content/docs/<name>.<locale>.md so Fumadocs i18n serves it (others fall back to
    // English). Copied verbatim, except the exchanges table — that's re-injected from the
    // current English build (see EXCHANGE_TABLE_RE) so it never goes stale per locale.
    const I18N_DIR = path.join(ROOT, 'website', 'content-i18n');
    let i18nCount = 0;
    if (fs.existsSync(I18N_DIR)) {
        for (const locale of fs.readdirSync(I18N_DIR)) {
            const dir = path.join(I18N_DIR, locale);
            if (!fs.statSync(dir).isDirectory()) continue;
            for (const f of fs.readdirSync(dir)) {
                if (!f.endsWith('.md')) continue;
                const base = f.replace(/\.md$/, '');
                // guides relocated under another section keep their translations alongside
                // the English page (awesome moved under examples).
                const target = (base === 'awesome') ? 'examples/awesome' : base;
                let content = fs.readFileSync(path.join(dir, f), 'utf8');
                const enTable = (base === 'manual') ? EN_MANUAL_TABLE : (base === 'pro-manual') ? EN_PRO_TABLE : '';
                if (enTable) {
                    // keep the locale's translated intro sentence (just refresh its exchange
                    // count) and swap in the current English table rows.
                    const enIntro = (enTable.match(/^<!--- init list -->[^\n]*/) ?? [''])[0];
                    const enCount = (enIntro.match(/\d+/) ?? [''])[0];
                    const enBody = enTable.slice(enIntro.length);     // \n...rows...<!--- end list -->
                    content = content.replace(EXCHANGE_TABLE_RE, (m) => {
                        const localeIntro = (m.match(/^<!--- init list -->[^\n]*/) ?? [enIntro])[0];
                        return (enCount ? localeIntro.replace(/\d+/, enCount) : localeIntro) + enBody;
                    });
                }
                write(path.join(OUT, `${target}.${locale}.md`), content);
                i18nCount++;
            }
        }
    }

    console.log(`✅ wrote ${count} pages (+${i18nCount} translated) to ${path.relative(ROOT, OUT)} (ccxt v${ccxtVersion})`);
}

main();
