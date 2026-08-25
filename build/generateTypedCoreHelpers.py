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
        if csharpType.startswith('List<'):
            need[csharpType[5:-1]].add(True)
        else:
            need[csharpType].add(False)

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
DECL = re.compile(r'^\s*public (?P<type>[\w\.<>,\? ]+?) (?P<name>@?\w+);\s*$')

structs = {}   # name -> {'fields': [...], 'decls': {name: type}, 'error': str|None}

def parse_struct(name, body, ctor_param):
    fields = []
    for raw in body.split('\n'):
        line = raw.strip()
        line = re.sub(r'(?:\s*;)+$', ';', line)
        if not line or line.startswith('//') or line in ('{', '}'):
            continue
        if ALIAS.match(line):
            continue
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
        if kind in ('struct', 'structlist'):
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
        if kind in ('struct', 'structlist') and tname not in emit_from:
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
