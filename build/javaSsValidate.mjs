#!/usr/bin/env node
// SS-16 validator: for a tree (a ccxt worktree or any git tree), measure the safestring KPIs
// and run the campaign's ternary gate.
//
// Counts (scope default java/lib, which reproduces the BRIEF baseline exactly):
//   objectLocals   lines `Object <name> = this.safeString…`          baseline 2783
//   stringLocals   lines `String <name> = this.safeString…`          baseline 5838
//   stringCasts    occurrences of `(String) this.safeString…`        baseline 454
//   wrappedCasts   occurrences of `((String)id)` (no space)          baseline 1318
//
// Gate: FAIL (exit 1) if any ADDED line vs `--base` under java/ contains a literal ` ? `
// (the campaign's inline-ternary rule). Recipe-equivalent to:
//   git diff <base> -- java | grep '^+' | grep -v '^+++' | grep -c ' ? '
//
// Usage:
//   node build/javaSsValidate.mjs                 # validate cwd worktree vs campaign base
//   node build/javaSsValidate.mjs --json
//   node build/javaSsValidate.mjs --repo <dir> --base <ref> [--target <ref>]
//   node build/javaSsValidate.mjs --scope java/lib
//   node build/javaSsValidate.mjs --self-test     # inject a ternary in a scratch git repo; must FAIL
//
// Exit: 0 pass, 1 gate failure (ternaries found), 2 usage/ref error, 3 self-test broken.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_BASE = '3ca818ac31e';

// ------- count recipes (literal; calibrated against BRIEF) -------
const RX = {
  objectLocals: /^[ \t]*Object[ \t]+[A-Za-z_$][A-Za-z0-9_$]*[ \t]*=[ \t]*this\.safeString/gm,
  stringLocals: /^[ \t]*String[ \t]+[A-Za-z_$][A-Za-z0-9_$]*[ \t]*=[ \t]*this\.safeString/gm,
  stringCasts: /\(String\)[ \t]*this\.safeString/g,
  wrappedCasts: /\(\(String\)[A-Za-z_$][A-Za-z0-9_$]*\)/g,
  wrappedCastsSpaced: /\(\(String\)[ \t]+[A-Za-z_$][A-Za-z0-9_$]*\)/g,
};

function git(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

function walkJavaFiles(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkJavaFiles(p, acc);
    else if (e.isFile() && e.name.endsWith('.java')) acc.push(p);
  }
  return acc;
}

function countMatches(text, re) {
  let n = 0;
  for (const _ of text.matchAll(re)) n++;
  return n;
}

function computeCounts(repo, scopeRel) {
  const dir = path.join(repo, scopeRel);
  const out = { scope: scopeRel, files: 0, objectLocals: 0, stringLocals: 0, stringCasts: 0, wrappedCasts: 0, wrappedCastsSpaced: 0 };
  if (!fs.existsSync(dir)) return out;
  for (const f of walkJavaFiles(dir)) {
    const text = fs.readFileSync(f, 'utf8');
    out.files++;
    out.objectLocals += countMatches(text, RX.objectLocals);
    out.stringLocals += countMatches(text, RX.stringLocals);
    out.stringCasts += countMatches(text, RX.stringCasts);
    out.wrappedCasts += countMatches(text, RX.wrappedCasts);
    out.wrappedCastsSpaced += countMatches(text, RX.wrappedCastsSpaced);
  }
  out.wrappedCastsAny = out.wrappedCasts + out.wrappedCastsSpaced;
  return out;
}

// Added-line ternary audit. target === null → diff base against the worktree.
function ternaryAudit(repo, base, target, diffScope = 'java') {
  const args = ['diff', '--no-color', '-U0', base];
  if (target) args.push(target);
  args.push('--', diffScope);
  const out = git(repo, args);
  const res = { scope: diffScope, base, target: target || '<worktree>', addedLines: 0, removedLines: 0, ternaryCount: 0, ternaryLines: [] };
  let curFile = null;
  for (const raw of out.split('\n')) {
    if (raw.startsWith('+++ ')) { curFile = raw.startsWith('+++ b/') ? raw.slice(6) : raw.slice(4).trim(); continue; }
    if (raw.startsWith('--- ')) continue;
    if (raw.startsWith('+') && !raw.startsWith('+++')) {
      res.addedLines++;
      const content = raw.slice(1);
      if (content.includes(' ? ')) {
        res.ternaryCount++;
        res.ternaryLines.push({ file: curFile, text: content });
      }
    } else if (raw.startsWith('-') && !raw.startsWith('---')) {
      res.removedLines++;
    }
  }
  return res;
}

// ------- self-test: injection in a scratch git repo -------
function selfTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ss16-validate-'));
  const problems = [];
  const ok = (cond, msg) => { if (!cond) problems.push(msg); };
  const g = (args) => execFileSync('git', ['-C', tmp, ...args], { encoding: 'utf8' });
  const gc = (args) => g(['-c', 'user.email=ss16@test', '-c', 'user.name=ss16', ...args]);
  try {
    fs.mkdirSync(path.join(tmp, 'java', 'gen'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'build'), { recursive: true });
    const f = path.join(tmp, 'java', 'gen', 'A.java');
    fs.writeFileSync(f, 'package gen;\nclass A {\n    String a = this.safeString(parsed, "k");\n}\n');
    g(['init', '-q']);
    gc(['add', '-A']);
    gc(['commit', '-q', '-m', 'base']);
    const base = g(['rev-parse', 'HEAD']).trim();

    // 1) clean tree: audit passes, counts are as written
    let audit = ternaryAudit(tmp, base, null, 'java');
    ok(audit.ternaryCount === 0 && audit.addedLines === 0, `clean audit expected 0 added / 0 ternary, got ${audit.addedLines}/${audit.ternaryCount}`);
    let counts = computeCounts(tmp, 'java');
    ok(counts.stringLocals === 1 && counts.objectLocals === 0 && counts.stringCasts === 0 && counts.wrappedCasts === 0,
      `clean counts expected 1/0/0/0, got ${counts.stringLocals}/${counts.objectLocals}/${counts.stringCasts}/${counts.wrappedCasts}`);

    // 2) inject one ternary line + one Object decl + one (String) cast + one ((String)x) wrap
    fs.appendFileSync(f, '        String ss16Probe = flag ? "a" : "b";\n');
    audit = ternaryAudit(tmp, base, null, 'java');
    ok(audit.ternaryCount === 1, `INJECTED ternary must FAIL with count 1, got ${audit.ternaryCount}`);
    ok(audit.ternaryLines.length === 1 && audit.ternaryLines[0].file === 'java/gen/A.java',
      `injected ternary must be attributed to java/gen/A.java, got ${JSON.stringify(audit.ternaryLines)}`);

    fs.appendFileSync(f, '        Object ss16Obj = this.safeString(parsed, "k");\n');
    fs.appendFileSync(f, '        String ss16Cast = (String) this.safeString(parsed, "k");\n');
    fs.appendFileSync(f, '        String ss16Wrap = ((String)ss16Obj);\n');
    counts = computeCounts(tmp, 'java');
    ok(counts.objectLocals === 1, `objectLocals expected 1, got ${counts.objectLocals}`);
    ok(counts.stringCasts === 1, `stringCasts expected 1, got ${counts.stringCasts}`);
    ok(counts.wrappedCasts === 1, `wrappedCasts expected 1, got ${counts.wrappedCasts}`);
    ok(counts.stringLocals === 1, `stringLocals must stay 1 (cast/wrap lines are not clean decls), got ${counts.stringLocals}`);

    // 3) revert the ternary → gate passes again
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('        String ss16Probe = flag ? "a" : "b";\n', ''));
    audit = ternaryAudit(tmp, base, null, 'java');
    ok(audit.ternaryCount === 0, `after revert, ternaryCount must be 0, got ${audit.ternaryCount}`);
  } catch (e) {
    problems.push(`self-test threw: ${e.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return problems;
}

function parseArgs(argv) {
  const o = { repo: process.cwd(), base: DEFAULT_BASE, target: null, scopes: ['java/lib', 'java'], json: false, selfTest: false };
  const requested = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') o.repo = argv[++i];
    else if (a === '--base') o.base = argv[++i];
    else if (a === '--target') o.target = argv[++i];
    else if (a === '--scope') requested.push(argv[++i]);
    else if (a === '--json') o.json = true;
    else if (a === '--self-test') o.selfTest = true;
    else { console.error(`unknown flag: ${a}`); process.exit(2); }
  }
  if (requested.length) o.scopes = requested;
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
    console.log('SELF-TEST PASSED: injected ternary detected (exit-worthy), clean tree passes, counts exact.');
    process.exit(0);
  }

  let baseSha;
  try { baseSha = git(o.repo, ['rev-parse', `${o.base}^{commit}`]).trim(); }
  catch { console.error(`cannot resolve base ${o.base} in repo ${o.repo}`); process.exit(2); }

  const counts = o.scopes.map((s) => computeCounts(o.repo, s));
  const ternary = ternaryAudit(o.repo, baseSha, o.target, 'java');
  const pass = ternary.ternaryCount === 0;

  const result = {
    tool: 'javaSsValidate',
    repo: o.repo,
    base: o.base,
    baseResolved: baseSha,
    counts,
    ternary,
    pass,
  };

  if (o.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    const L = [];
    L.push(`SS-16 validate | repo=${o.repo} base=${o.base} (${baseSha.slice(0, 11)}) target=${ternary.target}`);
    L.push('-- counts --');
    for (const c of counts) {
      L.push(`  scope=${c.scope}  files=${c.files}  Object-locals=${c.objectLocals}  String-locals=${c.stringLocals}  (String)-casts=${c.stringCasts}  ((String)x)=${c.wrappedCasts} (+spaced ${c.wrappedCastsSpaced})`);
    }
    L.push('-- ternary gate (vs base, java/) --');
    L.push(`  added lines=${ternary.addedLines}  removed lines=${ternary.removedLines}  ternaries( ' ? ' )=${ternary.ternaryCount}`);
    for (const t of ternary.ternaryLines.slice(0, 50)) L.push(`    TERNARY ${t.file}: ${t.text.trim().slice(0, 160)}`);
    L.push(`  ${pass ? 'PASS' : 'FAIL'}`);
    process.stdout.write(L.join('\n') + '\n');
  }

  process.exit(pass ? 0 : 1);
}

main();
