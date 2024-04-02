using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto.Generators
{
	/// <summary>
	/// Generates keys for the Poly1305 MAC.
	/// </summary>
	/// <remarks>
	/// Poly1305 keys are 256 bit keys consisting of a 128 bit secret key used for the underlying block
	/// cipher followed by a 128 bit {@code r} value used for the polynomial portion of the Mac. <br/>
	/// The {@code r} value has a specific format with some bits required to be cleared, resulting in an
	/// effective 106 bit key. <br/>
	/// A separately generated 256 bit key can be modified to fit the Poly1305 key format by using the
	/// {@link #clamp(byte[])} method to clear the required bits.
	/// </remarks>
	/// <seealso cref="Poly1305"/>
	public class Poly1305KeyGenerator
		: CipherKeyGenerator
	{
		private const byte R_MASK_LOW_2 = (byte)0xFC;
		private const byte R_MASK_HIGH_4 = (byte)0x0F;

		/// <summary>
		/// Initialises the key generator.
		/// </summary>
		/// <remarks>
		/// Poly1305 keys are always 256 bits, so the key length in the provided parameters is ignored.
		/// </remarks>
		protected override void engineInit(KeyGenerationParameters param)
		{
			// Poly1305 keys are always 256 bits
			this.random = param.Random;
			this.strength = 32;
		}

		/// <summary>
		/// Generates a 256 bit key in the format required for Poly1305 - e.g.
		/// <code>k[0] ... k[15], r[0] ... r[15]</code> with the required bits in <code>r</code> cleared
		/// as per <see cref="Clamp(byte[])"/>.
		/// </summary>
		protected override byte[] engineGenerateKey()
		{
			byte[] key = base.engineGenerateKey();
			Clamp(key);
			return key;
		}

		/// <summary>
		/// Modifies an existing 32 byte key value to comply with the requirements of the Poly1305 key by
		/// clearing required bits in the <code>r</code> (second 16 bytes) portion of the key.<br/>
		/// Specifically:
		/// <ul>
		/// <li>r[3], r[7], r[11], r[15] have top four bits clear (i.e., are {0, 1, . . . , 15})</li>
		/// <li>r[4], r[8], r[12] have bottom two bits clear (i.e., are in {0, 4, 8, . . . , 252})</li>
		/// </ul>
		/// </summary>
		/// <param name="key">a 32 byte key value <code>k[0] ... k[15], r[0] ... r[15]</code></param>
		public static void Clamp(byte[] key)
		{
			/*
	         * Key is k[0] ... k[15], r[0] ... r[15] as per poly1305_aes_clamp in ref impl.
	         */
			if (key.Length != 32)
				throw new ArgumentException("Poly1305 key must be 256 bits.");

            /*
	         * r[3], r[7], r[11], r[15] have top four bits clear (i.e., are {0, 1, . . . , 15})
	         */
			key[3] &= R_MASK_HIGH_4;
			key[7] &= R_MASK_HIGH_4;
			key[11] &= R_MASK_HIGH_4;
			key[15] &= R_MASK_HIGH_4;

			/*
	         * r[4], r[8], r[12] have bottom two bits clear (i.e., are in {0, 4, 8, . . . , 252}).
	         */
			key[4] &= R_MASK_LOW_2;
			key[8] &= R_MASK_LOW_2;
			key[12] &= R_MASK_LOW_2;
		}

        /// <summary>
		/// Checks a 32 byte key for compliance with the Poly1305 key requirements, e.g.
		/// <code>k[0] ... k[15], r[0] ... r[15]</code> with the required bits in <code>r</code> cleared
		/// as per <see cref="Clamp(byte[])"/>.
		/// </summary>
		/// <param name="key">Key.</param>
		/// <exception cref="System.ArgumentException">if the key is of the wrong length, or has invalid bits set
		///           in the <code>r</code> portion of the key.</exception>
		public static void CheckKey(byte[] key)
		{
			if (key.Length != 32)
				throw new ArgumentException("Poly1305 key must be 256 bits.");

            CheckMask(key[3], R_MASK_HIGH_4);
			CheckMask(key[7], R_MASK_HIGH_4);
			CheckMask(key[11], R_MASK_HIGH_4);
			CheckMask(key[15], R_MASK_HIGH_4);

			CheckMask(key[4], R_MASK_LOW_2);
			CheckMask(key[8], R_MASK_LOW_2);
			CheckMask(key[12], R_MASK_LOW_2);
		}

        private static void CheckMask(byte b, byte mask)
		{
			if ((b & (~mask)) != 0)
				throw new ArgumentException("Invalid format for r portion of Poly1305 key.");
		}
	}
}