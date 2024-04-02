using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Generators
{
	/**
	* Generator for Pbe derived keys and ivs as defined by Pkcs 5 V2.0 Scheme 1.
	* Note this generator is limited to the size of the hash produced by the
	* digest used to drive it.
	* <p>
	* The document this implementation is based on can be found at
	* <a href="http://www.rsasecurity.com/rsalabs/pkcs/pkcs-5/index.html">
	* RSA's Pkcs5 Page</a>
	* </p>
	*/
	public class Pkcs5S1ParametersGenerator
		: PbeParametersGenerator
	{
		private readonly IDigest digest;

		/**
		* Construct a Pkcs 5 Scheme 1 Parameters generator.
		*
		* @param digest the digest to be used as the source of derived keys.
		*/
		public Pkcs5S1ParametersGenerator(
			IDigest digest)
		{
			this.digest = digest;
		}

		/**
		* the derived key function, the ith hash of the mPassword and the mSalt.
		*/
		private byte[] GenerateDerivedKey()
		{
			byte[] digestBytes = new byte[digest.GetDigestSize()];

			digest.BlockUpdate(mPassword, 0, mPassword.Length);
			digest.BlockUpdate(mSalt, 0, mSalt.Length);

			digest.DoFinal(digestBytes, 0);
			for (int i = 1; i < mIterationCount; i++)
			{
				digest.BlockUpdate(digestBytes, 0, digestBytes.Length);
				digest.DoFinal(digestBytes, 0);
			}

			return digestBytes;
		}

		public override ICipherParameters GenerateDerivedParameters(
			string	algorithm,
			int		keySize)
		{
			keySize /= 8;

			if (keySize > digest.GetDigestSize())
			{
				throw new ArgumentException(
					"Can't Generate a derived key " + keySize + " bytes long.");
			}

			byte[] dKey = GenerateDerivedKey();

			return ParameterUtilities.CreateKeyParameter(algorithm, dKey, 0, keySize);
		}

		public override ICipherParameters GenerateDerivedParameters(
			string	algorithm,
			int		keySize,
			int		ivSize)
		{
			keySize /= 8;
			ivSize /= 8;

			if ((keySize + ivSize) > digest.GetDigestSize())
			{
				throw new ArgumentException(
					"Can't Generate a derived key " + (keySize + ivSize) + " bytes long.");
			}

			byte[] dKey = GenerateDerivedKey();
			KeyParameter key = ParameterUtilities.CreateKeyParameter(algorithm, dKey, 0, keySize);

			return new ParametersWithIV(key, dKey, keySize, ivSize);
		}

		/**
		* Generate a key parameter for use with a MAC derived from the mPassword,
		* mSalt, and iteration count we are currently initialised with.
		*
		* @param keySize the size of the key we want (in bits)
		* @return a KeyParameter object.
		* @exception ArgumentException if the key length larger than the base hash size.
		*/
		public override ICipherParameters GenerateDerivedMacParameters(
			int keySize)
		{
			keySize /= 8;

			if (keySize > digest.GetDigestSize())
			{
				throw new ArgumentException(
					"Can't Generate a derived key " + keySize + " bytes long.");
			}

			byte[] dKey = GenerateDerivedKey();

			return new KeyParameter(dKey, 0, keySize);
		}
	}
}
