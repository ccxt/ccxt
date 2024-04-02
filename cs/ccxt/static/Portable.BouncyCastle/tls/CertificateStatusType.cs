using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class CertificateStatusType
    {
        /*
         *  RFC 6066
         */
        public const short ocsp = 1;

        /*
         *  RFC 6961
         */
        public const short ocsp_multi = 2;
    }
}
