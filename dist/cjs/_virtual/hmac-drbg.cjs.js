'use strict';

var _commonjsHelpers = require('./_commonjsHelpers.js');

const commonjsRegister = _commonjsHelpers.commonjsRegister;
commonjsRegister("/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/hmac-drbg/hmac-drbg.cjs", function (module, exports) {
var CryptoJS = _commonjsHelpers.commonjsRequire("../../../crypto-js/crypto-js.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/hmac-drbg");
var assert = _commonjsHelpers.commonjsRequire("../elliptic/utils.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/hmac-drbg").assert;
var utils = _commonjsHelpers.commonjsRequire("../elliptic/utils.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/hmac-drbg");
// some static stuff
const ONE = CryptoJS.enc.Utf8.parse('\x01');
const ZERO = CryptoJS.enc.Utf8.parse('\x00');
function byteArrayToWordArray(ba) {
    const wa = [];
    for (let i = 0; i < ba.length; i++) {
        wa[(i / 4) | 0] |= ba[i] << (24 - 8 * i);
    }
    return CryptoJS.lib.WordArray.create(wa, ba.length);
}
function HmacDRBG(options) {
    if (!(this instanceof HmacDRBG))
        return new HmacDRBG(options);
    this.hash = options.hash;
    this.predResist = !!options.predResist;
    this.outLen = this.hash.slice(3, 6); // only support SHAXXX hashes
    this.minEntropy = options.minEntropy || 192;
    this._reseed = null;
    this.reseedInterval = null;
    this.K = null;
    this.V = null;
    this.byteArrayToWordArray = byteArrayToWordArray;
    var entropy = options.entropy;
    var nonce = options.nonce;
    var pers = [];
    assert(entropy.length >= (this.minEntropy / 8), 'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');
    this._init(entropy, nonce, pers);
}
module.exports = HmacDRBG;
HmacDRBG.prototype._init = async function init(entropy, nonce, pers) {
    var seed = entropy.concat(nonce).concat(pers);
    this.K = new CryptoJS.lib.WordArray.init();
    this.V = new CryptoJS.lib.WordArray.init();
    const magicNumber = (1 << 24) + (1 << 16) + (1 << 8) + 1;
    this.V.words = Array(this.outLen / 32).fill(magicNumber);
    this.V.sigBytes = 32;
    this._update(seed);
    this._reseed = 1;
    this.reseedInterval = 0x1000000000000; // 2^48
};
HmacDRBG.prototype._hmac = function hmac() {
    return new CryptoJS.lib.WordArray.init();
};
HmacDRBG.prototype._update = function update(seed) {
    var kmac = this._hmac();
    kmac.concat(this.V);
    kmac.concat(ZERO);
    if (seed)
        kmac.concat(this.byteArrayToWordArray(seed));
    this.K = CryptoJS['Hmac' + this.hash](kmac, this.K);
    this.V = CryptoJS['Hmac' + this.hash](this.V, this.K);
    if (!seed)
        return;
    kmac = this._hmac();
    kmac.concat(this.V);
    kmac.concat(ONE);
    kmac.concat(this.byteArrayToWordArray(seed));
    this.K = CryptoJS['Hmac' + this.hash](kmac, this.K);
    this.V = CryptoJS['Hmac' + this.hash](this.V, this.K);
};
HmacDRBG.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
    // Optional entropy enc
    if (typeof entropyEnc !== 'string') {
        add = entropyEnc;
        entropyEnc = null;
    }
    //entropy = utils.toArray(entropy, entropyEnc);
    //add = utils.toArray(add, addEnc);
    assert(entropy.length >= (this.minEntropy / 8), 'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');
    this._update(entropy.concat(add || []));
    this._reseed = 1;
};
HmacDRBG.prototype.generate = function generate(len, enc, add, addEnc) {
    if (this._reseed > this.reseedInterval)
        throw new Error('Reseed is required');
    // Optional encoding
    if (typeof enc !== 'string') {
        add = enc;
        enc = null;
    }
    // Optional additional data
    if (add) {
        add = CryptoJS.enc.Utf8.parse(add);
        this._update(add);
    }
    var res = new CryptoJS.lib.WordArray.init();
    while (res.sigBytes < len) {
        this.V = CryptoJS['Hmac' + this.hash](this.V, this.K);
        res.concat(this.V);
    }
    this._update(add);
    this._reseed++;
    return utils.wordArrayToBuffer(res);
};

});
