using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Cmp
{
    [Serializable]
    public class CmpException
        : Exception
    {
        public CmpException()
            : base()
        {
        }

        public CmpException(string message)
            : base(message)
        {
        }

        public CmpException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected CmpException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
