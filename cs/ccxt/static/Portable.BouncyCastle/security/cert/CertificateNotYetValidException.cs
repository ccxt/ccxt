using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Security.Certificates
{
    [Serializable]
    public class CertificateNotYetValidException
		: CertificateException
	{
		public CertificateNotYetValidException()
			: base()
		{
		}

		public CertificateNotYetValidException(string message)
			: base(message)
		{
		}

		public CertificateNotYetValidException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected CertificateNotYetValidException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
