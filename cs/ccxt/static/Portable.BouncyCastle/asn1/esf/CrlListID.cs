using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// RFC 3126: 4.2.2 Complete Revocation Refs Attribute Definition
	/// <code>
	/// CRLListID ::= SEQUENCE 
	/// {
	///		crls	SEQUENCE OF CrlValidatedID
	/// }
	/// </code>
	/// </remarks>
	public class CrlListID
		: Asn1Encodable
	{
		private readonly Asn1Sequence crls;

		public static CrlListID GetInstance(
			object obj)
		{
			if (obj == null || obj is CrlListID)
				return (CrlListID) obj;

			if (obj is Asn1Sequence)
				return new CrlListID((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'CrlListID' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private CrlListID(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count != 1)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.crls = (Asn1Sequence) seq[0].ToAsn1Object();

			foreach (Asn1Encodable ae in this.crls)
			{
				CrlValidatedID.GetInstance(ae.ToAsn1Object());
			}
		}

		public CrlListID(
			params CrlValidatedID[] crls)
		{
			if (crls == null)
				throw new ArgumentNullException("crls");

			this.crls = new DerSequence(crls);
		}

		public CrlListID(
			IEnumerable<CrlValidatedID> crls)
		{
			if (crls == null)
				throw new ArgumentNullException("crls");

			this.crls = new DerSequence(
				Asn1EncodableVector.FromEnumerable(crls));
		}

		public CrlValidatedID[] GetCrls()
		{
			CrlValidatedID[] result = new CrlValidatedID[crls.Count];
			for (int i = 0; i < crls.Count; ++i)
			{
				result[i] = CrlValidatedID.GetInstance(crls[i].ToAsn1Object());
			}
			return result;
		}

		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(crls);
		}
	}
}
