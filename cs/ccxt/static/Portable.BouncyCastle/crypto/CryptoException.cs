using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Crypto
{
    [Serializable]
    public class CryptoException
		: Exception
    {
		public CryptoException()
			: base()
		{
		}

		public CryptoException(string message)
			: base(message)
		{
		}

		public CryptoException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected CryptoException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
