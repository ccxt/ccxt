'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sha3 = require('../noble-hashes/sha3.js');
var sha256 = require('../noble-hashes/sha256.js');
var utils$2 = require('../noble-hashes/utils.js');
var modular = require('../noble-curves/abstract/modular.js');
var poseidon = require('../noble-curves/abstract/poseidon.js');
var weierstrass = require('../noble-curves/abstract/weierstrass.js');
var utils$1 = require('../noble-curves/abstract/utils.js');
var _shortw_utils = require('../noble-curves/_shortw_utils.js');

// ----------------------------------------------------------------------------
const CURVE_ORDER = BigInt('3618502788666131213697322783095070105526743751716087489154079457884512865583');
// 2**251, limit for msgHash and Signature.r
const MAX_VALUE = BigInt('0x800000000000000000000000000000000000000000000000000000000000000');
const nBitLength = 252;
function bits2int(bytes) {
    while (bytes[0] === 0)
        bytes = bytes.subarray(1); // strip leading 0s
    // Copy-pasted from weierstrass.ts
    const delta = bytes.length * 8 - nBitLength;
    const num = utils$1.bytesToNumberBE(bytes);
    return delta > 0 ? num >> BigInt(delta) : num;
}
function hex0xToBytes(hex) {
    if (typeof hex === 'string') {
        hex = strip0x(hex); // allow 0x prefix
        if (hex.length & 1)
            hex = '0' + hex; // allow unpadded hex
    }
    return utils$1.hexToBytes(hex);
}
const curve = weierstrass.weierstrass({
    a: BigInt(1),
    b: BigInt('3141592653589793238462643383279502884197169399375105820974944592307816406665'),
    // Field over which we'll do calculations; 2n**251n + 17n * 2n**192n + 1n
    // There is no efficient sqrt for field (P%4==1)
    Fp: modular.Fp(BigInt('0x800000000000011000000000000000000000000000000000000000000000001')),
    n: CURVE_ORDER,
    nBitLength,
    // Base point (x, y) aka generator point
    Gx: BigInt('874739451078007766457464989774322083649278607533249481151382481072868806602'),
    Gy: BigInt('152666792071518830868575557812948353041420400780739481342941381225525861407'),
    h: BigInt(1),
    lowS: false,
    ..._shortw_utils.getHash(sha256.sha256),
    // Custom truncation routines for stark curve
    bits2int,
    bits2int_modN: (bytes) => {
        // 2102820b232636d200cb21f1d330f20d096cae09d1bf3edb1cc333ddee11318 =>
        // 2102820b232636d200cb21f1d330f20d096cae09d1bf3edb1cc333ddee113180
        const hex = utils$1.bytesToNumberBE(bytes).toString(16); // toHex unpadded
        if (hex.length === 63)
            bytes = hex0xToBytes(hex + '0'); // append trailing 0
        return modular.mod(bits2int(bytes), CURVE_ORDER);
    },
});
function ensureBytes(hex) {
    return utils$1.ensureBytes('', typeof hex === 'string' ? hex0xToBytes(hex) : hex);
}
function normPrivKey(privKey) {
    return utils$1.bytesToHex(ensureBytes(privKey)).padStart(64, '0');
}
function getPublicKey(privKey, isCompressed = false) {
    return curve.getPublicKey(normPrivKey(privKey), isCompressed);
}
function checkSignature(signature) {
    // Signature.s checked inside weierstrass
    const { r, s } = signature;
    if (r < 0n || r >= MAX_VALUE)
        throw new Error(`Signature.r should be [1, ${MAX_VALUE})`);
    const w = modular.invert(s, CURVE_ORDER);
    if (w < 0n || w >= MAX_VALUE)
        throw new Error(`inv(Signature.s) should be [1, ${MAX_VALUE})`);
}
function checkMessage(msgHash) {
    const bytes = ensureBytes(msgHash);
    const num = utils$1.bytesToNumberBE(bytes);
    // num < 0 impossible here
    if (num >= MAX_VALUE)
        throw new Error(`msgHash should be [0, ${MAX_VALUE})`);
    return bytes;
}
function sign(msgHash, privKey, opts) {
    const sig = curve.sign(checkMessage(msgHash), normPrivKey(privKey), opts);
    checkSignature(sig);
    return sig;
}
const { CURVE, ProjectivePoint, Signature, utils } = curve;
function extractX(bytes) {
    const hex = utils$1.bytesToHex(bytes.subarray(1));
    const stripped = hex.replace(/^0+/gm, ''); // strip leading 0s
    return `0x${stripped}`;
}
function strip0x(hex) {
    return hex.replace(/^0x/i, '');
}
// seed generation
function grindKey(seed) {
    const _seed = ensureBytes(seed);
    const sha256mask = 2n ** 256n;
    const limit = sha256mask - modular.mod(sha256mask, CURVE_ORDER);
    for (let i = 0;; i++) {
        const key = sha256Num(utils$1.concatBytes(_seed, utils$1.numberToVarBytesBE(BigInt(i))));
        if (key < limit)
            return modular.mod(key, CURVE_ORDER).toString(16); // key should be in [0, limit)
        if (i === 100000)
            throw new Error('grindKey is broken: tried 100k vals'); // prevent dos
    }
}
function getStarkKey(privateKey) {
    return extractX(getPublicKey(privateKey, true));
}
function ethSigToPrivate(signature) {
    signature = strip0x(signature);
    if (signature.length !== 130)
        throw new Error('Wrong ethereum signature');
    return grindKey(signature.substring(0, 64));
}
// The Pedersen hash uses five different points on the curve.
// This is critical to ensure that they have been generated in a way
// that nobody knows the discrete logarithm of one point regarding another.
//
// Starknet utilizes nothing-up-my-sleeve technique:
// The parameters of the Pedersen hash are generated from the constant 𝜋.
// The x-coordinate of each point is a chunk of 76 decimal digit of 𝜋 modulo 𝑝.
// If it is a quadratic residue then the point is valid
// else the x-coordinate coordinate is incremented by one.
// https://docs.starkware.co/starkex/pedersen-hash-function.html
// https://github.com/starkware-libs/starkex-for-spot-trading/blob/607f0b4ce507e1d95cd018d206a2797f6ba4aab4/src/starkware/crypto/starkware/crypto/signature/nothing_up_my_sleeve_gen.py
const PEDERSEN_POINTS = [
    new ProjectivePoint(2089986280348253421170679821480865132823066470938446095505822317253594081284n, 1713931329540660377023406109199410414810705867260802078187082345529207694986n, 1n),
    new ProjectivePoint(996781205833008774514500082376783249102396023663454813447423147977397232763n, 1668503676786377725805489344771023921079126552019160156920634619255970485781n, 1n),
    new ProjectivePoint(2251563274489750535117886426533222435294046428347329203627021249169616184184n, 1798716007562728905295480679789526322175868328062420237419143593021674992973n, 1n),
    new ProjectivePoint(2138414695194151160943305727036575959195309218611738193261179310511854807447n, 113410276730064486255102093846540133784865286929052426931474106396135072156n, 1n),
    new ProjectivePoint(2379962749567351885752724891227938183011949129833673362440656643086021394946n, 776496453633298175483985398648758586525933812536653089401905292063708816422n, 1n),
];
function pedersenPrecompute(p1, p2) {
    const out = [];
    let p = p1;
    for (let i = 0; i < 248; i++) {
        out.push(p);
        p = p.double();
    }
    // NOTE: we cannot use wNAF here, because last 4 bits will require full 248 bits multiplication
    // We can add support for this to wNAF, but it will complicate wNAF.
    p = p2;
    for (let i = 0; i < 4; i++) {
        out.push(p);
        p = p.double();
    }
    return out;
}
const PEDERSEN_POINTS1 = pedersenPrecompute(PEDERSEN_POINTS[1], PEDERSEN_POINTS[2]);
const PEDERSEN_POINTS2 = pedersenPrecompute(PEDERSEN_POINTS[3], PEDERSEN_POINTS[4]);
function pedersenArg(arg) {
    let value;
    if (typeof arg === 'bigint') {
        value = arg;
    }
    else if (typeof arg === 'number') {
        if (!Number.isSafeInteger(arg))
            throw new Error(`Invalid pedersenArg: ${arg}`);
        value = BigInt(arg);
    }
    else {
        value = utils$1.bytesToNumberBE(ensureBytes(arg));
    }
    if (!(0n <= value && value < curve.CURVE.Fp.ORDER))
        throw new Error(`PedersenArg should be 0 <= value < CURVE.P: ${value}`); // [0..Fp)
    return value;
}
/**
 * Warning: Not algorithmic constant-time.
 */
function pedersenSingle(point, value, constants) {
    let x = pedersenArg(value);
    for (let j = 0; j < 252; j++) {
        const pt = constants[j];
        if (!pt)
            throw new Error('invalid constant index');
        if (pt.equals(point))
            throw new Error('Same point');
        if ((x & 1n) !== 0n)
            point = point.add(pt);
        x >>= 1n;
    }
    return point;
}
// shift_point + x_low * P_0 + x_high * P1 + y_low * P2  + y_high * P3
function pedersen(x, y) {
    let point = PEDERSEN_POINTS[0];
    point = pedersenSingle(point, x, PEDERSEN_POINTS1);
    point = pedersenSingle(point, y, PEDERSEN_POINTS2);
    return extractX(point.toRawBytes(true));
}
const MASK_250 = utils$1.bitMask(250);
const keccak = (data) => utils$1.bytesToNumberBE(sha3.keccak_256(data)) & MASK_250;
const sha256Num = (data) => utils$1.bytesToNumberBE(sha256.sha256(data));
// Poseidon hash
// Unused for now
// export const Fp253 = Fp(
//   BigInt('14474011154664525231415395255581126252639794253786371766033694892385558855681')
// ); // 2^253 + 2^199 + 1
const Fp251 = modular.Fp(BigInt('3618502788666131213697322783095070105623107215331596699973092056135872020481')); // 2^251 + 17 * 2^192 + 1
function poseidonRoundConstant(Fp, name, idx) {
    const val = Fp.fromBytes(sha256.sha256(utils$2.utf8ToBytes(`${name}${idx}`)));
    return Fp.create(val);
}
const MDS_SMALL = [
    [3, 1, 1],
    [1, -1, 1],
    [1, 1, -2],
].map((i) => i.map(BigInt));
function poseidonBasic(opts, mds) {
    modular.validateField(opts.Fp);
    if (!Number.isSafeInteger(opts.rate) || !Number.isSafeInteger(opts.capacity))
        throw new Error(`Wrong poseidon opts: ${opts}`);
    const m = opts.rate + opts.capacity;
    const rounds = opts.roundsFull + opts.roundsPartial;
    const roundConstants = [];
    for (let i = 0; i < rounds; i++) {
        const row = [];
        for (let j = 0; j < m; j++)
            row.push(poseidonRoundConstant(opts.Fp, 'Hades', m * i + j));
        roundConstants.push(row);
    }
    const res = poseidon.poseidon({
        ...opts,
        t: m,
        sboxPower: 3,
        reversePartialPowIdx: true,
        mds,
        roundConstants,
    });
    res.m = m;
    res.rate = opts.rate;
    res.capacity = opts.capacity;
    return res;
}
const poseidonSmall = poseidonBasic({ Fp: Fp251, rate: 2, capacity: 1, roundsFull: 8, roundsPartial: 83 }, MDS_SMALL);
function poseidonHash(x, y, fn = poseidonSmall) {
    return fn([x, y, 2n])[0];
}
function poseidonHashMany(values, fn = poseidonSmall) {
    const { m, rate } = fn;
    if (!Array.isArray(values))
        throw new Error('bigint array expected in values');
    const padded = Array.from(values); // copy
    padded.push(1n);
    while (padded.length % rate !== 0)
        padded.push(0n);
    let state = new Array(m).fill(0n);
    for (let i = 0; i < padded.length; i += rate) {
        for (let j = 0; j < rate; j++) {
            const item = padded[i + j];
            if (typeof item === 'undefined')
                throw new Error('invalid index');
            state[j] += item;
        }
        state = fn(state);
    }
    return state[0];
}

exports.CURVE = CURVE;
exports.Fp251 = Fp251;
exports.MAX_VALUE = MAX_VALUE;
exports.ProjectivePoint = ProjectivePoint;
exports.Signature = Signature;
exports.ethSigToPrivate = ethSigToPrivate;
exports.getPublicKey = getPublicKey;
exports.getStarkKey = getStarkKey;
exports.grindKey = grindKey;
exports.keccak = keccak;
exports.pedersen = pedersen;
exports.poseidonBasic = poseidonBasic;
exports.poseidonHash = poseidonHash;
exports.poseidonHashMany = poseidonHashMany;
exports.poseidonSmall = poseidonSmall;
exports.sign = sign;
exports.utils = utils;
