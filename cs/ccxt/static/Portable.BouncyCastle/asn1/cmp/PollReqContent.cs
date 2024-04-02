using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class PollReqContent
		: Asn1Encodable
	{
		private readonly Asn1Sequence content;

		private PollReqContent(Asn1Sequence seq)
		{
			content = seq;
		}

		public static PollReqContent GetInstance(object obj)
		{
			if (obj is PollReqContent)
				return (PollReqContent)obj;

			if (obj is Asn1Sequence)
				return new PollReqContent((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public virtual DerInteger[][] GetCertReqIDs()
		{
			DerInteger[][] result = new DerInteger[content.Count][];
			for (int i = 0; i != result.Length; ++i)
			{
				result[i] = SequenceToDerIntegerArray((Asn1Sequence)content[i]);
			}
			return result;
		}

		private static DerInteger[] SequenceToDerIntegerArray(Asn1Sequence seq)
		{
			DerInteger[] result = new DerInteger[seq.Count];
			for (int i = 0; i != result.Length; ++i)
			{
				result[i] = DerInteger.GetInstance(seq[i]);
			}
			return result;
		}

		/**
		 * <pre>
		 * PollReqContent ::= SEQUENCE OF SEQUENCE {
		 *                        certReqId              INTEGER
		 * }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			return content;
		}
	}
}
