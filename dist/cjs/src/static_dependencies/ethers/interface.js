'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./utils/base58.js');
require('./utils/errors.js');
require('./utils/events.js');
require('./utils/fixednumber.js');
require('./utils/maths.js');
require('./utils/utf8.js');
require('../../base/functions/platform.js');
require('../../base/functions/encode.js');
require('../../base/functions/crypto.js');
require('../noble-hashes/sha3.js');
require('../noble-hashes/sha256.js');
require('./abi-coder.js');
var abstractCoder = require('./coders/abstract-coder.js');
require('./fragments.js');
require('./typed.js');

/**
 *  The Interface class is a low-level class that accepts an
 *  ABI and provides all the necessary functionality to encode
 *  and decode paramaters to and results from methods, events
 *  and errors.
 *
 *  It also provides several convenience methods to automatically
 *  search and find matching transactions and events to parse them.
 *
 *  @_subsection api/abi:Interfaces  [interfaces]
 */
(undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
(undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};

exports.Result = abstractCoder.Result;
