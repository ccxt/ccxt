#!/usr/bin/env node
// ============================================================================
// DEV TOOL — java-nt campaign MERGE PREFLIGHT. NOT part of the transpile
// pipeline; nothing imports it; it only reads git state and prints a report.
// ============================================================================
//
// WHY: 31 sibling agents edit the SAME hand-written files (build/java-local-types.js,
// build/generateJavaWrappers.ts, build/javaTranspiler.ts, hand-written java base) on
// branches off a common base. The integration parent needs to know — BEFORE merging —
// which branches collide and WHERE, so conflicting merges can be sequenced and
// resolved deliberately instead of discovered one blown merge at a time.
//
// WHAT IT REPORTEDLY DID WRONG LAST TIME (this tool exists to prevent it):
//   * committed conflict markers       -> validator (javaMergeValidate.mjs) catches,
//   * a union that split a function    -> function-level overlap report,
//   * rival implementations of a feature -> new-symbol collision report,
//   * generated-tree conflicts         -> classified separately (regenerate policy).
//
// WHAT THIS REPORTS, per branch list:
//   1. hand-written files touched by >= 2 branches,
//   2. top-level SYMBOLS of build/java-local-types.js touched by >= 2 branches
//      (the file is PARSED — acorn — not line-diffed, so an edit that keeps the
//      line count identical is still caught),
//   3. NEW top-level symbols added by >= 2 branches (a duplicate declaration on
//      union — the exact "union duplicated a function" failure mode),
//   4. pairwise risk ranking and entanglement clusters,
//   5. a suggested merge order (disjoint branches first; per cluster, smallest
//      edits first).
//
// USAGE:
//   node build/javaMergePreflight.mjs [--base <sha>] [--pattern 'java-nt-*']
//        [--branches a,b,c | <branch> <branch> ...] [--json] [--out <file>]
//        [--no-wip] [--selftest]
//
//   --base      common base commit (default 853ab685540, the java-nt campaign base)
//   --pattern   git branch glob (default 'java-nt-*'; the current HEAD branch is excluded)
//   <branch>... positional branch names override --pattern
//   --no-wip    skip the worktree working-tree preview for branches with no commits yet
//   --json      machine-readable report on stdout
//   --out FILE  also write the JSON report to FILE
//   --selftest  run the detector against a throwaway temp git repo (proves the
//               function-overlap / collision detection actually fires; no repo mutation)
//
// MEASUREMENT MODEL (honest description):
//   * For a branch with commits ahead of base, the analysis uses the COMMITTED
//     delta (git diff base..branch) — that is exactly what a merge would apply.
//   * For a branch with no commits yet, the tool falls back to the branch's
//     worktree working tree (git diff base in that worktree) and labels the
//     branch "wip-preview". That is what the branch WOULD bring if committed now.
//   * Branches with neither are reported "empty".
//   Re-run before merging: previews are only as good as the worktree state.
//
// ============================================================================

import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// git helpers
// ---------------------------------------------------------------------------
const MAXBUF = 256 * 1024 * 1024;

function git (args, cwd, { allowFail = false } = {}) {
    try {
        return execFileSync('git', args, { cwd, maxBuffer: MAXBUF, encoding: 'utf8' });
    } catch (e) {
        if (allowFail) {
            return null;
        }
        throw e;
    }
}

function gitShow (cwd, rev, filePath) {
    return git(['show', `${rev}:${filePath}`], cwd, { allowFail: true });
}

function currentBranch (cwd) {
    const b = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd).trim();
    return b === 'HEAD' ? null : b;
}

function worktreeMap (cwd) {
    // branch name -> worktree path (first worktree per branch wins)
    const out = git(['worktree', 'list', '--porcelain'], cwd);
    const map = new Map();
    let wt = null;
    for (const line of out.split('\n')) {
        if (line.startsWith('worktree ')) {
            wt = line.slice('worktree '.length).trim();
        } else if (line.startsWith('branch ') && wt) {
            const ref = line.slice('branch '.length).trim();
            const name = ref.replace(/^refs\/heads\//, '');
            if (!map.has(name)) {
                map.set(name, wt);
            }
            wt = null;
        }
    }
    return map;
}

// ---------------------------------------------------------------------------
// path classification
// ---------------------------------------------------------------------------
const GENERATED_JAVA_RE = /^java\/lib\/src\/main\/java\/io\/github\/ccxt\/(exchanges|pro|prediction|api|types|errors)\//;

function classifyPath (p) {
    if (/^build\/.+\.(js|mjs|cjs)$/.test(p)) return 'module-js';
    if (/^build\/.+\.ts$/.test(p)) return 'module-ts';
    if (p.startsWith('java/') && p.endsWith('.java')) {
        return GENERATED_JAVA_RE.test(p) ? 'generated-java' : 'java-base';
    }
    if (p.startsWith('ts/src/')) return 'ts-src';
    return 'other';
}

// ---------------------------------------------------------------------------
// top-level symbol parsing of java-local-types.js
// ---------------------------------------------------------------------------
function normalizeBody (text) {
    return String(text).replace(/\s+/g, ' ').trim();
}

function parseTopLevelWithAcorn (src) {
    const acorn = require('acorn');
    const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
    const out = [];
    for (const node of ast.body) {
        if (node.type === 'FunctionDeclaration' && node.id) {
            out.push({ name: node.id.name, kind: 'function', start: node.start, end: node.end });
        } else if (node.type === 'VariableDeclaration') {
            for (const d of node.declarations) {
                if (d.id && d.id.type === 'Identifier') {
                    out.push({ name: d.id.name, kind: node.kind, start: node.start, end: node.end });
                }
            }
        } else if (node.type === 'ClassDeclaration' && node.id) {
            out.push({ name: node.id.name, kind: 'class', start: node.start, end: node.end });
        }
    }
    return out;
}

// Fallback used only if acorn is unavailable: line-oriented brace scanner.
function parseTopLevelFallback (src) {
    const lines = src.split('\n');
    const out = [];
    const strip = (line) => line
        .replace(/\/\/.*$/, '')
        .replace(/\/\*.*?\*\//g, '')
        .replace(/'(?:[^'\\]|\\.)*'/g, "''")
        .replace(/"(?:[^"\\]|\\.)*"/g, '""')
        .replace(/`(?:[^`\\]|\\.)*`/g, '``');
    let i = 0;
    while (i < lines.length) {
        const m = lines[i].match(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/)
            || lines[i].match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/)
            || lines[i].match(/^(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/);
        if (!m) { i++; continue; }
        const start = i;
        let depth = 0;
        let seenBrace = false;
        let j = i;
        let startOffset = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
        for (; j < lines.length; j++) {
            const s = strip(lines[j]);
            for (const ch of s) {
                if (ch === '{') { depth++; seenBrace = true; }
                else if (ch === '}') depth--;
            }
            if (seenBrace && depth <= 0) break;
            if (!seenBrace && /;\s*$/.test(s)) break; // single-line const without braces
        }
        const endLine = Math.min(j, lines.length - 1);
        const endOffset = lines.slice(0, endLine + 1).join('\n').length;
        out.push({ name: m[1], kind: 'fallback', start: startOffset, end: endOffset });
        i = endLine + 1;
    }
    return out;
}

function parseTopLevel (src) {
    try {
        return parseTopLevelWithAcorn(src);
    } catch (e) {
        if (process.env.CCXT_JAVA_MERGE_DEBUG) {
            console.error('[preflight] acorn parse failed, using fallback:', e.message);
        }
        return parseTopLevelFallback(src);
    }
}

function symbolMap (src) {
    const decls = parseTopLevel(src);
    const map = new Map();
    for (const d of decls) {
        const text = normalizeBody(src.slice(d.start, d.end));
        map.set(d.name, { body: text, kind: d.kind });
    }
    return map;
}

// ---------------------------------------------------------------------------
// hunk ranges (base-file line coordinates) for line-level overlap
// ---------------------------------------------------------------------------
function parseHunks (diffText) {
    const ranges = [];
    for (const line of diffText.split('\n')) {
        const m = line.match(/^@@ -(\d+)(?:,(\d+))? \+\d+(?:,\d+)? @@/);
        if (m) {
            const a = parseInt(m[1], 10);
            const b = m[2] === undefined ? 1 : parseInt(m[2], 10);
            if (b === 0) {
                ranges.push([a, a]); // pure insertion point in base coords
            } else {
                ranges.push([a, a + b - 1]);
            }
        }
    }
    return ranges;
}

function rangesOverlap (r1, r2) {
    return r1[0] <= r2[1] && r2[0] <= r1[1];
}

// ---------------------------------------------------------------------------
// core analysis
// ---------------------------------------------------------------------------
export function runPreflight ({ repo, base, branches, useWip = true, log = () => {} }) {
    const warnings = [];
    const baseSha = git(['rev-parse', '--verify', `${base}^{commit}`], repo).trim();
    const headBranch = currentBranch(repo);
    const wtMap = worktreeMap(repo);

    const branchInfo = new Map();
    for (const b of branches) {
        const info = {
            name: b,
            mode: 'empty',
            ahead: 0,
            changed: new Map(), // path -> status
            wipExtra: [],       // paths changed only in the worktree (not in commits)
            wipFiles: 0,
            symbolsTouched: [],
            symbolsAdded: [],
            symbolsDeleted: [],
            error: null,
        };
        const exists = git(['rev-parse', '--verify', `refs/heads/${b}`], repo, { allowFail: true });
        if (!exists) {
            info.error = 'branch not found';
            branchInfo.set(b, info);
            continue;
        }
        const aheadStr = git(['rev-list', '--count', `${baseSha}..${b}`], repo).trim();
        info.ahead = parseInt(aheadStr, 10) || 0;

        const committedDiff = info.ahead > 0 ? git(['diff', '--name-status', '-M', `${baseSha}..${b}`], repo) : '';
        const committed = parseNameStatus(committedDiff);
        const wt = wtMap.get(b);
        let worktreeDelta = new Map();
        if (wt && existsSync(wt)) {
            const wtDiff = git(['-C', wt, 'diff', '--name-status', '-M', baseSha], repo, { allowFail: true });
            if (wtDiff) {
                worktreeDelta = parseNameStatus(wtDiff);
            }
        }
        info.wipFiles = worktreeDelta.size;
        for (const [p] of worktreeDelta) {
            if (!committed.has(p)) info.wipExtra.push(p);
        }
        if (committed.size > 0) {
            info.mode = 'committed';
            info.changed = committed;
        } else if (worktreeDelta.size > 0) {
            info.mode = 'wip-preview';
            info.changed = worktreeDelta;
        }
        branchInfo.set(b, info);
    }

    // ---- java-local-types.js symbol-level analysis --------------------------
    const LJT = 'build/java-local-types.js';
    const baseLjt = gitShow(repo, baseSha, LJT);
    const baseSymbols = baseLjt !== null ? symbolMap(baseLjt) : null;
    if (baseSymbols === null) {
        warnings.push(`base commit has no ${LJT} — symbol analysis skipped`);
    }

    const fnTouch = new Map();     // symbol name -> Set(branch)
    const fnAdded = new Map();     // symbol name -> Set(branch)
    const fnDeleted = new Map();   // symbol name -> Set(branch)
    const perBranchDiff = new Map();

    for (const [b, info] of branchInfo) {
        if (info.error || baseSymbols === null) continue;
        if (!info.changed.has(LJT)) continue;
        const wt = wtMap.get(b);
        let content = null;
        if (info.mode === 'committed') {
            content = gitShow(repo, b, LJT);
        } else if (info.mode === 'wip-preview' && wt) {
            const p = path.join(wt, LJT);
            content = existsSync(p) ? readFileSync(p, 'utf8') : null;
        }
        if (content === null) {
            warnings.push(`could not read ${LJT} for ${b}`);
            continue;
        }
        let branchSymbols;
        try {
            branchSymbols = symbolMap(content);
        } catch (e) {
            warnings.push(`${b}: failed to parse ${LJT} (${e.message}) — treating as wholesale touch`);
            info.symbolsTouched = [ '<whole file: parse failed>' ];
            fnTouch.set('<whole file: parse failed>', (fnTouch.get('<whole file: parse failed>') || new Set()).add(b));
            continue;
        }
        const modified = [];
        const added = [];
        const deleted = [];
        for (const [name, v] of branchSymbols) {
            if (!baseSymbols.has(name)) {
                added.push(name);
            } else if (baseSymbols.get(name).body !== v.body) {
                modified.push(name);
            }
        }
        for (const [name] of baseSymbols) {
            if (!branchSymbols.has(name)) deleted.push(name);
        }
        modified.sort(); added.sort(); deleted.sort();
        info.symbolsTouched = modified.slice();
        info.symbolsAdded = added;
        info.symbolsDeleted = deleted;
        perBranchDiff.set(b, { modified, added, deleted });
        for (const n of modified) fnTouch.set(n, (fnTouch.get(n) || new Set()).add(b));
        for (const n of added) fnAdded.set(n, (fnAdded.get(n) || new Set()).add(b));
        for (const n of deleted) fnDeleted.set(n, (fnDeleted.get(n) || new Set()).add(b));
    }

    const fnHotspots = [...fnTouch.entries()]
        .filter(([, set]) => set.size >= 2)
        .map(([name, set]) => ({ name, branches: [...set].sort(), count: set.size }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const newSymbolCollisions = [...fnAdded.entries()]
        .filter(([, set]) => set.size >= 2)
        .map(([name, set]) => ({ name, branches: [...set].sort() }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const deletedByOneAddedByOther = [...fnAdded.keys()].filter((n) => fnDeleted.has(n));

    // ---- file-level overlap ------------------------------------------------
    const fileBranches = new Map(); // path -> Map(branch -> status)
    for (const [b, info] of branchInfo) {
        if (info.error) continue;
        for (const [p, st] of info.changed) {
            if (!fileBranches.has(p)) fileBranches.set(p, new Map());
            fileBranches.get(p).set(b, st);
        }
    }
    const handWrittenOverlap = [];
    const generatedOverlap = [];
    for (const [p, m] of fileBranches) {
        if (m.size < 2) continue;
        const cat = classifyPath(p);
        const entry = { path: p, category: cat, branches: [...m.keys()].sort(), count: m.size };
        if (cat === 'generated-java') generatedOverlap.push(entry);
        else handWrittenOverlap.push(entry);
    }
    handWrittenOverlap.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
    generatedOverlap.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));

    // ---- line-range overlap for shared non-generated files -----------------
    const rangeCache = new Map(); // `${branch}::${file}` -> ranges
    const getRanges = (b, p) => {
        const key = `${b}::${p}`;
        if (rangeCache.has(key)) return rangeCache.get(key);
        const info = branchInfo.get(b);
        let diffText = '';
        if (info.mode === 'committed') {
            diffText = git(['diff', '-U0', '--no-color', `${baseSha}..${b}`, '--', p], repo, { allowFail: true }) || '';
        } else if (info.mode === 'wip-preview' && wtMap.get(b)) {
            diffText = git(['-C', wtMap.get(b), 'diff', '-U0', '--no-color', baseSha, '--', p], repo, { allowFail: true }) || '';
        }
        const ranges = parseHunks(diffText);
        rangeCache.set(key, ranges);
        return ranges;
    };
    const tightConflicts = [];
    for (const entry of [...handWrittenOverlap, ...generatedOverlap]) {
        if (entry.category === 'generated-java') continue; // regenerated anyway
        const brs = entry.branches;
        for (let i = 0; i < brs.length; i++) {
            for (let j = i + 1; j < brs.length; j++) {
                const r1 = getRanges(brs[i], entry.path);
                const r2 = getRanges(brs[j], entry.path);
                let overlaps = 0;
                for (const x of r1) for (const y of r2) if (rangesOverlap(x, y)) overlaps++;
                if (overlaps > 0) {
                    tightConflicts.push({ pair: [brs[i], brs[j]], path: entry.path, overlappingHunks: overlaps });
                }
            }
        }
    }
    tightConflicts.sort((a, b) => b.overlappingHunks - a.overlappingHunks);

    // ---- pairwise scoring / clusters / order -------------------------------
    const names = [...branchInfo.keys()].filter((b) => !branchInfo.get(b).error).sort();
    const sharedFn = new Map(); // "a::b" -> [symbols]
    for (const h of fnHotspots) {
        const bs = h.branches;
        for (let i = 0; i < bs.length; i++) {
            for (let j = i + 1; j < bs.length; j++) {
                const k = `${bs[i]}::${bs[j]}`;
                if (!sharedFn.has(k)) sharedFn.set(k, []);
                sharedFn.get(k).push(h.name);
            }
        }
    }
    const collideAdd = new Map(); // "a::b" -> [symbols]
    for (const c of newSymbolCollisions) {
        const bs = c.branches;
        for (let i = 0; i < bs.length; i++) {
            for (let j = i + 1; j < bs.length; j++) {
                const k = `${bs[i]}::${bs[j]}`;
                if (!collideAdd.has(k)) collideAdd.set(k, []);
                collideAdd.get(k).push(c.name);
            }
        }
    }
    const sharedFiles = new Map(); // "a::b" -> [files]
    for (const e of handWrittenOverlap) {
        const bs = e.branches;
        for (let i = 0; i < bs.length; i++) {
            for (let j = i + 1; j < bs.length; j++) {
                const k = `${bs[i]}::${bs[j]}`;
                if (!sharedFiles.has(k)) sharedFiles.set(k, []);
                sharedFiles.get(k).push(e.path);
            }
        }
    }
    const tightPairs = new Map(); // "a::b" -> [tightConflict]
    for (const t of tightConflicts) {
        const k = `${t.pair[0]}::${t.pair[1]}`;
        if (!tightPairs.has(k)) tightPairs.set(k, []);
        tightPairs.get(k).push(t);
    }

    const pairs = [];
    const pairKeys = new Set([...sharedFn.keys(), ...collideAdd.keys(), ...sharedFiles.keys(), ...tightPairs.keys()]);
    for (const k of pairKeys) {
        const [a, b] = k.split('::');
        const fns = sharedFn.get(k) || [];
        const adds = collideAdd.get(k) || [];
        const files = sharedFiles.get(k) || [];
        const tight = tightPairs.get(k) || [];
        // documented heuristic weights: same-function edits are the hardest to
        // union by hand; new-symbol collisions are guaranteed duplicate decls;
        // same-file is a weak signal; overlapping hunks confirm real textual conflict.
        const score = 6 * fns.length + 5 * adds.length + 3 * files.length + 3 * Math.min(2, tight.length);
        pairs.push({
            a, b, score,
            sharedFunctions: fns,
            collidingNewSymbols: adds,
            sharedFiles: files,
            tightConflicts: tight.map((t) => ({ path: t.path, overlappingHunks: t.overlappingHunks })),
        });
    }
    pairs.sort((x, y) => y.score - x.score || x.a.localeCompare(y.a));

    // per-branch risk rank
    const branchRisk = new Map(names.map((n) => [n, { branch: n, score: 0, partners: 0, mode: branchInfo.get(n).mode }]));
    for (const p of pairs) {
        for (const side of [p.a, p.b]) {
            const r = branchRisk.get(side);
            r.score += p.score;
            r.partners += 1;
        }
    }
    const branchRanking = [...branchRisk.values()].sort((a, b) => b.score - a.score || b.partners - a.partners);

    // clusters (union-find over any shared signal)
    const parent = new Map(names.map((n) => [n, n]));
    const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
    const union = (x, y) => { const rx = find(x), ry = find(y); if (rx !== ry) parent.set(rx, ry); };
    for (const k of pairKeys) {
        const [a, b] = k.split('::');
        if (parent.has(a) && parent.has(b)) union(a, b);
    }
    const clusters = new Map();
    for (const n of names) {
        const root = find(n);
        if (!clusters.has(root)) clusters.set(root, []);
        clusters.get(root).push(n);
    }
    const clusterList = [...clusters.values()].map((members) => {
        const touchCount = (m) => (branchInfo.get(m).symbolsTouched.length + branchInfo.get(m).symbolsAdded.length);
        members.sort((a, b) => touchCount(a) - touchCount(b) || a.localeCompare(b));
        return { members, size: members.length, totalTouches: members.reduce((s, m) => s + touchCount(m), 0) };
    });
    clusterList.sort((a, b) => a.size - b.size || a.totalTouches - b.totalTouches);
    // suggested order: singleton clusters first, then clusters ascending; members ascending by touches
    const suggestedOrder = clusterList.flatMap((c) => c.members);

    return {
        tool: 'javaMergePreflight',
        generatedAt: new Date().toISOString(),
        repo,
        base: baseSha,
        headBranch,
        branchCount: branches.length,
        branchModes: Object.fromEntries(names.map((n) => [n, branchInfo.get(n).mode])),
        branchSummary: names.map((n) => {
            const i = branchInfo.get(n);
            return {
                branch: n,
                mode: i.mode,
                ahead: i.ahead,
                filesChanged: i.changed.size,
                wipExtra: i.wipExtra.length,
                uncommittedFiles: i.mode === 'committed' ? i.wipExtra.length : 0,
                symbolsModified: i.symbolsTouched.slice(0, 40),
                symbolsAdded: i.symbolsAdded,
                symbolsDeleted: i.symbolsDeleted,
            };
        }),
        handWrittenOverlap,
        generatedOverlap,
        functionHotspots: fnHotspots,
        newSymbolCollisions,
        deletedByOneAddedByOther,
        tightConflicts,
        pairRanking: pairs,
        branchRanking,
        clusters: clusterList,
        suggestedOrder,
        warnings,
    };
}

function parseNameStatus (text) {
    const map = new Map();
    if (!text) return map;
    for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        const parts = line.split('\t');
        if (parts.length < 2) continue;
        const status = parts[0].trim();
        const p = parts.length >= 3 ? parts[2] : parts[1]; // renames: use new path
        map.set(p, status);
    }
    return map;
}

// ---------------------------------------------------------------------------
// text report
// ---------------------------------------------------------------------------
function cap (arr, n = 12) {
    if (arr.length <= n) return arr.join(', ');
    return arr.slice(0, n).join(', ') + ` …(+${arr.length - n} more)`;
}

export function formatReport (r) {
    const L = [];
    L.push('='.repeat(78));
    L.push('JAVA-NT MERGE PREFLIGHT');
    L.push('='.repeat(78));
    L.push(`repo:   ${r.repo}`);
    L.push(`base:   ${r.base}`);
    L.push(`head:   ${r.headBranch ?? '(detached)'}`);
    L.push(`branches analyzed: ${r.branchCount}`);
    const modes = { committed: 0, 'wip-preview': 0, empty: 0 };
    for (const m of Object.values(r.branchModes)) modes[m] = (modes[m] || 0) + 1;
    L.push(`  committed: ${modes.committed}   wip-preview (uncommitted worktree): ${modes['wip-preview']}   empty: ${modes.empty}`);
    L.push('');
    L.push('-- Branch summary ---------------------------------------------------------');
    for (const b of r.branchSummary) {
        const syms = b.symbolsModified.length ? ` | jlt symbols: ${cap(b.symbolsModified, 6)}` : '';
        const adds = b.symbolsAdded.length ? ` | +${cap(b.symbolsAdded, 6)}` : '';
        L.push(`  ${b.branch.padEnd(38)} ${b.mode.padEnd(11)} files:${String(b.filesChanged).padStart(4)}${b.wipExtra ? ` wip-extra:${b.wipExtra}` : ''}${syms}${adds}`);
    }
    L.push('');
    L.push('-- Hand-written file overlap (>=2 branches touch the same file) ----------');
    if (!r.handWrittenOverlap.length) L.push('  (none)');
    for (const e of r.handWrittenOverlap) {
        L.push(`  [${String(e.count).padStart(2)}] ${e.category.padEnd(10)} ${e.path}`);
        L.push(`       ${cap(e.branches, 14)}`);
    }
    L.push('');
    L.push('-- java-local-types.js FUNCTION hotspots (top-level symbol touched by >=2) ---');
    if (!r.functionHotspots.length) L.push('  (none)');
    for (const h of r.functionHotspots.slice(0, 60)) {
        L.push(`  [${String(h.count).padStart(2)}] ${h.name}`);
        L.push(`       ${cap(h.branches, 14)}`);
    }
    if (r.functionHotspots.length > 60) L.push(`  …(+${r.functionHotspots.length - 60} more)`);
    L.push('');
    L.push('-- NEW top-level symbol collisions (same name added by >=2 branches) ------');
    if (!r.newSymbolCollisions.length) L.push('  (none)');
    for (const c of r.newSymbolCollisions) {
        L.push(`  !! ${c.name}  <= ${cap(c.branches, 14)}   (union would declare it twice)`);
    }
    if (r.deletedByOneAddedByOther.length) {
        L.push(`  note: symbol(s) added by one branch and deleted by another: ${cap(r.deletedByOneAddedByOther, 8)}`);
    }
    L.push('');
    L.push('-- Tightest textual conflicts (overlapping changed line ranges) ------------');
    if (!r.tightConflicts.length) L.push('  (none)');
    for (const t of r.tightConflicts.slice(0, 25)) {
        L.push(`  ${String(t.overlappingHunks).padStart(3)} overlapping hunk pairs  ${t.path}  (${t.pair[0]} × ${t.pair[1]})`);
    }
    L.push('');
    L.push('-- Pairwise risk ranking (top 25) ------------------------------------------');
    if (!r.pairRanking.length) L.push('  (none)');
    for (const p of r.pairRanking.slice(0, 25)) {
        const bits = [];
        if (p.sharedFunctions.length) bits.push(`${p.sharedFunctions.length} shared fn(${cap(p.sharedFunctions, 4)})`);
        if (p.collidingNewSymbols.length) bits.push(`${p.collidingNewSymbols.length} colliding new(${cap(p.collidingNewSymbols, 4)})`);
        if (p.sharedFiles.length) bits.push(`${p.sharedFiles.length} shared file(s)`);
        if (p.tightConflicts.length) bits.push(`${p.tightConflicts.reduce((s, t) => s + t.overlappingHunks, 0)} overlapping hunks`);
        L.push(`  score ${String(p.score).padStart(4)}  ${p.a} × ${p.b}  — ${bits.join(' + ')}`);
    }
    L.push('');
    L.push('-- Per-branch risk ranking -------------------------------------------------');
    for (const b of r.branchRanking) {
        L.push(`  score ${String(b.score).padStart(4)}  partners ${String(b.partners).padStart(2)}  ${b.branch} (${b.mode})`);
    }
    L.push('');
    L.push('-- Entanglement clusters & SUGGESTED MERGE ORDER ---------------------------');
    if (!r.clusters.length) L.push('  (no clusters — nothing overlaps)');
    r.clusters.forEach((c, idx) => {
        L.push(`  cluster ${idx + 1} (${c.size}): ${cap(c.members, 16)}`);
    });
    L.push('');
    L.push('  ORDER:');
    r.suggestedOrder.forEach((b, i) => L.push(`   ${String(i + 1).padStart(2)}. ${b}`));
    L.push('');
    L.push('  Policy reminder: generated java/** conflicts are resolved --theirs and the');
    L.push('  whole tree is REGENERATED once at the end; hand-written files are unioned');
    L.push('  BY HAND with a syntax check after every single merge (javaMergeValidate.mjs).');
    if (r.generatedOverlap.length) {
        L.push('');
        L.push(`  (${r.generatedOverlap.length} generated file(s) also touched by >=2 branches — expected; regenerate.)`);
    }
    if (r.warnings.length) {
        L.push('');
        L.push('-- Warnings ----------------------------------------------------------------');
        for (const w of r.warnings) L.push(`  ! ${w}`);
    }
    L.push('');
    return L.join('\n');
}

// ---------------------------------------------------------------------------
// selftest — throwaway temp git repo
// ---------------------------------------------------------------------------
function sh (cmd, args, cwd) {
    return execFileSync(cmd, args, { cwd, maxBuffer: MAXBUF, encoding: 'utf8' });
}

export function selftest () {
    const dir = mkdtempSync(path.join(tmpdir(), 'jmp-selftest-'));
    const repo = path.join(dir, 'repo');
    mkdirSync(repo, { recursive: true });
    sh('git', ['init', '-q', '-b', 'main'], repo);
    sh('git', ['config', 'user.email', 'selftest@local'], repo);
    sh('git', ['config', 'user.name', 'selftest'], repo);
    mkdirSync(path.join(repo, 'build'), { recursive: true });
    const ljt = path.join(repo, 'build', 'java-local-types.js');
    const base = [
        'const TABLE = { a: 1 };',
        'function alpha (x) {',
        '    return x + 1;',
        '}',
        'function beta (x) {',
        '    return x + 2;',
        '}',
        'export function installJavaLocalTypes (printer) {',
        '    return new Map ();',
        '}',
        '',
    ].join('\n');
    writeFileSync(ljt, base);
    sh('git', ['add', '.'], repo);
    sh('git', ['commit', '-q', '-m', 'base'], repo);
    const baseSha = sh('git', ['rev-parse', 'HEAD'], repo).trim();

    // b1: edits alpha, adds gamma
    sh('git', ['checkout', '-q', '-b', 'b1'], repo);
    writeFileSync(ljt, base
        .replace('return x + 1;', 'return x + 11;')
        .replace('export function installJavaLocalTypes', 'function gamma () { return 3; }\nexport function installJavaLocalTypes'));
    sh('git', ['commit', '-qam', 'b1'], repo);
    // b2: edits alpha (differently), edits beta, also adds gamma (collision)
    sh('git', ['checkout', '-q', '-b', 'b2', baseSha], repo);
    writeFileSync(ljt, base
        .replace('return x + 1;', 'return x + 111;')
        .replace('return x + 2;', 'return x + 22;')
        .replace('export function installJavaLocalTypes', 'function gamma () { return 30; }\nexport function installJavaLocalTypes'));
    sh('git', ['commit', '-qam', 'b2'], repo);
    // b3: edits beta only
    sh('git', ['checkout', '-q', '-b', 'b3', baseSha], repo);
    writeFileSync(ljt, base.replace('return x + 2;', 'return x + 222;'));
    sh('git', ['commit', '-qam', 'b3'], repo);
    sh('git', ['checkout', '-q', 'main'], repo);

    const failures = [];
    const check = (cond, label) => { if (!cond) failures.push(label); };
    const r = runPreflight({ repo, base: baseSha, branches: ['b1', 'b2', 'b3'], useWip: false });

    const hot = new Map(r.functionHotspots.map((h) => [h.name, h.branches]));
    check(hot.has('alpha') && hot.get('alpha').join(',') === 'b1,b2', `alpha hotspot {b1,b2} (got ${JSON.stringify(hot.get('alpha'))})`);
    check(hot.has('beta') && hot.get('beta').join(',') === 'b2,b3', `beta hotspot {b2,b3} (got ${JSON.stringify(hot.get('beta'))})`);
    const collision = r.newSymbolCollisions.find((c) => c.name === 'gamma');
    check(collision && collision.branches.join(',') === 'b1,b2', `gamma new-symbol collision {b1,b2} (got ${JSON.stringify(r.newSymbolCollisions)})`);
    const pair12 = r.pairRanking.find((p) => p.a === 'b1' && p.b === 'b2');
    check(pair12 && pair12.sharedFunctions.includes('alpha') && pair12.collidingNewSymbols.includes('gamma'),
        `pair b1×b2 shares alpha + collides on gamma (got ${JSON.stringify(pair12)})`);
    check(r.pairRanking.length > 0 && pair12 && r.pairRanking[0].a === 'b1' && r.pairRanking[0].b === 'b2',
        'b1×b2 is the top-ranked pair');
    check(r.clusters.length === 1 && r.clusters[0].size === 3, 'all 3 branches form one cluster');
    check(r.suggestedOrder.length === 3, 'suggested order covers all branches');
    check(r.handWrittenOverlap.some((e) => e.path === 'build/java-local-types.js' && e.count === 3),
        'java-local-types.js reported as shared by 3 branches');

    // cleanup
    sh('rm', ['-rf', dir], tmpdir());

    return { pass: failures.length === 0, failures, dir };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs (argv) {
    const opts = { positional: [], flags: {} };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--base') opts.flags.base = argv[++i];
        else if (a === '--pattern') opts.flags.pattern = argv[++i];
        else if (a === '--branches') opts.flags.branches = argv[++i];
        else if (a === '--json') opts.flags.json = true;
        else if (a === '--out') opts.flags.out = argv[++i];
        else if (a === '--no-wip') opts.flags.noWip = true;
        else if (a === '--selftest') opts.flags.selftest = true;
        else if (a === '--repo') opts.flags.repo = argv[++i];
        else if (a.startsWith('--')) { console.error(`unknown flag ${a}`); process.exit(2); }
        else opts.positional.push(a);
    }
    return opts;
}

function main () {
    const opts = parseArgs(process.argv.slice(2));
    if (opts.flags.selftest) {
        console.log('javaMergePreflight --selftest');
        const res = selftest();
        if (res.pass) {
            console.log('SELFTEST: ALL PASS (function hotspots, new-symbol collision, ranking, cluster, order)');
            process.exit(0);
        }
        console.error('SELFTEST FAILED:');
        for (const f of res.failures) console.error(`  FAIL: ${f}`);
        process.exit(1);
    }
    const repo = opts.flags.repo || process.cwd();
    const base = opts.flags.base
        || process.env.JAVA_NT_MERGE_BASE
        || '853ab685540';
    let branches;
    if (opts.flags.branches) {
        branches = opts.flags.branches.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (opts.positional.length) {
        branches = opts.positional;
    } else {
        const pattern = opts.flags.pattern || 'java-nt-*';
        const head = currentBranch(repo);
        branches = git(['branch', '--list', pattern, '--format=%(refname:short)'], repo)
            .split('\n').map((s) => s.trim()).filter(Boolean)
            .filter((b) => b !== head);
    }
    if (!branches.length) {
        console.error('no branches to analyze');
        process.exit(2);
    }
    const report = runPreflight({ repo, base, branches, useWip: !opts.flags.noWip });
    if (opts.flags.json) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        console.log(formatReport(report));
    }
    if (opts.flags.out) {
        writeFileSync(opts.flags.out, JSON.stringify(report, null, 2));
        console.error(`json report written to ${opts.flags.out}`);
    }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
    main();
}
