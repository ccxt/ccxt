#!/usr/bin/env python3
"""
Derive the closed allow-list for the typed-return pass (build/javaTypedCores.ts).

This is the JN-2 slice's rule engine. The candidate universe is the
`CompletableFuture<Object>` surface of java/lib/src/main/java/io/github/ccxt/Exchange.java
(the 130 methods; the one-line `*Async` aliases are retyped in lockstep with
their target and are not candidates themselves). A name is typed only if ALL of
these hold -- each one is MEASURED from the generated java tree, none is a
judgement call:

  R1 wrapper agreement   every typed-wrapper conversion for the name uses ONE
                         family: `new T(res)` or `toTypedList(res, T::new)`.
                         A bare cast (`(String) res`) or two families excludes it.
  R2 invertible family   the family (and the element family of List<T>) is in
                         `generateJavaTypedCoreHelpers.py --capabilities`, i.e.
                         TypedCores.from* is an exact inverse via `__raw`.
  R3 uniform declarations EVERY declaration of the name on the crypto tier
                         (Exchange.java + BaseExchange.java + exchanges/**/*Core.java
                         excluding prediction) is in the transpiled `supplyAsync`
                         shape the typeJavaCores.py pass can retype -- or already
                         typed by a previous run (the script is a fixed point).
                         Java generics are invariant, so one non-retypable
                         declaration excludes the name (C# CS0508 analogue).
  R4 shared base         a name declared on BaseExchange.java is inherited by
                         BOTH Exchange and PredictionExchange, so it must resolve
                         to one family on both tiers; this slice types neither.
  R5 hand-written consumer  no call site above the TRANSPILED markers in the
                         hand-written bases consumes the value (the `*Async`
                         alias lines are the retyped forwarders themselves).
  R6 policy              watch* (live ws caches / WS-test coupling) and *Ws
                         (WS-API tier) are out of this slice's REST async surface.

Usage:
    python3 build/javaTypedCoresClosedSet.py            # report the fixed point
    python3 build/javaTypedCoresClosedSet.py --write    # rewrite build/javaTypedCores.ts
    python3 build/javaTypedCoresClosedSet.py --check    # non-zero if the table drifted
"""
import argparse
import collections
import glob
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
ROOT = os.path.join(REPO, 'java/lib/src/main/java/io/github/ccxt')
TABLE = os.path.join(REPO, 'build/javaTypedCores.ts')
MARKER = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

HEADER_STD = re.compile(r'^(\s*)public java\.util\.concurrent\.CompletableFuture<Object> (\w+)\((.*)\)\s*$')
HEADER_TYPED = re.compile(r'^\s*public java\.util\.concurrent\.CompletableFuture<([^>]+(?:<[^>]*>)?)> (\w+)\((.*)\)\s*$')
TAIL = re.compile(r'^\s*\}\)(?:\.thenApply\(io\.github\.ccxt\.TypedCores::to\w+\))?;\s*$')

FQ = r'(?:io\.github\.ccxt\.types\.)?'
CONV = re.compile(r'Object res = Helpers\.(?:joinUnwrapped|joinTyped)\((?:super|this)\.(\w+)\('
                  r'[^;]*\)\);\s*\n\s*'
                  r'return (?:new ' + FQ + r'(\w+)\(res\)|toTypedList\(res, ' + FQ + r'(\w+)::new\)|(\([^;]*?\)|.+?));')
CONV_TYPED = re.compile(r'return Helpers\.joinTyped\((?:super|this)\.(\w+)\([^;]*\)\);')
SYNC_SIG = re.compile(r'^\s*public (?:java\.util\.)?(List<' + FQ + r'(\w+)>|' + FQ + r'(\w+)) (\w+)\(')


def find_body_end(lines, start):
    ind = max(len(lines[start]) - len(lines[start].lstrip()), 4)
    for i in range(start + 1, len(lines)):
        if lines[i].strip() and len(lines[i]) - len(lines[i].lstrip()) == ind and lines[i].strip() == '}':
            return i
    return -1


def tier_files():
    return ([os.path.join(ROOT, 'Exchange.java'), os.path.join(ROOT, 'BaseExchange.java')]
            + [p for p in glob.glob(ROOT + '/exchanges/**/*Core.java', recursive=True)
               if '/prediction/' not in p])


def wrapper_files():
    return [p for p in glob.glob(ROOT + '/exchanges/**/*.java', recursive=True)
            if '/prediction/' not in p and not p.endswith('Core.java')]


def candidates():
    """(ordered) names of the CompletableFuture<Object> declarations in Exchange.java."""
    out = []
    for line in open(os.path.join(ROOT, 'Exchange.java')):
        m = HEADER_STD.match(line)
        if m and not m.group(2).endswith('Async'):
            out.append(m.group(2))
    return out


def wrapper_families():
    """name -> set of families the typed wrappers convert to ('CAST' for a bare cast).

    Handles both the pre-typing body (`Object res = ...; return new T(res);`) and the
    post-typing body (`return Helpers.joinTyped(super.X(...));`, family read from the
    sync method's declared return type) so the script is a fixed point across runs.
    """
    fams = collections.defaultdict(set)
    for p in wrapper_files():
        lines = open(p).read().split('\n')
        for i, l in enumerate(lines):
            m = CONV_TYPED.search(l)
            if m:
                name = m.group(1)
                sig = SYNC_SIG.match(lines[i - 1]) if i > 0 else None
                if sig is not None and sig.group(4) == name:
                    fam = ('List<%s>' % sig.group(2)) if sig.group(2) else sig.group(3)
                else:
                    fam = 'CAST'
                fams[name].add(fam)
        for m in CONV.finditer('\n'.join(lines)):
            name = m.group(1)
            if m.group(2):
                fam = m.group(2)
            elif m.group(3):
                fam = 'List<%s>' % m.group(3)
            else:
                fam = 'CAST'
            fams[name].add(fam)
    return fams


def declarations():
    """name -> list of (path, kind) where kind in {'std','typed','bad'}."""
    out = collections.defaultdict(list)
    for p in tier_files():
        lines = open(p).read().split('\n')
        for i, l in enumerate(lines):
            m = HEADER_STD.match(l)
            if not m:
                continue
            end = find_body_end(lines, i)
            ok = False
            if end > 0:
                j = end - 1
                while j > i and not lines[j].strip():
                    j -= 1
                ok = bool(TAIL.match(lines[j]))
            out[m.group(2)].append((os.path.relpath(p, REPO), 'std' if ok else 'bad'))
            continue
        # already-typed declarations (fixed point re-runs)
        for i, l in enumerate(lines):
            m = HEADER_TYPED.match(l)
            if not m or m.group(1) == 'Object':
                continue
            out[m.group(2)].append((os.path.relpath(p, REPO), 'typed'))
    return out


def hand_written_consumers(names):
    """R5: names consumed above the TRANSPILED marker by anything but their `*Async` alias."""
    hits = set()
    for f in ('Exchange.java', 'BaseExchange.java'):
        src = open(os.path.join(ROOT, f)).read()
        k = src.find(MARKER)
        hand = src[:k] if k >= 0 else src
        for n in names:
            for m in re.finditer(r'(?<![\w.])' + re.escape(n) + r'\s*\(', hand):
                ls = hand.rfind('\n', 0, m.start()) + 1
                line = hand[ls:hand.find('\n', m.start())]
                if line.strip().startswith('public java.util.concurrent.CompletableFuture<Object> ' + n + 'Async'):
                    continue
                hits.add(n)
    return hits


def capabilities():
    out = subprocess.run([sys.executable, os.path.join(HERE, 'generateJavaTypedCoreHelpers.py'), '--capabilities'],
                         capture_output=True, text=True, cwd=REPO)
    if out.returncode != 0:
        print(out.stdout, out.stderr, file=sys.stderr)
        raise SystemExit('capabilities run failed')
    return set(json.loads(out.stdout)['families'])


def derive(verbose=False):
    cand = candidates()
    fams = wrapper_families()
    decls = declarations()
    caps = capabilities()
    hand = hand_written_consumers(cand)

    kept, dropped = {}, {}
    for name in cand:
        nf = fams.get(name, set())
        ds = decls.get(name, [])
        if name.startswith('watch') or name.endswith('Ws'):
            dropped[name] = 'R6 policy: WS tier out of this slice (REST async surface)'
            continue
        if name in hand:
            dropped[name] = 'R5 hand-written consumer above the TRANSPILED marker'
            continue
        if len(nf) != 1:
            dropped[name] = 'R1 wrapper agreement: families %s' % (sorted(nf) or 'none')
            continue
        fam = next(iter(nf))
        if fam == 'CAST':
            dropped[name] = 'R1 wrapper agreement: bare-cast conversion, no nominal family'
            continue
        elem = fam[5:-1] if fam.startswith('List<') else fam
        if elem not in caps:
            dropped[name] = 'R2 family %s is not invertible (not in --capabilities)' % elem
            continue
        bad = [d for d in ds if d[1] == 'bad']
        if not ds:
            dropped[name] = 'R3 no declaration found on the crypto tier'
            continue
        if bad:
            dropped[name] = 'R3 non-retypable declaration(s): %s' % (bad[:2],)
            continue
        base = open(os.path.join(ROOT, 'BaseExchange.java')).read()
        if re.search(r'public (?:java\.util\.concurrent\.)?CompletableFuture<[^>]*>\s+' + re.escape(name) + r'\s*\(', base):
            dropped[name] = 'R4 declared on BaseExchange (shared with the prediction tier)'
            continue
        kept[name] = fam

    if verbose:
        print('candidates: %d, typed: %d, dropped: %d' % (len(cand), len(kept), len(dropped)))
        for n in sorted(dropped):
            print('  DROP %-42s %s' % (n, dropped[n]))
    return kept


def render_table(kept):
    lines = []
    lines.append('// Closed allow-list for the typed-return pass (JN-2: the public async surface of')
    lines.append('// Exchange.java). Ported from ccxt/ccxt#30113; the C# analogue (ccxt/ccxt#30066) is merged.')
    lines.append('//')
    lines.append('// THIS TABLE IS DERIVED. Do not hand-edit it:')
    lines.append('//')
    lines.append('//     python3 build/javaTypedCoresClosedSet.py            # report the fixed point')
    lines.append('//     python3 build/javaTypedCoresClosedSet.py --write    # rewrite the table')
    lines.append('//     python3 build/javaTypedCoresClosedSet.py --check    # non-zero if it drifted')
    lines.append('//')
    lines.append('// A name is typed only when build/javaTypedCoresClosedSet.py proves all of:')
    lines.append('//   1. every typed-wrapper conversion for it uses ONE family (new T(res) /')
    lines.append('//      toTypedList(res, T::new)); a bare cast or two families excludes it;')
    lines.append('//   2. the family is invertible (generateJavaTypedCoreHelpers.py --capabilities:')
    lines.append('//      TypedCores.from* hands back `__raw`, the exact payload);')
    lines.append('//   3. EVERY declaration on the crypto tier is in the transpiled supplyAsync')
    lines.append('//      shape build/typeJavaCores.py retypes -- Java generics are invariant, so one')
    lines.append('//      non-retypable declaration excludes the name (the C# CS0508 analogue);')
    lines.append('//   4. it is not declared on BaseExchange.java (shared with the prediction tier);')
    lines.append('//   5. no hand-written consumer above the TRANSPILED marker receives the value;')
    lines.append('//   6. policy: watch* and *Ws stay out of this slice (REST async surface only).')
    lines.append('//')
    lines.append('// Consuming call sites are wrapped in the from* inverse by build/typeJavaCores.py,')
    lines.append('// so a typed core hands untyped code the same raw Map/List it always did.')
    lines.append('')
    lines.append('export const TYPED_CORES: Record<string, string> = {')
    for name in sorted(kept):
        lines.append("    '%s': '%s'," % (name, kept[name]))
    lines.append('};')
    lines.append('')
    lines.append('// This slice leaves the prediction tier untouched (PredictionExchange is a sibling of')
    lines.append('// Exchange, not a subclass), so the table is deliberately empty.')
    lines.append('export const PREDICTION_TYPED_CORES: Record<string, string> = {')
    lines.append('};')
    lines.append('')
    lines.append('// Live-ws snapshot cores (watchOrderBook*): mirrored for reference only; not enabled by')
    lines.append('// this slice (watch* is R6-excluded).')
    lines.append('export const SNAPSHOT_CORES: Record<string, { type: string, helper: string }> = {')
    lines.append('};')
    lines.append('')
    return '\n'.join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--verbose', action='store_true')
    args = ap.parse_args()

    kept = derive(verbose=args.verbose or not (args.write or args.check))
    source = render_table(kept)
    existing = open(TABLE).read() if os.path.exists(TABLE) else None
    if args.check:
        if existing != source:
            print('STALE: %s does not match the derivation' % os.path.relpath(TABLE, REPO), file=sys.stderr)
            return 1
        print('up to date: %s (%d names)' % (os.path.relpath(TABLE, REPO), len(kept)))
        return 0
    if args.write:
        if existing == source:
            print('unchanged: %s' % os.path.relpath(TABLE, REPO))
        else:
            open(TABLE, 'w').write(source)
            print('wrote: %s (%d names)' % (os.path.relpath(TABLE, REPO), len(kept)))
        return 0
    return 0


if __name__ == '__main__':
    sys.exit(main())
