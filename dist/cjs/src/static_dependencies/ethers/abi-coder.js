'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./utils/base58.js');
var errors = require('./utils/errors.js');
require('./utils/fixednumber.js');
require('./utils/maths.js');
require('./utils/utf8.js');
require('../../base/functions/platform.js');
require('../../base/functions/encode.js');
require('../../base/functions/crypto.js');
require('../../base/functions/io.js');
require('@noble/hashes/sha3.js');
require('@noble/hashes/sha2.js');
var abstractCoder = require('./coders/abstract-coder.js');
var address = require('./coders/address.js');
var array = require('./coders/array.js');
var boolean = require('./coders/boolean.js');
var bytes = require('./coders/bytes.js');
var fixedBytes = require('./coders/fixed-bytes.js');
var _null = require('./coders/null.js');
var number = require('./coders/number.js');
var string = require('./coders/string.js');
var tuple = require('./coders/tuple.js');
var fragments = require('./fragments.js');

// ----------------------------------------------------------------------------
// https://docs.soliditylang.org/en/v0.8.17/control-structures.html
const PanicReasons = new Map();
PanicReasons.set(0x00, "GENERIC_PANIC");
PanicReasons.set(0x01, "ASSERT_FALSE");
PanicReasons.set(0x11, "OVERFLOW");
PanicReasons.set(0x12, "DIVIDE_BY_ZERO");
PanicReasons.set(0x21, "ENUM_RANGE_ERROR");
PanicReasons.set(0x22, "BAD_STORAGE_DATA");
PanicReasons.set(0x31, "STACK_UNDERFLOW");
PanicReasons.set(0x32, "ARRAY_RANGE_ERROR");
PanicReasons.set(0x41, "OUT_OF_MEMORY");
PanicReasons.set(0x51, "UNINITIALIZED_FUNCTION_CALL");
const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
let defaultCoder = null;
let defaultMaxInflation = 1024;
/**
 *  The **AbiCoder** is a low-level class responsible for encoding JavaScript
 *  values into binary data and decoding binary data into JavaScript values.
 */
class AbiCoder {
    #getCoder(param) {
        if (param.isArray()) {
            return new array.ArrayCoder(this.#getCoder(param.arrayChildren), param.arrayLength, param.name);
        }
        if (param.isTuple()) {
            return new tuple.TupleCoder(param.components.map((c) => this.#getCoder(c)), param.name);
        }
        switch (param.baseType) {
            case "address":
                return new address.AddressCoder(param.name);
            case "bool":
                return new boolean.BooleanCoder(param.name);
            case "string":
                return new string.StringCoder(param.name);
            case "bytes":
                return new bytes.BytesCoder(param.name);
            case "":
                return new _null.NullCoder(param.name);
        }
        // u?int[0-9]*
        let match = param.type.match(paramTypeNumber);
        if (match) {
            let size = parseInt(match[2] || "256");
            errors.assertArgument(size !== 0 && size <= 256 && (size % 8) === 0, "invalid " + match[1] + " bit length", "param", param);
            return new number.NumberCoder(size / 8, (match[1] === "int"), param.name);
        }
        // bytes[0-9]+
        match = param.type.match(paramTypeBytes);
        if (match) {
            let size = parseInt(match[1]);
            errors.assertArgument(size !== 0 && size <= 32, "invalid bytes length", "param", param);
            return new fixedBytes.FixedBytesCoder(size, param.name);
        }
        errors.assertArgument(false, "invalid type", "type", param.type);
    }
    /**
     *  Get the default values for the given %%types%%.
     *
     *  For example, a ``uint`` is by default ``0`` and ``bool``
     *  is by default ``false``.
     */
    getDefaultValue(types) {
        const coders = types.map((type) => this.#getCoder(fragments.ParamType.from(type)));
        const coder = new tuple.TupleCoder(coders, "_");
        return coder.defaultValue();
    }
    /**
     *  Encode the %%values%% as the %%types%% into ABI data.
     *
     *  @returns DataHexstring
     */
    encode(types, values) {
        errors.assertArgumentCount(values.length, types.length, "types/values length mismatch");
        const coders = types.map((type) => this.#getCoder(fragments.ParamType.from(type)));
        const coder = (new tuple.TupleCoder(coders, "_"));
        const writer = new abstractCoder.Writer();
        coder.encode(writer, values);
        return writer.data;
    }
    /**
     *  Decode the ABI %%data%% as the %%types%% into values.
     *
     *  If %%loose%% decoding is enabled, then strict padding is
     *  not enforced. Some older versions of Solidity incorrectly
     *  padded event data emitted from ``external`` functions.
     */
    decode(types, data, loose) {
        const coders = types.map((type) => this.#getCoder(fragments.ParamType.from(type)));
        const coder = new tuple.TupleCoder(coders, "_");
        return coder.decode(new abstractCoder.Reader(data, loose, defaultMaxInflation));
    }
    static _setDefaultMaxInflation(value) {
        errors.assertArgument(typeof (value) === "number" && Number.isInteger(value), "invalid defaultMaxInflation factor", "value", value);
        defaultMaxInflation = value;
    }
    /**
     *  Returns the shared singleton instance of a default [[AbiCoder]].
     *
     *  On the first call, the instance is created internally.
     */
    static defaultAbiCoder() {
        if (defaultCoder == null) {
            defaultCoder = new AbiCoder();
        }
        return defaultCoder;
    }
}

exports.AbiCoder = AbiCoder;
