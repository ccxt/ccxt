'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var unpromise = require('../../static_dependencies/watchable/src/unpromise.js');

// @ts-nocheck
function Future() {
    let resolve = undefined, reject = undefined;
    const p = new Promise((resolve_, reject_) => {
        resolve = resolve_;
        reject = reject_;
    });
    p.resolve = function _resolve() {
        // eslint-disable-next-line prefer-rest-params
        setTimeout(() => {
            resolve.apply(this, arguments);
        });
    };
    p.reject = function _reject() {
        // eslint-disable-next-line prefer-rest-params
        setTimeout(() => {
            reject.apply(this, arguments);
        });
    };
    return p;
}
function wrapFuture(aggregatePromise) {
    const p = Future();
    // wrap the promises as a future
    aggregatePromise.then(p.resolve, p.reject);
    return p;
}
Future.race = (futures) => wrapFuture(unpromise.Unpromise.race(futures));

exports.Future = Future;
