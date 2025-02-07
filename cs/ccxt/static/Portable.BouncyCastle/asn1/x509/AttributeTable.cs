using System.Collections.Generic;

using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Asn1.X509
{
    public class AttributeTable
    {
        private readonly IDictionary<DerObjectIdentifier, AttributeX509> m_attributes;

        public AttributeTable(IDictionary<DerObjectIdentifier, AttributeX509> attrs)
        {
            m_attributes = new Dictionary<DerObjectIdentifier, AttributeX509>(attrs);
        }

		public AttributeTable(Asn1EncodableVector v)
        {
            m_attributes = new Dictionary<DerObjectIdentifier, AttributeX509>(v.Count);

            for (int i = 0; i != v.Count; i++)
            {
                AttributeX509 a = AttributeX509.GetInstance(v[i]);

				m_attributes.Add(a.AttrType, a);
            }
        }

		public AttributeTable(Asn1Set s)
        {
            m_attributes = new Dictionary<DerObjectIdentifier, AttributeX509>(s.Count);

            for (int i = 0; i != s.Count; i++)
            {
                AttributeX509 a = AttributeX509.GetInstance(s[i]);

				m_attributes.Add(a.AttrType, a);
            }
        }

		public AttributeX509 Get(DerObjectIdentifier oid)
        {
            return CollectionUtilities.GetValueOrNull(m_attributes, oid);
        }

        public IDictionary<DerObjectIdentifier, AttributeX509> ToDictionary()
        {
            return new Dictionary<DerObjectIdentifier, AttributeX509>(m_attributes);
        }
    }
}
