var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Result_names, _Writer_instances, _Writer_data, _Writer_dataLength, _Writer_writeData, _Reader_instances, _Reader_data, _Reader_offset, _Reader_bytesRead, _Reader_parent, _Reader_maxInflation, _Reader_incrementBytesRead, _Reader_peekBytes;
import { defineProperties, concat, getBytesCopy, getNumber, hexlify, toBeArray, toBigInt, toNumber, assert, assertArgument } from "../utils/index.js";
/**
 * @_ignore:
 */
export const WordSize = 32;
const Padding = new Uint8Array(WordSize);
// Properties used to immediate pass through to the underlying object
// - `then` is used to detect if an object is a Promise for await
const passProperties = ["then"];
const _guard = {};
function throwError(name, error) {
    const wrapped = new Error(`deferred error during ABI decoding triggered accessing ${name}`);
    wrapped.error = error;
    throw wrapped;
}
/**
 *  A [[Result]] is a sub-class of Array, which allows accessing any
 *  of its values either positionally by its index or, if keys are
 *  provided by its name.
 *
 *  @_docloc: api/abi
 */
export class Result extends Array {
    /**
     *  @private
     */
    constructor(...args) {
        // To properly sub-class Array so the other built-in
        // functions work, the constructor has to behave fairly
        // well. So, in the event we are created via fromItems()
        // we build the read-only Result object we want, but on
        // any other input, we use the default constructor
        // constructor(guard: any, items: Array<any>, keys?: Array<null | string>);
        const guard = args[0];
        let items = args[1];
        let names = (args[2] || []).slice();
        let wrap = true;
        if (guard !== _guard) {
            items = args;
            names = [];
            wrap = false;
        }
        // Can't just pass in ...items since an array of length 1
        // is a special case in the super.
        super(items.length);
        _Result_names.set(this, void 0);
        items.forEach((item, index) => { this[index] = item; });
        // Find all unique keys
        const nameCounts = names.reduce((accum, name) => {
            if (typeof (name) === "string") {
                accum.set(name, (accum.get(name) || 0) + 1);
            }
            return accum;
        }, (new Map()));
        // Remove any key thats not unique
        __classPrivateFieldSet(this, _Result_names, Object.freeze(items.map((item, index) => {
            const name = names[index];
            if (name != null && nameCounts.get(name) === 1) {
                return name;
            }
            return null;
        })), "f");
        if (!wrap) {
            return;
        }
        // A wrapped Result is immutable
        Object.freeze(this);
        // Proxy indices and names so we can trap deferred errors
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (typeof (prop) === "string") {
                    // Index accessor
                    if (prop.match(/^[0-9]+$/)) {
                        const index = getNumber(prop, "%index");
                        if (index < 0 || index >= this.length) {
                            throw new RangeError("out of result range");
                        }
                        const item = target[index];
                        if (item instanceof Error) {
                            throwError(`index ${index}`, item);
                        }
                        return item;
                    }
                    // Pass important checks (like `then` for Promise) through
                    if (passProperties.indexOf(prop) >= 0) {
                        return Reflect.get(target, prop, receiver);
                    }
                    const value = target[prop];
                    if (value instanceof Function) {
                        // Make sure functions work with private variables
                        // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#no_private_property_forwarding
                        return function (...args) {
                            return value.apply((this === receiver) ? target : this, args);
                        };
                    }
                    else if (!(prop in target)) {
                        // Possible name accessor
                        return target.getValue.apply((this === receiver) ? target : this, [prop]);
                    }
                }
                return Reflect.get(target, prop, receiver);
            }
        });
    }
    /**
     *  Returns the Result as a normal Array.
     *
     *  This will throw if there are any outstanding deferred
     *  errors.
     */
    toArray() {
        const result = [];
        this.forEach((item, index) => {
            if (item instanceof Error) {
                throwError(`index ${index}`, item);
            }
            result.push(item);
        });
        return result;
    }
    /**
     *  Returns the Result as an Object with each name-value pair.
     *
     *  This will throw if any value is unnamed, or if there are
     *  any outstanding deferred errors.
     */
    toObject() {
        return __classPrivateFieldGet(this, _Result_names, "f").reduce((accum, name, index) => {
            assert(name != null, "value at index ${ index } unnamed", "UNSUPPORTED_OPERATION", {
                operation: "toObject()"
            });
            // Add values for names that don't conflict
            if (!(name in accum)) {
                accum[name] = this.getValue(name);
            }
            return accum;
        }, {});
    }
    /**
     *  @_ignore
     */
    slice(start, end) {
        if (start == null) {
            start = 0;
        }
        if (start < 0) {
            start += this.length;
            if (start < 0) {
                start = 0;
            }
        }
        if (end == null) {
            end = this.length;
        }
        if (end < 0) {
            end += this.length;
            if (end < 0) {
                end = 0;
            }
        }
        if (end > this.length) {
            end = this.length;
        }
        const result = [], names = [];
        for (let i = start; i < end; i++) {
            result.push(this[i]);
            names.push(__classPrivateFieldGet(this, _Result_names, "f")[i]);
        }
        return new Result(_guard, result, names);
    }
    /**
     *  @_ignore
     */
    filter(callback, thisArg) {
        const result = [], names = [];
        for (let i = 0; i < this.length; i++) {
            const item = this[i];
            if (item instanceof Error) {
                throwError(`index ${i}`, item);
            }
            if (callback.call(thisArg, item, i, this)) {
                result.push(item);
                names.push(__classPrivateFieldGet(this, _Result_names, "f")[i]);
            }
        }
        return new Result(_guard, result, names);
    }
    /**
     *  @_ignore
     */
    map(callback, thisArg) {
        const result = [];
        for (let i = 0; i < this.length; i++) {
            const item = this[i];
            if (item instanceof Error) {
                throwError(`index ${i}`, item);
            }
            result.push(callback.call(thisArg, item, i, this));
        }
        return result;
    }
    /**
     *  Returns the value for %%name%%.
     *
     *  Since it is possible to have a key whose name conflicts with
     *  a method on a [[Result]] or its superclass Array, or any
     *  JavaScript keyword, this ensures all named values are still
     *  accessible by name.
     */
    getValue(name) {
        const index = __classPrivateFieldGet(this, _Result_names, "f").indexOf(name);
        if (index === -1) {
            return undefined;
        }
        const value = this[index];
        if (value instanceof Error) {
            throwError(`property ${JSON.stringify(name)}`, value.error);
        }
        return value;
    }
    /**
     *  Creates a new [[Result]] for %%items%% with each entry
     *  also accessible by its corresponding name in %%keys%%.
     */
    static fromItems(items, keys) {
        return new Result(_guard, items, keys);
    }
}
_Result_names = new WeakMap();
/**
 *  Returns all errors found in a [[Result]].
 *
 *  Since certain errors encountered when creating a [[Result]] do
 *  not impact the ability to continue parsing data, they are
 *  deferred until they are actually accessed. Hence a faulty string
 *  in an Event that is never used does not impact the program flow.
 *
 *  However, sometimes it may be useful to access, identify or
 *  validate correctness of a [[Result]].
 *
 *  @_docloc api/abi
 */
export function checkResultErrors(result) {
    // Find the first error (if any)
    const errors = [];
    const checkErrors = function (path, object) {
        if (!Array.isArray(object)) {
            return;
        }
        for (let key in object) {
            const childPath = path.slice();
            childPath.push(key);
            try {
                checkErrors(childPath, object[key]);
            }
            catch (error) {
                errors.push({ path: childPath, error: error });
            }
        }
    };
    checkErrors([], result);
    return errors;
}
function getValue(value) {
    let bytes = toBeArray(value);
    assert(bytes.length <= WordSize, "value out-of-bounds", "BUFFER_OVERRUN", { buffer: bytes, length: WordSize, offset: bytes.length });
    if (bytes.length !== WordSize) {
        bytes = getBytesCopy(concat([Padding.slice(bytes.length % WordSize), bytes]));
    }
    return bytes;
}
/**
 *  @_ignore
 */
export class Coder {
    constructor(name, type, localName, dynamic) {
        defineProperties(this, { name, type, localName, dynamic }, {
            name: "string", type: "string", localName: "string", dynamic: "boolean"
        });
    }
    _throwError(message, value) {
        assertArgument(false, message, this.localName, value);
    }
}
/**
 *  @_ignore
 */
export class Writer {
    constructor() {
        _Writer_instances.add(this);
        // An array of WordSize lengthed objects to concatenation
        _Writer_data.set(this, void 0);
        _Writer_dataLength.set(this, void 0);
        __classPrivateFieldSet(this, _Writer_data, [], "f");
        __classPrivateFieldSet(this, _Writer_dataLength, 0, "f");
    }
    get data() {
        return concat(__classPrivateFieldGet(this, _Writer_data, "f"));
    }
    get length() { return __classPrivateFieldGet(this, _Writer_dataLength, "f"); }
    appendWriter(writer) {
        return __classPrivateFieldGet(this, _Writer_instances, "m", _Writer_writeData).call(this, getBytesCopy(writer.data));
    }
    // Arrayish item; pad on the right to *nearest* WordSize
    writeBytes(value) {
        let bytes = getBytesCopy(value);
        const paddingOffset = bytes.length % WordSize;
        if (paddingOffset) {
            bytes = getBytesCopy(concat([bytes, Padding.slice(paddingOffset)]));
        }
        return __classPrivateFieldGet(this, _Writer_instances, "m", _Writer_writeData).call(this, bytes);
    }
    // Numeric item; pad on the left *to* WordSize
    writeValue(value) {
        return __classPrivateFieldGet(this, _Writer_instances, "m", _Writer_writeData).call(this, getValue(value));
    }
    // Inserts a numeric place-holder, returning a callback that can
    // be used to asjust the value later
    writeUpdatableValue() {
        const offset = __classPrivateFieldGet(this, _Writer_data, "f").length;
        __classPrivateFieldGet(this, _Writer_data, "f").push(Padding);
        __classPrivateFieldSet(this, _Writer_dataLength, __classPrivateFieldGet(this, _Writer_dataLength, "f") + WordSize, "f");
        return (value) => {
            __classPrivateFieldGet(this, _Writer_data, "f")[offset] = getValue(value);
        };
    }
}
_Writer_data = new WeakMap(), _Writer_dataLength = new WeakMap(), _Writer_instances = new WeakSet(), _Writer_writeData = function _Writer_writeData(data) {
    __classPrivateFieldGet(this, _Writer_data, "f").push(data);
    __classPrivateFieldSet(this, _Writer_dataLength, __classPrivateFieldGet(this, _Writer_dataLength, "f") + data.length, "f");
    return data.length;
};
/**
 *  @_ignore
 */
export class Reader {
    constructor(data, allowLoose, maxInflation) {
        _Reader_instances.add(this);
        _Reader_data.set(this, void 0);
        _Reader_offset.set(this, void 0);
        _Reader_bytesRead.set(this, void 0);
        _Reader_parent.set(this, void 0);
        _Reader_maxInflation.set(this, void 0);
        defineProperties(this, { allowLoose: !!allowLoose });
        __classPrivateFieldSet(this, _Reader_data, getBytesCopy(data), "f");
        __classPrivateFieldSet(this, _Reader_bytesRead, 0, "f");
        __classPrivateFieldSet(this, _Reader_parent, null, "f");
        __classPrivateFieldSet(this, _Reader_maxInflation, (maxInflation != null) ? maxInflation : 1024, "f");
        __classPrivateFieldSet(this, _Reader_offset, 0, "f");
    }
    get data() { return hexlify(__classPrivateFieldGet(this, _Reader_data, "f")); }
    get dataLength() { return __classPrivateFieldGet(this, _Reader_data, "f").length; }
    get consumed() { return __classPrivateFieldGet(this, _Reader_offset, "f"); }
    get bytes() { return new Uint8Array(__classPrivateFieldGet(this, _Reader_data, "f")); }
    // Create a sub-reader with the same underlying data, but offset
    subReader(offset) {
        const reader = new Reader(__classPrivateFieldGet(this, _Reader_data, "f").slice(__classPrivateFieldGet(this, _Reader_offset, "f") + offset), this.allowLoose, __classPrivateFieldGet(this, _Reader_maxInflation, "f"));
        __classPrivateFieldSet(reader, _Reader_parent, this, "f");
        return reader;
    }
    // Read bytes
    readBytes(length, loose) {
        let bytes = __classPrivateFieldGet(this, _Reader_instances, "m", _Reader_peekBytes).call(this, 0, length, !!loose);
        __classPrivateFieldGet(this, _Reader_instances, "m", _Reader_incrementBytesRead).call(this, length);
        __classPrivateFieldSet(this, _Reader_offset, __classPrivateFieldGet(this, _Reader_offset, "f") + bytes.length, "f");
        // @TODO: Make sure the length..end bytes are all 0?
        return bytes.slice(0, length);
    }
    // Read a numeric values
    readValue() {
        return toBigInt(this.readBytes(WordSize));
    }
    readIndex() {
        return toNumber(this.readBytes(WordSize));
    }
}
_Reader_data = new WeakMap(), _Reader_offset = new WeakMap(), _Reader_bytesRead = new WeakMap(), _Reader_parent = new WeakMap(), _Reader_maxInflation = new WeakMap(), _Reader_instances = new WeakSet(), _Reader_incrementBytesRead = function _Reader_incrementBytesRead(count) {
    var _a;
    if (__classPrivateFieldGet(this, _Reader_parent, "f")) {
        return __classPrivateFieldGet((_a = __classPrivateFieldGet(this, _Reader_parent, "f")), _Reader_instances, "m", _Reader_incrementBytesRead).call(_a, count);
    }
    __classPrivateFieldSet(this, _Reader_bytesRead, __classPrivateFieldGet(this, _Reader_bytesRead, "f") + count, "f");
    // Check for excessive inflation (see: #4537)
    assert(__classPrivateFieldGet(this, _Reader_maxInflation, "f") < 1 || __classPrivateFieldGet(this, _Reader_bytesRead, "f") <= __classPrivateFieldGet(this, _Reader_maxInflation, "f") * this.dataLength, `compressed ABI data exceeds inflation ratio of ${__classPrivateFieldGet(this, _Reader_maxInflation, "f")} ( see: https:/\/github.com/ethers-io/ethers.js/issues/4537 )`, "BUFFER_OVERRUN", {
        buffer: getBytesCopy(__classPrivateFieldGet(this, _Reader_data, "f")), offset: __classPrivateFieldGet(this, _Reader_offset, "f"),
        length: count, info: {
            bytesRead: __classPrivateFieldGet(this, _Reader_bytesRead, "f"),
            dataLength: this.dataLength
        }
    });
}, _Reader_peekBytes = function _Reader_peekBytes(offset, length, loose) {
    let alignedLength = Math.ceil(length / WordSize) * WordSize;
    if (__classPrivateFieldGet(this, _Reader_offset, "f") + alignedLength > __classPrivateFieldGet(this, _Reader_data, "f").length) {
        if (this.allowLoose && loose && __classPrivateFieldGet(this, _Reader_offset, "f") + length <= __classPrivateFieldGet(this, _Reader_data, "f").length) {
            alignedLength = length;
        }
        else {
            assert(false, "data out-of-bounds", "BUFFER_OVERRUN", {
                buffer: getBytesCopy(__classPrivateFieldGet(this, _Reader_data, "f")),
                length: __classPrivateFieldGet(this, _Reader_data, "f").length,
                offset: __classPrivateFieldGet(this, _Reader_offset, "f") + alignedLength
            });
        }
    }
    return __classPrivateFieldGet(this, _Reader_data, "f").slice(__classPrivateFieldGet(this, _Reader_offset, "f"), __classPrivateFieldGet(this, _Reader_offset, "f") + alignedLength);
};
