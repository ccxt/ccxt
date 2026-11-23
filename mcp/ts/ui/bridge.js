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
    var lastHeight = 0;
    var embedded = window.parent !== window;

    function post (message) {
        // the host's origin is unknown to a sandboxed view, and nothing sent here is secret:
        // requests carry only public market-data arguments
        window.parent.postMessage (message, '*');
    }

    function request (method, params) {
        return new Promise (function (resolve, reject) {
            var id = nextId++;
            pending[id] = { resolve: resolve, reject: reject };
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

    function applyContext (context) {
        var root = document.documentElement;
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
        call ('onContext', hostContext);
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
        if (result.structuredContent) {
            call ('onResult', result.structuredContent);
        }
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
        if (api.toolOutput && typeof api.toolOutput === 'object') {
            call ('onResult', api.toolOutput);
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
        return request ('ui/initialize', {
            appInfo: { name: handlers.name || 'ccxt-view', version: handlers.version || '1.0.0' },
            appCapabilities: {},
            protocolVersion: PROTOCOL_VERSION
        }).then (function (result) {
            result = result || {};
            hostCapabilities = result.hostCapabilities || {};
            initialized = true;
            applyContext (result.hostContext || {});
            notify ('ui/notifications/initialized', {});
            reportSize ();
            return hostContext;
        }, function (error) {
            openaiFallback ();
            throw error;
        });
    }

    // re-run a tool on the ccxt-mcp server through the host (used for refresh / timeframe
    // switches); resolves with the tool's structuredContent
    function callTool (name, args) {
        var promise;
        if (initialized) {
            promise = request ('tools/call', { name: name, arguments: args || {} });
        } else if (window.openai && typeof window.openai.callTool === 'function') {
            promise = Promise.resolve (window.openai.callTool (name, args || {}));
        } else {
            return Promise.reject (new Error ('this host does not let the view request new data — ask the assistant instead'));
        }
        return promise.then (function (result) {
            if (!result || result.isError) {
                throw new Error (errorMessage (result));
            }
            if (!result.structuredContent) {
                throw new Error ('the host returned no data for the view');
            }
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

    function format (value, options) {
        try {
            return value.toLocaleString (locale (), options);
        } catch (error) {
            return value.toLocaleString (undefined, options);
        }
    }

    // prices span ~12 orders of magnitude across markets, so precision follows magnitude
    function price (value) {
        if (!isNumber (value)) {
            return '–';
        }
        var abs = Math.abs (value);
        if (abs >= 1e9) {
            return format (value, { notation: 'compact', maximumFractionDigits: 3 });
        }
        if (abs >= 1000) {
            return format (value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (abs >= 1) {
            return format (value, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
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
            return new Intl.DateTimeFormat (locale (), settings).format (date);
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
        for (var value = start; value <= max + step * 1e-9; value += step) {
            result.push (Number (value.toPrecision (12)));
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
        isNumber: isNumber,
        price: price,
        compact: compact,
        percent: percent,
        dateTime: dateTime,
        ticks: ticks,
        svg: svg,
        element: element
    };
}) ();
