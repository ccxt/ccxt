import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOM_SKIP, firstColumn, openView, openViewWith, plain, rowsOf, viewHtml } from '../helpers/dom.js';
// @ts-ignore — plain .mjs shared with the preview script, no type declarations
import { tickersPayload } from '../../scripts/preview-payloads.mjs';

// bridge.js EXECUTED against a fake host: the price board is the view it runs in, because it is
// the smallest one that both renders a result and calls a tool (Refresh).
const ARGS = { 'exchange': 'binance', 'symbols': tickersPayload ().symbols };

test ('bridge: ui/initialize handshake — request, answer, initialized notification, host context applied', { 'skip': DOM_SKIP }, async () => {
    const host = await openView (viewHtml ('tickers'));
    try {
        assert.equal (host.sent.length, 1, 'nothing but the handshake is sent before the host answers');
        const request = host.sent[0];
        assert.equal (request.jsonrpc, '2.0');
        assert.equal (request.method, 'ui/initialize');
        assert.equal (typeof request.id, 'number');
        assert.deepEqual (request.params, { 'appInfo': { 'name': 'ccxt-tickers', 'version': '1.0.0' }, 'appCapabilities': {}, 'protocolVersion': '2026-01-26' });
        await host.initialize ({ 'theme': 'dark', 'locale': 'en-US', 'timeZone': 'UTC', 'styles': { 'variables': { '--bg': '#101010', 'color': 'red', '--n': 5 } }, 'safeAreaInsets': { 'top': 7 } });
        assert.deepEqual (host.sent.map ((message) => message.method), [ 'ui/initialize', 'ui/notifications/initialized' ]);
        const root = host.document.documentElement;
        assert.equal (root.getAttribute ('data-theme'), 'dark');
        assert.equal (root.style.getPropertyValue ('--bg'), '#101010', 'a custom property from the host is applied');
        assert.equal (root.style.getPropertyValue ('color'), '', 'anything that is not a custom property is not');
        assert.equal (root.style.getPropertyValue ('--n'), '', 'nor a value that is not a string');
        assert.equal (root.style.getPropertyValue ('--safe-top'), '7px');
        assert.equal (host.window.ccxtApp.canCallTools (), true);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge: a host without serverTools gets no Refresh button', { 'skip': DOM_SKIP }, async () => {
    const host = await openView (viewHtml ('tickers'));
    try {
        await host.initialize ({ 'theme': 'light' }, {});
        await host.deliver (ARGS, tickersPayload ());
        assert.equal (host.window.ccxtApp.canCallTools (), false);
        assert.equal (host.document.getElementById ('refresh').hidden, true);
        assert.equal (rowsOf (host.document).length, 7, 'the data is still shown');
    } finally {
        await host.close ();
    }
});

test ('bridge: a tool result is delivered to the view; an error result and a result without a payload are reported', { 'skip': DOM_SKIP }, async () => {
    const host = await openView (viewHtml ('tickers'));
    try {
        await host.initialize ();
        const status = host.document.getElementById ('status');
        assert.equal (status.textContent, 'Waiting for data…');
        // the server's error envelope, as JSON text
        await host.notify ('ui/notifications/tool-result', { 'isError': true, 'content': [ { 'type': 'text', 'text': JSON.stringify ({ 'ok': false, 'error': { 'code': 'BAD_SYMBOL', 'message': 'no such market <b>X</b>' } }) } ] });
        assert.equal (status.textContent, 'Could not load: no such market <b>X</b>');
        assert.equal (status.className, 'status error');
        assert.ok (status.querySelector ('b') === null, 'an error message is text, never markup');
        // not JSON: the raw text, cut
        await host.notify ('ui/notifications/tool-result', { 'isError': true, 'content': [ { 'type': 'text', 'text': 'x'.repeat (400) } ] });
        assert.equal (status.textContent, 'Could not load: ' + 'x'.repeat (300));
        await host.notify ('ui/notifications/tool-result', { 'content': [ { 'type': 'text', 'text': '{}' } ] });
        assert.equal (status.textContent, 'Could not load: the host returned no data for the view');
        await host.notify ('ui/notifications/tool-cancelled', { 'reason': 'user' });
        assert.equal (status.textContent, 'Could not load: the request was cancelled (user)');
        assert.equal (rowsOf (host.document).length, 0);
        await host.deliver (ARGS, tickersPayload ());
        assert.equal (status.textContent, '');
        assert.equal (status.className, 'status');
        assert.deepEqual (firstColumn (host.document), tickersPayload ().symbols);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge: only the parent window is listened to, and only JSON-RPC 2.0', { 'skip': DOM_SKIP }, async () => {
    const host = await openView (viewHtml ('tickers'));
    try {
        await host.initialize ();
        const result = { 'jsonrpc': '2.0', 'method': 'ui/notifications/tool-result', 'params': { 'content': [], 'structuredContent': tickersPayload () } };
        // another frame, or the view's own window
        host.window.dispatchEvent (new host.window.MessageEvent ('message', { 'data': result, 'source': { 'postMessage': () => {} } }));
        host.window.dispatchEvent (new host.window.MessageEvent ('message', { 'data': result, 'source': host.window }));
        await host.settle ();
        assert.equal (rowsOf (host.document).length, 0, 'a message from anyone but the parent is ignored');
        await host.post ({ ...result, 'jsonrpc': '1.0' });
        await host.post (null);
        await host.post ('ui/notifications/tool-result');
        assert.equal (rowsOf (host.document).length, 0);
        await host.post (result);
        assert.equal (rowsOf (host.document).length, 7);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge: requests from the host — ping and teardown are answered, anything else is "method not found"', { 'skip': DOM_SKIP }, async () => {
    const host = await openView (viewHtml ('tickers'));
    try {
        await host.initialize ();
        host.sent.length = 0;
        await host.post ({ 'jsonrpc': '2.0', 'id': 'p1', 'method': 'ping' });
        await host.post ({ 'jsonrpc': '2.0', 'id': 'p2', 'method': 'ui/resource-teardown', 'params': {} });
        await host.post ({ 'jsonrpc': '2.0', 'id': 'p3', 'method': 'tools/list' });
        assert.deepEqual (host.sent, [
            { 'jsonrpc': '2.0', 'id': 'p1', 'result': {} },
            { 'jsonrpc': '2.0', 'id': 'p2', 'result': {} },
            { 'jsonrpc': '2.0', 'id': 'p3', 'error': { 'code': -32601, 'message': 'method not found: tools/list' } },
        ]);
    } finally {
        await host.close ();
    }
});

test ('bridge: Refresh calls the tool again with the original arguments and renders the answer', { 'skip': DOM_SKIP }, async () => {
    const host = await openViewWith ('tickers', ARGS, tickersPayload ());
    try {
        const document = host.document;
        const refresh = document.getElementById ('refresh');
        assert.equal (refresh.hidden, false);
        refresh.click ();
        await host.settle ();
        const calls = host.requests ('tools/call');
        assert.equal (calls.length, 1);
        assert.deepEqual (calls[0].params, { 'name': 'show_tickers', 'arguments': ARGS });
        assert.equal (document.getElementById ('status').textContent, 'Loading…');
        assert.equal (refresh.disabled, true);
        assert.ok (document.getElementById ('board').classList.contains ('busy'));
        // a second press while the first is on its way starts nothing
        refresh.click ();
        await host.settle ();
        assert.equal (host.requests ('tools/call').length, 1);
        const next = tickersPayload ();
        next.tickers = next.tickers.slice (0, 3);
        next.symbols = next.symbols.slice (0, 3);
        await host.respond (calls[0], { 'content': [ { 'type': 'text', 'text': '{}' } ], 'structuredContent': next });
        assert.equal (rowsOf (document).length, 3);
        assert.equal (refresh.disabled, false);
        assert.ok (!document.getElementById ('board').classList.contains ('busy'));
        assert.equal (document.getElementById ('status').textContent, '');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge: a failed or empty tools/call leaves the data on screen and says why', { 'skip': DOM_SKIP }, async () => {
    const host = await openViewWith ('tickers', ARGS, tickersPayload ());
    try {
        const document = host.document;
        const status = document.getElementById ('status');
        const again = async () => {
            document.getElementById ('refresh').click ();
            await host.settle ();
            return host.requests ('tools/call').at (-1);
        };
        await host.fail (await again (), 'server went away');
        assert.equal (status.textContent, 'Could not load: server went away');
        assert.equal (status.className, 'status error');
        await host.respond (await again (), { 'isError': true, 'content': [ { 'type': 'text', 'text': '{"error":{"message":"rate limited"}}' } ] });
        assert.equal (status.textContent, 'Could not load: rate limited');
        await host.respond (await again (), { 'content': [ { 'type': 'text', 'text': '{}' } ] });
        assert.equal (status.textContent, 'Could not load: the host returned no data for the view');
        await host.respond (await again (), { 'content': [], 'structuredContent': { 'view': 'chart', 'candles': [] } });
        assert.equal (status.textContent, 'Could not load: the host returned no prices.');
        assert.equal (rowsOf (document).length, 7, 'the board that was on screen is kept');
        assert.equal (document.getElementById ('refresh').disabled, false, 'and the controls are handed back');
        assert.ok (!document.getElementById ('board').classList.contains ('busy'));
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge: a request the host never answers times out; the late answer is ignored', { 'skip': DOM_SKIP }, async () => {
    const host = await openViewWith ('tickers', ARGS, tickersPayload ());
    try {
        const document = host.document;
        assert.deepEqual (plain (host.window.ccxtApp.timeouts), { 'request': 60000, 'handshake': 10000 });
        // No clock is involved: the page's own timer for the request is caught here and fired
        // by hand. (A short real timeout raced the event loop — on Windows, whose timers are
        // coarse, it had fired before the first assertion below.) The deadline is a value no
        // other timer of the page uses, so only that one is caught.
        const DEADLINE = 54321;
        host.window.ccxtApp.timeouts.request = DEADLINE;
        const realSetTimeout = host.window.setTimeout;
        const deadlines: (() => void)[] = [];
        host.window.setTimeout = (callback: () => void, delay?: number, ...rest: any[]) => {
            if (delay === DEADLINE) {
                deadlines.push (callback);
                return 0;
            }
            return realSetTimeout.call (host.window, callback, delay, ...rest);
        };
        document.getElementById ('refresh').click ();
        await host.settle ();
        const call = host.requests ('tools/call')[0];
        assert.equal (deadlines.length, 1, 'the request is given a deadline');
        assert.equal (document.getElementById ('refresh').disabled, true);
        assert.ok (document.getElementById ('board').classList.contains ('busy'));
        // the deadline passes without an answer
        deadlines[0] ();
        host.window.setTimeout = realSetTimeout;
        await host.settle ();
        assert.equal (document.getElementById ('status').textContent, 'Could not load: the host did not answer');
        assert.equal (document.getElementById ('refresh').disabled, false, 'the view is not left dimmed and disabled for good');
        assert.ok (!document.getElementById ('board').classList.contains ('busy'));
        const late = tickersPayload ();
        late.tickers = late.tickers.slice (0, 2);
        await host.respond (call, { 'content': [], 'structuredContent': late });
        assert.equal (rowsOf (document).length, 7, 'an answer after the deadline changes nothing');
        assert.equal (document.getElementById ('status').textContent, 'Could not load: the host did not answer');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge: host-context-changed re-renders only for a new locale or time zone', { 'skip': DOM_SKIP }, async () => {
    const host = await openViewWith ('tickers', ARGS, tickersPayload ());
    try {
        const document = host.document;
        const firstRow = rowsOf (document)[0];
        const asOf = document.getElementById ('asof').textContent;
        // (\s: newer ICU data puts a narrow no-break space before "PM")
        assert.match (asOf, /^as of Nov 23, 2026, 12:00\sPM$/u);
        assert.equal (firstRow.cells[1].textContent, '94,250.12');
        // theme, style variables, display mode: pure CSS — the rows on screen are the same nodes
        await host.notify ('ui/notifications/host-context-changed', { 'theme': 'dark', 'displayMode': 'fullscreen', 'styles': { 'variables': { '--bg': '#000' } } });
        assert.equal (document.documentElement.getAttribute ('data-theme'), 'dark');
        assert.ok (rowsOf (document)[0] === firstRow, 'a theme change must not rebuild the table');
        // the same locale and zone again: still nothing to redraw
        await host.notify ('ui/notifications/host-context-changed', { 'locale': 'en-US', 'timeZone': 'UTC' });
        assert.ok (rowsOf (document)[0] === firstRow);
        await host.notify ('ui/notifications/host-context-changed', { 'locale': 'de-DE' });
        assert.ok (rowsOf (document)[0] !== firstRow, 'a new locale redraws');
        assert.equal (rowsOf (document)[0].cells[1].textContent, '94.250,12');
        const german = document.getElementById ('asof').textContent;
        await host.notify ('ui/notifications/host-context-changed', { 'timeZone': 'Asia/Tokyo' });
        assert.notEqual (document.getElementById ('asof').textContent, german, 'and so does a new time zone');
        assert.match (document.getElementById ('asof').textContent, /21:00/);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge: window.openai fallback — toolInput / toolOutput are handed over once, never again', { 'skip': DOM_SKIP }, async () => {
    const fetched = tickersPayload ();
    fetched.tickers = fetched.tickers.slice (0, 2);
    fetched.symbols = fetched.symbols.slice (0, 2);
    const toolCalls: any[] = [];
    const openai: Record<string, any> = {
        'theme': 'dark',
        'toolInput': ARGS,
        'toolOutput': tickersPayload (),
        'callTool': async (name: string, args: any) => {
            toolCalls.push ({ name, args });
            return { 'structuredContent': fetched };
        },
    };
    // a host that only has window.openai never answers ui/initialize
    const host = await openView (viewHtml ('tickers'), { openai });
    try {
        const document = host.document;
        assert.equal (document.documentElement.getAttribute ('data-theme'), 'dark');
        assert.equal (rowsOf (document).length, 7, 'the injected tool output is rendered without waiting for the handshake');
        const firstRow = rowsOf (document)[0];
        // set_globals fires for every global the host changes; the tool output is still the same object
        openai['theme'] = 'light';
        host.window.dispatchEvent (new host.window.Event ('openai:set_globals'));
        await host.settle ();
        assert.equal (document.documentElement.getAttribute ('data-theme'), 'light');
        assert.ok (rowsOf (document)[0] === firstRow, 'the same toolOutput is not delivered (and rendered) a second time');
        // Refresh goes through window.openai.callTool, with the original arguments
        assert.equal (document.getElementById ('refresh').hidden, false);
        document.getElementById ('refresh').click ();
        await host.settle ();
        assert.deepEqual (plain (toolCalls), [ { 'name': 'show_tickers', 'args': ARGS } ]);
        assert.equal (host.requests ('tools/call').length, 0, 'not through the standard bridge, which this host does not have');
        assert.equal (rowsOf (document).length, 2);
        // the host still holds the ORIGINAL call's output: it must not replace what was fetched since
        openai['toolOutput'] = tickersPayload ();
        host.window.dispatchEvent (new host.window.Event ('openai:set_globals'));
        await host.settle ();
        assert.equal (rowsOf (document).length, 2, 'stale toolOutput does not overwrite newer data');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('bridge: when the standard handshake succeeds, window.openai data is not delivered on top of it', { 'skip': DOM_SKIP }, async () => {
    const openai: Record<string, any> = { 'toolInput': undefined, 'toolOutput': undefined };
    const host = await openView (viewHtml ('tickers'), { openai });
    try {
        await host.initialize ();
        await host.deliver (ARGS, tickersPayload ());
        const firstRow = rowsOf (host.document)[0];
        const other = tickersPayload ();
        other.tickers = other.tickers.slice (0, 1);
        openai['toolOutput'] = other;
        host.window.dispatchEvent (new host.window.Event ('openai:set_globals'));
        await host.settle ();
        assert.ok (rowsOf (host.document)[0] === firstRow);
        assert.equal (rowsOf (host.document).length, 7);
    } finally {
        await host.close ();
    }
});

test ('bridge: opened directly (no host) it connects to nothing and the development hook renders', { 'skip': DOM_SKIP }, async () => {
    const host = await openView (viewHtml ('tickers'), { 'embedded': false });
    try {
        assert.deepEqual (host.sent, []);
        host.window.ccxtView.accept (tickersPayload ());
        assert.equal (rowsOf (host.document).length, 7);
        assert.equal (host.document.getElementById ('refresh').hidden, true, 'there is no host to call a tool through');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});
