using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// <code>
	/// OtherCertID ::= SEQUENCE {
	/// 	otherCertHash	OtherHash,
	/// 	issuerSerial	IssuerSerial OPTIONAL
	/// }
	/// </code>
	/// </remarks>
	public class OtherCertID
		: Asn1Encodable
	{
		private readonly OtherHash		otherCertHash;
		private readonly IssuerSerial	issuerSerial;

		public static OtherCertID GetInstance(
			object obj)
		{
			if (obj == null || obj is OtherCertID)
				return (OtherCertID) obj;

			if (obj is Asn1Sequence)
				return new OtherCertID((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'OtherCertID' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private OtherCertID(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count < 1 || seq.Count > 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.otherCertHash = OtherHash.GetInstance(seq[0].ToAsn1Object());

			if (seq.Count > 1)
			{
				this.issuerSerial = IssuerSerial.GetInstance(seq[1].ToAsn1Object());
			}
		}

		public OtherCertID(
			OtherHash otherCertHash)
			: this(otherCertHash, null)
		{
		}

		public OtherCertID(
			OtherHash		otherCertHash,
			IssuerSerial	issuerSerial)
		{
			if (otherCertHash == null)
				throw new ArgumentNullException("otherCertHash");

			this.otherCertHash = otherCertHash;
			this.issuerSerial = issuerSerial;
		}

		public OtherHash OtherCertHash
		{
			get { return otherCertHash; }
		}

		public IssuerSerial IssuerSerial
		{
			get { return issuerSerial; }
		}

		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(
				otherCertHash.ToAsn1Object());

			if (issuerSerial != null)
			{
				v.Add(issuerSerial.ToAsn1Object());
			}

			return new DerSequence(v);
		}

	}
}
