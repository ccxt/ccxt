using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Cms
{
    [Serializable]
    public class CmsException
		: Exception
	{
		public CmsException()
			: base()
		{
		}

		public CmsException(string message)
			: base(message)
		{
		}

		public CmsException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected CmsException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
