# Computes the closed set of C# core methods that can move from `Task<object>` to a typed
# `Task<T>` (see TYPED_CORES in build/csharpTranspiler.ts).
#
# A name is admissible only when every generated *core* call site is a tail
# `return await this.X(...)` (or already funnelled through a To*/From* helper) — anything
# assigning the result into an `object` local would leak a boxed struct into untyped code,
# where getValue() silently returns null.
#
# Reflective dispatch (fetchPaginatedCall*, callDynamically) is NOT a blocker any more:
# AwaitAsObject re-boxes through FromTyped, so the untyped pagination pipeline still sees
# dictionaries. It is reported for the record.
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

WRAPPER_DIRS = ('cs/ccxt/wrappers',)
WRAPPER_FILES = ('cs/ccxt/base/Exchange.Wrappers.cs', 'cs/ccxt/base/Exchange.TradingWrappers.cs')
HANDWRITTEN = ('cs/ccxt/base/Exchange.cs', 'cs/ccxt/base/Exchange.WsBridge.cs',
               'cs/ccxt/base/Exchange.Thin.cs', 'cs/ccxt/base/Exchange.MetaData.cs',
               'cs/ccxt/base/Exchange.Misc.cs', 'cs/ccxt/base/Exchange.Generic.cs',
               'cs/ccxt/base/Exchange.TranspileHelpers.cs')

CORE_GLOBS = ['cs/ccxt/base/Exchange.BaseMethods.cs', 'cs/ccxt/base/Exchange.TradingMethods.cs',
              'cs/ccxt/base/PredictionExchange.cs']


def rel(p):
    return os.path.relpath(p, ROOT)


def walk_cs(sub):
    for dirpath, _dirs, files in os.walk(os.path.join(ROOT, sub)):
        for f in files:
            if f.endswith('.cs'):
                yield os.path.join(dirpath, f)


def core_files():
    out = [os.path.join(ROOT, p) for p in CORE_GLOBS]
    for p in walk_cs('cs/ccxt/exchanges'):
        out.append(p)
    return [p for p in out if os.path.exists(p)]


def wrapper_files():
    out = [os.path.join(ROOT, p) for p in WRAPPER_FILES]
    for d in WRAPPER_DIRS:
        out.extend(walk_cs(d))
    return [p for p in out if os.path.exists(p)]


WRAP_SIG = re.compile(r'^\s*public (?:async )?(Task<(?P<t>.+?)>|[\w<>,. ]+) (?P<name>[A-Z]\w*)\(')
RES_CALL = re.compile(r'var res = (?:await )?this\.(?P<core>\w+)\(')


def scan_wrappers():
    """core name -> {'type': declared wrapper inner type, 'conv': [(file:line, expr)], 'plain': n}"""
    info = {}
    for path in wrapper_files():
        lines = open(path, encoding='utf-8').read().split('\n')
        for i, line in enumerate(lines):
            m = RES_CALL.search(line)
            if not m:
                continue
            core = m.group('core')
            # walk back to the signature
            sig = None
            for j in range(i - 1, max(-1, i - 12), -1):
                s = WRAP_SIG.match(lines[j])
                if s:
                    sig = s
                    break
            # the return statement: next non-blank lines until the closing brace
            ret = []
            for j in range(i + 1, min(len(lines), i + 14)):
                if lines[j].rstrip() == '    }':
                    break
                ret.append(lines[j].strip())
            expr = ' '.join(x for x in ret if x)
            rec = info.setdefault(core, {'type': None, 'conv': [], 'plain': 0,
                                         'types': set(), 'ptypes': set(), 'sigtypes': set()})
            pred = '/prediction/' in path or 'PredictionExchange' in path
            if sig:
                t = sig.group('t') or sig.group(1)
                rec['sigtypes'].add(t)
                rec['type'] = t
            if expr == 'return res;':
                rec['plain'] += 1
            else:
                rec['conv'].append(('%s:%d' % (rel(path), i + 2), expr[:160]))
                # the target family is read off the conversion itself, not off the signature:
                # `new Order(res)` / `.Select(item => new Order(item))`. A signature-derived
                # type is wrong whenever the wrapper's declared type and its body disagree.
                t = None
                m2 = re.search(r'\.Select\(item => new (\w+)\(item\)\)', expr)
                if m2:
                    t = 'List<%s>' % m2.group(1)
                else:
                    m2 = re.match(r'return new (\w+)\(res\);$', expr)
                    if m2:
                        t = m2.group(1)
                if t:
                    (rec['ptypes'] if pred else rec['types']).add(t)
    return info


def scan_core_callsites(names):
    """name -> {'tail': n, 'consuming': [file:line]} over generated cores only."""
    out = {n: {'tail': 0, 'consuming': [], 'decls': 0} for n in names}
    pats = {n: re.compile(r'\bthis\.%s\(' % re.escape(n)) for n in names}
    decl = re.compile(r'^\s*public async (?:virtual|override) Task<[^>]*(?:<[^>]*>)?[^>]*> (\w+)\(')
    for path in core_files():
        text = open(path, encoding='utf-8').read()
        lines = text.split('\n')
        for i, line in enumerate(lines):
            d = decl.match(line)
            if d and d.group(1) in out:
                out[d.group(1)]['decls'] += 1
            if 'this.' not in line:
                continue
            for n, p in pats.items():
                if not p.search(line):
                    continue
                stripped = line.strip()
                if stripped.startswith('return await this.%s(' % n):
                    out[n]['tail'] += 1
                elif re.match(r'return ccxt\.BaseExchange\.\w+\(await this\.%s\(' % n, stripped):
                    out[n]['tail'] += 1
                elif re.match(r'var res = await this\.%s\(' % n, stripped):
                    # the PascalCase wrapper itself, not a core call site
                    pass
                else:
                    out[n]['consuming'].append('%s:%d %s' % (rel(path), i + 1, stripped[:120]))
    return out


REFLECTIVE = re.compile(r"(?:fetchPaginatedCall\w*|safeDeterministicCall|callDynamically\w*|DynamicallyCallMethod)\s*\(\s*(?:this\s*,\s*)?[\"'](\w+)[\"']")


def scan_reflective():
    hits = {}
    for sub in ('ts/src', 'cs/ccxt'):
        for dirpath, _d, files in os.walk(os.path.join(ROOT, sub)):
            if 'node_modules' in dirpath:
                continue
            for f in files:
                if not (f.endswith('.ts') or f.endswith('.cs')):
                    continue
                path = os.path.join(dirpath, f)
                try:
                    text = open(path, encoding='utf-8').read()
                except Exception:
                    continue
                for m in REFLECTIVE.finditer(text):
                    hits.setdefault(m.group(1), 0)
                    hits[m.group(1)] += 1
    return hits


def handwritten_names():
    names = set()
    sig = re.compile(r'\bTask<[^(]*>\s+(\w+)\s*\(')
    for p in HANDWRITTEN:
        path = os.path.join(ROOT, p)
        if not os.path.exists(path):
            continue
        for m in sig.finditer(open(path, encoding='utf-8').read()):
            names.add(m.group(1))
    return names


def main():
    src = open(os.path.join(ROOT, 'build/csharpTranspiler.ts'), encoding='utf-8').read()
    # only the crypto-tier table counts as "already done": a name typed on the prediction
    # tier alone (createOrder -> PredictionOrder) is still Task<object> on BaseExchange
    tbl = src[src.index('const TYPED_CORES'):]
    tbl = tbl[:tbl.index('\n};')]
    already = set(re.findall(r"^\s*'(\w+)':", tbl, re.M))

    wrappers = scan_wrappers()
    # a candidate must actually MATERIALISE a struct in its wrapper (`new Order(res)` /
    # `.Select(item => new Order(item))`). Wrappers that only cast (`(Dictionary<string,
    # object>)res`, `(Int64)res`) are recorded separately — typing those cores buys nothing.
    candidates = {n: v for n, v in wrappers.items()
                  if (v['types'] or v['ptypes']) and n not in already}
    cast_only = sorted(n for n, v in wrappers.items()
                       if v['conv'] and not (v['types'] or v['ptypes']) and n not in already)
    calls = scan_core_callsites(list(candidates))
    reflective = scan_reflective()
    hw = handwritten_names()
    # families that HAVE a reverse helper available. Asked of the helper generator itself
    # (--capabilities), not of the generated file: the file only carries families already
    # in the table, which would make the decision circular.
    caps = json.loads(subprocess.run(
        [sys.executable, 'build/generateTypedCoreHelpers.py', '--capabilities'],
        cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    helpers = set(caps['reversible'])
    helpers.add('OHLCV')   # FromOHLCVList is hand-written in Exchange.TranspileHelpers.cs

    def family(t):
        return (t[5:-1] if t.startswith('List<') else t).replace('ccxt.', '')

    report = {}
    for n, v in sorted(candidates.items()):
        types = sorted(v['types'])
        ptypes = sorted(v['ptypes'])
        c = calls[n]
        blockers = []
        # the prediction tier is a sibling hierarchy with its own structs, so a different
        # struct there is expected, not a conflict. Only disagreement WITHIN a tier is.
        if len(types) > 1:
            blockers.append('crypto conversions disagree: %s' % types)
        if len(ptypes) > 1:
            blockers.append('prediction conversions disagree: %s' % ptypes)
        if n in hw:
            blockers.append('hand-written base declaration')
        needs_from = bool(c['consuming']) or reflective.get(n, 0) > 0
        missing = [t for t in (types + ptypes) if family(t) not in helpers]
        if needs_from and missing:
            blockers.append('no reverse From helper for %s' % missing)
        report[n] = {
            'crypto_type': types[0] if len(types) == 1 else types,
            'prediction_type': ptypes[0] if len(ptypes) == 1 else ptypes,
            'declared_wrapper_types': sorted(v['sigtypes']),
            'converting_wrappers': len(v['conv']),
            'plain_wrappers': v['plain'],
            'sample_conversion': v['conv'][0][1] if v['conv'] else '',
            'declarations': c['decls'],
            'tail_call_sites': c['tail'],
            'consuming_call_sites': c['consuming'][:6],
            'consuming_count': len(c['consuming']),
            'reflective_hits': reflective.get(n, 0),
            'needs_from_helper': needs_from,
            'blockers': blockers,
            'classification': 'typeable' if not blockers else 'blocked',
        }
    out = {'cast_only_wrappers': cast_only, 'cores': report}
    with open(os.path.join(ROOT, 'build/typedCoreCandidates.report.json'), 'w') as f:
        json.dump(out, f, indent=1, sort_keys=True)

    ok = [n for n, v in report.items() if v['classification'] == 'typeable']
    bad = [n for n, v in report.items() if v['classification'] == 'blocked']

    # ready-to-paste table rows for build/csharpTranspiler.ts
    crypto, pred = [], []
    for n in ok:
        if n.startswith('watch'):
            continue        # watch* returns live cache instances — see the PR body
        t, p = report[n]['crypto_type'], report[n]['prediction_type']
        if isinstance(t, str) and t:
            crypto.append("    '%s': '%s'," % (n, t.replace('ccxt.', '')))
        if isinstance(p, str) and p:
            pred.append("    '%s': '%s'," % (n, p.replace('ccxt.', '')))
    with open(os.path.join(ROOT, 'build/typedCoreTable.snippet.ts'), 'w') as f:
        f.write('// TYPED_CORES additions\n' + '\n'.join(sorted(crypto)) +
                '\n\n// PREDICTION_TYPED_CORES additions\n' + '\n'.join(sorted(pred)) + '\n')

    print('candidates', len(report), 'typeable', len(ok), 'blocked', len(bad),
          'cast-only wrappers', len(cast_only))
    for n in ok:
        print('  OK   %-34s %-26s pred=%-26s decls=%-4d tail=%-3d cons=%-3d refl=%-3d from=%s' % (
            n, report[n]['crypto_type'], report[n]['prediction_type'],
            report[n]['declarations'], report[n]['tail_call_sites'],
            report[n]['consuming_count'], report[n]['reflective_hits'],
            report[n]['needs_from_helper']))
    for n in bad:
        print('  X    %-34s %s' % (n, '; '.join(report[n]['blockers'])[:160]))
    return 0


if __name__ == '__main__':
    sys.exit(main())
