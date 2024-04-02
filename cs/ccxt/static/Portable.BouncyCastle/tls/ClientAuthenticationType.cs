using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class ClientAuthenticationType
    {
        /*
         * RFC 5077 4
         */
        public const short anonymous = 0;
        public const short certificate_based = 1;
        public const short psk = 2;
    }
}
