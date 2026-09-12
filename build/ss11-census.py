#!/usr/bin/env python3
"""
SS-11 census: generated Java methods whose EVERY direct return expression is
provably String-or-null in the printed Java (so the method's return annotation
can become `String` with zero new casts).

Ground truth = the generated .java on disk (that is what javac sees).
Scanned: BaseExchange.java (transpiled suffix only), exchanges/**, and (for
collision checks) api/**.

Usage:  python3 build/ss11-census.py [--json out.json] [--context]
"""
import json
import re
import sys
from pathlib import Path

JAVA_ROOT = Path('/root/worktrees/ss-11/java/lib/src/main/java/io/github/ccxt')
BASE_EXCHANGE = JAVA_ROOT / 'BaseExchange.java'
BASE_MARKER = 'METHODS BELOW THIS LINE ARE TRANSPILED'

# ---------------------------------------------------------------- tokenizer

IDENT_START = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$')
IDENT_CONT = IDENT_START | set('0123456789')


def tokenize(src):
    toks = []
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c in ' \t\r\n':
            i += 1
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j < 0 else j
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if c == '"':
            j = i + 1
            while j < n:
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == '"':
                    j += 1
                    break
                j += 1
            toks.append(('STRING', src[i:j]))
            i = j
            continue
        if c == "'":
            j = i + 1
            while j < n:
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == "'":
                    j += 1
                    break
                j += 1
            toks.append(('CHAR', src[i:j]))
            i = j
            continue
        if c in IDENT_START:
            j = i
            while j < n and src[j] in IDENT_CONT:
                j += 1
            toks.append(('IDENT', src[i:j]))
            i = j
            continue
        if c.isdigit():
            j = i
            while j < n and (src[j].isalnum() or src[j] in '._'):
                j += 1
            toks.append(('NUM', src[i:j]))
            i = j
            continue
        if src.startswith('->', i):
            toks.append(('SYM', '->'))
            i += 2
            continue
        if src.startswith('::', i):
            toks.append(('SYM', '::'))
            i += 2
            continue
        toks.append(('SYM', c))
        i += 1
    return toks


MODIFIERS = {'public', 'private', 'protected', 'static', 'final', 'synchronized',
             'abstract', 'default', 'native', 'strictfp'}
NON_METHOD_NAMES = {'if', 'for', 'while', 'switch', 'catch', 'synchronized', 'try',
                    'do', 'else', 'new', 'case', 'assert', 'return'}


def find_methods(toks):
    """Return list of dicts {name, ret, open_idx, close_idx} for every method
    declaration in the token stream (any nesting)."""
    methods = []
    n = len(toks)
    for idx in range(n):
        kind, text = toks[idx]
        if not (kind == 'SYM' and text == '{'):
            continue
        j = idx - 1
        if j < 0 or toks[j][1] != ')':
            continue
        # match the paren
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
        if k < 1:
            continue
        if toks[k - 1][0] != 'IDENT':
            continue
        name = toks[k - 1][1]
        if name in NON_METHOD_NAMES:
            continue
        # return-type token candidates: walk back over modifiers/annotations
        m = k - 2
        ret = None
        while m >= 0:
            kk, tt = toks[m]
            if kk == 'IDENT' and tt in MODIFIERS:
                m -= 1
                continue
            if kk == 'IDENT' and tt == 'Override':  # annotation tail
                m -= 1
                continue
            if kk == 'SYM' and tt == '@':
                m -= 1
                continue
            break
        if m >= 0 and toks[m][0] == 'IDENT':
            ret = toks[m][1]
        # find matching close brace
        depth2 = 0
        close = None
        for q in range(idx, n):
            kk, tt = toks[q]
            if kk == 'SYM' and tt == '{':
                depth2 += 1
            elif kk == 'SYM' and tt == '}':
                depth2 -= 1
                if depth2 == 0:
                    close = q
                    break
        if close is None:
            continue
        methods.append({'name': name, 'ret': ret, 'open': idx, 'close': close})
    return methods


def direct_returns(toks, m):
    """Collect (start_idx, end_idx) token index ranges of `return ... ;`
    statements that belong to method m itself (not to nested lambdas / anon
    class bodies)."""
    returns = []
    stack = []  # kinds: 'block' | 'function'
    i = m['open'] + 1
    end = m['close']
    while i < end:
        kind, text = toks[i]
        if kind == 'SYM' and text == '{':
            # classify this brace by the header between the previous statement
            # boundary and here
            j = i - 1
            header = []
            while j > m['open']:
                kk, tt = toks[j]
                if kk == 'SYM' and tt in (';', '{', '}'):
                    break
                header.append((kk, tt))
                j -= 1
            hdr = [t for _, t in header]
            is_func = any(t == '->' for t in hdr)
            if not is_func and 'new' in hdr and hdr and hdr[-1] not in ('.',):
                # `new Foo(...) {` anon class / array init
                if hdr[-1] == ')' or hdr[-1] == '>' or hdr[-1] == ']':
                    is_func = True
            stack.append('function' if is_func else 'block')
            i += 1
            continue
        if kind == 'SYM' and text == '}':
            if stack:
                stack.pop()
            i += 1
            continue
        if kind == 'IDENT' and text == 'return' and all(s == 'block' for s in stack):
            # expression: until `;` at nesting 0
            dep = 0
            j = i + 1
            while j < end:
                kk, tt = toks[j]
                if kk == 'SYM':
                    if tt in ('(', '[', '{'):
                        dep += 1
                    elif tt in (')', ']', '}'):
                        dep -= 1
                    elif tt == ';' and dep == 0:
                        break
                j += 1
            returns.append((i + 1, j))
            i = j + 1
            continue
        i += 1
    return returns


# ---------------------------------------------------- hand-written vocab

def is_generated(path):
    head = path.read_text(errors='replace')[:400]
    return 'GENERATED AND WILL BE OVERWRITTEN' in head


HAND_WRITTEN_STRING_METHODS = set()      # name -> declared String somewhere
HAND_WRITTEN_OTHER_METHODS = set()       # name -> declared non-String somewhere
HAND_WRITTEN_STRING_FIELDS = set()


def scan_hand_written():
    """BaseExchange head + every non-generated java file under java/lib/.../io/github/ccxt"""
    files = []
    head_text = BASE_EXCHANGE.read_text(errors='replace')
    marker = head_text.index(BASE_MARKER)
    files.append(('BaseExchange.java#head', head_text[:marker]))
    for p in sorted(JAVA_ROOT.rglob('*.java')):
        if p == BASE_EXCHANGE:
            continue
        if is_generated(p):
            continue
        files.append((str(p.relative_to(JAVA_ROOT)), p.read_text(errors='replace')))
    for label, text in files:
        toks = tokenize(text)
        for m in find_methods(toks):
            if m['ret'] is None:
                continue
            if m['ret'] == 'String':
                HAND_WRITTEN_STRING_METHODS.add(m['name'])
            elif m['ret'] not in MODIFIERS:
                HAND_WRITTEN_OTHER_METHODS.add(m['name'])
        # fields `public String id =` etc.
        for i in range(len(toks) - 2):
            if toks[i][1] == 'String' and toks[i + 1][0] == 'IDENT' and toks[i + 2][1] in ('=', ';'):
                HAND_WRITTEN_STRING_FIELDS.add(toks[i + 1][1])
    return files


# case-cast family the emitter can cast at return sites
CASE_FAMILY = {'safeStringUpper', 'safeStringUpper2', 'safeStringUpperN',
               'safeStringLower', 'safeStringLower2', 'safeStringLowerN'}


def classify_expr(toks, expr, method, proven, local_decl):
    """expr = list of (kind, text). Returns (verdict, reason).
    verdict: 'ok' (statically String), 'cast' (String-or-null box needing the
    existing (String) return checkcast) or 'no'."""
    s = expr
    # strip fully-wrapping parens (but NOT the `(String) x` cast form)
    while len(s) >= 2 and s[0][1] == '(' and s[-1][1] == ')' and matching_paren(s, 0) == len(s) - 1:
        # don't strip a cast: `( String ) expr`
        if len(s) >= 3 and s[1][0] == 'IDENT' and s[1][1] in ('String', 'Object') and s[2][1] == ')':
            break
        s = s[1:-1]
    if not s:
        return ('no', 'empty')
    # string literal
    if len(s) == 1 and s[0][0] == 'STRING':
        return ('ok', 'string literal')
    if len(s) == 1 and s[0][1] == 'null':
        return ('ok', 'null')
    if len(s) == 1 and s[0][0] == 'IDENT':
        name = s[0][1]
        if name in local_decl:
            t = local_decl[name]
            if t == 'String':
                return ('ok', 'String local/param ' + name)
            return ('no', 'local/param %s typed %s' % (name, t))
        return ('no', 'identifier %s (no String declaration found)' % name)
    # `(String) x` explicit cast
    if s[0][1] == '(' and len(s) >= 3 and s[1][1] == 'String' and s[2][1] == ')':
        return ('ok', '(String) cast')
    # `((String)x).method(...)`
    if s[0][1] == '(' and len(s) >= 2 and s[1][1] == '(' and s[2][1] == 'String' and s[3][1] == ')':
        close = matching_paren(s, 1)
        if close is not None and close + 1 < len(s) and s[close + 1][1] == '.' and close + 2 < len(s):
            meth = s[close + 2][1]
            if meth in ('toUpperCase', 'toLowerCase', 'trim', 'replace', 'replaceAll',
                        'padStart', 'padEnd', 'slice', 'substring', 'substr', 'toString',
                        'concat', 'format', 'strip', 'repeat'):
                return ('ok', '((String)x).' + meth)
            return ('no', '((String)x).' + meth + ' not a String method')
        return ('no', 'cast receiver')
    # this.<name>(...) / super.<name>(...) / Precise.<name>(...) / Helpers.<name>(...)
    if len(s) >= 4 and s[0][0] == 'IDENT' and s[1][1] == '.' and s[2][0] == 'IDENT' and s[3][1] == '(':
        obj, name = s[0][1], s[2][1]
        if obj == 'this' or obj == 'super':
            if name in CASE_FAMILY:
                return ('cast', name)
            if obj == 'super':
                if name in HAND_WRITTEN_STRING_METHODS:
                    return ('ok', 'super.' + name)
                return ('no', 'super.' + name + ' (hand-written decl not String)')
            if name in proven:
                return ('ok', 'this.' + name + ' (proven String)')
            if name in HAND_WRITTEN_STRING_METHODS:
                return ('ok', 'this.' + name + ' (hand-written String)')
            return ('no', 'this.' + name + ' (not proven String)')
        if obj == 'Precise':
            if name in PRECISE_STRING_STATICS:
                return ('ok', 'Precise.' + name)
            return ('no', 'Precise.' + name)
        if obj == 'Helpers':
            if name == 'slice':
                return ('ok', 'Helpers.slice')
            if name == 'add':
                # first argument decides the overload
                v, why = classify_expr(toks, arg_slice(s, 3), method, proven, local_decl)
                if v == 'ok':
                    return ('ok', 'Helpers.add(String, *)')
                return ('no', 'Helpers.add with non-String left')
            return ('no', 'Helpers.' + name)
        if obj == 'String':
            if name in ('valueOf', 'join', 'format'):
                return ('ok', 'String.' + name)
            return ('no', 'String.' + name)
        return ('no', obj + '.' + name)
    # bare call `name(...)`
    if s[0][0] == 'IDENT' and len(s) >= 2 and s[1][1] == '(':
        name = s[0][1]
        if name in HAND_WRITTEN_STRING_METHODS:
            return ('ok', 'bare ' + name)
        return ('no', 'bare call ' + name)
    # `this.<field>` read
    if len(s) == 3 and s[0][1] == 'this' and s[1][1] == '.' and s[2][0] == 'IDENT':
        if s[2][1] in HAND_WRITTEN_STRING_FIELDS:
            return ('ok', 'String field this.' + s[2][1])
        return ('no', 'field this.' + s[2][1])
    # `Helpers.add(...)` handled above; reject everything else
    joined = ''.join(t for _, t in s[:12])
    return ('no', 'unclassified: ' + joined[:60])


def matching_paren(toks, i):
    if toks[i][1] != '(':
        return None
    depth = 0
    j = i
    while j < len(toks):
        t = toks[j][1]
        if t == '(':
            depth += 1
        elif t == ')':
            depth -= 1
            if depth == 0:
                return j
        j += 1
    return None


def arg_slice(toks, open_idx):
    close = matching_paren(toks, open_idx)
    if close is None:
        return []
    return toks[open_idx + 1:close]


# Precise string statics
PRECISE_STRING_STATICS = set()


def scan_precise():
    p = JAVA_ROOT / 'base' / 'Precise.java'
    text = p.read_text(errors='replace')
    for m in re.finditer(r'public static String (\w+)\s*\(', text):
        PRECISE_STRING_STATICS.add(m.group(1))


# ---------------------------------------------------- local declaration map

NUMERIC_TYPES = {'Object', 'Long', 'Double', 'Boolean', 'Integer', 'Float',
                 'Number', 'Short', 'Byte', 'var', 'Map', 'List'}


def local_declarations(toks, m):
    """name -> 'String' | other type text, for the method's params + body locals.
    Conservative: any non-String declaration wins over a String one."""
    decls = {}
    # params
    j = m['open'] - 1
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
    params = toks[k + 1:j]
    scan_decl_list(param_tokens_flat(params), decls)
    scan_decl_list(toks[m['open'] + 1:m['close']], decls)
    # varargs `Object... optionalArgs` and `String... x`
    for i in range(len(params) - 3):
        if params[i + 1][1] == '.' and params[i + 2][1] == '.' and params[i + 3][0] == 'IDENT':
            decls.setdefault(params[i + 3][1], 'String' if params[i][1] == 'String' else params[i][1])
    return decls


def param_tokens_flat(params):
    return params


def scan_decl_list(toks, decls):
    n = len(toks)
    for i in range(n):
        kind, text = toks[i]
        if kind != 'IDENT':
            continue
        nxt = toks[i + 1][1] if i + 1 < n else None
        if nxt not in ('=', ';', ',', ')', ':'):
            continue
        # look back: `Type name`
        prev = toks[i - 1] if i > 0 else None
        if prev is None or prev[0] != 'IDENT':
            continue
        pv = prev[1]
        if pv not in NUMERIC_TYPES and pv != 'String' and pv not in ('boolean', 'int', 'long', 'double'):
            # check the pattern `... < Object > name` -> generic decl
            if prev[0] == 'IDENT' and pv in ('Object',):
                pass
        # only register when the pattern is clearly a declaration: TYPE name (=|;|,|))
        if pv == 'String':
            prev2 = toks[i - 2][1] if i >= 2 else None
            if prev2 == '.':
                continue
            if text in decls:
                # keep the non-String one
                pass
            else:
                decls[text] = 'String'
        elif pv in NUMERIC_TYPES or pv in ('boolean', 'int', 'long', 'double'):
            decls[text] = pv
        # generic: `List < Object > name` / `Map < ... > name`
        if prev[1] == '>' and i >= 1:
            decls[text] = 'generic'
    # type tokens like `java.util.List<Object> t` end with `>` before name
    for i in range(1, n):
        if toks[i][0] == 'IDENT' and toks[i - 1][1] == '>':
            nxt = toks[i + 1][1] if i + 1 < n else None
            if nxt in ('=', ';', ',', ')'):
                decls[toks[i][1]] = decls.get(toks[i][1], 'generic')


# ---------------------------------------------------- main census

def load_generated_methods():
    """-> list of (file_label, method, returns, toks)"""
    out = []
    text = BASE_EXCHANGE.read_text(errors='replace')
    suffix = text[text.index(BASE_MARKER):]
    files = [('BaseExchange.java#suffix', suffix)]
    for p in sorted((JAVA_ROOT / 'exchanges').rglob('*.java')):
        files.append((str(p.relative_to(JAVA_ROOT)), p.read_text(errors='replace')))
    for label, src in files:
        toks = tokenize(src)
        for m in find_methods(toks):
            rets = direct_returns(toks, m)
            out.append((label, m, rets, toks))
    return out


CURRENT_STRING_RETURN = set(re.findall(r"'([A-Za-z0-9_]+)'", re.search(
    r'JAVA_STRING_RETURN_METHODS = new Set \(\[(.*?)\]\);', (Path('/root/worktrees/ss-11/build/java-local-types.js')).read_text(), re.S).group(1)))
CURRENT_CASE_CAST = set(re.findall(r"'([A-Za-z0-9_]+)'", re.search(
    r'JAVA_STRING_RETURN_METHODS_CASE_CAST = new Set \(\[(.*?)\]\);', (Path('/root/worktrees/ss-11/build/java-local-types.js')).read_text(), re.S).group(1)))
CURRENT_LIST_RETURN = set(re.findall(r"'([A-Za-z0-9_]+)'", re.search(
    r'JAVA_LIST_RETURN_METHODS = new Set \(\[(.*?)\]\);', (Path('/root/worktrees/ss-11/build/java-local-types.js')).read_text(), re.S).group(1)))


def main():
    scan_hand_written()
    scan_precise()
    gen = load_generated_methods()

    # group declarations by name; only Object-returning ones are candidates
    by_name = {}
    for label, m, rets, toks in gen:
        by_name.setdefault(m['name'], []).append((label, m, rets, toks))

    known_string = set(CURRENT_STRING_RETURN) | set(CURRENT_CASE_CAST) | HAND_WRITTEN_STRING_METHODS

    # names that are Object-returning somewhere (candidate pool)
    pool = set()
    for name, decls in by_name.items():
        if name in CURRENT_STRING_RETURN or name in CURRENT_CASE_CAST or name in CURRENT_LIST_RETURN:
            continue
        if any(d[1]['ret'] == 'Object' for d in decls):
            pool.add(name)

    # per-decl classification (with a fixpoint on the proven set)
    def eval_decl(decl, proven):
        label, m, rets, toks = decl
        if m['ret'] != 'Object':
            # already typed (String/List/etc.) - not part of this census decision
            return ('skip', m['ret'] or 'ctor')
        if not rets:
            return ('vacuous', 'no return statements')
        loc = local_declarations(toks, m)
        verdicts = []
        for (a, b) in rets:
            v, why = classify_expr(toks, toks[a:b], m, proven, loc)
            verdicts.append((v, why))
        if all(v == 'ok' for v, _ in verdicts):
            return ('ok', verdicts)
        if all(v in ('ok', 'cast') for v, _ in verdicts):
            return ('cast', verdicts)
        bad = [(v, w) for v, w in verdicts if v == 'no']
        return ('no', bad[:3])

    # decls for a name must be invariant: every decl of the name (incl. any
    # already-typed ones) participates
    proven = set(known_string)
    added = True
    while added:
        added = False
        for name in sorted(pool):
            if name in proven:
                continue
            decls = by_name[name]
            ok = True
            for d in decls:
                st, _ = eval_decl(d, proven | {name})
                if st not in ('ok', 'skip'):
                    ok = False
                    break
            if ok:
                proven.add(name)
                added = True

    # collect results
    results = {'ok': {}, 'cast': {}, 'no': {}}
    # re-run for reporting (proven = final set minus the name itself for fairness)
    final = set(known_string) | set(pool)
    report = []
    for name in sorted(pool):
        decls = by_name[name]
        verdicts_per_decl = []
        for d in decls:
            st, info = eval_decl(d, proven)
            verdicts_per_decl.append((d[0], st, info))
        worst = 'no'
        if all(s in ('ok', 'skip') for _, s, _ in verdicts_per_decl):
            worst = 'ok' if name in proven else 'unstable'
        elif all(s in ('ok', 'cast', 'skip') for _, s, _ in verdicts_per_decl):
            worst = 'cast'
        report.append({
            'name': name,
            'n_decls': len(decls),
            'files': sorted({d[0] for d in decls}),
            'verdict': worst,
            'detail': [{'file': f, 'v': s,
                        'info': (i if isinstance(i, str) else [list(x) for x in i])}
                       for f, s, i in verdicts_per_decl],
        })

    out = {
        'ok': [r for r in report if r['verdict'] == 'ok'],
        'cast': [r for r in report if r['verdict'] == 'cast'],
        'no': [r for r in report if r['verdict'] not in ('ok', 'cast')],
    }
    if '--json' in sys.argv:
        dest = sys.argv[sys.argv.index('--json') + 1]
        Path(dest).write_text(json.dumps(out, indent=1))
    print('=== PURE (no cast needed) %d ===' % len(out['ok']))
    for r in out['ok']:
        print('  %-42s decls=%d  %s' % (r['name'], r['n_decls'], ','.join(r['files'])[:110]))
    print('=== CAST (safeStringUpper/Lower returns) %d ===' % len(out['cast']))
    for r in out['cast']:
        has_other = any(d['v'] == 'cast' for d in r['detail'])
        print('  %-42s decls=%d  %s%s' % (r['name'], r['n_decls'], ','.join(r['files'])[:90],
                                          ' [case-family sites]' if has_other else ''))
    print('=== REJECTED %d ===' % len(out['no']))
    if '--context' in sys.argv:
        for r in out['no']:
            why = '; '.join(sorted({str(d['info'])[:80] for d in r['detail']}))
            print('  %-42s %s' % (r['name'], why[:150]))


if __name__ == '__main__':
    main()
