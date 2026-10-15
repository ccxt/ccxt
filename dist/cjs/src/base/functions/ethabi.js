'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sha3_js = require('@noble/hashes/sha3.js');

// ----------------------------------------------------------------------------
const utf8Encoder = new TextEncoder();
const MASK256 = (1n << 256n) - 1n;
const hexOf = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const keccak = (bytes) => sha3_js.keccak_256(bytes);
function toBytes(v, name = 'value') {
    if (v instanceof Uint8Array) {
        return v;
    }
    if (typeof v === 'string' && /^(0x)?[0-9a-fA-F]*$/.test(v)) {
        const h = v.startsWith('0x') ? v.slice(2) : v;
        if (h.length % 2) {
            throw new Error('invalid BytesLike ' + name);
        }
        const out = new Uint8Array(h.length / 2);
        for (let i = 0; i < out.length; i++) {
            out[i] = parseInt(h.substr(i * 2, 2), 16);
        }
        return out;
    }
    throw new Error('invalid BytesLike value (argument="' + name + '")');
}
function toBigInt(v, name = 'value') {
    if (typeof v === 'bigint') {
        return v;
    }
    if (typeof v === 'number') {
        if (!Number.isSafeInteger(v)) {
            throw new Error('overflow (argument="' + name + '")');
        }
        return BigInt(v);
    }
    if (typeof v === 'string') {
        if (/^-?\d+$/.test(v)) {
            return BigInt(v);
        }
        if (/^-?0x[0-9a-fA-F]+$/.test(v)) {
            return v.startsWith('-') ? -BigInt(v.slice(1)) : BigInt(v);
        }
    }
    if (v instanceof Uint8Array) {
        return BigInt('0x' + (hexOf(v) || '0'));
    }
    throw new Error('invalid BigNumberish value (argument="' + name + '")');
}
// 32-byte big-endian two's complement word
const word = (n) => {
    const h = ((n < 0n) ? (n & MASK256) : n).toString(16);
    return toBytes(h.padStart(64, '0'));
};
function checkAddress(a) {
    if (typeof a !== 'string' || !/^(0x)?[0-9a-fA-F]{40}$/.test(a)) {
        throw new Error('invalid address (argument="address")');
    }
    const h = a.startsWith('0x') ? a.slice(2) : a;
    if (h !== h.toLowerCase() && h !== h.toUpperCase()) {
        // mixed case => must be a valid EIP-55 checksum (ethers getAddress semantics)
        const lower = h.toLowerCase();
        const hash = hexOf(keccak(utf8Encoder.encode(lower)));
        let cs = '';
        for (let i = 0; i < 40; i++) {
            cs += (parseInt(hash[i], 16) >= 8) ? lower[i].toUpperCase() : lower[i];
        }
        if (cs !== h) {
            throw new Error('bad address checksum (argument="address")');
        }
    }
    return h.toLowerCase();
}
const concat = (arrs) => {
    const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0));
    let o = 0;
    for (const a of arrs) {
        out.set(a, o);
        o += a.length;
    }
    return out;
};
const padRight = (b) => (b.length % 32 === 0) ? b : concat([b, new Uint8Array(32 - (b.length % 32))]);
// ---------- ABI ----------
function parseType(t) {
    t = t.trim();
    const arr = t.match(/^(.*)\[(\d*)\]$/);
    if (arr) {
        return { 'kind': 'array', 'inner': parseType(arr[1]), 'len': arr[2] === '' ? -1 : parseInt(arr[2], 10) };
    }
    if (t.startsWith('tuple(')) {
        t = t.slice(5);
    }
    if (t.startsWith('(')) {
        // tuple - split top-level commas
        let depth = 0;
        let cur = '';
        const parts = [];
        for (const ch of t.slice(1, -1)) {
            if (ch === '(') {
                depth++;
            }
            if (ch === ')') {
                depth--;
            }
            if (ch === ',' && depth === 0) {
                parts.push(cur);
                cur = '';
            }
            else {
                cur += ch;
            }
        }
        if (cur) {
            parts.push(cur);
        }
        return { 'kind': 'tuple', 'comps': parts.map(parseType) };
    }
    const m = t.match(/^(u?int)(\d*)$/);
    if (m) {
        const bits = m[2] === '' ? 256 : parseInt(m[2], 10);
        if (bits % 8 || bits < 8 || bits > 256) {
            throw new Error('invalid ' + t);
        }
        return { 'kind': m[1], 'bits': bits };
    }
    if (t === 'address') {
        return { 'kind': 'address' };
    }
    if (t === 'bool') {
        return { 'kind': 'bool' };
    }
    if (t === 'string') {
        return { 'kind': 'string' };
    }
    if (t === 'bytes') {
        return { 'kind': 'bytes' };
    }
    const fb = t.match(/^bytes(\d+)$/);
    if (fb) {
        const n = parseInt(fb[1], 10);
        if (n < 1 || n > 32) {
            throw new Error('invalid ' + t);
        }
        return { 'kind': 'fixedbytes', 'n': n };
    }
    throw new Error('invalid type: ' + t);
}
const isDynamic = (ty) => ty.kind === 'string' || ty.kind === 'bytes' || (ty.kind === 'array' && (ty.len === -1 || isDynamic(ty.inner))) || (ty.kind === 'tuple' && ty.comps.some(isDynamic));
function encodeOne(ty, v) {
    switch (ty.kind) {
        case 'uint': {
            const n = toBigInt(v);
            if (n < 0n || n >= (1n << BigInt(ty.bits))) {
                throw new Error('value out-of-bounds');
            }
            return word(n);
        }
        case 'int': {
            const n = toBigInt(v);
            const lim = 1n << BigInt(ty.bits - 1);
            if (n < -lim || n >= lim) {
                throw new Error('value out-of-bounds');
            }
            return word(n);
        }
        case 'address':
            return word(BigInt('0x' + checkAddress(v)));
        case 'bool':
            return word(v ? 1n : 0n);
        case 'fixedbytes': {
            const b = toBytes(v);
            if (b.length !== ty.n) {
                throw new Error('incorrect data length');
            }
            return padRight(b);
        }
        case 'bytes': {
            const b = toBytes(v);
            return concat([word(BigInt(b.length)), padRight(b)]);
        }
        case 'string': {
            const b = utf8Encoder.encode(v);
            return concat([word(BigInt(b.length)), padRight(b)]);
        }
        case 'array': {
            if (ty.len !== -1 && v.length !== ty.len) {
                throw new Error('array length mismatch');
            }
            const body = encodeTuple(v.map(() => ty.inner), v);
            return ty.len === -1 ? concat([word(BigInt(v.length)), body]) : body;
        }
        case 'tuple':
            return encodeTuple(ty.comps, v);
    }
}
function encodeTuple(types, values) {
    if (types.length !== values.length) {
        throw new Error('types/values length mismatch');
    }
    const heads = [];
    const tails = [];
    let headLen = 0;
    for (let i = 0; i < types.length; i++) {
        const enc = encodeOne(types[i], values[i]);
        if (isDynamic(types[i])) {
            heads.push(null);
            tails.push(enc);
            headLen += 32;
        }
        else {
            heads.push(enc);
            tails.push(null);
            headLen += enc.length;
        }
    }
    let tailOff = headLen;
    const out = [];
    for (let i = 0; i < types.length; i++) {
        const head = heads[i];
        if (head) {
            out.push(head);
        }
        else {
            out.push(word(BigInt(tailOff)));
            tailOff += tails[i].length;
        }
    }
    for (const t of tails) {
        if (t) {
            out.push(t);
        }
    }
    return concat(out);
}
function abiEncode(types, values) {
    return '0x' + hexOf(encodeTuple(types.map(parseType), values));
}
// ---------- EIP-712 ----------
const domainFieldTypes = { 'name': 'string', 'version': 'string', 'chainId': 'uint256', 'verifyingContract': 'address', 'salt': 'bytes32' };
const domainFieldNames = ['name', 'version', 'chainId', 'verifyingContract', 'salt'];
class TypedDataEncoder {
    constructor(types) {
        this.types = {};
        for (const name of Object.keys(types)) {
            this.types[name] = types[name].map((f) => ({ 'name': f.name, 'type': f.type }));
        }
        // dependency links
        const links = {};
        const parents = {};
        for (const name of Object.keys(this.types)) {
            links[name] = new Set();
            parents[name] = [];
        }
        for (const name of Object.keys(this.types)) {
            const uniq = new Set();
            for (const f of this.types[name]) {
                if (uniq.has(f.name)) {
                    throw new Error('duplicated struct field ' + f.name);
                }
                uniq.add(f.name);
                const base = f.type.split('[')[0];
                if (base === name) {
                    throw new Error('circular type reference to ' + name);
                }
                if (this.types[base]) {
                    parents[base].push(name);
                    links[name].add(base);
                }
            }
        }
        const primary = Object.keys(parents).filter((n) => parents[n].length === 0);
        if (primary.length === 0) {
            throw new Error('missing primary type');
        }
        if (primary.length > 1) {
            throw new Error('ambiguous primary types or unused types: ' + primary.map((t) => JSON.stringify(t)).join(', '));
        }
        this.primaryType = primary[0];
        this.fullTypes = {};
        const walk = (name, found) => {
            if (found.has(name)) {
                return;
            }
            found.add(name);
            for (const c of links[name]) {
                walk(c, found);
            }
        };
        for (const name of Object.keys(this.types)) {
            const deps = new Set();
            walk(name, deps);
            deps.delete(name);
            const ordered = [name, ...Array.from(deps).sort()];
            this.fullTypes[name] = ordered.map((t) => t + '(' + this.types[t].map((f) => f.type + ' ' + f.name).join(',') + ')').join('');
        }
        this.encoderCache = {};
    }
    static from(types) {
        return new TypedDataEncoder(types);
    }
    encodeType(name) {
        const r = this.fullTypes[name];
        if (!r) {
            throw new Error('unknown type: ' + name);
        }
        return r;
    }
    buildEncoder(type) {
        const arr = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
        if (arr) {
            const sub = this.getEncoder(arr[1]);
            return (value) => {
                if (arr[3] && parseInt(arr[3], 10) !== value.length) {
                    throw new Error('array length mismatch');
                }
                let result;
                if (this.fullTypes[arr[1]]) {
                    result = value.map((v) => keccak(toBytes(sub(v))));
                }
                else {
                    result = value.map((v) => toBytes(sub(v)));
                }
                return '0x' + hexOf(keccak(concat(result)));
            };
        }
        const fields = this.types[type];
        if (fields) {
            const typeHash = keccak(utf8Encoder.encode(this.encodeType(type)));
            return (value) => {
                const parts = fields.map((field) => {
                    const r = this.getEncoder(field.type)(value[field.name]);
                    return this.fullTypes[field.type] ? keccak(toBytes(r)) : toBytes(r);
                });
                return '0x' + hexOf(concat([typeHash, ...parts]));
            };
        }
        const m = type.match(/^(u?)int(\d*)$/);
        if (m) {
            const width = parseInt(m[2] || '0', 10);
            if (width % 8 || width > 256 || width === 0) {
                throw new Error('invalid numeric width (EIP-712 requires explicit width)');
            }
            const signed = m[1] === '';
            return (value) => {
                const n = toBigInt(value, type);
                if (signed) {
                    const lim = 1n << BigInt(width - 1);
                    if (n < -lim || n >= lim) {
                        throw new Error('value out-of-bounds for ' + type);
                    }
                }
                else if (n < 0n || n >= (1n << BigInt(width))) {
                    throw new Error('value out-of-bounds for ' + type);
                }
                return '0x' + hexOf(word(n));
            };
        }
        const fb = type.match(/^bytes(\d+)$/);
        if (fb) {
            const w = parseInt(fb[1], 10);
            if (w === 0 || w > 32) {
                throw new Error('invalid bytes width');
            }
            return (value) => {
                const b = toBytes(value);
                if (b.length !== w) {
                    throw new Error('invalid length for ' + type);
                }
                return '0x' + hexOf(padRight(b));
            };
        }
        switch (type) {
            case 'address':
                return (value) => '0x' + hexOf(word(BigInt('0x' + checkAddress(value))));
            case 'bool':
                return (value) => '0x' + hexOf(word(value ? 1n : 0n));
            case 'bytes':
                return (value) => '0x' + hexOf(keccak(toBytes(value)));
            case 'string':
                return (value) => '0x' + hexOf(keccak(utf8Encoder.encode(value)));
        }
        throw new Error('unknown type: ' + type);
    }
    getEncoder(type) {
        if (!(type in this.encoderCache)) {
            this.encoderCache[type] = this.buildEncoder(type);
        }
        return this.encoderCache[type];
    }
    encodeData(type, value) {
        return this.getEncoder(type)(value);
    }
    hashStruct(name, value) {
        return '0x' + hexOf(keccak(toBytes(this.encodeData(name, value))));
    }
    static hashDomain(domain) {
        const fields = [];
        for (const name of domainFieldNames) {
            if (domain[name] === undefined || domain[name] === null) {
                continue;
            }
            fields.push({ 'name': name, 'type': domainFieldTypes[name] });
        }
        for (const k of Object.keys(domain)) {
            if (!(k in domainFieldTypes)) {
                throw new Error('invalid typed-data domain key: ' + k);
            }
        }
        return TypedDataEncoder.from({ 'EIP712Domain': fields }).hashStruct('EIP712Domain', domain);
    }
    static encode(domain, types, value) {
        const e = TypedDataEncoder.from(types);
        return '0x1901' + TypedDataEncoder.hashDomain(domain).slice(2) + e.hashStruct(e.primaryType, value).slice(2);
    }
}
/*  ------------------------------------------------------------------------ */

exports.TypedDataEncoder = TypedDataEncoder;
exports.abiEncode = abiEncode;
exports.keccak = keccak;
