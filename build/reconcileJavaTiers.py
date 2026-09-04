#!/usr/bin/env python3
"""
Reconcile the two tier tables against the actual Java class hierarchy.

PredictionExchange extends BaseExchange, so a method DECLARED ONLY on the crypto
base (BaseExchange.java / Exchange.java) is SHARED by both tiers: it has exactly
one return type for everybody. If the prediction wrapper for that name expects a
Prediction* family while the crypto wrapper expects the crypto family, the shared
declaration cannot satisfy both -- so the name is untypeable and must be dropped
from BOTH tables.

This is the Java form of the #30107 lesson ("methods declared on BaseExchange are
shared by both tiers and therefore cannot diverge -> CS0508").

A name is safe on the prediction tier only if the prediction hierarchy actually
re-declares it (PredictionExchange.java or exchanges/prediction/*Core.java),
which gives the tier its own override to type independently.
"""
import re, os, glob, json, sys

ROOT = 'java/lib/src/main/java/io/github/ccxt'
TABLE = 'build/javaTypedCores.ts'

s = open(TABLE).read()


def tbl(name):
    i = s.index('export const ' + name)
    j = s.index('};', i)
    return dict(re.findall(r"'(\w+)':\s*'([^']+)'", s[i:j]))


tc, pc = tbl('TYPED_CORES'), tbl('PREDICTION_TYPED_CORES')

# Names whose generated wrapper declares `List<T>` but whose cores actually return a
# DICTIONARY keyed by network / symbol at runtime. The declared type is the wrapper's
# view; the runtime shape is what the next call site sees. Typing these makes
# `toXList(dict)` yield null, which surfaces as InvalidAddress ("cannot find BTC deposit
# address") or a null greeks map — i.e. exactly the silent-null class of bug that a green
# build does not show. They are non-invertible containers in practice, so they are opted
# out here (and the names that consume them cascade out with them).
RUNTIME_DICT_OPT_OUT = {
    'fetchDepositAddressesByNetwork': 'returns a dict keyed by network, not a List<DepositAddress>',
    'fetchDepositAddress': 'consumes fetchDepositAddressesByNetwork via safeDict',
    'fetchAllGreeks': 'returns a dict keyed by symbol, not a List<Greeks>',
}
for _n in RUNTIME_DICT_OPT_OUT:
    tc.pop(_n, None)
    pc.pop(_n, None)

decl = re.compile(r'public java\.util\.concurrent\.CompletableFuture<[^>]*(?:<[^>]*>)?[^>]*> (\w+)\(')


def declared_in(paths):
    out = set()
    for p in paths:
        for m in decl.finditer(open(p).read()):
            out.add(m.group(1))
    return out


pred_paths = [os.path.join(ROOT, 'PredictionExchange.java')] + glob.glob(ROOT + '/exchanges/prediction/*Core.java')
pred_declared = declared_in(pred_paths)

# What the PREDICTION wrappers actually convert each name to. This is the real
# constraint: it is set by the generated public API, not by our table. A name can
# be absent from PREDICTION_TYPED_CORES (dropped by the closure) and still have a
# prediction wrapper doing `new PredictionOrder(res)` -- if the core it calls is
# the SHARED crypto declaration and we typed that to Order, the prediction
# wrapper stops compiling.
pred_wrapper_fam = {}
conv = re.compile(r'return (?:new (\w+)\(res\)|toTypedList\(res, (\w+)::new\));')
for p in glob.glob(ROOT + '/exchanges/prediction/*.java'):
    if p.endswith('Core.java'):
        continue
    txt = open(p).read()
    for m in re.finditer(
            r'Object res = Helpers\.joinUnwrapped\(super\.(\w+)\([^;]*\)\);\s*\n\s*'
            r'return (?:new (\w+)\(res\)|toTypedList\(res, (\w+)::new\));', txt):
        pred_wrapper_fam.setdefault(m.group(1), set()).add(m.group(2) or m.group(3))

drop_both, keep_pred = [], []
names = sorted(set(pc) | set(tc))
for name in names:
    cfam, pfam = tc.get(name), pc.get(name)
    if name in pred_declared:
        # prediction hierarchy re-declares the core -> each tier owns its override
        if pfam:
            keep_pred.append(name)
        continue
    # shared crypto declaration: the prediction wrapper must agree with it
    wf = pred_wrapper_fam.get(name)
    if wf is None:
        if pfam:
            keep_pred.append(name)
        continue
    base_c = cfam[5:-1] if cfam and cfam.startswith('List<') else cfam
    if cfam and wf != {base_c}:
        drop_both.append(name)
    elif pfam:
        keep_pred.append(name)

print('prediction names re-declared in the prediction hierarchy: %d' % len(pred_declared))
print('prediction entries kept  : %d' % len(keep_pred))
print('DROPPED from BOTH tables : %d  (shared base declaration, divergent family)' % len(drop_both))
for n in drop_both:
    print('    %-34s crypto=%-22s predictionWrapper=%s'
          % (n, tc.get(n, '<untyped>'), ','.join(sorted(pred_wrapper_fam.get(n, {'?'})))))

if '--write' in sys.argv:
    new_tc = {k: v for k, v in tc.items() if k not in drop_both}
    new_pc = {k: v for k, v in pc.items() if k not in drop_both}

    def render(name, d):
        body = ''.join("    '%s': '%s',\n" % (k, d[k]) for k in sorted(d))
        return 'export const %s: Record<string, string> = {\n%s};' % (name, body)

    out = s
    for nm, d in (('TYPED_CORES', new_tc), ('PREDICTION_TYPED_CORES', new_pc)):
        i = out.index('export const ' + nm)
        j = out.index('};', i) + 2
        out = out[:i] + render(nm, d) + out[j:]
    open(TABLE, 'w').write(out)
    print('\nwrote %s  TYPED_CORES=%d PREDICTION_TYPED_CORES=%d'
          % (TABLE, len(new_tc), len(new_pc)))
