using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Tsp
{
    [Serializable]
    public class TspException
		: Exception
	{
		public TspException()
			: base()
		{
		}

		public TspException(string message)
			: base(message)
		{
		}

		public TspException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected TspException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
