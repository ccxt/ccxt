'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../utils/base58.js');
var data = require('../utils/data.js');
require('../utils/errors.js');
require('../utils/events.js');
require('../utils/fixednumber.js');
require('../utils/maths.js');
var properties = require('../utils/properties.js');
require('../utils/utf8.js');
require('../../../base/functions/platform.js');
require('../../../base/functions/encode.js');
require('../../../base/functions/crypto.js');
require('../../noble-hashes/sha3.js');
require('../../noble-hashes/sha256.js');
var typed = require('../typed.js');
var abstractCoder = require('./abstract-coder.js');

/**
 *  @_ignore
 */
class FixedBytesCoder extends abstractCoder.Coder {
    constructor(size, localName) {
        let name = "bytes" + String(size);
        super(name, name, localName, false);
        properties.defineProperties(this, { size }, { size: "number" });
    }
    defaultValue() {
        return ("0x0000000000000000000000000000000000000000000000000000000000000000").substring(0, 2 + this.size * 2);
    }
    encode(writer, _value) {
        let data$1 = data.getBytesCopy(typed.Typed.dereference(_value, this.type));
        if (data$1.length !== this.size) {
            this._throwError("incorrect data length", _value);
        }
        return writer.writeBytes(data$1);
    }
    decode(reader) {
        return data.hexlify(reader.readBytes(this.size));
    }
}

exports.FixedBytesCoder = FixedBytesCoder;
