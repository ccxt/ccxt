#!/usr/bin/env python3
"""SS-11b2: for every safeStringUpper/Lower* call with an IDENT default, prove the
identifier is declared String (local or param) in the ENCLOSING method."""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from importlib import util as iutil

spec = iutil.spec_from_file_location('census', str(Path(__file__).parent / 'ss11-casefamily-census.py'))
census = iutil.module_from_spec(spec)
spec.loader.exec_module(census)

JAVA = Path('/root/worktrees/ss-11/java')
ROOT = JAVA / 'lib/src/main/java/io/github/ccxt'

MODIFIERS = {'public', 'private', 'protected', 'static', 'final', 'synchronized',
             'abstract', 'default', 'native', 'strictfp'}
NON_METHOD = {'if', 'for', 'while', 'switch', 'catch', 'synchronized', 'try', 'do', 'else', 'new'}


def find_methods(toks):
    out = []
    for idx in range(len(toks)):
        if not (toks[idx][0] == 'SYM' and toks[idx][1] == '{'):
            continue
        j = idx - 1
        if j < 0 or toks[j][1] != ')':
            continue
        depth = 0
        k = j
        while k >= 0:
            t = toks[k][1]
            if t == ')':
                depth += 1
            elif t == '(':
                depth -= 1
                if depth == 0:
                    break
            k -= 1
        if k < 1 or toks[k - 1][0] != 'ID':
            continue
        name = toks[k - 1][1]
        if name in NON_METHOD:
            continue
        depth2 = 0
        close = None
        for q in range(idx, len(toks)):
            if toks[q][0] == 'SYM' and toks[q][1] == '{':
                depth2 += 1
            elif toks[q][0] == 'SYM' and toks[q][1] == '}':
                depth2 -= 1
                if depth2 == 0:
                    close = q
                    break
        if close is None:
            continue
        out.append({'name': name, 'open': idx, 'close': close, 'paren': k})
    return out


def decl_types(toks, name, lo, hi):
    """all declaration-ish occurrences of `name` in toks[lo:hi]: type word before it"""
    found = set()
    for i in range(lo, hi):
        if toks[i][0] != 'ID' or toks[i][1] != name:
            continue
        if i + 1 < len(toks):
            nxt = toks[i + 1][1]
            if nxt not in ('=', ';', ',', ')', ':'):
                continue
        prev = toks[i - 1][1] if i > 0 else None
        if prev in MODIFIERS:
            continue  # `public name(` etc.
        if prev is None:
            continue
        found.add(prev)
    return found


def main():
    base = (ROOT / 'BaseExchange.java').read_text()
    marker = base.index('METHODS BELOW THIS LINE ARE TRANSPILED')
    files = [('lib/BaseExchange.java#head', base[:marker])]
    for p in sorted(JAVA.rglob('*.java')):
        rel = str(p.relative_to(JAVA))
        if rel.startswith('build/') or '/build/' in rel:
            continue
        if p.name == 'BaseExchange.java' and p.parent == ROOT:
            continue
        files.append((rel, p.read_text(errors='replace')))

    bad = []
    good = 0
    for label, text in files:
        toks = list(census.tokenize(text))
        methods = find_methods(toks)
        for call in census.find_calls(toks):
            kind, txt = census.classify_default(call)
            if kind != 'ident':
                continue
            # skip the BaseExchange head wrappers' own forwarding calls
            if label.endswith('BaseExchange.java#head'):
                continue
            # enclosing method of the call
            m = None
            for mm in methods:
                if mm['open'] < call['i'] < mm['close']:
                    m = mm
                    break
            if m is None:
                bad.append((label, call['name'], txt, 'no enclosing method'))
                continue
            # params: scan between m['paren'] and the matching close paren (the '{' at m.open)
            decls = decl_types(toks, txt, m['paren'], m['open']) | decl_types(toks, txt, m['open'] + 1, m['close'])
            if decls == {'String'}:
                good += 1
            elif 'String' in decls and len(decls) == 1:
                good += 1
            else:
                bad.append((label, call['name'], txt, 'decl types: ' + repr(sorted(decls))))
    print('ident defaults proved String:', good)
    print('NOT proved:', len(bad))
    for b in bad:
        print('  ', b)


if __name__ == '__main__':
    main()
