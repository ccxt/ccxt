// ===== hx10w3 G09: PredictionExchange caches are plain typed maps =====
// go/v4/exchange_prediction.go declares Outcomes / Outcomes_by_id / Events / Events_by_slug as
// map[string]any (the struct field table in goTranspiler.ts), so a site that proves its key is a
// Go string writes and reads the map natively. The helpers' remaining arms stay reachable only
// through the sites this block leaves alone: AddElementToObject no-ops on a nil key and on a nil
// map, so the native write sits behind the same `!= nil` guard and a nil map keeps no-oping on
// its own; IsEqual(f, nil) on a nil map answers false while the helper answered true for the
// untyped nil box, so the field's nil tests print natively here. Anything the file does not
// prove keeps the plain helper call byte for byte.

const G09W3_FIELDS = [ 'Outcomes', 'Outcomes_by_id', 'Events', 'Events_by_slug' ];
const G09W3_FIELD_RX = G09W3_FIELDS.join ('|');

// spaces out string/rune/comment text, newlines and offsets kept
function g09w3Mask (source) {
    const out = [];
    let mode = null;
    let escaped = false;
    for (let i = 0; i < source.length; i++) {
        const c = source[i];
        const next = source[i + 1];
        if (mode === null) {
            if ((c === '/') && (next === '/')) { mode = 'line'; out.push ('  '); i++; continue; }
            if ((c === '/') && (next === '*')) { mode = 'block'; out.push ('  '); i++; continue; }
            if (c === '"') { mode = 'str'; escaped = false; out.push ('"'); continue; }
            if (c === '`') { mode = 'raw'; out.push ('`'); continue; }
            if (c === '\'') { mode = 'rune'; escaped = false; out.push ('\''); continue; }
            out.push (c);
            continue;
        }
        if (mode === 'line') {
            mode = (c === '\n') ? null : mode;
            out.push ((c === '\n') ? '\n' : ' ');
            continue;
        }
        if (mode === 'block') {
            if ((c === '*') && (next === '/')) { mode = null; out.push ('  '); i++; continue; }
            out.push ((c === '\n') ? '\n' : ' ');
            continue;
        }
        if (mode === 'raw') {
            if (c === '`') { mode = null; out.push ('`'); continue; }
            out.push ((c === '\n') ? '\n' : ' ');
            continue;
        }
        out.push ((c === '\n') ? '  ' : ' ');
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (((mode === 'str') && (c === '"')) || ((mode === 'rune') && (c === '\''))) { mode = null; }
    }
    return out.join ('');
}

// every line that sits inside a `func (this *X) …` block, with that block's masked text
function g09w3ForEach (content, visit) {
    const lines = content.split ('\n');
    const masked = g09w3Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    let funcText = '';
    for (let k = 0; k < lines.length; k++) {
        if (masked[k].startsWith ('func ')) {
            start = k;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            funcText = masked.slice (k, end + 1).join ('\n');
        }
        if (lines[k] === '}') {
            start = -1;
            funcText = '';
            continue;
        }
        if (start < 0) {
            continue;
        }
        lines[k] = visit (k, lines, masked, funcText);
    }
    return lines.join ('\n');
}

// a key the map index accepts: a string literal, an identifier declared once as `string`, or an
// element of a `[]string` local read by a loop that bounds the index to that slice's length
function g09w3StringKey (key, funcText) {
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (key)) {
        return true;
    }
    if (/^\w+$/.test (key)) {
        const decls = [ ...funcText.matchAll (new RegExp ('\\bvar ' + key + ' (\\S+) =', 'g')) ];
        if ((decls.length !== 1) || (decls[0][1] !== 'string')) {
            return false;
        }
        const rebind = new RegExp ('(?<![\\w.])' + key + ' (?![=!<>])=(?!=)', 'g');
        return [ ...funcText.matchAll (rebind) ].length === 0;
    }
    const element = /^(\w+)\[(\w+)\]$/.exec (key);
    if (element === null) {
        return false;
    }
    const container = element[1];
    const index = element[2];
    const decls = [ ...funcText.matchAll (new RegExp ('\\bvar ' + container + ' \\[\\]string =', 'g')) ];
    return (decls.length === 1) && new RegExp ('\\b' + index + ' < len\\(' + container + '\\)').test (funcText);
}

// a value the helper's derefScalar leaves alone: an `any` / map local that never holds a pointer
// (the pointer-returning accessors are the only way one gets into a box, and none binds here)
function g09w3PlainValue (name, funcText) {
    if (/^(?:map\[string\]any\{|(?:ccxt\.)?map\[string\]any\{)/.test (name)) {
        return true;
    }
    if (!/^\w+$/.test (name)) {
        return false;
    }
    const decls = [ ...funcText.matchAll (new RegExp ('\\bvar ' + name + ' (\\S+) =', 'g')) ];
    if ((decls.length !== 1) || !/^(?:any|map\[string\]any)$/.test (decls[0][1])) {
        return false;
    }
    return !new RegExp ('(?<![\\w.])' + name + ' = (?:ccxt\\.)?(?:this\\.)?Safe(?:String|Integer|Int|Number|Bool|Timestamp)\\w*\\(').test (funcText);
}

// IsEqual(this.<F>, nil) on a nil map answers false while the boxed untyped nil answered true:
// the field's own nil test is the map header, so both polarities print natively
function g09w3NilCompares (content) {
    const fields = new RegExp ('this\\.(' + G09W3_FIELD_RX + '), nil\\)');
    if (!fields.test (content)) {
        return content;
    }
    return g09w3ForEach (content, (k, lines, masked) => {
        if (masked[k].indexOf ('IsEqual(') < 0) {
            return lines[k];
        }
        let line = lines[k].replace (new RegExp ('(\\()?!\\s*(?:ccxt\\.)?IsEqual\\(this\\.(' + G09W3_FIELD_RX + '), nil\\)', 'g'), (all, paren, field) => ((paren ? '(' : '') + 'this.' + field + ' != nil'));
        line = line.replace (new RegExp ('(?:ccxt\\.)?IsEqual\\(this\\.(' + G09W3_FIELD_RX + '), nil\\)', 'g'), (all, field) => ('this.' + field + ' == nil'));
        // a source `!x && !x` names the same nil test twice, which the vet checklist rejects
        const dupNil = new RegExp ('\\(?this\\.(' + G09W3_FIELD_RX + ') != nil\\)? && \\(?this\\.\\1 != nil\\)?', 'g');
        line = line.replace (dupNil, (all, field) => ('this.' + field + ' != nil'));
        line = line.replace (dupNil, (all, field) => ('this.' + field + ' != nil'));
        return line;
    });
}

// AddElementToObject(this.<F>, <*string ptr>, <plain value>) directly under `if <ptr> != nil {`
// -> this.<F>[*<ptr>] = <value>. A nil pointer key was a no-op in the helper and the guard is the
// same no-op; a nil map stays a no-op through Go's own nil-map write rule.
function g09w3Writes (content) {
    if (!new RegExp ('(?:ccxt\\.)?AddElementToObject\\(this\\.(?:' + G09W3_FIELD_RX + '),').test (content)) {
        return content;
    }
    const call = new RegExp ('^(\\s*)(?:ccxt\\.)?AddElementToObject\\(this\\.(' + G09W3_FIELD_RX + '), (\\w+), (\\w+)\\)$');
    return g09w3ForEach (content, (k, lines, masked, funcText) => {
        const match = call.exec (masked[k]);
        if (match === null) {
            return lines[k];
        }
        const guard = /^\s*if (\w+) != nil \{$/.exec (masked[k - 1] ?? '');
        if ((guard === null) || (guard[1] !== match[3])) {
            return lines[k];
        }
        if (!/^\s*\}$/.test (masked[k + 1] ?? '')) {
            return lines[k];
        }
        const decls = [ ...funcText.matchAll (new RegExp ('\\bvar ' + match[3] + ' (\\S+) =', 'g')) ];
        if ((decls.length !== 1) || (decls[0][1] !== '*string')) {
            return lines[k];
        }
        if (!g09w3PlainValue (match[4], funcText)) {
            return lines[k];
        }
        return match[1] + 'this.' + match[2] + '[*' + match[3] + '] = ' + match[4];
    });
}

// GetValue(this.<F>, <string key>) -> this.<F>[<key>]: an absent key and a nil map both answer
// nil, which is exactly the helper's read once the values are plain
function g09w3Reads (content) {
    if (!new RegExp ('(?:ccxt\\.)?GetValue\\(this\\.(?:' + G09W3_FIELD_RX + '),').test (content)) {
        return content;
    }
    const call = new RegExp ('(?:ccxt\\.)?GetValue\\(this\\.(' + G09W3_FIELD_RX + '), ([^()\\n]+)\\)', 'g');
    return g09w3ForEach (content, (k, lines, masked, funcText) => {
        if (masked[k].indexOf ('GetValue(') < 0) {
            return lines[k];
        }
        return lines[k].replace (call, (all, field, key) => (g09w3StringKey (key.trim (), funcText) ? ('this.' + field + '[' + key + ']') : all));
    });
}

// var ks []string = ObjectKeys(this.<F>) -> the nil/empty-preserving range over the map, which is
// the key list ObjectKeys builds (a nil map keeps a nil slice, an empty one keeps an empty slice)
function g09w3KeysRange (content) {
    if (!new RegExp ('\\[\\]string = (?:ccxt\\.)?ObjectKeys\\(this\\.(?:' + G09W3_FIELD_RX + ')\\)').test (content)) {
        return content;
    }
    const keys = new RegExp ('^(\\s*)var (\\w+) \\[\\]string = (?:ccxt\\.)?ObjectKeys\\(this\\.(' + G09W3_FIELD_RX + ')\\)$');
    const lines = content.split ('\n');
    const masked = g09w3Mask (content).split ('\n');
    if ((lines.length !== masked.length) || /\bobjectKey\b/.test (masked.join ('\n'))) {
        return content;
    }
    const out = [];
    for (let k = 0; k < lines.length; k++) {
        const match = keys.exec (masked[k]);
        if (match === null) {
            out.push (lines[k]);
            continue;
        }
        const ind = match[1];
        const unit = ind.includes ('\t') ? '\t' : '    ';
        const inner = ind + unit;
        const deeper = inner + unit;
        out.push (ind + 'var ' + match[2] + ' []string = nil');
        out.push (ind + 'if this.' + match[3] + ' != nil {');
        out.push (inner + match[2] + ' = make([]string, 0, len(this.' + match[3] + '))');
        out.push (inner + 'for objectKey := range this.' + match[3] + ' {');
        out.push (deeper + match[2] + ' = append(' + match[2] + ', objectKey)');
        out.push (inner + '}');
        out.push (ind + '}');
    }
    return out.join ('\n');
}

// MapTyped(this.<F>) -> this.<F>: MapTyped is the identity on a map (a nil map included), and the
// field is declared map[string]any, so its conversion arms cannot be reached
function g09w3MapTyped (content) {
    const call = new RegExp ('(?<![\\w.])(?:ccxt\\.)?MapTyped\\(this\\.(' + G09W3_FIELD_RX + ')\\)', 'g');
    if (!call.test (content)) {
        return content;
    }
    return g09w3ForEach (content, (k, lines, masked) => {
        if (masked[k].indexOf ('MapTyped(') < 0) {
            return lines[k];
        }
        return lines[k].replace (call, (all, field) => ('this.' + field));
    });
}

export function g09w3Pass (content) {
    if (!/PredictionExchange/.test (content)) {
        return content;
    }
    content = g09w3NilCompares (content);
    content = g09w3Writes (content);
    content = g09w3Reads (content);
    content = g09w3MapTyped (content);
    return g09w3KeysRange (content);
}

// the generated prediction files that bypass formatGoSource (exchange_prediction.go) go through
// hx4G20BaseNativePasses instead, so both pipelines run these four passes
export function g09w3Wired () {
    return true;
}

const G09W3_HEAD = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\ntype PredictionExchange struct {\n\tBaseExchange\n\tEvents map[string]any\n}\n\n';

function g09w3Body (body) {
    return G09W3_HEAD + 'func (this *PredictionExchange) SetEvents(events any) map[string]any {\n' + body + '\treturn nil\n}\n';
}

export function g09w3Check (formatGoSource) {
    const problems = [];
    const ok = (condition, message) => { if (!condition) { problems.push ('hx10w3-G09: ' + message); } };
    const base = G09W3_HEAD + 'func (this *PredictionExchange) SetEvents(events any) map[string]any {\n\tvar event any = GetValue(events, 0)\n\tvar id *string = this.SafeString(event, "id")\n\tif id != nil {\n\t\tAddElementToObject(this.Events, id, event)\n\t}\n\tif IsEqual(this.Events, nil) {\n\t\tthis.Events = map[string]any{}\n\t}\n\tif !(reload == true) && (!IsEqual(this.Events, nil) && !IsEqual(this.Events, nil)) {\n\t}\n\tvar keys []string = ObjectKeys(this.Events)\n\tfor i := 0; i < len(keys); i++ {\n\t\tvar one any = GetValue(this.Events, keys[i])\n\t\t_ = one\n\t}\n\treturn nil\n}\n';
    const emitted = formatGoSource ('selftest.go', base);
    ok (emitted.includes ('this.Events[*id] = event'), 'guarded pointer-key write goes native');
    ok (!emitted.includes ('AddElementToObject(this.Events'), 'no AddElementToObject left on the field');
    ok (emitted.includes ('if this.Events == nil {'), 'nil compare goes native');
    ok (!emitted.includes ('Events != nil && this.Events != nil'), 'duplicate nil test collapses');
    ok (emitted.includes ('if !(reload == true) && this.Events != nil {'), 'duplicate nil test keeps one arm');
    ok (emitted.includes ('var one any = this.Events[keys[i]]'), 'string-key read goes native');
    ok (emitted.includes ('keys = append(keys, objectKey)'), 'ObjectKeys goes native');
    ok (!emitted.includes ('ObjectKeys(this.Events)'), 'no ObjectKeys left on the field');
    ok (emitted.includes ('if this.Events != nil {'), 'the key range keeps the nil arm');
    // negatives: every unproven shape keeps the plain helper call
    const raw = (body) => g09w3Pass (g09w3Body (body));
    ok (raw ('\tvar event any = GetValue(events, 0)\n\tAddElementToObject(this.Events, key, event)\n').includes ('AddElementToObject(this.Events, key, event)'), 'unproven key keeps AddElementToObject');
    ok (raw ('\tvar event any = GetValue(events, 0)\n\tvar id *string = this.SafeString(event, "id")\n\tAddElementToObject(this.Events, id, event)\n').includes ('AddElementToObject(this.Events, id, event)'), 'unguarded pointer key keeps AddElementToObject');
    ok (raw ('\tvar ptr *string = this.SafeString(events, "id")\n\tif ptr != nil {\n\t\tAddElementToObject(this.Events, ptr, ptr)\n\t}\n').includes ('AddElementToObject(this.Events, ptr, ptr)'), 'pointer value keeps AddElementToObject');
    ok (raw ('\tvar event any = GetValue(events, 0)\n\t_ = GetValue(this.Events, event)\n').includes ('GetValue(this.Events, event)'), 'any key keeps GetValue');
    ok (raw ('\tvar event any = GetValue(events, 0)\n\t_ = GetValue(this.Outcomes2, "a")\n').includes ('GetValue(this.Outcomes2, "a")'), 'other field keeps GetValue');
    ok (raw ('\tvar event any = GetValue(events, 0)\n\t_ = IsEqual(this.Events, event)\n').includes ('IsEqual(this.Events, event)'), 'value compare keeps IsEqual');
    ok (g09w3Pass ('func (this *X) f() {\n\tif IsEqual(this.Events, nil) {\n\t}\n}\n').includes ('IsEqual(this.Events, nil)'), 'non-prediction file untouched');
    ok (raw ('\tvar one any = GetValue(this.Events, "a")\n\t_ = one\n').includes ('var one any = this.Events["a"]'), 'literal key read goes native');
    ok (raw ('\t_ = PredictionOutcomeMapFromMap(MapTyped(this.Outcomes))\n').includes ('PredictionOutcomeMapFromMap(this.Outcomes)'), 'MapTyped on the field is the identity');
    ok (raw ('\t_ = ccxt.MapTyped(this.Events)\n').includes ('_ = this.Events'), 'ccxt.MapTyped drops too');
    ok (raw ('\t_ = MapTyped(this.Outcomes2)\n').includes ('MapTyped(this.Outcomes2)'), 'other field keeps MapTyped');
    ok (raw ('\t_ = SafeMapTyped(this.Outcomes, "a")\n').includes ('SafeMapTyped(this.Outcomes, "a")'), 'keyed SafeMapTyped kept');
    return problems;
}
