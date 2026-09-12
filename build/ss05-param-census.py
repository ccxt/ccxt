#!/usr/bin/env python3
# SS-05 census v2: generated Java method PARAMETERS typed `Object` in symbol/id/code/
# currency positions.  Node = (methodName, positionIdx).  Every call site that can bind any
# declaration of the name is classified per position:
#   STR   - statically String-or-null (safeString family / String local/param / literal /
#           (String) cast / Helpers String-returning static)
#   NULL  - `null` literal
#   CAND  - bare identifier that is a candidate param of the enclosing method (fixpoint dep)
#   OTHER - everything else (Object local, getArg/GetValue result, ternary, ...)
# A position qualifies only when every call-site argument is STR/NULL or a qualifying CAND
# (monotone fixpoint, cycles allowed).  Body hazard scan: param used as LEFT operand of
# Helpers.add (overload-resolution behaviour trap) and existing ((String)param) casts.
#
# Usage: python3 build/ss05-param-census.py [--json out.json] [--show NAME]
import re, os, sys, glob, json, bisect, collections, time, pickle

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = '/tmp/ss05-ctx.pickle'

SYM_NAMES = ['symbol', 'symbol2', 'id', 'id2', 'code', 'code2', 'currency', 'currencyId',
             'codeOrId', 'symbolOrId', 'marketId', 'instrument', 'instrumentId', 'outcome']

DECL_RE = re.compile(
    r'^(\s*)(public|private|protected)\s+((?:static\s+|final\s+|synchronized\s+)*)'
    r'(.+?)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^()]*)\)\s*(?:\{.*)?$')

STR_HELPERS = ('toString', 'slice', 'Slice', 'replace', 'replaceAll', 'padEnd', 'padStart', 'json')
SAFESTRING_RE = re.compile(r'^(?:[A-Za-z_]\w*\.)*(?:this\.|super\.)?safeString(?:2|N)?\s*\(')
HELPERS_STR_RE = re.compile(r'^Helpers\.(?:' + '|'.join(STR_HELPERS) + r')\s*\(')
CAST_RE = re.compile(r'^\(\(?String\)\)?\s*')
LITERAL_RE = re.compile(r'^"(?:[^"\\]|\\.)*"$')


def java_files():
    out = []
    for pat in ('java/lib/src/main/java/**/*.java', 'java/lib/src/test/java/**/*.java',
                'java/tests/src/main/java/**/*.java',
                'java/examples/src/main/java/**/*.java', 'java/cli/src/main/java/**/*.java'):
        out += glob.glob(os.path.join(ROOT, pat), recursive=True)
    return sorted(set(out))


def split_top(text):
    out, depth, cur, i, n = [], 0, '', 0, len(text)
    while i < n:
        ch = text[i]
        if ch == '"':
            cur += ch; i += 1
            while i < n:
                cur += text[i]
                if text[i] == '\\':
                    i += 1
                    if i < n: cur += text[i]
                elif text[i] == '"':
                    break
                i += 1
        elif ch in '([{':
            depth += 1; cur += ch
        elif ch in ')]}':
            depth -= 1; cur += ch
        elif ch == '<':
            depth += 1; cur += ch
        elif ch == '>':
            if i > 0 and text[i-1] == '-':
                cur += ch
            else:
                depth -= 1; cur += ch
        elif ch == ',' and depth == 0:
            out.append(cur); cur = ''
        else:
            cur += ch
        i += 1
    if cur.strip():
        out.append(cur)
    return [c.strip() for c in out]


def parse_param(p):
    p = p.strip()
    if not p:
        return None
    p = re.sub(r'^final\s+', '', p)
    m = re.match(r'^(.+?)\s+([A-Za-z_][A-Za-z0-9_]*)$', p)
    if not m:
        return {'type': p, 'name': p}
    return {'type': m.group(1).strip(), 'name': m.group(2)}


class Lexer:
    """spans of strings and comments so brace/paren scanning skips them"""
    TOKEN_RE = re.compile(r'"(?:\\.|[^"\\])*"|//[^\n]*|/\*[\s\S]*?\*/')

    def __init__(self, src):
        self.spans = [(m.start(), m.end()) for m in self.TOKEN_RE.finditer(src)]
        self.starts = [s for s, _ in self.spans]
        segs, prev, n = [], 0, len(src)
        for s, e in self.spans:
            if s > prev:
                segs.append((prev, s))
            prev = max(prev, e)
        if prev < n:
            segs.append((prev, n))
        self.segs = segs

    def in_span(self, pos):
        k = bisect.bisect_right(self.starts, pos) - 1
        if k >= 0:
            s, e = self.spans[k]
            if s <= pos < e:
                return True
        return False


def match_close(src, lx, open_pos):
    depth = 1
    for (a, b) in lx.segs:
        if b <= open_pos + 1:
            continue
        i = max(a, open_pos + 1)
        while i < b:
            ch = src[i]
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
                if depth == 0:
                    return i
            i += 1
    return -1


def build_context():
    if os.path.exists(CACHE):
        try:
            with open(CACHE, 'rb') as fh:
                ctx = pickle.load(fh)
            return ctx
        except Exception:
            pass
    t0 = time.time()
    srcs = {f: open(f, encoding='utf8').read() for f in java_files()}
    sys.stderr.write('[ss05] loaded %d files %.1fs\n' % (len(srcs), time.time() - t0))

    decls = collections.defaultdict(list)     # name -> [decl]
    decl_positions = set()                    # (file, charpos of declared name)
    ranges = collections.defaultdict(list)    # file -> [(startline, endline, name, params)]
    local_decls = collections.defaultdict(lambda: collections.defaultdict(list))
    LDECL_RE = re.compile(r'(?:final\s+)?(String|Object|var|Long|Double|Integer|Boolean|java\.util\.Map<[^;=]*>|java\.util\.List<[^;=]*>)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)\s*(.{0,60})')

    for f, src in srcs.items():
        lx = Lexer(src)
        lines = src.split('\n')
        line_off = [0]
        for ln in lines:
            line_off.append(line_off[-1] + len(ln) + 1)
        base = 0
        pending = {}
        for ln, line in enumerate(lines, 1):
            m = DECL_RE.match(line.rstrip())
            if m:
                name = m.group(5)
                if not name[0].isupper():
                    params = [p for p in (parse_param(p) for p in split_top(m.group(6))) if p]
                    varargs = bool(params) and params[-1]['type'].endswith('...')
                    decls[name].append({'file': f, 'line': ln, 'end': None, 'params': params,
                                        'varargs': varargs})
                    decl_positions.add((f, base + m.start(5)))
                    brace_from = base + m.end(6) + 1
                    k = src.find('{', brace_from)
                    if k != -1 and not lx.in_span(k) and ';' not in src[brace_from:k]:
                        pending[k] = (ln, name, params)
            for m2 in LDECL_RE.finditer(line):
                local_decls[f][m2.group(2)].append((ln, m2.group(1), line.strip()[:130], m2.group(3)))
            base += len(line) + 1
        depth = 0
        stack = []
        for (a, b) in lx.segs:
            pos = a
            while pos < b:
                ob = src.find('{', pos, b)
                eb = src.find('}', pos, b)
                if ob == -1 and eb == -1:
                    break
                if eb == -1 or (ob != -1 and ob < eb):
                    depth += 1
                    if ob in pending:
                        stack.append((depth, ob, pending[ob]))
                    pos = ob + 1
                else:
                    if stack and stack[-1][0] == depth:
                        _, ob0, (ln, name, params) = stack.pop()
                        endline = bisect.bisect_right(line_off, eb)
                        ranges[f].append((ln, endline, name, params))
                        # attach end line to the decl record
                        for d in decls[name]:
                            if d['file'] == f and d['line'] == ln and d['end'] is None:
                                d['end'] = endline
                                break
                    depth -= 1
                    pos = eb + 1
    sys.stderr.write('[ss05] context built %.1fs\n' % (time.time() - t0))
    ctx = {'srcs': srcs, 'decls': dict(decls), 'decl_positions': decl_positions,
           'ranges': dict(ranges), 'local_decls': {k: dict(v) for k, v in local_decls.items()},
           'line_offs': {f: [0] + list(_acc(s)) for f, s in srcs.items()},
           'lexers': {f: Lexer(s) for f, s in srcs.items()}}
    with open(CACHE, 'wb') as fh:
        pickle.dump(ctx, fh)
    return ctx


def _acc(src):
    off = 0
    for ln in src.split('\n'):
        off += len(ln) + 1
        yield off


def main():
    show = []
    json_out = None
    refresh = False
    cover = None
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == '--json':
            json_out = args[i+1]; i += 2
        elif args[i] == '--show':
            show.append(args[i+1]); i += 2
        elif args[i] == '--cover':
            cover = args[i+1]; i += 2
        elif args[i] == '--refresh':
            refresh = True; i += 1
        else:
            i += 1
    if refresh and os.path.exists(CACHE):
        os.remove(CACHE)

    if cover:
        ctx = build_context()
        srcs, decls, decl_positions = ctx['srcs'], ctx['decls'], ctx['decl_positions']
        lexers = ctx['lexers']
        rx = re.compile(r'(?<![\w$])' + re.escape(cover) + r'\s*\(')
        n_match = n_skip = n_calls = 0
        for f, src in srcs.items():
            if cover not in src:
                continue
            lx = lexers[f]
            lines = src.split('\n')
            for m in rx.finditer(src):
                n_match += 1
                pos = m.start()
                line = bisect.bisect_right(ctx['line_offs'][f], pos)
                if (f, pos) in decl_positions:
                    n_skip += 1
                    print('SKIP decl   %s:%d %s' % (os.path.relpath(f, ROOT), line, lines[line-1].strip()[:110]))
                    continue
                if lx.in_span(pos):
                    n_skip += 1
                    continue
                j = pos - 1
                while j >= 0 and src[j] in ' \t\n':
                    j -= 1
                if j >= 0 and src[j] != '.':
                    prev = src[j]
                    word = ''
                    k = j
                    while k >= 0 and (src[k].isalnum() or src[k] == '_'):
                        word = src[k] + word; k -= 1
                    if prev not in '({;,=!&|?+-*%^<>' and word not in ('return', 'throw', 'else'):
                        n_skip += 1
                        print('SKIP recv   %s:%d %s' % (os.path.relpath(f, ROOT), line, lines[line-1].strip()[:110]))
                        continue
                o = src.find('(', pos)
                close = match_close(src, lx, o)
                if close == -1:
                    print('BADCLOSE    %s:%d' % (f, line))
                    continue
                argv = split_top(src[o+1:close])
                n_calls += 1
                print('CALL %s:%d nargs=%d argv0=%s' % (os.path.relpath(f, ROOT), line, len(argv),
                                                        argv[0][:70] if argv else ''))
        print('matched=%d skipped=%d calls=%d' % (n_match, n_skip, n_calls))
        return

    ctx = build_context()
    srcs, decls, decl_positions = ctx['srcs'], ctx['decls'], ctx['decl_positions']
    ranges, local_decls, line_offs, lexers = ctx['ranges'], ctx['local_decls'], ctx['line_offs'], ctx['lexers']

    # candidate nodes: (name, idx) where the position is declared Object + symbolish name
    nodes = {}
    for name, ds in decls.items():
        for d in ds:
            for idx, p in enumerate(d['params']):
                if p['name'] in SYM_NAMES and p['type'] == 'Object':
                    key = (name, idx)
                    node = nodes.setdefault(key, {'decls': [], 'calls': [], 'names': set(),
                                                  'plus_left': [], 'casts': 0})
                    node['decls'].append({'file': d['file'], 'line': d['line'], 'end': d['end'],
                                          'idx': idx, 'nparams': len(d['params']),
                                          'varargs': d['varargs'], 'pname': p['name']})
                    node['names'].add(p['name'])

    rng_cache = {}

    def enclosing(f, line):
        ck = (f, line)
        if ck in rng_cache:
            return rng_cache[ck]
        rs = ranges.get(f, [])
        best = None
        for r in rs:
            if r[0] <= line <= r[1]:
                if best is None or r[0] >= best[0]:
                    best = r
        rng_cache[ck] = best
        return best

    def classify_arg(text, f, line, calling_node=None):
        t = text.strip()
        # WS-wrapper super-call arguments are wrapped in `(Object) x` casts by
        # generateJavaWrappers.ts (castToObject).  For a candidate position that we retype,
        # the generator drops exactly that cast, so the argument becomes `x` itself: model it.
        if calling_node is not None and '/exchanges/pro/' in f:
            mm = re.match(r'^\(\(?Object\)\)?\s*(.+)$', t, re.S)
            if mm:
                v, why = classify_arg(mm.group(1), f, line, None)
                if v in ('STR', 'NULL', 'CAND'):
                    return (v, 'objcast:' + why)
                return ('OTHER', 'objcast-of-' + why)
        if t.startswith('(') and not CAST_RE.match(t):
            lx = Lexer(t)
            c = match_close(t, lx, 0)
            if c == len(t) - 1:
                return classify_arg(t[1:-1], f, line, calling_node)
        if t == 'null':
            return ('NULL', 'null')
        if CAST_RE.match(t):
            return ('STR', 'cast')
        if LITERAL_RE.match(t):
            return ('STR', 'literal')
        if SAFESTRING_RE.match(t):
            return ('STR', 'safeString')
        if HELPERS_STR_RE.match(t):
            return ('STR', 'helpers')
        if re.match(r'^[A-Za-z_][A-Za-z0-9_]*$', t):
            enc = enclosing(f, line)
            if enc:
                for pi, p in enumerate(enc[3]):
                    if p['name'] == t:
                        if p['type'] == 'String':
                            return ('STR', 'strParam')
                        if p['type'] == 'Object' and p['name'] in SYM_NAMES and (enc[2], pi) in nodes:
                            return ('CAND', '%s#%d' % (enc[2], pi))
                        return ('OTHER', 'objParam: ' + p['type'] + ' ' + t)
            best = None
            for (ln, ty, raw, init) in local_decls.get(f, {}).get(t, []):
                if ln < line:
                    best = (ln, ty, raw, init)
            if best:
                if best[1] == 'String':
                    return ('STR', 'strLocal')
                if best[1] == 'var' and (init.startswith('"') or SAFESTRING_RE.match(init) or HELPERS_STR_RE.match(init)):
                    return ('STR', 'strVarLocal')
                return ('OTHER', 'objLocal: ' + best[2])
            # maybe a field of this class: search declaration `public X t =`/`protected`
            return ('OTHER', 'ident:' + t)
        if 'Helpers.getArg(' in t:
            return ('OTHER', 'getArg')
        if 'Helpers.GetValue(' in t:
            return ('OTHER', 'GetValue')
        if 'Helpers.add(' in t:
            return ('OTHER', 'add')
        if t.startswith('new '):
            return ('OTHER', 'new')
        if re.match(r'^[A-Za-z_][\w.]*\.[A-Za-z_]\w*\s*\(', t):
            return ('OTHER', 'call')
        if '?' in t:
            return ('OTHER', 'ternary')
        if t[0] == '"':
            return ('OTHER', 'concat')
        return ('OTHER', 'shape:' + t[:32])

    # call-site scan over names that own candidate nodes
    names = sorted(set(k[0] for k in nodes))
    call_res = {n: re.compile(r'(?<![\w$])' + re.escape(n) + r'\s*\(') for n in names}
    t0 = time.time()
    n_calls = 0
    nodecl = collections.Counter()
    nodecl_samples = collections.defaultdict(list)
    seen_calls = collections.defaultdict(set)   # node -> {(file,line)}
    for f, src in srcs.items():
        lx = lexers[f]
        lines = src.split('\n')
        lo = line_offs[f]
        for name, rx in call_res.items():
            if name not in src:
                continue
            for m in rx.finditer(src):
                pos = m.start()
                if (f, pos) in decl_positions:
                    continue
                if lx.in_span(pos):
                    continue
                j = pos - 1
                while j >= 0 and src[j] in ' \t\n':
                    j -= 1
                if j >= 0 and src[j] != '.':
                    prev = src[j]
                    word = ''
                    k = j
                    while k >= 0 and (src[k].isalnum() or src[k] == '_'):
                        word = src[k] + word; k -= 1
                    if prev not in '({;,=!&|?+-*%^<>' and word not in ('return', 'throw', 'else'):
                        continue
                elif j >= 0:
                    # static call on a CLASS (TestSharedMethods.fetchOrder(...), Helpers...) is
                    # not a call site of the crypto-API method of the same name
                    k = j - 1
                    recv = ''
                    while k >= 0 and (src[k].isalnum() or src[k] in '_$.'):
                        recv = src[k] + recv; k -= 1
                    seg = recv.split('.')[-1]
                    if seg and seg[0].isupper():
                        continue
                o = src.find('(', pos)
                close = match_close(src, lx, o)
                if close == -1:
                    continue
                argv = split_top(src[o+1:close])
                line = bisect.bisect_right(lo, pos)
                n_calls += 1
                # every decl this call can bind
                matched_any = False
                for d in decls.get(name, []):
                    npar = len(d['params'])
                    if npar == len(argv):
                        bind = list(range(npar))
                    elif d['varargs'] and npar - 1 <= len(argv):
                        bind = list(range(npar - 1))
                    else:
                        continue
                    matched_any = True
                    for idx in bind:
                        p = d['params'][idx]
                        if not (p['name'] in SYM_NAMES and p['type'] == 'Object'):
                            continue
                        key = (name, idx)
                        if key not in nodes:
                            continue
                        if (f, line) in seen_calls[key]:
                            continue
                        seen_calls[key].add((f, line))
                        v, why = classify_arg(argv[idx], f, line, key)
                        nodes[key]['calls'].append({'file': f, 'line': line, 'v': v, 'why': why,
                                                    'arg': argv[idx][:110],
                                                    'raw': lines[line-1].strip()[:150]})
                if not matched_any:
                    nodecl[name] += 1
                    if nodecl[name] <= 3:
                        nodecl_samples[name].append('%s:%d %s' % (os.path.relpath(f, ROOT), line,
                                                                  lines[line-1].strip()[:130]))
    sys.stderr.write('[ss05] call scan %.1fs (%d call sites over %d names)\n'
                     % (time.time() - t0, n_calls, len(names)))
    if nodecl:
        print('=== calls with NO binding declaration (scan diagnostic) ===')
        for nm, cnt in nodecl.most_common(12):
            print('  %s: %d' % (nm, cnt))
            for s in nodecl_samples[nm]:
                print('     ', s)
        print()

    # body hazard scan for candidate decls
    for key, node in nodes.items():
        for d in node['decls']:
            if d['end'] is None:
                continue
            body = '\n'.join(srcs[d['file']].split('\n')[d['line']-1:d['end']])
            pn = d['pname']
            node['casts'] += len(re.findall(r'\(\(String\)' + re.escape(pn) + r'\)', body))
            for mm in re.finditer(r'Helpers\.add\(\s*' + re.escape(pn) + r'\s*,', body):
                node['plus_left'].append((d['file'], d['line'], body[max(0, mm.start()-40):mm.start()+80].replace('\n', ' ')))

    # fixpoint
    def call_badness(node):
        other = sum(1 for c in node['calls'] if c['v'] == 'OTHER')
        return other

    kept = {k: (call_badness(nodes[k]) == 0) for k in nodes}
    changed = True
    while changed:
        changed = False
        for k, node in nodes.items():
            if not kept[k]:
                continue
            for c in node['calls']:
                if c['v'] == 'CAND':
                    dep = tuple(c['why'].split('#'))
                    dep = (dep[0], int(dep[1]))
                    if dep in nodes and not kept.get(dep, False):
                        kept[k] = False; changed = True; break

    def hist(node):
        h = collections.Counter()
        for c in node['calls']:
            h[c['why'].split(':')[0] if c['v'] == 'OTHER' else c['v']] += 1
        return h

    rows = []
    for k, node in nodes.items():
        h = hist(node)
        objs = sum(1 for c in node['calls'] if c['why'].startswith('objcast:'))
        deps = sorted(set(tuple(c['why'].split('#')) for c in node['calls'] if c['v'] == 'CAND'))
        rows.append({'name': k[0], 'idx': k[1], 'names': sorted(node['names']),
                     'decls': len(node['decls']), 'calls': len(node['calls']),
                     'kept': bool(kept[k]), 'hist': dict(h),
                     'plus_left': len(node['plus_left']), 'casts': node['casts'],
                     'obj_casts': objs,
                     'cand_deps': [[d[0], int(d[1])] if len(d) == 2 else [d[0]] for d in deps],
                     'decl_files': sorted(set(os.path.relpath(d['file'], ROOT) for d in node['decls'])),
                     'calls_sample': node['calls'][:8],
                     'blocked_samples': [c for c in node['calls'] if c['v'] == 'OTHER'][:4],
                     'bad_decl_files': sorted(set(os.path.relpath(d['file'], ROOT) for d in node['decls'] if d['end'] is None))[:3],
                     })
    kept_rows = sorted([r for r in rows if r['kept']], key=lambda r: (-r['calls'], r['name']))
    blocked = sorted([r for r in rows if not r['kept']], key=lambda r: (-r['calls'], r['name']))

    print('candidate positions:', len(nodes), '| kept:', len(kept_rows), '| blocked:', len(blocked))
    print()
    print('=== KEPT (every call-site arg String-or-null; fixpoint-stable) ===')
    for r in kept_rows:
        pl = ' PLUS-LEFT-HAZARD=%d' % r['plus_left'] if r['plus_left'] else ''
        cas = ' casts=%d' % r['casts'] if r['casts'] else ''
        ob = ' objcasts=%d' % r['obj_casts'] if r['obj_casts'] else ''
        print('  %-32s #%d %-12s decls=%2d calls=%4d  %s%s%s%s' % (
            r['name'], r['idx'], '/'.join(r['names']), r['decls'], r['calls'], r['hist'], pl, cas, ob))
    print()
    print('=== BLOCKED top 45 by call sites ===')
    for r in blocked[:45]:
        h = collections.Counter(r['hist'])
        top = ', '.join('%s:%d' % (a, b) for a, b in h.most_common(5))
        print('  %-32s #%d %-12s decls=%2d calls=%4d  %s' % (
            r['name'], r['idx'], '/'.join(r['names']), r['decls'], r['calls'], top))
        for s in r['blocked_samples'][:2]:
            print('       %s:%d  arg=%s  [%s]' % (os.path.relpath(s['file'], ROOT), s['line'],
                                                   s['arg'][:80], s['why'][:60]))

    if show:
        print()
        for sh in show:
            for k, node in nodes.items():
                if sh == k[0] or (sh.isdigit() and nodes and False):
                    print('=== %s #%d names=%s kept=%s decls=%d' % (k[0], k[1], sorted(node['names']), kept[k], len(node['decls'])))
                    for d in node['decls']:
                        print('    D %s:%d npar=%d pname=%s end=%s' % (os.path.relpath(d['file'], ROOT), d['line'], d['nparams'], d['pname'], d['end']))
                    for c in node['calls']:
                        print('    C %s:%d [%s] %s | %s' % (os.path.relpath(c['file'], ROOT), c['line'], c['v'], c['arg'][:60], c['why'][:70]))

    if json_out:
        with open(json_out, 'w') as fh:
            json.dump({'kept': kept_rows, 'blocked': blocked}, fh, indent=1)
        print('wrote', json_out)


if __name__ == '__main__':
    main()
