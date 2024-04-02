using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;

namespace Org.BouncyCastle.Cms
{
	/**
	 * Default signed attributes generator.
	 */
	public class DefaultSignedAttributeTableGenerator
		: CmsAttributeTableGenerator
	{
		private readonly IDictionary<DerObjectIdentifier, object> m_table;

		/**
		 * Initialise to use all defaults
		 */
		public DefaultSignedAttributeTableGenerator()
		{
			m_table = new Dictionary<DerObjectIdentifier, object>();
		}

		/**
		 * Initialise with some extra attributes or overrides.
		 *
		 * @param attributeTable initial attribute table to use.
		 */
		public DefaultSignedAttributeTableGenerator(AttributeTable attributeTable)
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
		 * normally include contentType, signingTime, and messageDigest. If the constructor
		 * using an AttributeTable was used, entries in it for contentType, signingTime, and
		 * messageDigest will override the generated ones.
		 *
		 * @param parameters source parameters for table generation.
		 *
		 * @return a filled in Dictionary of attributes.
		 */
		protected virtual IDictionary<DerObjectIdentifier, object> CreateStandardAttributeTable(
			IDictionary<CmsAttributeTableParameter, object> parameters)
		{
            var std = new Dictionary<DerObjectIdentifier, object>(m_table);
            DoCreateStandardAttributeTable(parameters, std);
			return std;
		}

        private void DoCreateStandardAttributeTable(IDictionary<CmsAttributeTableParameter, object> parameters,
			IDictionary<DerObjectIdentifier, object> std)
        {
            // contentType will be absent if we're trying to generate a counter signature.

            if (parameters.ContainsKey(CmsAttributeTableParameter.ContentType))
            {
                if (!std.ContainsKey(CmsAttributes.ContentType))
                {
                    DerObjectIdentifier contentType = (DerObjectIdentifier)
                        parameters[CmsAttributeTableParameter.ContentType];
                    Asn1.Cms.Attribute attr = new Asn1.Cms.Attribute(CmsAttributes.ContentType,
                        new DerSet(contentType));
                    std[attr.AttrType] = attr;
                }
            }

            if (!std.ContainsKey(CmsAttributes.SigningTime))
            {
                Asn1.Cms.Attribute attr = new Asn1.Cms.Attribute(CmsAttributes.SigningTime,
                    new DerSet(new Time(DateTime.UtcNow)));
                std[attr.AttrType] = attr;
            }

            if (!std.ContainsKey(CmsAttributes.MessageDigest))
            {
                byte[] messageDigest = (byte[])parameters[CmsAttributeTableParameter.Digest];
                Asn1.Cms.Attribute attr = new Asn1.Cms.Attribute(CmsAttributes.MessageDigest,
                    new DerSet(new DerOctetString(messageDigest)));
                std[attr.AttrType] = attr;
            }
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
