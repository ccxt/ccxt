// Regression for PEP8 E225 string/comment awareness in build/transpile.ts.
// Run: npx tsx build/test-e225-string-parens.ts
import { Transpiler } from './transpile.js'

const t = new Transpiler ()

const e225: any[] = [
    [ /([^:+=\/\*\s-'"]+) \(/g, (matched: string, id: string, offset: number, whole: string) => t.isInsideQuotedString (whole, offset) ? matched : (id + '(') ],
]

function assert (cond: boolean, msg: string) {
    if (!cond) {
        console.error ('FAIL:', msg)
        process.exit (1)
    }
    console.log ('ok:', msg)
}

// 1) Apostrophe in // comment must not desync → call still collapses
{
    const body = [
        "// doesn't matter what the caller's id is",
        'this.foo (bar)',
        'Precise.stringAdd (a, b)',
    ].join ('\n')
    const out = t.regexAll (body, e225)
    assert (out.includes ('this.foo(bar)'), "call after // doesn't collapses")
    assert (!out.includes ('this.foo (bar)'), "no leftover space on this.foo")
    assert (out.includes ('Precise.stringAdd(a, b)'), 'Precise call collapses')
    assert (!t.isInsideQuotedString (body, body.indexOf ('this.foo')), 'call site not inside string')
}

// 2) Prose parenthetical inside thrown-message string must keep the space
{
    const body = [
        "throw new ArgumentsRequired (this.id + ' parameter (symbol) is required');",
    ].join ('\n')
    const out = t.regexAll (body, e225)
    assert (out.includes ("parameter (symbol)"), 'prose parenthetical keeps space')
    assert (out.includes ('ArgumentsRequired(') || out.includes ('ArgumentsRequired ('), 'constructor handled')
    const proseOffset = out.indexOf ('parameter (symbol)')
    // re-check on original body: offset of "parameter (" inside the string
    const origOffset = body.indexOf ('parameter (')
    assert (t.isInsideQuotedString (body, origOffset), 'prose "(" is inside quoted string')
}

// 3) alpaca-style comment (the CI-red case)
{
    const body = [
        "// TRANS entries may carry symbol/asset - never blindly adopt the caller's",
        'this.safeString (transaction, "id")',
        'this.parseNumber (fee)',
    ].join ('\n')
    const out = t.regexAll (body, e225)
    assert (out.includes ('this.safeString(transaction, "id")'), 'safeString collapses after caller\'s comment')
    assert (out.includes ('this.parseNumber(fee)'), 'parseNumber collapses after caller\'s comment')
}

// 4) block comment with apostrophe
{
    const body = [
        "/* won't desync either */",
        'this.bar (x)',
    ].join ('\n')
    const out = t.regexAll (body, e225)
    assert (out.includes ('this.bar(x)'), 'call after /* */ apostrophe collapses')
}


// 5) After //→# rewrite (E225 runs post-conversion) — the real alpaca shape
{
    const body = [
        "# TRANS entries may carry symbol/asset - never blindly adopt the caller's",
        "# currency filter, see the review on https://github.com/ccxt/ccxt/pull/29580",
        "this.parseTransactionStatus (this.safeString (transaction, 'status'))",
    ].join ('\n')
    const out = t.regexAll (body, e225)
    assert (out.includes ('parseTransactionStatus(this.safeString'), 'call after # caller\'s comment collapses')
    assert (!out.includes ('parseTransactionStatus ('), 'no space before ( after # comment')
}

console.log ('All E225 string-paren regressions passed.')
