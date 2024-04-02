using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Signers
{
	/// <summary> RSA-PSS as described in Pkcs# 1 v 2.1.
	/// <p>
	/// Note: the usual value for the salt length is the number of
	/// bytes in the hash function.</p>
	/// </summary>
	public class PssSigner
		: ISigner
	{
		public const byte TrailerImplicit = 0xBC;

		private readonly IDigest contentDigest1, contentDigest2;
		private readonly IDigest mgfDigest;
		private readonly IAsymmetricBlockCipher cipher;

		private SecureRandom random;

		private int hLen;
		private int mgfhLen;
		private int sLen;
        private bool sSet;
		private int emBits;
		private byte[] salt;
		private byte[] mDash;
		private byte[] block;
		private byte trailer;

		public static PssSigner CreateRawSigner(IAsymmetricBlockCipher cipher, IDigest digest)
		{
			return new PssSigner(cipher, new NullDigest(), digest, digest, digest.GetDigestSize(), null, TrailerImplicit);
		}

		public static PssSigner CreateRawSigner(IAsymmetricBlockCipher cipher, IDigest contentDigest, IDigest mgfDigest,
			int saltLen, byte trailer)
		{
			return new PssSigner(cipher, new NullDigest(), contentDigest, mgfDigest, saltLen, null, trailer);
		}

		public static PssSigner CreateRawSigner(IAsymmetricBlockCipher cipher, IDigest contentDigest, IDigest mgfDigest,
			byte[] salt, byte trailer)
		{
			return new PssSigner(cipher, new NullDigest(), contentDigest, mgfDigest, salt.Length, salt, trailer);
		}

		public PssSigner(
			IAsymmetricBlockCipher	cipher,
			IDigest					digest)
			: this(cipher, digest, digest.GetDigestSize())
		{
		}

		/// <summary>Basic constructor</summary>
		/// <param name="cipher">the asymmetric cipher to use.</param>
		/// <param name="digest">the digest to use.</param>
		/// <param name="saltLen">the length of the salt to use (in bytes).</param>
		public PssSigner(
			IAsymmetricBlockCipher	cipher,
			IDigest					digest,
			int						saltLen)
			: this(cipher, digest, saltLen, TrailerImplicit)
		{
		}

        /// <summary>Basic constructor</summary>
        /// <param name="cipher">the asymmetric cipher to use.</param>
        /// <param name="digest">the digest to use.</param>
        /// <param name="salt">the fixed salt to be used.</param>
        public PssSigner(
            IAsymmetricBlockCipher cipher,
            IDigest digest,
            byte[] salt)
            : this(cipher, digest, digest, digest, salt.Length, salt, TrailerImplicit)
        {
        }

        public PssSigner(
			IAsymmetricBlockCipher	cipher,
			IDigest					contentDigest,
			IDigest					mgfDigest,
			int						saltLen)
			: this(cipher, contentDigest, mgfDigest, saltLen, TrailerImplicit)
		{
		}

        public PssSigner(
            IAsymmetricBlockCipher cipher,
            IDigest contentDigest,
            IDigest mgfDigest,
            byte[] salt)
            : this(cipher, contentDigest, contentDigest, mgfDigest, salt.Length, salt, TrailerImplicit)
        {
        }

        public PssSigner(
			IAsymmetricBlockCipher	cipher,
			IDigest					digest,
			int						saltLen,
			byte					trailer)
			: this(cipher, digest, digest, saltLen, trailer)
		{
		}

		public PssSigner(
			IAsymmetricBlockCipher	cipher,
			IDigest					contentDigest,
			IDigest					mgfDigest,
			int						saltLen,
			byte					trailer)
			: this(cipher, contentDigest, contentDigest, mgfDigest, saltLen, null, trailer)
		{
		}

		private PssSigner(
			IAsymmetricBlockCipher	cipher,
			IDigest					contentDigest1,
			IDigest					contentDigest2,
			IDigest					mgfDigest,
			int						saltLen,
            byte[]                  salt,
			byte					trailer)
		{
			this.cipher = cipher;
			this.contentDigest1 = contentDigest1;
			this.contentDigest2 = contentDigest2;
			this.mgfDigest = mgfDigest;
			this.hLen = contentDigest2.GetDigestSize();
			this.mgfhLen = mgfDigest.GetDigestSize();
			this.sLen = saltLen;
            this.sSet = salt != null;
            if (sSet)
            {
                this.salt = salt;
            }
            else
            {
                this.salt = new byte[saltLen];
            }
			this.mDash = new byte[8 + saltLen + hLen];
			this.trailer = trailer;
		}

        public virtual string AlgorithmName
		{
			get { return mgfDigest.AlgorithmName + "withRSAandMGF1"; }
		}

		public virtual void Init(
			bool				forSigning,
			ICipherParameters	parameters)
		{
			if (parameters is ParametersWithRandom)
			{
				ParametersWithRandom p = (ParametersWithRandom) parameters;

				parameters = p.Parameters;
				random = p.Random;
			}
			else
			{
				if (forSigning)
				{
					random = new SecureRandom();
				}
			}

			cipher.Init(forSigning, parameters);

			RsaKeyParameters kParam;
			if (parameters is RsaBlindingParameters)
			{
				kParam = ((RsaBlindingParameters) parameters).PublicKey;
			}
			else
			{
				kParam = (RsaKeyParameters) parameters;
			}

			emBits = kParam.Modulus.BitLength - 1;

			if (emBits < (8 * hLen + 8 * sLen + 9))
				throw new ArgumentException("key too small for specified hash and salt lengths");

			block = new byte[(emBits + 7) / 8];
		}

		/// <summary> clear possible sensitive data</summary>
		private void ClearBlock(
			byte[] block)
		{
			Array.Clear(block, 0, block.Length);
		}

		public virtual void Update(byte input)
		{
			contentDigest1.Update(input);
		}

		public virtual void BlockUpdate(byte[] input, int inOff, int inLen)
		{
			contentDigest1.BlockUpdate(input, inOff, inLen);
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public virtual void BlockUpdate(ReadOnlySpan<byte> input)
		{
			contentDigest1.BlockUpdate(input);
		}
#endif

		public virtual void Reset()
		{
			contentDigest1.Reset();
		}

		public virtual byte[] GenerateSignature()
		{
			if (contentDigest1.GetDigestSize() != hLen)
				throw new InvalidOperationException();

			contentDigest1.DoFinal(mDash, mDash.Length - hLen - sLen);

			if (sLen != 0)
			{
                if (!sSet)
                {
                    random.NextBytes(salt);
                }
				salt.CopyTo(mDash, mDash.Length - sLen);
			}

			byte[] h = new byte[hLen];

			contentDigest2.BlockUpdate(mDash, 0, mDash.Length);

			contentDigest2.DoFinal(h, 0);

			block[block.Length - sLen - 1 - hLen - 1] = (byte) (0x01);
			salt.CopyTo(block, block.Length - sLen - hLen - 1);

			byte[] dbMask = MaskGeneratorFunction(h, 0, h.Length, block.Length - hLen - 1);
			for (int i = 0; i != dbMask.Length; i++)
			{
				block[i] ^= dbMask[i];
			}

            h.CopyTo(block, block.Length - hLen - 1);

            uint firstByteMask = 0xFFU >> ((block.Length * 8) - emBits);

            block[0] &= (byte)firstByteMask;
            block[block.Length - 1] = trailer;

			byte[] b = cipher.ProcessBlock(block, 0, block.Length);

			ClearBlock(block);

			return b;
		}

		public virtual bool VerifySignature(byte[] signature)
		{
			if (contentDigest1.GetDigestSize() != hLen)
				throw new InvalidOperationException();

			contentDigest1.DoFinal(mDash, mDash.Length - hLen - sLen);

            byte[] b = cipher.ProcessBlock(signature, 0, signature.Length);
            Arrays.Fill(block, 0, block.Length - b.Length, 0);
			b.CopyTo(block, block.Length - b.Length);

            uint firstByteMask = 0xFFU >> ((block.Length * 8) - emBits);

			if (block[0] != (byte)(block[0] & firstByteMask)
                || block[block.Length - 1] != trailer)
			{
				ClearBlock(block);
				return false;
			}

			byte[] dbMask = MaskGeneratorFunction(block, block.Length - hLen - 1, hLen, block.Length - hLen - 1);

			for (int i = 0; i != dbMask.Length; i++)
			{
				block[i] ^= dbMask[i];
			}

            block[0] &= (byte)firstByteMask;

			for (int i = 0; i != block.Length - hLen - sLen - 2; i++)
			{
				if (block[i] != 0)
				{
					ClearBlock(block);
					return false;
				}
			}

			if (block[block.Length - hLen - sLen - 2] != 0x01)
			{
				ClearBlock(block);
				return false;
			}

            if (sSet)
            {
                Array.Copy(salt, 0, mDash, mDash.Length - sLen, sLen);
            }
            else
            {
                Array.Copy(block, block.Length - sLen - hLen - 1, mDash, mDash.Length - sLen, sLen);
            }

			contentDigest2.BlockUpdate(mDash, 0, mDash.Length);
			contentDigest2.DoFinal(mDash, mDash.Length - hLen);

			for (int i = block.Length - hLen - 1, j = mDash.Length - hLen; j != mDash.Length; i++, j++)
			{
				if ((block[i] ^ mDash[j]) != 0)
				{
					ClearBlock(mDash);
					ClearBlock(block);
					return false;
				}
			}

			ClearBlock(mDash);
			ClearBlock(block);

			return true;
		}

		/// <summary> int to octet string.</summary>
		private void ItoOSP(
			int		i,
			byte[]	sp)
		{
			sp[0] = (byte)((uint) i >> 24);
			sp[1] = (byte)((uint) i >> 16);
			sp[2] = (byte)((uint) i >> 8);
			sp[3] = (byte)((uint) i >> 0);
		}

		private byte[] MaskGeneratorFunction(
			byte[] Z,
			int zOff,
			int zLen,
			int length)
		{
			if (mgfDigest is IXof)
			{
				byte[] mask = new byte[length];
				mgfDigest.BlockUpdate(Z, zOff, zLen);
				((IXof)mgfDigest).DoFinal(mask, 0, mask.Length);

				return mask;
			}
			else
			{
				return MaskGeneratorFunction1(Z, zOff, zLen, length);
			}
		}

		/// <summary> mask generator function, as described in Pkcs1v2.</summary>
		private byte[] MaskGeneratorFunction1(
			byte[]	Z,
			int		zOff,
			int		zLen,
			int		length)
		{
			byte[] mask = new byte[length];
			byte[] hashBuf = new byte[mgfhLen];
			byte[] C = new byte[4];
			int counter = 0;

			mgfDigest.Reset();

			while (counter < (length / mgfhLen))
			{
				ItoOSP(counter, C);

				mgfDigest.BlockUpdate(Z, zOff, zLen);
				mgfDigest.BlockUpdate(C, 0, C.Length);
				mgfDigest.DoFinal(hashBuf, 0);

				hashBuf.CopyTo(mask, counter * mgfhLen);
				++counter;
			}

			if ((counter * mgfhLen) < length)
			{
				ItoOSP(counter, C);

				mgfDigest.BlockUpdate(Z, zOff, zLen);
				mgfDigest.BlockUpdate(C, 0, C.Length);
				mgfDigest.DoFinal(hashBuf, 0);

				Array.Copy(hashBuf, 0, mask, counter * mgfhLen, mask.Length - (counter * mgfhLen));
			}

			return mask;
		}
	}
}
