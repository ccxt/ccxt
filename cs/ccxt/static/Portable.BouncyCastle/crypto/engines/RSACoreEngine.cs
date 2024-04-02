using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Engines
{
	/**
	* this does your basic RSA algorithm.
	*/
	public class RsaCoreEngine
        : IRsa
	{
		private RsaKeyParameters	key;
		private bool				forEncryption;
		private int					bitSize;

        private void CheckInitialised()
        {
            if (key == null)
                throw new InvalidOperationException("RSA engine not initialised");
        }

        /**
		* initialise the RSA engine.
		*
		* @param forEncryption true if we are encrypting, false otherwise.
		* @param param the necessary RSA key parameters.
		*/
        public virtual void Init(
			bool				forEncryption,
			ICipherParameters	parameters)
		{
			if (parameters is ParametersWithRandom)
			{
				parameters = ((ParametersWithRandom) parameters).Parameters;
			}

			if (!(parameters is RsaKeyParameters))
				throw new InvalidKeyException("Not an RSA key");

			this.key = (RsaKeyParameters) parameters;
			this.forEncryption = forEncryption;
			this.bitSize = key.Modulus.BitLength;
		}

		/**
		* Return the maximum size for an input block to this engine.
		* For RSA this is always one byte less than the key size on
		* encryption, and the same length as the key size on decryption.
		*
		* @return maximum size for an input block.
		*/
        public virtual int GetInputBlockSize()
		{
            CheckInitialised();

			if (forEncryption)
			{
				return (bitSize - 1) / 8;
			}

			return (bitSize + 7) / 8;
		}

		/**
		* Return the maximum size for an output block to this engine.
		* For RSA this is always one byte less than the key size on
		* decryption, and the same length as the key size on encryption.
		*
		* @return maximum size for an output block.
		*/
        public virtual int GetOutputBlockSize()
		{
            CheckInitialised();

            if (forEncryption)
			{
				return (bitSize + 7) / 8;
			}

			return (bitSize - 1) / 8;
		}

        public virtual BigInteger ConvertInput(
			byte[]	inBuf,
			int		inOff,
			int		inLen)
		{
            CheckInitialised();

            int maxLength = (bitSize + 7) / 8;

			if (inLen > maxLength)
				throw new DataLengthException("input too large for RSA cipher.");

			BigInteger input = new BigInteger(1, inBuf, inOff, inLen);

			if (input.CompareTo(key.Modulus) >= 0)
				throw new DataLengthException("input too large for RSA cipher.");

			return input;
		}

        public virtual byte[] ConvertOutput(
			BigInteger result)
		{
            CheckInitialised();

            byte[] output = result.ToByteArrayUnsigned();

			if (forEncryption)
			{
				int outSize = GetOutputBlockSize();

				// TODO To avoid this, create version of BigInteger.ToByteArray that
				// writes to an existing array
				if (output.Length < outSize) // have ended up with less bytes than normal, lengthen
				{
					byte[] tmp = new byte[outSize];
					output.CopyTo(tmp, tmp.Length - output.Length);
					output = tmp;
				}
			}

			return output;
		}

        public virtual BigInteger ProcessBlock(
			BigInteger input)
		{
            CheckInitialised();

            if (key is RsaPrivateCrtKeyParameters)
			{
				//
				// we have the extra factors, use the Chinese Remainder Theorem - the author
				// wishes to express his thanks to Dirk Bonekaemper at rtsffm.com for
				// advice regarding the expression of this.
				//
				RsaPrivateCrtKeyParameters crtKey = (RsaPrivateCrtKeyParameters)key;

				BigInteger p = crtKey.P;
				BigInteger q = crtKey.Q;
				BigInteger dP = crtKey.DP;
				BigInteger dQ = crtKey.DQ;
				BigInteger qInv = crtKey.QInv;

				BigInteger mP, mQ, h, m;

				// mP = ((input Mod p) ^ dP)) Mod p
				mP = (input.Remainder(p)).ModPow(dP, p);

				// mQ = ((input Mod q) ^ dQ)) Mod q
				mQ = (input.Remainder(q)).ModPow(dQ, q);

				// h = qInv * (mP - mQ) Mod p
				h = mP.Subtract(mQ);
				h = h.Multiply(qInv);
				h = h.Mod(p);               // Mod (in Java) returns the positive residual

				// m = h * q + mQ
				m = h.Multiply(q);
				m = m.Add(mQ);

				return m;
			}

			return input.ModPow(key.Exponent, key.Modulus);
		}
	}
}
