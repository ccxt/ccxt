import { WordArray, Hasher } from './core.js';
import { SHA512 } from './sha512.js';
import { X64Word, X64WordArray } from './x64-core.js';

/**
 * SHA-384 hash algorithm.
 */
var SHA384 = SHA512.extend({
	_doReset: function () {
		this._hash = new X64WordArray.init([
			new X64Word.init(0xcbbb9d5d, 0xc1059ed8), new X64Word.init(0x629a292a, 0x367cd507),
			new X64Word.init(0x9159015a, 0x3070dd17), new X64Word.init(0x152fecd8, 0xf70e5939),
			new X64Word.init(0x67332667, 0xffc00b31), new X64Word.init(0x8eb44a87, 0x68581511),
			new X64Word.init(0xdb0c2e0d, 0x64f98fa7), new X64Word.init(0x47b5481d, 0xbefa4fa4)
		]);
	},

	_doFinalize: function () {
		var hash = SHA512._doFinalize.call(this);

		hash.sigBytes -= 16;

		return hash;
	}
});

/**
 * Shortcut function to the hasher's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 *
 * @return {WordArray} The hash.
 *
 * @static
 *
 * @example
 *
 *     var hash = CryptoJS.SHA384('message');
 *     var hash = CryptoJS.SHA384(wordArray);
 */
const sha384 = SHA512._createHelper(SHA384);

/**
 * Shortcut function to the HMAC's object interface.
 *
 * @param {WordArray|string} message The message to hash.
 * @param {WordArray|string} key The secret key.
 *
 * @return {WordArray} The HMAC.
 *
 * @static
 *
 * @example
 *
 *     var hmac = CryptoJS.HmacSHA384(message, key);
 */
const hmacSHA384 = SHA512._createHmacHelper(SHA384);

export { sha384, hmacSHA384 };
