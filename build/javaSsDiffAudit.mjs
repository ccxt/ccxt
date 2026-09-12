#!/usr/bin/env node
// SS-16 diff audit: classify every ADDED line in GENERATED java files vs the campaign base.
//
// Categories:
//   declaration   a retyped declaration / typed assignment / method signature — e.g.
//                 `Object x = this.safeString(…)` → `String x = this.safeString(…)`,
//                 or a return-type change on a method whose body is unchanged.
//   cast-removal  the added line is the removed line with `(String)` / `((String)id)` casts
//                 stripped (the consumer now needs nothing).
//   other         anything else → the audit FAILS (exit 1) and lists the lines.
//
// Generated-ness: a file is treated as generated when its head (target revision) carries the
//   `IT IS GENERATED AND WILL BE OVERWRITTEN` marker. Hand-written files (base/SafeMethods.java,
//   BaseExchange.java, types/TypeHelper.java, ws/*, tests/) are skipped — their legit changes
//   include `if` bodies which are not declaration/cast shapes.
//
// Usage:
//   node build/javaSsDiffAudit.mjs                        # worktree vs base 3ca818ac31e
//   node build/javaSsDiffAudit.mjs --json
//   node build/javaSsDiffAudit.mjs --repo <dir> --base <ref> --target <ref>
//   node build/javaSsDiffAudit.mjs --self-test            # synthetic decl/cast/other probe repo
//
// Exit: 0 clean, 1 'other' lines found (or --strict-removed with removed-other), 3 self-test broken.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_BASE = '3ca818ac31e';
const GEN_MARKER = 'IT IS GENERATED AND WILL BE OVERWRITTEN';

const TYPE_WORDS = ['String', 'Object', 'Boolean', 'Integer', 'Long', 'Double', 'Float', 'Number', 'BigInteger', 'BigDecimal', 'CharSequence', 'String\\[\\]', 'Object\\[\\]', 'List', 'Map', 'Set', 'boolean', 'int', 'long', 'double', 'float', 'char', 'byte', 'short', 'var'];
const TYPE_ALT = TYPE_WORDS.join('|');
const DECL_RX = new RegExp('^[ \\t]*(?:(?:public|protected|private|static|final)[ \\t]+)*(?:' + TYPE_ALT + ')[ \\t]+(?:\\[[ \\t]*\\])?[A-Za-z_$][A-Za-z0-9_$]*[ \\t]*(?:=|;|\\()');
const TYPENORM_RX = new RegExp('\\b(?:' + TYPE_ALT + ')\\b', 'g');

function stripCasts(s) {
  return s
    .replace(/\(\(String\)[ \t]*([A-Za-z_$][A-Za-z0-9_$]*)\)/g, '$1')
    .replace(/\(String\)[ \t]*/g, '')
    .replace(/\(Object\)[ \t]+(?=[A-Za-z_$])/g, ''); // SS-05: `(Object) arg` dropped at String-typed wrapper positions
}
function typeNorm(s) {
  return s.replace(TYPENORM_RX, '<T>');
}
const stripEq = (r, a) => stripCasts(r).trim() === stripCasts(a).trim();
const typeEq = (r, a) => typeNorm(stripCasts(r)).trim() === typeNorm(stripCasts(a)).trim();
const isDecl = (s) => DECL_RX.test(s);

function git(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
}

// ---- unified diff parsing (-U0): per file, sibling hunks of removed/added lines ----
function parseDiff(out) {
  const files = new Map();
  let cur = null, hunk = null, newLine = 0;
  const ensure = (f) => { if (!files.has(f)) files.set(f, { path: f, hunks: [] }); return files.get(f); };
  for (const raw of out.split('\n')) {
    if (raw.startsWith('+++ ')) { cur = ensure(raw.startsWith('+++ b/') ? raw.slice(6) : raw.slice(4).trim()); hunk = null; continue; }
    if (raw.startsWith('--- ')) continue;
    if (raw.startsWith('@@')) {
      const m = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      newLine = m ? parseInt(m[1], 10) : 0;
      hunk = { removed: [], added: [] };
      cur.hunks.push(hunk);
      continue;
    }
    if (!cur || !hunk) continue;
    if (raw.startsWith('+')) { hunk.added.push({ text: raw.slice(1), line: newLine }); newLine++; }
    else if (raw.startsWith('-')) hunk.removed.push({ text: raw.slice(1) });
    else if (raw.startsWith(' ')) newLine++;
  }
  return files;
}

function headOf(repo, target, file) {
  try {
    if (target) return git(repo, ['show', `${target}:${file}`]).slice(0, 400);
    return fs.readFileSync(path.join(repo, file), 'utf8').slice(0, 400);
  } catch { return ''; }
}

function classify(repo, base, target, scope, strictRemoved) {
  const args = ['diff', '--no-color', '-U0', base];
  if (target) args.push(target);
  args.push('--', scope);
  const files = parseDiff(git(repo, args));

  const report = { files: [], skippedHandwritten: [], totals: { added: 0, removed: 0, declaration: 0, castRemoval: 0, other: 0, removedOther: 0 } };
  for (const [file, info] of files) {
    const generated = headOf(repo, target, file).includes(GEN_MARKER);
    if (!generated) { report.skippedHandwritten.push(file); continue; }
    const rec = { path: file, generated, added: 0, removed: 0, declaration: 0, castRemoval: 0, other: 0, removedOther: 0, otherLines: [], removedOtherLines: [] };
    for (const h of info.hunks) {
      rec.added += h.added.length;
      rec.removed += h.removed.length;
      const unusedR = [...h.removed.keys()];
      const takenA = new Set();
      const pair = (r, a, kind) => {
        unusedR.splice(unusedR.indexOf(r), 1); takenA.add(a);
        rec[kind]++; report.totals[kind]++;
      };
      // pass 1: strip-equality → castRemoval
      h.added.forEach((a, ai) => {
        const ri = unusedR.find((r) => stripEq(h.removed[r].text, a.text));
        if (ri === undefined) return;
        if (h.removed[ri].text.trim() === a.text.trim()) { // identical text (move/no-op): rank as declaration if shaped so
          pair(ri, ai, isDecl(a.text) ? 'declaration' : 'other');
        } else pair(ri, ai, 'castRemoval');
      });
      // pass 2: type-normalized equality → declaration
      h.added.forEach((a, ai) => {
        if (takenA.has(ai)) return;
        const ri = unusedR.find((r) => typeEq(h.removed[r].text, a.text));
        if (ri === undefined) return;
        pair(ri, ai, 'declaration');
      });
      // pass 3: positional pairing for the rest → any content change that is neither a
      // clean cast removal nor a pure type-position change is 'other'
      h.added.forEach((a, ai) => {
        if (takenA.has(ai) || !unusedR.length) return;
        const ri = unusedR[0];
        pair(ri, ai, stripEq(h.removed[ri].text, a.text) ? 'castRemoval' : typeEq(h.removed[ri].text, a.text) ? 'declaration' : 'other');
      });
      // leftovers: standalone classification (pure insertions)
      h.added.forEach((a, ai) => {
        if (takenA.has(ai)) return;
        const kind = isDecl(a.text) ? 'declaration' : 'other';
        rec[kind]++; report.totals[kind]++;
        if (kind === 'other') rec.otherLines.push({ line: a.line, text: a.text });
      });
      for (const ri of unusedR) {
        const r = h.removed[ri].text;
        if (!(isDecl(r) || stripCasts(r).trim() !== r.trim())) { rec.removedOther++; report.totals.removedOther++; rec.removedOtherLines.push({ text: r }); }
      }
    }
    report.files.push(rec);
  }
  report.fail = report.totals.other > 0 || (strictRemoved && report.totals.removedOther > 0);
  return report;
}

// ---- self-test ----
function selfTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ss16-diffaudit-'));
  const problems = [];
  const ok = (cond, msg) => { if (!cond) problems.push(msg); };
  const g = (args) => execFileSync('git', ['-C', tmp, ...args], { encoding: 'utf8' });
  const gc = (args) => g(['-c', 'user.email=ss16@test', '-c', 'user.name=ss16', ...args]);
  try {
    fs.mkdirSync(path.join(tmp, 'java', 'gen'), { recursive: true });
    const f = path.join(tmp, 'java', 'gen', 'Gen.java');
    const header = '// PLEASE DO NOT EDIT THIS FILE, IT IS ' + 'GENERATED AND WILL BE OVERWRITTEN:\npackage gen;\nclass Gen {\n';
    const v1 = header + [
      '    String a = (String) this.safeString(parsed, "k");',
      '    Object b = this.safeString(parsed, "k");',
      '    int c = 1;',
      '}\n',
    ].join('\n');
    fs.writeFileSync(f, v1);
    // hand-written file (no marker): tracked from the start, skipped by the audit
    const hand = path.join(tmp, 'java', 'gen', 'Hand.java');
    fs.writeFileSync(hand, 'package gen;\nclass Hand {\n    void h() {\n        if (x) { y(); }\n    }\n}\n');
    g(['init', '-q']); gc(['add', '-A']); gc(['commit', '-q', '-m', 'v1']);
    const ref1 = g(['rev-parse', 'HEAD']).trim();
    const v2 = header + [
      '    String a = this.safeString(parsed, "k");',   // cast-removal
      '    String b = this.safeString(parsed, "k");',   // declaration (Object→String)
      '    int c = 2;',                                   // other → must FAIL
      '}\n',
    ].join('\n');
    fs.writeFileSync(f, v2);
    fs.writeFileSync(hand, 'package gen;\nclass Hand {\n    void h() {\n        if (x) { z(); }\n    }\n}\n'); // would be 'other' if hand-written were audited — must be skipped
    const withOther = classify(tmp, ref1, null, 'java', false);
    ok(withOther.totals.castRemoval === 1, `expected 1 cast-removal, got ${withOther.totals.castRemoval}`);
    ok(withOther.totals.declaration === 1, `expected 1 declaration, got ${withOther.totals.declaration}`);
    ok(withOther.totals.other === 1, `expected 1 other, got ${withOther.totals.other}`);
    ok(withOther.fail === true, 'audit must FAIL on an other line');
    ok(withOther.skippedHandwritten.includes('java/gen/Hand.java'), `hand-written file must be skipped, got ${JSON.stringify(withOther.skippedHandwritten)}`);
    ok(!withOther.files.some((x) => x.path === 'java/gen/Hand.java'), 'hand-written file must not appear in classified files');
    const v3 = v2.replace('    int c = 2;', '    int c = 1;');
    fs.writeFileSync(f, v3);
    fs.writeFileSync(hand, 'package gen;\nclass Hand {\n    void h() {\n        if (x) { y(); }\n    }\n}\n');
    const clean = classify(tmp, ref1, null, 'java', false);
    ok(clean.totals.other === 0, `clean tree must have 0 other, got ${clean.totals.other}`);
    ok(clean.fail === false, 'clean tree must PASS');
    ok(clean.totals.castRemoval === 1 && clean.totals.declaration === 1, `clean tree categories: cast=${clean.totals.castRemoval} decl=${clean.totals.declaration}`);
  } catch (e) {
    problems.push(`self-test threw: ${e.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return problems;
}

function parseArgs(argv) {
  const o = { repo: process.cwd(), base: DEFAULT_BASE, target: null, scope: 'java', json: false, selfTest: false, strictRemoved: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = argv[++i];
    else if (a === '--base') o.base = argv[++i];
    else if (a === '--target') o.target = argv[++i];
    else if (a === '--scope') o.scope = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a === '--self-test') o.selfTest = true;
    else if (a === '--strict-removed') o.strictRemoved = true;
    else { console.error(`unknown flag: ${a}`); process.exit(2); }
  }
  return o;
}

function main() {
  const o = parseArgs(process.argv.slice(2));

  if (o.selfTest) {
    const problems = selfTest();
    if (problems.length) {
      console.error('SELF-TEST FAILED:');
      for (const p of problems) console.error('  - ' + p);
      process.exit(3);
    }
    console.log('SELF-TEST PASSED: declaration + cast-removal classified, other-line fails, hand-written skipped.');
    process.exit(0);
  }

  let baseSha;
  try { baseSha = git(o.repo, ['rev-parse', `${o.base}^{commit}`]).trim(); }
  catch { console.error(`cannot resolve base ${o.base} in repo ${o.repo}`); process.exit(2); }

  const report = classify(o.repo, baseSha, o.target, o.scope, o.strictRemoved);
  const result = { tool: 'javaSsDiffAudit', repo: o.repo, base: o.base, baseResolved: baseSha, target: o.target || '<worktree>', scope: o.scope, ...report };

  if (o.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    const L = [];
    L.push(`SS-16 diff audit | repo=${o.repo} base=${o.base} target=${result.target} scope=${o.scope}`);
    L.push(`generated files changed: ${report.files.length} | hand-written skipped: ${report.skippedHandwritten.length}`);
    L.push(`added=${report.totals.added} removed=${report.totals.removed} | declaration=${report.totals.declaration} cast-removal=${report.totals.castRemoval} OTHER=${report.totals.other}`);
    for (const f of report.files) {
      L.push(`  ${f.path}  +${f.added}/-${f.removed}  decl=${f.declaration} cast=${f.castRemoval} other=${f.other}`);
      for (const ol of f.otherLines.slice(0, 20)) L.push(`      OTHER  L${ol.line}: ${ol.text.trim().slice(0, 160)}`);
    }
    if (report.totals.removedOther) {
      L.push(`removed-without-pair non-decl lines: ${report.totals.removedOther}${o.strictRemoved ? ' (STRICT FAIL)' : ' (info; use --strict-removed to fail)'}`);
      for (const f of report.files) for (const rl of f.removedOtherLines.slice(0, 10)) L.push(`      REMOVED-OTHER  ${f.path}: ${rl.text.trim().slice(0, 160)}`);
    }
    L.push(report.fail ? 'FAIL' : 'PASS');
    process.stdout.write(L.join('\n') + '\n');
  }

  process.exit(report.fail ? 1 : 0);
}

main();
