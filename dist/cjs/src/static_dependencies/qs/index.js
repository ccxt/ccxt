'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var stringify = require('./stringify.js');
var parse = require('./parse.js');
var formats$1 = require('./formats.js');

// ----------------------------------------------------------------------------
var formats = {
    default: formats$1["default"],
    formatters: formats$1.formatters,
    RFC1738: formats$1.RFC1738,
    RFC3986: formats$1.RFC3986
};
var qs = {
    formats: formats,
    parse: parse["default"],
    stringify: stringify["default"]
};

exports.stringify = stringify["default"];
exports.parse = parse["default"];
exports["default"] = qs;
exports.formats = formats;
