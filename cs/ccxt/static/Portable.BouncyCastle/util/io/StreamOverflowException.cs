using System;
using System.IO;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Utilities.IO
{
    [Serializable]
    public class StreamOverflowException
		: IOException
	{
		public StreamOverflowException()
			: base()
		{
		}

		public StreamOverflowException(string message)
			: base(message)
		{
		}

		public StreamOverflowException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected StreamOverflowException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
