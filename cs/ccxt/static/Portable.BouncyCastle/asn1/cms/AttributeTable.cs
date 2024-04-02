using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class AttributeTable
    {
        private readonly Dictionary<DerObjectIdentifier, object> m_attributes;

        public AttributeTable(IDictionary<DerObjectIdentifier, object> attrs)
        {
            m_attributes = new Dictionary<DerObjectIdentifier, object>(attrs);
        }

        public AttributeTable(Asn1EncodableVector v)
        {
            m_attributes = new Dictionary<DerObjectIdentifier, object>(v.Count);

            foreach (Asn1Encodable e in v)
            {
				AddAttribute(Attribute.GetInstance(e));
            }
        }

        public AttributeTable(Asn1Set s)
        {
            m_attributes = new Dictionary<DerObjectIdentifier, object>(s.Count);

            foreach (Asn1Encodable e in s)
            {
                AddAttribute(Attribute.GetInstance(e));
            }
        }

		public AttributeTable(Attributes attrs)
			: this(Asn1Set.GetInstance(attrs.ToAsn1Object()))
		{
		}

		private void AddAttribute(Attribute a)
        {
			DerObjectIdentifier oid = a.AttrType;

            if (!m_attributes.TryGetValue(oid, out object existingValue))
            {
                m_attributes[oid] = a;
                return;
            }

            if (existingValue is IList<Attribute> existingList)
            {
                existingList.Add(a);
                return;
            }

            if (existingValue is Attribute existingAttr)
            {
                var newList = new List<Attribute>();
                newList.Add(existingAttr);
                newList.Add(a);
                m_attributes[oid] = newList;
                return;
            }

            throw new InvalidOperationException();
        }

		/// <summary>Return the first attribute matching the given OBJECT IDENTIFIER</summary>
		public Attribute this[DerObjectIdentifier oid]
		{
			get
			{
                if (!m_attributes.TryGetValue(oid, out object existingValue))
                    return null;

                if (existingValue is IList<Attribute> existingList)
                    return existingList[0];

                if (existingValue is Attribute existingAttr)
                    return existingAttr;

                throw new InvalidOperationException();
            }
        }

		/**
        * Return all the attributes matching the OBJECT IDENTIFIER oid. The vector will be
        * empty if there are no attributes of the required type present.
        *
        * @param oid type of attribute required.
        * @return a vector of all the attributes found of type oid.
        */
        public Asn1EncodableVector GetAll(DerObjectIdentifier oid)
        {
            Asn1EncodableVector v = new Asn1EncodableVector();

            if (m_attributes.TryGetValue(oid, out object existingValue))
            {
                if (existingValue is IList<Attribute> existingList)
                {
                    foreach (var attr in existingList)
                    {
                        v.Add(attr);
                    }
                }
                else if (existingValue is Attribute existingAttr)
                {
                    v.Add(existingAttr);
                }
                else
                {
                    throw new InvalidOperationException();
                }
            }

            return v;
        }

		public int Count
		{
			get
			{
				int total = 0;

                foreach (object existingValue in m_attributes.Values)
                {
                    if (existingValue is IList<Attribute> existingList)
                    {
                        total += existingList.Count;
                    }
                    else if (existingValue is Attribute existingAttr)
                    {
                        ++total;
                    }
                    else
                    {
                        throw new InvalidOperationException();
                    }
                }

				return total;
			}
		}

        public IDictionary<DerObjectIdentifier, object> ToDictionary()
        {
            return new Dictionary<DerObjectIdentifier, object>(m_attributes);
        }

		public Asn1EncodableVector ToAsn1EncodableVector()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();

            foreach (object existingValue in m_attributes.Values)
            {
                if (existingValue is IList<Attribute> existingList)
                {
                    foreach (Attribute existingAttr in existingList)
                    {
                        v.Add(existingAttr);
                    }
                }
                else if (existingValue is Attribute existingAttr)
                {
                    v.Add(existingAttr);
                }
                else
                {
                    throw new InvalidOperationException();
                }
            }

            return v;
        }

		public Attributes ToAttributes()
		{
			return new Attributes(ToAsn1EncodableVector());
		}

        public AttributeTable Add(params Attribute[] attributes)
        {
            if (attributes == null || attributes.Length < 1)
                return this;

            var newTable = new AttributeTable(m_attributes);
            foreach (Attribute attribute in attributes)
            {
                newTable.AddAttribute(attribute);
            }

            return newTable;
        }

        /**
		 * Return a new table with the passed in attribute added.
		 *
		 * @param attrType
		 * @param attrValue
		 * @return
		 */
        public AttributeTable Add(DerObjectIdentifier attrType, Asn1Encodable attrValue)
		{
			AttributeTable newTable = new AttributeTable(m_attributes);

			newTable.AddAttribute(new Attribute(attrType, new DerSet(attrValue)));

			return newTable;
		}

		public AttributeTable Remove(DerObjectIdentifier attrType)
		{
			AttributeTable newTable = new AttributeTable(m_attributes);

			newTable.m_attributes.Remove(attrType);

			return newTable;
		}
    }
}
