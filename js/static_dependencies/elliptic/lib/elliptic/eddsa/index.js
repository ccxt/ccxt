'use strict';

var curves = require('../curves');
var utils = require('../utils');
var assert = utils.assert;
var parseBytes = utils.parseBytes;
var KeyPair = require('./key');
var Signature = require('./signature');
const BN = require ('../../../../BN/bn.js')
const { byteArrayToWordArray } = require ('../../../../../base/functions/encode')
const CryptoJS = require('../../../../crypto-js/crypto-js');


function EDDSA(curveName) {
  assert(curveName === 'ed25519', 'only tested with ed25519 so far');

  if (!(this instanceof EDDSA))
    return new EDDSA(curveName);

  var curve = curves[curveName].curve;
  this.curve = curve;
  this.g = curve.g;
  this.g.precompute(curve.n.bitLength() + 1);

  this.pointClass = curve.point().constructor;
  this.encodingLength = Math.ceil(curve.n.bitLength() / 8);
  //this.hash = hash.sha512;
}

module.exports = EDDSA;

/**
* @param {Array|String} message - message bytes
* @param {Array|String|KeyPair} secret - secret bytes or a keypair
* @returns {Signature} - signature
*/
EDDSA.prototype.sign = function sign(message, secret) {
  message = parseBytes(message);
  var key = this.keyFromSecret(secret);
  var r = this.hashInt(key.secret (), message);
  var R = this.g.mul(r);
  var Rencoded = this.encodePoint(R);
  var s_ = this.hashInt(Rencoded, key.pubBytes(), message)
  s_ = s_.mul (key.priv ())
  var S = r.add(s_).umod(this.curve.n);
  return this.makeSignature({ R: R, S: S, Rencoded: Rencoded });
};

/**
 * @param {Array|String} message - message bytes
 * @param {Array|String|KeyPair} secret - secret bytes or a keypair
 * @returns {Signature} - signature
 */
EDDSA.prototype.signModified = function sign(message, secret) {
  message = parseBytes(message);
  var key = this.keyFromSecret(secret);
  // convert between curve25519 and ed25519 keys
  const secretLE = new BN (key.secret (), 16, 'le')
  const pubKey = this.encodePoint (this.g.mul (secretLE))
  const signBit = pubKey[31] & 0x80
  var r = this.hashInt (key.secret (), message)
  var R = this.g.mul(r);
  var Rencoded = this.encodePoint (R);
  let s_ = this.hashInt (Rencoded, pubKey, message)
  s_ = s_.mul (secretLE)
  var S = r.add(s_).umod(this.curve.n);
  var Sencoded = S.toArray ('le')
  Sencoded[31] |= signBit
  return this.makeSignature({ R: R, S: S, Rencoded: Rencoded, Sencoded: Sencoded });
};


/**
* @param {Array} message - message bytes
* @param {Array|String|Signature} sig - sig bytes
* @param {Array|String|Point|KeyPair} pub - public key
* @returns {Boolean} - true if public key matches sig of message
*/
EDDSA.prototype.verify = function verify(message, sig, pub) {
  message = parseBytes(message);
  sig = this.makeSignature(sig);
  var key = this.keyFromPublic(pub);
  var h = this.hashInt(sig.Rencoded(), key.pubBytes(), message);
  var SG = this.g.mul(sig.S());
  var RplusAh = sig.R().add(key.pub().mul(h));
  return RplusAh.eq(SG);
};

EDDSA.prototype.hashInt = function hashInt() {
  let toHash = Array.from (arguments).reduce ((a, b) => a.concat (b))
  toHash = byteArrayToWordArray (toHash)
  const digest = CryptoJS['SHA512'] (toHash).toString (CryptoJS.enc.Hex)
  return utils.intFromLE(digest).umod(this.curve.n);
};

EDDSA.prototype.keyFromPublic = function keyFromPublic(pub) {
  return KeyPair.fromPublic(this, pub);
};

EDDSA.prototype.keyFromSecret = function keyFromSecret(secret) {
  return KeyPair.fromSecret(this, secret);
};

EDDSA.prototype.makeSignature = function makeSignature(sig) {
  if (sig instanceof Signature)
    return sig;
  return new Signature(this, sig);
};

/**
* * https://tools.ietf.org/html/draft-josefsson-eddsa-ed25519-03#section-5.2
*
* EDDSA defines methods for encoding and decoding points and integers. These are
* helper convenience methods, that pass along to utility functions implied
* parameters.
*
*/
EDDSA.prototype.encodePoint = function encodePoint(point) {
  var enc = point.getY().toArray('le', this.encodingLength);
  enc[this.encodingLength - 1] |= point.getX().isOdd() ? 0x80 : 0;
  return enc;
};

EDDSA.prototype.decodePoint = function decodePoint(bytes) {
  bytes = utils.parseBytes(bytes);

  var lastIx = bytes.length - 1;
  var normed = bytes.slice(0, lastIx).concat(bytes[lastIx] & ~0x80);
  var xIsOdd = (bytes[lastIx] & 0x80) !== 0;

  var y = utils.intFromLE(normed);
  return this.curve.pointFromY(y, xIsOdd);
};

EDDSA.prototype.encodeInt = function encodeInt(num) {
  return num.toArray('le', this.encodingLength);
};

EDDSA.prototype.decodeInt = function decodeInt(bytes) {
  return utils.intFromLE(bytes);
};

EDDSA.prototype.isPoint = function isPoint(val) {
  return val instanceof this.pointClass;
};
