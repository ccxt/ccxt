// Shared runtime for the ccxt-mcp views (inlined into each view by ts/ui.ts).
//
// Implements the view side of MCP Apps (spec 2026-01-26) by hand: JSON-RPC 2.0 over
// window.parent.postMessage. No dependencies, no network — the view only ever talks to
// its host, and through the host to the ccxt-mcp server that produced it.
//
//   view -> host   ui/initialize (request), ui/notifications/initialized,
//                  ui/notifications/size-changed, tools/call (request), ui/open-link (request)
//   host -> view   ui/notifications/tool-input, ui/notifications/tool-result,
//                  ui/notifications/tool-cancelled, ui/notifications/host-context-changed,
//                  ui/resource-teardown (request), ping (request)
(function () {
    'use strict';
    var PROTOCOL_VERSION = '2026-01-26';
    var pending = {};
    var nextId = 1;
    var handlers = {};
    var hostContext = {};
    var hostCapabilities = {};
    var initialized = false;
    var openaiInput = null; // the window.openai.toolInput / toolOutput already handed to the view
    var openaiOutput = null;
    var refetched = false; // the view has loaded newer data through callTool
    var lastHeight = 0;
    var embedded = window.parent !== window;

    function post (message) {
        // The host's origin is unknown to a sandboxed view, so the message cannot be addressed
        // to it. What goes out is tool-call arguments for public market data (exchange,
        // symbol, timeframe) and nothing the server holds.
        window.parent.postMessage (message, '*');
    }

    // A host that drops a request (or loses its server connection) never answers, and a view
    // waiting on it stays dimmed and disabled for good, so every request has a deadline. The
    // values are exposed as window.ccxtApp.timeouts for slow integrations and for tests.
    var timeouts = { request: 60000, handshake: 10000 };

    function request (method, params, timeoutMs) {
        return new Promise (function (resolve, reject) {
            var id = nextId++;
            var timer = setTimeout (function () {
                // a late answer finds no pending entry and is ignored
                delete pending[id];
                reject (new Error ('the host did not answer'));
            }, timeoutMs);
            pending[id] = { resolve: resolve, reject: reject, timer: timer };
            post ({ jsonrpc: '2.0', id: id, method: method, params: params || {} });
        });
    }

    function notify (method, params) {
        post ({ jsonrpc: '2.0', method: method, params: params || {} });
    }

    function call (name, argument) {
        if (typeof handlers[name] === 'function') {
            try {
                handlers[name] (argument);
            } catch (error) {
                if (window.console) {
                    console.error ('[ccxt view] ' + name + ' handler failed', error);
                }
            }
        }
    }

    function renderKey () {
        return String (hostContext.locale) + '|' + String (hostContext.timeZone);
    }

    function applyContext (context) {
        var root = document.documentElement;
        var before = renderKey ();
        var key;
        for (key in context) {
            if (Object.prototype.hasOwnProperty.call (context, key)) {
                hostContext[key] = context[key];
            }
        }
        if (context.theme === 'light' || context.theme === 'dark') {
            root.setAttribute ('data-theme', context.theme);
        }
        var styles = context.styles || {};
        var variables = styles.variables || {};
        for (key in variables) {
            // only custom properties, and only string values: the host is trusted, but a
            // style map is still data
            if (Object.prototype.hasOwnProperty.call (variables, key) && key.indexOf ('--') === 0 && typeof variables[key] === 'string') {
                root.style.setProperty (key, variables[key]);
            }
        }
        if (styles.css && typeof styles.css.fonts === 'string' && !document.getElementById ('host-fonts')) {
            var style = document.createElement ('style');
            style.id = 'host-fonts';
            style.textContent = styles.css.fonts;
            document.head.appendChild (style);
        }
        var insets = context.safeAreaInsets;
        if (insets) {
            [ 'top', 'right', 'bottom', 'left' ].forEach (function (side) {
                if (typeof insets[side] === 'number') {
                    root.style.setProperty ('--safe-' + side, insets[side] + 'px');
                }
            });
        }
        // theme, style variables, fonts and insets are pure CSS (applied above); only locale
        // and timeZone change what a view draws, so nothing else is worth a rebuild that
        // costs the user their keyboard focus and the point they were inspecting
        if (renderKey () !== before) {
            call ('onContext', hostContext);
        }
    }

    function reportSize () {
        if (!initialized) {
            return;
        }
        var height = Math.ceil (document.documentElement.getBoundingClientRect ().height);
        if (height > 0 && height !== lastHeight) {
            lastHeight = height;
            notify ('ui/notifications/size-changed', { height: height });
        }
    }

    function deliverResult (result) {
        if (!result) {
            return;
        }
        if (result.isError) {
            call ('onError', errorMessage (result));
            return;
        }
        var missing = missingData (result.structuredContent);
        if (missing) {
            // the text content is only the model's summary: without the payload there is
            // nothing to draw, and saying so beats waiting forever
            call ('onError', missing);
        } else {
            call ('onResult', result.structuredContent);
        }
    }

    // Every show_* result carries structuredContent (its outputSchema requires it), but the
    // dataset only when the server decided a view would render it: its "ui" field says so
    // ("displayed" or "attached"; anything else is a summary-only result). Undefined when the
    // payload is drawable, otherwise why it is not.
    function missingData (content) {
        if (!content || typeof content !== 'object') {
            return 'the host returned no data for the view';
        }
        if (typeof content.ui === 'string' && content.ui !== 'displayed' && content.ui !== 'attached') {
            return 'the server sent a summary without the data for this view (ui: ' + content.ui + ')';
        }
        return undefined;
    }

    // a failed tool call carries the server's error envelope as JSON text
    function errorMessage (result) {
        var text = '';
        var content = (result && result.content) || [];
        for (var i = 0; i < content.length; i++) {
            if (content[i] && content[i].type === 'text' && typeof content[i].text === 'string') {
                text = content[i].text;
                break;
            }
        }
        try {
            var envelope = JSON.parse (text);
            if (envelope && envelope.error && envelope.error.message) {
                return String (envelope.error.message);
            }
        } catch (error) {
            // not JSON — fall through to the raw text
        }
        return text ? text.slice (0, 300) : 'the request failed';
    }

    window.addEventListener ('message', function (event) {
        if (event.source !== window.parent) {
            return;
        }
        var message = event.data;
        if (!message || message.jsonrpc !== '2.0') {
            return;
        }
        if (message.method === undefined) {
            var entry = pending[message.id];
            if (entry) {
                delete pending[message.id];
                clearTimeout (entry.timer);
                if (message.error) {
                    entry.reject (new Error ((message.error && message.error.message) || 'request failed'));
                } else {
                    entry.resolve (message.result);
                }
            }
            return;
        }
        if (message.id !== undefined) {
            // a request from the host
            if (message.method === 'ui/resource-teardown') {
                call ('onTeardown');
                post ({ jsonrpc: '2.0', id: message.id, result: {} });
            } else if (message.method === 'ping') {
                post ({ jsonrpc: '2.0', id: message.id, result: {} });
            } else {
                post ({ jsonrpc: '2.0', id: message.id, error: { code: -32601, message: 'method not found: ' + message.method } });
            }
            return;
        }
        var params = message.params || {};
        if (message.method === 'ui/notifications/tool-input') {
            call ('onInput', params.arguments || {});
        } else if (message.method === 'ui/notifications/tool-result') {
            deliverResult (params);
        } else if (message.method === 'ui/notifications/tool-cancelled') {
            call ('onError', 'the request was cancelled' + (params.reason ? ' (' + params.reason + ')' : ''));
        } else if (message.method === 'ui/notifications/host-context-changed') {
            applyContext (params);
        }
    });

    // ChatGPT implements the standard above; older builds only expose window.openai. Treat it
    // as a data source of last resort so the view still fills in there.
    function openaiFallback () {
        var api = window.openai;
        if (!api) {
            return;
        }
        if (api.theme === 'light' || api.theme === 'dark') {
            document.documentElement.setAttribute ('data-theme', api.theme);
        }
        // set_globals fires for every global (theme, displayMode, maxHeight, widgetState ...)
        // while toolInput / toolOutput stay those of the original call: hand each over once,
        // never when the standard bridge delivers them, and never over data the view has
        // fetched itself since
        if (initialized || refetched) {
            return;
        }
        var input = api.toolInput;
        if (input && typeof input === 'object' && input !== openaiInput) {
            openaiInput = input;
            call ('onInput', input);
        }
        var output = api.toolOutput;
        if (output && typeof output === 'object' && output !== openaiOutput) {
            openaiOutput = output;
            call ('onResult', output);
        }
    }

    function connect (options) {
        handlers = options || {};
        if (window.ResizeObserver) {
            new ResizeObserver (reportSize).observe (document.documentElement);
        }
        window.addEventListener ('openai:set_globals', openaiFallback);
        if (!embedded) {
            // opened directly in a browser tab (development) — nothing to handshake with
            return Promise.resolve (hostContext);
        }
        // a window.openai-only host never answers ui/initialize: read what it has already
        // injected instead of waiting for the handshake to time out
        openaiFallback ();
        return request ('ui/initialize', {
            appInfo: { name: handlers.name || 'ccxt-view', version: handlers.version || '1.0.0' },
            appCapabilities: {},
            protocolVersion: PROTOCOL_VERSION
        }, timeouts.handshake).then (function (result) {
            result = result || {};
            hostCapabilities = result.hostCapabilities || {};
            initialized = true;
            applyContext (result.hostContext || {});
            notify ('ui/notifications/initialized', {});
            reportSize ();
            return hostContext;
        }, function (error) {
            if (window.openai) {
                // no standard bridge, but the view is served through window.openai
                openaiFallback ();
                return hostContext;
            }
            throw error;
        });
    }

    // re-run a tool on the ccxt-mcp server through the host (used for refresh / timeframe
    // switches); resolves with the tool's structuredContent
    function callTool (name, args) {
        var promise;
        if (initialized) {
            promise = request ('tools/call', { name: name, arguments: args || {} }, timeouts.request);
        } else if (window.openai && typeof window.openai.callTool === 'function') {
            promise = new Promise (function (resolve, reject) {
                var timer = setTimeout (function () { reject (new Error ('the host did not answer')); }, timeouts.request);
                var settle = function (done) {
                    return function (value) {
                        clearTimeout (timer);
                        done (value);
                    };
                };
                // inside the executor, so a synchronous throw rejects as well
                Promise.resolve (window.openai.callTool (name, args || {})).then (settle (resolve), settle (reject));
            });
        } else {
            return Promise.reject (new Error ('this host does not let the view request new data — ask the assistant instead'));
        }
        return promise.then (function (result) {
            if (!result || result.isError) {
                throw new Error (errorMessage (result));
            }
            var missing = missingData (result.structuredContent);
            if (missing) {
                throw new Error (missing);
            }
            refetched = true;
            return result.structuredContent;
        });
    }

    function canCallTools () {
        if (initialized) {
            return hostCapabilities.serverTools !== undefined;
        }
        return !!(window.openai && typeof window.openai.callTool === 'function');
    }

    // ---- formatting -----------------------------------------------------------------

    function locale () {
        return (typeof hostContext.locale === 'string' && hostContext.locale) ? hostContext.locale : undefined;
    }

    function isNumber (value) {
        return typeof value === 'number' && isFinite (value);
    }

    // a chart formats a few thousand values per render with a handful of option sets:
    // building an Intl formatter is the expensive part, so keep one per locale and option set
    var formatters = {};

    function formatter (kind, tag, options) {
        var key = kind + '|' + tag + '|' + JSON.stringify (options);
        if (!formatters[key]) {
            formatters[key] = new Intl[kind] (tag, options);
        }
        return formatters[key];
    }

    // A zero is never printed with a minus sign: neither the negative zero arithmetic can
    // leave behind ("+ 0" makes it a plain zero) nor a small negative value that the options
    // round to zero (-0.001 with two decimals), which Intl would both write as "-0".
    function format (value, options) {
        var number = value + 0;
        try {
            var numberFormat = formatter ('NumberFormat', locale (), options);
            var text = numberFormat.format (number);
            if (number < 0) {
                var zero = numberFormat.format (0);
                if (numberFormat.format (-number) === zero) {
                    return zero;
                }
            }
            return text;
        } catch (error) {
            return number.toLocaleString (undefined, options);
        }
    }

    // number of decimals a value is written with (0.25 -> 2), ignoring float noise
    function decimals (value) {
        if (!isNumber (value)) {
            return 0;
        }
        for (var count = 0; count < 12; count++) {
            var scaled = value * Math.pow (10, count);
            if (Math.abs (scaled - Math.round (scaled)) < 1e-9 * Math.max (1, Math.abs (scaled))) {
                return count;
            }
        }
        return 12;
    }

    // Prices span ~12 orders of magnitude across markets, so precision follows magnitude.
    // Values shown side by side (one axis, one table column) should pass the same
    // fractionDigits instead, so they do not each pick their own.
    function price (value, fractionDigits) {
        if (!isNumber (value)) {
            return '–';
        }
        if (isNumber (fractionDigits)) {
            var digits = Math.max (0, Math.min (20, Math.round (fractionDigits)));
            return format (value, { minimumFractionDigits: digits, maximumFractionDigits: digits });
        }
        var abs = Math.abs (value);
        if (abs >= 1e9) {
            return format (value, { notation: 'compact', maximumFractionDigits: 3 });
        }
        if (abs >= 1) {
            // ~7 significant digits, never fewer than 2 decimals: 1.08864, 154.327, 64,231.50
            var places = Math.max (2, 6 - Math.floor (Math.log (abs) / Math.LN10 + 1e-9));
            return format (value, { minimumFractionDigits: 2, maximumFractionDigits: places });
        }
        if (abs === 0) {
            return '0';
        }
        return format (value, { maximumSignificantDigits: 5 });
    }

    function compact (value) {
        if (!isNumber (value)) {
            return '–';
        }
        var abs = Math.abs (value);
        if (abs >= 1000) {
            return format (value, { notation: 'compact', maximumFractionDigits: 2 });
        }
        if (abs >= 1 || abs === 0) {
            return format (value, { maximumFractionDigits: 2 });
        }
        return format (value, { maximumSignificantDigits: 3 });
    }

    function percent (value) {
        if (!isNumber (value)) {
            return '–';
        }
        var sign = (value > 0) ? '+' : ((value < 0) ? '−' : '');
        var magnitude = Math.abs (value);
        var options = (magnitude >= 10000) ? { notation: 'compact', maximumFractionDigits: 1 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        return sign + format (magnitude, options) + '%';
    }

    function dateTime (timestamp, options) {
        if (!isNumber (timestamp)) {
            return '–';
        }
        var settings = options || { dateStyle: 'medium', timeStyle: 'short' };
        if (typeof hostContext.timeZone === 'string' && hostContext.timeZone) {
            settings = Object.assign ({ timeZone: hostContext.timeZone }, settings);
        }
        var date = new Date (timestamp);
        if (isNaN (date.getTime ())) {
            // beyond the representable Date range
            return '–';
        }
        try {
            return formatter ('DateTimeFormat', locale (), settings).format (date);
        } catch (error) {
            return date.toISOString ();
        }
    }

    // "nice" axis ticks: steps of 1/2/5 × 10^n covering [min, max]
    function ticks (min, max, count) {
        if (!isNumber (min) || !isNumber (max) || max <= min) {
            return isNumber (min) ? [ min ] : [];
        }
        var rough = (max - min) / Math.max (1, count);
        var power = Math.pow (10, Math.floor (Math.log (rough) / Math.LN10));
        var fraction = rough / power;
        var step = power * ((fraction >= 7) ? 10 : ((fraction >= 3) ? 5 : ((fraction >= 1.5) ? 2 : 1)));
        var result = [];
        var start = Math.ceil (min / step) * step;
        var steps = Math.floor ((max - start) / step + 1e-9);
        if (!(step > 0) || !isNumber (start) || !isNumber (steps) || steps < 0 || steps > 1000 || start + step === start) {
            // the range is narrower than float resolution around its values: adding the step
            // would never advance, and there are no distinct "nice" values to show
            return [ min ];
        }
        for (var index = 0; index <= steps; index++) {
            var value = Number ((start + index * step).toPrecision (12));
            // steps below the 12 digits kept here round to the same value: list it once
            if (!result.length || value !== result[result.length - 1]) {
                result.push (value);
            }
        }
        return result;
    }

    function svg (name, attributes) {
        var node = document.createElementNS ('http://www.w3.org/2000/svg', name);
        for (var key in attributes || {}) {
            if (Object.prototype.hasOwnProperty.call (attributes, key)) {
                node.setAttribute (key, attributes[key]);
            }
        }
        return node;
    }

    function element (name, className, text) {
        var node = document.createElement (name);
        if (className) {
            node.className = className;
        }
        if (text !== undefined) {
            node.textContent = text;
        }
        return node;
    }

    window.ccxtApp = {
        connect: connect,
        callTool: callTool,
        canCallTools: canCallTools,
        context: function () { return hostContext; },
        timeouts: timeouts,
        isNumber: isNumber,
        // a number written for the host's locale with Intl.NumberFormat options
        number: format,
        decimals: decimals,
        price: price,
        compact: compact,
        percent: percent,
        dateTime: dateTime,
        ticks: ticks,
        svg: svg,
        element: element
    };
}) ();
