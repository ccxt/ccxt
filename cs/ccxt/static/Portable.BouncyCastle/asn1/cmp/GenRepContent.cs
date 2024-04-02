using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class GenRepContent
		: Asn1Encodable
	{
		private readonly Asn1Sequence content;

		private GenRepContent(Asn1Sequence seq)
		{
			content = seq;
		}

		public static GenRepContent GetInstance(object obj)
		{
			if (obj is GenRepContent)
				return (GenRepContent)obj;

			if (obj is Asn1Sequence)
				return new GenRepContent((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public GenRepContent(params InfoTypeAndValue[] itv)
		{
			content = new DerSequence(itv);
		}

		public virtual InfoTypeAndValue[] ToInfoTypeAndValueArray()
		{
			InfoTypeAndValue[] result = new InfoTypeAndValue[content.Count];
			for (int i = 0; i != result.Length; ++i)
			{
				result[i] = InfoTypeAndValue.GetInstance(content[i]);
			}
			return result;
		}

		/**
		 * <pre>
		 * GenRepContent ::= SEQUENCE OF InfoTypeAndValue
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			return content;
		}
	}
}
