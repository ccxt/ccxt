# regenerates cs/ccxt/base/Exchange.TypedCores.cs from the TYPED_CORES table in
# build/csharpTranspiler.ts. Run from the repo root after editing that table.
#
# Emits, for every struct family named by the table:
#   ToX(object) / ToXList(object)     - untyped dict  -> typed struct
#   FromX(object) / FromXList(object) - typed struct  -> untyped dict (pass-through when not an X)
#
# The From* helpers are derived by parsing the struct constructors in
# cs/ccxt/base/Exchange.Types.cs and cs/ccxt/base/PredictionTypes.cs, so the
# field <-> dictionary-key mapping cannot drift from the real constructors. Any
# struct whose constructor shape is not understood (dictionary-like containers
# such as Tickers/Balances/OrderBook, positional constructors such as OHLCV) is
# skipped rather than given a lossy reverse helper; the skips are printed.
import re, collections, sys

TYPE_FILES = ['cs/ccxt/base/Exchange.Types.cs', 'cs/ccxt/base/PredictionTypes.cs']

# ---------------------------------------------------------------- needed types
src = open('build/csharpTranspiler.ts').read()
need = collections.defaultdict(set)
for const in ('const TYPED_CORES', 'const PREDICTION_TYPED_CORES'):
    table = src[src.index(const):]
    table = table[:table.index('\n};')]
    for csharpType in re.findall(r"^\s*'\w+': '([\w<>]+)',", table, re.M):
        if csharpType in ('Int64', 'string', 'object'):
            continue
        if csharpType.startswith('List<'):
            inner = csharpType[5:-1]
            if inner in ('Int64', 'string', 'object') or inner.startswith('Dictionary'):
                continue
            need[inner].add(True)
        elif csharpType.startswith('Dictionary'):
            continue
        else:
            need[csharpType].add(False)

# families already emitted into the generated file stay emitted: BaseExchange.ToX/FromX are
# public, so dropping one because its core left the table would be a silent API removal
try:
    prev = open('cs/ccxt/base/Exchange.TypedCores.cs').read()
    for name in re.findall(r'^    public static (\w+) To\1\(object value\)$', prev, re.M):
        need[name].add(False)
except FileNotFoundError:
    pass

# ------------------------------------------------------------- struct scraping
IDENT = r'@?\w+'
ASSIGN = r'^(?:this\.)?(?P<f>' + IDENT + r') = '

SCALAR = re.compile(ASSIGN + r'Exchange\.Safe(?P<kind>String|Float|Integer)\(\w+, "(?P<k>[^"]+)"\);$')
BOOLF = re.compile(ASSIGN + r'Exchange\.SafeBool\(\w+, "(?P<k>[^"]+)"(?:, (?:true|false))?\);$')
BOOLV = re.compile(ASSIGN + r'Exchange\.SafeValue\(\w+, "(?P<k>[^"]+)"\) != null \? \(bool\)Exchange\.SafeValue\(\w+, "(?P=k)"\) : null;$')
BOOLC = re.compile(ASSIGN + r'(?P<v>\w+)\.ContainsKey\("(?P<k>[^"]+)"\) && (?P=v)\["(?P=k)"\] != null \? \(bool\)(?P=v)\["(?P=k)"\] : null;$')
INFO = re.compile(ASSIGN + r'Helper\.GetInfo\(\w+\);$')
RAWDICT = re.compile(ASSIGN + r'Exchange\.SafeValue\(\w+, "(?P<k>[^"]+)"\) != null \? \(Dictionary<string, object>\)Exchange\.SafeValue\(\w+, "(?P=k)"\) : null;$')
NEST_CK = re.compile(ASSIGN + r'(?P<v>\w+)\.ContainsKey\("(?P<k>[^"]+)"\) \? new (?P<t>\w+)\((?P=v)\["(?P=k)"\]\) : null;$')
NEST_SV = re.compile(ASSIGN + r'Exchange\.SafeValue\(\w+, "(?P<k>[^"]+)"\) != null \? new (?P<t>\w+)\(Exchange\.SafeValue\(\w+, "(?P=k)"\)\) : null;$')
NEST_AS = re.compile(ASSIGN + r'\((?P<v>\w+) as IDictionary<string, object>\)\.ContainsKey\("(?P<k>[^"]+)"\) \? new (?P<t>\w+)\(\((?P=v) as IDictionary<string, object>\)\["(?P=k)"\]\) : null;$')
LIST_ST = re.compile(ASSIGN + r'(?P<v>\w+)\.ContainsKey\("(?P<k>[^"]+)"\)(?: && (?P=v)\["(?P=k)"\] != null)? \? \(\(IEnumerable<object>\)(?P=v)\["(?P=k)"\]\)\.Select\(x => new (?P<t>\w+)\(x\)\)(?:\.ToList\(\))? : null;$')
LIST_STR = re.compile(ASSIGN + r'(?P<v>\w+)\.ContainsKey\("(?P<k>[^"]+)"\)(?: && (?P=v)\["(?P=k)"\] != null)? \? \(\(IEnumerable<object>\)(?P=v)\["(?P=k)"\]\)\.Select\(x => \(string\)x\)\.ToList\(\) : null;$')
ALIAS = re.compile(r'^var \w+ = \(I?Dictionary<string, object>\)\w+;$')
# safeOrder()/safeTrade() attach a `fees` list next to `fee`; Helper.GetFees returns null
# when the source has no `fees` key, so it inverts exactly like a struct list.
FEES = re.compile(ASSIGN + r'Helper\.GetFees\(\w+\);$')
# `extra = Helper.GetExtra(src, <Struct>Keys);` holds every source key with no struct
# field, so writing the bag back restores venue-only keys the struct cannot name.
EXTRA = re.compile(ASSIGN + r'Helper\.GetExtra\(\w+, \w+\);$')
DECL = re.compile(r'^\s*public (?P<type>[\w\.<>,\? ]+?) (?P<name>@?\w+);\s*$')

structs = {}   # name -> {'fields': [...], 'decls': {name: type}, 'error': str|None}

# The dictionary-like containers (Tickers, Currencies, FundingRates, ...) splat the payload
# into a Dictionary<string, T> with a multi-line foreach, so the line-at-a-time matcher below
# cannot see them. Collapse each known splat shape into one synthetic marker line first; the
# inverse is exact because the loop copies every non-"info" key verbatim.
SPLAT_TOP = re.compile(
    r'^\s*(?:this\.)?(?P<f>@?\w+) = new Dictionary<string, (?P<t>\w+)>\(\);\s*\n'
    r'\s*foreach \(var (?P<v>\w+) in (?P<src>\w+)\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*if \((?P=v)\.Key != "info"\)\s*\n'
    r'\s*\{?\s*\n?'
    r'\s*(?:this\.)?(?P=f)\.Add\((?P=v)\.Key, new (?P=t)\((?P=v)\.Value\)\);\s*\n'
    r'(?:\s*\}\s*\n)?'
    r'\s*\}\s*$', re.M)

SPLAT_TOP_LIST = re.compile(
    r'^\s*(?:this\.)?(?P<f>@?\w+) = new Dictionary<string, List<(?P<t>\w+)>>\(\);\s*\n'
    r'\s*foreach \(var (?P<v>\w+) in (?P<src>\w+)\)\s*\n'
    r'\s*\{\s*\n\s*if \((?P=v)\.Key != "info"\)\s*\n\s*\{\s*\n'
    r'\s*var (?P<l1>\w+) = \(List<object>\)(?P=v)\.Value;\s*\n'
    r'\s*var (?P<l2>\w+) = (?P=l1)\.Select\(x => new (?P=t)\(x\)\)\.ToList\(\);\s*\n'
    r'\s*(?:this\.)?(?P=f)\.Add\((?P=v)\.Key, (?P=l2)\);\s*\n'
    r'\s*\}\s*\n\s*\}\s*$', re.M)

SPLAT_KEY = re.compile(
    r'^\s*(?:this\.)?(?P<f>@?\w+) = new Dictionary<string, (?P<t>\w+)>\(\);\s*\n'
    r'\s*if \(Exchange\.SafeValue\(\w+, "(?P<k>[^"]+)"\) != null\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*var (?P<v2>\w+) = \(Dictionary<string, object>\)Exchange\.SafeValue\(\w+, "(?P=k)"\);\s*\n'
    r'\s*foreach \(var (?P<v>\w+) in (?P=v2)\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*(?:this\.)?(?P=f)\.Add\((?P=v)\.Key, new (?P=t)\((?P=v)\.Value\)\);\s*\n'
    r'\s*\}\s*\n\s*\}\s*$', re.M)

# order-book sides: List<List<double>> built from the raw [price, amount] rows
LEVELS = re.compile(ASSIGN + r'\w+\.ContainsKey\("(?P<k>[^"]+)"\) \? \(\(IEnumerable<object>\)\w+\["(?P=k)"\]\)'
                    r'\.Select\(x => \(\(IEnumerable<object>\)x\)\.Select\(y => Convert\.ToDouble\(y\)\)'
                    r'\.ToList\(\)\)\.ToList\(\) : null;$')

# `info = <ctorParam>;` keeps the WHOLE source dict, so the struct inverts to it exactly
WHOLE_INFO = re.compile(r'^(?:this\.)?(?P<f>@?\w+) = (?P<p>\w+);$')

# Balances mirrors free/used/total/debt as optional Dictionary<string, double?>
NUMSPLAT = re.compile(
    r'^\s*(?:this\.)?(?P<f>@?\w+) = null;\s*\n'
    r'\s*var (?P<v2>\w+) = \w+\.ContainsKey\("(?P<k>[^"]+)"\) \? \(Dictionary<string, object>\)\w+\["(?P=k)"\] : null;\s*\n'
    r'\s*if \((?P=v2) != null\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*(?:this\.)?(?P=f) = new Dictionary<string, double\?>\(\);\s*\n'
    r'\s*foreach \(var (?P<v>\w+) in (?P=v2)\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*(?:this\.)?(?P=f)\.Add\((?P=v)\.Key, (?P=v)\.Value == null \? \(double\?\)null : Convert\.ToDouble\((?P=v)\.Value\)\);\s*\n'
    r'\s*\}\s*\n\s*\}\s*$', re.M)

# Balances skips a fixed key set when splatting the per-currency rows
BAL_SPLAT = re.compile(
    r'^\s*(?:this\.)?(?P<f>@?\w+) = new Dictionary<string, (?P<t>\w+)>\(\);\s*\n'
    r'\s*foreach \(var (?P<v>\w+) in (?P<src>\w+)\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*if \((?P<cond>(?:(?P=v)\.Key != "[^"]+"(?: && )?)+)\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*(?:this\.)?(?P=f)\.Add\((?P=v)\.Key, new (?P=t)\((?P=v)\.Value\)\);\s*\n'
    r'\s*\}\s*\n\s*\}\s*$', re.M)

# Currency / DepositWithdrawFee declare the empty dict early and fill it in a later
# `if (SafeValue(x, "networks") != null) { ... }` block, so the two halves are matched apart
SPLATKEY_FILL = re.compile(
    r'^\s*if \(Exchange\.SafeValue\(\w+, "(?P<k>[^"]+)"\) != null\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*var (?P<v2>\w+) = \(Dictionary<string, object>\)Exchange\.SafeValue\(\w+, "(?P=k)"\);\s*\n'
    r'\s*foreach \(var (?P<v>\w+) in (?P=v2)\)\s*\n'
    r'\s*\{\s*\n'
    r'\s*(?:this\.)?(?P<f>@?\w+)\.Add\((?P=v)\.Key, new (?P<t>\w+)\((?P=v)\.Value\)\);\s*\n'
    r'\s*\}\s*\n\s*\}\s*$', re.M)

# a scalar read via a local temp: `var pct = SafeValue(x, "percentage"); ... f = pct != null ? (bool)pct : null;`
TEMP_BOOL_DECL = re.compile(r'^\s*var (?P<v>\w+) = Exchange\.SafeValue\(\w+, "(?P<k>[^"]+)"\);\s*$', re.M)
TEMP_BOOL_USE = re.compile(r'^\s*(?:this\.)?(?P<f>@?\w+) = (?P<v>\w+) != null \? \(bool\)(?P=v) : null;\s*$', re.M)

def collapse_splats(body):
    body = SPLAT_TOP_LIST.sub(lambda m: '        @@SPLATLIST %s %s' % (m.group('f'), m.group('t')), body)
    body = SPLAT_TOP.sub(lambda m: '        @@SPLAT %s %s' % (m.group('f'), m.group('t')), body)
    body = BAL_SPLAT.sub(lambda m: '        @@SPLAT %s %s' % (m.group('f'), m.group('t')), body)
    body = NUMSPLAT.sub(lambda m: '        @@NUMSPLAT %s %s' % (m.group('f'), m.group('k')), body)
    body = SPLAT_KEY.sub(lambda m: '        @@SPLATKEY %s %s %s' % (m.group('f'), m.group('t'), m.group('k')), body)
    filled = set()
    def fill(m):
        filled.add(m.group('f'))
        return '        @@SPLATKEY %s %s %s' % (m.group('f'), m.group('t'), m.group('k'))
    body = SPLATKEY_FILL.sub(fill, body)
    # drop the now-redundant empty-dict declaration that the fill block populates
    for f in filled:
        body = re.sub(r'^\s*(?:this\.)?%s = new Dictionary<string, \w+>\(\);\s*$\n' % re.escape(f), '', body, flags=re.M)
    # inline a `var tmp = SafeValue(x, "k");` used only by a `f = tmp != null ? (bool)tmp : null;`
    temps = dict((m.group('v'), m.group('k')) for m in TEMP_BOOL_DECL.finditer(body))
    def usesub(m):
        if m.group('v') not in temps:
            return m.group(0)
        return '        %s = Exchange.SafeValue(x, "%s") != null ? (bool)Exchange.SafeValue(x, "%s") : null;' % (
            m.group('f'), temps[m.group('v')], temps[m.group('v')])
    newbody = TEMP_BOOL_USE.sub(usesub, body)
    if newbody != body:
        body = TEMP_BOOL_DECL.sub(lambda m: '', newbody)
    return body

def parse_struct(name, body, ctor_param):
    fields = []
    for raw in collapse_splats(body).split('\n'):
        line = raw.strip()
        line = re.sub(r'(?:\s*;)+$', ';', line)
        if not line or line.startswith('//') or line in ('{', '}'):
            continue
        if ALIAS.match(line):
            continue
        if line.startswith('@@SPLATLIST '):
            _, f, t = line.split()
            fields.append(('splatlist', f, None, t)); continue
        if line.startswith('@@SPLATKEY '):
            _, f, t, k = line.split()
            fields.append(('splatkey', f, k, t)); continue
        if line.startswith('@@SPLAT '):
            _, f, t = line.split()
            fields.append(('splat', f, None, t)); continue
        if line.startswith('@@NUMSPLAT '):
            _, f, k = line.split()
            fields.append(('numsplat', f, k, None)); continue
        m = LEVELS.match(line)
        if m:
            fields.append(('levels', m.group('f'), m.group('k'), None)); continue
        m = WHOLE_INFO.match(line)
        if m and m.group('p') == ctor_param:
            # `info = <ctorParam>;` stores the entire source dict, so the struct's own
            # inverse is that dict verbatim — nothing else can add or drop a key
            fields.append(('wholeinfo', m.group('f'), None, None)); continue
        m = SCALAR.match(line)
        if m:
            fields.append(('scalar', m.group('f'), m.group('k'), None)); continue
        m = BOOLF.match(line) or BOOLV.match(line) or BOOLC.match(line)
        if m:
            fields.append(('scalar', m.group('f'), m.group('k'), None)); continue
        m = RAWDICT.match(line)
        if m:
            fields.append(('scalar', m.group('f'), m.group('k'), None)); continue
        m = INFO.match(line)
        if m:
            fields.append(('info', m.group('f'), 'info', None)); continue
        m = EXTRA.match(line)
        if m:
            fields.append(('extra', m.group('f'), None, None)); continue
        m = FEES.match(line)
        if m:
            fields.append(('structlist', m.group('f'), 'fees', 'Fee')); continue
        m = NEST_CK.match(line) or NEST_SV.match(line) or NEST_AS.match(line)
        if m:
            fields.append(('struct', m.group('f'), m.group('k'), m.group('t'))); continue
        m = LIST_STR.match(line)
        if m:
            fields.append(('strlist', m.group('f'), m.group('k'), None)); continue
        m = LIST_ST.match(line)
        if m:
            fields.append(('structlist', m.group('f'), m.group('k'), m.group('t'))); continue
        return None, 'unsupported constructor line: %s' % line
    if not fields:
        return None, 'empty constructor'
    return fields, None

for path in TYPE_FILES:
    text = open(path).read() + '\n'
    for m in re.finditer(r'\npublic struct (\w+)\s*\n\{\n(.*?)\n\}(?=\n)', text, re.S):
        name, block = m.group(1), m.group(2)
        decls = {}
        for line in block.split('\n'):
            d = DECL.match(line)
            if d and not d.group('type').startswith('static'):
                decls[d.group('name')] = d.group('type').strip()
        cm = re.search(r'\n    public %s\(object (\w+)\)\s*\n    \{\n(.*?)\n    \}\n' % name, block + '\n', re.S)
        if not cm:
            structs[name] = {'fields': None, 'decls': decls, 'error': 'no single-object constructor found'}
            continue
        fields, err = parse_struct(name, cm.group(2), cm.group(1))
        structs[name] = {'fields': fields, 'decls': decls, 'error': err}

# ------------------------------------------------------- resolve the closure
resolved = {}    # name -> True/False
reason = {}

def resolve(name, stack=()):
    if name in resolved:
        return resolved[name]
    if name in stack:
        resolved[name] = True   # recursive struct: assume ok, it is emitted anyway
        return True
    info = structs.get(name)
    if info is None:
        resolved[name] = False; reason[name] = 'struct not found in the type files'
        return False
    if info['error'] or not info['fields']:
        resolved[name] = False; reason[name] = info['error'] or 'no parsable fields'
        return False
    for kind, fname, key, tname in info['fields']:
        if fname not in info['decls']:
            resolved[name] = False; reason[name] = 'field %s has no public declaration' % fname
            return False
        if kind in ('struct', 'structlist', 'splat', 'splatlist', 'splatkey'):
            if not resolve(tname, stack + (name,)):
                resolved[name] = False
                reason[name] = 'nested type %s is not reversible (%s)' % (tname, reason.get(tname, '?'))
                return False
    resolved[name] = True
    return True

# `--capabilities` answers "which struct families are reversible at all?" without
# touching the generated file. build/analyzeTypedCoreCandidates.py uses it to decide
# whether a core that reaches the untyped pipeline can be typed, which would otherwise
# be circular (the generated file only carries families already in the table).
if '--capabilities' in sys.argv:
    import json
    print(json.dumps({'reversible': sorted(n for n in structs if resolve(n)),
                      'not_reversible': {n: reason.get(n, 'unknown')
                                         for n in sorted(structs) if not resolve(n)}}))
    raise SystemExit(0)

emit_from = []          # ordered list of struct names to emit FromX for
skipped = []
for t in sorted(need):
    if resolve(t):
        emit_from.append(t)
    else:
        skipped.append('%s: no reverse helper: %s' % (t, reason.get(t, 'unknown')))

# pull in every nested dependency transitively
queue = list(emit_from)
while queue:
    cur = queue.pop()
    for kind, fname, key, tname in structs[cur]['fields']:
        if kind in ('struct', 'structlist', 'splat', 'splatlist', 'splatkey') and tname not in emit_from:
            emit_from.append(tname)
            queue.append(tname)
emit_from = sorted(set(emit_from))

def nullable(decl):
    decl = decl.strip()
    if decl.endswith('?'):
        return True
    return not re.match(r'^(bool|double|float|int|long|Int64|Int32|decimal)$', decl)

# --------------------------------------------------------------------- output
out = []
out.append('namespace ccxt;')
out.append('')
out.append('// Conversions used by the typed C# cores (see TYPED_CORES in build/csharpTranspiler.ts).')
out.append('// The generated core returns the struct itself, so the PascalCase wrapper is a plain')
out.append('// `return res;` instead of re-materialising `new T(res)` on every call.')
out.append('// The From* helpers are the reverse direction: they hand a typed struct back to the')
out.append('// untyped object pipeline (pagination, arrayConcat, filterBySinceLimit, sortBy) as the')
out.append('// plain unified dictionary the struct was built from. They pass non-matching values')
out.append('// through unchanged so they are safe to apply blindly.')
out.append('// This file is generated by build/generateTypedCoreHelpers.py — do not hand-edit.')
out.append('public partial class BaseExchange')
out.append('{')
for t in sorted(need):
    # both forms are always emitted: a family reached as `List<Order>` by one core is
    # reached as `Order` by another, and the reverse dispatcher needs every arm anyway
    out.append('    public static %s To%s(object value)' % (t, t))
    out.append('    {')
    out.append('        return value is %s ? (%s)value : new %s(value);' % (t, t, t))
    out.append('    }')
    out.append('')
    out.append('    public static List<%s> To%sList(object values)' % (t, t))
    out.append('    {')
    out.append('        if (values == null)')
    out.append('        {')
    out.append('            return null;')
    out.append('        }')
    out.append('        if (values is List<%s>)' % t)
    out.append('        {')
    out.append('            return (List<%s>)values;' % t)
    out.append('        }')
    out.append('        var rows = (IList<object>)values;')
    out.append('        var result = new List<%s>(rows.Count);' % t)
    out.append('        foreach (var row in rows)')
    out.append('        {')
    out.append('            result.Add(row is %s ? (%s)row : new %s(row));' % (t, t, t))
    out.append('        }')
    out.append('        return result;')
    out.append('    }')
    out.append('')

helpers = []
for t in emit_from:
    info = structs[t]
    out.append('    public static object From%s(object value)' % t)
    out.append('    {')
    out.append('        if (!(value is %s))' % t)
    out.append('        {')
    out.append('            return value;')
    out.append('        }')
    out.append('        var typed = (%s)value;' % t)
    whole = [f for f in info['fields'] if f[0] == 'wholeinfo']
    if whole:
        # the constructor kept the entire source dictionary on this field, so handing it
        # back is byte-identical to what the untyped pipeline originally produced
        out.append('        return typed.%s;' % whole[0][1])
        out.append('    }')
        out.append('')
        helpers.append('From%s' % t)
        out.append('    public static object From%sList(object values)' % t)
        out.append('    {')
        out.append('        if (!(values is List<%s>))' % t)
        out.append('        {')
        out.append('            return values;')
        out.append('        }')
        out.append('        var typed = (List<%s>)values;' % t)
        out.append('        var result = new List<object>(typed.Count);')
        out.append('        foreach (var row in typed)')
        out.append('        {')
        out.append('            result.Add(From%s(row));' % t)
        out.append('        }')
        out.append('        return result;')
        out.append('    }')
        out.append('')
        helpers.append('From%sList' % t)
        continue
    out.append('        var result = new Dictionary<string, object>();')
    for kind, fname, key, tname in info['fields']:
        access = 'typed.%s' % fname
        guard = nullable(info['decls'][fname])
        if kind in ('scalar', 'info'):
            body = ['result["%s"] = %s;' % (key, access)]
        elif kind == 'struct':
            body = ['result["%s"] = From%s(%s);' % (key, tname, access)]
        elif kind == 'structlist':
            body = ['var %sRows = new List<object>();' % fname.lstrip('@'),
                    'foreach (var item in %s)' % access,
                    '{',
                    '    %sRows.Add(From%s(item));' % (fname.lstrip('@'), tname),
                    '}',
                    'result["%s"] = %sRows;' % (key, fname.lstrip('@'))]
        elif kind == 'strlist':
            body = ['result["%s"] = new List<object>(%s);' % (key, access)]
        elif kind == 'levels':
            # rebuild the raw [[price, amount], ...] rows the ctor read
            body = ['var %sRows = new List<object>();' % fname.lstrip('@'),
                    'foreach (var level in %s)' % access,
                    '{',
                    '    %sRows.Add(new List<object>(level.Select(v => (object)v)));' % fname.lstrip('@'),
                    '}',
                    'result["%s"] = %sRows;' % (key, fname.lstrip('@'))]
        elif kind in ('splat', 'splatlist', 'splatkey'):
            # the ctor copied every non-"info" key verbatim into a Dictionary<string, T>,
            # so writing each entry back under its own key is an exact inverse
            var = fname.lstrip('@')
            if kind == 'splatlist':
                inner = ['        var %sList = new List<object>();' % var,
                         '        foreach (var item in entry.Value)',
                         '        {',
                         '            %sList.Add(From%s(item));' % (var, tname),
                         '        }',
                         '        %sTarget[entry.Key] = %sList;' % (var, var)]
            else:
                inner = ['        %sTarget[entry.Key] = From%s(entry.Value);' % (var, tname)]
            if kind == 'splatkey':
                body = ['var %sTarget = new Dictionary<string, object>();' % var,
                        'foreach (var entry in %s)' % access,
                        '{'] + inner + ['}',
                        'result["%s"] = %sTarget;' % (key, var)]
            else:
                body = ['var %sTarget = result;' % var,
                        'foreach (var entry in %s)' % access,
                        '{'] + inner + ['}']
        elif kind == 'numsplat':
            var = fname.lstrip('@')
            body = ['var %sTarget = new Dictionary<string, object>();' % var,
                    'foreach (var entry in %s)' % access,
                    '{',
                    '    %sTarget[entry.Key] = entry.Value;' % var,
                    '}',
                    'result["%s"] = %sTarget;' % (key, var)]
        elif kind == 'extra':
            # written last: restores source keys that map to no struct field
            body = ['foreach (var pair in %s)' % access,
                    '{',
                    '    result[pair.Key] = pair.Value;',
                    '}']
        else:
            raise Exception('unhandled kind ' + kind)
        if guard:
            out.append('        if (%s != null)' % access)
            out.append('        {')
            for b in body:
                out.append('            ' + b)
            out.append('        }')
        else:
            for b in body:
                out.append('        ' + b)
    out.append('        return result;')
    out.append('    }')
    out.append('')
    helpers.append('From%s' % t)
    out.append('    public static object From%sList(object values)' % t)
    out.append('    {')
    out.append('        if (!(values is List<%s>))' % t)
    out.append('        {')
    out.append('            return values;')
    out.append('        }')
    out.append('        var typed = (List<%s>)values;' % t)
    out.append('        var result = new List<object>(typed.Count);')
    out.append('        foreach (var row in typed)')
    out.append('        {')
    out.append('            result.Add(From%s(row));' % t)
    out.append('        }')
    out.append('        return result;')
    out.append('    }')
    out.append('')
    helpers.append('From%sList' % t)

# One runtime dispatcher for the reflective pipeline: callDynamically /
# fetchPaginatedCall* / promiseAll erase the static type, so AwaitAsObject cannot know
# which From* to call. Switching on the runtime type here keeps the untyped pagination
# code (arrayConcat / filterBySinceLimit / sortBy on dictionaries) working unchanged.
out.append('    public static object FromTyped(object value)')
out.append('    {')
out.append('        switch (value)')
out.append('        {')
for t in emit_from:
    out.append('            case %s _:' % t)
    out.append('                return From%s(value);' % t)
    out.append('            case List<%s> _:' % t)
    out.append('                return From%sList(value);' % t)
out.append('            case List<OHLCV> _:')
out.append('                return FromOHLCVList(value);')
out.append('            case Dictionary<string, Dictionary<string, List<OHLCV>>> _:')
out.append('                return FromOHLCVDict(value);')
out.append('            default:')
out.append('                return value;')
out.append('        }')
out.append('    }')
out.append('')
helpers.append('FromTyped')

if out[-1] == '':
    out.pop()
out.append('}')
open('cs/ccxt/base/Exchange.TypedCores.cs', 'w').write('\n'.join(out) + '\n')
print('types', len(need), 'lines', len(out))
print('reverse helpers emitted:', len(helpers))
print('  ' + ' '.join(helpers))
print('families with no reverse helper:', len(skipped))
for s in skipped:
    print('  -', s)
