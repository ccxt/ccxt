using System;
using System.IO;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.OpenSsl
{
    [Serializable]
    public class PemException
		: IOException
	{
		public PemException()
			: base()
		{
		}

		public PemException(string message)
			: base(message)
		{
		}

		public PemException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected PemException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
