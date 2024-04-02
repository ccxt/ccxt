using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;

namespace Org.BouncyCastle.Cms
{
	/**
	 * Default authenticated attributes generator.
	 */
	public class DefaultAuthenticatedAttributeTableGenerator
		: CmsAttributeTableGenerator
	{
		private readonly IDictionary<DerObjectIdentifier, object> m_table;

		/**
		 * Initialise to use all defaults
		 */
		public DefaultAuthenticatedAttributeTableGenerator()
		{
			m_table = new Dictionary<DerObjectIdentifier, object>();
		}

		/**
		 * Initialise with some extra attributes or overrides.
		 *
		 * @param attributeTable initial attribute table to use.
		 */
		public DefaultAuthenticatedAttributeTableGenerator(
			AttributeTable attributeTable)
		{
			if (attributeTable != null)
			{
				m_table = attributeTable.ToDictionary();
			}
			else
			{
				m_table = new Dictionary<DerObjectIdentifier, object>();
			}
		}

		/**
		 * Create a standard attribute table from the passed in parameters - this will
		 * normally include contentType and messageDigest. If the constructor
		 * using an AttributeTable was used, entries in it for contentType and
		 * messageDigest will override the generated ones.
		 *
		 * @param parameters source parameters for table generation.
		 *
		 * @return a filled in IDictionary of attributes.
		 */
		protected virtual IDictionary<DerObjectIdentifier, object> CreateStandardAttributeTable(
			IDictionary<CmsAttributeTableParameter, object> parameters)
		{
            var std = new Dictionary<DerObjectIdentifier, object>(m_table);

			if (!std.ContainsKey(CmsAttributes.ContentType))
            {
                DerObjectIdentifier contentType = (DerObjectIdentifier)
                    parameters[CmsAttributeTableParameter.ContentType];
                Asn1.Cms.Attribute attr = new Asn1.Cms.Attribute(CmsAttributes.ContentType,
                    new DerSet(contentType));
                std[attr.AttrType] = attr;
            }

			if (!std.ContainsKey(CmsAttributes.MessageDigest))
            {
                byte[] messageDigest = (byte[])parameters[CmsAttributeTableParameter.Digest];
                Asn1.Cms.Attribute attr = new Asn1.Cms.Attribute(CmsAttributes.MessageDigest,
                    new DerSet(new DerOctetString(messageDigest)));
                std[attr.AttrType] = attr;
            }

            return std;
		}

		/**
		 * @param parameters source parameters
		 * @return the populated attribute table
		 */
		public virtual AttributeTable GetAttributes(IDictionary<CmsAttributeTableParameter, object> parameters)
		{
            var table = CreateStandardAttributeTable(parameters);
			return new AttributeTable(table);
		}
	}
}
