using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// RFC 3126: 4.2.2 Complete Revocation Refs Attribute Definition
	/// <code>
	/// CrlIdentifier ::= SEQUENCE 
	/// {
	/// 	crlissuer		Name,
	/// 	crlIssuedTime	UTCTime,
	/// 	crlNumber		INTEGER OPTIONAL
	/// }
	/// </code>
	/// </remarks>
	public class CrlIdentifier
		: Asn1Encodable
	{
		private readonly X509Name	crlIssuer;
		private readonly DerUtcTime	crlIssuedTime;
		private readonly DerInteger	crlNumber;

		public static CrlIdentifier GetInstance(
			object obj)
		{
			if (obj == null || obj is CrlIdentifier)
				return (CrlIdentifier) obj;

			if (obj is Asn1Sequence)
				return new CrlIdentifier((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'CrlIdentifier' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private CrlIdentifier(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count < 2 || seq.Count > 3)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.crlIssuer = X509Name.GetInstance(seq[0]);
			this.crlIssuedTime = DerUtcTime.GetInstance(seq[1]);

			if (seq.Count > 2)
			{
				this.crlNumber = DerInteger.GetInstance(seq[2]);
			}
		}

		public CrlIdentifier(
			X509Name	crlIssuer,
			DateTime	crlIssuedTime)
			: this(crlIssuer, crlIssuedTime, null)
		{
		}

		public CrlIdentifier(
			X509Name	crlIssuer,
			DateTime	crlIssuedTime,
			BigInteger	crlNumber)
		{
			if (crlIssuer == null)
				throw new ArgumentNullException("crlIssuer");

			this.crlIssuer = crlIssuer;
			this.crlIssuedTime = new DerUtcTime(crlIssuedTime);

			if (crlNumber != null)
			{
				this.crlNumber = new DerInteger(crlNumber);
			}
		}

		public X509Name CrlIssuer
		{
			get { return crlIssuer; }
		}

		public DateTime CrlIssuedTime
		{
			get { return crlIssuedTime.ToAdjustedDateTime(); }
		}

		public BigInteger CrlNumber
		{
			get { return crlNumber == null ? null : crlNumber.Value; }
		}

		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(crlIssuer.ToAsn1Object(), crlIssuedTime);
            v.AddOptional(crlNumber);
			return new DerSequence(v);
		}
	}
}
