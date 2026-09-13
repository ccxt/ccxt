// C++ emitter for the base type structs (cpp/ccxt/base/Types.h).
//
// Unlike the C# emitter, which splices generated blocks into a pre-existing hand-written
// file, the C++ typed layer is fully generated: every exported declaration of
// ts/src/base/types.ts (minus the prediction tier, which the C++ port does not carry yet)
// becomes a struct with std::optional fields and an `explicit T (const ccxt::any&)`
// converting constructor over the dynamic value model (ccxt::dict / ccxt::list).
//
// Mapping rules (documented here because they ARE the public C++ API contract):
//   * Int / int            -> std::optional<int64_t>     (read via typedsupport::optInt)
//   * Num / number         -> std::optional<double>      (optNum: numeric or numeric string)
//   * Str / string / union-of-literals -> std::optional<std::string> (optStr)
//   * Bool / boolean       -> std::optional<bool>        (optBool)
//   * any                  -> ccxt::any (raw, lossless)
//   * T (another struct)   -> std::optional<T>
//   * T[]                  -> std::vector<T>
//   * [Num, Num][]         -> std::vector<std::vector<double>> (order-book rows)
//   * Dictionary<any>      -> ccxt::dict (raw)
//   * Dictionary<T>        -> std::map<std::string, T>
//   * interface X extends Dictionary<T> -> wrapper struct: map member named lowerFirst(X)
//     plus `info`, an `operator[]`, `has()`, and `size()` (C# wrapper-struct parity)
//   * OHLCV / OHLCVC tuples -> structs with named fields read by index
//
// The `EXTRAS` table mirrors the C#-only fields from build/typeEmitters/csharpSpecs.ts:
// unified keys that venues emit (and fixtures assert) which the TS interface does not
// name — dropping them in a typed core loses data (fees lists, raw ids, position extras).

import { TypesIR, IRType, IRField, ensureGeneratedBanner } from '../typesIR.js';

export interface EmitterOutput {
    path: string;
    contents: string;
    changed: string[];
}

export interface LanguageEmitter {
    id: string;
    emit: (ir: TypesIR, repoRoot: string) => EmitterOutput[];
}

const OUT_PATH = 'cpp/ccxt/base/Types.h';

// TS declaration name -> C++ struct name (same two renames the other ports use)
const TS_TO_CPP: Record<string, string> = {
    'FeeInterface': 'Fee',
    'CurrencyInterface': 'Currency',
    'MarketInterface': 'Market',
    'TradingFeeInterface': 'TradingFee',
};

// declarations that never become C++ structs
const SKIP_TYPES: RegExp[] = [
    /^FeeStringInterface$/, // internal Precise-pipeline bag
];

// inline object types (`limits: {...}`) have no TS name; the struct standing in for one
// is recorded by its path through types.ts (C# parity: Limits / CurrencyLimits / MinMax)
const INLINE_STRUCTS: Record<string, string> = {
    'Market.limits': 'Limits',
    'Currency.limits': 'CurrencyLimits',
    'Currency.limits.amount': 'MinMax',
    'Currency.limits.withdraw': 'MinMax',
};

// C++ keywords that could collide with TS field names (defensive; `base`, `internal`
// and friends are all legal member names in C++)
const CPP_KEYWORDS = new Set ([ 'short', 'long', 'int', 'float', 'double', 'signed', 'unsigned', 'auto', 'default', 'delete', 'new', 'operator', 'register', 'template', 'this', 'union', 'void' ]);

interface ExtraField { name: string, kind: 'int' | 'num' | 'str' | 'bool' | 'feeList', why: string }

// C#-only unified keys carried over (see csharpSpecs.ts for the fixture counts)
const EXTRAS: Record<string, ExtraField[]> = {
    'Trade': [
        { 'name': 'fees', 'kind': 'feeList', 'why': 'safeTrade() always sets a fees list next to fee' },
        { 'name': 'orderId', 'kind': 'str', 'why': 'kraken/bybit/woo/hashkey/toobit/apex raw venue order id' },
    ],
    'Order': [
        { 'name': 'fees', 'kind': 'feeList', 'why': 'safeOrder() always sets a fees list next to fee' },
        { 'name': 'hedged', 'kind': 'bool', 'why': 'poloniex' },
        { 'name': 'leverage', 'kind': 'num', 'why': 'poloniex' },
        { 'name': 'marginMode', 'kind': 'str', 'why': 'poloniex' },
        { 'name': 'isMultiLeg', 'kind': 'bool', 'why': 'grvt' },
        { 'name': 'lastTradeTimeStamp', 'kind': 'int', 'why': 'grvt raw spelling' },
        { 'name': 'trigger', 'kind': 'bool', 'why': 'okx' },
    ],
    'Ticker': [
        { 'name': 'id', 'kind': 'str', 'why': 'poloniex raw venue market id next to symbol' },
    ],
    'Position': [
        { 'name': 'isolated', 'kind': 'bool', 'why': '30 fixtures' },
        { 'name': 'exitPrice', 'kind': 'num', 'why': '7 fixtures' },
        { 'name': 'marginType', 'kind': 'str', 'why': 'raw venue spelling next to marginMode' },
    ],
    'FundingHistory': [
        { 'name': 'rate', 'kind': 'num', 'why': '9 fixtures' },
        { 'name': 'type', 'kind': 'str', 'why': '2 fixtures' },
    ],
    'FundingRateHistory': [
        { 'name': 'markPrice', 'kind': 'num', 'why': 'coinbaseinternational emits the full funding-rate key set' },
        { 'name': 'indexPrice', 'kind': 'num', 'why': 'ditto' },
        { 'name': 'interestRate', 'kind': 'num', 'why': 'ditto' },
        { 'name': 'estimatedSettlePrice', 'kind': 'num', 'why': 'ditto' },
        { 'name': 'fundingTimestamp', 'kind': 'int', 'why': 'ditto' },
        { 'name': 'fundingDatetime', 'kind': 'str', 'why': 'ditto' },
        { 'name': 'nextFundingRate', 'kind': 'num', 'why': 'ditto' },
        { 'name': 'nextFundingTimestamp', 'kind': 'int', 'why': 'ditto' },
        { 'name': 'nextFundingDatetime', 'kind': 'str', 'why': 'ditto' },
        { 'name': 'previousFundingRate', 'kind': 'num', 'why': 'ditto' },
        { 'name': 'previousFundingTimestamp', 'kind': 'int', 'why': 'ditto' },
        { 'name': 'previousFundingDatetime', 'kind': 'str', 'why': 'ditto' },
    ],
    'Account': [
        { 'name': 'name', 'kind': 'str', 'why': 'several venues name accounts' },
    ],
    'Transaction': [
        { 'name': 'tokenSide', 'kind': 'str', 'why': 'C# parity' },
    ],
    'Leverage': [
        { 'name': 'leverage', 'kind': 'int', 'why': 'single-sided venues emit one leverage number' },
    ],
};

// scalar TS type names that behave as strings
const STRINGY = new Set ([ 'Str', 'string', 'OrderSide', 'OrderType', 'MarketType', 'SubType', 'IndexType', 'NullableIndexType' ]);
const INTY = new Set ([ 'Int', 'int' ]);
const NUMY = new Set ([ 'Num', 'number' ]);
const BOOLY = new Set ([ 'Bool', 'boolean' ]);

type FieldPlan =
    { t: 'int' } | { t: 'num' } | { t: 'str' } | { t: 'bool' } | { t: 'any' } |
    { t: 'obj', name: string } |
    { t: 'objList', name: string } |
    { t: 'strList' } |
    { t: 'numRows' } |               // [Num, Num][]
    { t: 'dictRaw' } |
    { t: 'dictOf', name: string } |
    { t: 'inline', struct: string } |
    { t: 'skip', reason: string };

function stripNullish (text: string): string {
    return text.split ('|').map ((p) => p.trim ()).filter ((p) => p !== 'undefined' && p !== 'null').join (' | ');
}

function cppName (tsName: string): string {
    return TS_TO_CPP[tsName] !== undefined ? TS_TO_CPP[tsName] : tsName;
}

function lowerFirst (s: string): string {
    return s.charAt (0).toLowerCase () + s.slice (1);
}

function memberName (name: string): string {
    return CPP_KEYWORDS.has (name) ? name + '_' : name;
}

// some TS interfaces quote their member names ('symbol': Str); the IR keeps the quotes
function unquote (name: string): string {
    if ((name.startsWith ("'") && name.endsWith ("'")) || (name.startsWith ('"') && name.endsWith ('"'))) {
        return name.slice (1, -1);
    }
    return name;
}

function isSkipped (name: string): boolean {
    return SKIP_TYPES.some ((re) => re.test (name));
}

/** resolve a TS field type text to a concrete plan for the C++ field */
function planField (ir: TypesIR, owner: string, field: IRField, path: string): FieldPlan {
    let text = stripNullish (field.tsType.trim ());
    for (let guard = 0; guard < 16; guard++) {
        if (text.startsWith ('{')) {
            const struct = INLINE_STRUCTS[path];
            if (struct !== undefined) {
                return { 't': 'inline', 'struct': struct };
            }
            return { 't': 'any' };
        }
        if (text.endsWith ('[]')) {
            const elem = stripNullish (text.slice (0, -2).trim ());
            if (elem.startsWith ('[') && elem.endsWith (']')) {
                return { 't': 'numRows' };   // [Num, Num][]
            }
            if (STRINGY.has (elem)) {
                return { 't': 'strList' };
            }
            const decl = ir.byName[elem];
            const resolved = resolveToInterface (ir, elem);
            if (resolved !== undefined && !isSkipped (resolved)) {
                return { 't': 'objList', 'name': cppName (resolved) };
            }
            if (decl !== undefined && isSkipped (decl.name)) {
                return { 't': 'skip', 'reason': 'element type ' + elem + ' not ported' };
            }
            return { 't': 'any' };
        }
        if (text.startsWith ('Dictionary<') && text.endsWith ('>')) {
            const value = stripNullish (text.slice (11, -1).trim ());
            if (value === 'any' || value === 'object' || value === 'Dict') {
                return { 't': 'dictRaw' };
            }
            const resolved = resolveToInterface (ir, value);
            if (resolved !== undefined && !isSkipped (resolved)) {
                return { 't': 'dictOf', 'name': cppName (resolved) };
            }
            return { 't': 'dictRaw' };
        }
        if (INTY.has (text)) { return { 't': 'int' }; }
        if (NUMY.has (text)) { return { 't': 'num' }; }
        if (BOOLY.has (text)) { return { 't': 'bool' }; }
        if (STRINGY.has (text)) { return { 't': 'str' }; }
        if (text === 'any' || text === 'object') { return { 't': 'any' }; }
        if (text.indexOf ('|') >= 0) {
            const members = text.split ('|').map ((p) => p.trim ());
            const stringy = members.every ((m) => m.startsWith ("'") || STRINGY.has (m));
            if (stringy) { return { 't': 'str' }; }
            // mixed union (e.g. `number | string`) -> keep the raw value
            return { 't': 'any' };
        }
        const decl = ir.byName[text];
        if (decl === undefined) {
            return { 't': 'any' };
        }
        if (decl.kind === 'alias') {
            const next = stripNullish (decl.aliasOf === undefined ? text : decl.aliasOf);
            if (next === text) { return { 't': 'any' }; }
            text = next;
            continue;
        }
        if (isSkipped (decl.name)) {
            return { 't': 'skip', 'reason': decl.name + ' not ported' };
        }
        if (decl.kind === 'interface') {
            return { 't': 'obj', 'name': cppName (decl.name) };
        }
        return { 't': 'any' };
    }
    return { 't': 'any' };
}

/** follow alias chains until an interface name (or undefined) */
function resolveToInterface (ir: TypesIR, name: string): string | undefined {
    let text = stripNullish (name.trim ());
    for (let guard = 0; guard < 16; guard++) {
        const decl = ir.byName[text];
        if (decl === undefined) { return undefined; }
        if (decl.kind === 'interface' || decl.kind === 'dictionary') { return decl.name; }
        if (decl.kind === 'alias' && decl.aliasOf !== undefined) {
            const next = stripNullish (decl.aliasOf);
            if (next === text) { return undefined; }
            text = next;
            continue;
        }
        return undefined;
    }
    return undefined;
}

function declFor (plan: FieldPlan, name: string): string | undefined {
    const m = memberName (name);
    switch (plan.t) {
        case 'int':     return 'std::optional<int64_t> ' + m + ';';
        case 'num':     return 'std::optional<double> ' + m + ';';
        case 'str':     return 'std::optional<std::string> ' + m + ';';
        case 'bool':    return 'std::optional<bool> ' + m + ';';
        case 'any':     return 'ccxt::any ' + m + ';';
        case 'obj':     return 'std::optional<' + plan.name + '> ' + m + ';';
        case 'objList': return 'std::vector<' + plan.name + '> ' + m + ';';
        case 'strList': return 'std::vector<std::string> ' + m + ';';
        case 'numRows': return 'std::vector<std::vector<double>> ' + m + ';';
        case 'dictRaw': return 'dict ' + m + ';';
        case 'dictOf':  return 'std::map<std::string, ' + plan.name + '> ' + m + ';';
        case 'inline':  return 'std::optional<' + plan.struct + '> ' + m + ';';
        case 'skip':    return undefined;
    }
}

function readFor (plan: FieldPlan, name: string): string | undefined {
    const m = memberName (name);
    switch (plan.t) {
        case 'int':     return 'this->' + m + ' = typedsupport::optInt (raw, "' + name + '");';
        case 'num':     return 'this->' + m + ' = typedsupport::optNum (raw, "' + name + '");';
        case 'str':     return 'this->' + m + ' = typedsupport::optStr (raw, "' + name + '");';
        case 'bool':    return 'this->' + m + ' = typedsupport::optBool (raw, "' + name + '");';
        case 'any':     return 'this->' + m + ' = typedsupport::getAny (raw, "' + name + '");';
        case 'obj':     return 'this->' + m + ' = typedsupport::optStruct<' + plan.name + '> (raw, "' + name + '");';
        case 'objList': return 'this->' + m + ' = typedsupport::structList<' + plan.name + '> (raw, "' + name + '");';
        case 'strList': return 'this->' + m + ' = typedsupport::stringList (raw, "' + name + '");';
        case 'numRows': return 'this->' + m + ' = typedsupport::numberRows (raw, "' + name + '");';
        case 'dictRaw': return 'this->' + m + ' = typedsupport::dictOrEmpty (raw, "' + name + '");';
        case 'dictOf':  return 'this->' + m + ' = typedsupport::structMap<' + plan.name + '> (raw, "' + name + '");';
        case 'inline':  return 'this->' + m + ' = typedsupport::optStruct<' + plan.struct + '> (raw, "' + name + '");';
        case 'skip':    return undefined;
    }
}

function extraDecl (extra: ExtraField): string {
    switch (extra.kind) {
        case 'int':     return 'std::optional<int64_t> ' + extra.name + ';   // ' + extra.why;
        case 'num':     return 'std::optional<double> ' + extra.name + ';   // ' + extra.why;
        case 'str':     return 'std::optional<std::string> ' + extra.name + ';   // ' + extra.why;
        case 'bool':    return 'std::optional<bool> ' + extra.name + ';   // ' + extra.why;
        case 'feeList': return 'std::vector<Fee> ' + extra.name + ';   // ' + extra.why;
    }
}

function extraRead (extra: ExtraField): string {
    switch (extra.kind) {
        case 'int':     return 'this->' + extra.name + ' = typedsupport::optInt (raw, "' + extra.name + '");';
        case 'num':     return 'this->' + extra.name + ' = typedsupport::optNum (raw, "' + extra.name + '");';
        case 'str':     return 'this->' + extra.name + ' = typedsupport::optStr (raw, "' + extra.name + '");';
        case 'bool':    return 'this->' + extra.name + ' = typedsupport::optBool (raw, "' + extra.name + '");';
        case 'feeList': return 'this->' + extra.name + ' = typedsupport::structList<Fee> (raw, "' + extra.name + '");';
    }
}

// ---------------------------------------------------------------------------
// struct renderers
// ---------------------------------------------------------------------------

function renderInterfaceStruct (ir: TypesIR, type: IRType, out: string[]): void {
    const name = cppName (type.name);
    out.push ('struct ' + name + ' {');
    const reads: string[] = [];
    for (const field of type.fields) {
        const fieldName = unquote (field.name);
        const path = name + '.' + fieldName;
        const plan = planField (ir, name, field, path);
        // nested inline structs (Currency.limits.amount) are declared through INLINE_STRUCTS
        const decl = declFor (plan, fieldName);
        if (decl === undefined) { continue; }
        out.push ('    ' + decl);
        const read = readFor (plan, fieldName);
        if (read !== undefined) { reads.push (read); }
    }
    const extras = EXTRAS[name];
    if (extras !== undefined) {
        for (const extra of extras) {
            out.push ('    ' + extraDecl (extra));
            reads.push (extraRead (extra));
        }
    }
    out.push ('');
    out.push ('    ' + name + ' () = default;');
    out.push ('    explicit ' + name + ' (const ccxt::any& raw) {');
    out.push ('        if (!isDict (raw)) { return; }');
    for (const read of reads) {
        out.push ('        ' + read);
    }
    out.push ('    }');
    out.push ('};');
    out.push ('');
}

function renderDictionaryStruct (ir: TypesIR, type: IRType, out: string[]): void {
    const name = cppName (type.name);
    const rawValue = stripNullish ((type.valueType === undefined ? 'any' : type.valueType).trim ());
    // Dictionary<LeverageTier[]> -> map of vectors
    let elemName: string | undefined;
    let elemIsList = false;
    let inner = rawValue;
    if (inner.endsWith ('[]')) {
        elemIsList = true;
        inner = inner.slice (0, -2).trim ();
    }
    const resolved = resolveToInterface (ir, inner);
    if (resolved !== undefined && !isSkipped (resolved)) {
        elemName = cppName (resolved);
    }
    const mapMember = memberName (lowerFirst (name));
    const valueType = elemName === undefined
        ? 'ccxt::any'
        : (elemIsList ? 'std::vector<' + elemName + '>' : elemName);
    // declared extra fields on the dictionary interface (Balances: info/timestamp/datetime)
    const skipKeys = new Set<string> ([ 'info' ]);
    const extraDecls: string[] = [];
    const extraReads: string[] = [];
    for (const field of type.fields) {
        const fieldName = unquote (field.name);
        skipKeys.add (fieldName);
        // Balances.timestamp/datetime are declared `any` in TS ("fix later"); type them properly
        const plan: FieldPlan = fieldName === 'timestamp' ? { 't': 'int' }
            : fieldName === 'datetime' ? { 't': 'str' }
                : planField (ir, name, field, name + '.' + fieldName);
        if (fieldName === 'info') { continue; }
        const decl = declFor (plan, fieldName);
        const read = readFor (plan, fieldName);
        if (decl !== undefined) { extraDecls.push (decl); }
        if (read !== undefined) { extraReads.push (read); }
    }
    out.push ('struct ' + name + ' {');
    out.push ('    std::map<std::string, ' + valueType + '> ' + mapMember + ';');
    out.push ('    ccxt::any info;');
    for (const decl of extraDecls) {
        out.push ('    ' + decl);
    }
    out.push ('');
    out.push ('    ' + name + ' () = default;');
    out.push ('    explicit ' + name + ' (const ccxt::any& raw) {');
    out.push ('        if (!isDict (raw)) { return; }');
    out.push ('        this->info = typedsupport::getAny (raw, "info");');
    for (const read of extraReads) {
        out.push ('        ' + read);
    }
    out.push ('        for (const auto& kv : ccxt::any_cast<dict> (raw).entries ()) {');
    const keyGuards = Array.from (skipKeys).map ((k) => 'kv.first == "' + k + '"').join (' || ');
    out.push ('            if (' + keyGuards + ') { continue; }');
    if (elemName === undefined) {
        out.push ('            this->' + mapMember + '.emplace (kv.first, kv.second);');
    } else if (elemIsList) {
        out.push ('            std::vector<' + elemName + '> items;');
        out.push ('            if (isList (kv.second)) {');
        out.push ('                for (const auto& item : ccxt::any_cast<list> (kv.second).items ()) {');
        out.push ('                    items.push_back (' + elemName + ' (item));');
        out.push ('                }');
        out.push ('            }');
        out.push ('            this->' + mapMember + '.emplace (kv.first, std::move (items));');
    } else {
        out.push ('            this->' + mapMember + '.emplace (kv.first, ' + elemName + ' (kv.second));');
    }
    out.push ('        }');
    out.push ('    }');
    out.push ('');
    out.push ('    const ' + valueType + '& operator[] (const std::string& key) const { return this->' + mapMember + '.at (key); }');
    out.push ('    bool has (const std::string& key) const { return this->' + mapMember + '.count (key) > 0; }');
    out.push ('    std::size_t size () const { return this->' + mapMember + '.size (); }');
    out.push ('};');
    out.push ('');
}

const TUPLE_FIELDS: Record<string, string[]> = {
    'OHLCV': [ 'timestamp', 'open', 'high', 'low', 'close', 'volume' ],
    'OHLCVC': [ 'timestamp', 'open', 'high', 'low', 'close', 'volume', 'cost' ],
};

function renderTupleStruct (type: IRType, out: string[]): void {
    const name = cppName (type.name);
    const fields = TUPLE_FIELDS[name];
    if (fields === undefined) { return; }
    out.push ('struct ' + name + ' {');
    for (let i = 0; i < fields.length; i++) {
        // index 0 is the millisecond timestamp; the rest are prices/volumes
        out.push ('    ' + (i === 0 ? 'std::optional<int64_t> ' : 'std::optional<double> ') + fields[i] + ';');
    }
    out.push ('');
    out.push ('    ' + name + ' () = default;');
    out.push ('    explicit ' + name + ' (const ccxt::any& raw) {');
    out.push ('        if (!isList (raw)) { return; }');
    out.push ('        const auto& items = ccxt::any_cast<list> (raw).items ();');
    for (let i = 0; i < fields.length; i++) {
        if (i === 0) {
            out.push ('        if (items.size () > 0) { this->timestamp = typedsupport::anyInt (items[0]); }');
        } else {
            out.push ('        if (items.size () > ' + i + ') { this->' + fields[i] + ' = typedsupport::anyNum (items[' + i + ']); }');
        }
    }
    out.push ('    }');
    out.push ('};');
    out.push ('');
}

// Balances is the one dictionary type with real hand-shaped semantics (C# parity):
// per-code Balance map plus free/used/total scalar maps
function renderBalances (out: string[]): void {
    out.push ('struct Balances {');
    out.push ('    std::map<std::string, Balance> balances;');
    out.push ('    std::map<std::string, double> free;');
    out.push ('    std::map<std::string, double> used;');
    out.push ('    std::map<std::string, double> total;');
    out.push ('    ccxt::any info;');
    out.push ('    std::optional<int64_t> timestamp;');
    out.push ('    std::optional<std::string> datetime;');
    out.push ('');
    out.push ('    Balances () = default;');
    out.push ('    explicit Balances (const ccxt::any& raw) {');
    out.push ('        if (!isDict (raw)) { return; }');
    out.push ('        this->info = typedsupport::getAny (raw, "info");');
    out.push ('        this->timestamp = typedsupport::optInt (raw, "timestamp");');
    out.push ('        this->datetime = typedsupport::optStr (raw, "datetime");');
    out.push ('        this->free = typedsupport::numberMap (raw, "free");');
    out.push ('        this->used = typedsupport::numberMap (raw, "used");');
    out.push ('        this->total = typedsupport::numberMap (raw, "total");');
    out.push ('        for (const auto& kv : ccxt::any_cast<dict> (raw).entries ()) {');
    out.push ('            if (kv.first == "info" || kv.first == "free" || kv.first == "used" || kv.first == "total"');
    out.push ('                || kv.first == "timestamp" || kv.first == "datetime" || kv.first == "debt") { continue; }');
    out.push ('            this->balances.emplace (kv.first, Balance (kv.second));');
    out.push ('        }');
    out.push ('    }');
    out.push ('');
    out.push ('    const Balance& operator[] (const std::string& code) const { return this->balances.at (code); }');
    out.push ('    bool has (const std::string& code) const { return this->balances.count (code) > 0; }');
    out.push ('    std::size_t size () const { return this->balances.size (); }');
    out.push ('};');
    out.push ('');
}

// input structs the typed API sends TO the exchange need the reverse conversion
const TO_ANY_TYPES = new Set ([ 'OrderRequest', 'CancellationRequest' ]);

function renderToAny (ir: TypesIR, type: IRType, out: string[]): void {
    const name = cppName (type.name);
    // replace the closing "};" + blank with a toAny() before it
    while (out.length > 0 && (out[out.length - 1] === '' || out[out.length - 1] === '};')) {
        out.pop ();
    }
    out.push ('');
    out.push ('    ccxt::any toAny () const {');
    out.push ('        dict d;');
    for (const field of type.fields) {
        const fieldName = unquote (field.name);
        const plan = planField (ir, name, field, name + '.' + fieldName);
        const m = memberName (fieldName);
        switch (plan.t) {
            case 'str':
                out.push ('        if (this->' + m + '.has_value ()) { d.set ("' + fieldName + '", ccxt::any (*this->' + m + ')); }');
                break;
            case 'num':
                out.push ('        if (this->' + m + '.has_value ()) { d.set ("' + fieldName + '", ccxt::any (*this->' + m + ')); }');
                break;
            case 'int':
                out.push ('        if (this->' + m + '.has_value ()) { d.set ("' + fieldName + '", ccxt::any (static_cast<long long> (*this->' + m + '))); }');
                break;
            case 'bool':
                out.push ('        if (this->' + m + '.has_value ()) { d.set ("' + fieldName + '", ccxt::any (*this->' + m + ')); }');
                break;
            case 'any':
                out.push ('        if (this->' + m + '.has_value ()) { d.set ("' + fieldName + '", this->' + m + '); }');
                break;
            default:
                break;
        }
    }
    out.push ('        return ccxt::any (d);');
    out.push ('    }');
    out.push ('};');
    out.push ('');
}

const SUPPORT = `
// ---------------------------------------------------------------------------
// conversion support (the C++ face of C#'s Exchange.Safe* accessors)
// ---------------------------------------------------------------------------

namespace typedsupport {

// key lookup over the dynamic dict — deliberately self-contained (Value.h only), so
// Types.h can be included anywhere without dragging in the helpers layer
inline ccxt::any getAny (const ccxt::any& d, const char* key) {
    if (!isDict (d)) { return ccxt::any {}; }
    return ccxt::any_cast<dict> (d).get (std::string (key));
}

inline std::optional<double> anyNum (const ccxt::any& v) {
    if (isNum (v)) {
        return toDouble (v);
    }
    if (isStr (v)) {
        const std::string& s = ccxt::any_cast<const std::string&> (v);
        if (s.empty ()) { return std::nullopt; }
        char* end = nullptr;
        const double parsed = std::strtod (s.c_str (), &end);
        if (end != nullptr && *end == '\\0') { return parsed; }
    }
    return std::nullopt;
}

inline std::optional<int64_t> anyInt (const ccxt::any& v) {
    if (isInt (v)) {
        return static_cast<int64_t> (toLong (v));
    }
    if (isFloat (v)) {
        return static_cast<int64_t> (toDouble (v));
    }
    if (isStr (v)) {
        const std::string& s = ccxt::any_cast<const std::string&> (v);
        if (s.empty ()) { return std::nullopt; }
        char* end = nullptr;
        const long long parsed = std::strtoll (s.c_str (), &end, 10);
        if (end != nullptr && *end == '\\0') { return static_cast<int64_t> (parsed); }
    }
    return std::nullopt;
}

inline std::optional<std::string> anyStr (const ccxt::any& v) {
    if (isStr (v)) {
        return ccxt::any_cast<std::string> (v);
    }
    return std::nullopt;
}

inline std::optional<bool> anyBool (const ccxt::any& v) {
    if (isBoolean (v)) {
        return ccxt::any_cast<bool> (v);
    }
    return std::nullopt;
}

inline std::optional<double> optNum (const ccxt::any& d, const char* key) { return anyNum (getAny (d, key)); }
inline std::optional<int64_t> optInt (const ccxt::any& d, const char* key) { return anyInt (getAny (d, key)); }
inline std::optional<std::string> optStr (const ccxt::any& d, const char* key) { return anyStr (getAny (d, key)); }
inline std::optional<bool> optBool (const ccxt::any& d, const char* key) { return anyBool (getAny (d, key)); }

inline dict dictOrEmpty (const ccxt::any& d, const char* key) {
    const ccxt::any v = getAny (d, key);
    return isDict (v) ? ccxt::any_cast<dict> (v) : dict {};
}

template <class T>
std::optional<T> optStruct (const ccxt::any& d, const char* key) {
    const ccxt::any v = getAny (d, key);
    if (isDict (v)) { return T (v); }
    return std::nullopt;
}

template <class T>
std::vector<T> structList (const ccxt::any& d, const char* key) {
    std::vector<T> out;
    const ccxt::any v = getAny (d, key);
    if (isList (v)) {
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            out.push_back (T (item));
        }
    }
    return out;
}

template <class T>
std::map<std::string, T> structMap (const ccxt::any& d, const char* key) {
    std::map<std::string, T> out;
    const ccxt::any v = getAny (d, key);
    if (isDict (v)) {
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            out.emplace (kv.first, T (kv.second));
        }
    }
    return out;
}

inline std::vector<std::string> stringList (const ccxt::any& d, const char* key) {
    std::vector<std::string> out;
    const ccxt::any v = getAny (d, key);
    if (isList (v)) {
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            if (isStr (item)) { out.push_back (ccxt::any_cast<std::string> (item)); }
        }
    }
    return out;
}

inline std::vector<std::vector<double>> numberRows (const ccxt::any& d, const char* key) {
    std::vector<std::vector<double>> out;
    const ccxt::any v = getAny (d, key);
    if (isList (v)) {
        for (const auto& row : ccxt::any_cast<list> (v).items ()) {
            std::vector<double> cells;
            if (isList (row)) {
                for (const auto& cell : ccxt::any_cast<list> (row).items ()) {
                    const auto n = anyNum (cell);
                    if (n.has_value ()) { cells.push_back (*n); }
                }
            }
            out.push_back (std::move (cells));
        }
    }
    return out;
}

inline std::map<std::string, double> numberMap (const ccxt::any& d, const char* key) {
    std::map<std::string, double> out;
    const ccxt::any v = getAny (d, key);
    if (isDict (v)) {
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            const auto n = anyNum (kv.second);
            if (n.has_value ()) { out.emplace (kv.first, *n); }
        }
    }
    return out;
}

} // namespace typedsupport
`;

const TYPED_ANY_HELPERS = `
// ---------------------------------------------------------------------------
// argument conversion for the typed API (Exchange.TypedApi.inc)
// ---------------------------------------------------------------------------

inline ccxt::any typedAny (const std::string& v) { return ccxt::any (v); }
inline ccxt::any typedAny (const char* v) { return ccxt::any (std::string (v)); }
inline ccxt::any typedAny (double v) { return ccxt::any (v); }
inline ccxt::any typedAny (bool v) { return ccxt::any (v); }
inline ccxt::any typedAny (const dict& v) { return ccxt::any (v); }
inline ccxt::any typedAny (const list& v) { return ccxt::any (v); }
inline ccxt::any typedAny (const ccxt::any& v) { return v; }
inline ccxt::any typedAny (const std::optional<int64_t>& v) { return v.has_value () ? ccxt::any (static_cast<long long> (*v)) : ccxt::any {}; }
inline ccxt::any typedAny (const std::optional<double>& v) { return v.has_value () ? ccxt::any (*v) : ccxt::any {}; }
inline ccxt::any typedAny (const std::optional<std::string>& v) { return v.has_value () ? ccxt::any (*v) : ccxt::any {}; }
inline ccxt::any typedAny (const std::optional<bool>& v) { return v.has_value () ? ccxt::any (*v) : ccxt::any {}; }
// empty vector rides as undefined: unified semantics treat absent symbol lists as "all"
inline ccxt::any typedAny (const std::vector<std::string>& v) {
    if (v.empty ()) { return ccxt::any {}; }
    list out;
    for (const auto& s : v) { out.push (ccxt::any (s)); }
    return ccxt::any (out);
}

template <class T>
std::vector<T> typedVector (const ccxt::any& v) {
    std::vector<T> out;
    if (isList (v)) {
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            out.push_back (T (item));
        }
    }
    return out;
}

template <class T>
std::map<std::string, T> typedMap (const ccxt::any& v) {
    std::map<std::string, T> out;
    if (isDict (v)) {
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            if (kv.first == "info") { continue; }
            out.emplace (kv.first, T (kv.second));
        }
    }
    return out;
}

inline std::vector<std::string> typedStringVector (const ccxt::any& v) {
    std::vector<std::string> out;
    if (isList (v)) {
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            if (isStr (item)) { out.push_back (ccxt::any_cast<std::string> (item)); }
        }
    }
    return out;
}

// vector of request structs (OrderRequest / CancellationRequest) -> dynamic list
template <class T>
ccxt::any typedAnyList (const std::vector<T>& v) {
    list out;
    for (const auto& item : v) { out.push (item.toAny ()); }
    return ccxt::any (out);
}
`;

function emitCpp (ir: TypesIR): string {
    const out: string[] = [];
    out.push ('#pragma once');
    out.push ('');
    out.push ('// Typed unified structures over the dynamic ccxt::any value model — the layer the');
    out.push ('// user consumes. Generated from ts/src/base/types.ts; regenerate with');
    out.push ('// `npm run transpile-types` (or `npx tsx build/transpileTypes.ts --lang cpp`).');
    out.push ('');
    out.push ('#include "Value.h"');
    out.push ('');
    out.push ('#include <cstdint>');
    out.push ('#include <cstdlib>');
    out.push ('#include <map>');
    out.push ('#include <optional>');
    out.push ('#include <string>');
    out.push ('#include <vector>');
    out.push ('');
    out.push ('namespace ccxt {');
    // C++ requires declaration-before-use, and the TS declaration order is not a
    // topological order (PredictionMarket references PredictionOutcome declared
    // below it), so forward-declare every emitted struct up front
    for (const type of ir.types) {
        if (isSkipped (type.name)) { continue; }
        if (type.kind !== 'interface' && type.kind !== 'dictionary' && type.kind !== 'tuple') { continue; }
        out.push ('struct ' + cppName (type.name) + ';');
    }
    out.push ('');
    out.push (SUPPORT.trimEnd ());
    out.push ('');
    const changed: string[] = [];
    for (const type of ir.types) {
        if (isSkipped (type.name)) { continue; }
        const name = cppName (type.name);
        if (name === 'Balances') {
            renderBalances (out);
            changed.push (name);
            continue;
        }
        if (type.kind === 'interface') {
            // inline sub-structs must exist before their owner
            if (name === 'Market') {
                out.push ('struct Limits {');
                out.push ('    std::optional<MinMax> amount;');
                out.push ('    std::optional<MinMax> cost;');
                out.push ('    std::optional<MinMax> leverage;');
                out.push ('    std::optional<MinMax> price;');
                out.push ('    std::optional<MinMax> market;');
                out.push ('');
                out.push ('    Limits () = default;');
                out.push ('    explicit Limits (const ccxt::any& raw) {');
                out.push ('        if (!isDict (raw)) { return; }');
                out.push ('        this->amount = typedsupport::optStruct<MinMax> (raw, "amount");');
                out.push ('        this->cost = typedsupport::optStruct<MinMax> (raw, "cost");');
                out.push ('        this->leverage = typedsupport::optStruct<MinMax> (raw, "leverage");');
                out.push ('        this->price = typedsupport::optStruct<MinMax> (raw, "price");');
                out.push ('        this->market = typedsupport::optStruct<MinMax> (raw, "market");');
                out.push ('    }');
                out.push ('};');
                out.push ('');
            }
            if (name === 'Currency') {
                out.push ('struct CurrencyLimits {');
                out.push ('    std::optional<MinMax> amount;');
                out.push ('    std::optional<MinMax> withdraw;');
                out.push ('');
                out.push ('    CurrencyLimits () = default;');
                out.push ('    explicit CurrencyLimits (const ccxt::any& raw) {');
                out.push ('        if (!isDict (raw)) { return; }');
                out.push ('        this->amount = typedsupport::optStruct<MinMax> (raw, "amount");');
                out.push ('        this->withdraw = typedsupport::optStruct<MinMax> (raw, "withdraw");');
                out.push ('    }');
                out.push ('};');
                out.push ('');
            }
            renderInterfaceStruct (ir, type, out);
            if (TO_ANY_TYPES.has (type.name)) {
                renderToAny (ir, type, out);
            }
            changed.push (name);
        } else if (type.kind === 'dictionary') {
            renderDictionaryStruct (ir, type, out);
            changed.push (name);
        } else if (type.kind === 'tuple') {
            if (TUPLE_FIELDS[name] !== undefined) {
                renderTupleStruct (type, out);
                changed.push (name);
            }
        }
        // aliases and generics resolve at use sites; nothing to emit
    }
    out.push (TYPED_ANY_HELPERS.trimEnd ());
    out.push ('');
    out.push ('} // namespace ccxt');
    out.push ('');
    return ensureGeneratedBanner (out.join ('\n'), '//');
}

const emitter: LanguageEmitter = {
    'id': 'cpp',
    'emit': (ir: TypesIR): EmitterOutput[] => {
        const contents = emitCpp (ir);
        return [ { 'path': OUT_PATH, 'contents': contents, 'changed': [] } ];
    },
};

export default emitter;
