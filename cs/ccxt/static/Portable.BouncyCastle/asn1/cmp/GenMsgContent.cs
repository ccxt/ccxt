using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class GenMsgContent
		: Asn1Encodable
	{
		private readonly Asn1Sequence content;

		private GenMsgContent(Asn1Sequence seq)
		{
			content = seq;
		}

		public static GenMsgContent GetInstance(object obj)
		{
			if (obj is GenMsgContent)
				return (GenMsgContent)obj;

			if (obj is Asn1Sequence)
				return new GenMsgContent((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public GenMsgContent(params InfoTypeAndValue[] itv)
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
		 * GenMsgContent ::= SEQUENCE OF InfoTypeAndValue
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			return content;
		}
	}
}
