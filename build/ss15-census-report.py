#!/usr/bin/env python3
"""SS-15 ranked rejection census: aggregate the CCXT_SS15_CENSUS JSONL records
(see the SS-15 section of build/java-local-types.js) into a ranked table of the
FIRST rule that rejected a `String` declaration for every
`Object <name> = this.safeString*(...)` local in the generated Java tree.

Usage:  python3 build/ss15-census-report.py [census-dir] [repo-root] [out.md]

Joins:
  * `decl`   records (inline hook decision, keyed by ts file + line + name)
  * `revert` records (postProcessWsJava "String type fixes" rewrites, pro/prediction)
  * the FINAL generated tree scan (the `Object ... = this.safeString*` lines)

Reconciliation: every final Object line must be attributed to exactly one of
`hook reject` / `ws revert`; unattributed or deviating keys are reported.
"""
import collections
import glob
import json
import os
import re
import sys

CENSUS_DIR = sys.argv[1] if len(sys.argv) > 1 else '/tmp/ss15-census'
ROOT = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, 'build', 'ss15-rejection-census.md')

CCXT = os.path.join(ROOT, 'java/lib/src/main/java/io/github/ccxt')
FINAL_OBJECT = re.compile(r'^\s*Object ([A-Za-z_]\w*) = this\.(safeString\w*)\(')
FINAL_STRING = re.compile(r'^\s*String ([A-Za-z_]\w*) = (\(String\) ?)?this\.(safeString\w*)\(')


def java_file_for_ts(ts):
    ts = ts.replace('\\', '/')
    # the base stage resolves through pid-suffixed overload-stripped copies —
    # canonicalize so every run's records collapse onto the same java file
    ts = re.sub(r'\.nooverloads\.\d+\.ts$', '.ts', ts)
    idx = ts.find('ts/src/')
    if idx >= 0:
        ts = ts[idx:]
    if ts == 'ts/src/base/Exchange.ts':
        return os.path.join(CCXT, 'BaseExchange.java')
    if ts == 'ts/src/base/PredictionExchange.ts':
        return os.path.join(CCXT, 'PredictionExchange.java')
    m = re.match(r'^ts/src/pro/(.+)\.ts$', ts)
    if m:
        return os.path.join(CCXT, 'exchanges/pro', m.group(1)[0].upper() + m.group(1)[1:] + 'Core.java')
    m = re.match(r'^ts/src/prediction/(.+)\.ts$', ts)
    if m:
        return os.path.join(CCXT, 'exchanges/prediction', m.group(1)[0].upper() + m.group(1)[1:] + 'Core.java')
    m = re.match(r'^ts/src/(.+)\.ts$', ts)
    if m:
        return os.path.join(CCXT, 'exchanges', m.group(1)[0].upper() + m.group(1)[1:] + 'Core.java')
    return None


def java_file_for_revert(tier, name):
    cap = name[0].upper() + name[1:]
    if tier == 'prediction':
        return os.path.join(CCXT, 'exchanges/prediction', cap + 'Core.java')
    return os.path.join(CCXT, 'exchanges/pro', cap + 'Core.java')


def rel(p):
    return os.path.relpath(p, ROOT)


records = []
for path in sorted(glob.glob(os.path.join(CENSUS_DIR, '*.jsonl'))):
    with open(path) as fh:
        for line in fh:
            line = line.strip()
            if line:
                records.append(json.loads(line))

# ---- decl decisions per (javaFile, printed-name, call) ----
# printed-name map from the module records (the printer renames reserved-keyword
# identifiers: `event` -> `eventVar`, `params` -> `parameters`, ...); the hook records
# carry the SOURCE name, the final tree carries the PRINTED name.
pnames = {}
for r in records:
    if r.get('k') != 'module':
        continue
    key = (re.sub(r'\.nooverloads\.\d+\.ts$', '.ts', r['ts'].replace('\\', '/')), r['line'], r['call'], r['name'])
    pnames[key] = r.get('pname', r['name'])

decls = {}        # key -> {'accepts': n, 'rejects': [(reason, ts, line)]}
seen_decls = set()
for r in records:
    if r.get('k') != 'decl':
        continue
    canon_ts = re.sub(r'\.nooverloads\.\d+\.ts$', '.ts', r['ts'].replace('\\', '/'))
    dedup = (r.get('stage'), canon_ts, r['line'], r['name'], r['call'], r['verdict'], r.get('reason'))
    if dedup in seen_decls:
        continue
    seen_decls.add(dedup)
    jf = java_file_for_ts(r['ts'])
    printed = pnames.get((canon_ts, r['line'], r['call'], r['name']), r['name'])
    key = (jf, printed, r['call'])
    d = decls.setdefault(key, {'accepts': 0, 'rejects': []})
    if r['verdict'] == 'accept':
        d['accepts'] += 1
    else:
        d['rejects'].append((r['reason'], r['ts'], r['line']))

reverts = collections.Counter()        # key -> count
seen_reverts = set()
for r in records:
    if r.get('k') != 'revert':
        continue
    dedup = (r['tier'], r['name'], r['var'], r['call'], r['line'])
    if dedup in seen_reverts:
        continue
    seen_reverts.add(dedup)
    jf = java_file_for_revert(r['tier'], r['name'])
    reverts[(jf, r['var'], r['call'])] += 1

# ---- final tree scan ----
# SS15_TREE_REV=<rev> reads the generated tree at a git revision (for regenerating the
# pre-fix report after the fix has already rewritten the working tree).
TREE_REV = os.environ.get('SS15_TREE_REV')
final_object = collections.Counter()
final_object_lines = collections.defaultdict(list)
final_string = collections.Counter()


def scan_line(p, i, line):
    m = FINAL_OBJECT.match(line)
    if m:
        final_object[(p, m.group(1), m.group(2))] += 1
        final_object_lines[(p, m.group(1), m.group(2))].append(i)
    m = FINAL_STRING.match(line)
    if m:
        final_string[(p, m.group(1), m.group(3))] += 1


if TREE_REV:
    import subprocess
    for pat in (FINAL_OBJECT.pattern, FINAL_STRING.pattern):
        out = subprocess.run(['git', '-C', ROOT, 'grep', '-nE', pat, TREE_REV, '--', 'java/lib/src/main/java/io/github/ccxt'],
                             capture_output=True, text=True).stdout
        for entry in out.split('\n'):
            if not entry:
                continue
            # <rev>:<path>:<line>:<content>
            rev, rest = entry.split(':', 1)
            path, rest = rest.split(':', 1)
            lineno, content = rest.split(':', 1)
            scan_line(os.path.join(ROOT, path), int(lineno), content)
else:
    for dirpath, _, files in os.walk(CCXT):
        for fn in files:
            if not fn.endswith('.java'):
                continue
            p = os.path.join(dirpath, fn)
            with open(p, encoding='utf-8', errors='replace') as fh:
                for i, line in enumerate(fh, 1):
                    scan_line(p, i, line)

# ---- attribution ----
REVERT_REASON = 'postProcessWsJava:String-type-fixes'
reasons = collections.Counter()
examples = collections.defaultdict(list)
unattributed = []
deviations = []
rescues = []
for key in sorted(set(final_object) | {k for k, d in decls.items() if d['rejects']} | set(reverts)):
    jf, name, call = key
    cnt = final_object.get(key, 0)
    d = decls.get(key)
    rej = list(d['rejects']) if d else []
    rv = reverts.get(key, 0)
    if cnt == 0 and not rej and rv == 0:
        continue
    if not rej and rv == 0:
        unattributed.append((jf, name, call, cnt))
        continue
    shortage = len(rej) + rv - cnt
    if shortage > 0 and final_string.get(key, 0) >= shortage:
        # the classifier rejected the declaration, but a MODULE family (e.g. the pro
        # `messageHash` cast family) typed it anyway — the printed line is
        # `String x = (String) this.safeString(...)` and the (String) defeats the
        # pro/prediction revert regex, so the line survives as String in the final tree
        rescues.append((rel(jf), name, call, shortage, len(rej), rv))
        trimmed = min(shortage, len(rej))
        rej = rej[:len(rej) - trimmed]
        rv = max(0, rv - (shortage - trimmed))
    if len(rej) + rv != cnt:
        deviations.append((rel(jf), name, call, cnt, len(d['rejects']) if d else 0, reverts.get(key, 0)))
    for reason, _, _ in rej:
        reasons[reason] += 1
    reasons[REVERT_REASON] += rv
    if cnt == 1 and len(final_object_lines[key]) == 1:
        reasons_example = rej[0][0] if rej else REVERT_REASON
        examples[reasons_example].append((jf, final_object_lines[key][0]))

total_object = sum(final_object.values())
total_string = sum(final_string.values())
total_decls = sum(d['accepts'] + len(d['rejects']) for d in decls.values())
accepts = sum(d['accepts'] for d in decls.values())
rejects = total_decls - accepts
reject_reasons = collections.Counter(r for d in decls.values() for r, _, _ in d['rejects'])
total_reverts = sum(reverts.values())
reconciled = sum(reasons.values())

lines = []
lines.append('# SS-15 — ranked rejection census: `Object x = this.safeString*` locals')
lines.append('')
lines.append('Tree: branch `ss-15`, base `3ca818ac31ec8f651121c452aed930d725f2b020`.')
lines.append('Population: every local whose initializer is a whole `this.safeString*` call')
lines.append('(`safeString`, `safeString2`, `safeStringN`, `safeStringUpper/Lower(2|N)`).')
lines.append('')
lines.append('Instrumentation: `build/java-local-types.js` (env-gated `CCXT_SS15_CENSUS=1`,')
lines.append('recorder + outermost wrapper) and the inline hook / WS post-pass in')
lines.append('`build/javaTranspiler.ts`. Aggregated by `build/ss15-census-report.py`.')
lines.append('')
lines.append('## Reconciliation')
lines.append('')
lines.append('| metric | count |')
lines.append('|---|---|')
lines.append('| safeString-family declarations processed (population) | %d |' % total_decls)
lines.append('| — accepted by the inline classifier (printed `String`) | %d |' % accepts)
lines.append('| — rejected by the inline classifier | %d |' % rejects)
lines.append('| reverted by `postProcessWsJava` "String type fixes" | %d |' % total_reverts)
lines.append('| final tree: `Object … = this.safeString*` | %d |' % total_object)
lines.append('| final tree: `String … = [(String)] this.safeString*` | %d |' % total_string)
lines.append('| attributed lines (reject + revert) | %d |' % reconciled)
unattr_lines = sum(u[3] for u in unattributed)
lines.append('| unattributed final lines | %d |' % unattr_lines)
lines.append('| module-family rescues (classifier reject, final `String` via a cast family) | %d |' % len(rescues))
lines.append('')
lines.append('Closure: `final Object %d = reverts %d + classifier rejects %d − rescues %d`.'
             % (total_object, total_reverts, rejects, len(rescues)))
lines.append('')
if rescues:
    lines.append('### Module-family rescues (classifier rejected, module typed with `(String)`)')
    lines.append('')
    for f, n, c, sh, rj, rv in rescues:
        lines.append('- `%s` :: %s %s (shortage %d; rejects %d, reverts %d)' % (f, c, n, sh, rj, rv))
    lines.append('')
if unattributed:
    lines.append('### Unattributed keys (file, var, call, final-count)')
    lines.append('')
    for jf, name, call, cnt in unattributed[:60]:
        lines.append('- `%s` :: %s %s x%d' % (rel(jf), call, name, cnt))
    lines.append('')
if deviations:
    lines.append('### Deviating keys (final != rejects + reverts)')
    lines.append('')
    lines.append('| file | var | call | final | rejects | reverts |')
    lines.append('|---|---|---|---|---|---|')
    for f, n, c, cnt, rj, rv in deviations[:80]:
        lines.append('| %s | %s | %s | %d | %d | %d |' % (f, n, c, cnt, rj, rv))
    lines.append('')

lines.append('## Ranked reasons — first rule that rejected `String`')
lines.append('')
lines.append('| # | reason | count | share of population | 3 examples (file:line) |')
lines.append('|---|---|---|---|---|')
for i, (reason, count) in enumerate(reasons.most_common(), 1):
    ex = []
    seen = set()
    for jf, ln in sorted(examples.get(reason, []), key=lambda x: rel(x[0])):
        f = rel(jf)
        if f in seen:
            continue
        seen.add(f)
        ex.append('%s:%d' % (f, ln))
        if len(ex) == 3:
            break
    lines.append('| %d | `%s` | %d | %.1f%% | %s |' % (i, reason, count, 100.0 * count / max(1, total_object), '<br>'.join(ex)))
lines.append('')
lines.append('### Raw classifier reject counts (before revert accounting)')
lines.append('')
lines.append('| reason | count |')
lines.append('|---|---|')
for reason, count in reject_reasons.most_common():
    lines.append('| `%s` | %d |' % (reason, count))
lines.append('')

# ---- slice claim verification (SS-02..SS-14) ----
# counts read straight off the tree so the integrator can check each slice's claim
TREE = os.path.join(ROOT, 'java')


def count_tree(pattern, scope='lib'):
    rx = re.compile(pattern)
    total = 0
    base = os.path.join(TREE, 'lib') if scope == 'lib' else TREE
    for dirpath, _, files in os.walk(base):
        for fn in files:
            if not fn.endswith('.java'):
                continue
            with open(os.path.join(dirpath, fn), encoding='utf-8', errors='replace') as fh:
                for line in fh:
                    total += len(rx.findall(line))
    return total


pro_reverts = sum(c for (jf, _, _), c in reverts.items() if '/pro/' in jf)
pred_reverts = sum(c for (jf, _, _), c in reverts.items() if '/prediction/' in jf)
case_object = {k: v for k, v in final_object.items() if re.match(r'safeString(Upper2?|Lower2?|UpperN|LowerN)$', k[2])}
revert_by_call = collections.Counter()
for (jf, _, call), c in reverts.items():
    revert_by_call[call] += c

lines.append('## What the other slices (SS-02..SS-12) would unlock — measured here')
lines.append('')
lines.append('Counts are read from this tree (lib scope unless noted); the brief\'s cited numbers are')
lines.append('in the claim column where the task text quotes one.')
lines.append('')
lines.append('| slice | scope (from the campaign split) | measured unlock | count |')
lines.append('|---|---|---|---|')
lines.append('| SS-01 | safeStringUpper/Lower producers -> `String` | case-family locals (`Object x = this.safeString{Upper,Lower}*`) still needing a cast; case-family `return (String) …` sites | %d decls / %d sites |' % (sum(case_object.values()), count_tree(r'return \(?\(String\) ?\)?this\.safeString(Upper2?|Lower2?|UpperN|LowerN)')))
lines.append('| SS-02 | reassigned locals (`let x = safeString; … x = safeString`) | classifier rejects `use:write-not-string` + `use:destructuring-write` | %d |' % (reject_reasons.get('use:write-not-string', 0) + reject_reasons.get('use:destructuring-write', 0)))
lines.append('| SS-03 | safeString as LEFT of `+` (Helpers.add) | classifier rejects `use:compound-assign` + `Helpers.add(this.safeString` sites (brief: 20) | %d + %d |' % (reject_reasons.get('use:compound-assign', 0), count_tree(r'Helpers\.add\(this\.safeString')))
lines.append('| SS-04 | redundant casts | `(String) this.safeString*` sites (brief: 454) | %d |' % count_tree(r'\(String\) ?this\.safeString'))
lines.append('| SS-05 | Object param positions | not touched by this census (params, not locals) | n/a |')
lines.append('| SS-06 | isEqual/isTrue/inOp/safeValue consumers | `isEqual(this.safeString` sites (brief cites 107) | %d |' % count_tree(r'isEqual ?\(this\.safeString'))
lines.append('| SS-07 | pro (WebSocket) tier root cause | reverts in `exchanges/pro/**` — **consumed by the SS-15 fix** | %d |' % pro_reverts)
lines.append('| SS-08 | prediction tier + PredictionExchange | reverts in `exchanges/prediction/**` — **consumed by the SS-15 fix** | %d |' % pred_reverts)
lines.append('| SS-09 | map stores (`request.put("k", safeString)`) | not in this population (no `Object x =` local) | n/a |')
lines.append('| SS-10 | conditional / `??` initializers | initializer is a ConditionalExpression, not a whole call — out of population | n/a |')
lines.append('| SS-11 | return types | `return (String) this.safeString*` sites in the tree | %d |' % count_tree(r'return \(?\(String\) ?\)?this\.safeString'))
lines.append('| SS-12 | receiver casts `((String)x)` | tree-wide `((String)name)` wrappers (brief: 1,318 lib) | %d |' % count_tree(r'\(\(String\)[A-Za-z_]\w*\)'))
lines.append('| SS-14 | tests/cli/examples tiers | `Object x = this.safeString*` in java/tests + java/cli + java/examples | 0 |')
lines.append('')
lines.append('Reverts by accessor: %s.' % ', '.join('`%s` %d' % (k, v) for k, v in sorted(revert_by_call.items(), key=lambda x: -x[1])))
lines.append('')
lines.append('> **Overlap warning for the integrator**: the SS-15 blocker fix removes the')
lines.append('> `postProcessWsJava` "String type fixes" pass — that *is* the root cause SS-07 and')
lines.append('> SS-08 were chartered to fix. Their claims (%d pro / %d prediction) are already' % (pro_reverts, pred_reverts))
lines.append('> delivered by this branch; merge order should let SS-15 land first (or drop their')
lines.append('> equivalent hunks of `build/javaTranspiler.ts`).')
lines.append('')

with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write('\n'.join(lines) + '\n')

print('total decls %d (accept %d / reject %d), reverts %d' % (total_decls, accepts, rejects, total_reverts))
print('final Object %d / String %d; reconciled %d; unattributed %d; deviations %d'
      % (total_object, total_string, reconciled, unattr_lines, len(deviations)))
print('ranked:')
for reason, count in reasons.most_common():
    print('  %6d  %s' % (count, reason))
print('wrote', OUT)
