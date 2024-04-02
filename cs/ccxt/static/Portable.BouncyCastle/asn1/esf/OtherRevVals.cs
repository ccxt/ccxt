using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Esf
{
	/// <remarks>
	/// RFC 3126: 4.3.2 Revocation Values Attribute Definition
	/// <code>
	/// OtherRevVals ::= SEQUENCE 
	/// {
	///		otherRevValType      OtherRevValType,
	///		otherRevVals         ANY DEFINED BY otherRevValType
	/// }
	///
	/// OtherRevValType ::= OBJECT IDENTIFIER
	/// </code>
	/// </remarks>
	public class OtherRevVals
		: Asn1Encodable
	{
		private readonly DerObjectIdentifier	otherRevValType;
		private readonly Asn1Object				otherRevVals;

		public static OtherRevVals GetInstance(
			object obj)
		{
			if (obj == null || obj is OtherRevVals)
				return (OtherRevVals) obj;

			if (obj is Asn1Sequence)
				return new OtherRevVals((Asn1Sequence) obj);

			throw new ArgumentException(
				"Unknown object in 'OtherRevVals' factory: "
                    + Platform.GetTypeName(obj),
				"obj");
		}

		private OtherRevVals(
			Asn1Sequence seq)
		{
			if (seq == null)
				throw new ArgumentNullException("seq");
			if (seq.Count != 2)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			this.otherRevValType = (DerObjectIdentifier) seq[0].ToAsn1Object();
			this.otherRevVals = seq[1].ToAsn1Object();
		}

		public OtherRevVals(
			DerObjectIdentifier	otherRevValType,
			Asn1Encodable		otherRevVals)
		{
			if (otherRevValType == null)
				throw new ArgumentNullException("otherRevValType");
			if (otherRevVals == null)
				throw new ArgumentNullException("otherRevVals");

			this.otherRevValType = otherRevValType;
			this.otherRevVals = otherRevVals.ToAsn1Object();
		}

		public DerObjectIdentifier OtherRevValType
		{
			get { return otherRevValType; }
		}

		public Asn1Object OtherRevValsObject
		{
			get { return otherRevVals; }
		}

		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(otherRevValType, otherRevVals);
		}
	}
}
