#!/usr/bin/env python3
"""Prove every changed line between two C# trees is isTrue(x) -> x / (x == true) where the
enclosing method (after-file) declares x `bool` / `bool?` exactly once before the line (or as a param).
usage: checkdiff.py BEFORE_DIR AFTER_DIR   |  checkdiff.py --selftest"""
import os, re, sys, difflib

SIG = re.compile(r'^\s{4,}(?:(?:public|private|protected|internal)\s+)?(?:(?:static|async|virtual|override|new|partial)\s+)*[\w<>,.\[\]?]+(?:\s[\w<>,.\[\]?]+)*\s+\w+\s*\(')

def decl_type(lines, idx, name):
    start = idx
    while start > 0 and not (SIG.match(lines[start]) and not lines[start].rstrip().endswith(';')):
        start -= 1
    types = set()
    for k in range(start + 1, len(lines)):
        if k > start + 1 and SIG.match(lines[k]) and not lines[k].rstrip().endswith(';'):
            break
        m = re.match(r'^\s*([\w<>?][\w<>?,\[\] ]*?)\s+' + name + r'\s*(=|;)', lines[k])
        if m and m.group(1).split()[0] not in ('return', 'else', 'await', 'throw'):
            types.add((m.group(1).strip(), k < idx))
    if types:
        ts = {t for t, _ in types}
        return ts.pop() if len(ts) == 1 and any(b for _, b in types) else None
    m = re.search(r'\b(bool\??)\s+' + name + r'\b(?=\s*[,)=])', lines[start])
    return m.group(1) if m else None

def pair_ok(minus, plus, lines, idx):
    calls = re.findall(r'(?<![\w.])isTrue\((\w+)\)', minus)
    if not calls:
        return False
    for combo in range(2 ** len(calls)):
        pass
    cand = minus
    for name in calls:
        t = decl_type(lines, idx, name)
        if t == 'bool':
            rep = name
        elif t == 'bool?':
            rep = '(' + name + ' == true)'
        else:
            continue
        cand = re.sub(r'(?<![\w.])isTrue\(' + name + r'\)', lambda _m: rep, cand)
    return cand == plus

def check(before, after):
    bad = pairs = 0
    for root, _, files in os.walk(before):
        for f in files:
            if not f.endswith('.cs'):
                continue
            p = os.path.join(root, f)
            q = os.path.join(after, os.path.relpath(p, before))
            a = open(p).read().split('\n'); b = open(q).read().split('\n')
            if a == b:
                continue
            if len(a) != len(b):
                print('LINECOUNT', q); bad += 1; continue
            for i, (x, y) in enumerate(zip(a, b)):
                if x != y:
                    pairs += 1
                    if not pair_ok(x, y, b, i):
                        bad += 1
                        print('BAD', q, i + 1, '\n  -', x.strip(), '\n  +', y.strip())
    print('pairs', pairs, 'bad', bad)
    return bad

def selftest():
    src = ['    public void f(bool? p)', '    {', '        bool? a = false;', '        bool b = true;', '        object c = null;', 'X', '    }']
    cases = [('if (isTrue(a))', 'if ((a == true))', True), ('if (isTrue(b))', 'if (b)', True),
             ('if (isTrue(c))', 'if (c)', False), ('if (isTrue(a))', 'if (a)', False),
             ('if (isTrue(p))', 'if ((p == true))', True), ('if (isTrue(a))', 'if ((a == false))', False),
             ('if (isTrue(a))', 'if ((a == true)) x();', False)]
    ok = True
    for m, p, want in cases:
        lines = src[:5] + [p] + src[6:]
        got = pair_ok(m, p, lines, 5)
        ok &= got == want
        print('ok' if got == want else 'FAIL', m, '->', p)
    print('selftest', 'PASS' if ok else 'FAIL')
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(selftest() if sys.argv[1] == '--selftest' else (1 if check(sys.argv[1], sys.argv[2]) else 0))
