using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class PopoDecKeyRespContent
		: Asn1Encodable
	{
		private readonly Asn1Sequence content;

		private PopoDecKeyRespContent(Asn1Sequence seq)
		{
			content = seq;
		}

		public static PopoDecKeyRespContent GetInstance(object obj)
		{
			if (obj is PopoDecKeyRespContent)
				return (PopoDecKeyRespContent)obj;

			if (obj is Asn1Sequence)
				return new PopoDecKeyRespContent((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public virtual DerInteger[] ToDerIntegerArray()
		{
			DerInteger[] result = new DerInteger[content.Count];
			for (int i = 0; i != result.Length; ++i)
			{
				result[i] = DerInteger.GetInstance(content[i]);
			}
			return result;
		}

		/**
		 * <pre>
		 * PopoDecKeyRespContent ::= SEQUENCE OF INTEGER
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			return content;
		}
	}
}
