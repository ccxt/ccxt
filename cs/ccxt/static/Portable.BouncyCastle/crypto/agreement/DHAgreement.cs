using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Agreement
{
	/**
	 * a Diffie-Hellman key exchange engine.
	 * <p>
	 * note: This uses MTI/A0 key agreement in order to make the key agreement
	 * secure against passive attacks. If you're doing Diffie-Hellman and both
	 * parties have long term public keys you should look at using this. For
	 * further information have a look at RFC 2631.</p>
	 * <p>
	 * It's possible to extend this to more than two parties as well, for the moment
	 * that is left as an exercise for the reader.</p>
	 */
	public class DHAgreement
	{
		private DHPrivateKeyParameters  key;
		private DHParameters			dhParams;
		private BigInteger				privateValue;
		private SecureRandom			random;

		public void Init(
			ICipherParameters parameters)
		{
			AsymmetricKeyParameter kParam;
			if (parameters is ParametersWithRandom)
			{
				ParametersWithRandom rParam = (ParametersWithRandom)parameters;

				this.random = rParam.Random;
				kParam = (AsymmetricKeyParameter)rParam.Parameters;
			}
			else
			{
				this.random = new SecureRandom();
				kParam = (AsymmetricKeyParameter)parameters;
			}

			if (!(kParam is DHPrivateKeyParameters))
			{
				throw new ArgumentException("DHEngine expects DHPrivateKeyParameters");
			}

			this.key = (DHPrivateKeyParameters)kParam;
			this.dhParams = key.Parameters;
		}

		/**
		 * calculate our initial message.
		 */
		public BigInteger CalculateMessage()
		{
			DHKeyPairGenerator dhGen = new DHKeyPairGenerator();
			dhGen.Init(new DHKeyGenerationParameters(random, dhParams));
			AsymmetricCipherKeyPair dhPair = dhGen.GenerateKeyPair();

			this.privateValue = ((DHPrivateKeyParameters)dhPair.Private).X;

			return ((DHPublicKeyParameters)dhPair.Public).Y;
		}

		/**
		 * given a message from a given party and the corresponding public key
		 * calculate the next message in the agreement sequence. In this case
		 * this will represent the shared secret.
		 */
		public BigInteger CalculateAgreement(
			DHPublicKeyParameters	pub,
			BigInteger				message)
		{
			if (pub == null)
				throw new ArgumentNullException("pub");
			if (message == null)
				throw new ArgumentNullException("message");

			if (!pub.Parameters.Equals(dhParams))
				throw new ArgumentException("Diffie-Hellman public key has wrong parameters.");

            BigInteger p = dhParams.P;

            BigInteger peerY = pub.Y;
            if (peerY == null || peerY.CompareTo(BigInteger.One) <= 0 || peerY.CompareTo(p.Subtract(BigInteger.One)) >= 0)
                throw new ArgumentException("Diffie-Hellman public key is weak");

            BigInteger result = peerY.ModPow(privateValue, p);
            if (result.Equals(BigInteger.One))
                throw new InvalidOperationException("Shared key can't be 1");

            return message.ModPow(key.X, p).Multiply(result).Mod(p);
        }
    }
}
