// Shared by the two account pages (setup.html, accounts.html), inlined at the top of each
// page's one script block by the page server (ts/setup/pages.ts) — so it runs under the same
// per-response CSP nonce as the page's own code and adds no second script element.
//
// window.ccxtSetup:
//   boot        the page's boot block (the JSON the server placed in #boot)
//   base        the session's own path; every endpoint hangs off it
//   $ (id)      document.getElementById
//   el (tag, className, text)
//   request (method, path, body, gone)
//               one same-origin request to the session; a body makes it a JSON POST carrying
//               the session nonce. Resolves with the JSON answer plus its HTTP `status`;
//               calls gone () and rejects when the session is over
//   countdown (isOver, gone)
//               the "Closes in m:ss" line; calls gone () when the session's time is up
(function () {
    'use strict';
    var boot = JSON.parse (document.getElementById ('boot').textContent);
    // the session's own path; every endpoint hangs off it (the form may be served one level
    // below it, when it was reached from the accounts page)
    var base = (/^\/setup\/[0-9a-f]{32}/.exec (location.pathname) || [ '' ])[0];
    var $ = function (id) { return document.getElementById (id); };

    function el (tag, className, text) {
        var node = document.createElement (tag);
        if (className) { node.className = className; }
        if (text !== undefined) { node.textContent = text; }
        return node;
    }

    function request (method, path, body, gone) {
        var options = { 'method': method, 'cache': 'no-store', 'credentials': 'same-origin', 'headers': {} };
        if (body !== undefined) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['X-Setup-Nonce'] = boot.csrf;
            options.body = JSON.stringify (body);
        }
        return fetch (base + path, options).then (function (response) {
            // 404 is the server saying the session is over (expired, used, or replaced)
            if (response.status === 404) { gone (); throw new Error ('gone'); }
            return response.json ().then (function (data) { data.status = response.status; return data; });
        }, function () {
            // the local server is not there any more
            gone ();
            throw new Error ('gone');
        });
    }

    function countdown (isOver, gone) {
        var end = performance.now () + boot.expiresInMs;
        var tick = function () {
            if (isOver ()) { return; }
            var left = Math.max (0, end - performance.now ());
            if (left <= 0) { gone (); return; }
            var minutes = Math.floor (left / 60000);
            var seconds = Math.floor ((left % 60000) / 1000);
            $('expiry').textContent = 'Closes in ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            setTimeout (tick, 1000);
        };
        tick ();
    }

    window.ccxtSetup = { boot: boot, base: base, $: $, el: el, request: request, countdown: countdown };
}) ();
