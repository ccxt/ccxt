/* eslint-disable */
// Link/anchor checker for the built Fumadocs static export (website/out).
// Validates every internal link (page target + #fragment) against the real `id`
// attributes Fumadocs emitted — so it reflects exactly what the browser resolves.
//
// A committed baseline (fumadocs-linkcheck-baseline.json) records links that are
// already broken in the source (stale TOC anchors, JSDoc @name typos) so the gate
// only fails on NEW breakage. Regenerate it with `--update` after an intended change.
//
//   npx tsx build/check-fumadocs-links.ts            # gate (exit 1 on new breakage)
//   npx tsx build/check-fumadocs-links.ts --update   # rewrite the baseline

import fs from 'fs';
import path from 'path';

const OUT = path.resolve(import.meta.dirname, '..', 'website', 'out');
const BASELINE_FILE = path.resolve(import.meta.dirname, 'fumadocs-linkcheck-baseline.json');

function walk (dir: string, out: string[] = []): string[] {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith('.html')) out.push(p);
    }
    return out;
}

// out/docs/manual.html -> /docs/manual ; out/docs/x/index.html -> /docs/x ; out/index.html -> /
function urlOf (file: string): string {
    let rel = '/' + path.relative(OUT, file).replace(/\\/g, '/');
    rel = rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
    return rel === '' ? '/' : rel;
}

function main () {
    if (!fs.existsSync(OUT)) { console.error(`✗ ${OUT} not found — run the website build first.`); process.exit(2); }
    const update = process.argv.includes('--update');

    const files = walk(OUT);
    const ids = new Map<string, Set<string>>();
    const links = new Map<string, { to: string; frag: string; from: string }>();  // key -> first occurrence

    for (const file of files) {
        const url = urlOf(file);
        const html = fs.readFileSync(file, 'utf8');
        const idset = new Set<string>();
        for (const m of html.matchAll(/\sid="([^"]+)"/g)) idset.add(m[1]);
        ids.set(url, idset);
        for (const m of html.matchAll(/href="(\/[^"#]*)?(#[^"]*)?"/g)) {
            if (!m[1] && !m[2]) continue;
            const to = m[1] ?? url;
            const frag = (m[2] ?? '').replace(/^#/, '');
            if (!to.startsWith('/')) continue;                 // internal only
            if (/^\/_next\//.test(to)) continue;               // build assets (hashed chunks)
            if (/\.(css|m?js|json|png|jpe?g|svg|ico|webp|gif|xml|txt|woff2?|map)$/i.test(to)) continue;
            const key = `${to}#${frag}`;
            if (!links.has(key)) links.set(key, { to, frag, from: url });
        }
    }

    const broken = new Map<string, { to: string; frag: string; from: string; kind: string }>();
    for (const [key, l] of links) {
        const targetIds = ids.get(l.to);
        if (!targetIds) broken.set(key, { ...l, kind: 'page' });
        else if (l.frag && !targetIds.has(l.frag)) broken.set(key, { ...l, kind: 'anchor' });
    }

    if (update) {
        const keys = [...broken.keys()].sort();
        fs.writeFileSync(BASELINE_FILE, JSON.stringify(keys, null, 2) + '\n');
        console.log(`📝 wrote baseline with ${keys.length} known-broken links to ${path.relative(process.cwd(), BASELINE_FILE)}`);
        return;
    }

    const baseline = new Set<string>(
        fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : []
    );
    const fresh = [...broken.entries()].filter(([k]) => !baseline.has(k)).map(([, v]) => v);
    const fixed = [...baseline].filter((k) => !broken.has(k));

    console.log(`🔗 checked ${links.size} unique internal link targets across ${files.length} pages`);
    console.log(`   ${broken.size} broken (${baseline.size} baselined as pre-existing)`);
    if (fixed.length) console.log(`   ✓ ${fixed.length} baselined link(s) now fixed — run --update to prune the baseline`);

    if (fresh.length) {
        console.error(`\n❌ ${fresh.length} NEW broken link(s):`);
        for (const l of fresh.slice(0, 50)) {
            console.error(`  [${l.kind}] ${l.to}${l.frag ? '#' + l.frag : ''}   (from ${l.from})`);
        }
        if (fresh.length > 50) console.error(`  … and ${fresh.length - 50} more`);
        process.exit(1);
    }
    console.log('\n✅ no new broken links');
}

main();
