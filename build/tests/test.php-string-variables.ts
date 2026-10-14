// Run: npx tsx --test build/tests/test.php-string-variables.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { Transpiler } from '../transpile.js';

const t = new Transpiler () as any;
t.buildPython = false;
t.buildPHP = true;

function phpOf (js: string, variables: string[] = []): string {
    return t.transpileJavaScriptToPythonAndPHP ({ 'js': js, 'className': 'X', 'baseClass': 'Y', 'variables': variables }).phpBody;
}

function assertHas (php: string, expected: string) {
    assert.ok (php.includes (expected), `expected ${expected}\n--- got ---\n${php}`);
}

test ('query key named like a local stays literal, the local is prefixed', () => {
    const php = phpOf ([
        '        const signature = this.hmac (payload, secret);',
        "        queryString += '&signature=' + signature;",
    ].join ('\n'), [ 'queryString', 'payload', 'secret' ]);
    assertHas (php, "$queryString .= '&signature=' . $signature;");
});

test ('url query built from a method argument', () => {
    const php = phpOf ("        const url = this.urls['api']['ws']['spot'] + '?listenKey=' + listenKey;", [ 'listenKey' ]);
    assertHas (php, "$url = $this->urls['api']['ws']['spot'] . '?listenKey=' . $listenKey;");
});

test ('message hash with several variable-named segments', () => {
    const php = phpOf ([
        "        const depth = this.safeString (message, 'dp');",
        "        const orderbook = this.orderbooks[symbol];",
        "        const messageHash = 'uta:orderbook:' + symbol + ':depth:' + depth;",
    ].join ('\n'), [ 'symbol' ]);
    assertHas (php, "$messageHash = 'uta:orderbook:' . $symbol . ':depth:' . $depth;");
});

test ('dict keys and double-quoted literals are data', () => {
    const php = phpOf ([
        "        const margin = this.safeString (market, 'super-margin-leverage-ratio', '1');",
        '        const x = { "margin": margin, "a margin.b": 1 };',
    ].join ('\n'), [ 'market' ]);
    assertHas (php, "$this->safe_string($market, 'super-margin-leverage-ratio', '1')");
    assertHas (php, '"margin" => $margin');
    assertHas (php, '"a margin.b"');
});

test ('escaped quotes and empty literals do not desync the scanner', () => {
    const php = phpOf ("        const s = 'it\\'s ' + s + '' + 'end s';", []);
    assertHas (php, "$s = 'it\\'s ' . $s . '' . 'end s';");
});

test ('comments and docstrings keep their existing rendering', () => {
    const php = phpOf ([
        '        /**',
        '         * @param {string} symbol unified symbol',
        '         */',
        '        const a = symbol; // symbol stays in comment',
    ].join ('\n'), [ 'symbol' ]);
    assertHas (php, '@param {string} $symbol ');
    assertHas (php, '$a = $symbol; // symbol stays in comment');
});
