// Regression for PEP8 E225 string-space protection in build/transpile.ts.
// The protection lives in the transpile pipeline (maskStringSpaceParens runs
// after maskComments, the E225 rule itself is untouched), so these tests
// exercise transpileJavaScriptToPythonAndPHP end to end.
// Run: npx tsx build/test-e225-string-parens.ts
import { Transpiler } from './transpile.js'

const t = new Transpiler ()
;(t as any).buildPython = true
;(t as any).buildPHP = true

function pyOf (js: string): string {
    const r = (t as any).transpileJavaScriptToPythonAndPHP ({ 'js': js, 'className': 'X', 'baseClass': 'Y', 'variables': [] })
    return r.python3Body
}

function phpOf (js: string): string {
    const r = (t as any).transpileJavaScriptToPythonAndPHP ({ 'js': js, 'className': 'X', 'baseClass': 'Y', 'variables': [] })
    return r.phpBody
}

function assert (cond: boolean, msg: string) {
    if (!cond) {
        console.error ('FAIL:', msg)
        process.exit (1)
    }
    console.log ('ok:', msg)
}

// 1) Apostrophe in a // comment must not desync - the call still collapses
{
    const py = pyOf ([
        "        // doesn't matter what the caller's id is",
        '        this.foo (bar);',
    ].join ('\n'))
    assert (py.includes ('self.foo(bar)'), "call after doesn't-comment collapses")
    assert (!py.includes ('self.foo (bar)'), 'no leftover space on the call')
}

// 2) Prose parenthetical inside a thrown-message string keeps the space
{
    const py = pyOf ("        throw new ArgumentsRequired (this.id + ' parameter (symbol) is required');")
    assert (py.includes ("parameter (symbol)"), 'prose parenthetical keeps the space')
    assert (py.includes ('ArgumentsRequired('), 'the constructor call still collapses')
}

// 3) Mixed line: call collapses, string content survives
{
    const py = pyOf ("        this.log (' fetch (spot) markets ');")
    assert (py.includes ("' fetch (spot) markets '"), 'in-string prose intact on a mixed line')
}

// 4) House method-mention inside a string keeps its source form
{
    const py = pyOf ("        throw new NotSupported (this.id + ' fetchMarginModes () is not supported yet');")
    assert (py.includes ('fetchMarginModes ()'), 'in-string method mention keeps the source space')
}

// 5) PHP: ->-shaped prose inside a string is data, not a call (limitless class)
{
    const php = phpOf ("        throw new ArgumentsRequired (this.id + ' pass params.conditionId (a bytes32 hex string)');")
    assert (php.includes ('conditionId (a bytes32'), 'php prose parenthetical keeps the space')
}

// 6) Snake-cased mention inside a python string keeps its space (binance class)
{
    const py = pyOf ("        throw new InvalidOrder (this.id + ' use this.priceToPrecision (symbol, amount) ' + body);")
    // the mask also shields the mention from the common snake-casing rule,
    // so the message keeps its source casing - the substance is the space
    assert (py.includes ('priceToPrecision (symbol, amount)'), 'in-string call-shaped prose keeps the space')
}

// 7) Escaped quote inside a string does not desync the line scanner
{
    const py = pyOf ("        throw new ExchangeError (this.id + ' can\\'t resolve (key) here');")
    assert (py.includes ("resolve (key)"), 'escaped quote handled, prose space kept')
}

// 8) Real calls on later lines still collapse after any of the above
{
    const py = pyOf ([
        "        const a = this.safeString (x, 'label (raw)');",
        '        this.bar (baz);',
    ].join ('\n'))
    assert (py.includes ("'label (raw)'"), 'string arg intact')
    assert (py.includes ('self.bar(baz)'), 'subsequent call collapses')
}

console.log ('All E225 string-paren regressions passed.')
