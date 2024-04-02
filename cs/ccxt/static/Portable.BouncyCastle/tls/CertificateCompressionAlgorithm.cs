using System;

namespace Org.BouncyCastle.Tls
{
    /**
     * RFC 8879
     */
    public abstract class CertificateCompressionAlgorithm
    {
        public const int zlib = 1;
        public const int brotli = 2;
        public const int zstd = 3;

        public static string GetName(int certificateCompressionAlgorithm)
        {
            switch (certificateCompressionAlgorithm)
            {
            case zlib:
                return "zlib";
            case brotli:
                return "brotli";
            case zstd:
                return "zstd";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(int certificateCompressionAlgorithm)
        {
            return GetName(certificateCompressionAlgorithm) + "(" + certificateCompressionAlgorithm + ")";
        }

        public static bool IsRecognized(int certificateCompressionAlgorithm)
        {
            switch (certificateCompressionAlgorithm)
            {
            case zlib:
            case brotli:
            case zstd:
                return true;
            default:
                return false;
            }
        }
    }
}
