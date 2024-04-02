using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 2246</summary>
    /// <remarks>
    /// Note that the values here are implementation-specific and arbitrary. It is recommended not to depend on the
    /// particular values (e.g. serialization).
    /// </remarks>
    public abstract class MacAlgorithm
    {
        public const int cls_null = 0;
        public const int md5 = 1;
        public const int sha = 2;

        /*
         * RFC 5246
         */
        public const int hmac_md5 = md5;
        public const int hmac_sha1 = sha;
        public const int hmac_sha256 = 3;
        public const int hmac_sha384 = 4;
        public const int hmac_sha512 = 5;

        public static string GetName(int macAlgorithm)
        {
            switch (macAlgorithm)
            {
            case cls_null:
                return "null";
            case hmac_md5:
                return "hmac_md5";
            case hmac_sha1:
                return "hmac_sha1";
            case hmac_sha256:
                return "hmac_sha256";
            case hmac_sha384:
                return "hmac_sha384";
            case hmac_sha512:
                return "hmac_sha512";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(int macAlgorithm)
        {
            return GetName(macAlgorithm) + "(" + macAlgorithm + ")";
        }

        public static bool IsHmac(int macAlgorithm)
        {
            switch (macAlgorithm)
            {
            case hmac_md5:
            case hmac_sha1:
            case hmac_sha256:
            case hmac_sha384:
            case hmac_sha512:
                return true;
            default:
                return false;
            }
        }
    }
}
