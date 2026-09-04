#!/usr/bin/env python3
"""
Compute the closed allowlist for the typed Java cores (build/javaTypedCores.ts)
from the generated Java tree, and iterate to a fixed point.

The tables in build/javaTypedCores.ts are DERIVED. Never hand-edit them: run

    python3 build/javaTypedCoresClosedSet.py            # report
    python3 build/javaTypedCoresClosedSet.py --write    # rewrite the tables
    python3 build/javaTypedCoresClosedSet.py --check    # non-zero if the tables drifted

A name is typed on a tier only if ALL of these hold (each is a measured rule;
none of them is a judgement call):

  1. wrapper agreement   every generated wrapper for the name converts via
                         `new T(res)` / `toTypedList(res, T::new)` with ONE family
                         T. A bare cast, or two families, makes the name untypeable.
  2. invertible family   T is reported by generateJavaTypedCoreHelpers.py --capabilities
                         (from* is an exact inverse via `__raw`).
  3. uniform declaration every declaration of the name on the tier (base + every
                         venue core) is in the transpiled `public
                         java.util.concurrent.CompletableFuture<...> name(...)` +
                         single `supplyAsync` tail shape that typeJavaCores.py can
                         retype. A hand-written declaration above the TRANSPILED
                         marker (BaseExchange.fetchMarkets / fetchCurrencies) cannot
                         be retyped, and Java generics are invariant, so one such
                         declaration excludes the name (C# CS0508 analogue).
  4. shared base         a name declared on BaseExchange.java is inherited by BOTH
                         Exchange and PredictionExchange. It must resolve to the same
                         family on both tiers, or be typed on neither.
  5. no hand-written consumer   no call site above the TRANSPILED marker receives
                         the value (loadMarkets consumes fetchMarkets/fetchCurrencies
                         through setMarkets, which expects raw maps).
  6. policy              parse* (inputs to further transpiled logic), *Ws (WS tier),
                         the SNAPSHOT_CORES (watchOrderBook*: typed to the live
                         WsOrderBook and copied on the core, not a unified family),
                         the WATCH_LIVE_CACHE_OPT_OUT container-shaped watch* names,
                         and the RUNTIME_SHAPE opt-outs whose declared List<T> is a
                         dict at runtime.

The generated tree has no separate wrapper layer: build/javaCoreSurface.ts emits
the typed public surface into every `<X>.java` core between the BEGIN/END
GENERATED TYPED PUBLIC SURFACE markers, delegating via `this.X((Object) ...)`.
Rule 1 therefore reads the surface block of each core; rules 3-5 read the part
of the file outside it.

Rules 1-3, 5, 6 are per-name; rule 4 couples the two tiers, so the whole thing is
iterated until no name is dropped.
"""
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

# Names whose generated wrapper declares `List<T>` but whose cores return a DICTIONARY
# keyed by network / symbol at runtime. `toXList(dict)` yields null silently.
RUNTIME_SHAPE_OPT_OUT = {
    'fetchDepositAddressesByNetwork': 'returns a dict keyed by network, not a List<DepositAddress>',
    'fetchDepositAddress': 'consumes fetchDepositAddressesByNetwork via safeDict',
    'fetchAllGreeks': 'returns a dict keyed by symbol, not a List<Greeks>',
}
# Container-shaped watch* names hand back the LIVE ws cache (a dict keyed by symbol /
# currency that the WsClient thread keeps mutating). Their unified containers are
# invertible via __raw, but typing them changes what a caller holds across updates
# (ccxt/ccxt#30110 left the C# equivalents untyped for the same reason). Deferred.
WATCH_LIVE_CACHE_OPT_OUT = {
    'watchTickers': 'live ws tickers cache (dict keyed by symbol)',
    'watchBidsAsks': 'live ws bids/asks cache (dict keyed by symbol)',
    'watchBalance': 'live ws balance cache',
    'watchOHLCVForSymbols': 'live ws ohlcv cache (dict keyed by symbol and timeframe)',
    'watchFundingRates': 'live ws funding-rate cache (dict keyed by symbol)',
    'watchFundingRatesForSymbols': 'live ws funding-rate cache (dict keyed by symbol)',
    'watchMarkPrices': 'live ws mark-price cache (dict keyed by symbol)',
}
# Prediction cancelAllOrders: kalshi/limitless/polymarket return PredictionOrder[], myriad
# declares Promise<any> and returns {cancelled_count, market_ids_affected}.
PREDICTION_OPT_OUT = {
    'cancelAllOrders': 'myriad returns {cancelled_count, market_ids_affected}, not PredictionOrder[]',
}

HEADER_STD = re.compile(r'^(\s*)public java\.util\.concurrent\.CompletableFuture<(.+?)> (\w+)\((.*)\)\s*$')
TAIL_STD = re.compile(r'^\s*\}\)(?:\.thenApply\(io\.github\.ccxt\.TypedCores::to\w+\))?;\s*$')
HEADER_ANY = re.compile(r'^\s*public (?:java\.util\.concurrent\.)?CompletableFuture<(.+?)> (\w+)\((.*)\)\s*\{?\s*$')
FQ = r'(?:io\.github\.ccxt\.types\.)?'
CONV = re.compile(r'Object res = Helpers\.(?:joinUnwrapped|joinTyped)\((?:super|this)\.(\w+)\([^;]*\)\);\s*\n\s*'
                  r'return (?:new ' + FQ + r'(\w+)\(res\)|toTypedList\(res, ' + FQ + r'(\w+)::new\)|Helpers\.joinTyped|(.+?));')
CONV_TYPED = re.compile(r'return Helpers\.joinTyped\((?:super|this)\.(\w+)\([^;]*\)\);')
TYPED_SYNC_SIG = re.compile(r'^\s*public (?:java\.util\.)?(List<' + FQ + r'(\w+)>|' + FQ + r'(\w+)) (\w+)\((.*)\) \{\s*$')
SURFACE_BEGIN = '// --- BEGIN GENERATED TYPED PUBLIC SURFACE'
SURFACE_END = '// --- END GENERATED TYPED PUBLIC SURFACE'


def split_surface(txt):
    """(core text, surface text). The surface block is replaced by blank lines in
    the core text so line numbers stay stable."""
    i = txt.find(SURFACE_BEGIN)
    if i < 0:
        return txt, ''
    j = txt.find(SURFACE_END, i)
    j = len(txt) if j < 0 else txt.find('\n', j) + 1
    surface = txt[i:j]
    return txt[:i] + '\n' * surface.count('\n') + txt[j:], surface


def core_files(tier):
    if tier == 'crypto':
        return [p for p in glob.glob(ROOT + '/exchanges/**/*.java', recursive=True) if '/prediction/' not in p]
    return sorted(glob.glob(ROOT + '/exchanges/prediction/*.java'))


def tier_files(tier):
    if tier == 'crypto':
        return [os.path.join(ROOT, 'BaseExchange.java'), os.path.join(ROOT, 'Exchange.java')] + core_files(tier)
    # PredictionExchange extends BaseExchange, so the BaseExchange stubs are the
    # prediction tier's declarations too (rule 4 forces them to one family).
    return [os.path.join(ROOT, 'BaseExchange.java'), os.path.join(ROOT, 'PredictionExchange.java')] + core_files(tier)


def wrapper_files(tier):
    """The typed public surface lives inside the cores (see module docstring)."""
    return core_files(tier)


def wrapper_families(tier):
    """name -> set of family strings the wrappers convert to ('CAST' for a bare cast).

    Handles both the pre-typing shape (`Object res = ...; return new T(res);`) and the
    post-typing shape (`return Helpers.joinTyped(super.X(...));`, whose family is the
    sync wrapper's declared return type) so the script is stable across pipeline runs.
    """
    fams = {}
    for p in wrapper_files(tier):
        txt = split_surface(open(p).read())[1]
        for m in CONV.finditer(txt):
            name = m.group(1)
            if m.group(2):
                fam = m.group(2)
            elif m.group(3):
                fam = 'List<%s>' % m.group(3)
            elif m.group(4) is None:
                continue  # joinTyped handled below
            else:
                fam = 'CAST'
            fams.setdefault(name, set()).add(fam)
        lines = txt.split('\n')
        for i, l in enumerate(lines):
            m = CONV_TYPED.search(l)
            if not m:
                continue
            name = m.group(1)
            sig = TYPED_SYNC_SIG.match(lines[i - 1]) if i > 0 else None
            if sig and sig.group(4) == name:
                fam = ('List<%s>' % sig.group(2)) if sig.group(2) else sig.group(3)
                fams.setdefault(name, set()).add(fam)
            else:
                fams.setdefault(name, set()).add('CAST')
    return fams


def find_body_end(lines, start):
    ind = max(len(lines[start]) - len(lines[start].lstrip()), 4)
    for i in range(start + 1, len(lines)):
        if lines[i].strip() and len(lines[i]) - len(lines[i].lstrip()) == ind and lines[i].strip() == '}':
            return i
    return -1


def declarations(tier):
    """name -> list of (path, 'std'|'nonstd', declared_family_or_None)."""
    out = {}
    for p in tier_files(tier):
        lines = split_surface(open(p).read())[0].split('\n')
        marker = next((i for i, l in enumerate(lines) if MARKER in l), None)
        for i, l in enumerate(lines):
            m = HEADER_ANY.match(l)
            if not m:
                continue
            name = m.group(2)
            if name.endswith('Async') and '{ return ' in l:
                continue  # the one-line async aliases are retyped separately
            std = HEADER_STD.match(l)
            shape = 'nonstd'
            if std and (marker is None or i > marker):
                end = find_body_end(lines, i)
                j = end - 1
                while j > i and not lines[j].strip():
                    j -= 1
                if end > 0 and TAIL_STD.match(lines[j]):
                    shape = 'std'
            out.setdefault(name, []).append((os.path.relpath(p, ROOT), shape))
    return out


def base_declared():
    txt = open(os.path.join(ROOT, 'BaseExchange.java')).read()
    out = set()
    for l in txt.split('\n'):
        m = HEADER_ANY.match(l)
        if m and not m.group(2).endswith('Async'):
            out.add(m.group(2))
    return out


def strip_comments(src):
    src = re.sub(r'/\*.*?\*/', '', src, flags=re.S)
    return re.sub(r'//[^\n]*', '', src)


def hand_written_consumers():
    """Names called as `this.X(` above the TRANSPILED marker in the hand-written bases."""
    out = set()
    for f in ('BaseExchange.java', 'Exchange.java', 'PredictionExchange.java'):
        txt = open(os.path.join(ROOT, f)).read()
        i = txt.find(MARKER)
        above = strip_comments(txt if i < 0 else txt[:i])
        for m in re.finditer(r'this\.(\w+)\(', above):
            out.add(m.group(1))
    return out


def capabilities():
    res = subprocess.run([sys.executable, os.path.join(HERE, 'generateJavaTypedCoreHelpers.py'), '--capabilities'],
                         capture_output=True, text=True, check=True)
    return set(json.loads(res.stdout)['families'])


def base_family(fam):
    return fam[5:-1] if fam.startswith('List<') else fam


def compute(verbose=False):
    caps = capabilities()
    hw = hand_written_consumers()
    shared = base_declared()
    tiers = {}
    reasons = {}
    for tier in ('crypto', 'prediction'):
        fams = wrapper_families(tier)
        decls = declarations(tier)
        table = {}
        for name in sorted(fams):
            fs = fams[name]
            why = None
            if name.startswith('parse') or name.endswith('Ws'):
                why = 'policy: parse*/*Ws are out of scope'
            elif name in snapshot_names():
                why = 'snapshot core: typed to the live WsOrderBook via SNAPSHOT_CORES, not a unified family'
            elif tier == 'prediction' and name.startswith('watch'):
                why = 'policy: PredictionExchange re-declares watch* untyped'
            elif name in WATCH_LIVE_CACHE_OPT_OUT:
                why = 'live ws cache: ' + WATCH_LIVE_CACHE_OPT_OUT[name]
            elif name in RUNTIME_SHAPE_OPT_OUT:
                why = 'runtime shape: ' + RUNTIME_SHAPE_OPT_OUT[name]
            elif tier == 'prediction' and name in PREDICTION_OPT_OUT:
                why = 'runtime shape: ' + PREDICTION_OPT_OUT[name]
            elif 'CAST' in fs:
                why = 'rule 1: a wrapper converts by bare cast'
            elif len(fs) != 1:
                why = 'rule 1: wrappers disagree on the family (%s)' % ', '.join(sorted(fs))
            else:
                fam = next(iter(fs))
                if base_family(fam) not in caps:
                    why = 'rule 2: family %s is not invertible' % fam
                elif name not in decls:
                    why = 'rule 3: no core declaration on this tier'
                else:
                    nonstd = [d for d in decls[name] if d[1] != 'std']
                    if nonstd:
                        why = 'rule 3: non-retypable declaration in %s' % ', '.join(sorted(set(d[0] for d in nonstd)))
                    elif name in hw:
                        why = 'rule 5: consumed by hand-written code above the TRANSPILED marker'
            if why:
                reasons[(tier, name)] = why
            else:
                table[name] = next(iter(fs))
        tiers[tier] = table
    # rule 4 (couples the tiers) -- iterate to a fixed point
    surfaced = {tier: set(wrapper_families(tier)) for tier in tiers}
    decls_by_tier = {tier: declarations(tier) for tier in tiers}
    rounds = 0
    while True:
        rounds += 1
        dropped = 0
        tc, pc = tiers['crypto'], tiers['prediction']
        for name in sorted(set(tc) | set(pc)):
            if name not in shared:
                continue
            c, p = tc.get(name), pc.get(name)
            if c == p:
                continue
            # One tier types the name and the other has NO surface for it (the
            # prediction surface emits no watch*): there is no wrapper to agree
            # with, so the coupling is only the BaseExchange declaration itself.
            # It is retyped by the typing tier, and Java generics are invariant,
            # so every override on the other tier must carry the same family:
            # adopt it when all of them are retypable, otherwise drop the name.
            typed_tier, other = ('crypto', 'prediction') if c is not None else ('prediction', 'crypto')
            fam = c if c is not None else p
            if (c is None) != (p is None) and name not in surfaced[other]:
                overrides = [d for d in decls_by_tier[other].get(name, []) if d[0] != 'BaseExchange.java']
                if not overrides:
                    continue
                if all(d[1] == 'std' for d in overrides):
                    tiers[other][name] = fam
                    reasons.pop((other, name), None)
                    continue
            why = 'rule 4: declared on shared BaseExchange, crypto=%s prediction=%s' % (c or '<untyped>', p or '<untyped>')
            for tier, tbl in (('crypto', tc), ('prediction', pc)):
                if name in tbl:
                    del tbl[name]
                    reasons[(tier, name)] = why
                    dropped += 1
        if verbose:
            print('round %d: dropped %d' % (rounds, dropped))
        if dropped == 0:
            break
    return tiers, reasons, rounds


def snapshot_names():
    s = open(TABLE).read()
    i = s.find('export const SNAPSHOT_CORES')
    if i < 0:
        return set()
    j = s.index('};', i)
    return set(re.findall(r"'(\w+)':\s*\{", s[i:j]))


def load_tables():
    s = open(TABLE).read()

    def tbl(name):
        i = s.index('export const ' + name)
        j = s.index('};', i)
        return dict(re.findall(r"'(\w+)':\s*'([^']+)'", s[i:j]))
    return s, tbl('TYPED_CORES'), tbl('PREDICTION_TYPED_CORES')


def render(name, d):
    body = ''.join("    '%s': '%s',\n" % (k, d[k]) for k in sorted(d))
    return 'export const %s: Record<string, string> = {\n%s};' % (name, body)


def main():
    verbose = '--verbose' in sys.argv
    tiers, reasons, rounds = compute(verbose)
    s, tc_old, pc_old = load_tables()
    tc, pc = tiers['crypto'], tiers['prediction']
    print('fixed point after %d round(s): TYPED_CORES=%d PREDICTION_TYPED_CORES=%d' % (rounds, len(tc), len(pc)))
    for tier, new, old in (('crypto', tc, tc_old), ('prediction', pc, pc_old)):
        added = sorted(set(new) - set(old))
        removed = sorted(set(old) - set(new))
        changed = sorted(n for n in set(new) & set(old) if new[n] != old[n])
        print('  %-10s +%d -%d ~%d' % (tier, len(added), len(removed), len(changed)))
        for n in added:
            print('     + %-34s %s' % (n, new[n]))
        for n in removed:
            print('     - %-34s %s  (%s)' % (n, old[n], reasons.get((tier, n), 'no longer has a converting wrapper')))
        for n in changed:
            print('     ~ %-34s %s -> %s' % (n, old[n], new[n]))
    if verbose:
        print('excluded:')
        for (tier, name), why in sorted(reasons.items()):
            print('  %-10s %-34s %s' % (tier, name, why))
    if '--write' in sys.argv:
        out = s
        for nm, d in (('TYPED_CORES', tc), ('PREDICTION_TYPED_CORES', pc)):
            i = out.index('export const ' + nm)
            j = out.index('};', i) + 2
            out = out[:i] + render(nm, d) + out[j:]
        open(TABLE, 'w').write(out)
        print('wrote %s' % os.path.relpath(TABLE, REPO))
    if '--check' in sys.argv and (tc != tc_old or pc != pc_old):
        print('STALE: build/javaTypedCores.ts does not match the computed closed set', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
