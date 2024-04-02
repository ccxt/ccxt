using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Generators
{
	/// <description>
	/// Generator for PBE derived keys and IVs as usd by OpenSSL. Originally this scheme was a simple extension of
	/// PKCS 5 V2.0 Scheme 1 using MD5 with an iteration count of 1. The default digest was changed to SHA-256 with
	/// OpenSSL 1.1.0. This implementation still defaults to MD5, but the digest can now be set.
	/// </description>
	public class OpenSslPbeParametersGenerator
		: PbeParametersGenerator
	{
		private readonly IDigest digest;

		///
		/// <description>
		/// Construct a OpenSSL Parameters generator - digest the original MD5.
		/// </description>
		///
		public OpenSslPbeParametersGenerator() : this(new MD5Digest())
		{
		}

		///
		/// <description>
		/// Construct a OpenSSL Parameters generator - digest as specified.
		/// </description>
		/// <param name="digest">the digest to use as the PRF.</param>
		///
		public OpenSslPbeParametersGenerator(IDigest digest)
		{
			this.digest = digest;
		}

		public override void Init(
			byte[]	password,
			byte[]	salt,
			int		iterationCount)
		{
			// Ignore the provided iterationCount
			base.Init(password, salt, 1);
		}

		/**
		 * Initialise - note the iteration count for this algorithm is fixed at 1.
		 * 
		 * @param password password to use.
		 * @param salt salt to use.
		 */
		public virtual void Init(
			byte[] password,
			byte[] salt)
		{
			base.Init(password, salt, 1);
		}

		/**
		 * the derived key function, the ith hash of the password and the salt.
		 */
		private byte[] GenerateDerivedKey(
			int bytesNeeded)
		{
			byte[] buf = new byte[digest.GetDigestSize()];
			byte[] key = new byte[bytesNeeded];
			int offset = 0;
        
			for (;;)
			{
				digest.BlockUpdate(mPassword, 0, mPassword.Length);
				digest.BlockUpdate(mSalt, 0, mSalt.Length);

				digest.DoFinal(buf, 0);

				int len = (bytesNeeded > buf.Length) ? buf.Length : bytesNeeded;
				Array.Copy(buf, 0, key, offset, len);
				offset += len;

				// check if we need any more
				bytesNeeded -= len;
				if (bytesNeeded == 0)
				{
					break;
				}

				// do another round
				digest.Reset();
				digest.BlockUpdate(buf, 0, buf.Length);
			}

			return key;
		}

		public override ICipherParameters GenerateDerivedParameters(
			string	algorithm,
			int		keySize)
		{
			keySize /= 8;

			byte[] dKey = GenerateDerivedKey(keySize);

			return ParameterUtilities.CreateKeyParameter(algorithm, dKey, 0, keySize);
		}

		public override ICipherParameters GenerateDerivedParameters(
			string	algorithm,
			int		keySize,
			int     ivSize)
		{
			keySize /= 8;
			ivSize /= 8;

			byte[] dKey = GenerateDerivedKey(keySize + ivSize);
			KeyParameter key = ParameterUtilities.CreateKeyParameter(algorithm, dKey, 0, keySize);

			return new ParametersWithIV(key, dKey, keySize, ivSize);
		}

		/**
		 * Generate a key parameter for use with a MAC derived from the password,
		 * salt, and iteration count we are currently initialised with.
		 *
		 * @param keySize the size of the key we want (in bits)
		 * @return a KeyParameter object.
		 * @exception ArgumentException if the key length larger than the base hash size.
		 */
		public override ICipherParameters GenerateDerivedMacParameters(
			int keySize)
		{
			keySize = keySize / 8;

			byte[] dKey = GenerateDerivedKey(keySize);

			return new KeyParameter(dKey, 0, keySize);
		}
	}
}
