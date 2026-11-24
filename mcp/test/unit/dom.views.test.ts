import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOM_SKIP, firstColumn, openViewWith, press, rowsOf, visibleText } from '../helpers/dom.js';
import type { Host } from '../helpers/dom.js';
// @ts-ignore — plain .mjs shared with the preview script, no type declarations
import { balancePayload, bookPayload, chartPayload, ordersPayload, positionsPayload, tickersPayload } from '../../scripts/preview-payloads.mjs';

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
    [ 'balance', 'balance live', { 'account': 'main' }, balancePayload ('live'), balancePayload ('live').balances.length ],
    [ 'balance', 'balance sandbox', { 'account': 'testnet', 'nonzeroOnly': false }, balancePayload ('sandbox'), balancePayload ('sandbox').balances.length ],
    [ 'orders', 'orders open', { 'account': 'main' }, ordersPayload ('live', 'open'), ordersPayload ('live', 'open').orders.length ],
    [ 'orders', 'orders all', { 'account': 'testnet', 'status': 'all' }, ordersPayload ('sandbox', 'all'), ordersPayload ('sandbox', 'all').orders.length ],
    [ 'positions', 'positions', { 'account': 'main' }, positionsPayload ('live'), positionsPayload ('live').positions.length ],
    [ 'positions', 'positions mixed', { 'account': 'main' }, positionsPayload ('live', 'mixed'), positionsPayload ('live', 'mixed').positions.length ],
    [ 'positions', 'positions sandbox', { 'account': 'testnet' }, positionsPayload ('sandbox'), positionsPayload ('sandbox').positions.length ],
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
                assert.ok (readout.textContent.startsWith (row.cells[(view === 'orders') ? 1 : 0].textContent.trim ()), label + ': the readout names its row');
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

test ('view balance: heading, environment badge, total and notes', { 'skip': DOM_SKIP }, async () => {
    const host = await openViewWith ('balance', { 'account': 'main' }, balancePayload ('live'));
    try {
        const document = host.document;
        assert.equal (document.getElementById ('venue').textContent, 'Binance');
        assert.equal (document.getElementById ('account').textContent, 'main');
        const env = document.getElementById ('env');
        assert.equal (env.textContent, 'LIVE');
        assert.equal (env.className, 'env live');
        assert.equal (env.title, 'Live account: real funds');
        assert.equal (document.getElementById ('hero').hidden, false);
        assert.match (document.getElementById ('figure').textContent, /^≈ [\d,.]+ USDT$/);
        assert.match (document.getElementById ('context').textContent, /^partial value · \d+ of \d+ assets priced$/);
        assert.equal (document.getElementById ('note').hidden, false);
    } finally {
        await host.close ();
    }
    const practice = await openViewWith ('balance', { 'account': 'testnet' }, balancePayload ('sandbox'));
    try {
        const env = practice.document.getElementById ('env');
        assert.equal (env.textContent, 'TESTNET');
        assert.equal (env.className, 'env', 'a practice account is never styled as live');
    } finally {
        await practice.close ();
    }
});

test ('view orders: an empty list says so, and Refresh re-sends the filter', { 'skip': DOM_SKIP }, async () => {
    const args = { 'account': 'main', 'symbol': 'LTC/USDT' };
    const host = await openViewWith ('orders', args, ordersPayload ('live', 'open', 'LTC/USDT'));
    try {
        const document = host.document;
        assert.ok (document.querySelector ('table') === null);
        assert.equal (document.querySelector ('#board .empty').textContent, 'No open orders for LTC/USDT.');
        assert.equal (document.getElementById ('heading').textContent, 'Open orders · LTC/USDT');
        assert.equal (document.getElementById ('readout').hidden, true);
        assertClean (host, 'orders empty');
        document.getElementById ('refresh').click ();
        await host.settle ();
        const call = host.requests ('tools/call')[0];
        assert.deepEqual (call.params, { 'name': 'show_orders', 'arguments': args });
        await host.respond (call, { 'content': [], 'structuredContent': ordersPayload ('live', 'open') });
        assert.equal (rowsOf (document).length, ordersPayload ('live', 'open').orders.length);
        assertClean (host, 'orders after refresh');
    } finally {
        await host.close ();
    }
});

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
    const host = await openViewWith ('positions', { 'account': 'main' }, positionsPayload ('live', 'mixed'));
    try {
        const document = host.document;
        document.querySelectorAll ('thead button')[0].click ();
        const order = firstColumn (document);
        const row = rowsOf (document)[2];
        row.focus ();
        const key = row.getAttribute ('data-key');
        const readout = document.getElementById ('readout').textContent;
        document.getElementById ('refresh').click ();
        await host.settle ();
        await host.respond (host.requests ('tools/call')[0], { 'content': [], 'structuredContent': positionsPayload ('live', 'mixed') });
        assert.deepEqual (firstColumn (document), order);
        assert.ok (document.activeElement !== row, 'the table was rebuilt');
        assert.equal (document.activeElement.getAttribute ('data-key'), key);
        assert.equal (document.activeElement.tabIndex, 0);
        assert.equal (document.getElementById ('readout').textContent, readout, 'and its readout is showing again');
        assertClean (host, 'positions after refresh');
    } finally {
        await host.close ();
    }
});

// one hostile string in every string field of a payload, whatever the field is
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
            // the two fields a view dispatches on: poisoned, it would (rightly) refuse the payload
            out[key] = (key === 'view' || key === 'environment' || key === 'candlesEnvironment' || key === 'timeframe') ? item : poison (item);
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
    [ 'balance', balancePayload ('live') ],
    [ 'orders', ordersPayload ('live', 'all') ],
    [ 'positions', positionsPayload ('live', 'mixed') ],
    [ 'chart', chartPayload () ],
    [ 'orderbook', bookPayload () ],
];

for (const [ view, payload ] of ALL_VIEWS) {
    test ('view ' + view + ': hostile strings in the payload are rendered as text', { 'skip': DOM_SKIP }, async () => {
        const hostile = poison (payload);
        const host = await openViewWith (view, { 'account': HOSTILE, 'exchange': HOSTILE, 'symbol': HOSTILE }, hostile);
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
        for (const bad of [ {}, { 'view': view }, { 'view': 'nope' }, { 'view': view, 'tickers': 'x', 'balances': 1, 'orders': {}, 'positions': null, 'candles': 'x', 'bids': 1, 'asks': 2 } ]) {
            const host = await openViewWith (view, {}, bad);
            try {
                assert.equal (host.document.getElementById ('status').textContent, 'Could not load: the host sent data this view cannot display.');
                assert.equal (host.document.getElementById ('status').className, 'status error');
                assert.deepEqual (host.errors, []);
            } finally {
                await host.close ();
            }
        }
        // List entries that are not objects are skipped, not dereferenced. (Not the chart's
        // candles: chart.html takes each candle to be an array — the server only ever sends
        // cleaned ones, see "show_chart: candles are cleaned" — so that list stays empty here.)
        const junk: Record<string, any> = { 'view': view, 'tickers': [ null, 1, 'x' ], 'balances': [ null, 1, 'x' ], 'orders': [ null, 1, 'x' ], 'positions': [ null, 1, 'x' ], 'candles': [], 'bids': [ null, 1, 'x', [] ], 'asks': [ null, 1, 'x', [] ] };
        const host = await openViewWith (view, {}, junk);
        try {
            assertClean (host, view + ' with junk entries');
            assert.equal (rowsOf (host.document).length, 0);
        } finally {
            await host.close ();
        }
    });
}
