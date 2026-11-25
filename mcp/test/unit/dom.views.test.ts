import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOM_SKIP, firstColumn, openViewWith, press, rowsOf, visibleText } from '../helpers/dom.js';
import type { Host } from '../helpers/dom.js';
// @ts-ignore — plain .mjs shared with the preview script, no type declarations
import { bookPayload, chartPayload, tickersPayload } from '../../scripts/preview-payloads.mjs';

// Every view EXECUTED with the preview's canned payloads (and with hostile ones), through the
// same fake host as the bridge tests. No layout here: what is asserted is the text and the
// structure the view builds, never where anything ends up on screen.

const HOSTILE = '<img src=x onerror="window.pwned=1"><script>window.pwned=1</script>"\'&lt;';

// nothing a user can read (text, tooltips, accessible names) may be a leaked non-value
function assertClean (host: Host, label: string): void {
    const document = host.document;
    const seen = [ visibleText (document.body) ];
    for (const node of document.querySelectorAll ('[title], [aria-label]')) {
        seen.push (node.getAttribute ('title') ?? '', node.getAttribute ('aria-label') ?? '');
    }
    for (const text of seen) {
        const leak = /NaN|undefined|Infinity|\[object |\bnull\b/.exec (text);
        assert.ok (leak === null, label + ': "' + leak?.[0] + '" in ' + JSON.stringify (text.slice (Math.max (0, (leak?.index ?? 0) - 60), (leak?.index ?? 0) + 60)));
    }
    assert.deepEqual (host.errors, [], label + ': script errors');
}

// payload strings must end up as text: no element they describe exists and no code they carry ran
function assertInert (host: Host, label: string): void {
    assert.equal (host.window.pwned, undefined, label + ': injected code ran');
    assert.ok (host.document.querySelector ('img') === null, label + ': an <img> from the payload was built');
    assert.equal (host.document.querySelectorAll ('script').length, 2, label + ': a <script> from the payload was built');
    assert.ok (host.document.querySelector ('[onerror]') === null);
}

async function sortEveryColumn (host: Host, label: string): Promise<void> {
    const count = host.document.querySelectorAll ('thead button').length;
    assert.ok (count > 0, label + ': no sortable columns');
    for (let column = 0; column < count; column++) {
        const original = firstColumn (host.document);
        const orders: string[][] = [];
        for (let click = 0; click < 3; click++) {
            host.document.querySelectorAll ('thead button')[column].click ();
            orders.push (firstColumn (host.document));
            assertClean (host, label + ' sorted by column ' + column);
        }
        const sorted = (rows: string[]) => rows.slice ().sort ();
        assert.deepEqual (sorted (orders[0]), sorted (original), label + ': sorting lost or duplicated a row');
        assert.deepEqual (orders[2], original, label + ': the third press restores the original order');
        assert.equal (rowsOf (host.document).filter ((row: any) => row.tabIndex === 0).length, 1, label + ': exactly one tab stop');
    }
}

const TABLE_VIEWS: [ string, string, Record<string, any>, Record<string, any>, number ][] = [
    [ 'tickers', 'tickers', { 'exchange': 'binance', 'symbols': tickersPayload ().symbols }, tickersPayload (), 7 ],
];

for (const [ view, label, args, payload, expectedRows ] of TABLE_VIEWS) {
    test ('view ' + label + ': renders the canned payload, sorts by every column, shows a readout for every row', { 'skip': DOM_SKIP }, async () => {
        const host = await openViewWith (view, args, payload);
        try {
            const document = host.document;
            assert.equal (document.getElementById ('status').textContent, '');
            assert.equal (rowsOf (document).length, expectedRows);
            assert.equal (document.getElementById ('refresh').hidden, false);
            assert.match (document.querySelector ('caption').textContent, /Column headers sort the table; arrow keys move between rows\.$/);
            assertClean (host, label);
            await sortEveryColumn (host, label);
            // the readout of each row: focus it, read it
            const readout = document.getElementById ('readout');
            assert.equal (readout.hidden, false);
            const hint = readout.textContent;
            assert.match (hint, /^Point at, tap or focus a row/);
            for (const row of rowsOf (document)) {
                row.focus ();
                assert.ok (row.classList.contains ('active'));
                assert.notEqual (readout.textContent, hint, label + ': the readout did not change for row ' + row.getAttribute ('data-key'));
                assert.ok (readout.textContent.startsWith (row.cells[0].textContent.trim ()), label + ': the readout names its row');
                assertClean (host, label + ' readout of ' + row.getAttribute ('data-key'));
            }
            press (host.window, document.activeElement, 'Home');
            assert.ok (document.activeElement === rowsOf (document)[0]);
            document.activeElement.blur ();
            assert.equal (readout.textContent, hint, 'with no row active the hint is back');
        } finally {
            await host.close ();
        }
    });
}

test ('view tickers: a single market is a hero figure with stats, not a table', { 'skip': DOM_SKIP }, async () => {
    const payload = tickersPayload ();
    payload.tickers = payload.tickers.slice (0, 1);
    payload.symbols = payload.symbols.slice (0, 1);
    const host = await openViewWith ('tickers', { 'exchange': 'binance', 'symbols': payload.symbols }, payload);
    try {
        const document = host.document;
        assert.ok (document.querySelector ('table') === null);
        assert.equal (document.getElementById ('heading').textContent, 'BTC/USDT');
        assert.equal (document.getElementById ('hero').hidden, false);
        assert.equal (document.getElementById ('last').textContent, '94,250.12');
        assert.equal (document.getElementById ('change').textContent, '▲ +2.31%');
        assert.equal (document.getElementById ('readout').hidden, true);
        assert.equal (document.querySelectorAll ('.stats dt').length, 6);
        assertClean (host, 'tickers single');
    } finally {
        await host.close ();
    }
});

test ('view tickers: a sub-1 last price with more decimals than shown is rounded, never to "0"', { 'skip': DOM_SKIP }, async () => {
    const payload = tickersPayload ();
    const doge = payload.tickers.find ((ticker: any) => ticker.symbol === 'DOGE/USDT');
    Object.assign (doge, { 'last': 0.31897037, 'bid': 0.31895443, 'ask': 0.31898632, 'high': 0.32244005, 'low': 0.31578067 });
    const xrp = payload.tickers.find ((ticker: any) => ticker.symbol === 'XRP/USDT');
    Object.assign (xrp, { 'last': 2.1922106, 'bid': 2.192101, 'ask': 2.1923202, 'high': 2.2260104, 'low': 2.1702885 });
    const host = await openViewWith ('tickers', { 'exchange': 'binance', 'symbols': payload.symbols }, payload);
    try {
        const lastOf = (symbol: string) => (rowsOf (host.document).find ((row: any) => row.cells[0].textContent.trim () === symbol) as any).cells[1].textContent;
        assert.equal (lastOf ('DOGE/USDT'), '0.31897');
        assert.equal (lastOf ('XRP/USDT'), '2.192211');
        // a last price that fits keeps its own decimals; noisy bid/ask do not widen it
        assert.equal (lastOf ('BTC/USDT'), '94,250.12');
    } finally {
        await host.close ();
    }
});

test ('view tickers: requested symbols without a ticker are named in the status line', { 'skip': DOM_SKIP }, async () => {
    const payload = tickersPayload ();
    payload.symbols = [ ...payload.symbols, 'GONE/USDT' ];
    const host = await openViewWith ('tickers', { 'exchange': 'binance', 'symbols': payload.symbols }, payload);
    try {
        assert.equal (host.document.getElementById ('status').textContent, 'No data for GONE/USDT.');
        assert.equal (host.document.getElementById ('status').className, 'status');
    } finally {
        await host.close ();
    }
});

test ('views: a Refresh keeps the sort order and the keyboard focus on the same row', { 'skip': DOM_SKIP }, async () => {
    const args = { 'exchange': 'binance', 'symbols': tickersPayload ().symbols };
    const host = await openViewWith ('tickers', args, tickersPayload ());
    try {
        const document = host.document;
        document.querySelectorAll ('thead button')[1].click ();
        const order = firstColumn (document);
        const row = rowsOf (document)[2];
        row.focus ();
        const key = row.getAttribute ('data-key');
        const readout = document.getElementById ('readout').textContent;
        document.getElementById ('refresh').click ();
        await host.settle ();
        await host.respond (host.requests ('tools/call')[0], { 'content': [], 'structuredContent': tickersPayload () });
        assert.deepEqual (firstColumn (document), order);
        assert.ok (document.activeElement !== row, 'the table was rebuilt');
        assert.equal (document.activeElement.getAttribute ('data-key'), key);
        assert.equal (document.activeElement.tabIndex, 0);
        assert.equal (document.getElementById ('readout').textContent, readout, 'and its readout is showing again');
        assertClean (host, 'tickers after refresh');
    } finally {
        await host.close ();
    }
});

// The view-initiated calls go to the host as ordinary tools/call requests: the original
// arguments plus what the user changed, nothing that ties them to a server session.
test ('view chart: Refresh and a timeframe switch call show_chart through the host', { 'skip': DOM_SKIP }, async () => {
    const args = { 'exchange': 'binance', 'symbol': 'BTC/USDT', 'timeframe': '1h', 'limit': 200 };
    const host = await openViewWith ('chart', args, chartPayload ());
    try {
        const document = host.document;
        assert.equal (document.getElementById ('status').textContent, '');
        assert.equal (document.getElementById ('refresh').hidden, false);
        document.getElementById ('refresh').click ();
        await host.settle ();
        let calls = host.requests ('tools/call');
        assert.equal (calls.length, 1);
        assert.deepEqual (calls[0].params, { 'name': 'show_chart', 'arguments': args });
        await host.respond (calls[0], { 'content': [], 'structuredContent': chartPayload ('1h', 200) });
        assert.equal (document.getElementById ('status').textContent, '');
        const daily = Array.from (document.querySelectorAll ('#timeframes button')).find ((button: any) => button.textContent === '1d') as any;
        assert.ok (daily !== undefined, 'the timeframe switch offers 1d');
        daily.click ();
        await host.settle ();
        calls = host.requests ('tools/call');
        assert.equal (calls.length, 2);
        assert.deepEqual (calls[1].params, { 'name': 'show_chart', 'arguments': { ...args, 'timeframe': '1d' } });
        await host.respond (calls[1], { 'content': [], 'structuredContent': chartPayload ('1d', 200) });
        assert.equal (document.getElementById ('status').textContent, '');
        const pressed = Array.from (document.querySelectorAll ('#timeframes button')).find ((button: any) => button.getAttribute ('aria-pressed') === 'true') as any;
        assert.equal (pressed.textContent, '1d');
        // a summary-only answer (the server decided no view would render it) keeps the chart
        // on screen and says why, instead of drawing nothing
        document.getElementById ('refresh').click ();
        await host.settle ();
        const summaryOnly = chartPayload ('1d', 200);
        delete summaryOnly.candles;
        delete summaryOnly.timeframes;
        summaryOnly.ui = 'unsupported';
        await host.respond (host.requests ('tools/call')[2], { 'content': [], 'structuredContent': summaryOnly });
        assert.equal (document.getElementById ('status').textContent, 'Could not load: the server sent a summary without the data for this view (ui: unsupported)');
        assert.equal (document.getElementById ('refresh').disabled, false);
        assertClean (host, 'chart after reloads');
    } finally {
        await host.close ();
    }
});

test ('view orderbook: Refresh calls show_orderbook through the host with the original arguments', { 'skip': DOM_SKIP }, async () => {
    const args = { 'exchange': 'binance', 'symbol': 'BTC/USDT', 'limit': 50 };
    const host = await openViewWith ('orderbook', args, bookPayload ());
    try {
        const document = host.document;
        document.getElementById ('refresh').click ();
        await host.settle ();
        const calls = host.requests ('tools/call');
        assert.equal (calls.length, 1);
        assert.deepEqual (calls[0].params, { 'name': 'show_orderbook', 'arguments': args });
        const next = bookPayload (10);
        await host.respond (calls[0], { 'content': [], 'structuredContent': next });
        assert.doesNotMatch (document.getElementById ('status').textContent, /Could not load/);
        assertClean (host, 'orderbook after refresh');
    } finally {
        await host.close ();
    }
});

// "attached" is the hosted server's answer when it could not tell whether the host renders
// views: the dataset is there, so the view draws it exactly like a "displayed" one
test ('views: an "attached" payload is drawn like a "displayed" one; a summary-only first result says why', { 'skip': DOM_SKIP }, async () => {
    for (const [ view, payload ] of [ [ 'chart', chartPayload () ], [ 'orderbook', bookPayload () ], [ 'tickers', tickersPayload () ] ] as [ string, any ][]) {
        const attached = await openViewWith (view, {}, { ...payload, 'ui': 'attached' });
        try {
            assert.doesNotMatch (attached.document.getElementById ('status').textContent, /Could not load/, view);
            assertClean (attached, view + ' attached');
        } finally {
            await attached.close ();
        }
        for (const status of [ 'unsupported', 'unknown', 'off' ]) {
            const host = await openViewWith (view, {}, { 'view': view, 'ui': status, 'exchange': 'binance', 'exchangeName': 'Binance', 'summary': {} });
            try {
                assert.equal (host.document.getElementById ('status').textContent, 'Could not load: the server sent a summary without the data for this view (ui: ' + status + ')', view + ' ' + status);
                assert.deepEqual (host.errors, []);
            } finally {
                await host.close ();
            }
        }
    }
});

// one hostile string in every string field of a payload, whatever the field is (but the
// fields a view or the bridge dispatches on: poisoned, the payload would rightly be refused)
function poison (value: any): any {
    if (typeof value === 'string') {
        return HOSTILE;
    }
    if (Array.isArray (value)) {
        return value.map (poison);
    }
    if (value !== null && typeof value === 'object') {
        const out: Record<string, any> = {};
        for (const [ key, item ] of Object.entries (value)) {
            out[key] = (key === 'view' || key === 'ui' || key === 'timeframe') ? item : poison (item);
        }
        return out;
    }
    return value;
}

// every number replaced by something that is not a usable number
function corrupt (value: any, replacement: any): any {
    if (typeof value === 'number') {
        return replacement;
    }
    if (Array.isArray (value)) {
        return value.map ((item) => corrupt (item, replacement));
    }
    if (value !== null && typeof value === 'object') {
        const out: Record<string, any> = {};
        for (const [ key, item ] of Object.entries (value)) {
            out[key] = corrupt (item, replacement);
        }
        return out;
    }
    return value;
}

const ALL_VIEWS: [ string, Record<string, any> ][] = [
    [ 'tickers', tickersPayload () ],
    [ 'chart', chartPayload () ],
    [ 'orderbook', bookPayload () ],
];

for (const [ view, payload ] of ALL_VIEWS) {
    test ('view ' + view + ': hostile strings in the payload are rendered as text', { 'skip': DOM_SKIP }, async () => {
        const hostile = poison (payload);
        const host = await openViewWith (view, { 'exchange': HOSTILE, 'symbol': HOSTILE }, hostile);
        try {
            assertInert (host, view);
            assert.deepEqual (host.errors, []);
            assert.ok (host.document.body.textContent.includes (HOSTILE), view + ': the hostile string should be visible, as text');
            // sorting and focusing run the same strings through the cells and the readout again
            for (const button of host.document.querySelectorAll ('thead button')) {
                button.click ();
            }
            for (const row of rowsOf (host.document)) {
                row.focus ();
            }
            assertInert (host, view + ' after sorting and focusing');
            assert.deepEqual (host.errors, []);
        } finally {
            await host.close ();
        }
    });

    test ('view ' + view + ': numbers that are not numbers never print as NaN, undefined or Infinity', { 'skip': DOM_SKIP }, async () => {
        // NaN and Infinity cannot arrive as JSON, but null and strings can — and a host may
        // hand the view an object it built itself
        for (const replacement of [ null, NaN, -Infinity, 'x', {}, 1e308, -0 ]) {
            const label = view + ' with every number = ' + String (replacement);
            const host = await openViewWith (view, {}, corrupt (payload, replacement));
            try {
                assertClean (host, label);
                for (const button of host.document.querySelectorAll ('thead button')) {
                    button.click ();
                }
                for (const row of rowsOf (host.document)) {
                    row.focus ();
                }
                assertClean (host, label + ' (sorted, focused)');
            } finally {
                await host.close ();
            }
        }
    });

    test ('view ' + view + ': a payload of the wrong shape is refused with a message, not an exception', { 'skip': DOM_SKIP }, async () => {
        for (const bad of [ {}, { 'view': view }, { 'view': 'nope' }, { 'view': view, 'tickers': 'x', 'candles': 'x', 'bids': 1, 'asks': 2 } ]) {
            const host = await openViewWith (view, {}, bad);
            try {
                assert.equal (host.document.getElementById ('status').textContent, 'Could not load: the host sent data this view cannot display.');
                assert.equal (host.document.getElementById ('status').className, 'status error');
                assert.deepEqual (host.errors, []);
            } finally {
                await host.close ();
            }
        }
        // List entries that are not objects (for the chart's candles and the book's levels:
        // not arrays) are skipped, not dereferenced.
        const junk: Record<string, any> = { 'view': view, 'tickers': [ null, 1, 'x' ], 'candles': [ null, 1, 'x', {} ], 'bids': [ null, 1, 'x', [] ], 'asks': [ null, 1, 'x', [] ] };
        const host = await openViewWith (view, {}, junk);
        try {
            assertClean (host, view + ' with junk entries');
            assert.equal (rowsOf (host.document).length, 0);
        } finally {
            await host.close ();
        }
    });
}
