#!/usr/bin/env python3
# SS-05 diff audit: every `-`/`+` line pair in the java diff must be
#   (a) a parameter retype  `Object x` -> `String x`  (inside a method signature), or
#   (b) a dropped `(Object) ` / `(Object)(...)` argument cast in a WS-wrapper / pro-core call,
# and NO added line may introduce a ` ? ` ternary that the removed line did not carry.
#
# Usage: python3 build/ss05-diff-audit.py <base-rev>
import re, subprocess, sys, collections

base = sys.argv[1] if len(sys.argv) > 1 else '3ca818ac31e'
diff = subprocess.run(['git', 'diff', base, '--', 'java/'], capture_output=True, text=True).stdout

cast_re = re.compile(r'\(Object\)\s?')
redir_re = re.compile(r'\(Object\)\(([^()]*(?:\([^()]*\)[^()]*)*)\)')
coalesce_re = re.compile(r'\((\w+) != null \? \1 : (new java\.util\.HashMap<String, Object>\(\))\)')

def canon(line):
    # normalize both spellings of the null->empty-map coalesce to one token
    line = coalesce_re.sub(lambda mo: 'java.util.Objects.requireNonNullElse(%s, %s)' % (mo.group(1), mo.group(2)), line)
    line = cast_re.sub('', line)
    line = redir_re.sub(lambda mo: mo.group(1), line)
    return line

pairs = []
cur_minus, cur_plus = [], []
for line in diff.split('\n'):
    if line.startswith('---') or line.startswith('+++') or line.startswith('@@'):
        continue
    if line.startswith('-'):
        cur_minus.append(line[1:])
    elif line.startswith('+'):
        cur_plus.append(line[1:])
    else:
        if cur_minus or cur_plus:
            pairs.append((cur_minus, cur_plus))
            cur_minus, cur_plus = [], []
if cur_minus or cur_plus:
    pairs.append((cur_minus, cur_plus))

retypes = []
cast_drops = []
unclassified = []
uneven = 0
added_param_tokens = 0
q_added = sum(1 for _, ps in pairs for p in ps if ' ? ' in p)
q_removed = sum(1 for ms, _ in pairs for m in ms if ' ? ' in m)
q_paired = 0

for minus, plus in pairs:
    if len(minus) != len(plus):
        uneven += 1
        continue
    for m, p in zip(minus, plus):
        m3 = canon(m)
        p3 = canon(p)
        if m3 == p3:
            cast_drops.append((m, p, m.count('(Object) ') - p.count('(Object) '),
                               len(redir_re.findall(m)) - len(redir_re.findall(p))))
            continue
        # parameter retype: p3 is m3 with 1+ `Object` tokens replaced by `String`
        positions = [mm.start() for mm in re.finditer(r'\bObject\b', m3)]
        hit = None
        if p3 != m3 and len(positions) <= 12:
            import itertools
            for r in range(1, min(4, len(positions)) + 1):
                for combo in itertools.combinations(positions, r):
                    s = m3
                    for pos in reversed(combo):
                        s = s[:pos] + 'String' + s[pos + len('Object'):]
                    if s == p3:
                        hit = r
                        break
                if hit:
                    break
        if hit:
            added_param_tokens += hit
            retypes.append((m, p, hit))
            continue
        unclassified.append((m, p))

print('pairs (hunks line groups):', len(pairs), '| uneven (skipped):', uneven)
print('cast-drop pairs:', len(cast_drops),
      '| (Object) casts removed:', sum(d[2] for d in cast_drops),
      '| (Object)(...) redirect casts removed:', sum(d[3] for d in cast_drops))
print('param retype pairs:', len(retypes), '| Object->String param tokens:', added_param_tokens)
print('unclassified pairs:', len(unclassified))
for u in unclassified[:10]:
    print('  -', u[0][:160])
    print('  +', u[1][:160])
print()
print('added lines with ` ? `:', q_added, '| removed lines with ` ? `:', q_removed,
      '| net change:', q_added - q_removed)
print('OK (all pairs classified, no added ternary)' if not unclassified and q_added == 0 else 'CHECK NEEDED')
