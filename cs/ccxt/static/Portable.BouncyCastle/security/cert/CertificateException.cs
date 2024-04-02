using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security.Certificates
{
    [Serializable]
    public class CertificateException
		: GeneralSecurityException
	{
		public CertificateException()
			: base()
		{
		}

		public CertificateException(string message)
			: base(message)
		{
		}

		public CertificateException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected CertificateException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
