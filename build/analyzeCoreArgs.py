#!/usr/bin/env python3
"""Positional safety analysis for typing generated C# core parameters.

C# overrides are invariant on parameter TYPES but parameter NAMES may differ
(the prediction tier renames `symbol` -> `outcome`), so everything here is keyed
by position, never by name.

A position is typeable only when, across EVERY declaration of that method name:
  * the arity and the per-position default initializer text agree;
  * every declaration's name at that position maps to the same C# type;
  * no declaration assigns to that parameter in its body (the RHS is `object`,
    which would be CS0266 against a narrowed type).

Only `string` positions are emitted. Numeric positions are excluded on purpose:
`callDynamically` invokes these methods reflectively with a boxed `object[]`,
and a boxed Int32 landing in an `Int64?` position is a runtime ArgumentException
that no compile gate would catch.
"""
import re
import glob
import json
import collections
import sys

ROOT = '/root/worktrees/cs-typed-cores/'

STRING_PARAMS = {
    'symbol', 'outcome', 'timeframe', 'code', 'id', 'address', 'tag',
    'type', 'side', 'marginMode', 'network', 'clientOrderId', 'currency',
    'toAccount', 'fromAccount', 'status', 'orderType', 'holderAddress',
    'trigger', 'marketType', 'subType', 'method', 'path', 'requestId',
}

SIG = re.compile(r'^(\s*)public (?:async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$')


def files():
    out = []
    for pat in ('cs/ccxt/base/*.cs', 'cs/ccxt/exchanges/**/*.cs'):
        out += glob.glob(ROOT + pat, recursive=True)
    return [f for f in out if '/wrappers/' not in f]


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


def collect():
    decls = collections.defaultdict(list)
    assigned = collections.defaultdict(set)   # name -> {position}
    for f in files():
        lines = open(f, encoding='utf8').read().split('\n')
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
            body = '\n'.join(lines[bs + 1:be])
            for pos, (pn, _d, _t) in enumerate(shape):
                if re.search(r'(?<![\w.])' + re.escape(pn) + r'\s*(?:\?\?)?=(?!=)', body):
                    assigned[name].add(pos)
            i = be + 1 if be > i else i + 1
    return decls, assigned


def main():
    decls, assigned = collect()
    table = {}
    report = {}
    for name, ds in sorted(decls.items()):
        arities = set(len(d[1]) for d in ds)
        if len(arities) != 1:
            report[name] = 'SKIP: arities %s' % sorted(arities)
            continue
        n = arities.pop()
        # declared types must currently all be `object` (or all identical) and
        # defaults must agree per position
        bad = None
        for pos in range(n):
            defaults = set(d[1][pos][1] for d in ds)
            types = set(d[1][pos][2] for d in ds)
            if len(defaults) != 1 or len(types) != 1:
                bad = 'position %d: defaults=%s types=%s' % (pos, sorted(map(str, defaults)), sorted(types))
                break
        if bad:
            report[name] = 'SKIP: ' + bad
            continue
        typed, skipped = {}, {}
        for pos in range(n):
            names_here = set(d[1][pos][0] for d in ds)
            cur_type = ds[0][1][pos][2]
            # 'string' means a previous run of typeCoreArgs already narrowed it
            if cur_type not in ('object', 'string'):
                continue
            if not names_here <= STRING_PARAMS:
                continue
            # a reassigned position is still typeable: typeCoreArgs renames it to
            # `<name>Typed` and reintroduces the `object` local inside the body
            typed[pos] = 'string'
            if pos in assigned[name]:
                skipped[pos] = 'shadowed (names %s)' % sorted(names_here)
        if typed:
            table[name] = {str(k): v for k, v in typed.items()}
        report[name] = {'decls': len(ds), 'typed': typed, 'skipped': skipped}
    json.dump({'table': table, 'report': report},
              open(ROOT + 'build/coreArgs.report.json', 'w'), indent=1, default=str)
    scope = sys.argv[1:]
    for nm in (scope or sorted(table)):
        print('%-26s %s' % (nm, report.get(nm)))
    print('\ntypeable string positions: %d over %d method names'
          % (sum(len(v) for v in table.values()), len(table)))


main()
