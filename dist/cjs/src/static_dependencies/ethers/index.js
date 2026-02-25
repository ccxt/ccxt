'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var abiCoder = require('./abi-coder.js');
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
var fragments = require('./fragments.js');
require('./interface.js');
var typed = require('./typed.js');

// ----------------------------------------------------------------------------
var ethers = abiCoder.AbiCoder.defaultAbiCoder();

exports.ParamType = fragments.ParamType;
exports.Typed = typed.Typed;
exports["default"] = ethers;
