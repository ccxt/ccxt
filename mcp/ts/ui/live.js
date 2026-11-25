// Live mode for the views (inlined after bridge.js by ts/ui.ts). After the first render a
// view polls the app-only tool live_update through the host: one request in flight, at the
// server's nextPollMs (clamped 1..30 s), jittered exponential backoff on errors and
// retryAfterSeconds on RATE_LIMITED. It pauses while the document is hidden, the view is
// off screen, or after 10 minutes without input; it stops on teardown, on a permanent error,
// and for good when the host refuses the tool. No tools/call: no live mode, no controls.
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

    function attach (options) {
        var started = false;
        var stopped = false;
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

        // spoken politely, at most once per config.announceMs (the last word wins)
        function announce (text) {
            if (!ui || text === spoken.text) {
                return;
            }
            clearTimeout (spoken.timer);
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

        function received (content) {
            if (!content || content.ok === false || content.view !== options.view) {
                failed ({ message: 'the server sent an update this view cannot use' });
                return;
            }
            try {
                options.apply (content);
            } catch (error) {
                if (window.console) {
                    console.warn ('[ccxt view] a live update could not be drawn', error);
                }
                failed ({ message: 'the update could not be drawn' });
                return;
            }
            successes++;
            failures = 0;
            var streaming = content.source === 'stream';
            var next = app.isNumber (content.nextPollMs) ? content.nextPollMs : (streaming ? config.defaultStreamMs : config.defaultRestMs);
            cadence = Math.max (config.minMs, Math.min (config.maxMs, next));
            if (ui && app.isNumber (content.asOf)) {
                ui.at.textContent = app.dateTime (content.asOf, { timeStyle: 'medium' });
            }
            var every = ', refreshed every ' + Math.round (cadence / 1000) + ' s';
            show (streaming ? 'live' : 'delayed', streaming ? 'Streaming from the exchange' + every : 'Polled from the exchange (' + String (content.source || 'rest') + ')' + every);
            // never earlier than the server asked; up to 10% later, so views drift apart
            schedule (cadence + config.random () * cadence * 0.1);
        }

        function failed (error) {
            if (!successes && (error.rpc || (!error.code && !error.timeout))) {
                // no live_update for this view on this host or server: stay a static view
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
            window[method] ('pagehide', stop);
        }

        function start () {
            if (started || stopped || !app.canCallTools ()) {
                return;
            }
            started = true;
            build ();
            show ('pending', '');
            listen (true);
            if (typeof window.IntersectionObserver === 'function') {
                try {
                    observer = new window.IntersectionObserver (function (entries) {
                        var entry = entries[entries.length - 1];
                        if (entry) {
                            pause ('offscreen', !entry.isIntersecting);
                        }
                    });
                    observer.observe (document.body);
                } catch (error) {
                    observer = null;
                }
            }
            app.on ('teardown', stop);
            visibility ();
            schedule (config.firstDelayMs + config.random () * 500);
        }

        function restart () {
            if (!started) {
                start ();
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
