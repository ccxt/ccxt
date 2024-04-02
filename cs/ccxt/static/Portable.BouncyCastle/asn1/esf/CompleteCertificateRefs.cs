using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// RFC 3126: 4.2.1 Complete Certificate Refs Attribute Definition
	/// <code>
	/// CompleteCertificateRefs ::= SEQUENCE OF OtherCertID
	/// </code>
	/// </remarks>
	public class CompleteCertificateRefs
		: Asn1Encodable
	{
		private readonly Asn1Sequence otherCertIDs;

		public static CompleteCertificateRefs GetInstance(
			object obj)
		{
			if (obj == null || obj is CompleteCertificateRefs)
				return (CompleteCertificateRefs) obj;

			if (obj is Asn1Sequence)
				return new CompleteCertificateRefs((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'CompleteCertificateRefs' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private CompleteCertificateRefs(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");

			foreach (Asn1Encodable ae in seq)
			{
				OtherCertID.GetInstance(ae.ToAsn1Object());
			}

			this.otherCertIDs = seq;
		}

		public CompleteCertificateRefs(
			params OtherCertID[] otherCertIDs)
		{
			if (otherCertIDs == null)
				throw new ArgumentNullException("otherCertIDs");

			this.otherCertIDs = new DerSequence(otherCertIDs);
		}

		public CompleteCertificateRefs(
			IEnumerable<OtherCertID> otherCertIDs)
		{
			if (otherCertIDs == null)
				throw new ArgumentNullException("otherCertIDs");

			this.otherCertIDs = new DerSequence(
				Asn1EncodableVector.FromEnumerable(otherCertIDs));
		}

		public OtherCertID[] GetOtherCertIDs()
		{
			OtherCertID[] result = new OtherCertID[otherCertIDs.Count];
			for (int i = 0; i < otherCertIDs.Count; ++i)
			{
				result[i] = OtherCertID.GetInstance(otherCertIDs[i].ToAsn1Object());
			}
			return result;
		}

		public override Asn1Object ToAsn1Object()
		{
			return otherCertIDs;
		}
	}
}
