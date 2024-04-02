using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security.Certificates
{
    [Serializable]
    public class CertificateEncodingException
		: CertificateException
	{
		public CertificateEncodingException()
			: base()
		{
		}

		public CertificateEncodingException(string message)
			: base(message)
		{
		}

		public CertificateEncodingException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected CertificateEncodingException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
