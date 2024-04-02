using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security.Certificates
{
    [Serializable]
    public class CertificateParsingException
		: CertificateException
	{
		public CertificateParsingException()
			: base()
		{
		}

		public CertificateParsingException(string message)
			: base(message)
		{
		}

		public CertificateParsingException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected CertificateParsingException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
