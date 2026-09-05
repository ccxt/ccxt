'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var starknet = require('@scure/starknet');

// ----------------------------------------------------------------------------
const MASK_250 = (1n << 250n) - 1n;
const ADDR_BOUND = (1n << 251n) - 256n;
const CONTRACT_ADDRESS_PREFIX = '0x535441524b4e45545f434f4e54524143545f41444452455353'; // 'STARKNET_CONTRACT_ADDRESS'
const utf8Encoder = new TextEncoder();
const toHex = (b) => '0x' + BigInt(b).toString(16);
const isHex = (s) => /^0x[0-9a-f]*$/i.test(s);
const isWhole = (s) => /^\d+$/.test(s);
function encodeShortString(str) {
    if (!/^[\x00-\x7F]*$/.test(str)) {
        throw new Error(str + ' is not an ASCII string');
    }
    if (str.length > 31) {
        throw new Error(str + ' is too long');
    }
    return '0x' + Array.from(str, (c) => c.charCodeAt(0).toString(16)).join('');
}
// felt(): bigint/number -> decimal string; hex string -> decimal; short ASCII text -> decimal of its bytes;
// whole-number string passthrough; boolean -> '0'/'1'
function felt(it) {
    if (typeof it === 'bigint' || Number.isInteger(it)) {
        return it.toString();
    }
    if (typeof it === 'string') {
        if (isHex(it)) {
            return BigInt(it).toString();
        }
        if (isWhole(it)) {
            return it;
        }
        if (it.length > 31) {
            throw new Error(it + ' is a long string > 31 chars.');
        }
        return BigInt(encodeShortString(it)).toString();
    }
    if (typeof it === 'boolean') {
        return it ? '1' : '0';
    }
    throw new Error(it + " can't be computed by felt()");
}
const starknetKeccak = (str) => starknet.keccak(utf8Encoder.encode(str)) & MASK_250;
const getSelectorFromName = (name) => toHex(starknetKeccak(name));
const computeHashOnElements = (data) => [...data, data.length].reduce((x, y) => starknet.pedersen(BigInt(x), BigInt(y)), 0).toString();
const computePoseidonHashOnElements = (data) => toHex(starknet.poseidonHashMany(data.map((x) => BigInt(x))));
// CCXT only ever passes flat objects of felt-ish leaves, or arrays (already-compiled calldata) of felts.
function compileCalldata(rawArgs) {
    const out = [];
    const visit = (v) => {
        if (Array.isArray(v)) {
            out.push(felt(v.length));
            v.forEach(visit);
        }
        else if (v !== null && typeof v === 'object') {
            for (const k of Object.keys(v)) {
                visit(v[k]);
            }
        }
        else {
            out.push(felt(v));
        }
    };
    if (Array.isArray(rawArgs)) {
        rawArgs.forEach(visit);
    }
    else {
        visit(rawArgs);
    }
    return out;
}
function calculateContractAddressFromHash(salt, classHash, constructorCalldata, deployerAddress) {
    const calldataHash = computeHashOnElements(compileCalldata(constructorCalldata));
    const h = computeHashOnElements([felt(CONTRACT_ADDRESS_PREFIX), deployerAddress, salt, classHash, calldataHash]);
    return toHex(BigInt(h) % ADDR_BOUND);
}
// ---- SNIP-12 revision 0 (legacy, pedersen) ----
function encodeType(types, type) {
    // deps: primary first, then alphabetically sorted dependent struct names
    const deps = [];
    const seen = new Set();
    const walk = (t) => {
        t = t.endsWith('*') ? t.slice(0, -1) : t;
        if (seen.has(t) || !types[t]) {
            return;
        }
        seen.add(t);
        deps.push(t);
        for (const f of types[t]) {
            walk(f.type);
        }
    };
    walk(type);
    const [primary, ...rest] = deps;
    return [primary, ...rest.sort()].map((d) => d + '(' + types[d].map((f) => f.name + ':' + f.type).join(',') + ')').join('');
}
const getTypeHash = (types, type) => getSelectorFromName(encodeType(types, type));
function getHex(v) {
    if (typeof v === 'bigint' || typeof v === 'number') {
        return toHex(v);
    }
    if (typeof v === 'string') {
        try {
            return toHex(v); // BigInt('') === 0n, hex/decimal parse natively
        }
        catch (e) {
            return toHex(encodeShortString(v));
        }
    }
    if (typeof v === 'boolean') {
        return toHex(+v);
    }
    throw new Error('Invalid BigNumberish: ' + v);
}
function encodeValue(types, type, data) {
    if (types[type]) {
        return getStructHash(types, type, data);
    }
    if (type.endsWith('*')) {
        return computeHashOnElements(data.map((e) => encodeValue(types, type.slice(0, -1), e)));
    }
    if (type === 'selector') {
        return isHex(data) ? data : getSelectorFromName(data);
    }
    return getHex(data); // felt, string, bool, ContractAddress, ClassHash, u128 ... all fall through to getHex in rev-0
}
function getStructHash(types, type, data) {
    const values = [getTypeHash(types, type)];
    for (const f of types[type]) {
        if (data[f.name] === undefined || data[f.name] === null) {
            throw new Error("Cannot encode data: missing data for '" + f.name + "'");
        }
        values.push(encodeValue(types, f.type, data[f.name]));
    }
    return computeHashOnElements(values);
}
function getMessageHash(typedData, account) {
    if (!typedData.message || !typedData.primaryType || !typedData.types || !('StarkNetDomain' in typedData.types) || (typedData.domain['revision'] ?? '0') !== '0') {
        throw new Error('Typed data does not match JSON schema');
    }
    return computeHashOnElements([
        encodeShortString('StarkNet Message'),
        getStructHash(typedData.types, 'StarkNetDomain', typedData.domain),
        account,
        getStructHash(typedData.types, typedData.primaryType, typedData.message),
    ]);
}
/*  ------------------------------------------------------------------------ */

exports.calculateContractAddressFromHash = calculateContractAddressFromHash;
exports.compileCalldata = compileCalldata;
exports.computeHashOnElements = computeHashOnElements;
exports.computePoseidonHashOnElements = computePoseidonHashOnElements;
exports.encodeShortString = encodeShortString;
exports.felt = felt;
exports.getMessageHash = getMessageHash;
exports.getSelectorFromName = getSelectorFromName;
exports.getStructHash = getStructHash;
exports.starknetKeccak = starknetKeccak;
