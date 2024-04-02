using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <summary>Thrown if the key checksum is invalid.</summary>
    [Serializable]
    public class PgpKeyValidationException
		: PgpException
	{
		public PgpKeyValidationException()
			: base()
		{
		}

		public PgpKeyValidationException(string message)
			: base(message)
		{
		}

		public PgpKeyValidationException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected PgpKeyValidationException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
