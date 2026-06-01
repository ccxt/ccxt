'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var net = require('net');
var tls = require('tls');
var events = require('events');
var index = require('../agent-base/index.js');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var net__namespace = /*#__PURE__*/_interopNamespace(net);
var tls__namespace = /*#__PURE__*/_interopNamespace(tls);

// ----------------------------------------------------------------------------
function isHTTPS(protocol) {
    return typeof protocol === 'string' ? /^https:?$/i.test(protocol) : false;
}
/**
 * The `HttpProxyAgent` implements an HTTP Agent subclass that connects
 * to the specified "HTTP proxy server" in order to proxy HTTP requests.
 */
class HttpProxyAgent extends index.Agent {
    constructor(proxy, opts) {
        super(opts);
        this.proxy = typeof proxy === 'string' ? new URL(proxy) : proxy;
        this.proxyHeaders = opts?.headers ?? {};
        // debug('Creating new HttpProxyAgent instance: %o', this.proxy.href);
        // Trim off the brackets from IPv6 addresses
        const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, '');
        const port = this.proxy.port
            ? parseInt(this.proxy.port, 10)
            : this.secureProxy
                ? 443
                : 80;
        this.connectOpts = {
            ...(opts ? omit(opts, 'headers') : null),
            host,
            port,
        };
    }
    get secureProxy() {
        return isHTTPS(this.proxy.protocol);
    }
    async connect(req, opts) {
        const { proxy } = this;
        const protocol = opts.secureEndpoint ? 'https:' : 'http:';
        const hostname = req.getHeader('host') || 'localhost';
        const base = `${protocol}//${hostname}`;
        const url = new URL(req.path, base);
        if (opts.port !== 80) {
            url.port = String(opts.port);
        }
        // Change the `http.ClientRequest` instance's "path" field
        // to the absolute path of the URL that will be requested.
        req.path = String(url);
        // Inject the `Proxy-Authorization` header if necessary.
        req._header = null;
        const headers = typeof this.proxyHeaders === 'function'
            ? this.proxyHeaders()
            : { ...this.proxyHeaders };
        if (proxy.username || proxy.password) {
            const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
            headers['Proxy-Authorization'] = `Basic ${Buffer.from(auth).toString('base64')}`;
        }
        if (!headers['Proxy-Connection']) {
            headers['Proxy-Connection'] = this.keepAlive
                ? 'Keep-Alive'
                : 'close';
        }
        for (const name of Object.keys(headers)) {
            const value = headers[name];
            if (value) {
                req.setHeader(name, value);
            }
        }
        // Create a socket connection to the proxy server.
        let socket;
        if (this.secureProxy) {
            // debug('Creating `tls.Socket`: %o', this.connectOpts);
            socket = tls__namespace.connect(this.connectOpts);
        }
        else {
            // debug('Creating `net.Socket`: %o', this.connectOpts);
            socket = net__namespace.connect(this.connectOpts);
        }
        // At this point, the http ClientRequest's internal `_header` field
        // might have already been set. If this is the case then we'll need
        // to re-generate the string since we just changed the `req.path`.
        let first;
        let endOfHeaders;
        // debug('Regenerating stored HTTP header string for request');
        req._implicitHeader();
        if (req.outputData && req.outputData.length > 0) {
            // Node >= 12
            // debug(
            //	'Patching connection write() output buffer with updated header'
            // );
            first = req.outputData[0].data;
            endOfHeaders = first.indexOf('\r\n\r\n') + 4;
            req.outputData[0].data =
                req._header + first.substring(endOfHeaders);
            // debug('Output buffer: %o', req.outputData[0].data);
        }
        // Wait for the socket's `connect` event, so that this `callback()`
        // function throws instead of the `http` request machinery. This is
        // important for i.e. `PacProxyAgent` which determines a failed proxy
        // connection via the `callback()` function throwing.
        await events.once(socket, 'connect');
        return socket;
    }
}
HttpProxyAgent.protocols = ['http', 'https'];
function omit(obj, ...keys) {
    const ret = {};
    let key;
    for (key in obj) {
        if (!keys.includes(key)) {
            ret[key] = obj[key];
        }
    }
    return ret;
}

exports.HttpProxyAgent = HttpProxyAgent;
