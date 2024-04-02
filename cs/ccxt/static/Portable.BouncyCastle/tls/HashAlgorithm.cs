using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 5246 7.4.1.4.1</summary>
    public abstract class HashAlgorithm
    {
        public const short none = 0;
        public const short md5 = 1;
        public const short sha1 = 2;
        public const short sha224 = 3;
        public const short sha256 = 4;
        public const short sha384 = 5;
        public const short sha512 = 6;

        /*
         * RFC 8422
         */
        public const short Intrinsic = 8;

        public static string GetName(short hashAlgorithm)
        {
            switch (hashAlgorithm)
            {
            case none:
                return "none";
            case md5:
                return "md5";
            case sha1:
                return "sha1";
            case sha224:
                return "sha224";
            case sha256:
                return "sha256";
            case sha384:
                return "sha384";
            case sha512:
                return "sha512";
            case Intrinsic:
                return "Intrinsic";
            default:
                return "UNKNOWN";
            }
        }

        public static int GetOutputSize(short hashAlgorithm)
        {
            switch (hashAlgorithm)
            {
            case md5:
                return 16;
            case sha1:
                return 20;
            case sha224:
                return 28;
            case sha256:
                return 32;
            case sha384:
                return 48;
            case sha512:
                return 64;
            default:
                return -1;
            }
        }

        public static string GetText(short hashAlgorithm)
        {
            return GetName(hashAlgorithm) + "(" + hashAlgorithm + ")";
        }

        public static bool IsPrivate(short hashAlgorithm)
        {
            return 224 <= hashAlgorithm && hashAlgorithm <= 255;
        }

        public static bool IsRecognized(short hashAlgorithm)
        {
            switch (hashAlgorithm)
            {
                case md5:
                case sha1:
                case sha224:
                case sha256:
                case sha384:
                case sha512:
                case Intrinsic:
                    return true;
                default:
                    return false;
            }
        }
    }
}
