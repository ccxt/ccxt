using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security
{
    [Serializable]
    public class InvalidKeyException
		: KeyException
	{
		public InvalidKeyException()
			: base()
		{
		}

		public InvalidKeyException(string message)
			: base(message)
		{
		}

		public InvalidKeyException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected InvalidKeyException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
