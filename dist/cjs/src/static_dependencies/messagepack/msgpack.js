'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// (function () {
// 	"use strict";
// Serializes a value to a MessagePack byte array.
//
// data: The value to serialize. This can be a scalar, array or object.
// options: An object that defines additional options.
// - multiple: (boolean) Indicates whether multiple values in data are concatenated to multiple MessagePack arrays. Default: false.
// - invalidTypeReplacement:
//   (any) The value that is used to replace values of unsupported types.
//   (function) A function that returns such a value, given the original value as parameter.
function serialize(data, options) {
    if (options && options.multiple && !Array.isArray(data)) {
        throw new Error("Invalid argument type: Expected an Array to serialize multiple values.");
    }
    const pow32 = 0x100000000; // 2^32
    let floatBuffer, floatView;
    let array = new Uint8Array(128);
    let length = 0;
    if (options && options.multiple) {
        for (let i = 0; i < data.length; i++) {
            append(data[i]);
        }
    }
    else {
        append(data);
    }
    return array.subarray(0, length);
    function append(data, isReplacement) {
        switch (typeof data) {
            case "undefined":
                appendNull();
                break;
            case "boolean":
                appendBoolean(data);
                break;
            case "number":
                appendNumber(data);
                break;
            case "string":
                appendString(data);
                break;
            case "object":
                if (data === null)
                    appendNull();
                else if (data instanceof Date)
                    appendDate(data);
                else if (Array.isArray(data))
                    appendArray(data);
                else if (data instanceof Uint8Array || data instanceof Uint8ClampedArray)
                    appendBinArray(data);
                else if (data instanceof Int8Array || data instanceof Int16Array || data instanceof Uint16Array ||
                    data instanceof Int32Array || data instanceof Uint32Array ||
                    data instanceof Float32Array || data instanceof Float64Array)
                    appendArray(data);
                else
                    appendObject(data);
                break;
            default:
                if (!isReplacement && options && options.invalidTypeReplacement) {
                    if (typeof options.invalidTypeReplacement === "function")
                        append(options.invalidTypeReplacement(data), true);
                    else
                        append(options.invalidTypeReplacement, true);
                }
                else {
                    throw new Error("Invalid argument type: The type '" + (typeof data) + "' cannot be serialized.");
                }
        }
    }
    function appendNull(data) {
        appendByte(0xc0);
    }
    function appendBoolean(data) {
        appendByte(data ? 0xc3 : 0xc2);
    }
    function appendNumber(data) {
        if (isFinite(data) && Math.floor(data) === data) {
            // Integer
            if (data >= 0 && data <= 0x7f) {
                appendByte(data);
            }
            else if (data < 0 && data >= -0x20) {
                appendByte(data);
            }
            else if (data > 0 && data <= 0xff) { // uint8
                appendBytes([0xcc, data]);
            }
            else if (data >= -0x80 && data <= 0x7f) { // int8
                appendBytes([0xd0, data]);
            }
            else if (data > 0 && data <= 0xffff) { // uint16
                appendBytes([0xcd, data >>> 8, data]);
            }
            else if (data >= -0x8000 && data <= 0x7fff) { // int16
                appendBytes([0xd1, data >>> 8, data]);
            }
            else if (data > 0 && data <= 0xffffffff) { // uint32
                appendBytes([0xce, data >>> 24, data >>> 16, data >>> 8, data]);
            }
            else if (data >= -0x80000000 && data <= 0x7fffffff) { // int32
                appendBytes([0xd2, data >>> 24, data >>> 16, data >>> 8, data]);
            }
            else if (data > 0 && data <= 0xffffffffffffffff) { // uint64
                // Split 64 bit number into two 32 bit numbers because JavaScript only regards
                // 32 bits for bitwise operations.
                let hi = data / pow32;
                let lo = data % pow32;
                appendBytes([0xcf, hi >>> 24, hi >>> 16, hi >>> 8, hi, lo >>> 24, lo >>> 16, lo >>> 8, lo]);
            }
            else if (data >= -0x8000000000000000 && data <= 0x7fffffffffffffff) { // int64
                appendByte(0xd3);
                appendInt64(data);
            }
            else if (data < 0) { // below int64
                appendBytes([0xd3, 0x80, 0, 0, 0, 0, 0, 0, 0]);
            }
            else { // above uint64
                appendBytes([0xcf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
            }
        }
        else {
            // Float
            if (!floatView) {
                floatBuffer = new ArrayBuffer(8);
                floatView = new DataView(floatBuffer);
            }
            floatView.setFloat64(0, data);
            appendByte(0xcb);
            appendBytes(new Uint8Array(floatBuffer));
        }
    }
    function appendString(data) {
        let bytes = encodeUtf8(data);
        let length = bytes.length;
        if (length <= 0x1f)
            appendByte(0xa0 + length);
        else if (length <= 0xff)
            appendBytes([0xd9, length]);
        else if (length <= 0xffff)
            appendBytes([0xda, length >>> 8, length]);
        else
            appendBytes([0xdb, length >>> 24, length >>> 16, length >>> 8, length]);
        appendBytes(bytes);
    }
    function appendArray(data) {
        let length = data.length;
        if (length <= 0xf)
            appendByte(0x90 + length);
        else if (length <= 0xffff)
            appendBytes([0xdc, length >>> 8, length]);
        else
            appendBytes([0xdd, length >>> 24, length >>> 16, length >>> 8, length]);
        for (let index = 0; index < length; index++) {
            append(data[index]);
        }
    }
    function appendBinArray(data) {
        let length = data.length;
        if (length <= 0xf)
            appendBytes([0xc4, length]);
        else if (length <= 0xffff)
            appendBytes([0xc5, length >>> 8, length]);
        else
            appendBytes([0xc6, length >>> 24, length >>> 16, length >>> 8, length]);
        appendBytes(data);
    }
    function appendObject(data) {
        let length = 0;
        for (let key in data) {
            if (data[key] !== undefined) {
                length++;
            }
        }
        if (length <= 0xf)
            appendByte(0x80 + length);
        else if (length <= 0xffff)
            appendBytes([0xde, length >>> 8, length]);
        else
            appendBytes([0xdf, length >>> 24, length >>> 16, length >>> 8, length]);
        for (let key in data) {
            let value = data[key];
            if (value !== undefined) {
                append(key);
                append(value);
            }
        }
    }
    function appendDate(data) {
        let sec = data.getTime() / 1000;
        if (data.getMilliseconds() === 0 && sec >= 0 && sec < 0x100000000) { // 32 bit seconds
            appendBytes([0xd6, 0xff, sec >>> 24, sec >>> 16, sec >>> 8, sec]);
        }
        else if (sec >= 0 && sec < 0x400000000) { // 30 bit nanoseconds, 34 bit seconds
            let ns = data.getMilliseconds() * 1000000;
            appendBytes([0xd7, 0xff, ns >>> 22, ns >>> 14, ns >>> 6, ((ns << 2) >>> 0) | (sec / pow32), sec >>> 24, sec >>> 16, sec >>> 8, sec]);
        }
        else { // 32 bit nanoseconds, 64 bit seconds, negative values allowed
            let ns = data.getMilliseconds() * 1000000;
            appendBytes([0xc7, 12, 0xff, ns >>> 24, ns >>> 16, ns >>> 8, ns]);
            appendInt64(sec);
        }
    }
    function appendByte(byte) {
        if (array.length < length + 1) {
            let newLength = array.length * 2;
            while (newLength < length + 1)
                newLength *= 2;
            let newArray = new Uint8Array(newLength);
            newArray.set(array);
            array = newArray;
        }
        array[length] = byte;
        length++;
    }
    function appendBytes(bytes) {
        if (array.length < length + bytes.length) {
            let newLength = array.length * 2;
            while (newLength < length + bytes.length)
                newLength *= 2;
            let newArray = new Uint8Array(newLength);
            newArray.set(array);
            array = newArray;
        }
        array.set(bytes, length);
        length += bytes.length;
    }
    function appendInt64(value) {
        // Split 64 bit number into two 32 bit numbers because JavaScript only regards 32 bits for
        // bitwise operations.
        let hi, lo;
        if (value >= 0) {
            // Same as uint64
            hi = value / pow32;
            lo = value % pow32;
        }
        else {
            // Split absolute value to high and low, then NOT and ADD(1) to restore negativity
            value++;
            hi = Math.abs(value) / pow32;
            lo = Math.abs(value) % pow32;
            hi = ~hi;
            lo = ~lo;
        }
        appendBytes([hi >>> 24, hi >>> 16, hi >>> 8, hi, lo >>> 24, lo >>> 16, lo >>> 8, lo]);
    }
}
// Encodes a string to UTF-8 bytes.
function encodeUtf8(str) {
    // Prevent excessive array allocation and slicing for all 7-bit characters
    let ascii = true, length = str.length;
    for (let x = 0; x < length; x++) {
        if (str.charCodeAt(x) > 127) {
            ascii = false;
            break;
        }
    }
    // Based on: https://gist.github.com/pascaldekloe/62546103a1576803dade9269ccf76330
    let i = 0, bytes = new Uint8Array(str.length * (ascii ? 1 : 4));
    for (let ci = 0; ci !== length; ci++) {
        let c = str.charCodeAt(ci);
        if (c < 128) {
            bytes[i++] = c;
            continue;
        }
        if (c < 2048) {
            bytes[i++] = c >> 6 | 192;
        }
        else {
            if (c > 0xd7ff && c < 0xdc00) {
                if (++ci >= length)
                    throw new Error("UTF-8 encode: incomplete surrogate pair");
                let c2 = str.charCodeAt(ci);
                if (c2 < 0xdc00 || c2 > 0xdfff)
                    throw new Error("UTF-8 encode: second surrogate character 0x" + c2.toString(16) + " at index " + ci + " out of range");
                c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
                bytes[i++] = c >> 18 | 240;
                bytes[i++] = c >> 12 & 63 | 128;
            }
            else
                bytes[i++] = c >> 12 | 224;
            bytes[i++] = c >> 6 & 63 | 128;
        }
        bytes[i++] = c & 63 | 128;
    }
    return ascii ? bytes : bytes.subarray(0, i);
}

exports.serialize = serialize;
