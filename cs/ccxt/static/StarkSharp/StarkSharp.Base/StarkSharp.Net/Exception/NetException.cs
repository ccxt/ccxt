using System;

namespace StarkSharp.Base.Net.Exception
{
    public class NetException : System.Exception
    {
        public NetException() : base()
        {
        }

        public NetException(string message) : base(message)
        {
        }
        public NetException(string message, System.Exception innerException) : base(message, innerException)
        {
        }
    }
}
