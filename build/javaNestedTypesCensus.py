#!/usr/bin/env python3
"""
JN-2 census: the 131 `CompletableFuture<Object>` methods of
java/lib/src/main/java/io/github/ccxt/Exchange.java.

Prints one row per method with:
  * the TS declaration + return annotation parsed from ts/src/base/Exchange.ts
  * the nominal Java family the typed wrapper layer converts it to
    (exchanges/**/<Venue>.java: `new T(res)` / `toTypedList(res, T::new)`),
    'CAST' for a bare-cast conversion, '-' when no wrapper conversion exists
  * every declaration on the crypto tier (Exchange.java + venue cores) and
    whether it is in the retypable supplyAsync-tail shape
  * how many internal call sites consume a joined value

This is the measurement behind build/javaTypedCores.ts (the derived
allow-list the typeJavaCores.py pass reads). Run from the repo root:

    python3 build/javaNestedTypesCensus.py            # summary
    python3 build/javaNestedTypesCensus.py --full     # every row
"""
import argparse
import collections
import glob
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JAVA = os.path.join(REPO, 'java/lib/src/main/java/io/github/ccxt')
EXCHANGE = os.path.join(JAVA, 'Exchange.java')
BASE_TS = os.path.join(REPO, 'ts/src/base/Exchange.ts')

HDR = re.compile(r'^(\s*)public java\.util\.concurrent\.CompletableFuture<Object> (\w+)\((.*)\)\s*$')
CONV = re.compile(r'Object res = Helpers\.joinUnwrapped\(super\.(\w+)\([^;]*\)\);\s*\n\s*'
                  r'return (?:new (\w+)\(res\)|toTypedList\(res, (\w+)::new\)|(\([^;]*?\)|.+?));')
TS_METHOD = re.compile(r'^ {4}(?:async )?(\w+) \((.*?)\): ([^\{]+) \{', re.M)

# Names the typed-wrapper generator blacklists / does not convert, so no
# `new T(res)` exists to reuse (rule (b) of the slice: conversion must already
# exist in the typed wrapper layer).
NO_WRAPPER_CONVERSION = {
    'fetchRestOrderBookSafe': 'generator BLACKLIST (internal snapshot helper; hand-written loadOrderBook consumes it)',
    'fetchOrderStatus': 'wrapper converts with a bare `(String) res` cast, not a nominal family',
    'fetch': 'the abstract name itself',
}


def ts_return_types():
    """name -> (return annotation, raw params) for the ts/src/base/Exchange.ts methods."""
    src = open(BASE_TS).read()
    out = {}
    for m in TS_METHOD.finditer(src):
        out.setdefault(m.group(1), (m.group(3).strip(), m.group(2)))
    return out


def find_body_end(lines, start):
    ind = max(len(lines[start]) - len(lines[start].lstrip()), 4)
    for i in range(start + 1, len(lines)):
        if lines[i].strip() and len(lines[i]) - len(lines[i].lstrip()) == ind and lines[i].strip() == '}':
            return i
    return -1


def tier_files():
    return ([os.path.join(JAVA, 'Exchange.java'), os.path.join(JAVA, 'BaseExchange.java')]
            + [p for p in glob.glob(JAVA + '/exchanges/**/*Core.java', recursive=True)
               if '/prediction/' not in p])


def wrapper_files():
    return [p for p in glob.glob(JAVA + '/exchanges/**/*.java', recursive=True)
            if '/prediction/' not in p and not p.endswith('Core.java')]


def census():
    ex_src = open(EXCHANGE).read()
    methods = []          # (name, params, line, alias?)
    for i, line in enumerate(ex_src.split('\n')):
        m = HDR.match(line)
        if m:
            methods.append((m.group(2), m.group(3), i + 1, m.group(2).endswith('Async')))

    tst = ts_return_types()
    fams = collections.defaultdict(set)
    conv_files = collections.defaultdict(set)
    for p in wrapper_files():
        for m in CONV.finditer(open(p).read()):
            name = m.group(1)
            if m.group(2):
                fam, kind = m.group(2), 'new'
            elif m.group(3):
                fam, kind = 'List<%s>' % m.group(3), 'list'
            else:
                fam, kind = 'CAST', 'cast'
            fams[name].add(fam)
            conv_files[name].add(kind)

    decls = collections.defaultdict(list)
    for p in tier_files():
        lines = open(p).read().split('\n')
        for i, l in enumerate(lines):
            m = HDR.match(l)
            if not m:
                continue
            end = find_body_end(lines, i)
            ok = False
            if end > 0:
                j = end - 1
                while j > i and not lines[j].strip():
                    j -= 1
                ok = lines[j].strip() == '});'
            decls[m.group(2)].append((os.path.relpath(p, REPO), ok))

    consumers = collections.Counter()
    for p in tier_files():
        src = open(p).read()
        for name in set(n for n, _, _, _ in methods):
            consumers[name] += len(re.findall(r'\(' + re.escape('this.' + name + '('), src))

    rows = []
    for name, params, line, alias in methods:
        t = tst.get(name)
        fam = sorted(fams.get(name, []))
        ds = decls.get(name, [])
        bad = [d for d in ds if not d[1]]
        rows.append({
            'name': name, 'line': line, 'alias': alias,
            'ts': t[0] if t else None,
            'family': fam[0] if len(fam) == 1 else (fam or None),
            'decls': len(ds), 'bad': len(bad),
            'consumers': consumers.get(name, 0),
        })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--full', action='store_true')
    args = ap.parse_args()
    rows = census()
    body = [r for r in rows if not r['alias']]
    print('Exchange.java CompletableFuture<Object> sightings: %d (%d methods + %d one-line async aliases)'
          % (len(rows), len(body), len(rows) - len(body)))
    print()
    print('%-42s %-26s %-20s %6s %5s %6s' % ('name', 'ts-return', 'java-family', 'decls', 'bad', 'cons'))
    for r in rows:
        if args.full or r['bad'] or not r['family'] or r['alias']:
            print('%-42s %-26s %-20s %6d %5d %6d' % (
                r['name'], (r['ts'] or '-')[:25], str(r['family'] or '-')[:19], r['decls'], r['bad'], r['consumers']))
    typed = [r for r in body if r['family'] and r['family'] not in ('CAST',) and not r['bad']
             and r['name'] not in NO_WRAPPER_CONVERSION]
    print()
    print('single-family, all-declarations-retypal, conversion-exists names: %d of %d methods'
          % (len(typed), len(body)))


if __name__ == '__main__':
    main()
