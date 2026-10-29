// hx10 wave-7 OG05 (Go): BaseCurrencies / QuoteCurrencies / Transactions are plain maps
// owned by the exchange's aux-table goroutine (go/v4/exchange.go). Every generated write
// becomes a publisher call and every read an accessor call, so no site holds a sync.Map.
//   this.F = this.MapToSafeMap(x)        -> this.PublishF(x)
//   this.F = this.CreateSafeDictionary() -> this.PublishF(map[string]any{})
//   <recv>.F (read)                      -> <recv>.FTable()
import { goChanMask } from './go-chan.js';

type Og05Table = { publish: string, read: string };

const OG05_TABLES: Record<string, Og05Table> = {
    'BaseCurrencies': { publish: 'PublishBaseCurrencies', read: 'BaseCurrenciesTable' },
    'QuoteCurrencies': { publish: 'PublishQuoteCurrencies', read: 'QuoteCurrenciesTable' },
    'Transactions': { publish: 'PublishTransactions', read: 'TransactionsTable' },
};

const OG05_REGEX_PART = Object.keys (OG05_TABLES).join ('|');

function og05Table (name: string): Og05Table | undefined {
    return Object.prototype.hasOwnProperty.call (OG05_TABLES, name) ? OG05_TABLES[name] : undefined;
}

// a `//` starts a comment only where the mask blanked it out
function og05CommentAt (line: string, masked: string): number {
    for (let i = 0; i < line.length - 1; i++) {
        if ((line[i] === '/') && (line[i + 1] === '/') && (masked[i] === ' ')) {
            return i;
        }
    }
    return -1;
}

function og05Balanced (text: string): boolean {
    let depth = 0;
    for (const c of goChanMask (text)) {
        if ((c === '(') || (c === '[') || (c === '{')) {
            depth++;
        } else if ((c === ')') || (c === ']') || (c === '}')) {
            depth--;
            if (depth < 0) {
                return false;
            }
        }
    }
    return depth === 0;
}

// every remaining use is a read of the published table; matches come from the mask
function og05Read (line: string, masked: string): string {
    const rx = new RegExp ('\\b([A-Za-z_]\\w*)\\.(' + OG05_REGEX_PART + ')\\b(?!\\s*\\()', 'g');
    const hits: Array<[ number, number, string ]> = [];
    let m: RegExpExecArray | null;
    while ((m = rx.exec (masked)) !== null) {
        hits.push ([ m.index, m[0].length, m[1] + '.' + OG05_TABLES[m[2]].read + '()' ]);
    }
    let out = line;
    for (let i = hits.length - 1; i >= 0; i--) {
        const [ at, width, text ] = hits[i];
        out = out.substring (0, at) + text + out.substring (at + width);
    }
    return out;
}

function og05Assign (line: string, masked: string): string | undefined {
    const at = og05CommentAt (line, masked);
    const code = (at < 0) ? line : line.substring (0, at);
    const tail = (at < 0) ? '' : ' ' + line.substring (at).trim ();
    const m = new RegExp ('^([ \\t]*)([A-Za-z_]\\w*)\\.(' + OG05_REGEX_PART + ')[ \\t]*=[ \\t]*(.*)$').exec (code);
    if (m === null) {
        return undefined;
    }
    const table = og05Table (m[3]);
    if (table === undefined) {
        return undefined;
    }
    let value = m[4].trim ();
    if (/^(?:this\.)?CreateSafeDictionary\s*\(\s*(?:true|false)?\s*\)$/.test (value)) {
        value = 'map[string]any{}';
    }
    const wrapped = /^this\.MapToSafeMap\s*\((.*)\)$/.exec (value);
    if (wrapped !== null) {
        value = wrapped[1].trim ();
    }
    if (og05Balanced (value) === false) {
        return undefined; // a value spanning lines stays a helper-shaped site the gate will flag
    }
    return m[1] + m[2] + '.' + table.publish + '(' + og05Read (value, goChanMask (value)) + ')' + tail;
}

function og05AssignStart (line: string, masked: string): boolean {
    const at = og05CommentAt (line, masked);
    const code = (at < 0) ? line : line.substring (0, at);
    return new RegExp ('^[ \\t]*[A-Za-z_]\\w*\\.(?:' + OG05_REGEX_PART + ')[ \\t]*=').test (code);
}

export function hx10OG05Pass (content: string): string {
    if ((new RegExp ('\\b(?:' + OG05_REGEX_PART + ')\\b')).test (content) === false) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const mask = (i < masked.length) ? masked[i] : '';
        const assigned = og05Assign (line, mask);
        if (assigned !== undefined) {
            out.push (assigned);
        } else if (og05AssignStart (line, mask)) {
            out.push (line); // a write we cannot rewrite stays a helper-shaped site the gate will flag
        } else {
            out.push (og05Read (line, mask));
        }
    }
    return out.join ('\n');
}

export function og05Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx10w7 OG05: ' + msg); } };
    const cases: Array<[ string, string, string ]> = [
        [ '\tthis.BaseCurrencies = this.MapToSafeMap(this.IndexBy(x, "code"))\n', '\tthis.PublishBaseCurrencies(this.IndexBy(x, "code"))\n', 'a wrapped table is published unwrapped' ],
        [ '\tthis.QuoteCurrencies = this.MapToSafeMap(this.IndexBy(x, "code"))\n', '\tthis.PublishQuoteCurrencies(this.IndexBy(x, "code"))\n', 'the quote table is published the same way' ],
        [ '\tthis.Transactions = this.CreateSafeDictionary()\n', '\tthis.PublishTransactions(map[string]any{})\n', 'a reset publishes an empty table' ],
        [ '\tthis.BaseCurrencies = nil\n', '\tthis.PublishBaseCurrencies(nil)\n', 'a nil assignment publishes nil' ],
        [ '\tthis.QuoteCurrencies = sourceExchange.QuoteCurrencies\n', '\tthis.PublishQuoteCurrencies(sourceExchange.QuoteCurrenciesTable())\n', 'a shared table reads through the accessor' ],
        [ '\tvar x = sourceExchange.BaseCurrencies\n', '\tvar x = sourceExchange.BaseCurrenciesTable()\n', 'a read uses the accessor' ],
        [ '\t// this.BaseCurrencies = nil\n', '\t// this.BaseCurrencies = nil\n', 'a comment is untouched' ],
        [ '\tvar s = "this.Transactions"\n', '\tvar s = "this.Transactions"\n', 'a literal is untouched' ],
        [ '\tthis.PublishBaseCurrencies(x)\n', '\tthis.PublishBaseCurrencies(x)\n', 'an already published site is left alone' ],
        [ '\tthis.Transactions = this.MapToSafeMap(await x\n', '\tthis.Transactions = this.MapToSafeMap(await x\n', 'an unbalanced write is left as written' ],
        [ '\tvar y = this.BaseCurrenciesTable()\n', '\tvar y = this.BaseCurrenciesTable()\n', 'an accessor call is left alone' ],
    ];
    for (const [ input, want, label ] of cases) {
        const got = hx10OG05Pass (input);
        ok (got === want, label + ': ' + JSON.stringify (got));
    }
    const kept = hx10OG05Pass ('\tthis.BaseCurrencies = this.MapToSafeMap(this.IndexBy(x, "code")) // keep\n');
    ok (kept.endsWith ('// keep\n'), 'a trailing comment survives: ' + JSON.stringify (kept));
    return problems;
}
