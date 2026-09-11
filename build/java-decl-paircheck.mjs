#!/usr/bin/env node
// DEV TOOL — campaign instrumentation for the Java nested-types typing campaign (JN-24).
// NOT wired into any published build; safe to exclude from release PRs.
//
// PAIR-CHECK VALIDATOR: given a diff (of generated Java, or any Java), asserts that
// every removed/added line pair is a declaration/signature-only change (plus the
// checkcasts the named types require). A pair that changes anything else — value,
// identifier, string literal, number, dropped/added statement — is reported as a
// VIOLATION. This is the guard against a bad merge silently altering runtime code.
//
// Usage:
//   node build/java-decl-paircheck.mjs --base <rev> [--worktree <dir>] [--paths java/] [--paths ...]
//   node build/java-decl-paircheck.mjs --diff <file.diff>     # validate a saved diff
//   options: --strict (comments become violations), --json <out>, --quiet, --max-shown N
//
// Exit codes: 0 = clean, 1 = violations found, 2 = usage/IO error.
//
// Categories (allowed):  OK_TYPE            pure declared-type change (class/field/local/param/signature)
//                        OK_CAST            type change + inserted/removed checkcasts
//                        OK_RECEIVER_PAREN  checkcast receiver parens, e.g. ((List) x).get(0) vs x.get(0)
//                        OK_IMPORT          import line add/remove/change
//                        OK_ANNOTATION      annotation line add/remove
// Categories (warn; violations with --strict):
//                        COMMENT_CHANGE
// Categories (violation):
//                        VALUE_CHANGE, UNPAIRED_ADD, UNPAIRED_REMOVE,
//                        CAST_TERNARY_SUSPECT (cast bound to a ternary condition), FILE_ADDED, FILE_DELETED

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { normalizeLine, canonTypes, splitDotted } from './java-decl-tools-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');

function parseArgs(argv) {
  const opts = {
    base: null, worktree: REPO_ROOT, paths: [], diff: null, json: null,
    strict: false, quiet: false, maxShown: 40,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--base') opts.base = argv[++i];
    else if (a === '--worktree') opts.worktree = path.resolve(argv[++i]);
    else if (a === '--paths') opts.paths.push(argv[++i]);
    else if (a === '--diff') opts.diff = argv[++i];
    else if (a === '--json') opts.json = argv[++i];
    else if (a === '--strict') opts.strict = true;
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--max-shown') opts.maxShown = parseInt(argv[++i], 10);
    else if (a === '-h' || a === '--help') {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 30).join('\n'));
      process.exit(0);
    } else {
      console.error(`unknown option: ${a}`);
      process.exit(2);
    }
  }
  if (!opts.base && !opts.diff) {
    console.error('need --base <rev> or --diff <file.diff>');
    process.exit(2);
  }
  if (!opts.paths.length) opts.paths = ['java/'];
  return opts;
}

// ---------------------------------------------------------------------------
// Diff parsing
// ---------------------------------------------------------------------------

function parseDiff(text) {
  const files = []; // { path, added, deleted, binary, hunks: [{ remStart, addStart, removed, added }] }
  let cur = null;
  let hunk = null;
  let remNo = 0;
  let addNo = 0;
  const flushHunk = () => {
    if (cur && hunk) cur.hunks.push(hunk);
    hunk = null;
  };
  for (const raw of text.split('\n')) {
    if (raw.startsWith('diff --git ')) {
      flushHunk();
      cur = null;
      continue;
    }
    if (raw.startsWith('--- ')) {
      flushHunk();
      if (raw.startsWith('--- /dev/null') && cur) cur.deleted = true;
      continue;
    }
    if (raw.startsWith('+++ ')) {
      if (raw.slice(4).startsWith('/dev/null')) {
        if (cur) cur.added = true;
        continue;
      }
      const p = raw.slice(4).replace(/\t.*$/, '').replace(/^[ab]\//, '');
      cur = { path: p, added: false, deleted: false, binary: false, hunks: [] };
      files.push(cur);
      continue;
    }
    const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(raw);
    if (m) {
      flushHunk();
      remNo = parseInt(m[1], 10);
      addNo = parseInt(m[3], 10);
      hunk = { remStart: remNo, addStart: addNo, removed: [], added: [] };
      continue;
    }
    if (
      raw.startsWith('index ') || raw.startsWith('old mode') || raw.startsWith('new mode') ||
      raw.startsWith('similarity index') || raw.startsWith('rename ') || raw.startsWith('new file mode') ||
      raw.startsWith('deleted file mode') || raw.startsWith('Binary files')
    ) {
      if (raw.startsWith('new file mode') && cur) cur.added = true;
      if (raw.startsWith('deleted file mode') && cur) cur.deleted = true;
      if (raw.startsWith('Binary files') && cur) cur.binary = true;
      continue;
    }
    if (raw === '\\ No newline at end of file') continue;
    if (raw.startsWith('-') && !raw.startsWith('---')) {
      if (hunk) hunk.removed.push({ line: raw.slice(1), no: remNo });
      remNo++;
      continue;
    }
    if (raw.startsWith('+') && !raw.startsWith('+++')) {
      if (hunk) hunk.added.push({ line: raw.slice(1), no: addNo });
      addNo++;
      continue;
    }
    if (raw.startsWith(' ')) {
      remNo++;
      addNo++;
      continue;
    }
  }
  flushHunk();
  return files;
}

// ---------------------------------------------------------------------------
// Line classification
// ---------------------------------------------------------------------------

function classifyLone(line) {
  const t = line.trim();
  if (t === '') return 'BLANK';
  if (/^\/\//.test(t) || /^\*/.test(t) || /^\/\*/.test(t)) return 'COMMENT';
  if (/^import\s/.test(t) || /^package\s/.test(t)) return 'IMPORT';
  if (t.startsWith('@')) return 'ANNOTATION';
  return 'OTHER';
}

// ---------------------------------------------------------------------------
// Pair checks
// ---------------------------------------------------------------------------

function classifyImportOrAnnotation(oldLine, newLine) {
  const cr = classifyLone(oldLine);
  const ca = classifyLone(newLine);
  if (cr === 'IMPORT' && ca === 'IMPORT') return 'OK_IMPORT';
  if (cr === 'ANNOTATION' && ca === 'ANNOTATION') return 'OK_ANNOTATION';
  return null;
}

function checkPair(removed, added) {
  const ia = classifyImportOrAnnotation(removed, added);
  if (ia) return { ok: true, category: ia };
  const clsR = classifyLone(removed);
  const clsA = classifyLone(added);
  if (clsR === 'COMMENT' && clsA === 'COMMENT') {
    if (removed.trim() === added.trim()) return { ok: true, category: 'OK' };
    return { ok: false, warn: true, category: 'COMMENT_CHANGE' };
  }
  if (clsR === 'BLANK' || clsA === 'BLANK') {
    if (removed.trim() === added.trim()) return { ok: true, category: 'OK' };
    const other = clsR === 'BLANK' ? clsA : clsR;
    if (other === 'COMMENT') return { ok: false, warn: true, category: 'COMMENT_CHANGE' };
    return { ok: false, category: 'VALUE_CHANGE', note: 'blank vs code' };
  }
  const r = normalizeLine(removed);
  const a = normalizeLine(added);
  const rCodeEmpty = r.tokens.length === 0;
  const aCodeEmpty = a.tokens.length === 0;
  if (rCodeEmpty && aCodeEmpty) {
    if (removed.trim() === added.trim()) return { ok: true, category: 'OK' };
    return { ok: false, warn: true, category: 'COMMENT_CHANGE' };
  }
  if (rCodeEmpty || aCodeEmpty) {
    return { ok: false, category: 'VALUE_CHANGE', note: 'code vs comment/blank mismatch' };
  }
  const suspect = a.castTernary.length ? a.castTernary : r.castTernary;
  const sameFormA = r.formA === a.formA;
  const sameFormB = r.formB === a.formB;
  if (sameFormA || sameFormB) {
    if (suspect.length) {
      return { ok: false, category: 'CAST_TERNARY_SUSPECT', violate: suspect };
    }
    let category = 'OK_RECEIVER_PAREN';
    if (sameFormA) {
      const onlyTypes = canonRaw(r) === canonRaw(a);
      category = onlyTypes ? 'OK_TYPE' : 'OK_CAST';
    }
    return { ok: true, category };
  }
  return { ok: false, category: 'VALUE_CHANGE', note: firstTokenDifference(r.formA, a.formA) };
}

function canonRaw(n) {
  return splitDotted(canonTypes(n.tokens)).join(' ');
}

function firstTokenDifference(formA, formB) {
  const a = formA.split(' ');
  const b = formB.split(' ');
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      const ctx = (arr, i) => arr.slice(Math.max(0, i - 2), i + 3).join(' ');
      return `... ${ctx(a, i)}  VS  ${ctx(b, i)} ...`;
    }
  }
  return '';
}

function pairMatches(r, a) {
  const res = checkPair(r.line, a.line);
  return !!(res.ok || res.warn);
}

// ---------------------------------------------------------------------------
// Hunk validation
// ---------------------------------------------------------------------------

function validateHunk(hunk) {
  const rl = hunk.removed;
  const al = hunk.added;
  const usedR = new Array(rl.length).fill(false);
  const usedA = new Array(al.length).fill(false);
  const results = [];
  let pairCount = 0;

  const record = (ri, aj) => {
    const res = checkPair(rl[ri].line, al[aj].line);
    results.push({
      category: res.category,
      ok: !!res.ok,
      warn: !!res.warn,
      remNo: rl[ri].no,
      addNo: al[aj].no,
      old: rl[ri].line,
      new: al[aj].line,
      note: res.note || '',
      violate: res.violate || null,
    });
    usedR[ri] = true;
    usedA[aj] = true;
    pairCount++;
  };

  if (rl.length === al.length) {
    for (let i = 0; i < rl.length; i++) record(i, i);
  } else {
    let p = 0;
    for (let i = 0; i < rl.length; i++) {
      let found = -1;
      for (let j = p; j < al.length; j++) {
        if (!usedA[j] && pairMatches(rl[i], al[j])) {
          found = j;
          break;
        }
      }
      if (found >= 0) {
        record(i, found);
        p = found + 1;
      }
    }
  }

  for (let i = 0; i < rl.length; i++) {
    if (usedR[i]) continue;
    const cls = classifyLone(rl[i].line);
    if (cls === 'BLANK') continue;
    if (cls === 'COMMENT') {
      results.push({ category: 'COMMENT_CHANGE', ok: false, warn: true, remNo: rl[i].no, addNo: null, old: rl[i].line, new: null });
    } else if (cls === 'IMPORT') {
      results.push({ category: 'OK_IMPORT', ok: true, remNo: rl[i].no, addNo: null, old: rl[i].line, new: null });
    } else if (cls === 'ANNOTATION') {
      results.push({ category: 'OK_ANNOTATION', ok: true, remNo: rl[i].no, addNo: null, old: rl[i].line, new: null });
    } else {
      results.push({ category: 'UNPAIRED_REMOVE', ok: false, remNo: rl[i].no, addNo: null, old: rl[i].line, new: null });
    }
  }
  for (let j = 0; j < al.length; j++) {
    if (usedA[j]) continue;
    const cls = classifyLone(al[j].line);
    if (cls === 'BLANK') continue;
    if (cls === 'COMMENT') {
      results.push({ category: 'COMMENT_CHANGE', ok: false, warn: true, remNo: null, addNo: al[j].no, old: null, new: al[j].line });
    } else if (cls === 'IMPORT') {
      results.push({ category: 'OK_IMPORT', ok: true, remNo: null, addNo: al[j].no, old: null, new: al[j].line });
    } else if (cls === 'ANNOTATION') {
      results.push({ category: 'OK_ANNOTATION', ok: true, remNo: null, addNo: al[j].no, old: null, new: al[j].line });
    } else {
      results.push({ category: 'UNPAIRED_ADD', ok: false, remNo: null, addNo: al[j].no, old: null, new: al[j].line });
    }
  }
  return { results, pairCount };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function getDiff(opts) {
  if (opts.diff) {
    return { text: fs.readFileSync(opts.diff, 'utf8'), source: `file ${opts.diff}` };
  }
  const args = ['-C', opts.worktree, 'diff', '--no-color', '--unified=3', '--no-ext-diff', opts.base, '--', ...opts.paths];
  const text = execFileSync('git', args, { maxBuffer: 1024 * 1024 * 512 }).toString();
  return { text, source: `git diff ${opts.base} (in ${opts.worktree}) -- ${opts.paths.join(' ')}` };
}

function fileGenerated(worktree, relPath) {
  try {
    const fd = fs.openSync(path.join(worktree, relPath), 'r');
    const buf = Buffer.alloc(2000);
    const n = fs.readSync(fd, buf, 0, 2000, 0);
    fs.closeSync(fd);
    return /GENERATED/.test(buf.toString('utf8', 0, n));
  } catch {
    return null;
  }
}

function run() {
  const opts = parseArgs(process.argv.slice(2));
  const { text, source } = getDiff(opts);
  const files = parseDiff(text);
  const report = {
    tool: 'java-decl-paircheck',
    generatedAt: new Date().toISOString(),
    source,
    strict: opts.strict,
    files: [],
    totals: {
      javaFiles: 0, pairs: 0, violations: 0, warnings: 0,
      categories: {}, violationCategories: {}, unparsable: 0,
    },
  };
  for (const f of files) {
    if (f.binary) continue;
    if (!/\.java$/.test(f.path)) continue;
    report.totals.javaFiles++;
    const violations = [];
    const categories = {};
    if (f.added) violations.push({ category: 'FILE_ADDED', note: 'entire file added', old: null, new: null, remNo: null, addNo: null });
    if (f.deleted) violations.push({ category: 'FILE_DELETED', note: 'entire file deleted', old: null, new: null, remNo: null, addNo: null });
    if (!f.added && !f.deleted) {
      for (const hunk of f.hunks) {
        const { results, pairCount } = validateHunk(hunk);
        report.totals.pairs += pairCount;
        for (const r of results) {
          categories[r.category] = (categories[r.category] || 0) + 1;
          report.totals.categories[r.category] = (report.totals.categories[r.category] || 0) + 1;
          if (r.ok) continue;
          if (r.warn && !opts.strict) {
            report.totals.warnings++;
            continue;
          }
          violations.push(r);
        }
      }
    }
    if (violations.length) {
      report.files.push({ path: f.path, generated: fileGenerated(opts.worktree, f.path), violations, categories });
      report.totals.violations += violations.length;
      for (const v of violations) {
        report.totals.violationCategories[v.category] = (report.totals.violationCategories[v.category] || 0) + 1;
      }
    }
  }

  if (!opts.quiet) {
    console.log('java-decl-paircheck — declaration/signature-only diff validator');
    console.log(`source: ${source}`);
    console.log(`strict: ${opts.strict ? 'yes' : 'no'}`);
    console.log('');
    let shown = 0;
    for (const f of report.files) {
      const gen = f.generated === null ? '?' : f.generated ? 'gen' : 'hand';
      console.log(`${f.path}  [${gen}]  ${f.violations.length} violation(s)`);
      for (const v of f.violations) {
        if (shown++ >= opts.maxShown) continue;
        const loc = v.remNo !== null && v.remNo !== undefined
          ? `L${v.remNo}${v.addNo !== null && v.addNo !== undefined ? ` -> L${v.addNo}` : ''}`
          : v.addNo !== null && v.addNo !== undefined ? `L${v.addNo}` : '';
        console.log(`  VIOLATION [${v.category}] ${loc}`);
        if (v.old !== null && v.old !== undefined) console.log(`    - ${v.old}`);
        if (v.new !== null && v.new !== undefined) console.log(`    + ${v.new}`);
        if (v.note) console.log(`    note: ${v.note}`);
      }
    }
    if (report.totals.violations === 0) console.log('(no violations)');
    console.log('');
    const cat = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' ') || '(none)';
    console.log(`SUMMARY: ${report.totals.javaFiles} java files, ${report.totals.pairs} pairs checked, ${report.totals.violations} violations, ${report.totals.warnings} warnings`);
    console.log(`  categories: ${cat(report.totals.categories)}`);
    console.log(`  violations: ${cat(report.totals.violationCategories)}`);
  }
  if (opts.json) {
    fs.mkdirSync(path.dirname(path.resolve(opts.json)), { recursive: true });
    fs.writeFileSync(path.resolve(opts.json), JSON.stringify(report, null, 2) + '\n');
  }
  process.exit(report.totals.violations > 0 ? 1 : 0);
}

run();
