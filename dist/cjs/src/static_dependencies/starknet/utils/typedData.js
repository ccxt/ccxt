'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var constants = require('../constants.js');
require('../types/calldata.js');
require('../types/lib/index.js');
var typedData = require('../types/typedData.js');
var assert = require('./assert.js');
var byteArray = require('./calldata/byteArray.js');
require('../../noble-curves/abstract/modular.js');
var selector = require('./selector.js');
var classHash = require('./hash/classHash.js');
var merkle = require('./merkle.js');
var num = require('./num.js');
var shortString = require('./shortString.js');

/* eslint-disable no-param-reassign */
const presetTypes = {
    u256: JSON.parse('[{ "name": "low", "type": "u128" }, { "name": "high", "type": "u128" }]'),
    TokenAmount: JSON.parse('[{ "name": "token_address", "type": "ContractAddress" }, { "name": "amount", "type": "u256" }]'),
    NftId: JSON.parse('[{ "name": "collection_address", "type": "ContractAddress" }, { "name": "token_id", "type": "u256" }]'),
};
const revisionConfiguration = {
    [typedData.TypedDataRevision.Active]: {
        domain: 'StarknetDomain',
        hashMethod: classHash.computePoseidonHashOnElements,
        hashMerkleMethod: classHash.computePoseidonHash,
        escapeTypeString: (s) => `"${s}"`,
        presetTypes,
    },
    [typedData.TypedDataRevision.Legacy]: {
        domain: 'StarkNetDomain',
        hashMethod: classHash.computePedersenHashOnElements,
        hashMerkleMethod: classHash.computePedersenHash,
        escapeTypeString: (s) => s,
        presetTypes: {},
    },
};
function assertRange(data, type, { min, max }) {
    const value = BigInt(data);
    assert(value >= min && value <= max, `${value} (${type}) is out of bounds [${min}, ${max}]`);
}
function identifyRevision({ types, domain }) {
    if (revisionConfiguration[typedData.TypedDataRevision.Active].domain in types && domain.revision === typedData.TypedDataRevision.Active)
        return typedData.TypedDataRevision.Active;
    if (revisionConfiguration[typedData.TypedDataRevision.Legacy].domain in types &&
        (domain.revision ?? typedData.TypedDataRevision.Legacy) === typedData.TypedDataRevision.Legacy)
        return typedData.TypedDataRevision.Legacy;
    return undefined;
}
function getHex(value) {
    try {
        return num.toHex(value);
    }
    catch (e) {
        if (shortString.isString(value)) {
            return num.toHex(shortString.encodeShortString(value));
        }
        throw new Error(`Invalid BigNumberish: ${value}`);
    }
}
/**
 * Validates that `data` matches the EIP-712 JSON schema.
 */
function validateTypedData(data) {
    const typedData = data;
    return Boolean(typedData.message && typedData.primaryType && typedData.types && identifyRevision(typedData));
}
/**
 * Prepares the selector for use.
 *
 * @param {string} selector - The selector to be prepared.
 * @returns {string} The prepared selector.
 */
function prepareSelector(selector$1) {
    return num.isHex(selector$1) ? selector$1 : selector.getSelectorFromName(selector$1);
}
/**
 * Checks if the given Starknet type is a Merkle tree type.
 *
 * @param {StarknetType} type - The StarkNet type to check.
 *
 * @returns {boolean} - True if the type is a Merkle tree type, false otherwise.
 */
function isMerkleTreeType(type) {
    return type.type === 'merkletree';
}
/**
 * Get the dependencies of a struct type. If a struct has the same dependency multiple times, it's only included once
 * in the resulting array.
 */
function getDependencies(types, type, dependencies = [], contains = '', revision = typedData.TypedDataRevision.Legacy) {
    // Include pointers (struct arrays)
    if (type[type.length - 1] === '*') {
        type = type.slice(0, -1);
    }
    else if (revision === typedData.TypedDataRevision.Active) {
        // enum base
        if (type === 'enum') {
            type = contains;
        }
        // enum element types
        else if (type.match(/^\(.*\)$/)) {
            type = type.slice(1, -1);
        }
    }
    if (dependencies.includes(type) || !types[type]) {
        return dependencies;
    }
    return [
        type,
        ...types[type].reduce((previous, t) => [
            ...previous,
            ...getDependencies(types, t.type, previous, t.contains, revision).filter((dependency) => !previous.includes(dependency)),
        ], []),
    ];
}
function getMerkleTreeType(types, ctx) {
    if (ctx.parent && ctx.key) {
        const parentType = types[ctx.parent];
        const merkleType = parentType.find((t) => t.name === ctx.key);
        const isMerkleTree = isMerkleTreeType(merkleType);
        if (!isMerkleTree) {
            throw new Error(`${ctx.key} is not a merkle tree`);
        }
        if (merkleType.contains.endsWith('*')) {
            throw new Error(`Merkle tree contain property must not be an array but was given ${ctx.key}`);
        }
        return merkleType.contains;
    }
    return 'raw';
}
/**
 * Encode a type to a string. All dependent types are alphabetically sorted.
 */
function encodeType(types, type, revision = typedData.TypedDataRevision.Legacy) {
    const allTypes = revision === typedData.TypedDataRevision.Active
        ? { ...types, ...revisionConfiguration[revision].presetTypes }
        : types;
    const [primary, ...dependencies] = getDependencies(allTypes, type, undefined, undefined, revision);
    const newTypes = !primary ? [] : [primary, ...dependencies.sort()];
    const esc = revisionConfiguration[revision].escapeTypeString;
    return newTypes
        .map((dependency) => {
        const dependencyElements = allTypes[dependency].map((t) => {
            const targetType = t.type === 'enum' && revision === typedData.TypedDataRevision.Active
                ? t.contains
                : t.type;
            // parentheses handling for enum variant types
            const typeString = targetType.match(/^\(.*\)$/)
                ? `(${targetType
                    .slice(1, -1)
                    .split(',')
                    .map((e) => (e ? esc(e) : e))
                    .join(',')})`
                : esc(targetType);
            return `${esc(t.name)}:${typeString}`;
        });
        return `${esc(dependency)}(${dependencyElements})`;
    })
        .join('');
}
/**
 * Get a type string as hash.
 */
function getTypeHash(types, type, revision = typedData.TypedDataRevision.Legacy) {
    return selector.getSelectorFromName(encodeType(types, type, revision));
}
/**
 * Encodes a single value to an ABI serialisable string, number or Buffer. Returns the data as tuple, which consists of
 * an array of ABI compatible types, and an array of corresponding values.
 */
function encodeValue(types, type, data, ctx = {}, revision = typedData.TypedDataRevision.Legacy) {
    if (types[type]) {
        return [type, getStructHash(types, type, data, revision)];
    }
    if (revisionConfiguration[revision].presetTypes[type]) {
        return [
            type,
            getStructHash(revisionConfiguration[revision].presetTypes, type, data, revision),
        ];
    }
    if (type.endsWith('*')) {
        const hashes = data.map((entry) => encodeValue(types, type.slice(0, -1), entry, undefined, revision)[1]);
        return [type, revisionConfiguration[revision].hashMethod(hashes)];
    }
    switch (type) {
        case 'enum': {
            if (revision === typedData.TypedDataRevision.Active) {
                const [variantKey, variantData] = Object.entries(data)[0];
                const parentType = types[ctx.parent][0];
                const enumType = types[parentType.contains];
                const variantType = enumType.find((t) => t.name === variantKey);
                const variantIndex = enumType.indexOf(variantType);
                const encodedSubtypes = variantType.type
                    .slice(1, -1)
                    .split(',')
                    .map((subtype, index) => {
                    if (!subtype)
                        return subtype;
                    const subtypeData = variantData[index];
                    return encodeValue(types, subtype, subtypeData, undefined, revision)[1];
                });
                return [
                    type,
                    revisionConfiguration[revision].hashMethod([variantIndex, ...encodedSubtypes]),
                ];
            } // else fall through to default
            return [type, getHex(data)];
        }
        case 'merkletree': {
            const merkleTreeType = getMerkleTreeType(types, ctx);
            const structHashes = data.map((struct) => {
                return encodeValue(types, merkleTreeType, struct, undefined, revision)[1];
            });
            const { root } = new merkle.MerkleTree(structHashes, revisionConfiguration[revision].hashMerkleMethod);
            return ['felt', root];
        }
        case 'selector': {
            return ['felt', prepareSelector(data)];
        }
        case 'string': {
            if (revision === typedData.TypedDataRevision.Active) {
                const byteArray$1 = byteArray.byteArrayFromString(data);
                const elements = [
                    byteArray$1.data.length,
                    ...byteArray$1.data,
                    byteArray$1.pending_word,
                    byteArray$1.pending_word_len,
                ];
                return [type, revisionConfiguration[revision].hashMethod(elements)];
            } // else fall through to default
            return [type, getHex(data)];
        }
        case 'i128': {
            if (revision === typedData.TypedDataRevision.Active) {
                const value = BigInt(data);
                assertRange(value, type, constants.RANGE_I128);
                return [type, getHex(value < 0n ? constants.PRIME + value : value)];
            } // else fall through to default
            return [type, getHex(data)];
        }
        case 'timestamp':
        case 'u128': {
            if (revision === typedData.TypedDataRevision.Active) {
                assertRange(data, type, constants.RANGE_U128);
            } // else fall through to default
            return [type, getHex(data)];
        }
        case 'felt':
        case 'shortstring': {
            // TODO: should 'shortstring' diverge into directly using encodeShortString()?
            if (revision === typedData.TypedDataRevision.Active) {
                assertRange(getHex(data), type, constants.RANGE_FELT);
            } // else fall through to default
            return [type, getHex(data)];
        }
        case 'ClassHash':
        case 'ContractAddress': {
            if (revision === typedData.TypedDataRevision.Active) {
                assertRange(data, type, constants.RANGE_FELT);
            } // else fall through to default
            return [type, getHex(data)];
        }
        case 'bool': {
            if (revision === typedData.TypedDataRevision.Active) {
                assert(typeof data === 'boolean', `Type mismatch for ${type} ${data}`);
            } // else fall through to default
            return [type, getHex(data)];
        }
        default: {
            if (revision === typedData.TypedDataRevision.Active) {
                throw new Error(`Unsupported type: ${type}`);
            }
            return [type, getHex(data)];
        }
    }
}
/**
 * Encode the data to an ABI encoded Buffer. The data should be a key -> value object with all the required values.
 * All dependent types are automatically encoded.
 */
function encodeData(types, type, data, revision = typedData.TypedDataRevision.Legacy) {
    const targetType = types[type] ?? revisionConfiguration[revision].presetTypes[type];
    const [returnTypes, values] = targetType.reduce(([ts, vs], field) => {
        if (data[field.name] === undefined ||
            (data[field.name] === null && field.type !== 'enum')) {
            throw new Error(`Cannot encode data: missing data for '${field.name}'`);
        }
        const value = data[field.name];
        const ctx = { parent: type, key: field.name };
        const [t, encodedValue] = encodeValue(types, field.type, value, ctx, revision);
        return [
            [...ts, t],
            [...vs, encodedValue],
        ];
    }, [['felt'], [getTypeHash(types, type, revision)]]);
    return [returnTypes, values];
}
/**
 * Get encoded data as a hash. The data should be a key -> value object with all the required values.
 * All dependent types are automatically encoded.
 */
function getStructHash(types, type, data, revision = typedData.TypedDataRevision.Legacy) {
    return revisionConfiguration[revision].hashMethod(encodeData(types, type, data, revision)[1]);
}
/**
 * Get the SNIP-12 encoded message to sign, from the typedData object.
 */
function getMessageHash(typedData, account) {
    if (!validateTypedData(typedData)) {
        throw new Error('Typed data does not match JSON schema');
    }
    const revision = identifyRevision(typedData);
    const { domain, hashMethod } = revisionConfiguration[revision];
    const message = [
        shortString.encodeShortString('StarkNet Message'),
        getStructHash(typedData.types, domain, typedData.domain, revision),
        account,
        getStructHash(typedData.types, typedData.primaryType, typedData.message, revision),
    ];
    return hashMethod(message);
}

exports.encodeData = encodeData;
exports.encodeType = encodeType;
exports.encodeValue = encodeValue;
exports.getDependencies = getDependencies;
exports.getMessageHash = getMessageHash;
exports.getStructHash = getStructHash;
exports.getTypeHash = getTypeHash;
exports.isMerkleTreeType = isMerkleTreeType;
exports.prepareSelector = prepareSelector;
