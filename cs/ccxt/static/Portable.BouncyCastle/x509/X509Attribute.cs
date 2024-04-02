using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.X509
{
	/**
	 * Class for carrying the values in an X.509 Attribute.
	 */
	public class X509Attribute
		: Asn1Encodable
	{
		private readonly AttributeX509 attr;

		/**
		 * @param at an object representing an attribute.
		 */
		internal X509Attribute(
			Asn1Encodable at)
		{
			this.attr = AttributeX509.GetInstance(at);
		}

		/**
		 * Create an X.509 Attribute with the type given by the passed in oid and
		 * the value represented by an ASN.1 Set containing value.
		 *
		 * @param oid type of the attribute
		 * @param value value object to go into the atribute's value set.
		 */
		public X509Attribute(
			string			oid,
			Asn1Encodable	value)
		{
			this.attr = new AttributeX509(new DerObjectIdentifier(oid), new DerSet(value));
		}

		/**
		 * Create an X.59 Attribute with the type given by the passed in oid and the
		 * value represented by an ASN.1 Set containing the objects in value.
		 *
		 * @param oid type of the attribute
		 * @param value vector of values to go in the attribute's value set.
		 */
		public X509Attribute(
			string              oid,
			Asn1EncodableVector value)
		{
			this.attr = new AttributeX509(new DerObjectIdentifier(oid), new DerSet(value));
		}

		public string Oid
		{
			get { return attr.AttrType.Id; }
		}

		public Asn1Encodable[] GetValues()
		{
			Asn1Set s = attr.AttrValues;
			Asn1Encodable[] values = new Asn1Encodable[s.Count];

			for (int i = 0; i != s.Count; i++)
			{
				values[i] = (Asn1Encodable)s[i];
			}

			return values;
		}

		public override Asn1Object ToAsn1Object()
		{
			return attr.ToAsn1Object();
		}
	}
}
