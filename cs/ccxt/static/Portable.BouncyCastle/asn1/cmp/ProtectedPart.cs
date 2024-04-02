using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class ProtectedPart
		: Asn1Encodable
	{
		private readonly PkiHeader header;
		private readonly PkiBody body;
		
		private ProtectedPart(Asn1Sequence seq)
		{
			header = PkiHeader.GetInstance(seq[0]);
			body = PkiBody.GetInstance(seq[1]);
		}

		public static ProtectedPart GetInstance(object obj)
		{
			if (obj is ProtectedPart)
				return (ProtectedPart)obj;

			if (obj is Asn1Sequence)
				return new ProtectedPart((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public ProtectedPart(PkiHeader header, PkiBody body)
		{
			this.header = header;
			this.body = body;
		}

		public virtual PkiHeader Header
		{
			get { return header; }
		}

		public virtual PkiBody Body
		{
			get { return body; }
		}

		/**
		 * <pre>
		 * ProtectedPart ::= SEQUENCE {
		 *                    header    PKIHeader,
		 *                    body      PKIBody
		 * }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(header, body);
		}
	}
}
