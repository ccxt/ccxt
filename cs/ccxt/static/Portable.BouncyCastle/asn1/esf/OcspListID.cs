using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// RFC 3126: 4.2.2 Complete Revocation Refs Attribute Definition
	/// <code>
	/// OcspListID ::=  SEQUENCE {
	///		ocspResponses	SEQUENCE OF OcspResponsesID
	/// }
	/// </code>
	/// </remarks>
	public class OcspListID
		: Asn1Encodable
	{
		private readonly Asn1Sequence ocspResponses;

		public static OcspListID GetInstance(
			object obj)
		{
			if (obj == null || obj is OcspListID)
				return (OcspListID) obj;

			if (obj is Asn1Sequence)
				return new OcspListID((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'OcspListID' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private OcspListID(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count != 1)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.ocspResponses = (Asn1Sequence) seq[0].ToAsn1Object();

			foreach (Asn1Encodable ae in this.ocspResponses)
			{
				OcspResponsesID.GetInstance(ae.ToAsn1Object());
			}
		}

		public OcspListID(
			params OcspResponsesID[] ocspResponses)
		{
			if (ocspResponses == null)
				throw new ArgumentNullException("ocspResponses");

			this.ocspResponses = new DerSequence(ocspResponses);
		}

		public OcspListID(
			IEnumerable<OcspResponsesID> ocspResponses)
		{
			if (ocspResponses == null)
				throw new ArgumentNullException("ocspResponses");

			this.ocspResponses = new DerSequence(
				Asn1EncodableVector.FromEnumerable(ocspResponses));
		}

		public OcspResponsesID[] GetOcspResponses()
		{
			OcspResponsesID[] result = new OcspResponsesID[ocspResponses.Count];
			for (int i = 0; i < ocspResponses.Count; ++i)
			{
				result[i] = OcspResponsesID.GetInstance(ocspResponses[i].ToAsn1Object());
			}
			return result;
		}

		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(ocspResponses);
		}
	}
}
