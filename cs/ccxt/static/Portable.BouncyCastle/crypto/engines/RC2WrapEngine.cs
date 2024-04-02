using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
	/**
	 * Wrap keys according to RFC 3217 - RC2 mechanism
	 */
	public class RC2WrapEngine
		: IWrapper
	{
		/** Field engine */
		private CbcBlockCipher engine;

		/** Field param */
		private ICipherParameters parameters;

		/** Field paramPlusIV */
		private ParametersWithIV paramPlusIV;

		/** Field iv */
		private byte[] iv;

		/** Field forWrapping */
		private bool forWrapping;

		private SecureRandom sr;

		/** Field IV2           */
		private static readonly byte[] IV2 =
		{
			(byte) 0x4a, (byte) 0xdd, (byte) 0xa2,
			(byte) 0x2c, (byte) 0x79, (byte) 0xe8,
			(byte) 0x21, (byte) 0x05
		};

		//
		// checksum digest
		//
		IDigest sha1 = new Sha1Digest();
		byte[] digest = new byte[20];

		/**
			* Method init
			*
			* @param forWrapping
			* @param param
			*/
        public virtual void Init(
			bool				forWrapping,
			ICipherParameters	parameters)
		{
			this.forWrapping = forWrapping;
			this.engine = new CbcBlockCipher(new RC2Engine());

			if (parameters is ParametersWithRandom)
			{
				ParametersWithRandom pWithR = (ParametersWithRandom)parameters;
				sr = pWithR.Random;
				parameters = pWithR.Parameters;
			}
			else
			{
				sr = new SecureRandom();
			}

			if (parameters is ParametersWithIV)
			{
				if (!forWrapping)
					throw new ArgumentException("You should not supply an IV for unwrapping");

				this.paramPlusIV = (ParametersWithIV)parameters;
				this.iv = this.paramPlusIV.GetIV();
				this.parameters = this.paramPlusIV.Parameters;

				if (this.iv.Length != 8)
					throw new ArgumentException("IV is not 8 octets");
			}
			else
			{
				this.parameters = parameters;

				if (this.forWrapping)
				{
					// Hm, we have no IV but we want to wrap ?!?
					// well, then we have to create our own IV.
					this.iv = new byte[8];
					sr.NextBytes(iv);
					this.paramPlusIV = new ParametersWithIV(this.parameters, this.iv);
				}
			}
		}

		/**
		* Method GetAlgorithmName
		*
		* @return
		*/
        public virtual string AlgorithmName
		{
			get { return "RC2"; }
		}

		/**
		* Method wrap
		*
		* @param in
		* @param inOff
		* @param inLen
		* @return
		*/
        public virtual byte[] Wrap(
			byte[]	input,
			int		inOff,
			int		length)
		{
			if (!forWrapping)
			{
				throw new InvalidOperationException("Not initialized for wrapping");
			}

			int len = length + 1;
			if ((len % 8) != 0)
			{
				len += 8 - (len % 8);
			}

			byte [] keyToBeWrapped = new byte[len];

			keyToBeWrapped[0] = (byte)length;
			Array.Copy(input, inOff, keyToBeWrapped, 1, length);

			byte[] pad = new byte[keyToBeWrapped.Length - length - 1];

			if (pad.Length > 0)
			{
				sr.NextBytes(pad);
				Array.Copy(pad, 0, keyToBeWrapped, length + 1, pad.Length);
			}

			// Compute the CMS Key Checksum, (section 5.6.1), call this CKS.
			byte[] CKS = CalculateCmsKeyChecksum(keyToBeWrapped);

			// Let WKCKS = WK || CKS where || is concatenation.
			byte[] WKCKS = new byte[keyToBeWrapped.Length + CKS.Length];

			Array.Copy(keyToBeWrapped, 0, WKCKS, 0, keyToBeWrapped.Length);
			Array.Copy(CKS, 0, WKCKS, keyToBeWrapped.Length, CKS.Length);

			// Encrypt WKCKS in CBC mode using KEK as the key and IV as the
			// initialization vector. Call the results TEMP1.
			byte [] TEMP1 = new byte[WKCKS.Length];

			Array.Copy(WKCKS, 0, TEMP1, 0, WKCKS.Length);

			int noOfBlocks = WKCKS.Length / engine.GetBlockSize();
			int extraBytes = WKCKS.Length % engine.GetBlockSize();

			if (extraBytes != 0)
			{
				throw new InvalidOperationException("Not multiple of block length");
			}

			engine.Init(true, paramPlusIV);

			for (int i = 0; i < noOfBlocks; i++)
			{
				int currentBytePos = i * engine.GetBlockSize();

				engine.ProcessBlock(TEMP1, currentBytePos, TEMP1, currentBytePos);
			}

			// Left TEMP2 = IV || TEMP1.
			byte[] TEMP2 = new byte[this.iv.Length + TEMP1.Length];

			Array.Copy(this.iv, 0, TEMP2, 0, this.iv.Length);
			Array.Copy(TEMP1, 0, TEMP2, this.iv.Length, TEMP1.Length);

			// Reverse the order of the octets in TEMP2 and call the result TEMP3.
			byte[] TEMP3 = new byte[TEMP2.Length];

			for (int i = 0; i < TEMP2.Length; i++)
			{
				TEMP3[i] = TEMP2[TEMP2.Length - (i + 1)];
			}

			// Encrypt TEMP3 in CBC mode using the KEK and an initialization vector
			// of 0x 4a dd a2 2c 79 e8 21 05. The resulting cipher text is the desired
			// result. It is 40 octets long if a 168 bit key is being wrapped.
			ParametersWithIV param2 = new ParametersWithIV(this.parameters, IV2);

			this.engine.Init(true, param2);

			for (int i = 0; i < noOfBlocks + 1; i++)
			{
				int currentBytePos = i * engine.GetBlockSize();

				engine.ProcessBlock(TEMP3, currentBytePos, TEMP3, currentBytePos);
			}

			return TEMP3;
		}

		/**
		* Method unwrap
		*
		* @param in
		* @param inOff
		* @param inLen
		* @return
		* @throws InvalidCipherTextException
		*/
        public virtual byte[] Unwrap(
			byte[]	input,
			int		inOff,
			int		length)
		{
			if (forWrapping)
			{
				throw new InvalidOperationException("Not set for unwrapping");
			}

			if (input == null)
			{
				throw new InvalidCipherTextException("Null pointer as ciphertext");
			}

			if (length % engine.GetBlockSize() != 0)
			{
				throw new InvalidCipherTextException("Ciphertext not multiple of "
					+ engine.GetBlockSize());
			}

			/*
			// Check if the length of the cipher text is reasonable given the key
			// type. It must be 40 bytes for a 168 bit key and either 32, 40, or
			// 48 bytes for a 128, 192, or 256 bit key. If the length is not supported
			// or inconsistent with the algorithm for which the key is intended,
			// return error.
			//
			// we do not accept 168 bit keys. it has to be 192 bit.
			int lengthA = (estimatedKeyLengthInBit / 8) + 16;
			int lengthB = estimatedKeyLengthInBit % 8;

			if ((lengthA != keyToBeUnwrapped.Length) || (lengthB != 0)) {
				throw new XMLSecurityException("empty");
			}
			*/

			// Decrypt the cipher text with TRIPLedeS in CBC mode using the KEK
			// and an initialization vector (IV) of 0x4adda22c79e82105. Call the output TEMP3.
			ParametersWithIV param2 = new ParametersWithIV(this.parameters, IV2);

			this.engine.Init(false, param2);

			byte [] TEMP3 = new byte[length];

			Array.Copy(input, inOff, TEMP3, 0, length);

			for (int i = 0; i < (TEMP3.Length / engine.GetBlockSize()); i++)
			{
				int currentBytePos = i * engine.GetBlockSize();

				engine.ProcessBlock(TEMP3, currentBytePos, TEMP3, currentBytePos);
			}

			// Reverse the order of the octets in TEMP3 and call the result TEMP2.
			byte[] TEMP2 = new byte[TEMP3.Length];

			for (int i = 0; i < TEMP3.Length; i++)
			{
				TEMP2[i] = TEMP3[TEMP3.Length - (i + 1)];
			}

			// Decompose TEMP2 into IV, the first 8 octets, and TEMP1, the remaining octets.
			this.iv = new byte[8];

			byte[] TEMP1 = new byte[TEMP2.Length - 8];

			Array.Copy(TEMP2, 0, this.iv, 0, 8);
			Array.Copy(TEMP2, 8, TEMP1, 0, TEMP2.Length - 8);

			// Decrypt TEMP1 using TRIPLedeS in CBC mode using the KEK and the IV
			// found in the previous step. Call the result WKCKS.
			this.paramPlusIV = new ParametersWithIV(this.parameters, this.iv);

			this.engine.Init(false, this.paramPlusIV);

			byte[] LCEKPADICV = new byte[TEMP1.Length];

			Array.Copy(TEMP1, 0, LCEKPADICV, 0, TEMP1.Length);

			for (int i = 0; i < (LCEKPADICV.Length / engine.GetBlockSize()); i++)
			{
				int currentBytePos = i * engine.GetBlockSize();

				engine.ProcessBlock(LCEKPADICV, currentBytePos, LCEKPADICV, currentBytePos);
			}

			// Decompose LCEKPADICV. CKS is the last 8 octets and WK, the wrapped key, are
			// those octets before the CKS.
			byte[] result = new byte[LCEKPADICV.Length - 8];
			byte[] CKStoBeVerified = new byte[8];

			Array.Copy(LCEKPADICV, 0, result, 0, LCEKPADICV.Length - 8);
			Array.Copy(LCEKPADICV, LCEKPADICV.Length - 8, CKStoBeVerified, 0, 8);

			// Calculate a CMS Key Checksum, (section 5.6.1), over the WK and compare
			// with the CKS extracted in the above step. If they are not equal, return error.
			if (!CheckCmsKeyChecksum(result, CKStoBeVerified))
			{
				throw new InvalidCipherTextException(
					"Checksum inside ciphertext is corrupted");
			}

			if ((result.Length - ((result[0] & 0xff) + 1)) > 7)
			{
				throw new InvalidCipherTextException(
					"too many pad bytes (" + (result.Length - ((result[0] & 0xff) + 1)) + ")");
			}

			// CEK is the wrapped key, now extracted for use in data decryption.
			byte[] CEK = new byte[result[0]];
			Array.Copy(result, 1, CEK, 0, CEK.Length);
			return CEK;
		}

		/**
		* Some key wrap algorithms make use of the Key Checksum defined
		* in CMS [CMS-Algorithms]. This is used to provide an integrity
		* check value for the key being wrapped. The algorithm is
		*
		* - Compute the 20 octet SHA-1 hash on the key being wrapped.
		* - Use the first 8 octets of this hash as the checksum value.
		*
		* @param key
		* @return
		* @throws Exception
		* @see http://www.w3.org/TR/xmlenc-core/#sec-CMSKeyChecksum
		*/
		private byte[] CalculateCmsKeyChecksum(
			byte[] key)
		{
			sha1.BlockUpdate(key, 0, key.Length);
			sha1.DoFinal(digest, 0);

			byte[] result = new byte[8];
			Array.Copy(digest, 0, result, 0, 8);
			return result;
		}

		/**
		* @param key
		* @param checksum
		* @return
		* @see http://www.w3.org/TR/xmlenc-core/#sec-CMSKeyChecksum
		*/
		private bool CheckCmsKeyChecksum(
			byte[]	key,
			byte[]	checksum)
		{
			return Arrays.ConstantTimeAreEqual(CalculateCmsKeyChecksum(key), checksum);
		}
	}
}
