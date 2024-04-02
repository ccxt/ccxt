using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 4492 5.1.2</summary>
    public abstract class ECPointFormat
    {
        public const short uncompressed = 0;
        public const short ansiX962_compressed_prime = 1;
        public const short ansiX962_compressed_char2 = 2;

        /*
         * reserved (248..255)
         */
    }
}
