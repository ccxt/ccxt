using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class ClientCertificateType
    {
        /*
         *  RFC 4346 7.4.4
         */
        public const short rsa_sign = 1;
        public const short dss_sign = 2;
        public const short rsa_fixed_dh = 3;
        public const short dss_fixed_dh = 4;
        public const short rsa_ephemeral_dh_RESERVED = 5;
        public const short dss_ephemeral_dh_RESERVED = 6;
        public const short fortezza_dms_RESERVED = 20;

        /*
         * RFC 4492 5.5
         */
        public const short ecdsa_sign = 64;
        public const short rsa_fixed_ecdh = 65;
        public const short ecdsa_fixed_ecdh = 66;

        /*
         * draft-smyshlyaev-tls12-gost-suites-10
         */
        public const short gost_sign256 = 67;
        public const short gost_sign512 = 68;

        public static string GetName(short clientCertificateType)
        {
            switch (clientCertificateType)
            {
            case rsa_sign:
                return "rsa_sign";
            case dss_sign:
                return "dss_sign";
            case rsa_fixed_dh:
                return "rsa_fixed_dh";
            case dss_fixed_dh:
                return "dss_fixed_dh";
            case rsa_ephemeral_dh_RESERVED:
                return "rsa_ephemeral_dh_RESERVED";
            case dss_ephemeral_dh_RESERVED:
                return "dss_ephemeral_dh_RESERVED";
            case fortezza_dms_RESERVED:
                return "fortezza_dms_RESERVED";
            case ecdsa_sign:
                return "ecdsa_sign";
            case rsa_fixed_ecdh:
                return "rsa_fixed_ecdh";
            case ecdsa_fixed_ecdh:
                return "ecdsa_fixed_ecdh";
            case gost_sign256:
                return "gost_sign256";
            case gost_sign512:
                return "gost_sign512";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(short clientCertificateType)
        {
            return GetName(clientCertificateType) + "(" + clientCertificateType + ")";
        }
    }
}
