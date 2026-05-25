/**
 * Class Hash
 */
import { poseidonHashMany } from '../../../scure-starknet/index.js';
import { ADDR_BOUND, API_VERSION } from '../../constants.js';
import { CallData } from '../calldata/index.js';
import { felt } from '../calldata/cairo.js';
import { pedersen, poseidonHash, keccak } from '../../../scure-starknet/index.js';
import { addHexPrefix, utf8ToArray } from '../encode.js';
import { toHex } from '../num.js';
import { encodeShortString, isString } from '../shortString.js';
export function computePedersenHash(a, b) {
    return pedersen(BigInt(a), BigInt(b));
}
export function computePoseidonHash(a, b) {
    return toHex(poseidonHash(BigInt(a), BigInt(b)));
}
/**
 * Compute pedersen hash from data
 * @returns format: hex-string - pedersen hash
 */
export function computeHashOnElements(data) {
    return [...data, data.length]
        .reduce((x, y) => pedersen(BigInt(x), BigInt(y)), 0)
        .toString();
}
export const computePedersenHashOnElements = computeHashOnElements;
export function computePoseidonHashOnElements(data) {
    return toHex(poseidonHashMany(data.map((x) => BigInt(x))));
}
/**
 * Calculate contract address from class hash
 * @returns format: hex-string
 */
export function calculateContractAddressFromHash(salt, classHash, constructorCalldata, deployerAddress) {
    const compiledCalldata = CallData.compile(constructorCalldata);
    const constructorCalldataHash = computeHashOnElements(compiledCalldata);
    const CONTRACT_ADDRESS_PREFIX = felt('0x535441524b4e45545f434f4e54524143545f41444452455353'); // Equivalent to 'STARKNET_CONTRACT_ADDRESS'
    const hash = computeHashOnElements([
        CONTRACT_ADDRESS_PREFIX,
        deployerAddress,
        salt,
        classHash,
        constructorCalldataHash,
    ]);
    return toHex(BigInt(hash) % ADDR_BOUND);
}
function nullSkipReplacer(key, value) {
    if (key === 'attributes' || key === 'accessible_scopes') {
        return Array.isArray(value) && value.length === 0 ? undefined : value;
    }
    if (key === 'debug_info') {
        return null;
    }
    return value === null ? undefined : value;
}
/**
 * Format json-string to conform starknet json-string
 * @param json json-string
 * @returns format: json-string
 */
export function formatSpaces(json) {
    let insideQuotes = false;
    const newString = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const char of json) {
        if (char === '"' && (newString.length > 0 && newString.slice(-1)[0] === '\\') === false) {
            insideQuotes = !insideQuotes;
        }
        if (insideQuotes) {
            newString.push(char);
        }
        else {
            // eslint-disable-next-line no-nested-ternary
            newString.push(char === ':' ? ': ' : char === ',' ? ', ' : char);
        }
    }
    return newString.join('');
}
/**
 * Compute hinted class hash for legacy compiled contract (Cairo 0)
 * @returns format: hex-string
 */
export default function computeHintedClassHash(compiledContract) {
    const { abi, program } = compiledContract;
    const contractClass = { abi, program };
    const serializedJson = formatSpaces(JSON.stringify(contractClass, nullSkipReplacer));
    return addHexPrefix(keccak(utf8ToArray(serializedJson)).toString(16));
}
/**
 * Computes the class hash for legacy compiled contract (Cairo 0)
 * @returns format: hex-string
 */
export function computeLegacyContractClassHash(contract) {
    const compiledContract = isString(contract)
        ? JSON.parse(contract)
        : contract;
    const apiVersion = toHex(API_VERSION);
    const externalEntryPointsHash = computeHashOnElements(compiledContract.entry_points_by_type.EXTERNAL.flatMap((e) => [e.selector, e.offset]));
    const l1HandlerEntryPointsHash = computeHashOnElements(compiledContract.entry_points_by_type.L1_HANDLER.flatMap((e) => [e.selector, e.offset]));
    const constructorEntryPointHash = computeHashOnElements(compiledContract.entry_points_by_type.CONSTRUCTOR.flatMap((e) => [e.selector, e.offset]));
    const builtinsHash = computeHashOnElements(compiledContract.program.builtins.map((s) => encodeShortString(s)));
    const hintedClassHash = computeHintedClassHash(compiledContract);
    const dataHash = computeHashOnElements(compiledContract.program.data);
    return computeHashOnElements([
        apiVersion,
        externalEntryPointsHash,
        l1HandlerEntryPointsHash,
        constructorEntryPointHash,
        builtinsHash,
        hintedClassHash,
        dataHash,
    ]);
}
// Cairo 1 Contract Hashes
function hashBuiltins(builtins) {
    return poseidonHashMany(builtins.flatMap((it) => {
        return BigInt(encodeShortString(it));
    }));
}
function hashEntryPoint(data) {
    const base = data.flatMap((it) => {
        return [BigInt(it.selector), BigInt(it.offset), hashBuiltins(it.builtins)];
    });
    return poseidonHashMany(base);
}
/**
 * Compute hash of the bytecode for Sierra v1.5.0 onwards (Cairo 2.6.0)
 * Each segment is Poseidon hashed.
 * The global hash is : 1 + PoseidonHash(len0, h0, len1, h1, ...)
 * @param casm compiled Sierra CASM file content.
 * @returns the bytecode hash as bigint.
 */
export function hashByteCodeSegments(casm) {
    const byteCode = casm.bytecode.map((n) => BigInt(n));
    const bytecodeSegmentLengths = casm.bytecode_segment_lengths ?? [];
    let segmentStart = 0;
    const hashLeaves = bytecodeSegmentLengths.flatMap((len) => {
        const segment = byteCode.slice(segmentStart, (segmentStart += len));
        return [BigInt(len), poseidonHashMany(segment)];
    });
    return 1n + poseidonHashMany(hashLeaves);
}
/**
 * Compute compiled class hash for contract (Cairo 1)
 * @returns format: hex-string
 */
export function computeCompiledClassHash(casm) {
    const COMPILED_CLASS_VERSION = 'COMPILED_CLASS_V1';
    // Hash compiled class version
    const compiledClassVersion = BigInt(encodeShortString(COMPILED_CLASS_VERSION));
    // Hash external entry points.
    const externalEntryPointsHash = hashEntryPoint(casm.entry_points_by_type.EXTERNAL);
    // Hash L1 handler entry points.
    const l1Handlers = hashEntryPoint(casm.entry_points_by_type.L1_HANDLER);
    // Hash constructor entry points.
    const constructor = hashEntryPoint(casm.entry_points_by_type.CONSTRUCTOR);
    // Hash bytecode.
    const bytecode = casm.bytecode_segment_lengths
        ? hashByteCodeSegments(casm)
        : poseidonHashMany(casm.bytecode.map((it) => BigInt(it)));
    return toHex(poseidonHashMany([
        compiledClassVersion,
        externalEntryPointsHash,
        l1Handlers,
        constructor,
        bytecode,
    ]));
}
function hashEntryPointSierra(data) {
    const base = data.flatMap((it) => {
        return [BigInt(it.selector), BigInt(it.function_idx)];
    });
    return poseidonHashMany(base);
}
function hashAbi(sierra) {
    const indentString = formatSpaces(JSON.stringify(sierra.abi, null));
    return BigInt(addHexPrefix(keccak(utf8ToArray(indentString)).toString(16)));
}
/**
 * Compute sierra contract class hash (Cairo 1)
 * @returns format: hex-string
 */
export function computeSierraContractClassHash(sierra) {
    const CONTRACT_CLASS_VERSION = 'CONTRACT_CLASS_V0.1.0';
    // Hash class version
    const compiledClassVersion = BigInt(encodeShortString(CONTRACT_CLASS_VERSION));
    // Hash external entry points.
    const externalEntryPointsHash = hashEntryPointSierra(sierra.entry_points_by_type.EXTERNAL);
    // Hash L1 handler entry points.
    const l1Handlers = hashEntryPointSierra(sierra.entry_points_by_type.L1_HANDLER);
    // Hash constructor entry points.
    const constructor = hashEntryPointSierra(sierra.entry_points_by_type.CONSTRUCTOR);
    // Hash abi_hash.
    const abiHash = hashAbi(sierra);
    // Hash Sierra program.
    const sierraProgram = poseidonHashMany(sierra.sierra_program.map((it) => BigInt(it)));
    return toHex(poseidonHashMany([
        compiledClassVersion,
        externalEntryPointsHash,
        l1Handlers,
        constructor,
        abiHash,
        sierraProgram,
    ]));
}
/**
 * Compute ClassHash (sierra or legacy) based on provided contract
 * @returns format: hex-string
 */
export function computeContractClassHash(contract) {
    const compiledContract = isString(contract) ? JSON.parse(contract) : contract;
    if ('sierra_program' in compiledContract) {
        return computeSierraContractClassHash(compiledContract);
    }
    return computeLegacyContractClassHash(compiledContract);
}
