using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    public abstract class TlsCertificateRole
    {
        public const int DH = 1;
        public const int ECDH = 2;
        public const int RsaEncryption = 3;
        public const int Sm2Encryption = 4;
    }
}
