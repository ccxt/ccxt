#!/usr/bin/env python3
"""Print the full source of generated methods by name (for manual census review)."""
import sys
from pathlib import Path

ROOT = Path('/root/worktrees/ss-11/java/lib/src/main/java/io/github/ccxt')
MARKER = 'METHODS BELOW THIS LINE ARE TRANSPILED'


def method_text(src, name):
    out = []
    import re
    for mt in re.finditer(r'\b(public|protected|private)\s+[^\n(]*?\b' + re.escape(name) + r'\s*\(', src):
        start = src.rfind('\n', 0, mt.start()) + 1
        # find the opening brace
        i = mt.end() - 1
        depth = 0
        while i < len(src):
            if src[i] == '(':
                depth += 1
            elif src[i] == ')':
                depth -= 1
                if depth == 0:
                    break
            i += 1
        # skip to brace
        j = src.find('{', i)
        if j < 0:
            continue
        k = j
        d = 0
        while k < len(src):
            if src[k] == '{':
                d += 1
            elif src[k] == '}':
                d -= 1
                if d == 0:
                    break
            k += 1
        out.append(src[start:k + 1])
    return out


def main():
    names = sys.argv[1:]
    files = []
    base = (ROOT / 'BaseExchange.java').read_text()
    files.append(('BaseExchange.java', base[base.index(MARKER):]))
    for p in sorted((ROOT / 'exchanges').rglob('*.java')):
        files.append((str(p.relative_to(ROOT)), p.read_text()))
    for name in names:
        for label, src in files:
            for t in method_text(src, name):
                print('=' * 20, label, name, '=' * 20)
                print(t)
                print()


if __name__ == '__main__':
    main()
