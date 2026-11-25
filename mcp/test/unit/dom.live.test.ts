import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DOM_SKIP, firstColumn, openView, plain, rowsOf, viewHtml } from '../helpers/dom.js';
import type { Host, HostOptions } from '../helpers/dom.js';
// @ts-ignore — plain .mjs shared with the preview script, no type declarations
import { bookPayload, chartPayload, tickersPayload, STEP } from '../../scripts/preview-payloads.mjs';

// Live mode (ts/ui/live.js) EXECUTED in all three views against the fake host, on a fake clock:
// the page's setTimeout / clearTimeout are replaced before its scripts run, so every poll, backoff
// and pause is driven by advance () and nothing here waits for real time. live_update itself is
// the server's (the hub lane's) tool: here the host answers it with canned results that follow
// the contract ({ ok, view, exchange, source, asOf, nextPollMs, chart | orderbook | tickers }).

interface Clock {
    now: () => number;
    pending: () => number;
    advance: (ms: number) => Promise<void>;
}

function installClock (window: any, settle: () => Promise<void>): Clock {
    let now = Date.now ();
    let sequence = 0;
    const timers = new Map<number, { at: number, fn: () => void }> ();
    window.setTimeout = (fn: any, ms: any) => {
        const id = ++sequence;
        timers.set (id, { 'at': now + Math.max (0, Number (ms) || 0), fn });
        return id;
    };
    window.clearTimeout = (id: any) => {
        timers.delete (id);
    };
    return {
        'now': () => now,
        'pending': () => timers.size,
        'advance': async (ms: number) => {
            const end = now + ms;
            for (;;) {
                let next: [ number, { at: number, fn: () => void } ] | undefined = undefined;
                for (const entry of timers) {
                    if (entry[1].at <= end && (next === undefined || entry[1].at < next[1].at || (entry[1].at === next[1].at && entry[0] < next[0]))) {
                        next = entry;
                    }
                }
                if (next === undefined) {
                    break;
                }
                timers.delete (next[0]);
                now = Math.max (now, next[1].at);
                next[1].fn ();
                await settle ();
            }
            now = end;
            await settle ();
        },
    };
}

interface Live extends Host {
    clock: Clock;
    polls: () => any[];
    // answers the newest unanswered live_update request
    answer: (structuredContent: any) => Promise<void>;
    reject: (envelope: any) => Promise<void>;
    indicator: () => any;
    label: () => string;
}

const answered = new WeakSet<any> ();

async function openLive (view: string, args: Record<string, any>, payload: Record<string, any>, options: HostOptions & { capabilities?: Record<string, any> } = {}): Promise<Live> {
    let clock: Clock | undefined = undefined;
    let settleRef: () => Promise<void> = async () => {};
    const host = await openView (viewHtml (view), {
        ...options,
        'before': (window) => {
            clock = installClock (window, () => settleRef ());
            options.before?.(window);
        },
    });
    settleRef = host.settle;
    const config = host.window.ccxtLive.config;
    config.random = () => 0;
    config.now = () => clock!.now ();
    await host.initialize (undefined, options.capabilities);
    await host.deliver (args, payload);
    const polls = () => host.requests ('tools/call').filter ((message) => message.params.name === 'live_update');
    const open = () => {
        const request = polls ().filter ((message) => !answered.has (message)).at (-1);
        assert.ok (request !== undefined, 'no live_update request is waiting for an answer');
        answered.add (request);
        return request;
    };
    const live: Live = {
        ...host,
        'clock': clock!,
        polls,
        'answer': (structuredContent) => host.respond (open (), { 'content': [ { 'type': 'text', 'text': 'live ' + view } ], structuredContent }),
        'reject': (envelope) => host.respond (open (), { 'isError': true, 'content': [ { 'type': 'text', 'text': JSON.stringify (envelope) } ] }),
        'indicator': () => host.document.querySelector ('.live'),
        'label': () => {
            const node = host.document.querySelector ('.live');
            if (node === null || node.hidden) {
                return '(none)';
            }
            if (node.classList.contains ('pending')) {
                return '(pending)';
            }
            const resume = node.querySelector ('.resume');
            return resume.hidden ? node.querySelector ('.label').textContent : resume.textContent;
        },
    };
    return live;
}

const ARGS = {
    'chart': { 'exchange': 'binance', 'symbol': 'BTC/USDT', 'timeframe': '1h', 'limit': 200 },
    'orderbook': { 'exchange': 'binance', 'symbol': 'BTC/USDT', 'limit': 50 },
    'tickers': { 'exchange': 'binance', 'symbols': tickersPayload ().symbols },
};

const NOW = Date.UTC (2026, 10, 23, 12, 0, 0);

function chartUpdate (candles: any[], extra: Record<string, any> = {}): any {
    return { 'ok': true, 'view': 'chart', 'exchange': 'binance', 'source': 'stream', 'asOf': NOW, 'nextPollMs': 2000, 'chart': { 'symbol': 'BTC/USDT', 'timeframe': '1h', candles }, ...extra };
}

function bookUpdate (bids: any[], asks: any[], extra: Record<string, any> = {}): any {
    return { 'ok': true, 'view': 'orderbook', 'exchange': 'binance', 'source': 'stream', 'asOf': NOW, 'nextPollMs': 2000, 'orderbook': { 'symbol': 'BTC/USDT', bids, asks, 'timestamp': NOW }, ...extra };
}

function tickersUpdate (tickers: Record<string, any>, extra: Record<string, any> = {}): any {
    return { 'ok': true, 'view': 'tickers', 'exchange': 'binance', 'source': 'rest', 'asOf': NOW, 'nextPollMs': 5000, tickers, ...extra };
}

const LIVE_ERROR = (code: string, fields: Record<string, any> = {}) => ({ 'ok': false, 'error': { code, 'message': code.toLowerCase ().replace (/_/g, ' '), 'retryable': true, 'hint': '', ...fields } });

// the first poll goes out config.firstDelayMs (3 s, no jitter with random = 0) after the first render
async function firstPoll (host: Live): Promise<any> {
    assert.equal (host.polls ().length, 0, 'nothing is polled before the first delay');
    await host.clock.advance (3000);
    assert.equal (host.polls ().length, 1, 'the first poll goes out 3 s after the first render');
    return host.polls ()[0];
}

test ('live: no polling and no live controls when the host cannot call tools', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('chart', ARGS.chart, chartPayload (), { 'capabilities': {} });
    try {
        assert.equal (host.window.ccxtApp.canCallTools (), false);
        await host.clock.advance (120000);
        assert.equal (host.sent.filter ((message) => message.method === 'tools/call').length, 0);
        assert.ok (host.indicator () === null, 'no indicator is built');
        assert.equal (host.document.getElementById ('refresh').hidden, true, "today's static view");
        assert.equal (host.clock.pending (), 0, 'no timer is left running');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: polls live_update with the view\'s arguments and honours nextPollMs (clamped to 1..30 s)', { 'skip': DOM_SKIP }, async () => {
    const payload = chartPayload ();
    const host = await openLive ('chart', ARGS.chart, payload);
    try {
        assert.equal (host.label (), '(pending)', 'space is reserved before the first answer');
        const request = await firstPoll (host);
        assert.deepEqual (request.params.arguments, { 'view': 'chart', 'exchange': 'binance', 'symbol': 'BTC/USDT', 'timeframe': '1h', 'since': payload.candles.at (-1)[0] });
        const last = payload.candles.at (-1);
        await host.answer (chartUpdate ([ last ], { 'nextPollMs': 7000 }));
        assert.equal (host.label (), 'Live');
        assert.equal (host.indicator ().getAttribute ('data-state'), 'live');
        assert.match (host.indicator ().querySelector ('.at').textContent, /12:00:00/);
        await host.clock.advance (6999);
        assert.equal (host.polls ().length, 1, 'not before nextPollMs');
        await host.clock.advance (1);
        assert.equal (host.polls ().length, 2, 'at nextPollMs');
        // a cadence below 1 s is raised to 1 s, one above 30 s lowered to 30 s
        await host.answer (chartUpdate ([ last ], { 'nextPollMs': 50 }));
        await host.clock.advance (999);
        assert.equal (host.polls ().length, 2);
        await host.clock.advance (1);
        assert.equal (host.polls ().length, 3);
        await host.answer (chartUpdate ([ last ], { 'nextPollMs': 3600000, 'source': 'rest' }));
        assert.equal (host.label (), 'Delayed', 'a REST/cache answer is shown as delayed');
        await host.clock.advance (29999);
        assert.equal (host.polls ().length, 3);
        await host.clock.advance (1);
        assert.equal (host.polls ().length, 4);
        // no cadence in the answer: 5 s from REST
        await host.answer (chartUpdate ([ last ], { 'nextPollMs': undefined, 'source': 'cache' }));
        await host.clock.advance (4999);
        assert.equal (host.polls ().length, 4);
        await host.clock.advance (1);
        assert.equal (host.polls ().length, 5);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: one request in flight per view — a slow poll holds the next one, and Refresh waits for it', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('chart', ARGS.chart, chartPayload ());
    try {
        await firstPoll (host);
        await host.clock.advance (15000);
        assert.equal (host.polls ().length, 1, 'no second poll while the first is unanswered');
        host.document.getElementById ('refresh').click ();
        await host.settle ();
        assert.equal (host.requests ('tools/call').length, 1, 'Refresh waits for the poll in flight');
        await host.answer (chartUpdate ([ chartPayload ().candles.at (-1) ]));
        const calls = host.requests ('tools/call');
        assert.equal (calls.length, 2);
        assert.equal (calls[1].params.name, 'show_chart', 'and goes out as soon as the poll has answered');
        // while show_chart is in flight no poll starts either
        await host.clock.advance (10000);
        assert.equal (host.requests ('tools/call').length, 2);
        await host.respond (calls[1], { 'content': [], 'structuredContent': chartPayload () });
        await host.clock.advance (3000);
        assert.equal (host.polls ().length, 2, 'polling restarts after the reload');
        // a poll that never answers times out (20 s) and backs off instead of blocking for good
        await host.clock.advance (20000);
        assert.equal (host.label (), 'Offline');
        assert.equal (host.polls ().length, 2);
        // the only answer so far was dropped (Refresh replaced its data), so the backoff starts
        // from the 5 s default cadence: half of it with no jitter
        await host.clock.advance (2499);
        assert.equal (host.polls ().length, 2);
        await host.clock.advance (1);
        assert.equal (host.polls ().length, 3, 'retried after the backoff');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: errors back off exponentially with jitter; RATE_LIMITED waits retryAfterSeconds; success resets', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('orderbook', ARGS.orderbook, bookPayload ());
    try {
        const book = bookPayload ();
        await firstPoll (host);
        await host.answer (bookUpdate (book.bids, book.asks, { 'nextPollMs': 4000 }));
        // RATE_LIMITED with retryAfterSeconds: never earlier than that
        await host.clock.advance (4000);
        await host.reject (LIVE_ERROR ('RATE_LIMITED', { 'retryAfterSeconds': 12 }));
        assert.equal (host.label (), 'Offline');
        assert.match (host.indicator ().title, /rate limited/);
        let sent = host.polls ().length;
        await host.clock.advance (11999);
        assert.equal (host.polls ().length, sent);
        await host.clock.advance (1);
        assert.equal (host.polls ().length, sent + 1);
        // transient errors: with random = 0 the delay is half the backoff, which doubles from
        // max(cadence, 2 s) = 4 s per failure: 2 s (the RATE_LIMITED above was failure 1), 4 s, 8 s
        const gaps: number[] = [];
        for (let failure = 0; failure < 3; failure++) {
            await host.reject (LIVE_ERROR ('LIVE_UNAVAILABLE'));
            const at = host.clock.now ();
            sent = host.polls ().length;
            while (host.polls ().length === sent) {
                await host.clock.advance (500);
            }
            gaps.push (host.clock.now () - at);
        }
        assert.deepEqual (gaps, [ 4000, 8000, 16000 ]);
        // jitter: random = 1 lands at the full backoff (the range is backoff/2 .. backoff)
        host.window.ccxtLive.config.random = () => 1;
        await host.reject (LIVE_ERROR ('EXCHANGE_WARMING'));
        sent = host.polls ().length;
        await host.clock.advance (63999);
        assert.equal (host.polls ().length, sent);
        await host.clock.advance (1);
        assert.equal (host.polls ().length, sent + 1);
        host.window.ccxtLive.config.random = () => 0;
        // a success resets the backoff and the indicator
        await host.answer (bookUpdate (book.bids, book.asks, { 'nextPollMs': 4000 }));
        assert.equal (host.label (), 'Live');
        await host.clock.advance (4000);
        await host.reject (LIVE_ERROR ('LIVE_UNAVAILABLE'));
        sent = host.polls ().length;
        await host.clock.advance (2000);
        assert.equal (host.polls ().length, sent + 1, 'back to the first step');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: a permanent error stops polling; a host that refuses live_update keeps today\'s static view', { 'skip': DOM_SKIP }, async () => {
    const stopped = await openLive ('chart', ARGS.chart, chartPayload ());
    try {
        await firstPoll (stopped);
        await stopped.answer (chartUpdate ([ chartPayload ().candles.at (-1) ]));
        await stopped.clock.advance (2000);
        await stopped.reject (LIVE_ERROR ('BAD_SYMBOL', { 'retryable': false, 'message': 'no such market' }));
        assert.equal (stopped.label (), 'Offline');
        assert.match (stopped.indicator ().title, /stopped: no such market/);
        await stopped.clock.advance (600000);
        assert.equal (stopped.polls ().length, 2, 'no poll after a permanent error');
        assert.equal (stopped.clock.pending (), 0);
    } finally {
        await stopped.close ();
    }
    // the host answers the first poll with a JSON-RPC error: the tool is unknown or not callable
    const refused = await openLive ('orderbook', ARGS.orderbook, bookPayload ());
    try {
        const request = await firstPoll (refused);
        await refused.fail (request, 'Tool live_update not found');
        assert.equal (refused.label (), '(none)', 'the indicator is gone');
        await refused.clock.advance (600000);
        assert.equal (refused.polls ().length, 1);
        assert.equal (refused.document.getElementById ('status').className, 'status', 'nothing is reported as an error');
        const refresh = refused.document.getElementById ('refresh');
        assert.equal (refresh.hidden, false, 'the static Refresh still works');
        refresh.click ();
        await refused.settle ();
        assert.equal (refused.requests ('tools/call').at (-1).params.name, 'show_orderbook');
        assert.deepEqual (refused.errors, []);
    } finally {
        await refused.close ();
    }
});

test ('live: pauses while the document is hidden or the view is out of sight, and resumes on return', { 'skip': DOM_SKIP }, async () => {
    let observer: any = undefined;
    const host = await openLive ('tickers', ARGS.tickers, tickersPayload (), {
        'before': (window) => {
            window.IntersectionObserver = class {
                callback: any;
                observed: any[] = [];
                disconnected = false;
                constructor (callback: any) {
                    this.callback = callback;
                    observer = this;
                }

                observe (node: any) {
                    this.observed.push (node);
                }

                disconnect () {
                    this.disconnected = true;
                }
            };
        },
    });
    const setHidden = async (hidden: boolean) => {
        Object.defineProperty (host.document, 'visibilityState', { 'value': hidden ? 'hidden' : 'visible', 'configurable': true });
        host.document.dispatchEvent (new host.window.Event ('visibilitychange'));
        await host.settle ();
    };
    try {
        assert.ok (observer !== undefined && observer.observed[0] === host.document.body, 'the view watches whether it is on screen');
        await firstPoll (host);
        await host.answer (tickersUpdate ({}));
        await setHidden (true);
        assert.equal (host.label (), 'Paused');
        await host.clock.advance (300000);
        assert.equal (host.polls ().length, 1, 'nothing while hidden');
        await setHidden (false);
        await host.clock.advance (0);
        assert.equal (host.polls ().length, 2, 'the overdue poll goes out on return');
        assert.equal (host.label (), 'Delayed', 'and the indicator shows the last state again');
        await host.answer (tickersUpdate ({}));
        // out of the viewport
        observer.callback ([ { 'isIntersecting': false } ]);
        await host.settle ();
        assert.equal (host.label (), 'Paused');
        assert.match (host.indicator ().title, /out of sight/);
        await host.clock.advance (60000);
        assert.equal (host.polls ().length, 2);
        observer.callback ([ { 'isIntersecting': true } ]);
        await host.clock.advance (0);
        assert.equal (host.polls ().length, 3);
        // both at once: back only when both are back
        await host.answer (tickersUpdate ({}));
        await setHidden (true);
        observer.callback ([ { 'isIntersecting': false } ]);
        await setHidden (false);
        await host.clock.advance (60000);
        assert.equal (host.polls ().length, 3, 'still out of sight');
        observer.callback ([ { 'isIntersecting': true } ]);
        await host.clock.advance (0);
        assert.equal (host.polls ().length, 4);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: auto-pauses after 10 minutes without interaction; "Live paused — resume" resumes', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('tickers', ARGS.tickers, tickersPayload ());
    try {
        await firstPoll (host);
        // answer every poll for 10 minutes, 30 s apart, without touching the view
        let elapsed = 3000;
        await host.answer (tickersUpdate ({}, { 'nextPollMs': 30000 }));
        while (elapsed < 600000 + 30000) {
            await host.clock.advance (30000);
            elapsed += 30000;
            if (host.polls ().some ((message) => !answered.has (message))) {
                await host.answer (tickersUpdate ({}, { 'nextPollMs': 30000 }));
            }
        }
        const sent = host.polls ().length;
        assert.equal (sent, 20, 'polls stop once 10 minutes have passed without input');
        assert.equal (host.label (), 'Live paused — resume');
        const resume = host.document.querySelector ('.live .resume');
        assert.equal (resume.tagName, 'BUTTON');
        await host.clock.advance (600000);
        assert.equal (host.polls ().length, sent);
        resume.click ();
        await host.clock.advance (0);
        assert.equal (host.polls ().length, sent + 1, 'the resume control polls at once');
        await host.answer (tickersUpdate ({}, { 'nextPollMs': 30000 }));
        assert.equal (host.label (), 'Delayed');
        // input keeps it going: a key press every few minutes resets the idle clock
        for (let half = 0; half < 30; half++) {
            if (half % 4 === 0) {
                host.document.body.dispatchEvent (new host.window.KeyboardEvent ('keydown', { 'key': 'Shift', 'bubbles': true }));
            }
            await host.clock.advance (30000);
            if (host.polls ().some ((message) => !answered.has (message))) {
                await host.answer (tickersUpdate ({}, { 'nextPollMs': 30000 }));
            }
        }
        assert.equal (host.label (), 'Delayed', 'still live after 15 minutes of activity');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: the state is announced politely, at most once per 10 s', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('chart', ARGS.chart, chartPayload ());
    try {
        const say = host.document.querySelector ('.sr[aria-live="polite"]');
        assert.ok (say !== null);
        await firstPoll (host);
        await host.answer (chartUpdate ([ chartPayload ().candles.at (-1) ], { 'nextPollMs': 1000 }));
        assert.equal (say.textContent, 'Live updates on');
        await host.clock.advance (1000);
        await host.reject (LIVE_ERROR ('LIVE_UNAVAILABLE'));
        assert.equal (host.label (), 'Offline', 'the indicator changes at once');
        assert.equal (say.textContent, 'Live updates on', 'the announcement waits');
        await host.clock.advance (9000);
        assert.equal (say.textContent, 'Live updates offline');
        // polls that succeed again and again are not announced again
        await host.answer (chartUpdate ([ chartPayload ().candles.at (-1) ], { 'nextPollMs': 1000 }));
        await host.clock.advance (10000);
        const spoken = say.textContent;
        for (let i = 0; i < 5; i++) {
            await host.answer (chartUpdate ([ chartPayload ().candles.at (-1) ], { 'nextPollMs': 1000 }));
            await host.clock.advance (1000);
        }
        assert.equal (say.textContent, spoken);
        assert.equal (host.document.querySelectorAll ('[aria-live="polite"]').length, 1, 'one live region, and the indicator is not one');
    } finally {
        await host.close ();
    }
});

test ('live chart: the open candle is replaced, new ones appended, the window stays bounded; header follows', { 'skip': DOM_SKIP }, async () => {
    const payload = chartPayload ('1h', 200);
    const host = await openLive ('chart', ARGS.chart, payload);
    try {
        const document = host.document;
        document.getElementById ('toggle').click (); // the candle table: newest first
        const step = STEP['1h'];
        const open = payload.candles.at (-1);
        await firstPoll (host);
        const replaced = [ open[0], open[1], open[2] + 500, open[3], open[4] + 400, open[5] + 1 ];
        const fresh = [ open[0] + step, replaced[4], replaced[4] + 10, replaced[4] - 10, replaced[4] + 5, 12 ];
        await host.answer (chartUpdate ([ replaced, fresh ]));
        const rows = rowsOf (document);
        assert.equal (rows.length, 200, 'bounded: the oldest candle dropped off');
        assert.equal (document.getElementById ('range').textContent, 'over 200 × 1h candles');
        assert.equal (document.getElementById ('last').textContent, host.window.ccxtApp.price (fresh[4], 2), 'the header shows the newest close');
        assert.equal (rows[0].cells[4].textContent, host.window.ccxtApp.price (fresh[4], 2));
        assert.equal (rows[1].cells[4].textContent, host.window.ccxtApp.price (replaced[4], 2), 'the open candle was replaced');
        assert.equal (rows[1].cells[2].textContent, host.window.ccxtApp.price (replaced[2], 2));
        assert.equal (rows[199].cells[0].textContent, host.window.ccxtApp.dateTime (chartPayload ('1h', 200).candles[1][0]), 'the window slid by one');
        // the next poll asks from the newest candle held
        await host.clock.advance (2000);
        assert.equal (host.polls ().at (-1).params.arguments.since, fresh[0]);
        // many hours later: still 200, still sorted
        let last = fresh;
        for (let hour = 1; hour <= 60; hour++) {
            const candle = [ last[0] + step, last[4], last[4] + 1, last[4] - 1, last[4], 1 ];
            await host.answer (chartUpdate ([ last, candle ]));
            await host.clock.advance (2000);
            last = candle;
        }
        assert.equal (rowsOf (document).length, 200);
        assert.equal (rowsOf (document)[0].cells[0].textContent, host.window.ccxtApp.dateTime (last[0]));
        assert.equal (document.querySelectorAll ('.plot svg').length, 1, 'one plot, not one per update');
        assert.equal (document.querySelectorAll ('.live').length, 1);
        // an answer for another timeframe or symbol is not merged
        const before = document.getElementById ('last').textContent;
        await host.answer (chartUpdate ([ [ last[0] + step, 1, 1, 1, 1, 1 ] ], { 'chart': { 'symbol': 'BTC/USDT', 'timeframe': '1d', 'candles': [ [ last[0] + step, 1, 1, 1, 1, 1 ] ] } }));
        assert.equal (document.getElementById ('last').textContent, before);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live chart: the inspected candle, keyboard focus and the selected timeframe survive an update', { 'skip': DOM_SKIP }, async () => {
    const payload = chartPayload ('1h', 200);
    const host = await openLive ('chart', ARGS.chart, payload);
    try {
        const document = host.document;
        const svg = document.querySelector ('.plot svg');
        svg.focus ();
        svg.dispatchEvent (new host.window.KeyboardEvent ('keydown', { 'key': 'Home', 'bubbles': true }));
        svg.dispatchEvent (new host.window.KeyboardEvent ('keydown', { 'key': 'ArrowRight', 'bubbles': true }));
        // the delivered object is the view's own from here on: compare against a pristine copy
        const original = chartPayload ('1h', 200).candles;
        const readout = document.getElementById ('readout').textContent;
        assert.ok (readout.startsWith (host.window.ccxtApp.dateTime (original[1][0])));
        const daily = Array.from (document.querySelectorAll ('#timeframes button')).find ((button: any) => button.textContent === '1h') as any;
        await firstPoll (host);
        const open = original.at (-1);
        await host.answer (chartUpdate ([ open, [ open[0] + STEP['1h'], open[4], open[4], open[4], open[4], 1 ] ]));
        assert.ok (document.activeElement === document.querySelector ('.plot svg'), 'focus moved to the redrawn plot');
        assert.ok (document.getElementById ('readout').textContent.startsWith (host.window.ccxtApp.dateTime (original[1][0])), 'still the same candle, now one position to the left');
        assert.ok (Array.from (document.querySelectorAll ('#timeframes button')).includes (daily), 'the timeframe buttons were not rebuilt');
        assert.equal (daily.getAttribute ('aria-pressed'), 'true');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live chart: a timeframe switch restarts polling for the new timeframe; a stale answer is dropped', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('chart', ARGS.chart, chartPayload ('1h', 200));
    try {
        const document = host.document;
        await firstPoll (host);
        await host.answer (chartUpdate ([ chartPayload ().candles.at (-1) ]));
        const daily = Array.from (document.querySelectorAll ('#timeframes button')).find ((button: any) => button.textContent === '1d') as any;
        daily.click ();
        await host.settle ();
        const reload = host.requests ('tools/call').at (-1);
        assert.equal (reload.params.name, 'show_chart');
        assert.equal (reload.params.arguments.timeframe, '1d');
        await host.clock.advance (10000);
        assert.equal (host.polls ().length, 1, 'no poll while the switch is loading');
        const dailyPayload = chartPayload ('1d', 200);
        await host.respond (reload, { 'content': [], 'structuredContent': dailyPayload });
        await host.clock.advance (2999);
        assert.equal (host.polls ().length, 1);
        await host.clock.advance (1);
        assert.equal (host.polls ().length, 2, 'restarted after the first delay');
        assert.deepEqual (host.polls ()[1].params.arguments, { 'view': 'chart', 'exchange': 'binance', 'symbol': 'BTC/USDT', 'timeframe': '1d', 'since': dailyPayload.candles.at (-1)[0] });
        // a Refresh while that poll is in flight: the poll's answer (for the old data) is dropped
        document.getElementById ('refresh').click ();
        await host.settle ();
        await host.answer (chartUpdate ([ [ dailyPayload.candles.at (-1)[0], 1, 1, 1, 1, 1 ] ], { 'chart': { 'symbol': 'BTC/USDT', 'timeframe': '1d', 'candles': [ [ dailyPayload.candles.at (-1)[0], 1, 1, 1, 1, 1 ] ] } }));
        assert.notEqual (document.getElementById ('last').textContent, '1.00', 'the stale answer was not drawn');
        const refresh = host.requests ('tools/call').at (-1);
        assert.equal (refresh.params.name, 'show_chart');
        await host.respond (refresh, { 'content': [], 'structuredContent': dailyPayload });
        await host.clock.advance (3000);
        assert.equal (host.polls ().length, 3);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live orderbook: levels are replaced, the ladder mode is kept, changed levels flash, the status is not rewritten each poll', { 'skip': DOM_SKIP }, async () => {
    const payload = bookPayload (50);
    const host = await openLive ('orderbook', ARGS.orderbook, payload);
    try {
        const document = host.document;
        const status = document.getElementById ('status');
        assert.match (status.textContent, /^As of /);
        document.getElementById ('toggle').click (); // all levels
        assert.equal (document.getElementById ('toggle').getAttribute ('aria-pressed'), 'true');
        const request = await firstPoll (host);
        assert.deepEqual (request.params.arguments, { 'view': 'orderbook', 'exchange': 'binance', 'symbol': 'BTC/USDT', 'depth': 50 });
        const bids = payload.bids.map ((level: number[]) => level.slice ());
        const asks = payload.asks.map ((level: number[]) => level.slice ());
        bids[0][1] = 9.5; // resized
        asks.unshift ([ asks[0][0] - 0.25, 1.25 ]); // new best ask
        asks.pop ();
        await host.answer (bookUpdate (bids, asks));
        const tables = document.querySelectorAll ('#ladder table');
        const bidRows = tables[0].querySelectorAll ('tbody tr');
        const askRows = tables[1].querySelectorAll ('tbody tr');
        assert.equal (bidRows.length, 50, 'still every level');
        assert.equal (document.getElementById ('toggle').getAttribute ('aria-pressed'), 'true', 'still "All levels"');
        assert.equal (bidRows[0].cells[1].textContent, '9.50');
        assert.ok (bidRows[0].classList.contains ('flash'), 'the resized level flashes');
        assert.ok (!bidRows[1].classList.contains ('flash'), 'an unchanged level does not');
        assert.ok (askRows[0].classList.contains ('flash'), 'the new level flashes');
        assert.equal (document.querySelectorAll ('#ladder .flash').length, 2);
        assert.equal (status.textContent, '50 bid and 50 ask levels', 'no timestamp in the live region');
        const mid = document.getElementById ('mid').textContent;
        assert.notEqual (mid, '', 'the header follows the new best prices');
        // the next update of the same book flashes nothing and leaves the status alone
        await host.clock.advance (2000);
        await host.answer (bookUpdate (bids, asks));
        assert.equal (document.querySelectorAll ('#ladder .flash').length, 0);
        assert.equal (status.textContent, '50 bid and 50 ask levels');
        // another symbol's book is ignored
        await host.clock.advance (2000);
        await host.answer ({ ...bookUpdate ([ [ 1, 1 ] ], [ [ 2, 1 ] ]), 'orderbook': { 'symbol': 'ETH/USDT', 'bids': [ [ 1, 1 ] ], 'asks': [ [ 2, 1 ] ], 'timestamp': NOW } });
        assert.equal (document.getElementById ('mid').textContent, mid);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live tickers: rows update in place, keep the sort order, the focused row and its readout; price moves flash', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('tickers', ARGS.tickers, tickersPayload ());
    try {
        const document = host.document;
        document.querySelectorAll ('thead button')[1].click (); // Last, descending
        const order = firstColumn (document);
        assert.deepEqual (order.slice (0, 3), [ 'BTC/USDT', 'ETH/USDT', 'SOL/USDT' ]);
        const solRow = rowsOf (document).find ((row: any) => row.getAttribute ('data-key') === 'SOL/USDT');
        const btcRow = rowsOf (document)[0];
        solRow.focus ();
        const request = await firstPoll (host);
        assert.deepEqual (request.params.arguments, { 'view': 'tickers', 'exchange': 'binance', 'symbols': tickersPayload ().symbols });
        // SOL rallies past ETH; BTC dips
        await host.answer (tickersUpdate ({
            'SOL/USDT': { 'last': 4000.5, 'bid': 4000.4, 'ask': 4000.6, 'percentage': 2000, 'baseVolume': 1, 'quoteVolume': 2, 'timestamp': NOW + 1000 },
            'BTC/USDT': { 'last': 94000.12, 'bid': null, 'percentage': 2.01, 'timestamp': NOW + 1000 },
        }));
        assert.deepEqual (firstColumn (document).slice (0, 3), [ 'BTC/USDT', 'SOL/USDT', 'ETH/USDT' ], 'still sorted by Last');
        assert.ok (rowsOf (document)[0] === btcRow, 'the same <tr>: updated in place');
        assert.ok (document.activeElement === solRow, 'focus stays on the same row');
        assert.ok (solRow.classList.contains ('active'));
        assert.match (document.getElementById ('readout').textContent, /^SOL\/USDT/);
        assert.match (document.getElementById ('readout').textContent, /4,000\.4/, 'the readout shows the new bid');
        assert.equal (solRow.cells[1].textContent, '4,000.50');
        assert.ok (solRow.cells[1].classList.contains ('flash-up'));
        assert.ok (btcRow.cells[1].classList.contains ('flash-down'));
        assert.ok (!rowsOf (document)[2].cells[1].classList.contains ('flash-up') && !rowsOf (document)[2].cells[1].classList.contains ('flash-down'), 'an unchanged price does not flash');
        assert.match (btcRow.cells[2].textContent, /\+2\.01%/);
        assert.match (document.getElementById ('asof').textContent, /12:00/);
        // the range stretches to a last price outside it
        assert.match (solRow.cells[3].querySelector ('.rng').title, /high 4,000\.50/);
        // a later re-sort draws the cells without the flash
        document.querySelectorAll ('thead button')[0].click ();
        assert.equal (document.querySelectorAll ('tbody .flash-up, tbody .flash-down').length, 0);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live tickers: more than 20 symbols are polled 20 at a time, in turn', { 'skip': DOM_SKIP }, async () => {
    const payload = tickersPayload ();
    const base = payload.tickers[0];
    payload.tickers = Array.from ({ 'length': 45 }, (_, i) => ({ ...base, 'symbol': 'C' + i + '/USDT' }));
    payload.symbols = payload.tickers.map ((ticker: any) => ticker.symbol);
    const host = await openLive ('tickers', { 'exchange': 'binance', 'symbols': payload.symbols }, payload);
    try {
        const chunks: string[][] = [];
        await firstPoll (host);
        for (let i = 0; i < 4; i++) {
            chunks.push (host.polls ().at (-1).params.arguments.symbols);
            await host.answer (tickersUpdate ({}, { 'nextPollMs': 1000 }));
            await host.clock.advance (1000);
        }
        assert.deepEqual (chunks.map ((chunk) => chunk.length), [ 20, 20, 5, 20 ]);
        assert.equal (chunks[0][0], 'C0/USDT');
        assert.equal (chunks[1][0], 'C20/USDT');
        assert.equal (chunks[2][0], 'C40/USDT');
        assert.equal (chunks[3][0], 'C0/USDT');
    } finally {
        await host.close ();
    }
});

test ('live: ui/resource-teardown stops polling and removes every listener', { 'skip': DOM_SKIP }, async () => {
    let disconnected = false;
    const host = await openLive ('orderbook', ARGS.orderbook, bookPayload (), {
        'before': (window) => {
            window.IntersectionObserver = class {
                observe () {}

                disconnect () {
                    disconnected = true;
                }
            };
        },
    });
    try {
        await firstPoll (host);
        const book = bookPayload ();
        await host.answer (bookUpdate (book.bids, book.asks));
        await host.post ({ 'jsonrpc': '2.0', 'id': 99, 'method': 'ui/resource-teardown', 'params': {} });
        assert.deepEqual (plain (host.sent.at (-1)), { 'jsonrpc': '2.0', 'id': 99, 'result': {} });
        assert.ok (disconnected, 'the IntersectionObserver is disconnected');
        await host.clock.advance (600000);
        assert.equal (host.polls ().length, 1);
        assert.equal (host.clock.pending (), 0, 'no timer is left');
        // a visibility change after teardown does not wake it up
        host.document.dispatchEvent (new host.window.Event ('visibilitychange'));
        await host.clock.advance (60000);
        assert.equal (host.polls ().length, 1);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: a window.openai-only host (ChatGPT) polls through window.openai.callTool', { 'skip': DOM_SKIP }, async () => {
    const calls: any[] = [];
    const openai = {
        'toolInput': ARGS.tickers,
        'toolOutput': tickersPayload (),
        'callTool': async (name: string, args: any) => {
            calls.push ({ name, args });
            return { 'structuredContent': tickersUpdate ({ 'BTC/USDT': { 'last': 1 } }) };
        },
    };
    let clock: Clock | undefined = undefined;
    let settleRef: () => Promise<void> = async () => {};
    const host = await openView (viewHtml ('tickers'), { openai, 'before': (window) => { clock = installClock (window, () => settleRef ()); } });
    settleRef = host.settle;
    try {
        host.window.ccxtLive.config.random = () => 0;
        await clock!.advance (3500);
        assert.equal (calls.length, 1);
        assert.equal (calls[0].name, 'live_update');
        assert.equal (calls[0].args.view, 'tickers');
        assert.equal (host.requests ('tools/call').length, 0);
        assert.equal (rowsOf (host.document).find ((row: any) => row.getAttribute ('data-key') === 'BTC/USDT').cells[1].textContent.replace (/0+$/, ''), '1.');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: long runs do not grow the DOM, the listeners or the timers', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('tickers', ARGS.tickers, tickersPayload ());
    try {
        const document = host.document;
        await firstPoll (host);
        const count = () => document.getElementsByTagName ('*').length;
        await host.answer (tickersUpdate ({ 'BTC/USDT': { 'last': 94000 } }, { 'nextPollMs': 1000 }));
        const nodes = count ();
        for (let i = 0; i < 200; i++) {
            await host.clock.advance (1000);
            if (i % 7 === 3) {
                await host.reject (LIVE_ERROR ('LIVE_UNAVAILABLE'));
            } else if (host.polls ().some ((message) => !answered.has (message))) {
                await host.answer (tickersUpdate ({ 'BTC/USDT': { 'last': 94000 + (i % 5) } }, { 'nextPollMs': 1000 }));
            }
            // input now and then, so the idle pause does not end the run early
            document.body.dispatchEvent (new host.window.PointerEvent ('pointerdown', { 'bubbles': true }));
            assert.ok (host.clock.pending () <= 2, 'at most the poll timer and one announcement timer');
        }
        assert.equal (count (), nodes, 'the same number of elements after 200 polls');
        assert.equal (document.querySelectorAll ('.live').length, 1);
        assert.equal (document.querySelectorAll ('.sr').length, 1);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: the views animate nothing under prefers-reduced-motion', () => {
    const css = fs.readFileSync (path.join (path.dirname (fileURLToPath (import.meta.url)), '..', '..', 'ts', 'ui', 'shared.css'), 'utf8');
    const reduced = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec (css);
    assert.ok (reduced !== null);
    for (const selector of [ '.live .dot', '.flash', '.flash-up', '.flash-down' ]) {
        assert.ok (reduced[1].includes (selector), selector + ' is not stopped under reduced motion');
    }
    assert.match (reduced[1], /animation: none/);
    // every animation in the stylesheet is one of those
    const animated = [ ...css.matchAll (/([^{}\n]+)\{[^}]*\banimation:\s*live-/g) ].map ((match) => match[1].trim ());
    assert.deepEqual (animated, [ '.live[data-state="live"] .dot', '.flash', '.flash-up', '.flash-down' ]);
});

// ---- review findings ----

test ('live chart: a historical window (since, ending in the past) stays static; a since window reaching the open candle goes live', { 'skip': DOM_SKIP }, async () => {
    // the preview candles end at 2026-11-23 12:00, days before the test clock
    const historical = await openLive ('chart', { ...ARGS.chart, 'since': '2026-11-01T00:00:00Z' }, chartPayload ());
    try {
        await historical.clock.advance (120000);
        assert.equal (historical.polls ().length, 0, 'no live_update for a past window');
        assert.equal (historical.document.getElementById ('last').textContent, historical.window.ccxtApp.price (chartPayload ().candles.at (-1)[4], 2), 'the chart keeps the window it was asked for');
        assert.equal (historical.document.getElementById ('refresh').hidden, false, 'Refresh still works');
        assert.deepEqual (historical.errors, []);
    } finally {
        await historical.close ();
    }
    const payload = chartPayload ();
    const shift = Math.floor (Date.now () / STEP['1h']) * STEP['1h'] - payload.candles.at (-1)[0];
    payload.candles = payload.candles.map ((candle: number[]) => [ candle[0] + shift, ...candle.slice (1) ]);
    const current = await openLive ('chart', { ...ARGS.chart, 'since': payload.candles[0][0] }, payload);
    try {
        await firstPoll (current);
        assert.equal (current.polls ()[0].params.arguments.since, payload.candles.at (-1)[0]);
    } finally {
        await current.close ();
    }
});

test ('live: a render with exchange params stays static (live_update cannot repeat them); prediction is passed on', { 'skip': DOM_SKIP }, async () => {
    for (const [ view, args, payload ] of [
        [ 'chart', { ...ARGS.chart, 'params': { 'price': 'mark' } }, chartPayload () ],
        [ 'orderbook', { ...ARGS.orderbook, 'params': { 'aggregation': 10 } }, bookPayload () ],
        [ 'tickers', { ...ARGS.tickers, 'params': { 'type': 'swap' } }, tickersPayload () ],
    ] as const) {
        const host = await openLive (view, args, payload);
        try {
            await host.clock.advance (60000);
            assert.equal (host.polls ().length, 0, view + ': no live_update for a render with params');
        } finally {
            await host.close ();
        }
    }
    for (const [ view, args, payload ] of [
        [ 'chart', { ...ARGS.chart, 'prediction': true }, chartPayload () ],
        [ 'orderbook', { ...ARGS.orderbook, 'prediction': true }, bookPayload () ],
        [ 'tickers', { ...ARGS.tickers, 'prediction': true }, tickersPayload () ],
    ] as const) {
        const host = await openLive (view, args, payload);
        try {
            const request = await firstPoll (host);
            assert.equal (request.params.arguments.prediction, true, view);
        } finally {
            await host.close ();
        }
    }
    // and a regular render sends no prediction key at all
    const plainHost = await openLive ('orderbook', ARGS.orderbook, bookPayload ());
    try {
        assert.equal ('prediction' in (await firstPoll (plainHost)).params.arguments, false);
    } finally {
        await plainHost.close ();
    }
});

test ('live: after a permanent error stops polling, a fresh full render (Refresh) re-arms it', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('chart', ARGS.chart, chartPayload ());
    try {
        await firstPoll (host);
        await host.reject (LIVE_ERROR ('BAD_SYMBOL', { 'retryable': false, 'message': 'no such market' }));
        assert.equal (host.label (), 'Offline');
        await host.clock.advance (60000);
        assert.equal (host.polls ().length, 1);
        host.document.getElementById ('refresh').click ();
        await host.settle ();
        await host.respond (host.requests ('tools/call').at (-1), { 'content': [], 'structuredContent': chartPayload () });
        await host.clock.advance (3000);
        assert.equal (host.polls ().length, 2, 'polling starts over after the new render');
        await host.answer (chartUpdate ([ chartPayload ().candles.at (-1) ]));
        assert.equal (host.label (), 'Live');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: a pending "offline" announcement is cancelled when the view is back to Live', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('chart', ARGS.chart, chartPayload ());
    try {
        const say = host.document.querySelector ('.sr[aria-live="polite"]');
        await firstPoll (host);
        await host.answer (chartUpdate ([ chartPayload ().candles.at (-1) ], { 'nextPollMs': 1000 }));
        assert.equal (say.textContent, 'Live updates on');
        await host.clock.advance (1000);
        await host.reject (LIVE_ERROR ('LIVE_UNAVAILABLE'));
        // one transient failure, then live again inside the 10 s throttle window
        await host.clock.advance (2000);
        await host.answer (chartUpdate ([ chartPayload ().candles.at (-1) ], { 'nextPollMs': 1000 }));
        assert.equal (host.label (), 'Live');
        await host.clock.advance (15000);
        assert.equal (say.textContent, 'Live updates on', 'never announced offline while it is live');
    } finally {
        await host.close ();
    }
});

test ('live: a server error on the first poll (restarting, internal error) is retried; a host refusal still disables at once', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('orderbook', ARGS.orderbook, bookPayload ());
    try {
        const request = await firstPoll (host);
        await host.fail (request, 'server is restarting, retry shortly');
        assert.notEqual (host.label (), '(none)', 'live mode is not given up on one server error');
        await host.clock.advance (10000);
        assert.equal (host.polls ().length, 2, 'retried');
        const book = bookPayload ();
        await host.answer (bookUpdate (book.bids, book.asks));
        assert.equal (host.label (), 'Live');
    } finally {
        await host.close ();
    }
    // three failures in a row before any success: a static view after all
    const failing = await openLive ('orderbook', ARGS.orderbook, bookPayload ());
    try {
        for (let i = 0; i < 3; i++) {
            while (failing.polls ().length === i) {
                await failing.clock.advance (500);
            }
            await failing.fail (failing.polls ().at (-1), 'internal error');
        }
        assert.equal (failing.label (), '(none)');
        await failing.clock.advance (600000);
        assert.equal (failing.polls ().length, 3);
    } finally {
        await failing.close ();
    }
    // the host says the tool may not be called: disabled on the first poll, by code or by text
    const refused = await openLive ('orderbook', ARGS.orderbook, bookPayload ());
    try {
        const first = await firstPoll (refused);
        await refused.post ({ 'jsonrpc': '2.0', 'id': first.id, 'error': { 'code': -32601, 'message': 'method not available' } });
        assert.equal (refused.label (), '(none)');
        await refused.clock.advance (600000);
        assert.equal (refused.polls ().length, 1);
    } finally {
        await refused.close ();
    }
});

test ('live: an update that arrives while text is selected is held until the selection ends (copying a price works)', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('tickers', ARGS.tickers, tickersPayload ());
    try {
        const document = host.document;
        await firstPoll (host);
        const row = rowsOf (document).find ((candidate: any) => candidate.getAttribute ('data-key') === 'BTC/USDT');
        const cell = row.cells[1];
        const before = cell.textContent;
        const selection = host.window.getSelection ();
        const range = document.createRange ();
        range.selectNodeContents (cell);
        selection.removeAllRanges ();
        selection.addRange (range);
        assert.equal (String (selection), before);
        await host.answer (tickersUpdate ({ 'BTC/USDT': { 'last': 12345.5, 'timestamp': NOW + 1000 } }));
        assert.ok (row.cells[1] === cell, 'the selected cell was not rebuilt');
        assert.equal (cell.textContent, before);
        assert.equal (String (host.window.getSelection ()), before, 'the selection survives');
        assert.equal (host.label (), 'Delayed', 'the poll itself succeeded');
        // the next poll goes out on time; its answer is held too
        await host.clock.advance (5000);
        assert.equal (host.polls ().length, 2);
        await host.answer (tickersUpdate ({ 'BTC/USDT': { 'last': 12346.5, 'timestamp': NOW + 2000 } }));
        assert.equal (cell.textContent, before);
        // the selection ends: the newest update is drawn
        selection.removeAllRanges ();
        document.dispatchEvent (new host.window.Event ('selectionchange'));
        await host.settle ();
        const updated = rowsOf (document).find ((candidate: any) => candidate.getAttribute ('data-key') === 'BTC/USDT');
        assert.equal (updated.cells[1].textContent, '12,346.50');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live orderbook: level counts that change with each poll are shown but not announced (the status leaves the live regions)', { 'skip': DOM_SKIP }, async () => {
    const payload = bookPayload (50);
    const host = await openLive ('orderbook', ARGS.orderbook, payload);
    try {
        const status = host.document.getElementById ('status');
        assert.equal (status.getAttribute ('role'), 'status');
        await firstPoll (host);
        for (let i = 0; i < 6; i++) {
            const depth = 50 - (i % 3);
            if (i > 0) {
                await host.clock.advance (2000);
            }
            await host.answer (bookUpdate (payload.bids.slice (0, depth), payload.asks.slice (0, depth)));
            assert.equal (status.textContent, depth + ' bid and ' + depth + ' ask levels', 'the text follows');
            assert.equal (status.getAttribute ('role'), null, 'not a live region while live');
            assert.equal (status.getAttribute ('aria-live'), 'off');
        }
        // a full render (Refresh) is announced again
        host.document.getElementById ('refresh').click ();
        await host.settle ();
        assert.equal (status.getAttribute ('role'), 'status', 'Loading… is announced');
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: coming back on screen after 10+ minutes off screen resumes polling instead of the idle pause', { 'skip': DOM_SKIP }, async () => {
    let observer: any = undefined;
    const host = await openLive ('tickers', ARGS.tickers, tickersPayload (), {
        'before': (window) => {
            window.IntersectionObserver = class {
                callback: any;
                constructor (callback: any) {
                    this.callback = callback;
                    observer = this;
                }

                observe () {}

                disconnect () {}
            };
        },
    });
    try {
        await firstPoll (host);
        await host.answer (tickersUpdate ({}));
        observer.callback ([ { 'isIntersecting': false } ]);
        await host.settle ();
        await host.clock.advance (11 * 60000);
        // scrolled back into view by the page (no input inside the view)
        observer.callback ([ { 'isIntersecting': true } ]);
        await host.clock.advance (0);
        assert.equal (host.polls ().length, 2, 'the overdue poll goes out');
        assert.notEqual (host.label (), 'Live paused — resume');
    } finally {
        await host.close ();
    }
});

test ('live chart: the live window keeps the requested limit (10 stays 10), and a short history may grow to it', { 'skip': DOM_SKIP }, async () => {
    const payload = chartPayload ('1h', 10);
    const host = await openLive ('chart', { ...ARGS.chart, 'limit': 10 }, payload);
    try {
        host.document.getElementById ('toggle').click ();
        await firstPoll (host);
        let last = payload.candles.at (-1);
        for (let i = 0; i < 5; i++) {
            const next = [ last[0] + STEP['1h'], last[4], last[4] + 1, last[4] - 1, last[4], 1 ];
            await host.answer (chartUpdate ([ last, next ]));
            await host.clock.advance (2000);
            last = next;
        }
        assert.equal (rowsOf (host.document).length, 10);
    } finally {
        await host.close ();
    }
    // a new market: 5 candles held, 200 asked for
    const young = chartPayload ('1h', 5);
    young.limit = 200;
    const growing = await openLive ('chart', ARGS.chart, young);
    try {
        growing.document.getElementById ('toggle').click ();
        await firstPoll (growing);
        let last = young.candles.at (-1);
        for (let i = 0; i < 3; i++) {
            const next = [ last[0] + STEP['1h'], last[4], last[4] + 1, last[4] - 1, last[4], 1 ];
            await growing.answer (chartUpdate ([ last, next ]));
            await growing.clock.advance (2000);
            last = next;
        }
        assert.equal (rowsOf (growing.document).length, 8);
    } finally {
        await growing.close ();
    }
});

test ('live tickers: a stream update moves prices only; change % and volumes keep the meaning of the ticker the board was rendered from', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('tickers', ARGS.tickers, tickersPayload ());
    try {
        const document = host.document;
        const row = () => rowsOf (document).find ((candidate: any) => candidate.getAttribute ('data-key') === 'BTC/USDT');
        const change = row ().cells[2].textContent;
        await firstPoll (host);
        await host.answer (tickersUpdate ({ 'BTC/USDT': { 'last': 95000.5, 'bid': 95000, 'ask': 95001, 'percentage': -7.77, 'baseVolume': 1, 'quoteVolume': 1, 'timestamp': NOW + 1000 } }, { 'source': 'stream', 'nextPollMs': 2000 }));
        assert.equal (row ().cells[1].textContent, '95,000.50', 'the price moves');
        assert.equal (row ().cells[2].textContent, change, 'the change % is not replaced by a different window');
        assert.doesNotMatch (row ().cells[2].textContent, /7\.77/);
        // a REST answer is the same kind of ticker as the render: it updates everything
        await host.clock.advance (2000);
        await host.answer (tickersUpdate ({ 'BTC/USDT': { 'last': 95001.5, 'percentage': 3.33, 'timestamp': NOW + 2000 } }));
        assert.match (row ().cells[2].textContent, /3\.33/);
        assert.deepEqual (host.errors, []);
    } finally {
        await host.close ();
    }
});

test ('live: stale stream data is shown as Delayed, not Live', { 'skip': DOM_SKIP }, async () => {
    const host = await openLive ('orderbook', ARGS.orderbook, bookPayload ());
    try {
        const book = bookPayload ();
        await firstPoll (host);
        await host.answer (bookUpdate (book.bids, book.asks, { 'stale': true }));
        assert.equal (host.label (), 'Delayed');
        assert.match (host.indicator ().title, /last streamed data/);
    } finally {
        await host.close ();
    }
});

test ('live: the indicator has a fixed width, so its states never move the controls', () => {
    const css = fs.readFileSync (path.join (path.dirname (fileURLToPath (import.meta.url)), '..', '..', 'ts', 'ui', 'shared.css'), 'utf8');
    const rule = /\.live \{([^}]*)\}/.exec (css);
    assert.ok (rule !== null);
    assert.match (rule[1], /(^|[ ;])width: [0-9.]+em;/, 'a width, not only a min-width');
    assert.match (rule[1], /overflow: hidden;/);
    assert.match (rule[1], /flex: none;/);
    assert.match (css, /\.live \.at \{[^}]*text-overflow: ellipsis;/);
});
