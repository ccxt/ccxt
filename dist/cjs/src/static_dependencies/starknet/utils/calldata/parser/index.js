'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cairo = require('../cairo.js');
var parser01_1_0 = require('./parser-0-1.1.0.js');
var parser2_0_0 = require('./parser-2.0.0.js');

function createAbiParser(abi) {
    const version = getAbiVersion(abi);
    if (version === 0 || version === 1) {
        return new parser01_1_0.AbiParser1(abi);
    }
    if (version === 2) {
        return new parser2_0_0.AbiParser2(abi);
    }
    throw Error(`Unsupported ABI version ${version}`);
}
function getAbiVersion(abi) {
    if (abi.find((it) => it.type === 'interface'))
        return 2;
    if (cairo.isCairo1Abi(abi))
        return 1;
    return 0;
}
function isNoConstructorValid(method, argsCalldata, abiMethod) {
    // No constructor in abi and validly empty args
    return method === 'constructor' && !abiMethod && !argsCalldata.length;
}

exports.createAbiParser = createAbiParser;
exports.getAbiVersion = getAbiVersion;
exports.isNoConstructorValid = isNoConstructorValid;
