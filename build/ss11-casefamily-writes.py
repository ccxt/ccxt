#!/usr/bin/env python3
"""SS-11b3: audit the runtime box of every IDENT default of the case family.

For each call site with an identifier default, find the enclosing method, the
declaration of the identifier (param or local), and every write `name = <rhs>`;
classify each rhs as String-or-null valued (literal, safeString* call, typed
String local, ...) and report anything else."""
import re
import sys
from pathlib import Path
from importlib import util as iutil

HERE = Path(__file__).parent
spec = iutil.spec_from_file_location('census', str(HERE / 'ss11-casefamily-census.py'))
census = iutil.module_from_spec(spec)
spec.loader.exec_module(census)

JAVA = Path('/root/worktrees/ss-11/java')
ROOT = JAVA / 'lib/src/main/java/io/github/ccxt'

NON_METHOD = {'if', 'for', 'while', 'switch', 'catch', 'synchronized', 'try', 'do', 'else', 'new'}
MODIFIERS = {'public', 'private', 'protected', 'static', 'final', 'synchronized',
             'abstract', 'default', 'native', 'strictfp'}


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
        if toks[k - 1][1] in NON_METHOD:
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
        out.append({'open': idx, 'close': close, 'paren': k, 'name': toks[k - 1][1]})
    return out


STRING_VALUED_START = re.compile(
    r'^(".*"|null|this\.safeString\w*\(|this\.numberToString\(|this\.decimalToPrecision\(|'
    r'this\.iso8601\(|this\.safeString(Upper|Lower)\w*\(|Helpers\.(slice|replace|replaceAll|padEnd|padStart|urlencode\w*)\(|'
    r'((\w|\.)+\.)?(toUpperCase|toLowerCase|trim|substring|substr|toString|replace|replaceAll|padEnd|padStart|join|slice|format)\(|'
    r'.*\+.*|Helpers\.add->0)')
# separate helper: for binary expressions classify left operand


def classify_rhs(text, string_locals):
    t = text.strip()
    if t.startswith('"'):
        return True, 'literal'
    if t == 'null':
        return True, 'null'
    if re.match(r'^this\.safeString(Upper|Lower)\w*\(', t):
        return True, 'case-family'
    if re.match(r'^this\.safeString\w*\(|^this\.numberToString\(|^this\.decimalToPrecision\(|^this\.iso8601\(', t):
        return True, 'string accessor'
    if re.match(r'^Helpers\.(slice|replace|replaceAll|padEnd|padStart|urlencode\w*)\(', t):
        return True, 'Helpers string static'
    m = re.match(r'^Helpers\.add\((.*)$', t)
    if m:
        # left operand decides; find first arg
        depth = 0
        i = 0
        s = m.group(1)
        while i < len(s):
            if s[i] in '([':
                depth += 1
            elif s[i] in ')]':
                depth -= 1
            elif s[i] == ',' and depth == 0:
                break
            i += 1
        left = s[:i]
        return classify_rhs(left, string_locals)[0], 'Helpers.add(' + left[:40] + ')'
    if re.match(r'^[A-Za-z_$][\w$]*$', t):
        return (t in string_locals), 'ident ' + t
    if re.match(r'^\(String\)', t):
        return True, '(String) cast'
    if re.match(r'^\(\(String\)', t):
        return True, '((String) cast'
    return False, 'unclassified: ' + t[:60]


def main():
    base = (ROOT / 'BaseExchange.java').read_text()
    marker = base.index('METHODS BELOW THIS LINE ARE TRANSPILED')
    files = []
    for p in sorted(JAVA.rglob('*.java')):
        rel = str(p.relative_to(JAVA))
        if rel.startswith('build/') or '/build/' in rel:
            continue
        if p.name == 'BaseExchange.java' and p.parent == ROOT:
            files.append(('lib/BaseExchange.java#head', base[:marker]))
            continue
        files.append((rel, p.read_text(errors='replace')))

    reports = []
    for label, text in files:
        toks = list(census.tokenize(text))
        methods = find_methods(toks)
        for call in census.find_calls(toks):
            kind, name = census.classify_default(call)
            if kind != 'ident':
                continue
            if label.endswith('BaseExchange.java#head'):
                continue
            m = None
            for mm in methods:
                if mm['open'] < call['i'] < mm['close']:
                    m = mm
                    break
            if m is None:
                reports.append((label, name, 'NO METHOD', []))
                continue
            # declarations of name: type word before it
            decls = set()
            for i in range(m['paren'], m['close']):
                if toks[i][0] == 'ID' and toks[i][1] == name and i + 1 < len(toks):
                    if toks[i + 1][1] in ('=', ';', ',', ')', ':'):
                        prev = toks[i - 1][1]
                        if i > 0 and prev not in MODIFIERS and prev not in ('value', 'String.valueOf'):
                            decls.add(prev)
            # writes: `name = rhs ;`
            writes = []
            for i in range(m['open'] + 1, m['close']):
                if toks[i][0] == 'ID' and toks[i][1] == name and i + 1 < len(toks) and toks[i + 1][1] == '=':
                    # collect rhs until `;` at depth 0
                    dep = 0
                    rhs = []
                    j = i + 2
                    while j < m['close']:
                        k, tt, pp = toks[j]
                        if k == 'SYM':
                            if tt in '([':
                                dep += 1
                            elif tt in ')]':
                                dep -= 1
                            elif tt == ';' and dep == 0:
                                break
                        rhs.append((k, tt))
                        j += 1
                    writes.append(''.join(t for _, t in rhs))
            # String locals in the method (for ident-of-ident)
            string_locals = set()
            for i in range(m['paren'], m['close']):
                if toks[i][0] == 'ID' and toks[i][1] == 'String' and i + 1 < len(toks):
                    j = i + 1
                    while j < len(toks) and (toks[j][0] == 'ID' or toks[j][1] in '<>,[]'):
                        if toks[j][0] == 'ID':
                            string_locals.add(toks[j][1])
                            break
                        j += 1
            bad = []
            for w in writes:
                ok, why = classify_rhs(w, string_locals)
                if not ok:
                    bad.append(w[:80])
            reports.append((label, name, ','.join(sorted(decls)) or '?', bad, len(writes)))

    print('%-66s %-18s %-14s %s' % ('file', 'default', 'decl', 'bad writes'))
    nbad = 0
    for r in reports:
        label = r[0].replace('lib/src/main/java/io/github/ccxt/', '')
        bad = r[3] if len(r) > 3 else []
        if bad:
            nbad += 1
            print('%-66s %-18s %-14s %s' % (label, r[1], r[2], bad))
    print('sites with unproven writes:', nbad, '/', len(reports))
    for r in reports[:5]:
        if not (r[3] if len(r) > 3 else []):
            print('clean:', r[0].split('/')[-1], r[1], r[2])


if __name__ == '__main__':
    main()
