'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var hmac = require('../noble-hashes/hmac.js');
var utils = require('../noble-hashes/utils.js');
var weierstrass = require('./abstract/weierstrass.js');

/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// connects noble-curves to noble-hashes
function getHash(hash) {
    return {
        hash,
        hmac: (key, ...msgs) => hmac.hmac(hash, key, utils.concatBytes(...msgs)),
        randomBytes: utils.randomBytes,
    };
}
function createCurve(curveDef, defHash) {
    const create = (hash) => weierstrass.weierstrass({ ...curveDef, ...getHash(hash) });
    return Object.freeze({ ...create(defHash), create });
}

exports.createCurve = createCurve;
exports.getHash = getHash;
