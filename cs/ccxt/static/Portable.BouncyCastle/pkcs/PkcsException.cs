using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Pkcs
{
	/// <summary>Base exception for PKCS related issues.</summary>
	[Serializable]
	public class PkcsException
        : Exception
    {
		public PkcsException()
			: base()
		{
		}

		public PkcsException(string message)
			: base(message)
		{
		}

		public PkcsException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected PkcsException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
