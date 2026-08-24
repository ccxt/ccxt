#!/usr/bin/env python3
"""Positional safety analysis for narrowing NUMERIC generated C# core parameters.

Adapted from build/analyzeCoreArgs.py (which handles the `string` positions).
Everything is keyed by POSITION, never by name: C# overrides are invariant on
parameter TYPES but the prediction tier renames parameters (`symbol` ->
`outcome`), so a name-keyed table silently misses overrides -> CS0115/CS0506.

A numeric position is a CANDIDATE only when, across EVERY declaration of that
method name:
  * arity agrees;
  * the per-position default initializer text agrees;
  * the currently declared type agrees and is exactly `object`
    (`string` positions were already narrowed by a previous pass -> leave alone);
  * every declaration's parameter name at that position lives in the SAME
    numeric bucket (INT64_PARAMS or DOUBLE_PARAMS).

On top of the gate we report USAGE HAZARDS observed in the method BODIES:
  a. `aliasable`  - the body assigns to the parameter (`x =` / `x ??=`).
                    Survivable: typeCoreArgs takes `<name>Typed` and re-emits
                    `object <name> = <name>Typed;` as body statement #1.
  b. `cast`       - the body CASTS the parameter, e.g. `(IList<object>)since`.
                    HARD BLOCKER against a narrowed value type.
  c. `receiver`   - the parameter is used as a receiver / indexer / container,
                    e.g. `since[0]`, `getValue(since, ...)`. HARD BLOCKER.
  (d. simply passing the parameter where the callee wants `object` is fine --
      implicit boxing -- and is deliberately NOT flagged.)

Finally we scan ALL of cs/ccxt (including base/, ws/, hand-written files and the
PascalCase wrappers) plus cs/tests for intra-code CALL SITES of each candidate
method name, and count how many pass an expression at a candidate position that
is neither a literal nor already of the narrowed type -- those are the sites a
companion pass would have to wrap in an explicit conversion.

Writes build/numericCoreArgs.report.json. Reads only; mutates no .cs file.
"""
import re
import glob
import json
import collections
import os
import sys

ROOT = '/root/worktrees/cs-typed-cores/'

INT64_PARAMS = {'since', 'limit', 'until', 'endTime', 'startTime', 'timestamp'}
DOUBLE_PARAMS = {'amount', 'price', 'cost', 'leverage', 'stopPrice',
                 'triggerPrice', 'quantity', 'rate', 'stopLossPrice',
                 'takeProfitPrice'}
BUCKETS = [(INT64_PARAMS, 'Int64?'), (DOUBLE_PARAMS, 'double?')]

HIGH_VALUE = [
    'fetchOHLCV', 'fetchTrades', 'fetchMyTrades', 'fetchOrders',
    'fetchOpenOrders', 'fetchClosedOrders', 'fetchOHLCVWs', 'fetchTradesWs',
    'watchOHLCV', 'watchTrades', 'createOrder', 'createLimitOrder',
    'createMarketOrder', 'createOrderWs', 'editOrder', 'fetchLedger',
    'fetchDeposits', 'fetchWithdrawals', 'fetchFundingRateHistory',
    'fetchLiquidations', 'fetchTransfers',
]

SIG = re.compile(r'^(\s*)public (?:async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$')


# ---------------------------------------------------------------- file sets

def files():
    """Generated / hand-written DECLARATION sites. Wrappers excluded: they are
    hand-written PascalCase and already use Int64?/double?."""
    out = []
    for pat in ('cs/ccxt/base/*.cs', 'cs/ccxt/ws/*.cs', 'cs/ccxt/exchanges/**/*.cs'):
        out += glob.glob(ROOT + pat, recursive=True)
    return sorted(set(f for f in out if '/wrappers/' not in f))


def callsite_files():
    """Every C# file that could CALL a core -- wrappers and tests included."""
    out = []
    for pat in ('cs/ccxt/**/*.cs', 'cs/tests/**/*.cs'):
        out += glob.glob(ROOT + pat, recursive=True)
    return sorted(set(f for f in out if '/obj/' not in f and '/bin/' not in f))


# ------------------------------------------------------- parsing machinery

def split_params(s):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch in '<([':
            depth += 1
        elif ch in '>)]':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    if cur.strip():
        out.append(cur)
    return [p.strip() for p in out]


def body_range(lines, i, indent):
    start = i + 1
    while start < len(lines) and lines[start].strip() != '{':
        start += 1
    end = len(lines) - 1
    for j in range(start + 1, len(lines)):
        if lines[j] == indent + '}':
            end = j
            break
    return start, end


# casts that are harmless against a narrowed numeric type (boxing / widening)
BENIGN_CAST_TARGETS = {'object', 'dynamic', 'Int64', 'long', 'Int32', 'int',
                       'double', 'float', 'decimal', 'Nullable'}

# helpers whose first argument is a container / receiver, not a plain value
RECEIVER_FUNCS = ('getValue', 'setValue', 'getArrayLength', 'getIndexOf',
                  'getObjectKeys', 'getObjectValues', 'inOp', 'keysort',
                  'toArray', 'arrayConcat', 'sortBy', 'sortBy2', 'groupBy',
                  'filterBy', 'indexBy', 'extend', 'deepExtend', 'omit')


def hazard_scan(pname, body_lines, first_line_no, f, out):
    """Append (kind, 'file:line') for every hazard found for parameter pname."""
    p = re.escape(pname)
    B = r'(?<![\w.])'
    E = r'(?![\w])'
    assign_re = re.compile(B + p + r'\s*(?:\?\?)?=(?!=)')
    # (Type)pname   /   ((Type)pname)  -- capture the cast target
    cast_re = re.compile(r'\(\s*([\w.]+(?:<[^()]*>)?)\s*\??\s*\)\s*' + p + E)
    # pname[...]
    index_re = re.compile(B + p + r'\s*\[')
    # containerHelper(pname, ...)
    recv_re = re.compile(r'(?:' + '|'.join(RECEIVER_FUNCS) + r')\s*\(\s*' + p + E)
    for k, line in enumerate(body_lines):
        loc = '%s:%d' % (os.path.relpath(f, ROOT), first_line_no + k + 1)
        code = strip_strings(line)
        if assign_re.search(code):
            out.append(('aliasable', loc))
        for m in cast_re.finditer(code):
            target = m.group(1).split('<')[0].split('.')[-1]
            if target not in BENIGN_CAST_TARGETS:
                out.append(('cast', loc))
                break
        if index_re.search(code) or recv_re.search(code):
            out.append(('receiver', loc))


STR_RE = re.compile(r'"(?:[^"\\]|\\.)*"')


def strip_strings(line):
    return STR_RE.sub('""', line)


# ------------------------------------------------------------- collection

def collect():
    decls = collections.defaultdict(list)          # name -> [(file, shape)]
    bodies = collections.defaultdict(list)         # name -> [(file, firstline, [lines])]
    for f in files():
        try:
            lines = open(f, encoding='utf8').read().split('\n')
        except Exception:
            continue
        i = 0
        while i < len(lines):
            m = SIG.match(lines[i].rstrip())
            if not m:
                i += 1
                continue
            indent, _mod, _ret, name, plist = m.groups()
            params = [p for p in split_params(plist) if p]
            shape = tuple(
                (p.split('=')[0].strip().split()[-1],
                 p.split('=')[1].strip() if '=' in p else None,
                 ' '.join(p.split('=')[0].strip().split()[:-1]))
                for p in params
            )
            decls[name].append((f, shape))
            bs, be = body_range(lines, i, indent)
            bodies[name].append((f, bs, lines[bs + 1:be]))
            i = be + 1 if be > i else i + 1
    return decls, bodies


def bucket_of(names_here):
    for s, ty in BUCKETS:
        if names_here <= s:
            return ty
    return None


# --------------------------------------------------------------- call sites

LITERAL_RE = re.compile(
    r'^(?:null|true|false|-?\d+[lLdDfFmMuU]?|-?\d*\.\d+[dDfFmM]?|"(?:[^"\\]|\\.)*"|\'.\')$')
TYPED_CAST_RE = re.compile(r'^\(\s*(?:Int64|long|Int32|int|double|float|decimal)\s*\??\s*\)')
TYPED_PAREN_CAST_RE = re.compile(r'^\(\s*\(\s*(?:Int64|long|Int32|int|double|float|decimal)\s*\??\s*\)')


def split_args(s):
    return split_params(s)


def read_call_args(text, open_idx):
    """text[open_idx] == '('. Return (args_string, end_idx) or (None, None)."""
    depth = 0
    i = open_idx
    n = len(text)
    while i < n:
        ch = text[i]
        if ch == '"':
            i += 1
            while i < n and text[i] != '"':
                i += 2 if text[i] == '\\' else 1
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
            if depth == 0:
                return text[open_idx + 1:i], i
        elif ch == ';' and depth == 0:
            return None, None
        i += 1
    return None, None


def scan_callsites(table):
    """table: name -> {pos: type}. Returns per-name/pos counts + examples."""
    names = {n: {int(k): v for k, v in d.items()} for n, d in table.items()}
    if not names:
        return {}
    name_re = re.compile(r'(?<![\w.])(?:this\.|base\.|await\s+)?\b(' +
                         '|'.join(re.escape(n) for n in sorted(names, key=len, reverse=True)) +
                         r')\s*\(')
    res = collections.defaultdict(lambda: collections.defaultdict(
        lambda: {'needs_conversion': 0, 'ok': 0, 'examples': []}))
    for f in callsite_files():
        try:
            src = open(f, encoding='utf8').read()
        except Exception:
            continue
        lines = src.split('\n')
        for ln, line in enumerate(lines, 1):
            if SIG.match(line.rstrip()):
                continue                      # a declaration, not a call site
            for m in name_re.finditer(line):
                nm = m.group(1)
                argstr, _end = read_call_args(line, line.index('(', m.end() - 1))
                if argstr is None:
                    continue
                args = split_args(argstr)
                for pos, ty in names[nm].items():
                    if pos >= len(args):
                        continue
                    a = args[pos].strip()
                    if not a:
                        continue
                    slot = res[nm][pos]
                    if (LITERAL_RE.match(a) or TYPED_CAST_RE.match(a)
                            or TYPED_PAREN_CAST_RE.match(a)):
                        slot['ok'] += 1
                    else:
                        slot['needs_conversion'] += 1
                        if len(slot['examples']) < 5:
                            slot['examples'].append(
                                '%s:%d  %s(... arg%d=%s)' %
                                (os.path.relpath(f, ROOT), ln, nm, pos, a[:60]))
    return {n: {str(p): v for p, v in d.items()} for n, d in res.items()}


# -------------------------------------------------------------------- main

def main():
    decls, bodies = collect()
    table, report = {}, {}
    for name, ds in sorted(decls.items()):
        arities = set(len(d[1]) for d in ds)
        if len(arities) != 1:
            report[name] = 'SKIP: arities %s' % sorted(arities)
            continue
        n = arities.pop()
        bad = None
        for pos in range(n):
            defaults = set(d[1][pos][1] for d in ds)
            types = set(d[1][pos][2] for d in ds)
            if len(defaults) != 1 or len(types) != 1:
                bad = ('position %d: defaults=%s types=%s'
                       % (pos, sorted(map(str, defaults)), sorted(types)))
                break
        if bad:
            report[name] = 'SKIP: ' + bad
            continue
        typed, rejected = {}, {}
        for pos in range(n):
            names_here = set(d[1][pos][0] for d in ds)
            cur_type = ds[0][1][pos][2]
            numeric_any = any(nh in INT64_PARAMS or nh in DOUBLE_PARAMS for nh in names_here)
            if not numeric_any:
                continue
            if cur_type != 'object':
                rejected[pos] = 'current type is %r not object' % cur_type
                continue
            ty = bucket_of(names_here)
            if ty is None:
                rejected[pos] = 'mixed/unknown names %s' % sorted(names_here)
                continue
            typed[pos] = ty
        if typed:
            table[name] = {str(k): v for k, v in typed.items()}
        report[name] = {'decls': len(ds), 'arity': n,
                        'typed': {str(k): v for k, v in typed.items()},
                        'rejected': {str(k): v for k, v in rejected.items()}}

    # ---- hazards over method bodies, only for candidate positions
    hazards = {}
    for name, positions in table.items():
        shape = decls[name][0][1]
        per_pos = {}
        for pos_s in positions:
            pos = int(pos_s)
            found = []
            for f, firstline, blines in bodies[name]:
                pname = None
                for d_f, d_shape in decls[name]:
                    if d_f == f and pos < len(d_shape):
                        pname = d_shape[pos][0]
                        break
                if pname is None:
                    pname = shape[pos][0]
                hazard_scan(pname, blines, firstline, f, found)
            agg = collections.defaultdict(lambda: {'count': 0, 'examples': []})
            for kind, loc in found:
                agg[kind]['count'] += 1
                if len(agg[kind]['examples']) < 3:
                    agg[kind]['examples'].append(loc)
            if agg:
                per_pos[pos_s] = dict(agg)
        if per_pos:
            hazards[name] = per_pos

    callsites = scan_callsites(table)

    out = {'table': table, 'report': report, 'hazards': hazards,
           'callsites': callsites}
    path = ROOT + 'build/numericCoreArgs.report.json'
    json.dump(out, open(path, 'w'), indent=1, default=str)

    # ------------------------------------------------------------- summary
    total_pos = sum(len(v) for v in table.values())
    print('typeable numeric positions: %d over %d method names'
          % (total_pos, len(table)))

    hard = [(n, p, k) for n, d in hazards.items() for p, kd in d.items()
            for k in kd if k in ('cast', 'receiver')]
    hard_names = sorted(set(n for n, _p, _k in hard))
    print('candidate positions with HARD hazards (cast/receiver): %d, over %d names'
          % (len(set((n, p) for n, p, _ in hard)), len(hard_names)))
    if hard_names:
        print('  hard-hazard names: %s' % ', '.join(hard_names[:40]))
    alias = sorted(set((n, p) for n, d in hazards.items() for p, kd in d.items()
                       if 'aliasable' in kd))
    print('candidate positions that are merely aliasable (assignment): %d' % len(alias))

    need = sum(v['needs_conversion'] for d in callsites.values() for v in d.values())
    ok = sum(v['ok'] for d in callsites.values() for v in d.values())
    print('call sites at candidate positions: %d need an inserted conversion, %d already literal/typed'
          % (need, ok))
    ex = [e for d in callsites.values() for v in d.values() for e in v['examples']][:5]
    for e in ex:
        print('   ex: %s' % e)

    scope = sys.argv[1:] or HIGH_VALUE
    print('\n--- high-value names ---')
    for nm in scope:
        r = report.get(nm)
        if r is None:
            print('%-24s ABSENT (no declaration found)' % nm)
            continue
        if isinstance(r, str):
            print('%-24s REJECTED: %s' % (nm, r))
            continue
        shape = decls[nm][0][1]
        bits = []
        for pos_s, ty in sorted(r['typed'].items(), key=lambda kv: int(kv[0])):
            pos = int(pos_s)
            hz = hazards.get(nm, {}).get(pos_s, {})
            kinds = ','.join(sorted(hz)) or 'clean'
            bits.append('pos%s(%s)=%s [%s]' % (pos_s, shape[pos][0], ty, kinds))
        for pos_s, why in sorted(r['rejected'].items(), key=lambda kv: int(kv[0])):
            bits.append('pos%s REJECTED: %s' % (pos_s, why))
        print('%-24s decls=%-4d %s' % (nm, r['decls'], '; '.join(bits) or 'no numeric positions'))


main()
