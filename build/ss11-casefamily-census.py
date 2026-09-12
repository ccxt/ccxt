#!/usr/bin/env python3
"""SS-11b census: every safeStringUpper/Lower* call in the java tree (generated + hand-written
+ tests): the default argument's provability, and the call's position as the LEFT operand of
a printer-emitted Helpers.add (the add(String, *) overload-switch corner)."""
import re
from pathlib import Path

JAVA = Path('/root/worktrees/ss-11/java')
ROOT = JAVA / 'lib/src/main/java/io/github/ccxt'
NAMES = ['safeStringUpper', 'safeStringUpper2', 'safeStringUpperN',
         'safeStringLower', 'safeStringLower2', 'safeStringLowerN']
DEFAULT_INDEX = {'safeStringUpper': 2, 'safeStringLower': 2,
                 'safeStringUpper2': 3, 'safeStringLower2': 3,
                 'safeStringUpperN': 2, 'safeStringLowerN': 2}


def tokenize(src):
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
            yield ('STR', src[i:j], i)
            i = j
            continue
        if c.isalpha() or c in '_$':
            j = i
            while j < n and (src[j].isalnum() or src[j] in '_$'):
                j += 1
            yield ('ID', src[i:j], i)
            i = j
            continue
        yield ('SYM', c, i)
        i += 1


def find_calls(toks):
    """returns list of dicts {name, args, start_idx, end_idx}"""
    out = []
    for idx, (kind, t, p) in enumerate(toks):
        if kind != 'ID' or t not in NAMES:
            continue
        if idx + 1 >= len(toks) or toks[idx + 1][1] != '(':
            continue
        prev = toks[idx - 1][1] if idx > 0 else None
        if prev in ('Object', 'String', 'static', 'public', 'protected', 'private'):
            continue
        depth = 0
        args = []
        cur = []
        j = idx + 1
        while j < len(toks):
            k, tt, pp = toks[j]
            if k == 'SYM' and tt == '(':
                depth += 1
                if depth == 1:
                    j += 1
                    continue
            elif k == 'SYM' and tt == ')':
                depth -= 1
                if depth == 0:
                    break
            elif k == 'SYM' and tt == ',' and depth == 1:
                args.append(cur)
                cur = []
                j += 1
                continue
            cur.append((k, tt))
            j += 1
        if cur:
            args.append(cur)
        out.append({'name': t, 'args': args, 'i': idx, 'j': j, 'prev': prev})
    return out


def arg_text(arg):
    return ''.join(t for _, t in arg)


def classify_default(call):
    want = DEFAULT_INDEX[call['name']]
    if len(call['args']) <= want:
        return 'absent', ''
    a = call['args'][want]
    txt = arg_text(a)
    toks = [t for _, t in a]
    if len(toks) == 1 and toks[0].startswith('"'):
        return 'literal', txt
    if toks == ['null']:
        return 'null', txt
    if len(toks) >= 3 and toks[0] == '(' and toks[1] == 'String' and toks[2] == ')':
        return 'cast', txt
    if len(toks) == 1 and re.match(r'^[A-Za-z_$][\w$]*$', toks[0]):
        return 'ident', txt
    # nested calls to the family / Helpers string statics / other String-valued calls
    if re.match(r'^Helpers\.(slice|replace|replaceAll|padEnd|padStart|urlencode\w*)\(', txt):
        return 'helper-string', txt
    if re.compile(r'^this\.safeString(Upper|Lower)\w*\(').match(txt):
        return 'family-fixpoint', txt
    if re.compile(r'^this\.safeString\d*\(|^this\.numberToString\(|^this\.decimalToPrecision\(').match(txt):
        return 'string-accessor', txt
    return 'other', txt


def main():
    files = []
    base = (ROOT / 'BaseExchange.java').read_text()
    marker = base.index('METHODS BELOW THIS LINE ARE TRANSPILED')
    files.append(('lib/BaseExchange.java#head', base[:marker]))
    files.append(('lib/BaseExchange.java#suffix', base[marker:]))
    for p in sorted(JAVA.rglob('*.java')):
        rel = str(p.relative_to(JAVA))
        if rel.startswith('build/') or '/build/' in rel:
            continue  # gradle outputs
        if p.name == 'BaseExchange.java' and p.parent == ROOT:
            continue
        files.append((rel, p.read_text(errors='replace')))

    stats = {}
    per_file = {}
    others = []
    addleft = []
    total = 0
    for label, text in files:
        toks = list(tokenize(text))
        calls = find_calls(toks)
        for call in calls:
            total += 1
            kind, txt = classify_default(call)
            stats[kind] = stats.get(kind, 0) + 1
            per_file[label] = per_file.get(label, 0) + 1
            if kind in ('ident', 'other'):
                others.append((label, call['name'], txt))
            # add-left check: is the call's parse directly the first argument of Helpers.add?
            i = call['i']
            # walk back: previous tokens should be Helpers . add ( 
            if i >= 4:
                a4 = [toks[i - j][1] for j in (1, 2, 3, 4)]
                if a4 == ['(', 'add', '.', 'Helpers']:
                    # second argument text
                    # find the add call's args: the '(' at i-1 opens add's arg 0
                    depth = 0
                    j = i - 1
                    arg1 = []
                    j2 = j + 1
                    while j2 < len(toks):
                        k, tt, pp = toks[j2]
                        if k == 'SYM' and tt == '(':
                            depth += 1
                        elif k == 'SYM' and tt == ')':
                            depth -= 1
                            if depth == 0:
                                break
                        elif k == 'SYM' and tt == ',' and depth == 0:
                            break
                        arg1.append((k, tt))
                        j2 += 1
                    # second arg
                    arg2 = []
                    j3 = j2 + 1
                    depth = 0
                    while j3 < len(toks):
                        k, tt, pp = toks[j3]
                        if k == 'SYM' and tt == '(':
                            depth += 1
                        elif k == 'SYM' and tt == ')':
                            depth -= 1
                            if depth < 0:
                                break
                        elif k == 'SYM' and tt == ',' and depth == 0:
                            break
                        arg2.append((k, tt))
                        j3 += 1
                    addleft.append((label, call['name'], arg_text(arg2)[:60]))
    print('total calls:', total)
    print('defaults:', stats)
    print()
    print('add-left sites:', len(addleft))
    for x in addleft:
        print('  ', x)
    print()
    print('ident/other defaults:', len(others))
    for x in others:
        print('  ', x)


if __name__ == '__main__':
    main()
