using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// RFC 3126: 4.2.2 Complete Revocation Refs Attribute Definition
	/// <code>
	/// CompleteRevocationRefs ::= SEQUENCE OF CrlOcspRef
	/// </code>
	/// </remarks>
	public class CompleteRevocationRefs
		: Asn1Encodable
	{
		private readonly Asn1Sequence crlOcspRefs;

		public static CompleteRevocationRefs GetInstance(
			object obj)
		{
			if (obj == null || obj is CompleteRevocationRefs)
				return (CompleteRevocationRefs) obj;

			if (obj is Asn1Sequence)
				return new CompleteRevocationRefs((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'CompleteRevocationRefs' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private CompleteRevocationRefs(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");

			foreach (Asn1Encodable ae in seq)
			{
				CrlOcspRef.GetInstance(ae.ToAsn1Object());
			}

			this.crlOcspRefs = seq;
		}

		public CompleteRevocationRefs(
			params CrlOcspRef[] crlOcspRefs)
		{
			if (crlOcspRefs == null)
				throw new ArgumentNullException("crlOcspRefs");

			this.crlOcspRefs = new DerSequence(crlOcspRefs);
		}

		public CompleteRevocationRefs(
			IEnumerable<CrlOcspRef> crlOcspRefs)
		{
			if (crlOcspRefs == null)
				throw new ArgumentNullException("crlOcspRefs");

			this.crlOcspRefs = new DerSequence(
				Asn1EncodableVector.FromEnumerable(crlOcspRefs));
		}

		public CrlOcspRef[] GetCrlOcspRefs()
		{
			CrlOcspRef[] result = new CrlOcspRef[crlOcspRefs.Count];
			for (int i = 0; i < crlOcspRefs.Count; ++i)
			{
				result[i] = CrlOcspRef.GetInstance(crlOcspRefs[i].ToAsn1Object());
			}
			return result;
		}

		public override Asn1Object ToAsn1Object()
		{
			return crlOcspRefs;
		}
	}
}
