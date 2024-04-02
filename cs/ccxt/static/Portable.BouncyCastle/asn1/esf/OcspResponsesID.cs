using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// RFC 3126: 4.2.2 Complete Revocation Refs Attribute Definition
	/// <code>
	/// OcspResponsesID ::= SEQUENCE {
	///		ocspIdentifier	OcspIdentifier,
	///		ocspRepHash		OtherHash OPTIONAL
	/// }
	/// </code>
	/// </remarks>
	public class OcspResponsesID
		: Asn1Encodable
	{
		private readonly OcspIdentifier	ocspIdentifier;
		private readonly OtherHash		ocspRepHash;

		public static OcspResponsesID GetInstance(
			object obj)
		{
			if (obj == null || obj is OcspResponsesID)
				return (OcspResponsesID) obj;

			if (obj is Asn1Sequence)
				return new OcspResponsesID((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'OcspResponsesID' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private OcspResponsesID(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count < 1 || seq.Count > 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.ocspIdentifier = OcspIdentifier.GetInstance(seq[0].ToAsn1Object());

			if (seq.Count > 1)
			{
				this.ocspRepHash = OtherHash.GetInstance(seq[1].ToAsn1Object());
			}
		}

		public OcspResponsesID(
			OcspIdentifier ocspIdentifier)
			: this(ocspIdentifier, null)
		{
		}

		public OcspResponsesID(
			OcspIdentifier	ocspIdentifier,
			OtherHash		ocspRepHash)
		{
			if (ocspIdentifier == null)
				throw new ArgumentNullException("ocspIdentifier");

			this.ocspIdentifier = ocspIdentifier;
			this.ocspRepHash = ocspRepHash;
		}

		public OcspIdentifier OcspIdentifier
		{
			get { return ocspIdentifier; }
		}

		public OtherHash OcspRepHash
		{
			get { return ocspRepHash; }
		}

		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(
				ocspIdentifier.ToAsn1Object());

			if (ocspRepHash != null)
			{
				v.Add(ocspRepHash.ToAsn1Object());
			}

			return new DerSequence(v);
		}

	}
}
