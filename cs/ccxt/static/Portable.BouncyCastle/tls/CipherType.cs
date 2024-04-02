using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 2246</summary>
    /// <remarks>
    /// Note that the values here are implementation-specific and arbitrary. It is recommended not to depend on the
    /// particular values (e.g. serialization).
    /// </remarks>
    public abstract class CipherType
    {
        public const int stream = 0;
        public const int block = 1;

        /*
         * RFC 5246
         */
        public const int aead = 2;
    }
}
