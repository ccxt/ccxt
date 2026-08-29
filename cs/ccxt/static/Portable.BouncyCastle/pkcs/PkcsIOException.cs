using System;
using System.IO;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Pkcs
{
	/// <summary>Base exception for parsing related issues in the PKCS namespace.</summary>
	[Serializable]
	public class PkcsIOException
		: IOException
    {
		public PkcsIOException()
			: base()
		{
		}

		public PkcsIOException(string message)
			: base(message)
		{
		}

		public PkcsIOException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected PkcsIOException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
