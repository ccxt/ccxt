#!/usr/bin/env python3
"""
Audit every call site of a typed Java core for a silent typed-value leak.

A typed core hands back `CompletableFuture<T>`. Untyped transpiled code that
receives the value expects the raw Map/List the TS returned, and reads it via
`Helpers.GetValue` / `safe*`, which fall back to *reflection on public fields*
when handed a unified type object. That makes the leak silent: the read
"works" for keys that happen to be field names and yields null for every other
key (venue extras, `info` sub-keys, ...) -- javac is green, static tests can
be green, and the bug only shows on the keys that differ.

Call-site shapes and what the typing pass (build/typeJavaCores.py) does:

  A  `Object x = (this.X(...)).join();`            wrapped in from*        OK
  B  `return (this.X(...)).join();`                tail: NOT wrapped       OK only if the
                                                   enclosing core has the SAME family
                                                   (its own thenApply(toT) is idempotent);
                                                   otherwise a LEAK (untyped enclosing
                                                   method returns a typed object, or a
                                                   different family's to* is fed a T)
  C  `(this.XAsync(...)).join()`                   the base Async alias is retyped, the
                                                   consumer is NOT wrapped     LEAK
  D  `this.X(...)` with no `.join()` on the line   e.g. promiseAll(...) fan-in; the
                                                   futures are joined later as Object
                                                   and read untyped            LEAK
  E  hand-written code above the TRANSPILED marker (loadMarkets etc.)  reported

Exit status is non-zero when any LEAK remains, so it can gate the pipeline.

Usage:
    python3 build/auditJavaTypedCoreLeaks.py            # audit the committed tables
    python3 build/auditJavaTypedCoreLeaks.py --verbose  # print every site
"""
import glob
import os
import re
import sys

ROOT = 'java/lib/src/main/java/io/github/ccxt'
TABLE = 'build/javaTypedCores.ts'

HEADER = re.compile(
    r'^(\s*)public java\.util\.concurrent\.CompletableFuture<([^ ]+(?: [^ ]+)*)> (\w+)\((.*)\)\s*$')
MARKER = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'


def load_tables():
    s = open(TABLE).read()

    def tbl(name):
        i = s.index('export const ' + name)
        j = s.index('};', i)
        return dict(re.findall(r"'(\w+)':\s*'([^']+)'", s[i:j]))
    return tbl('TYPED_CORES'), tbl('PREDICTION_TYPED_CORES')


def find_body_end(lines, start):
    ind = len(lines[start]) - len(lines[start].lstrip())
    ind = max(ind, 4)
    for i in range(start + 1, len(lines)):
        if not lines[i].strip():
            continue
        cur = len(lines[i]) - len(lines[i].lstrip())
        if cur == ind and lines[i].strip() == '}':
            return i
    return -1


def java_family(decl):
    """'io.github.ccxt.types.Ticker' -> 'Ticker'; 'java.util.List<io.github.ccxt.types.Order>' -> 'List<Order>'."""
    m = re.fullmatch(r'java\.util\.List<io\.github\.ccxt\.types\.(\w+)>', decl)
    if m:
        return 'List<%s>' % m.group(1)
    m = re.fullmatch(r'io\.github\.ccxt\.types\.(\w+)', decl)
    if m:
        return m.group(1)
    return decl  # 'Object' or something else


def method_spans(lines):
    """[(start, end, name, declared_family)] for every CompletableFuture method."""
    out = []
    for i, l in enumerate(lines):
        m = HEADER.match(l)
        if not m:
            continue
        end = find_body_end(lines, i)
        out.append((i, end if end > 0 else len(lines), m.group(3), java_family(m.group(2))))
    return out


def enclosing(spans, idx):
    best = None
    for s, e, name, fam in spans:
        if s <= idx <= e:
            if best is None or s > best[0]:
                best = (s, e, name, fam)
    return best


def balanced_call_end(line, start):
    """Index just past the ')' closing the call whose '(' is at `start`, or -1."""
    depth = 0
    in_str = False
    j = start
    while j < len(line):
        c = line[j]
        if in_str:
            if c == '\\':
                j += 1
            elif c == '"':
                in_str = False
        elif c == '"':
            in_str = True
        elif c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0:
                return j + 1
        j += 1
    return -1


def audit_file(path, table, verbose):
    src = open(path).read()
    # blank out the generated typed public surface: its `this.X((Object) ...)`
    # delegates ARE the typed facade, not consumers of the raw shape
    i = src.find('// --- BEGIN GENERATED TYPED PUBLIC SURFACE')
    if i >= 0:
        j = src.find('// --- END GENERATED TYPED PUBLIC SURFACE', i)
        j = len(src) if j < 0 else j
        src = src[:i] + '\n' * src[i:j].count('\n') + src[j:]
    lines = src.split('\n')
    marker_pos = src.find(MARKER)
    spans = method_spans(lines)
    leaks, ok = [], []
    names = set(table)
    call = re.compile(r'this\.(\w+?)(Async)?\(')
    # line-start offsets, to map a char offset back to a line index
    starts = [0]
    for l in lines[:-1]:
        starts.append(starts[-1] + len(l) + 1)

    def line_of(pos):
        lo, hi = 0, len(starts) - 1
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if starts[mid] <= pos:
                lo = mid
            else:
                hi = mid - 1
        return lo

    for m in call.finditer(src):
        name = m.group(1)
        is_async = m.group(2) is not None
        if name not in names:
            continue
        idx = line_of(m.start())
        stripped = lines[idx].strip()
        if stripped.startswith('//') or stripped.startswith('*'):
            continue
        fam = table[name]
        base = fam[5:-1] if fam.startswith('List<') else fam
        helper = ('from%sList' % base) if fam.startswith('List<') else ('from%s' % fam)
        end = balanced_call_end(src, m.end() - 1)
        after = src[end:] if end > 0 else ''
        before = src[:m.start()]
        joined = after.startswith(').join()') or after.startswith('.join()')
        # typeJavaCores.py emits `TypedCores.fromT((this.X(...)).join())`, so the
        # helper's '(' is followed by the call's own grouping '('.
        wrapped = re.search(r'io\.github\.ccxt\.TypedCores\.%s\(\s*\(?\s*$' % helper, before) is not None
        is_return = re.search(r'return\s*\(?\s*$', before) is not None
        enc = enclosing(spans, idx)
        hand_written = marker_pos >= 0 and m.start() < marker_pos
        site = (path, idx + 1, name, fam, stripped[:140])
        if wrapped:
            ok.append(('A-wrapped',) + site)
            continue
        if hand_written:
            leaks.append(('E-hand-written',) + site)
            continue
        same = enc is not None and enc[3] == fam
        if joined:
            kind = 'C-async' if is_async else 'A'
            if is_return:
                if same:
                    ok.append(('B-tail-same-family',) + site)
                else:
                    leaks.append(('B-tail-family-mismatch(%s)' % (enc[3] if enc else '?'),) + site)
            else:
                leaks.append((kind + '-unwrapped-join',) + site)
            continue
        # no join: the bare future is passed along
        chained = re.match(r'\)?\.thenApply\(io\.github\.ccxt\.TypedCores::%s\)' % helper, after) is not None
        if chained:
            ok.append(('D-future-chained-through-from',) + site)
            continue
        if is_return:
            if same:
                ok.append(('B-tail-future-same-family',) + site)
            else:
                leaks.append(('B-tail-future-mismatch(%s)' % (enc[3] if enc else '?'),) + site)
        else:
            leaks.append(('D-bare-future',) + site)
    return leaks, ok


def main():
    verbose = '--verbose' in sys.argv
    tc, pc = load_tables()
    # The generated tree has no separate wrapper layer: every `<X>.java` under
    # exchanges/ is a core carrying its typed public surface (build/javaCoreSurface.ts).
    crypto = [os.path.join(ROOT, 'Exchange.java'), os.path.join(ROOT, 'BaseExchange.java')] + [
        p for p in glob.glob(ROOT + '/exchanges/**/*.java', recursive=True) if '/prediction/' not in p]
    pred = [os.path.join(ROOT, 'PredictionExchange.java')] + glob.glob(ROOT + '/exchanges/prediction/*.java')
    all_leaks, all_ok = [], []
    for p in crypto:
        l, o = audit_file(p, tc, verbose)
        all_leaks += l
        all_ok += o
    for p in pred:
        l, o = audit_file(p, pc, verbose)
        all_leaks += l
        all_ok += o
    kinds = {}
    for k in all_ok:
        kinds[k[0]] = kinds.get(k[0], 0) + 1
    print('OK call sites   : %d' % len(all_ok))
    for k in sorted(kinds):
        print('    %-32s %d' % (k, kinds[k]))
    kinds = {}
    for k in all_leaks:
        kinds[k[0]] = kinds.get(k[0], 0) + 1
    print('LEAK call sites : %d' % len(all_leaks))
    for k in sorted(kinds):
        print('    %-32s %d' % (k, kinds[k]))
    by_name = {}
    for k in all_leaks:
        by_name.setdefault(k[3], []).append(k)
    for name in sorted(by_name):
        print('  LEAK %-30s %d site(s)' % (name, len(by_name[name])))
        shown = by_name[name] if verbose else by_name[name][:3]
        for k in shown:
            print('       %s:%d  [%s]  %s' % (os.path.relpath(k[1], ROOT), k[2], k[0], k[5]))
    return 1 if all_leaks else 0


if __name__ == '__main__':
    sys.exit(main())
