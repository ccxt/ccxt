using System;

using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// <code>
	/// OtherHash ::= CHOICE {
	///		sha1Hash	OtherHashValue, -- This contains a SHA-1 hash
	/// 	otherHash	OtherHashAlgAndValue
	///	}
	///	
	///	OtherHashValue ::= OCTET STRING
	/// </code>
	/// </remarks>
	public class OtherHash
		: Asn1Encodable, IAsn1Choice
	{
		private readonly Asn1OctetString		sha1Hash;
		private readonly OtherHashAlgAndValue	otherHash;

		public static OtherHash GetInstance(
			object obj)
		{
			if (obj == null || obj is OtherHash)
				return (OtherHash) obj;

			if (obj is Asn1OctetString)
				return new OtherHash((Asn1OctetString) obj);

			return new OtherHash(
				OtherHashAlgAndValue.GetInstance(obj));
		}

		public OtherHash(
			byte[] sha1Hash)
		{
			if (sha1Hash == null)
				throw new ArgumentNullException("sha1Hash");

			this.sha1Hash = new DerOctetString(sha1Hash);
		}

		public OtherHash(
			Asn1OctetString sha1Hash)
		{
			if (sha1Hash == null)
				throw new ArgumentNullException("sha1Hash");

			this.sha1Hash = sha1Hash;
		}

		public OtherHash(
			OtherHashAlgAndValue otherHash)
		{
			if (otherHash == null)
				throw new ArgumentNullException("otherHash");

			this.otherHash = otherHash;
		}

		public AlgorithmIdentifier HashAlgorithm
		{
			get
			{
				return otherHash == null
					?	new AlgorithmIdentifier(OiwObjectIdentifiers.IdSha1)
					:	otherHash.HashAlgorithm;
			}
		}

		public byte[] GetHashValue()
		{
			return otherHash == null
				?	sha1Hash.GetOctets()
				:	otherHash.GetHashValue();
		}

		public override Asn1Object ToAsn1Object()
		{
			return otherHash == null
				?	sha1Hash
				:	otherHash.ToAsn1Object();
		}
	}
}
