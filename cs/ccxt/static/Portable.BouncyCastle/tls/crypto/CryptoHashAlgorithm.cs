using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    public abstract class CryptoHashAlgorithm
    {
        public const int md5 = 1;
        public const int sha1 = 2;
        public const int sha224 = 3;
        public const int sha256 = 4;
        public const int sha384 = 5;
        public const int sha512 = 6;
        public const int sm3 = 7;
    }
}
