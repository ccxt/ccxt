using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Tls.Crypto
{
	/// <summary>Basic exception class for crypto services to pass back a cause.</summary>
	[Serializable]
	public class TlsCryptoException
        : TlsException
    {
		public TlsCryptoException()
			: base()
		{
		}

		public TlsCryptoException(string message)
			: base(message)
		{
		}

		public TlsCryptoException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected TlsCryptoException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
