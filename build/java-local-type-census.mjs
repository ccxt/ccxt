#!/usr/bin/env node
// DEV TOOL — campaign instrumentation for the Java nested-types typing campaign (JN-24).
// NOT wired into any published build; safe to exclude from release PRs.
//
// Census of GENERATED Java local declarations by declared type, for the campaign's
// five scopes (exchanges/, exchanges/pro/, exchanges/prediction/, java/tests,
// java/lib/src/test). Also counts method return types and checkcast types, so any
// agent's "before/after" claim can be recomputed exactly.
//
// Usage:
//   node build/java-local-type-census.mjs                    # human table, default scopes
//   node build/java-local-type-census.mjs --json out.json    # machine-readable dump
//   node build/java-local-type-census.mjs --compare base.json  # delta table vs a saved dump
//   node build/java-local-type-census.mjs --root <dir>       # override scopes (repeatable)
//   node build/java-local-type-census.mjs --top 60
//
// Counting rules (see java-decl-tools-lib.mjs for the tokenizer):
//   * local    = declaration line at brace depth >= 2 (inside a method/lambda body)
//   * field    = declaration line at brace depth == 1 (class body) — reported apart
//   * only files whose first lines carry the GENERATED marker count as "gen"; other
//     files are still scanned but counted in the "hand" column.
//
// Exit code: 0 normally; 2 on usage/IO errors.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lex, splitComment, matchDecl, matchMethodSig, braceDepths, SENTINEL } from './java-decl-tools-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');

// Each scope: dir + recursive flag. exchanges/ is scanned NON-recursively so the
// pro/ and prediction/ subdirectories are not double-counted.
const DEFAULT_SCOPES = [
  { dir: 'java/lib/src/main/java/io/github/ccxt/exchanges', recursive: false },
  { dir: 'java/lib/src/main/java/io/github/ccxt/exchanges/pro', recursive: true },
  { dir: 'java/lib/src/main/java/io/github/ccxt/exchanges/prediction', recursive: true },
  { dir: 'java/tests/src/main/java', recursive: true },
  { dir: 'java/lib/src/test/java', recursive: true },
];

function parseArgs(argv) {
  const opts = { scopes: [], json: null, compare: null, top: 40, quiet: false, byFile: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') opts.scopes.push(argv[++i]);
    else if (a === '--json') opts.json = argv[++i];
    else if (a === '--compare') opts.compare = argv[++i];
    else if (a === '--top') opts.top = parseInt(argv[++i], 10);
    else if (a === '--by-file') opts.byFile = true;
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '-h' || a === '--help') {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 24).join('\n'));
      process.exit(0);
    } else {
      console.error(`unknown option: ${a}`);
      process.exit(2);
    }
  }
  return opts;
}

function listJavaFiles(dir, recursive = true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) {
        for (const f of listJavaFiles(p, true)) out.push(f);
      }
    } else if (entry.isFile() && entry.name.endsWith('.java')) out.push(p);
  }
  out.sort();
  return out;
}

const GENERATED_RE = /GENERATED/;

function censusFile(file, scope) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const generated = lines.slice(0, 30).some((l) => GENERATED_RE.test(l));
  const depths = braceDepths(lines);
  const locals = new Map();
  const fields = new Map();
  const returns = new Map();
  const casts = new Map();
  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    if (raw.trim() === '') continue;
    const { code } = splitComment(raw);
    if (code.trim() === '') continue;
    const tokens = lex(code);
    if (tokens.length === 0) continue;
    const depth = depths[li];
    const decl = matchDecl(tokens);
    if (decl && decl.name !== '_') {
      // exclude static constants style UPPER names? generated locals are lowerCamelCase;
      // matchDecl already requires lowercase start.
      const key = canonTypeText(decl.typeText);
      if (depth >= 2) locals.set(key, (locals.get(key) || 0) + 1);
      else fields.set(key, (fields.get(key) || 0) + 1);
    }
    const sig = matchMethodSig(tokens);
    if (sig) {
      const key = canonTypeText(sig.returnType);
      returns.set(key, (returns.get(key) || 0) + 1);
    }
    // cast census: reuse the lib's detection by scanning for `(Type)` in cast context
    for (const c of findCasts(tokens)) casts.set(c, (casts.get(c) || 0) + 1);
  }
  return { scope, file, generated, locals, fields, returns, casts };
}

function canonTypeText(text) {
  // join without spaces; normalise generic argument spacing: Map<String, Object> -> Map<String,Object>
  return text.replace(/\s+/g, '');
}

// Independent cast scanner (mirrors the lib's rules; kept local so the census does
// not depend on paircheck internals).
function findCasts(tokens) {
  const CAST_PREV_OK = new Set(['(', '=', ',', ':', '?', '!', '&', '|', '+', '-', '*', '/', '%', '<', '>', '[', '{', ';', '~', '^']);
  const DOTTED = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/;
  const PRIMS = new Set(['int', 'long', 'double', 'boolean', 'float', 'short', 'char', 'byte', 'void']);
  const WRAPS = new Set(['Object', 'String', 'Long', 'Double', 'Boolean', 'Integer', 'Number', 'Float', 'Short', 'Byte', 'Character', 'Void']);
  const isName = (t) => {
    if (t === undefined) return false;
    if (PRIMS.has(t) || WRAPS.has(t)) return true;
    if (!DOTTED.test(t)) return false;
    const segs = t.split('.');
    return /^[A-Z]/.test(segs[segs.length - 1]);
  };
  const parseT = (i) => {
    if (!isName(tokens[i])) return null;
    let j = i + 1;
    if (tokens[j] === '<') {
      let depth = 1;
      j++;
      while (j < tokens.length && depth > 0) {
        const s = tokens[j];
        if (s === '<') depth++;
        else if (s === '>') depth--;
        else if (s === ',' || s === '?' || s === '&' || DOTTED.test(s)) { /* ok */ }
        else return null;
        j++;
      }
      if (depth !== 0) return null;
    }
    while (tokens[j] === '[' && tokens[j + 1] === ']') j += 2;
    return j;
  };
  const valueStart = (t) =>
    t !== undefined &&
    (t === '(' || t === '!' || t === '~' || t === '-' || t === '+' || /^["']/.test(t) || /^\d/.test(t) || DOTTED.test(t));
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== '(') continue;
    const prev = tokens[i - 1];
    if (!(prev === undefined || prev === 'return' || CAST_PREV_OK.has(prev))) continue;
    const end = parseT(i + 1);
    if (end === null || tokens[end] !== ')' || !valueStart(tokens[end + 1])) continue;
    out.push(tokens.slice(i + 1, end).join(''));
  }
  return out;
}

function emptyBucket() {
  return { files: 0, genFiles: 0, locals: new Map(), fields: new Map(), returns: new Map(), casts: new Map() };
}

function addMaps(dst, src) {
  for (const [k, v] of src) dst.set(k, (dst.get(k) || 0) + v);
}

function sumMap(m) {
  let s = 0;
  for (const v of m.values()) s += v;
  return s;
}

function mapToObj(m) {
  const o = {};
  for (const [k, v] of [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) o[k] = v;
  return o;
}

function objToMap(o) {
  return new Map(Object.entries(o || {}));
}

function run() {
  const opts = parseArgs(process.argv.slice(2));
  const scopes = opts.scopes.length
    ? opts.scopes.map((s) => ({ dir: s, recursive: true }))
    : DEFAULT_SCOPES;
  const byScope = new Map();
  const total = emptyBucket();
  const fileList = [];
  for (const scope of scopes) {
    const label = scope.dir;
    const abs = path.isAbsolute(scope.dir) ? scope.dir : path.join(REPO_ROOT, scope.dir);
    const bucket = emptyBucket();
    for (const file of listJavaFiles(abs, scope.recursive)) {
      const res = censusFile(file, label);
      if (opts.byFile) {
        fileList.push({ file: path.relative(REPO_ROOT, file), localTotal: sumMap(res.locals), generated: res.generated });
      }
      bucket.files++;
      if (res.generated) bucket.genFiles++;
      addMaps(bucket.locals, res.locals);
      addMaps(bucket.fields, res.fields);
      addMaps(bucket.returns, res.returns);
      addMaps(bucket.casts, res.casts);
      total.files++;
      if (res.generated) total.genFiles++;
      addMaps(total.locals, res.locals);
      addMaps(total.fields, res.fields);
      addMaps(total.returns, res.returns);
      addMaps(total.casts, res.casts);
    }
    byScope.set(label, bucket);
  }

  const result = {
    tool: 'java-local-type-census',
    generatedAt: new Date().toISOString(),
    scopes: {},
  };
  for (const [scope, b] of byScope) {
    result.scopes[scope] = {
      files: b.files,
      generatedFiles: b.genFiles,
      localTotal: sumMap(b.locals),
      locals: mapToObj(b.locals),
      fieldTotal: sumMap(b.fields),
      fields: mapToObj(b.fields),
      methodReturnTotal: sumMap(b.returns),
      methodReturns: mapToObj(b.returns),
      castTotal: sumMap(b.casts),
      casts: mapToObj(b.casts),
    };
  }
  result.total = {
    files: total.files,
    generatedFiles: total.genFiles,
    localTotal: sumMap(total.locals),
    locals: mapToObj(total.locals),
    fieldTotal: sumMap(total.fields),
    fields: mapToObj(total.fields),
    methodReturnTotal: sumMap(total.returns),
    methodReturns: mapToObj(total.returns),
    castTotal: sumMap(total.casts),
    casts: mapToObj(total.casts),
  };

  if (!opts.quiet) {
    if (opts.compare) printCompare(opts.compare, result, opts.top);
    else printReport(result, opts.top);
    if (opts.byFile) {
      fileList.sort((a, b) => b.localTotal - a.localTotal);
      console.log('');
      console.log(`TOP FILES BY LOCAL DECLARATIONS (top ${opts.top})`);
      for (const f of fileList.slice(0, opts.top)) {
        console.log(`  ${String(f.localTotal).padStart(6)}  ${f.generated ? 'gen ' : 'hand'}  ${f.file}`);
      }
    }
  }
  if (opts.json) {
    fs.mkdirSync(path.dirname(path.resolve(opts.json)), { recursive: true });
    fs.writeFileSync(path.resolve(opts.json), JSON.stringify(result, null, 2) + '\n');
    if (!opts.quiet) console.log(`\nJSON written to ${opts.json}`);
  }
}

function printReport(result, top) {
  console.log('java-local-type-census — generated Java local declarations by declared type');
  console.log(`repo: ${REPO_ROOT}`);
  console.log('');
  console.log('scope                                                        files   gen   locals  fields  returns   casts');
  for (const [scope, s] of Object.entries(result.scopes)) {
    console.log(
      `${scope.padEnd(58)} ${String(s.files).padStart(6)} ${String(s.generatedFiles).padStart(5)} ${String(s.localTotal).padStart(8)} ${String(s.fieldTotal).padStart(7)} ${String(s.methodReturnTotal).padStart(8)} ${String(s.castTotal).padStart(7)}`
    );
  }
  const t = result.total;
  console.log(
    `${'TOTAL'.padEnd(58)} ${String(t.files).padStart(6)} ${String(t.generatedFiles).padStart(5)} ${String(t.localTotal).padStart(8)} ${String(t.fieldTotal).padStart(7)} ${String(t.methodReturnTotal).padStart(8)} ${String(t.castTotal).padStart(7)}`
  );
  console.log('');
  console.log(`LOCAL DECLARATIONS BY DECLARED TYPE (total; top ${top})`);
  printMapTable(objToMap(t.locals), t.localTotal, top);
  console.log('');
  console.log(`METHOD RETURN TYPES (total; top ${top})`);
  printMapTable(objToMap(t.methodReturns), t.methodReturnTotal, top);
  console.log('');
  console.log(`CASTS BY TYPE (total; top ${top})`);
  printMapTable(objToMap(t.casts), t.castTotal, top);
}

function printMapTable(map, sum, top) {
  const rows = [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const width = Math.max(6, ...rows.map(([k]) => k.length));
  for (const [k, v] of rows.slice(0, top)) {
    console.log(`  ${k.padEnd(width)}  ${String(v).padStart(8)}  (${((v / (sum || 1)) * 100).toFixed(2)}%)`);
  }
  if (rows.length > top) console.log(`  ... ${rows.length - top} more types`);
  console.log(`  ${'TOTAL'.padEnd(width)}  ${String(sum).padStart(8)}`);
}

function printCompare(basePath, result, top) {
  const base = JSON.parse(fs.readFileSync(path.resolve(basePath), 'utf8'));
  console.log(`java-local-type-census — DELTA vs ${basePath}`);
  console.log(`  (baseline generatedAt: ${base.generatedAt || 'n/a'})`);
  console.log('');
  const scopes = new Set([...Object.keys(base.scopes || {}), ...Object.keys(result.scopes)]);
  const note = (msg) => console.log(`  ${msg}`);
  for (const scope of scopes) {
    const b = base.scopes?.[scope] || { localTotal: 0, locals: {} };
    const c = result.scopes[scope] || { localTotal: 0, locals: {} };
    const delta = c.localTotal - b.localTotal;
    const sign = delta > 0 ? '+' : '';
    console.log(`${scope}`);
    console.log(`  locals total: ${b.localTotal} -> ${c.localTotal} (${sign}${delta})`);
    const types = new Set([...Object.keys(b.locals || {}), ...Object.keys(c.locals || {})]);
    const rows = [];
    for (const type of types) {
      const bv = b.locals?.[type] || 0;
      const cv = c.locals?.[type] || 0;
      if (bv !== cv) rows.push([type, bv, cv, cv - bv]);
    }
    rows.sort((a, bb) => Math.abs(bb[3]) - Math.abs(a[3]) || a[0].localeCompare(bb[0]));
    const width = Math.max(6, ...rows.map(([k]) => k.length));
    for (const [type, bv, cv, d] of rows.slice(0, top)) {
      console.log(`    ${type.padEnd(width)}  ${String(bv).padStart(7)} -> ${String(cv).padStart(7)}  ${d > 0 ? '+' : ''}${d}`);
    }
    if (rows.length > top) note(`... ${rows.length - top} more changed types`);
    if (rows.length === 0) note('(no per-type changes)');
  }
  // grand total
  const bt = base.total?.localTotal ?? 0;
  const ct = result.total.localTotal;
  console.log(`GRAND TOTAL locals: ${bt} -> ${ct} (${ct - bt >= 0 ? '+' : ''}${ct - bt})`);
}

run();
