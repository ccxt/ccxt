using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 5246</summary>
    /// <remarks>
    /// Note that the values here are implementation-specific and arbitrary. It is recommended not to depend on the
    /// particular values (e.g. serialization).
    /// </remarks>
    public abstract class PrfAlgorithm
    {
        public const int ssl_prf_legacy = 0;
        public const int tls_prf_legacy = 1;
        public const int tls_prf_sha256 = 2;
        public const int tls_prf_sha384 = 3;
        public const int tls13_hkdf_sha256 = 4;
        public const int tls13_hkdf_sha384 = 5;
        //public const int tls13_hkdf_sha512 = 6;
        public const int tls13_hkdf_sm3 = 7;

        public static string GetName(int prfAlgorithm)
        {
            switch (prfAlgorithm)
            {
            case ssl_prf_legacy:
                return "ssl_prf_legacy";
            case tls_prf_legacy:
                return "tls_prf_legacy";
            case tls_prf_sha256:
                return "tls_prf_sha256";
            case tls_prf_sha384:
                return "tls_prf_sha384";
            case tls13_hkdf_sha256:
                return "tls13_hkdf_sha256";
            case tls13_hkdf_sha384:
                return "tls13_hkdf_sha384";
            case tls13_hkdf_sm3:
                return "tls13_hkdf_sm3";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(int prfAlgorithm)
        {
            return GetName(prfAlgorithm) + "(" + prfAlgorithm + ")";
        }
    }
}
