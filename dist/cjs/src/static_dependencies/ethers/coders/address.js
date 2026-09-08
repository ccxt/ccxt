'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var address = require('../address/address.js');
var maths = require('../utils/maths.js');
var typed = require('../typed.js');
var abstractCoder = require('./abstract-coder.js');

// ----------------------------------------------------------------------------
/**
 *  @_ignore
 */
class AddressCoder extends abstractCoder.Coder {
    constructor(localName) {
        super("address", "address", localName, false);
    }
    defaultValue() {
        return "0x0000000000000000000000000000000000000000";
    }
    encode(writer, _value) {
        let value = typed.Typed.dereference(_value, "string");
        try {
            value = address.getAddress(value);
        }
        catch (error) {
            return this._throwError(error.message, _value);
        }
        return writer.writeValue(value);
    }
    decode(reader) {
        return address.getAddress(maths.toBeHex(reader.readValue(), 20));
    }
}

exports.AddressCoder = AddressCoder;
