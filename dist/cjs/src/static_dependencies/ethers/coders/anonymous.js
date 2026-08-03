'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var abstractCoder = require('./abstract-coder.js');

// ----------------------------------------------------------------------------
/**
 *  Clones the functionality of an existing Coder, but without a localName
 *
 *  @_ignore
 */
class AnonymousCoder extends abstractCoder.Coder {
    constructor(coder) {
        super(coder.name, coder.type, "_", coder.dynamic);
        this.coder = coder;
    }
    defaultValue() {
        return this.coder.defaultValue();
    }
    encode(writer, value) {
        return this.coder.encode(writer, value);
    }
    decode(reader) {
        return this.coder.decode(reader);
    }
}

exports.AnonymousCoder = AnonymousCoder;
