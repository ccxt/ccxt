// Emits python/ccxt/base/types.py from ts/src/base/types.ts.
//
// python/ccxt/base/types.py is NOT a pure generated dump — it also carries hand-written
// support code that has no counterpart in the TS (the import prologue with the
// sys.version_info TypedDict/NotRequired fallbacks, the `Entry` descriptor, the scalar
// aliases that are deliberately wider than their TS originals, the helper TypedDicts
// `MarketLimits`/`CurrencyLimits`/`Limit`, `ConstructorArgs`). So this emitter never
// rewrites the whole file: it produces one Python block per TS declaration and splices it
// over the block that is already there, matched by its declaration anchor (see
// build/typeEmitters/splice.ts). Everything outside the anchors — blank lines, leading
// comments, the hand-written helpers — is preserved byte-for-byte, which makes the
// resulting git diff exactly the drift against the TS and nothing else.

import fs from 'fs';
import path from 'path';
import { TypesIR, IRType, IRField, ensureGeneratedBanner } from '../typesIR.js';
import { spliceBlocks, findIndentBlockEnd, EmittedBlock } from './splice.js';

const TARGET = path.join ('python', 'ccxt', 'base', 'types.py');

// ---------------------------------------------------------------------------------------
// Declarations this emitter deliberately does not own.
// ---------------------------------------------------------------------------------------

// Hand-maintained on the Python side, with a reason:
//   Balances          — TS declares `timestamp?: any; // we need to fix this later` and
//                       `datetime?: any`, while Python already carries the correct
//                       `timestamp: Int` / `datetime: Str`. Generating from the TS would
//                       be a regression, so the Python block stays hand-written until the
//                       TS is fixed.
//   MarketMarginModes — a plain data bag the Python file happens to fill with `bool`
//                       (plain annotation, not the nullable `Bool` alias).
const HAND_MAINTAINED: string[] = [ 'Balances', 'MarketMarginModes' ];

// Exported by the TS but intentionally not part of the Python surface. `Dict`, `List`,
// `NullableDict` and `NullableList` would shadow typing.Dict / typing.List; `int`,
// `Dictionary` and `NestedDictionary` have no Python analogue; the
// rest are simply not re-exported by the Python port today.
const NOT_PORTED: string[] = [
    'int', 'Dictionary', 'NestedDictionary', 'Dict', 'NullableDict', 'List', 'NullableList',
    'OHLCV', 'OHLCVC',
    // the Python port predates these and does not expose them yet — appending new names
    // would change the public surface, so that is an editorial decision, not generation
    'PartialBalances', 'WithdrawalResponse', 'DepositWithdrawFeeNetwork', 'DepositWithdrawFee',
];

// The scalar aliases (Str/Num/Int/Bool/OrderSide/...) are hand-written in Python and are
// deliberately not one-to-one with the TS (`Num` is widened to accept str/Decimal, the
// Literal aliases are narrower than their `| string` TS counterparts). Only aliases that
// are a plain `<Interface> | undefined` are generated.
// ---------------------------------------------------------------------------------------

// TS `number` is ambiguous in Python (Int vs Num vs the `Union[None, float]` idiom) and
// cannot be resolved mechanically, so the affected fields carry an explicit mapping.
const FIELD_OVERRIDES: { [key: string]: string } = {
    'fetchEventsParams.limit': 'Int',
    'FundingRate.timestamp': 'Int',
    'FundingRate.fundingTimestamp': 'Int',
    'FundingRate.nextFundingTimestamp': 'Int',
    'FundingRate.previousFundingTimestamp': 'Int',
    'OrderRequest.amount': 'Union[None, float]',
    'OrderRequest.price': 'Union[None, float]',
    'PredictionOrderRequest.amount': 'Union[None, float]',
    'PredictionOrderRequest.price': 'Union[None, float]',
};

// In the prediction hierarchy the unified handle is the canonical identity — a plain
// `str`, not the nullable `Str` alias (see the module docstring above these types). The
// Python port applies that convention uniformly to `outcome` (TS `string`), even where
// the TS marks the field optional.
const FORCED_PLAIN_STR: string[] = [ 'outcome' ];

// Anonymous TS object literals are expressed as named helper TypedDicts in Python.
const INLINE_TYPE_NAMES: { [key: string]: string } = {
    'MarketInterface.limits': 'MarketLimits',
    'CurrencyInterface.limits': 'CurrencyLimits',
    'PredictionMarket.limits': 'MarketLimits',
};

// TS-optional fields the hand-written file marks `NotRequired[...]`. Every other optional
// field maps onto an already-nullable Python alias (Str/Num/Int/Bool are all
// `Optional[...]`), so the file expresses optionality at the value level rather than with
// NotRequired; keeping that convention is what makes this a splice and not a rewrite.
const NOT_REQUIRED: string[] = [
    'FeeInterface.rate',
    'Balance.debt',
];

// The hand-written Python aliases for these are `Literal[...]` unions that are strictly
// narrower than the TS ones (every TS counterpart widens with `| string`), so referencing
// them would fabricate a narrowing the source of truth does not have. Fields of these
// types therefore map onto the widened annotation on the right.
const NARROWED_ALIASES: { [key: string]: string } = {
    'OrderSide': 'Str',
    'OrderType': 'Str',
    'MarketType': 'Str',
    'SubType': 'Str',
};

const SCALARS: { [key: string]: string } = {
    'Str': 'Str',
    'Strings': 'Strings',
    'Num': 'Num',
    'Int': 'Int',
    'Bool': 'Bool',
    'Fee': 'Fee',
    'Market': 'Market',
    'Currency': 'Currency',
    'IndexType': 'IndexType',
    'NullableIndexType': 'NullableIndexType',
    'string': 'str',
    'boolean': 'bool',
    'number': 'Num',
    'any': 'Any',
    'Dict': 'Dict[str, Any]',
};

// `?:` widens a non-nullable Python annotation to its nullable alias.
const WIDENED: { [key: string]: string } = {
    'str': 'Str',
    'bool': 'Bool',
    'int': 'Int',
    'float': 'Num',
};

function isStringLiteral (member: string): boolean {
    return member.startsWith ("'") && member.endsWith ("'");
}

function stripNullish (members: string[]): string[] {
    return members.filter ((m) => m !== 'undefined' && m !== 'null');
}

function unquoteName (name: string): string {
    if ((name.startsWith ("'") && name.endsWith ("'")) || (name.startsWith ('"') && name.endsWith ('"'))) {
        return name.slice (1, -1);
    }
    return name;
}

/** Maps a raw TS type text onto a Python annotation. */
function mapType (tsType: string, ownerAndField: string, fieldName: string, optional: boolean): string {
    const override = FIELD_OVERRIDES[ownerAndField];
    if (override !== undefined) {
        return override;
    }
    const raw = tsType.trim ();
    if (raw === 'any') {
        // the decoded-exchange-JSON `info` field is conventionally a dict in the Python
        // port; any other `any` maps onto the plain `Any` alias
        return fieldName === 'info' ? 'Dict[str, Any]' : 'Any';
    }
    if (raw.startsWith ('{')) {
        const named = INLINE_TYPE_NAMES[ownerAndField];
        if (named === undefined) {
            throw new Error ('python emitter: no Python name for the inline object type of ' + ownerAndField);
        }
        return named;
    }
    if (raw.indexOf ('|') >= 0) {
        const members = raw.split ('|').map ((m) => m.trim ());
        const kept = stripNullish (members);
        const nullable = kept.length !== members.length;
        if (kept.length > 0 && kept.every (isStringLiteral)) {
            const literal = 'Literal[' + kept.join (', ') + ']';
            return nullable ? 'Optional[' + literal + ']' : literal;
        }
        // a literal union widened by a nullable alias (`'buy' | 'sell' | Str`) collapses
        // onto that alias — exactly what the alias is there for
        const widening = kept.filter ((m) => !isStringLiteral (m));
        return mapType (widening[0], '', fieldName, optional || nullable);
    }
    if (raw.startsWith ('Dictionary<') && raw.endsWith ('>')) {
        return 'Dict[str, ' + mapType (raw.slice (11, -1), '', fieldName, false) + ']';
    }
    if (raw.endsWith ('[]')) {
        return 'List[' + mapType (raw.slice (0, -2), '', fieldName, false) + ']';
    }
    if (raw.startsWith ('[') && raw.endsWith (']')) {
        // a fixed-length TS tuple (`[Num, Num]`) has no Python analogue in this file and is
        // written as a homogeneous list
        const elements = raw.slice (1, -1).split (',').map ((m) => m.trim ());
        return 'List[' + mapType (elements[0], '', fieldName, false) + ']';
    }
    const narrowed = NARROWED_ALIASES[raw];
    if (narrowed !== undefined) {
        return narrowed;
    }
    let mapped = SCALARS[raw];
    if (mapped === undefined) {
        mapped = raw; // an interface / dictionary name maps onto the Python class of the same name
    }
    if (optional && FORCED_PLAIN_STR.indexOf (fieldName) < 0 && WIDENED[mapped] !== undefined) {
        return WIDENED[mapped];
    }
    return mapped;
}

// ---------------------------------------------------------------------------------------
// The existing file is parsed so that hand-written trailing comments (which are editorial,
// not mechanical translations of the TS ones) and untouched lines survive byte-for-byte.
// ---------------------------------------------------------------------------------------

interface ExistingLine {
    raw: string;
    typeText: string;
    commentColumn: number;
    comment: string | undefined;
}

interface ExistingBlock {
    headerComment: string | undefined;
    headerCommentColumn: number;
    line: number;
    fields: { [name: string]: ExistingLine };
}

function parseExisting (text: string): { [name: string]: ExistingBlock } {
    const lines = text.split ('\n');
    const out: { [name: string]: ExistingBlock } = {};
    for (let i = 0; i < lines.length; i++) {
        const classMatch = lines[i].match (/^class ([A-Za-z_][A-Za-z0-9_]*)\s*[(:]/);
        const aliasMatch = lines[i].match (/^([A-Za-z_][A-Za-z0-9_]*) = /);
        if (classMatch === null && aliasMatch === null) {
            continue;
        }
        const name = classMatch !== null ? classMatch[1] : aliasMatch[1];
        const headerHash = classMatch !== null ? lines[i].indexOf ('  # ') : -1;
        const block: ExistingBlock = {
            'headerComment': headerHash >= 0 ? lines[i].slice (headerHash + 4) : undefined,
            'headerCommentColumn': headerHash >= 0 ? headerHash + 2 : -1,
            'line': i,
            'fields': {},
        };
        out[name] = block;
        if (classMatch === null) {
            continue;
        }
        const end = findIndentBlockEnd (lines, i);
        for (let j = i + 1; j <= end; j++) {
            const field = lines[j].match (/^ {4}([A-Za-z_][A-Za-z0-9_]*): (.*)$/);
            if (field === null) {
                continue;
            }
            const rest = field[2];
            const hash = rest.indexOf ('  # ');
            block.fields[field[1]] = {
                'raw': lines[j],
                'typeText': (hash >= 0 ? rest.slice (0, hash) : rest).trim (),
                'commentColumn': hash >= 0 ? 4 + field[1].length + 2 + hash + 2 : -1,
                'comment': hash >= 0 ? rest.slice (hash + 4) : undefined,
            };
        }
        i = end;
    }
    return out;
}

function emitField (code: string, existing: ExistingLine | undefined, column: number, comment: string | undefined): string {
    if (existing !== undefined && existing.typeText === code.slice (code.indexOf (': ') + 2)) {
        return existing.raw; // unchanged annotation — reuse the line (and its comment) verbatim
    }
    if (comment === undefined) {
        return code;
    }
    const padding = Math.max (2, column - code.length);
    return code + ' '.repeat (padding) + '# ' + comment;
}

// ---------------------------------------------------------------------------------------

function emitInterface (type: IRType, existing: ExistingBlock, declaredAfter: (name: string) => boolean): string {
    const lines: string[] = [];
    let header = 'class ' + type.name + '(TypedDict):';
    if (existing.headerComment !== undefined) {
        const padding = Math.max (2, existing.headerCommentColumn - header.length);
        header = header + ' '.repeat (padding) + '# ' + existing.headerComment;
    }
    lines.push (header);
    for (let i = 0; i < type.fields.length; i++) {
        const field: IRField = type.fields[i];
        const name = unquoteName (field.name);
        const key = type.name + '.' + name;
        let pyType = mapType (field.tsType, key, name, field.optional);
        pyType = pyType.replace (/[A-Za-z_][A-Za-z0-9_]*/g, (identifier) => {
            // a reference to a class declared further down the file has to be a string
            // forward reference — Python evaluates these annotations eagerly
            return declaredAfter (identifier) ? "'" + identifier + "'" : identifier;
        });
        if (NOT_REQUIRED.indexOf (key) >= 0) {
            pyType = 'NotRequired[' + pyType + ']';
        }
        const code = '    ' + name + ': ' + pyType;
        const existingField = existing.fields[name];
        const comment = existingField === undefined ? undefined : existingField.comment;
        const column = existingField === undefined ? -1 : existingField.commentColumn;
        lines.push (emitField (code, existingField, column, comment));
    }
    if (type.fields.length === 0) {
        lines.push ('    pass');
    }
    return lines.join ('\n');
}

function emitDictionary (type: IRType): string {
    const valueType = mapType (type.valueType as string, '', type.name, false);
    // the file keys its type aliases with `str` (the scalar key type), never the nullable `Str`
    return type.name + ' = Dict[str, ' + valueType + ']';
}

function emitNullableAlias (type: IRType): string {
    const kept = stripNullish (type.unionMembers);
    return type.name + ' = Optional[' + kept[0] + ']';
}

export function emit (ir: TypesIR, repoRoot: string) {
    const absolute = path.join (repoRoot, TARGET);
    const before = fs.readFileSync (absolute, 'utf8');
    const existing = parseExisting (before);
    const skip = HAND_MAINTAINED.concat (NOT_PORTED);
    const owned: IRType[] = [];
    for (let i = 0; i < ir.types.length; i++) {
        const type = ir.types[i];
        if (skip.indexOf (type.name) >= 0 || type.kind === 'generic' || type.kind === 'tuple') {
            continue;
        }
        if (type.kind === 'alias') {
            // only `<Interface> | undefined` aliases are mechanical; the scalar aliases are
            // hand-written and deliberately diverge from the TS
            const kept = stripNullish (type.unionMembers);
            const target = kept.length === 1 ? ir.byName[kept[0]] : undefined;
            if (kept.length !== type.unionMembers.length && target !== undefined && target.kind === 'interface') {
                owned.push (type);
            }
            continue;
        }
        if (existing[type.name] === undefined) {
            // a type the Python port does not expose yet — reported by the splice as neither
            // replaced nor appended; where it belongs in the file is an editorial decision
            continue;
        }
        owned.push (type);
    }
    const blocks: EmittedBlock[] = [];
    for (let i = 0; i < owned.length; i++) {
        const type = owned[i];
        const here = existing[type.name];
        const declaredAfter = (name: string): boolean => {
            const other = existing[name];
            return other !== undefined && other.line > here.line;
        };
        let source: string;
        if (type.kind === 'dictionary') {
            source = emitDictionary (type);
        } else if (type.kind === 'alias') {
            source = emitNullableAlias (type);
        } else {
            source = emitInterface (type, here, declaredAfter);
        }
        const anchor = (type.kind === 'interface')
            ? new RegExp ('^class ' + type.name + '\\s*[(:]')
            : new RegExp ('^' + type.name + ' = ');
        blocks.push ({ 'name': type.name, 'anchor': anchor, 'source': source });
    }
    const result = spliceBlocks (before, blocks, findIndentBlockEnd);
    const contents = ensureGeneratedBanner (result.text, '#');
    const changed = result.replaced.concat (result.appended);
    if (contents !== result.text && changed.indexOf ('banner') < 0) {
        changed.push ('banner');
    }
    return [ {
        'path': TARGET,
        'contents': contents,
        'changed': changed,
    } ];
}

export default { 'id': 'python', 'emit': emit };
