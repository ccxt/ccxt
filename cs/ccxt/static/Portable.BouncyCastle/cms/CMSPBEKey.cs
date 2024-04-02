using System;

using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

//import javax.crypto.interfaces.PBEKey;

namespace Org.BouncyCastle.Cms
{
	public abstract class CmsPbeKey
		// TODO Create an equivalent interface somewhere?
		//	: PBEKey
		: ICipherParameters
	{
		internal readonly char[]	password;
		internal readonly byte[]	salt;
		internal readonly int		iterationCount;

		public CmsPbeKey(
			char[]	password,
			byte[]	salt,
			int		iterationCount)
		{
			this.password = (char[])password.Clone();
			this.salt = Arrays.Clone(salt);
			this.iterationCount = iterationCount;
		}

		public CmsPbeKey(
			char[]				password,
			AlgorithmIdentifier keyDerivationAlgorithm)
		{
            if (!keyDerivationAlgorithm.Algorithm.Equals(PkcsObjectIdentifiers.IdPbkdf2))
				throw new ArgumentException("Unsupported key derivation algorithm: "
                    + keyDerivationAlgorithm.Algorithm);

			Pbkdf2Params kdfParams = Pbkdf2Params.GetInstance(
				keyDerivationAlgorithm.Parameters.ToAsn1Object());

			this.password = (char[])password.Clone();
			this.salt = kdfParams.GetSalt();
			this.iterationCount = kdfParams.IterationCount.IntValue;
		}

		~CmsPbeKey()
		{
			Array.Clear(this.password, 0, this.password.Length);
		}

		public byte[] Salt
		{
			get { return Arrays.Clone(salt); }
		}

		public int IterationCount
		{
			get { return iterationCount; }
		}

		public string Algorithm
		{
			get { return "PKCS5S2"; }
		}

		public string Format
		{
			get { return "RAW"; }
		}

		public byte[] GetEncoded()
		{
			return null;
		}

		internal abstract KeyParameter GetEncoded(string algorithmOid);
	}
}
