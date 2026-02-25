'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../utils/base58.js');
var errors = require('../utils/errors.js');
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
var anonymous = require('./anonymous.js');

// ----------------------------------------------------------------------------
/**
 *  @_ignore
 */
function pack(writer, coders, values) {
    let arrayValues = [];
    if (Array.isArray(values)) {
        arrayValues = values;
    }
    else if (values && typeof (values) === "object") {
        let unique = {};
        arrayValues = coders.map((coder) => {
            const name = coder.localName;
            errors.assert(name, "cannot encode object for signature with missing names", "INVALID_ARGUMENT", { argument: "values", info: { coder }, value: values });
            errors.assert(!unique[name], "cannot encode object for signature with duplicate names", "INVALID_ARGUMENT", { argument: "values", info: { coder }, value: values });
            unique[name] = true;
            return values[name];
        });
    }
    else {
        errors.assertArgument(false, "invalid tuple value", "tuple", values);
    }
    errors.assertArgument(coders.length === arrayValues.length, "types/value length mismatch", "tuple", values);
    let staticWriter = new abstractCoder.Writer();
    let dynamicWriter = new abstractCoder.Writer();
    let updateFuncs = [];
    coders.forEach((coder, index) => {
        let value = arrayValues[index];
        if (coder.dynamic) {
            // Get current dynamic offset (for the future pointer)
            let dynamicOffset = dynamicWriter.length;
            // Encode the dynamic value into the dynamicWriter
            coder.encode(dynamicWriter, value);
            // Prepare to populate the correct offset once we are done
            let updateFunc = staticWriter.writeUpdatableValue();
            updateFuncs.push((baseOffset) => {
                updateFunc(baseOffset + dynamicOffset);
            });
        }
        else {
            coder.encode(staticWriter, value);
        }
    });
    // Backfill all the dynamic offsets, now that we know the static length
    updateFuncs.forEach((func) => { func(staticWriter.length); });
    let length = writer.appendWriter(staticWriter);
    length += writer.appendWriter(dynamicWriter);
    return length;
}
/**
 *  @_ignore
 */
function unpack(reader, coders) {
    let values = [];
    let keys = [];
    // A reader anchored to this base
    let baseReader = reader.subReader(0);
    coders.forEach((coder) => {
        let value = null;
        if (coder.dynamic) {
            let offset = reader.readIndex();
            let offsetReader = baseReader.subReader(offset);
            try {
                value = coder.decode(offsetReader);
            }
            catch (error) {
                // Cannot recover from this
                if (errors.isError(error, "BUFFER_OVERRUN")) {
                    throw error;
                }
                value = error;
                value.baseType = coder.name;
                value.name = coder.localName;
                value.type = coder.type;
            }
        }
        else {
            try {
                value = coder.decode(reader);
            }
            catch (error) {
                // Cannot recover from this
                if (errors.isError(error, "BUFFER_OVERRUN")) {
                    throw error;
                }
                value = error;
                value.baseType = coder.name;
                value.name = coder.localName;
                value.type = coder.type;
            }
        }
        if (value == undefined) {
            throw new Error("investigate");
        }
        values.push(value);
        keys.push(coder.localName || null);
    });
    return abstractCoder.Result.fromItems(values, keys);
}
/**
 *  @_ignore
 */
class ArrayCoder extends abstractCoder.Coder {
    constructor(coder, length, localName) {
        const type = (coder.type + "[" + (length >= 0 ? length : "") + "]");
        const dynamic = (length === -1 || coder.dynamic);
        super("array", type, localName, dynamic);
        properties.defineProperties(this, { coder, length });
    }
    defaultValue() {
        // Verifies the child coder is valid (even if the array is dynamic or 0-length)
        const defaultChild = this.coder.defaultValue();
        const result = [];
        for (let i = 0; i < this.length; i++) {
            result.push(defaultChild);
        }
        return result;
    }
    encode(writer, _value) {
        const value = typed.Typed.dereference(_value, "array");
        if (!Array.isArray(value)) {
            this._throwError("expected array value", value);
        }
        let count = this.length;
        if (count === -1) {
            count = value.length;
            writer.writeValue(value.length);
        }
        errors.assertArgumentCount(value.length, count, "coder array" + (this.localName ? (" " + this.localName) : ""));
        let coders = [];
        for (let i = 0; i < value.length; i++) {
            coders.push(this.coder);
        }
        return pack(writer, coders, value);
    }
    decode(reader) {
        let count = this.length;
        if (count === -1) {
            count = reader.readIndex();
            // Check that there is *roughly* enough data to ensure
            // stray random data is not being read as a length. Each
            // slot requires at least 32 bytes for their value (or 32
            // bytes as a link to the data). This could use a much
            // tighter bound, but we are erroring on the side of safety.
            errors.assert(count * abstractCoder.WordSize <= reader.dataLength, "insufficient data length", "BUFFER_OVERRUN", { buffer: reader.bytes, offset: count * abstractCoder.WordSize, length: reader.dataLength });
        }
        let coders = [];
        for (let i = 0; i < count; i++) {
            coders.push(new anonymous.AnonymousCoder(this.coder));
        }
        return unpack(reader, coders);
    }
}

exports.ArrayCoder = ArrayCoder;
exports.pack = pack;
exports.unpack = unpack;
