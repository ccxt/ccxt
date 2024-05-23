using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security
{
    [Serializable]
    public class InvalidParameterException
		: KeyException
	{
		public InvalidParameterException()
			: base()
		{
		}

		public InvalidParameterException(string message)
			: base(message)
		{
		}

		public InvalidParameterException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected InvalidParameterException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
