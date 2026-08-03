'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var properties = require('../utils/properties.js');
var typed = require('../typed.js');
var abstractCoder = require('./abstract-coder.js');
var array = require('./array.js');

/**
 *  @_ignore
 */
class TupleCoder extends abstractCoder.Coder {
    constructor(coders, localName) {
        let dynamic = false;
        const types = [];
        coders.forEach((coder) => {
            if (coder.dynamic) {
                dynamic = true;
            }
            types.push(coder.type);
        });
        const type = ("tuple(" + types.join(",") + ")");
        super("tuple", type, localName, dynamic);
        properties.defineProperties(this, { coders: Object.freeze(coders.slice()) });
    }
    defaultValue() {
        const values = [];
        this.coders.forEach((coder) => {
            values.push(coder.defaultValue());
        });
        // We only output named properties for uniquely named coders
        const uniqueNames = this.coders.reduce((accum, coder) => {
            const name = coder.localName;
            if (name) {
                if (!accum[name]) {
                    accum[name] = 0;
                }
                accum[name]++;
            }
            return accum;
        }, {});
        // Add named values
        this.coders.forEach((coder, index) => {
            let name = coder.localName;
            if (!name || uniqueNames[name] !== 1) {
                return;
            }
            if (name === "length") {
                name = "_length";
            }
            if (values[name] != null) {
                return;
            }
            values[name] = values[index];
        });
        return Object.freeze(values);
    }
    encode(writer, _value) {
        const value = typed.Typed.dereference(_value, "tuple");
        return array.pack(writer, this.coders, value);
    }
    decode(reader) {
        return array.unpack(reader, this.coders);
    }
}

exports.TupleCoder = TupleCoder;
