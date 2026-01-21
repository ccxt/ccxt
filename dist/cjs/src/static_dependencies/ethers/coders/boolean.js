'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var typed = require('../typed.js');
var abstractCoder = require('./abstract-coder.js');

// ----------------------------------------------------------------------------
/**
 *  @_ignore
 */
class BooleanCoder extends abstractCoder.Coder {
    constructor(localName) {
        super("bool", "bool", localName, false);
    }
    defaultValue() {
        return false;
    }
    encode(writer, _value) {
        const value = typed.Typed.dereference(_value, "bool");
        return writer.writeValue(value ? 1 : 0);
    }
    decode(reader) {
        return !!reader.readValue();
    }
}

exports.BooleanCoder = BooleanCoder;
