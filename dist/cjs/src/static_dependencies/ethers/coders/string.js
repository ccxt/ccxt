'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utf8 = require('../utils/utf8.js');
var typed = require('../typed.js');
var bytes = require('./bytes.js');

// ----------------------------------------------------------------------------
/**
 *  @_ignore
 */
class StringCoder extends bytes.DynamicBytesCoder {
    constructor(localName) {
        super("string", localName);
    }
    defaultValue() {
        return "";
    }
    encode(writer, _value) {
        return super.encode(writer, utf8.toUtf8Bytes(typed.Typed.dereference(_value, "string")));
    }
    decode(reader) {
        return utf8.toUtf8String(super.decode(reader));
    }
}

exports.StringCoder = StringCoder;
