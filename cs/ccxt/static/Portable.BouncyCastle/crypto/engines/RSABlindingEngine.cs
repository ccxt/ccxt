using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
	/**
	* This does your basic RSA Chaum's blinding and unblinding as outlined in
	* "Handbook of Applied Cryptography", page 475. You need to use this if you are
	* trying to get another party to generate signatures without them being aware
	* of the message they are signing.
	*/
	public class RsaBlindingEngine
		: IAsymmetricBlockCipher
	{
		private readonly IRsa core;

		private RsaKeyParameters key;
		private BigInteger blindingFactor;

		private bool forEncryption;

        public RsaBlindingEngine()
            : this(new RsaCoreEngine())
        {
        }

        public RsaBlindingEngine(IRsa rsa)
        {
            this.core = rsa;
        }

        public virtual string AlgorithmName
		{
			get { return "RSA"; }
		}

		/**
		* Initialise the blinding engine.
		*
		* @param forEncryption true if we are encrypting (blinding), false otherwise.
		* @param param         the necessary RSA key parameters.
		*/
        public virtual void Init(
			bool				forEncryption,
			ICipherParameters	param)
		{
			RsaBlindingParameters p;

			if (param is ParametersWithRandom)
			{
				ParametersWithRandom rParam = (ParametersWithRandom)param;

				p = (RsaBlindingParameters)rParam.Parameters;
			}
			else
			{
				p = (RsaBlindingParameters)param;
			}

			core.Init(forEncryption, p.PublicKey);

			this.forEncryption = forEncryption;
			this.key = p.PublicKey;
			this.blindingFactor = p.BlindingFactor;
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
			return core.GetInputBlockSize();
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
			return core.GetOutputBlockSize();
		}

		/**
		* Process a single block using the RSA blinding algorithm.
		*
		* @param in    the input array.
		* @param inOff the offset into the input buffer where the data starts.
		* @param inLen the length of the data to be processed.
		* @return the result of the RSA process.
		* @throws DataLengthException the input block is too large.
		*/
        public virtual byte[] ProcessBlock(
			byte[]	inBuf,
			int		inOff,
			int		inLen)
		{
			BigInteger msg = core.ConvertInput(inBuf, inOff, inLen);

			if (forEncryption)
			{
				msg = BlindMessage(msg);
			}
			else
			{
				msg = UnblindMessage(msg);
			}

			return core.ConvertOutput(msg);
		}

		/*
		* Blind message with the blind factor.
		*/
		private BigInteger BlindMessage(
			BigInteger msg)
		{
			BigInteger blindMsg = blindingFactor;
			blindMsg = msg.Multiply(blindMsg.ModPow(key.Exponent, key.Modulus));
			blindMsg = blindMsg.Mod(key.Modulus);

			return blindMsg;
		}

		/*
		* Unblind the message blinded with the blind factor.
		*/
		private BigInteger UnblindMessage(
			BigInteger blindedMsg)
		{
			BigInteger m = key.Modulus;
			BigInteger msg = blindedMsg;
			BigInteger blindFactorInverse = BigIntegers.ModOddInverse(m, blindingFactor);
			msg = msg.Multiply(blindFactorInverse);
			msg = msg.Mod(m);

			return msg;
		}
	}
}
