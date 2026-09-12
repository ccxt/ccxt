#!/usr/bin/env python3
"""SS-13: diff the compiled-Java safeString matrix (build/ss13-java-probe/Probe.java)
against the TS reference run (build/ss13-ts-groundtruth.ts).

usage: python3 build/ss13-compare.py <ts-groundtruth.json> <java-probe-output.txt>
"""
import json
import sys

ts_path, java_path = sys.argv[1], sys.argv[2]
ts = json.load(open(ts_path))

java = {}
for line in open(java_path):
    line = line.rstrip('\n')
    if not line:
        continue
    section, key, value = line.split('\t', 2)
    java.setdefault(section, {})[key] = value

# Documented, deliberate divergences (Java keeps a plain decimal expansion where
# JS switches to mantissa notation at >= 1e21; python does its own thing there too).
ALLOW = {
    ('safeString', 'big-1e21|no-default'): ("S:1e+21", "S:1000000000000000000000"),
    ('safeString', 'big-1e21|default="DEF"'): ("S:1e+21", "S:1000000000000000000000"),
    ('safeString', 'big-1e21|default=""'): ("S:1e+21", "S:1000000000000000000000"),
    ('safeStringLower', 'big-1e21|no-default'): ("S:1e+21", "S:1000000000000000000000"),
    ('safeStringLower', 'big-1e21|default="DEF"'): ("S:1e+21", "S:1000000000000000000000"),
    ('safeStringLower', 'big-1e21|default=""'): ("S:1e+21", "S:1000000000000000000000"),
    ('safeStringUpper', 'big-1e21|no-default'): ("S:1E+21", "S:1000000000000000000000"),
    ('safeStringUpper', 'big-1e21|default="DEF"'): ("S:1E+21", "S:1000000000000000000000"),
    ('safeStringUpper', 'big-1e21|default=""'): ("S:1E+21", "S:1000000000000000000000"),
}

matched = mismatched = allowed = 0
missing_java = []
for section in ('safeString', 'safeStringLower', 'safeStringUpper', 'safeString2', 'safeStringN', 'listCases'):
    for key, expected in ts[section].items():
        actual = java.get(section, {}).get(key)
        if actual is None:
            missing_java.append((section, key))
            continue
        if actual == expected:
            matched += 1
        elif ALLOW.get((section, key), (None, None))[1] == actual:
            allowed += 1
        else:
            mismatched += 1
            print(f'MISMATCH {section} {key}: ts={expected!r} java={actual!r}')

extra_java = [k for s in java for k in java[s]
              if k not in ts.get(s, {})]
print(f'matched={matched} allowed_divergence={allowed} mismatched={mismatched}')
print(f'ts_keys_without_java_counterpart={len(missing_java)}')
if missing_java:
    print('  e.g.', missing_java[:5])
print(f'java_keys_without_ts_counterpart={len(extra_java)}')
if extra_java:
    print('  e.g.', extra_java[:5])
sys.exit(1 if (mismatched or missing_java) else 0)
