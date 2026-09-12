#!/usr/bin/env node
// SS-16 preflight: integration scout for the safestring fan-out (branches ss-01..ss-15).
//
// Reports, for a set of branches off the campaign base:
//   * per-branch diff size (commits ahead, files, +/-, delta) and delivery status
//   * per-file OVERLAP: every file touched by >= 2 branches (conflict surface)
//   * a smallest-diff-first merge order (ascending total changed lines vs base)
//
// Read-only: only `git rev-parse / rev-list / diff / status` are executed.
//
// Usage:
//   node build/javaSsPreflight.mjs                                  # ss-01..ss-15, cwd repo
//   node build/javaSsPreflight.mjs ss-01 ss-04 --json
//   node build/javaSsPreflight.mjs --base <ref> --repo <worktree> --scope java,build
//   node build/javaSsPreflight.mjs --require-all                    # exit 1 if any branch is not delivered
//
// Options:
//   --base <ref>         base commit (default 3ca818ac31e)
//   --repo <path>        any worktree of the shared repo (default: cwd)
//   --scope <a,b,...>    comma-separated path filters for the diff (default: whole tree)
//   --worktrees <dir>    parent dir of per-branch worktrees, for uncommitted-work detection
//                        (default /root/worktrees; missing dirs are ignored)
//   --json               print machine JSON only
//   --require-all        exit 1 unless every requested branch is delivered
//
// Delivery status: delivered = >=1 commit ahead of base AND non-empty diff vs base.
//                  no-work   = branch exists but sits at base (no commits, no diff).
//                  pending   = branch does not exist yet.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE = '3ca818ac31e';
const DEFAULT_WORKTREES = '/root/worktrees';

function parseArgs(argv) {
  const o = { base: DEFAULT_BASE, repo: process.cwd(), scopes: [], worktrees: DEFAULT_WORKTREES, json: false, requireAll: false, branches: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--base') o.base = argv[++i];
    else if (a === '--repo') o.repo = argv[++i];
    else if (a === '--scope') o.scopes.push(...String(argv[++i]).split(',').filter(Boolean));
    else if (a === '--worktrees') o.worktrees = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a === '--require-all') o.requireAll = true;
    else if (a.startsWith('-')) { console.error(`unknown flag: ${a}`); process.exit(2); }
    else o.branches.push(a);
  }
  if (!o.branches.length) o.branches = Array.from({ length: 15 }, (_, i) => `ss-${String(i + 1).padStart(2, '0')}`);
  return o;
}

function git(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

function branchExists(repo, ref) {
  try { git(repo, ['rev-parse', '--verify', '--quiet', `refs/heads/${ref}^{commit}`]); return true; }
  catch { return false; }
}

function commitsAhead(repo, base, ref) {
  return parseInt(git(repo, ['rev-list', '--count', `${base}..${ref}`]).trim(), 10) || 0;
}

// { added, deleted, delta, files: [{path, added, deleted, delta, binary}] }
function branchDiff(repo, base, ref, scopes) {
  const args = ['diff', '--numstat', '--no-color', base, ref];
  if (scopes.length) args.push('--', ...scopes);
  const out = git(repo, args);
  const files = [];
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    const binary = parts[0] === '-' || parts[1] === '-';
    const added = binary ? 0 : parseInt(parts[0], 10) || 0;
    const deleted = binary ? 0 : parseInt(parts[1], 10) || 0;
    files.push({ path: parts.slice(2).join('\t'), added, deleted, delta: added + deleted, binary });
  }
  const total = files.reduce((n, f) => n + f.delta, 0);
  return { added: files.reduce((n, f) => n + f.added, 0), deleted: files.reduce((n, f) => n + f.deleted, 0), delta: total, files };
}

function uncommittedCount(repo, worktreesDir, ref) {
  const dir = path.join(worktreesDir, ref);
  try { fs.accessSync(path.join(dir, '.git')); } catch { return null; }
  try {
    return git(dir, ['status', '--porcelain']).split('\n').filter((l) => l.trim()).length;
  } catch { return null; }
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  let baseSha;
  try { baseSha = git(o.repo, ['rev-parse', `${o.base}^{commit}`]).trim(); }
  catch { console.error(`cannot resolve base ${o.base} in repo ${o.repo}`); process.exit(2); }

  const delivered = [], pending = [], noWork = [];
  for (const b of o.branches) {
    if (!branchExists(o.repo, b)) { pending.push({ branch: b }); continue; }
    const commits = commitsAhead(o.repo, baseSha, b);
    const diff = branchDiff(o.repo, baseSha, b, o.scopes);
    const dirty = uncommittedCount(o.repo, o.worktrees, b);
    const rec = { branch: b, commitsAhead: commits, files: diff.files.length, added: diff.added, deleted: diff.deleted, delta: diff.delta, uncommittedFiles: dirty, fileList: diff.files.map((f) => f.path) };
    if (commits > 0 && diff.delta > 0) delivered.push(rec);
    else noWork.push(rec);
  }

  // per-file overlap across delivered branches
  const byFile = new Map();
  for (const rec of delivered) {
    const diff = branchDiff(o.repo, baseSha, rec.branch, o.scopes);
    for (const f of diff.files) {
      if (!byFile.has(f.path)) byFile.set(f.path, []);
      byFile.get(f.path).push({ branch: rec.branch, added: f.added, deleted: f.deleted, delta: f.delta });
    }
  }
  const overlaps = [...byFile.entries()]
    .filter(([, v]) => v.length >= 2)
    .map(([file, v]) => ({
      file,
      branches: v.map((x) => x.branch),
      touchedBy: v.length,
      totalDelta: v.reduce((n, x) => n + x.delta, 0),
    }))
    .sort((a, b) => b.touchedBy - a.touchedBy || b.totalDelta - a.totalDelta || a.file.localeCompare(b.file));

  // smallest-diff-first merge order
  const order = [...delivered].sort((a, b) => a.delta - b.delta || a.commitsAhead - b.commitsAhead || a.branch.localeCompare(b.branch)).map((r) => r.branch);

  const result = {
    tool: 'javaSsPreflight',
    repo: o.repo,
    base: o.base,
    baseResolved: baseSha,
    scopes: o.scopes.length ? o.scopes : ['<whole tree>'],
    requested: o.branches,
    counts: { delivered: delivered.length, pending: pending.length, noWork: noWork.length },
    delivered,
    pending: pending.map((p) => p.branch),
    noWork: noWork.map((n) => n.branch),
    overlaps,
    mergeOrder: order,
    mergeOrderNote: 'ascending total changed lines (added+deleted) vs base; ties: fewer commits, then name',
  };

  if (o.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    const L = [];
    L.push(`SS-16 preflight | repo=${o.repo} base=${o.base} scope=${result.scopes.join(',')}`);
    L.push(`branches: ${o.branches.length} requested | ${delivered.length} delivered | ${noWork.length} no-work | ${pending.length} pending`);
    L.push('');
    L.push('-- per-branch --');
    for (const r of [...delivered].sort((a, b) => a.branch.localeCompare(b.branch))) {
      L.push(`  ${r.branch}  DELIVERED  commits=${r.commitsAhead} files=${r.files} +${r.added}/-${r.deleted} delta=${r.delta}${r.uncommittedFiles ? `  uncommitted!=${r.uncommittedFiles}` : ''}`);
    }
    for (const r of noWork) L.push(`  ${r.branch}  NO-WORK    commits=${r.commitsAhead} files=0${r.uncommittedFiles ? `  uncommitted!=${r.uncommittedFiles}` : ''}`);
    for (const p of pending) L.push(`  ${p.branch}  PENDING    (branch absent)`);
    L.push('');
    L.push(`-- per-file overlap (${overlaps.length} file(s) touched by >=2 branches) --`);
    for (const ov of overlaps) {
      L.push(`  ${ov.file}  [${ov.touchedBy} branches, delta=${ov.totalDelta}]`);
      for (const br of ov.branches) L.push(`      ${br}`);
    }
    if (!overlaps.length) L.push('  (none)');
    L.push('');
    L.push('-- smallest-diff-first merge order --');
    order.forEach((b, i) => {
      const r = delivered.find((x) => x.branch === b);
      L.push(`  ${i + 1}. ${b}  delta=${r.delta} files=${r.files}`);
    });
    if (!order.length) L.push('  (no delivered branches yet)');
    L.push('');
    L.push(`NOTE: ${result.mergeOrderNote}`);
    L.push('NOTE: re-run this after every landed branch; overlap list is the conflict surface.');
    process.stdout.write(L.join('\n') + '\n');
  }

  if (o.requireAll && (pending.length || noWork.length)) process.exit(1);
  process.exit(0);
}

main();
