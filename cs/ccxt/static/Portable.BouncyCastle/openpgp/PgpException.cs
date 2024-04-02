using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <summary>Generic exception class for PGP encoding/decoding problems.</summary>
    [Serializable]
    public class PgpException
		: Exception
	{
		public PgpException()
			: base()
		{
		}

		public PgpException(string message)
			: base(message)
		{
		}

		public PgpException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected PgpException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
