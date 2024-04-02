using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Pkix
{
    [Serializable]
    public class PkixNameConstraintValidatorException
        : Exception
    {
		public PkixNameConstraintValidatorException()
			: base()
		{
		}

		public PkixNameConstraintValidatorException(string message)
			: base(message)
		{
		}

		public PkixNameConstraintValidatorException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		protected PkixNameConstraintValidatorException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
    }
}
