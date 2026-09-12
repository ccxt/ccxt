#!/usr/bin/env python3
"""Census of text-pass `client.(future|reusableFuture)((String)IDENT)` casts in the ws tree:
compare the 'all declarations String' rule vs the 'nearest preceding declaration String' rule."""
import re, os, sys, collections

ROOT = 'java/lib/src/main/java'
CALL = re.compile(r'client\.(future|reusableFuture)\(\(String\)([A-Za-z_]\w*)\)')
DECL = re.compile(r'\b(String|Object|Integer|Long|Double|Boolean|var|char)\s+([A-Za-z_]\w*)\s*(?=[=;,)])')
LINE_COMMENT = re.compile(r'//[^\n]*')

def main():
    stats = collections.Counter()
    examples = collections.defaultdict(list)
    for dirpath, _, files in os.walk(ROOT):
        for fn in sorted(files):
            if not fn.endswith('.java'):
                continue
            path = os.path.join(dirpath, fn)
            raw = open(path, encoding='utf-8', errors='replace').read()
            content = LINE_COMMENT.sub('', raw)
            for cm in CALL.finditer(content):
                ident = cm.group(2)
                pos = cm.start()
                stats['total'] += 1
                # all-decls rule
                decls = [m for m in DECL.finditer(content) if m.group(2) == ident]
                all_string = bool(decls) and all(d.group(1) == 'String' for d in decls)
                # nearest-preceding rule
                prev = [d for d in decls if d.start() < pos]
                nearest = prev[-1].group(1) if prev else None
                key = ('allString' if all_string else 'notAll', 'nearest=' + str(nearest))
                stats[key] += 1
                if nearest == 'String' and len(examples[key]) < 3:
                    examples[key].append(f'{fn}:{raw.count(chr(10),0,pos)+1}: {ident}')
    for k, v in stats.most_common():
        print(f'{v:6d}  {k}')
        for ex in examples[k][:2]:
            print('          ', ex)

if __name__ == '__main__':
    main()
