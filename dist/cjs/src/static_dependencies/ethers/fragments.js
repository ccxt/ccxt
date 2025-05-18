'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./utils/base58.js');
var errors = require('./utils/errors.js');
require('./utils/events.js');
require('./utils/fixednumber.js');
var maths = require('./utils/maths.js');
var properties = require('./utils/properties.js');
require('./utils/utf8.js');
require('../../base/functions/platform.js');
require('../../base/functions/encode.js');
require('../../base/functions/crypto.js');
require('../noble-hashes/sha3.js');
require('../noble-hashes/sha256.js');

/**
 *  A fragment is a single item from an ABI, which may represent any of:
 *
 *  - [Functions](FunctionFragment)
 *  - [Events](EventFragment)
 *  - [Constructors](ConstructorFragment)
 *  - Custom [Errors](ErrorFragment)
 *  - [Fallback or Receive](FallbackFragment) functions
 *
 *  @_subsection api/abi/abi-coder:Fragments  [about-fragments]
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TokenString_instances, _TokenString_offset, _TokenString_tokens, _TokenString_subTokenString, _ParamType_instances, _ParamType_walkAsync;
// [ "a", "b" ] => { "a": 1, "b": 1 }
function setify(items) {
    const result = new Set();
    items.forEach((k) => result.add(k));
    return Object.freeze(result);
}
const _kwVisibDeploy = "external public payable";
setify(_kwVisibDeploy.split(" "));
// Visibility Keywords
const _kwVisib = "constant external internal payable private public pure view";
setify(_kwVisib.split(" "));
const _kwTypes = "constructor error event fallback function receive struct";
setify(_kwTypes.split(" "));
const _kwModifiers = "calldata memory storage payable indexed";
const KwModifiers = setify(_kwModifiers.split(" "));
const _kwOther = "tuple returns";
// All Keywords
const _keywords = [_kwTypes, _kwModifiers, _kwOther, _kwVisib].join(" ");
const Keywords = setify(_keywords.split(" "));
// Single character tokens
const SimpleTokens = {
    "(": "OPEN_PAREN", ")": "CLOSE_PAREN",
    "[": "OPEN_BRACKET", "]": "CLOSE_BRACKET",
    ",": "COMMA", "@": "AT"
};
// Parser regexes to consume the next token
const regexWhitespacePrefix = new RegExp("^(\\s*)");
const regexNumberPrefix = new RegExp("^([0-9]+)");
const regexIdPrefix = new RegExp("^([a-zA-Z$_][a-zA-Z0-9$_]*)");
// Parser regexs to check validity
const regexId = new RegExp("^([a-zA-Z$_][a-zA-Z0-9$_]*)$");
const regexType = new RegExp("^(address|bool|bytes([0-9]*)|string|u?int([0-9]*))$");
class TokenString {
    constructor(tokens) {
        _TokenString_instances.add(this);
        _TokenString_offset.set(this, void 0);
        _TokenString_tokens.set(this, void 0);
        __classPrivateFieldSet(this, _TokenString_offset, 0, "f");
        __classPrivateFieldSet(this, _TokenString_tokens, tokens.slice(), "f");
    }
    get offset() { return __classPrivateFieldGet(this, _TokenString_offset, "f"); }
    get length() { return __classPrivateFieldGet(this, _TokenString_tokens, "f").length - __classPrivateFieldGet(this, _TokenString_offset, "f"); }
    clone() { return new TokenString(__classPrivateFieldGet(this, _TokenString_tokens, "f")); }
    reset() { __classPrivateFieldSet(this, _TokenString_offset, 0, "f"); }
    // Pops and returns the value of the next token, if it is a keyword in allowed; throws if out of tokens
    popKeyword(allowed) {
        const top = this.peek();
        if (top.type !== "KEYWORD" || !allowed.has(top.text)) {
            throw new Error(`expected keyword ${top.text}`);
        }
        return this.pop().text;
    }
    // Pops and returns the value of the next token if it is `type`; throws if out of tokens
    popType(type) {
        if (this.peek().type !== type) {
            throw new Error(`expected ${type}; got ${JSON.stringify(this.peek())}`);
        }
        return this.pop().text;
    }
    // Pops and returns a "(" TOKENS ")"
    popParen() {
        const top = this.peek();
        if (top.type !== "OPEN_PAREN") {
            throw new Error("bad start");
        }
        const result = __classPrivateFieldGet(this, _TokenString_instances, "m", _TokenString_subTokenString).call(this, __classPrivateFieldGet(this, _TokenString_offset, "f") + 1, top.match + 1);
        __classPrivateFieldSet(this, _TokenString_offset, top.match + 1, "f");
        return result;
    }
    // Pops and returns the items within "(" ITEM1 "," ITEM2 "," ... ")"
    popParams() {
        const top = this.peek();
        if (top.type !== "OPEN_PAREN") {
            throw new Error("bad start");
        }
        const result = [];
        while (__classPrivateFieldGet(this, _TokenString_offset, "f") < top.match - 1) {
            const link = this.peek().linkNext;
            result.push(__classPrivateFieldGet(this, _TokenString_instances, "m", _TokenString_subTokenString).call(this, __classPrivateFieldGet(this, _TokenString_offset, "f") + 1, link));
            __classPrivateFieldSet(this, _TokenString_offset, link, "f");
        }
        __classPrivateFieldSet(this, _TokenString_offset, top.match + 1, "f");
        return result;
    }
    // Returns the top Token, throwing if out of tokens
    peek() {
        if (__classPrivateFieldGet(this, _TokenString_offset, "f") >= __classPrivateFieldGet(this, _TokenString_tokens, "f").length) {
            throw new Error("out-of-bounds");
        }
        return __classPrivateFieldGet(this, _TokenString_tokens, "f")[__classPrivateFieldGet(this, _TokenString_offset, "f")];
    }
    // Returns the next value, if it is a keyword in `allowed`
    peekKeyword(allowed) {
        const top = this.peekType("KEYWORD");
        return (top != null && allowed.has(top)) ? top : null;
    }
    // Returns the value of the next token if it is `type`
    peekType(type) {
        if (this.length === 0) {
            return null;
        }
        const top = this.peek();
        return (top.type === type) ? top.text : null;
    }
    // Returns the next token; throws if out of tokens
    pop() {
        var _a;
        const result = this.peek();
        __classPrivateFieldSet(this, _TokenString_offset, (_a = __classPrivateFieldGet(this, _TokenString_offset, "f"), _a++, _a), "f");
        return result;
    }
    toString() {
        const tokens = [];
        for (let i = __classPrivateFieldGet(this, _TokenString_offset, "f"); i < __classPrivateFieldGet(this, _TokenString_tokens, "f").length; i++) {
            const token = __classPrivateFieldGet(this, _TokenString_tokens, "f")[i];
            tokens.push(`${token.type}:${token.text}`);
        }
        return `<TokenString ${tokens.join(" ")}>`;
    }
}
_TokenString_offset = new WeakMap(), _TokenString_tokens = new WeakMap(), _TokenString_instances = new WeakSet(), _TokenString_subTokenString = function _TokenString_subTokenString(from = 0, to = 0) {
    return new TokenString(__classPrivateFieldGet(this, _TokenString_tokens, "f").slice(from, to).map((t) => {
        return Object.freeze(Object.assign({}, t, {
            match: (t.match - from),
            linkBack: (t.linkBack - from),
            linkNext: (t.linkNext - from),
        }));
    }));
};
function lex(text) {
    const tokens = [];
    const throwError = (message) => {
        const token = (offset < text.length) ? JSON.stringify(text[offset]) : "$EOI";
        throw new Error(`invalid token ${token} at ${offset}: ${message}`);
    };
    let brackets = [];
    let commas = [];
    let offset = 0;
    while (offset < text.length) {
        // Strip off any leading whitespace
        let cur = text.substring(offset);
        let match = cur.match(regexWhitespacePrefix);
        if (match) {
            offset += match[1].length;
            cur = text.substring(offset);
        }
        const token = { depth: brackets.length, linkBack: -1, linkNext: -1, match: -1, type: "", text: "", offset, value: -1 };
        tokens.push(token);
        let type = (SimpleTokens[cur[0]] || "");
        if (type) {
            token.type = type;
            token.text = cur[0];
            offset++;
            if (type === "OPEN_PAREN") {
                brackets.push(tokens.length - 1);
                commas.push(tokens.length - 1);
            }
            else if (type == "CLOSE_PAREN") {
                if (brackets.length === 0) {
                    throwError("no matching open bracket");
                }
                token.match = brackets.pop();
                (tokens[token.match]).match = tokens.length - 1;
                token.depth--;
                token.linkBack = commas.pop();
                (tokens[token.linkBack]).linkNext = tokens.length - 1;
            }
            else if (type === "COMMA") {
                token.linkBack = commas.pop();
                (tokens[token.linkBack]).linkNext = tokens.length - 1;
                commas.push(tokens.length - 1);
            }
            else if (type === "OPEN_BRACKET") {
                token.type = "BRACKET";
            }
            else if (type === "CLOSE_BRACKET") {
                // Remove the CLOSE_BRACKET
                let suffix = tokens.pop().text;
                if (tokens.length > 0 && tokens[tokens.length - 1].type === "NUMBER") {
                    const value = tokens.pop().text;
                    suffix = value + suffix;
                    (tokens[tokens.length - 1]).value = maths.getNumber(value);
                }
                if (tokens.length === 0 || tokens[tokens.length - 1].type !== "BRACKET") {
                    throw new Error("missing opening bracket");
                }
                (tokens[tokens.length - 1]).text += suffix;
            }
            continue;
        }
        match = cur.match(regexIdPrefix);
        if (match) {
            token.text = match[1];
            offset += token.text.length;
            if (Keywords.has(token.text)) {
                token.type = "KEYWORD";
                continue;
            }
            if (token.text.match(regexType)) {
                token.type = "TYPE";
                continue;
            }
            token.type = "ID";
            continue;
        }
        match = cur.match(regexNumberPrefix);
        if (match) {
            token.text = match[1];
            token.type = "NUMBER";
            offset += token.text.length;
            continue;
        }
        throw new Error(`unexpected token ${JSON.stringify(cur[0])} at position ${offset}`);
    }
    return new TokenString(tokens.map((t) => Object.freeze(t)));
}
// ...all keywords matching allowed, returning the keywords
function consumeKeywords(tokens, allowed) {
    const keywords = new Set();
    while (true) {
        const keyword = tokens.peekType("KEYWORD");
        if (keyword == null || (allowed && !allowed.has(keyword))) {
            break;
        }
        tokens.pop();
        if (keywords.has(keyword)) {
            throw new Error(`duplicate keywords: ${JSON.stringify(keyword)}`);
        }
        keywords.add(keyword);
    }
    return Object.freeze(keywords);
}
const regexArrayType = new RegExp(/^(.*)\[([0-9]*)\]$/);
function verifyBasicType(type) {
    const match = type.match(regexType);
    errors.assertArgument(match, "invalid type", "type", type);
    if (type === "uint") {
        return "uint256";
    }
    if (type === "int") {
        return "int256";
    }
    if (match[2]) {
        // bytesXX
        const length = parseInt(match[2]);
        errors.assertArgument(length !== 0 && length <= 32, "invalid bytes length", "type", type);
    }
    else if (match[3]) {
        // intXX or uintXX
        const size = parseInt(match[3]);
        errors.assertArgument(size !== 0 && size <= 256 && (size % 8) === 0, "invalid numeric width", "type", type);
    }
    return type;
}
// Make the Fragment constructors effectively private
const _guard = {};
const internal = Symbol.for("_ethers_internal");
const ParamTypeInternal = "_ParamTypeInternal";
/**
 *  Each input and output of a [[Fragment]] is an Array of **ParamType**.
 */
class ParamType {
    /**
     *  @private
     */
    constructor(guard, name, type, baseType, indexed, components, arrayLength, arrayChildren) {
        _ParamType_instances.add(this);
        errors.assertPrivate(guard, _guard, "ParamType");
        Object.defineProperty(this, internal, { value: ParamTypeInternal });
        if (components) {
            components = Object.freeze(components.slice());
        }
        if (baseType === "array") {
            if (arrayLength == null || arrayChildren == null) {
                throw new Error("");
            }
        }
        else if (arrayLength != null || arrayChildren != null) {
            throw new Error("");
        }
        if (baseType === "tuple") {
            if (components == null) {
                throw new Error("");
            }
        }
        else if (components != null) {
            throw new Error("");
        }
        properties.defineProperties(this, {
            name, type, baseType, indexed, components, arrayLength, arrayChildren
        });
    }
    /**
     *  Return a string representation of this type.
     *
     *  For example,
     *
     *  ``sighash" => "(uint256,address)"``
     *
     *  ``"minimal" => "tuple(uint256,address) indexed"``
     *
     *  ``"full" => "tuple(uint256 foo, address bar) indexed baz"``
     */
    format(format) {
        if (format == null) {
            format = "sighash";
        }
        if (format === "json") {
            const name = this.name || "";
            if (this.isArray()) {
                const result = JSON.parse(this.arrayChildren.format("json"));
                result.name = name;
                result.type += `[${(this.arrayLength < 0 ? "" : String(this.arrayLength))}]`;
                return JSON.stringify(result);
            }
            const result = {
                type: ((this.baseType === "tuple") ? "tuple" : this.type),
                name
            };
            if (typeof (this.indexed) === "boolean") {
                result.indexed = this.indexed;
            }
            if (this.isTuple()) {
                result.components = this.components.map((c) => JSON.parse(c.format(format)));
            }
            return JSON.stringify(result);
        }
        let result = "";
        // Array
        if (this.isArray()) {
            result += this.arrayChildren.format(format);
            result += `[${(this.arrayLength < 0 ? "" : String(this.arrayLength))}]`;
        }
        else {
            if (this.isTuple()) {
                result += "(" + this.components.map((comp) => comp.format(format)).join((format === "full") ? ", " : ",") + ")";
            }
            else {
                result += this.type;
            }
        }
        if (format !== "sighash") {
            if (this.indexed === true) {
                result += " indexed";
            }
            if (format === "full" && this.name) {
                result += " " + this.name;
            }
        }
        return result;
    }
    /**
     *  Returns true if %%this%% is an Array type.
     *
     *  This provides a type gaurd ensuring that [[arrayChildren]]
     *  and [[arrayLength]] are non-null.
     */
    isArray() {
        return (this.baseType === "array");
    }
    /**
     *  Returns true if %%this%% is a Tuple type.
     *
     *  This provides a type gaurd ensuring that [[components]]
     *  is non-null.
     */
    isTuple() {
        return (this.baseType === "tuple");
    }
    /**
     *  Returns true if %%this%% is an Indexable type.
     *
     *  This provides a type gaurd ensuring that [[indexed]]
     *  is non-null.
     */
    isIndexable() {
        return (this.indexed != null);
    }
    /**
     *  Walks the **ParamType** with %%value%%, calling %%process%%
     *  on each type, destructing the %%value%% recursively.
     */
    walk(value, process) {
        if (this.isArray()) {
            if (!Array.isArray(value)) {
                throw new Error("invalid array value");
            }
            if (this.arrayLength !== -1 && value.length !== this.arrayLength) {
                throw new Error("array is wrong length");
            }
            const _this = this;
            return value.map((v) => (_this.arrayChildren.walk(v, process)));
        }
        if (this.isTuple()) {
            if (!Array.isArray(value)) {
                throw new Error("invalid tuple value");
            }
            if (value.length !== this.components.length) {
                throw new Error("array is wrong length");
            }
            const _this = this;
            return value.map((v, i) => (_this.components[i].walk(v, process)));
        }
        return process(this.type, value);
    }
    /**
     *  Walks the **ParamType** with %%value%%, asynchronously calling
     *  %%process%% on each type, destructing the %%value%% recursively.
     *
     *  This can be used to resolve ENS naes by walking and resolving each
     *  ``"address"`` type.
     */
    async walkAsync(value, process) {
        const promises = [];
        const result = [value];
        __classPrivateFieldGet(this, _ParamType_instances, "m", _ParamType_walkAsync).call(this, promises, value, process, (value) => {
            result[0] = value;
        });
        if (promises.length) {
            await Promise.all(promises);
        }
        return result[0];
    }
    /**
     *  Creates a new **ParamType** for %%obj%%.
     *
     *  If %%allowIndexed%% then the ``indexed`` keyword is permitted,
     *  otherwise the ``indexed`` keyword will throw an error.
     */
    static from(obj, allowIndexed) {
        if (ParamType.isParamType(obj)) {
            return obj;
        }
        if (typeof (obj) === "string") {
            try {
                return ParamType.from(lex(obj), allowIndexed);
            }
            catch (error) {
                errors.assertArgument(false, "invalid param type", "obj", obj);
            }
        }
        else if (obj instanceof TokenString) {
            let type = "", baseType = "";
            let comps = null;
            if (consumeKeywords(obj, setify(["tuple"])).has("tuple") || obj.peekType("OPEN_PAREN")) {
                // Tuple
                baseType = "tuple";
                comps = obj.popParams().map((t) => ParamType.from(t));
                type = `tuple(${comps.map((c) => c.format()).join(",")})`;
            }
            else {
                // Normal
                type = verifyBasicType(obj.popType("TYPE"));
                baseType = type;
            }
            // Check for Array
            let arrayChildren = null;
            let arrayLength = null;
            while (obj.length && obj.peekType("BRACKET")) {
                const bracket = obj.pop(); //arrays[i];
                arrayChildren = new ParamType(_guard, "", type, baseType, null, comps, arrayLength, arrayChildren);
                arrayLength = bracket.value;
                type += bracket.text;
                baseType = "array";
                comps = null;
            }
            let indexed = null;
            const keywords = consumeKeywords(obj, KwModifiers);
            if (keywords.has("indexed")) {
                if (!allowIndexed) {
                    throw new Error("");
                }
                indexed = true;
            }
            const name = (obj.peekType("ID") ? obj.pop().text : "");
            if (obj.length) {
                throw new Error("leftover tokens");
            }
            return new ParamType(_guard, name, type, baseType, indexed, comps, arrayLength, arrayChildren);
        }
        const name = obj.name;
        errors.assertArgument(!name || (typeof (name) === "string" && name.match(regexId)), "invalid name", "obj.name", name);
        let indexed = obj.indexed;
        if (indexed != null) {
            errors.assertArgument(allowIndexed, "parameter cannot be indexed", "obj.indexed", obj.indexed);
            indexed = !!indexed;
        }
        let type = obj.type;
        let arrayMatch = type.match(regexArrayType);
        if (arrayMatch) {
            const arrayLength = parseInt(arrayMatch[2] || "-1");
            const arrayChildren = ParamType.from({
                type: arrayMatch[1],
                components: obj.components
            });
            return new ParamType(_guard, name || "", type, "array", indexed, null, arrayLength, arrayChildren);
        }
        if (type === "tuple" || type.startsWith("tuple(" /* fix: ) */) || type.startsWith("(" /* fix: ) */)) {
            const comps = (obj.components != null) ? obj.components.map((c) => ParamType.from(c)) : null;
            const tuple = new ParamType(_guard, name || "", type, "tuple", indexed, comps, null, null);
            // @TODO: use lexer to validate and normalize type
            return tuple;
        }
        type = verifyBasicType(obj.type);
        return new ParamType(_guard, name || "", type, type, indexed, null, null, null);
    }
    /**
     *  Returns true if %%value%% is a **ParamType**.
     */
    static isParamType(value) {
        return (value && value[internal] === ParamTypeInternal);
    }
}
_ParamType_instances = new WeakSet(), _ParamType_walkAsync = function _ParamType_walkAsync(promises, value, process, setValue) {
    if (this.isArray()) {
        if (!Array.isArray(value)) {
            throw new Error("invalid array value");
        }
        if (this.arrayLength !== -1 && value.length !== this.arrayLength) {
            throw new Error("array is wrong length");
        }
        const childType = this.arrayChildren;
        const result = value.slice();
        result.forEach((value, index) => {
            __classPrivateFieldGet(childType, _ParamType_instances, "m", _ParamType_walkAsync).call(childType, promises, value, process, (value) => {
                result[index] = value;
            });
        });
        setValue(result);
        return;
    }
    if (this.isTuple()) {
        const components = this.components;
        // Convert the object into an array
        let result;
        if (Array.isArray(value)) {
            result = value.slice();
        }
        else {
            if (value == null || typeof (value) !== "object") {
                throw new Error("invalid tuple value");
            }
            result = components.map((param) => {
                if (!param.name) {
                    throw new Error("cannot use object value with unnamed components");
                }
                if (!(param.name in value)) {
                    throw new Error(`missing value for component ${param.name}`);
                }
                return value[param.name];
            });
        }
        if (result.length !== this.components.length) {
            throw new Error("array is wrong length");
        }
        result.forEach((value, index) => {
            var _a;
            __classPrivateFieldGet((_a = components[index]), _ParamType_instances, "m", _ParamType_walkAsync).call(_a, promises, value, process, (value) => {
                result[index] = value;
            });
        });
        setValue(result);
        return;
    }
    const result = process(this.type, value);
    if (result.then) {
        promises.push((async function () { setValue(await result); })());
    }
    else {
        setValue(result);
    }
};

exports.ParamType = ParamType;
