// Summarize a V8 .cpuprofile: top functions by self time, an ASCII flame
// tree, and flamegraph.pl/speedscope-compatible folded stacks.
// Usage: node cpuprofile-report.mjs <file.cpuprofile> [--folded out.folded] [--top 25] [--depth 14] [--min 1]
import { readFileSync, writeFileSync } from 'fs';
import { parseArgs } from './common.mjs';

function label (cf) {
    const fn = cf.functionName || '(anonymous)';
    let file = cf.url || '';
    file = file.replace (/^file:\/\//, '').replace (/^.*\/node_modules\//, 'node_modules/').replace (/^.*\/ws-profile\//, 'ws-profile/').replace (/^.*\/js\/src\//, 'js/src/');
    if (file.startsWith ('node:')) return fn + ' ' + file;
    return file ? (fn + ' ' + file + ':' + (cf.lineNumber + 1)) : fn;
}

function main () {
    const argv = process.argv.slice (2);
    const file = argv[0];
    const args = parseArgs (argv.slice (1));
    const prof = JSON.parse (readFileSync (file, 'utf8'));
    const nodesById = new Map ();
    for (const n of prof.nodes) nodesById.set (n.id, n);
    // self time per node id (µs)
    const self = new Map ();
    let total = 0;
    for (let i = 0; i < prof.samples.length; i++) {
        const dt = prof.timeDeltas[i] || 0;
        if (dt <= 0) continue;
        total += dt;
        const id = prof.samples[i];
        self.set (id, (self.get (id) || 0) + dt);
    }
    // children links
    const parentOf = new Map ();
    for (const n of prof.nodes) {
        for (const c of (n.children || [])) parentOf.set (c, n.id);
    }
    // total time per node (self + descendants)
    const totalOf = new Map ();
    const order = [ ...prof.nodes ].sort ((a, b) => depth (b.id) - depth (a.id));
    function depth (id) {
        let d = 0;
        let cur = id;
        while (parentOf.has (cur)) { cur = parentOf.get (cur); d++; }
        return d;
    }
    for (const n of order) {
        let t = self.get (n.id) || 0;
        for (const c of (n.children || [])) t += totalOf.get (c) || 0;
        totalOf.set (n.id, t);
    }
    // ---- top self-time aggregated by function label ----
    const agg = new Map ();
    for (const n of prof.nodes) {
        const s = self.get (n.id) || 0;
        if (!s) continue;
        const key = label (n.callFrame);
        agg.set (key, (agg.get (key) || 0) + s);
    }
    const top = Number (args.top || 25);
    const rows = [ ...agg.entries () ].sort ((a, b) => b[1] - a[1]).slice (0, top);
    console.log ('== ' + file.split ('/').pop () + ' — total sampled ' + (total / 1000).toFixed (0) + 'ms ==');
    console.log ('-- top ' + top + ' functions by SELF time --');
    for (const [ key, us ] of rows) {
        console.log ((us / 1000).toFixed (1).padStart (9) + 'ms ' + ((us / total) * 100).toFixed (1).padStart (5) + '%  ' + key);
    }
    // ---- ASCII flame tree ----
    const minPct = Number (args.min || 1);
    const maxDepth = Number (args.depth || 14);
    console.log ('-- flame tree (nodes >= ' + minPct + '% total, depth <= ' + maxDepth + ') --');
    const roots = prof.nodes.filter ((n) => !parentOf.has (n.id));
    const walk = (id, d) => {
        const t = totalOf.get (id) || 0;
        const pct = (t / total) * 100;
        if (pct < minPct || d > maxDepth) return;
        const n = nodesById.get (id);
        const s = self.get (id) || 0;
        console.log ('  '.repeat (d) + pct.toFixed (1) + '% (' + (t / 1000).toFixed (1) + 'ms, self ' + (s / 1000).toFixed (1) + 'ms) ' + label (n.callFrame));
        const kids = (n.children || []).slice ().sort ((a, b) => (totalOf.get (b) || 0) - (totalOf.get (a) || 0));
        for (const c of kids) walk (c, d + 1);
    };
    for (const r of roots) walk (r.id, 0);
    // ---- folded stacks ----
    if (args.folded) {
        const lines = new Map ();
        const stackOf = (id) => {
            const parts = [];
            let cur = id;
            while (cur !== undefined) {
                parts.push (label (nodesById.get (cur).callFrame));
                cur = parentOf.get (cur);
            }
            return parts.reverse ().join (';');
        };
        for (const [ id, us ] of self.entries ()) {
            const key = stackOf (id);
            lines.set (key, (lines.get (key) || 0) + us);
        }
        const out = [ ...lines.entries () ].map (([ k, v ]) => k + ' ' + v).join ('\n') + '\n';
        writeFileSync (args.folded, out);
        console.log ('folded stacks (µs) -> ' + args.folded);
    }
}

main ();
