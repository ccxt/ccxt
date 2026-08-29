using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security
{
    [Serializable]
    public class KeyException
		: GeneralSecurityException
	{
		public KeyException()
			: base()
		{
		}

		public KeyException(string message)
			: base(message)
		{
		}

		public KeyException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected KeyException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
