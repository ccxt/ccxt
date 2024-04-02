using System;
using System.IO;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Cms
{
    [Serializable]
    public class CmsStreamException
        : IOException
    {
		public CmsStreamException()
			: base()
		{
		}

		public CmsStreamException(string message)
			: base(message)
		{
		}

		public CmsStreamException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected CmsStreamException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
