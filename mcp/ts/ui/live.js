// Live mode for the views (inlined after bridge.js by ts/ui.ts). After the first render a
// view polls the app-only tool live_update through the host: one request in flight, at the
// server's nextPollMs (clamped 1..30 s), jittered exponential backoff on errors and
// retryAfterSeconds on RATE_LIMITED. It pauses while the document is hidden, the view is
// off screen, or after 10 minutes without input; it stops on teardown and on a permanent
// error (a later full render, e.g. Refresh, re-arms it), and for good when the host refuses
// the tool. No tools/call: no live mode, no controls. request () returning null keeps the
// view static (a historical chart, a render the poll cannot reproduce). An update that
// arrives while the user has text selected in the view is held until the selection ends:
// redrawing would wipe it.
//
// ccxtLive.attach ({ view, slot, request () -> args | null, apply (content), busy () })
//   -> { start, restart, run (fn): fn once no poll is in flight, stop, state, inFlight }
(function () {
    'use strict';
    var app = window.ccxtApp;
    var config = {
        firstDelayMs: 3000,
        defaultStreamMs: 2000,
        defaultRestMs: 5000,
        minMs: 1000,
        maxMs: 30000,
        maxBackoffMs: 120000,
        timeoutMs: 20000,
        idleMs: 600000,
        announceMs: 10000,
        random: function () { return Math.random (); },
        now: function () { return Date.now (); }
    };
    // retried whatever the envelope's retryable flag says
    var TRANSIENT = { RATE_LIMITED: 1, EXCHANGE_WARMING: 1, LIVE_UNAVAILABLE: 1 };
    var LABELS = { live: 'Live', delayed: 'Delayed', paused: 'Paused', offline: 'Offline' };
    var SPOKEN = { live: 'Live updates on', delayed: 'Live updates delayed', offline: 'Live updates offline', idle: 'Live updates paused after 10 minutes without activity', stopped: 'Live updates stopped' };
    // focus is left out: the views move focus themselves when they redraw
    var INPUT = [ 'pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart' ];
    // a JSON-RPC error that says the host will not let the view call the tool at all (not a
    // server or network failure): live mode is switched off at once on the first poll
    var REFUSED_CODES = { '-32601': 1, '-32602': 1 };
    var REFUSED_TEXT = /not found|unknown tool|no such tool|not allowed|not permitted|forbidden|visibility|does not let|not available|unsupported|denied/i;
    // first polls that fail some other way (a server restarting, an internal error) before
    // live mode is given up on this host
    var FIRST_POLL_TRIES = 3;

    // whether the user has text selected in the view (the whole document is the view)
    function selecting () {
        try {
            var selection = window.getSelection ? window.getSelection () : null;
            return !!selection && selection.rangeCount > 0 && !selection.isCollapsed && String (selection).length > 0;
        } catch (error) {
            return false;
        }
    }

    function attach (options) {
        var started = false;
        var stopped = false;
        var halted = false; // stopped by a permanent error: a new full render re-arms it
        var held = null; // an update waiting for the user's text selection to end
        var timer = null;
        var dueAt = 0;
        var inFlight = false;
        var generation = 0;
        var successes = 0;
        var failures = 0;
        var cadence = config.defaultRestMs;
        var paused = {}; // hidden, offscreen, idle
        var queued = [];
        var lastInput = config.now ();
        var state = 'pending';
        var current = { state: 'pending', detail: '' }; // shown again when a pause ends
        var ui = null;
        var observer = null;
        var spoken = { text: '', at: -Infinity, timer: null };

        function isPaused () {
            return !!(paused.hidden || paused.offscreen || paused.idle);
        }

        function build () {
            var wrap = app.element ('span', 'live pending');
            var dot = app.element ('i', 'dot');
            dot.setAttribute ('aria-hidden', 'true');
            var resume = app.element ('button', 'resume', 'Live paused — resume');
            resume.type = 'button';
            resume.hidden = true;
            resume.addEventListener ('click', function () {
                lastInput = config.now ();
                pause ('idle', false);
            });
            ui = { wrap: wrap, label: app.element ('span', 'label'), at: app.element ('span', 'at'), resume: resume, say: app.element ('span', 'sr') };
            [ dot, ui.label, ui.at, resume ].forEach (function (node) { wrap.appendChild (node); });
            ui.say.setAttribute ('aria-live', 'polite');
            ui.say.setAttribute ('aria-atomic', 'true');
            options.slot.insertBefore (wrap, options.slot.firstChild);
            document.body.appendChild (ui.say);
        }

        // spoken politely, at most once per config.announceMs (the last word wins). A pending
        // announcement is dropped first: coming back to what was last said cancels it
        function announce (text) {
            if (!ui) {
                return;
            }
            clearTimeout (spoken.timer);
            spoken.timer = null;
            if (text === spoken.text) {
                return;
            }
            var speak = function () {
                spoken = { text: text, at: config.now (), timer: null };
                ui.say.textContent = text;
            };
            var wait = spoken.at + config.announceMs - config.now ();
            if (wait <= 0) {
                speak ();
            } else {
                spoken.timer = setTimeout (speak, wait);
            }
        }

        function show (next, detail) {
            if (next !== 'paused' && next !== 'idle') {
                current = { state: next, detail: detail };
                if (isPaused () && !stopped) {
                    return;
                }
            }
            state = next;
            if (!ui) {
                return;
            }
            var idle = next === 'idle';
            // the pending indicator already takes its space, so nothing moves when it appears
            ui.wrap.className = 'live' + ((next === 'pending') ? ' pending' : '');
            ui.wrap.setAttribute ('data-state', idle ? 'paused' : next);
            ui.wrap.title = detail || '';
            ui.label.textContent = LABELS[next] || '';
            ui.label.hidden = idle;
            ui.at.hidden = idle;
            ui.resume.hidden = !idle;
            if (SPOKEN[next]) {
                announce (SPOKEN[next]);
            }
        }

        function schedule (delay) {
            clearTimeout (timer);
            timer = null;
            dueAt = config.now () + delay;
            if (!stopped && !isPaused ()) {
                timer = setTimeout (tick, Math.max (0, delay));
            }
        }

        function tick () {
            timer = null;
            if (stopped || isPaused () || inFlight) {
                return;
            }
            if (config.now () - lastInput >= config.idleMs) {
                pause ('idle', true);
                return;
            }
            if (options.busy && options.busy ()) {
                schedule (config.minMs);
                return;
            }
            var args = options.request ();
            if (!args) {
                schedule (cadence);
                return;
            }
            args.view = options.view;
            inFlight = true;
            var mine = generation;
            var done = function (handle, value) {
                inFlight = false;
                var waiting = queued;
                queued = [];
                waiting.forEach (function (fn) { fn (); });
                if (stopped) {
                    return;
                }
                if (mine === generation) {
                    handle (value);
                } else if (!timer) {
                    // restarted meanwhile: the answer is for the old arguments, and the
                    // restart's poll may have fallen due while this one held the slot
                    schedule (Math.max (0, dueAt - config.now ()));
                }
            };
            app.callTool ('live_update', args, config.timeoutMs).then (function (content) {
                done (received, content);
            }, function (error) {
                done (failed, error || {});
            });
        }

        function draw (content) {
            try {
                options.apply (content);
                return true;
            } catch (error) {
                if (window.console) {
                    console.warn ('[ccxt view] a live update could not be drawn', error);
                }
                return false;
            }
        }

        // the selection ended: draw what arrived meanwhile
        function selectionChanged () {
            if (held && !selecting ()) {
                var content = held;
                held = null;
                draw (content);
            }
        }

        function received (content) {
            if (!content || content.ok === false || content.view !== options.view) {
                failed ({ message: 'the server sent an update this view cannot use' });
                return;
            }
            if (selecting ()) {
                // the newest update replaces an older held one: each is the whole picture
                held = content;
            } else {
                held = null;
                if (!draw (content)) {
                    failed ({ message: 'the update could not be drawn' });
                    return;
                }
            }
            successes++;
            failures = 0;
            // the last streamed data, served because nothing fresher could be had, is delayed
            var streaming = content.source === 'stream' && content.stale !== true;
            var next = app.isNumber (content.nextPollMs) ? content.nextPollMs : (streaming ? config.defaultStreamMs : config.defaultRestMs);
            cadence = Math.max (config.minMs, Math.min (config.maxMs, next));
            if (ui && app.isNumber (content.asOf)) {
                ui.at.textContent = app.dateTime (content.asOf, { timeStyle: 'medium' });
            }
            var every = ', refreshed every ' + Math.round (cadence / 1000) + ' s';
            var detail = streaming ? 'Streaming from the exchange' + every : ((content.stale === true) ? 'The last streamed data: the exchange could not be reached' + every : 'Polled from the exchange (' + String (content.source || 'rest') + ')' + every);
            show (streaming ? 'live' : 'delayed', detail);
            // never earlier than the server asked; up to 10% later, so views drift apart
            schedule (cadence + config.random () * cadence * 0.1);
        }

        function refusedByHost (error) {
            return !!error.rpc && (REFUSED_CODES[String (error.rpcCode)] === 1 || REFUSED_TEXT.test (String (error.message || '')));
        }

        function failed (error) {
            if (!successes && (refusedByHost (error) || (!error.rpc && !error.code && !error.timeout))) {
                // no live_update for this view on this host or server: stay a static view
                disable ();
                return;
            }
            if (!successes && error.rpc && failures + 1 >= FIRST_POLL_TRIES) {
                // the first polls keep failing (server errors): give live mode up here
                disable ();
                return;
            }
            if (error.code && error.retryable === false && !TRANSIENT[error.code]) {
                // BAD_SYMBOL, BAD_TIMEFRAME ...: polling again will not fix it
                halt ('Live updates stopped: ' + error.message);
                return;
            }
            failures++;
            var backoff = Math.min (config.maxBackoffMs, Math.max (cadence, 2000) * Math.pow (2, failures - 1));
            var delay = backoff / 2 + config.random () * backoff / 2;
            if (app.isNumber (error.retryAfterSeconds)) {
                delay = Math.max (delay, error.retryAfterSeconds * 1000);
            }
            show ('offline', 'Live updates failed (' + String (error.message || 'unknown error') + '), retrying');
            schedule (Math.max (config.minMs, delay));
        }

        function pause (reason, on) {
            if (stopped || !!paused[reason] === on) {
                return;
            }
            var was = isPaused ();
            paused[reason] = on;
            if (isPaused ()) {
                clearTimeout (timer);
                timer = null;
                if (paused.idle) {
                    show ('idle', 'No activity for 10 minutes');
                } else {
                    show ('paused', (paused.hidden ? 'The page is hidden' : 'The view is out of sight') + ': updates resume when it is back');
                }
            } else if (was) {
                show (current.state, current.detail);
                // a poll that fell due meanwhile goes out now
                schedule (Math.max (0, dueAt - config.now ()));
            }
        }

        function interacted () {
            lastInput = config.now ();
        }

        function visibility () {
            var hidden = document.visibilityState === 'hidden';
            if (!hidden) {
                // coming back to the conversation counts as activity
                interacted ();
            }
            pause ('hidden', hidden);
        }

        function listen (on) {
            var method = on ? 'addEventListener' : 'removeEventListener';
            INPUT.forEach (function (name) { window[method] (name, interacted, { capture: true, passive: true }); });
            document[method] ('visibilitychange', visibility);
            document[method] ('selectionchange', selectionChanged);
            window[method] ('pagehide', stop);
        }

        function start () {
            if (started || stopped || !app.canCallTools ()) {
                return;
            }
            started = true;
            build ();
            show ('pending', '');
            app.on ('teardown', stop);
            arm ();
        }

        // listeners, the on-screen observer and the first poll
        function arm () {
            listen (true);
            if (typeof window.IntersectionObserver === 'function') {
                try {
                    observer = new window.IntersectionObserver (function (entries) {
                        var entry = entries[entries.length - 1];
                        if (entry) {
                            if (entry.isIntersecting && paused.offscreen) {
                                // scrolled back into view counts as activity, as coming back to
                                // the page does: otherwise a long time off screen ends idle
                                interacted ();
                            }
                            pause ('offscreen', !entry.isIntersecting);
                        }
                    });
                    observer.observe (document.body);
                } catch (error) {
                    observer = null;
                }
            }
            visibility ();
            schedule (config.firstDelayMs + config.random () * 500);
        }

        function restart () {
            held = null;
            if (!started) {
                start ();
            } else if (halted) {
                // a fresh full render after a permanent error: polling starts over
                halted = false;
                stopped = false;
                generation++;
                failures = 0;
                lastInput = config.now ();
                paused = {};
                show ('pending', '');
                arm ();
            } else if (!stopped) {
                generation++;
                failures = 0;
                schedule (config.firstDelayMs);
            }
        }

        function run (fn) {
            if (!inFlight) {
                fn ();
                return;
            }
            // the poll in flight answers for the data fn is about to replace: drop it
            generation++;
            held = null;
            queued.push (fn);
        }

        function teardown () {
            stopped = true;
            clearTimeout (timer);
            timer = null;
            listen (false);
            if (observer) {
                observer.disconnect ();
                observer = null;
            }
        }

        function stop () {
            halted = false; // teardown is final
            if (!stopped) {
                teardown ();
                clearTimeout (spoken.timer);
                state = 'stopped';
            }
        }

        function disable () {
            teardown ();
            state = 'unavailable';
            if (ui) {
                ui.wrap.hidden = true;
            }
        }

        function halt (detail) {
            teardown ();
            show ('offline', detail);
            announce (SPOKEN.stopped);
            state = 'stopped';
            halted = true;
        }

        return {
            start: start,
            restart: restart,
            run: run,
            stop: stop,
            state: function () { return state; },
            inFlight: function () { return inFlight; }
        };
    }

    window.ccxtLive = { attach: attach, config: config };
}) ();
