using System;

using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.IO.Pem;

namespace Org.BouncyCastle.OpenSsl
{
	public class Pkcs8Generator
		: PemObjectGenerator
	{
		// FIXME See PbeUtilities static constructor
//		public static readonly string Aes128Cbc = NistObjectIdentifiers.IdAes128Cbc.Id;
//		public static readonly string Aes192Cbc = NistObjectIdentifiers.IdAes192Cbc.Id;
//		public static readonly string Aes256Cbc = NistObjectIdentifiers.IdAes256Cbc.Id;
//
//		public static readonly string Des3Cbc = PkcsObjectIdentifiers.DesEde3Cbc.Id;

		public static readonly string PbeSha1_RC4_128 = PkcsObjectIdentifiers.PbeWithShaAnd128BitRC4.Id;
		public static readonly string PbeSha1_RC4_40 = PkcsObjectIdentifiers.PbeWithShaAnd40BitRC4.Id;
		public static readonly string PbeSha1_3DES = PkcsObjectIdentifiers.PbeWithShaAnd3KeyTripleDesCbc.Id;
		public static readonly string PbeSha1_2DES = PkcsObjectIdentifiers.PbeWithShaAnd2KeyTripleDesCbc.Id;
		public static readonly string PbeSha1_RC2_128 = PkcsObjectIdentifiers.PbeWithShaAnd128BitRC2Cbc.Id;
		public static readonly string PbeSha1_RC2_40 = PkcsObjectIdentifiers.PbewithShaAnd40BitRC2Cbc.Id;

		private char[]					password;
		private string					algorithm;
		private int						iterationCount;
		private AsymmetricKeyParameter	privKey;
		private SecureRandom			random;

		/**
		* Constructor for an unencrypted private key PEM object.
		*
		* @param key private key to be encoded.
		*/
		public Pkcs8Generator(AsymmetricKeyParameter privKey)
		{
			this.privKey = privKey;
		}

		/**
		* Constructor for an encrypted private key PEM object.
		*
		* @param key       private key to be encoded
		* @param algorithm encryption algorithm to use
		* @param provider  provider to use
		* @throws NoSuchAlgorithmException if algorithm/mode cannot be found
		*/
		public Pkcs8Generator(AsymmetricKeyParameter privKey, string algorithm)
		{
			// TODO Check privKey.IsPrivate
			this.privKey = privKey;
			this.algorithm = algorithm;
			this.iterationCount = 2048;
		}

		public SecureRandom SecureRandom
		{
			set { this.random = value; }
		}

		public char[] Password
		{
			set { this.password = value; }
		}

		public int IterationCount
		{
			set { this.iterationCount = value; }
		}

		public PemObject Generate()
		{
			if (algorithm == null)
			{
				PrivateKeyInfo pki = PrivateKeyInfoFactory.CreatePrivateKeyInfo(privKey);

				return new PemObject("PRIVATE KEY", pki.GetEncoded());
			}

			// TODO Theoretically, the amount of salt needed depends on the algorithm
			byte[] salt = new byte[20];
			if (random == null)
			{
				random = new SecureRandom();
			}
			random.NextBytes(salt);

			try
			{
				EncryptedPrivateKeyInfo epki = EncryptedPrivateKeyInfoFactory.CreateEncryptedPrivateKeyInfo(
					algorithm, password, salt, iterationCount, privKey);
	
				return new PemObject("ENCRYPTED PRIVATE KEY", epki.GetEncoded());
			}
			catch (Exception e)
			{
				throw new PemGenerationException("Couldn't encrypt private key", e);
			}
		}
	}
}
