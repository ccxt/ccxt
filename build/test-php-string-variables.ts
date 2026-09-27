// Regression for the php variable-prefix rules touching string literals in build/transpile.ts.
// Run: npx tsx build/test-php-string-variables.ts
import { Transpiler } from './transpile.js'

const t = new Transpiler ()
;(t as any).buildPython = false
;(t as any).buildPHP = true

function phpOf (js: string, variables: string[] = []): string {
    const r = (t as any).transpileJavaScriptToPythonAndPHP ({ 'js': js, 'className': 'X', 'baseClass': 'Y', 'variables': variables })
    return r.phpBody
}

function assert (cond: boolean, msg: string, got = '') {
    if (!cond) {
        console.error ('FAIL:', msg, '\n', got)
        process.exit (1)
    }
    console.log ('ok:', msg)
}

// 1) a query key named like a local variable stays literal, the variable itself is prefixed
{
    const php = phpOf ([
        '        const signature = this.hmac (payload, secret);',
        "        queryString += '&signature=' + signature;",
    ].join ('\n'), [ 'queryString', 'payload', 'secret' ])
    assert (php.includes ("$queryString .= '&signature=' . $signature;"), 'coinsph/toobit signature key', php)
}

// 2) url query built from a method argument
{
    const php = phpOf ("        const url = this.urls['api']['ws']['spot'] + '?listenKey=' + listenKey;", [ 'listenKey' ])
    assert (php.includes ("$url = $this->urls['api']['ws']['spot'] . '?listenKey=' . $listenKey;"), 'mexc listenKey url', php)
}

// 3) message hashes with several variable-named segments
{
    const php = phpOf ([
        "        const depth = this.safeString (message, 'dp');",
        "        const orderbook = this.orderbooks[symbol];",
        "        const messageHash = 'uta:orderbook:' + symbol + ':depth:' + depth;",
    ].join ('\n'), [ 'symbol' ])
    assert (php.includes ("$messageHash = 'uta:orderbook:' . $symbol . ':depth:' . $depth;"), 'kucoin uta orderbook hash', php)
}

// 4) dict keys and double-quoted literals are data too
{
    const php = phpOf ([
        "        const margin = this.safeString (market, 'super-margin-leverage-ratio', '1');",
        '        const x = { "margin": margin, "a margin.b": 1 };',
    ].join ('\n'), [ 'market' ])
    assert (php.includes ("$this->safe_string($market, 'super-margin-leverage-ratio', '1')"), 'bittrade dict key', php)
    assert (php.includes ('"margin" => $margin'), 'double-quoted key', php)
    assert (php.includes ('"a margin.b"'), 'no -> rewrite inside a literal', php)
}

// 5) escaped quotes and empty literals do not desync the scanner
{
    const php = phpOf ("        const s = 'it\\'s ' + s + '' + 'end s';", [])
    assert (php.includes ("$s = 'it\\'s ' . $s . '' . 'end s';"), 'escaped quote + empty literal', php)
}

// 6) comments and docstrings keep their existing rendering
{
    const php = phpOf ([
        '        /**',
        '         * @param {string} symbol unified symbol',
        '         */',
        "        const a = symbol; // symbol stays in comment",
    ].join ('\n'), [ 'symbol' ])
    assert (php.includes ('@param {string} $symbol '), 'docstring params still prefixed', php)
    assert (php.includes ('$a = $symbol; // symbol stays in comment'), 'line comment untouched', php)
}
