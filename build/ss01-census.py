#!/usr/bin/env python3
"""SS-01 census: safeStringUpper/Lower* producers + call sites in the generated Java tree.

Comments (line + block, including javadoc) are blanked out before scanning so a mention
of the name inside a copied doc comment is not mistaken for a call site.

Per call site reports the default argument (the argument at index FIXED[name]) and its
shape; per declaration it reports every declaration of the six names under java/ (the
override-invariance check).
"""
import os
import re
import sys
import json

ROOT = sys.argv[1] if len(sys.argv) > 1 else 'java/lib/src/main/java'
NAMES = ['safeStringUpperN', 'safeStringLowerN', 'safeStringUpper2', 'safeStringLower2',
         'safeStringUpper', 'safeStringLower']
FIXED = {'safeStringUpper': 2, 'safeStringLower': 2,
         'safeStringUpper2': 3, 'safeStringLower2': 3,
         'safeStringUpperN': 2, 'safeStringLowerN': 2}

CALL_RE = re.compile(r'(?:([A-Za-z0-9_$.]+)\s*\.\s*)?(' + '|'.join(NAMES) + r')\s*\(')
DECL_RE = re.compile(r'\b(?:public|protected|private)\s+(?:static\s+)?(?:final\s+)?([A-Za-z0-9_<>,.\[\]]+)\s+(' + '|'.join(NAMES) + r')\s*\(')


def blank_comments(src):
    """replace comment characters with spaces, preserving offsets and newlines"""
    out = list(src)
    i, n = 0, len(src)
    while i < n:
        if src[i] == '"':
            i += 1
            while i < n and src[i] != '"':
                i += 2 if src[i] == '\\' else 1
            i += 1
        elif src[i] == "'":
            i += 1
            while i < n and src[i] != "'":
                i += 2 if src[i] == '\\' else 1
            i += 1
        elif src.startswith('//', i):
            while i < n and src[i] != '\n':
                out[i] = ' '
                i += 1
        elif src.startswith('/*', i):
            while i < n and not src.startswith('*/', i):
                if src[i] != '\n':
                    out[i] = ' '
                i += 1
            for k in range(i, min(i + 2, n)):
                out[k] = ' '
            i += 2
        else:
            i += 1
    return ''.join(out)


def split_args(text):
    args, depth, cur, instr, esc = [], 0, [], None, False
    for ch in text:
        if instr:
            cur.append(ch)
            if esc:
                esc = False
            elif ch == '\\':
                esc = True
            elif ch == instr:
                instr = None
            continue
        if ch in '"\'':
            instr = ch
            cur.append(ch)
            continue
        if ch in '([{':
            depth += 1
        elif ch in ')]}':
            depth -= 1
        if ch == ',' and depth == 0:
            args.append(''.join(cur).strip())
            cur = []
            continue
        cur.append(ch)
    if ''.join(cur).strip():
        args.append(''.join(cur).strip())
    return args


def shape_of(arg):
    a = arg.strip()
    if a.startswith('"') and a.endswith('"'):
        return 'string-literal'
    if a == 'null':
        return 'null'
    if re.fullmatch(r'[A-Za-z_$][A-Za-z0-9_$]*', a):
        return 'identifier'
    return 'other'


def main():
    calls, decls = [], []
    for dirpath, dirs, files in os.walk(ROOT):
        dirs.sort()
        for fn in sorted(files):
            if not fn.endswith('.java'):
                continue
            path = os.path.join(dirpath, fn)
            with open(path, encoding='utf-8', errors='replace') as fh:
                raw = fh.read()
            src = blank_comments(raw)
            for i, line in enumerate(src.split('\n'), 1):
                for m in DECL_RE.finditer(line):
                    decls.append({'file': path, 'line': i, 'ret': m.group(1),
                                  'name': m.group(2), 'text': raw.split('\n')[i - 1].strip()})
            for m in CALL_RE.finditer(src):
                start = m.end()
                depth, j = 1, start
                while j < len(src) and depth > 0:
                    if src[j] == '(':
                        depth += 1
                    elif src[j] == ')':
                        depth -= 1
                    j += 1
                inner = src[start:j - 1]
                args = split_args(inner)
                name = m.group(2)
                line_no = src.count('\n', 0, m.start()) + 1
                line = src.split('\n')[line_no - 1]
                if DECL_RE.search(line):
                    continue
                fixed = FIXED[name]
                default = args[fixed] if len(args) > fixed else None
                receiver = m.group(1)
                calls.append({'file': path, 'line': line_no, 'name': name, 'receiver': receiver,
                              'nargs': len(args), 'args': args, 'default': default,
                              'default_shape': 'absent' if default is None else shape_of(default)})
    shapes = {}
    for c in calls:
        shapes[c['default_shape']] = shapes.get(c['default_shape'], 0) + 1
    with open('/tmp/ss01-census.json', 'w', encoding='utf-8') as fh:
        json.dump({'calls': calls, 'decls': decls, 'shapes': shapes}, fh, indent=1)

    print('== declarations of the six names ==')
    for d in decls:
        print(f"  {d['ret']:10s} {d['name']:18s} {d['file']}:{d['line']}")
    print(f'  total declarations: {len(decls)}\n')
    print('== default-argument shapes at call sites ==')
    for k, v in sorted(shapes.items(), key=lambda kv: -kv[1]):
        print(f'  {k:16s} {v}')
    print(f'  total calls: {len(calls)}\n')
    print('== every non-absent default, grouped ==')
    seen = {}
    for c in calls:
        if c['default_shape'] != 'absent':
            seen.setdefault(c['default'], []).append(c)
    for val, group in sorted(seen.items(), key=lambda kv: -len(kv[1])):
        print(f'  [{group[0]["default_shape"]}] x{len(group)}  {val!r}')
        for g in group[:3]:
            print(f'        {g["file"]}:{g["line"]}  ({g["name"]})')


if __name__ == '__main__':
    main()
