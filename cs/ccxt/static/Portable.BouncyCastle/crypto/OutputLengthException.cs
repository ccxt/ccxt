using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Crypto
{
    [Serializable]
    public class OutputLengthException
        : DataLengthException
    {
		public OutputLengthException()
			: base()
		{
		}

		public OutputLengthException(string message)
			: base(message)
		{
		}

		public OutputLengthException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected OutputLengthException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
