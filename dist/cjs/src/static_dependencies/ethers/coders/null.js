'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var abstractCoder = require('./abstract-coder.js');

const Empty = new Uint8Array([]);
/**
 *  @_ignore
 */
class NullCoder extends abstractCoder.Coder {
    constructor(localName) {
        super("null", "", localName, false);
    }
    defaultValue() {
        return null;
    }
    encode(writer, value) {
        if (value != null) {
            this._throwError("not null", value);
        }
        return writer.writeBytes(Empty);
    }
    decode(reader) {
        reader.readBytes(0);
        return null;
    }
}

exports.NullCoder = NullCoder;
