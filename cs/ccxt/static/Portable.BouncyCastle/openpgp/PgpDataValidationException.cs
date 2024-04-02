using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <summary>Thrown if the IV at the start of a data stream indicates the wrong key is being used.</summary>
    [Serializable]
    public class PgpDataValidationException
        : PgpException
	{
		public PgpDataValidationException()
			: base()
		{
		}

		public PgpDataValidationException(string message)
			: base(message)
		{
		}

		public PgpDataValidationException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected PgpDataValidationException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}
}
