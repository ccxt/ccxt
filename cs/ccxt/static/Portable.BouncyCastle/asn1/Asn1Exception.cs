using System;
using System.IO;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Asn1
{
    [Serializable]
    public class Asn1Exception
		: IOException
	{
		public Asn1Exception()
			: base()
		{
		}

		public Asn1Exception(string message)
			: base(message)
		{
		}

		public Asn1Exception(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected Asn1Exception(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
