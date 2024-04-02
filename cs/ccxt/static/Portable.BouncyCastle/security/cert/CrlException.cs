using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security.Certificates
{
    [Serializable]
    public class CrlException
		: GeneralSecurityException
	{
		public CrlException()
			: base()
		{
		}

		public CrlException(string message)
			: base(message)
		{
		}

		public CrlException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected CrlException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
