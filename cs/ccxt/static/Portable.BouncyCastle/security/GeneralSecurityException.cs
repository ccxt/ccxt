using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security
{
    [Serializable]
    public class GeneralSecurityException
		: Exception
	{
		public GeneralSecurityException()
			: base()
		{
		}

		public GeneralSecurityException(string message)
			: base(message)
		{
		}

		public GeneralSecurityException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected GeneralSecurityException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
