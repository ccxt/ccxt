using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Cms
{
    [Serializable]
    public class CmsAttributeTableGenerationException
		: CmsException
	{
        public CmsAttributeTableGenerationException()
            : base()
        {
        }

        public CmsAttributeTableGenerationException(string message)
            : base(message)
        {
        }

        public CmsAttributeTableGenerationException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected CmsAttributeTableGenerationException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
	}
}
