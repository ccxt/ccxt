#!/usr/bin/env python3
"""One-shot: add the `__raw` retention field to the preserved dictionary-wrapper
type classes (Tickers, Currencies, OrderBooks, ...). build/typeEmitters/java.ts
PRESERVES an existing dictionary wrapper verbatim (renderDictionary -> existing.text),
so these files carry the field directly; new ones get it from the emitter.

Idempotent: a file that already declares __raw is left alone.
"""
import glob
import os
import re

TYPES = 'java/lib/src/main/java/io/github/ccxt/types'
SKIP = {'TypeHelper.java', 'LeverageTiers.java'}   # helper; LeverageTiers is non-invertible

FIELD_RE = re.compile(r'^    public [A-Za-z0-9_<> ,\[\]]+;$')
CTOR_RE = re.compile(r'^    public (\w+)\(Object raw\) \{$')

changed = []
for path in sorted(glob.glob(os.path.join(TYPES, '*.java'))):
    base = os.path.basename(path)
    if base in SKIP:
        continue
    lines = open(path).read().split('\n')
    if any('__raw' in l for l in lines):
        continue
    ctor_i = next((i for i, l in enumerate(lines) if CTOR_RE.match(l)), None)
    if ctor_i is None:
        continue
    first_ctor = CTOR_RE.match(lines[ctor_i])
    assert first_ctor is not None
    cls = first_ctor.group(1)
    field_i = max(i for i in range(ctor_i) if FIELD_RE.match(lines[i]))
    field = [
        '    // Lossless inverse support (build/typeEmitters/java.ts): TypedCores helpers',
        '    // hand this payload back, never a field-set rebuild.',
        '    public final Object __raw;',
    ]
    lines = lines[:field_i + 1] + field + lines[field_i + 1:]
    ctor_i = next(i for i, l in enumerate(lines) if CTOR_RE.match(l))
    lines = lines[:ctor_i + 1] + ['        this.__raw = raw;'] + lines[ctor_i + 1:]
    open(path, 'w').write('\n'.join(lines))
    changed.append(base)

print('patched %d files: %s' % (len(changed), ', '.join(changed)))
