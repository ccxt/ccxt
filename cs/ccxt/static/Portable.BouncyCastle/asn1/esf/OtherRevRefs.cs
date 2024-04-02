using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// RFC 3126: 4.2.2 Complete Revocation Refs Attribute Definition
	/// <code>
	/// OtherRevRefs ::= SEQUENCE 
	/// {
	///		otherRevRefType      OtherRevRefType,
	///		otherRevRefs         ANY DEFINED BY otherRevRefType
	/// }
	///
	/// OtherRevRefType ::= OBJECT IDENTIFIER
	/// </code>
	/// </remarks>
	public class OtherRevRefs
		: Asn1Encodable
	{
		private readonly DerObjectIdentifier	otherRevRefType;
		private readonly Asn1Object				otherRevRefs;

		public static OtherRevRefs GetInstance(
			object obj)
		{
			if (obj == null || obj is OtherRevRefs)
				return (OtherRevRefs) obj;

			if (obj is Asn1Sequence)
				return new OtherRevRefs((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'OtherRevRefs' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private OtherRevRefs(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count != 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.otherRevRefType = (DerObjectIdentifier) seq[0].ToAsn1Object();
			this.otherRevRefs = seq[1].ToAsn1Object();
		}

		public OtherRevRefs(
			DerObjectIdentifier	otherRevRefType,
			Asn1Encodable		otherRevRefs)
		{
			if (otherRevRefType == null)
				throw new ArgumentNullException("otherRevRefType");
			if (otherRevRefs == null)
				throw new ArgumentNullException("otherRevRefs");

			this.otherRevRefType = otherRevRefType;
			this.otherRevRefs = otherRevRefs.ToAsn1Object();
		}

		public DerObjectIdentifier OtherRevRefType
		{
			get { return otherRevRefType; }
		}

		public Asn1Object OtherRevRefsObject
		{
			get { return otherRevRefs; }
		}

		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(otherRevRefType, otherRevRefs);
		}
	}
}
