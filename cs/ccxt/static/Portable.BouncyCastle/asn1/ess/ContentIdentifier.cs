using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ess
{
	public class ContentIdentifier
		: Asn1Encodable
	{
		private Asn1OctetString value;

		public static ContentIdentifier GetInstance(
			object o)
		{
			if (o == null || o is ContentIdentifier)
			{
				return (ContentIdentifier) o;
			}

			if (o is Asn1OctetString)
			{
				return new ContentIdentifier((Asn1OctetString) o);
			}

			throw new ArgumentException(
				"unknown object in 'ContentIdentifier' factory : "
                + Platform.GetTypeName(o) + ".");
		}

		/**
		 * Create from OCTET STRING whose octets represent the identifier.
		 */
		public ContentIdentifier(
			Asn1OctetString value)
		{
			this.value = value;
		}

		/**
		 * Create from byte array representing the identifier.
		 */
		public ContentIdentifier(
			byte[] value)
			: this(new DerOctetString(value))
		{
		}

		public Asn1OctetString Value
		{
			get { return value; }
		}

		/**
		 * The definition of ContentIdentifier is
		 * <pre>
		 * ContentIdentifier ::=  OCTET STRING
		 * </pre>
		 * id-aa-contentIdentifier OBJECT IDENTIFIER ::= { iso(1)
		 *  member-body(2) us(840) rsadsi(113549) pkcs(1) pkcs9(9)
		 *  smime(16) id-aa(2) 7 }
		 */
		public override Asn1Object ToAsn1Object()
		{
			return value;
		}
	}
}
