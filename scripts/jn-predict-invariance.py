#!/usr/bin/env python3
# JN-10 prediction-tier invariance assertion.
#
# Java requires an override's parameter list to be IDENTICAL to the base virtual's
# (parameter types are invariant in Java; only the return type may be covariant).
# The generated prediction tier is produced by several different generation paths
# (transpilePredictionBaseMethods for PredictionExchange.java on the main thread,
# webworkerTranspile/java-worker.ts for the venue *Core files, generateJavaWrappers.ts
# for the typed * facade classes). If a typing pass runs on one path but not another,
# a method that is an override on one side can be printed with a different signature on
# the other -- a base/override mismatch javac rejects, or (worse) an accidental
# OVERLOAD that silently shadows the base virtual.
#
# This script parses every class in the prediction tier plus its base chain off disk
# and asserts, for every method name declared in both a class and its ancestor:
#   * the parameter list is byte-identical (else: SHADOW / accidental overload)
#   * the return type is either identical, or a legal covariant narrowing
#     (ancestor returns Object or a supertype of the derived return, when both are
#      known types in the same package/tier)
#
# Exit 0 = assertion holds (no mismatches). Exit 1 = mismatches found.
#
# Usage: python3 scripts/jn-predict-invariance.py [repo-root]

import os
import re
import sys
from collections import OrderedDict

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JAVA_LIB = os.path.join(ROOT, 'java', 'lib', 'src', 'main', 'java')
PRED_DIR = os.path.join(JAVA_LIB, 'io', 'github', 'ccxt', 'exchanges', 'prediction')
API_PRED_DIR = os.path.join(JAVA_LIB, 'io', 'github', 'ccxt', 'api', 'prediction')
CCXT_DIR = os.path.join(JAVA_LIB, 'io', 'github', 'ccxt')


def strip_comments_and_strings(text):
    out = []
    i = 0
    n = len(text)
    while i < n:
        c = text[i]
        if c == '/' and i + 1 < n and text[i + 1] == '/':
            j = text.find('\n', i)
            i = n if j < 0 else j
        elif c == '/' and i + 1 < n and text[i + 1] == '*':
            j = text.find('*/', i + 2)
            i = n if j < 0 else j + 2
        elif c == '"':
            i += 1
            while i < n:
                if text[i] == '\\':
                    i += 2
                    continue
                if text[i] == '"':
                    i += 1
                    break
                i += 1
        elif c == "'":
            i += 1
            while i < n:
                if text[i] == '\\':
                    i += 2
                    continue
                if text[i] == "'":
                    i += 1
                    break
                i += 1
        else:
            out.append(c)
            i += 1
    return ''.join(out)


METHOD_MODIFIERS = re.compile(r'\b(public|protected|private)\b')

class JavaClass:
    def __init__(self, path):
        self.path = path
        self.name = None
        self.parent = None
        self.methods = OrderedDict()  # name -> list of (params, return_type)

    def __repr__(self):
        return f'{self.name}({os.path.relpath(self.path, JAVA_LIB)})'


def parse_class(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        raw = f.read()
    text = strip_comments_and_strings(raw)
    m = re.search(r'\bclass\s+(\w+)\s*(?:extends\s+([\w.]+))?(?:\s+implements\s+[^{]+)?\s*\{', text)
    if not m:
        return None
    cls = JavaClass(path)
    cls.name = m.group(1)
    if m.group(2):
        cls.parent = m.group(2).split('.')[-1]
    # scan method declarations: `public ... name ( ... ) {`
    # find `(` tokens preceded by an identifier, where the statement start looks like a modifier
    i = 0
    n = len(text)
    while True:
        p = text.find('(', i)
        if p < 0:
            break
        # identifier before '('
        k = p - 1
        while k >= 0 and text[k] in ' \t':
            k -= 1
        e = k + 1
        while k >= 0 and (text[k].isalnum() or text[k] in '_$'):
            k -= 1
        name = text[k + 1:e]
        # statement start = text after previous ; { }
        j = k
        while j >= 0 and text[j] not in ';{}':
            j -= 1
        header = text[j + 1:k].strip()
        if name and header and METHOD_MODIFIERS.search(header) and not header.startswith('//'):
            # check this is a declaration not a call: header must end with a type token
            words = header.split()
            if words and words[0] in ('public', 'protected', 'private', 'static', 'synchronized', 'final', 'volatile', 'abstract', 'native'):
                # cheap filters for new-with-args and constructor calls that slipped in
                if header.startswith(('new ', 'return ', 'if ', 'while ', 'for ', 'switch ', 'catch ')):
                    i = p + 1
                    continue
                if name in ('if', 'for', 'while', 'switch', 'catch', 'synchronized', 'new'):
                    i = p + 1
                    continue
                # find matching close paren
                depth = 0
                q = p
                while q < n:
                    if text[q] == '(':
                        depth += 1
                    elif text[q] == ')':
                        depth -= 1
                        if depth == 0:
                            break
                    q += 1
                params = text[p + 1:q]
                # return type: last type-ish token(s) of header minus modifiers/name
                htokens = header.split()
                hmods = {'public', 'protected', 'private', 'static', 'synchronized', 'final', 'abstract', 'native', 'strictfp', 'default'}
                rest = [w for w in htokens if w not in hmods]
                # drop the method name token(s)
                if rest and rest[-1] == name:
                    rest = rest[:-1]
                ret = ' '.join(rest) if rest else ''
                # skip constructors (ret == '' or ret == class name)
                if ret and ret != cls.name and not ret.endswith(')'):
                    cls.methods.setdefault(name, []).append((norm_params(params), norm_ret(ret)))
                i = q + 1
                continue
        i = p + 1
    return cls


def normalize_type(text):
    # strip package qualifiers the transpiler emits inconsistently
    # (java.util.concurrent.CompletableFuture<Object> vs CompletableFuture<Object>)
    text = re.sub(r'\b(?:java\.util(?:\.concurrent)?|io\.github\.ccxt(?:\.\w+)*)\.', '', text)
    return ' '.join(text.split())


def norm_params(params):
    parts = split_top_level(params)
    out = []
    for p in parts:
        p = ' '.join(p.split())
        # drop parameter NAME (last token), keep declared type
        toks = p.split(' ')
        if len(toks) > 1:
            p = ' '.join(toks[:-1])
        out.append(normalize_type(p))
    return ', '.join(out)


def norm_ret(ret):
    return normalize_type(ret)


def split_top_level(s):
    parts = []
    depth = 0
    cur = ''
    for ch in s:
        if ch in '<([':
            depth += 1
        elif ch in '>)]':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += ch
    if cur.strip():
        parts.append(cur)
    return parts


# The typed facade classes (<Venue>.java) are deliberately NOT part of the
# invariance contract: generateJavaWrappers.ts emits narrow typed OVERLOADS
# (fetchTicker(String) etc.) next to the inherited Object... virtuals and
# overload resolution is supposed to prefer them. Only the *Core classes (the
# transpilePrediction output that overrides PredictionExchange's virtuals) must
# keep byte-identical parameter lists.
def is_core_class(name):
    return name.endswith('Core') or name in ('PredictionExchange', 'BaseExchange', 'Exchange')


def main():
    classes = {}
    files = []
    for d in (PRED_DIR, API_PRED_DIR):
        if os.path.isdir(d):
            for fn in sorted(os.listdir(d)):
                if fn.endswith('.java'):
                    files.append(os.path.join(d, fn))
    for top in ('PredictionExchange.java', 'BaseExchange.java', 'Exchange.java'):
        p = os.path.join(CCXT_DIR, top)
        if os.path.exists(p):
            files.append(p)
    for p in files:
        cls = parse_class(p)
        if cls:
            if cls.name in classes:
                print(f'WARNING: duplicate class {cls.name}: {p} vs {classes[cls.name].path}')
            classes[cls.name] = cls

    # resolve ancestors transitively (parent classes outside our set stop the walk)
    problems = []
    checked = 0
    for cls in classes.values():
        if not is_core_class(cls.name):
            continue
        chain = []
        seen = set()
        cur = cls
        while cur is not None and cur.parent and cur.parent not in seen:
            seen.add(cur.parent)
            anc = classes.get(cur.parent)
            if anc is None:
                break
            chain.append(anc)
            cur = anc
        for anc in chain:
            for name, decls in cls.methods.items():
                if name not in anc.methods:
                    continue
                for (dparams, dret) in decls:
                    for (aparams, aret) in anc.methods[name]:
                        if dparams != aparams:
                            problems.append(
                                f'SHADOW: {cls} .{name}({dparams}) vs ancestor {anc} .{name}({aparams})')
                        else:
                            checked += 1
                            if dret != aret:
                                # covariant narrowing allowed: ancestor Object, or derived
                                # type being a class in our set that transitively extends
                                # the ancestor return type
                                if aret == 'Object' or dret == aret:
                                    continue
                                problems.append(
                                    f'RET-MISMATCH: {cls} .{name}() -> {dret} but {anc} declares {aret}')
    print(f'classes parsed: {len(classes)} ({sum(1 for c in classes.values() if is_core_class(c.name))} in the override contract)')
    print(f'override signature pairs checked: {checked}')
    if problems:
        print(f'MISMATCHES ({len(problems)}):')
        for p in problems:
            print('  ' + p)
        sys.exit(1)
    print('OK: every prediction-tier override matches its base virtual signature')


if __name__ == '__main__':
    main()
