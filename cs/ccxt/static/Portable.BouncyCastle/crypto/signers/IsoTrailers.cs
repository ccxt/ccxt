using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Crypto.Signers
{
    public class IsoTrailers
    {
        public const int TRAILER_IMPLICIT    = 0xBC;
        public const int TRAILER_RIPEMD160   = 0x31CC;
        public const int TRAILER_RIPEMD128   = 0x32CC;
        public const int TRAILER_SHA1        = 0x33CC;
        public const int TRAILER_SHA256      = 0x34CC;
        public const int TRAILER_SHA512      = 0x35CC;
        public const int TRAILER_SHA384      = 0x36CC;
        public const int TRAILER_WHIRLPOOL   = 0x37CC;
        public const int TRAILER_SHA224      = 0x38CC;
        public const int TRAILER_SHA512_224  = 0x39CC;
        public const int TRAILER_SHA512_256  = 0x40CC;

        private static IDictionary<string, int> CreateTrailerMap()
        {
            var trailers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            trailers.Add("RIPEMD128", TRAILER_RIPEMD128);
            trailers.Add("RIPEMD160", TRAILER_RIPEMD160);

            trailers.Add("SHA-1", TRAILER_SHA1);
            trailers.Add("SHA-224", TRAILER_SHA224);
            trailers.Add("SHA-256", TRAILER_SHA256);
            trailers.Add("SHA-384", TRAILER_SHA384);
            trailers.Add("SHA-512", TRAILER_SHA512);
            trailers.Add("SHA-512/224", TRAILER_SHA512_224);
            trailers.Add("SHA-512/256", TRAILER_SHA512_256);

            trailers.Add("Whirlpool", TRAILER_WHIRLPOOL);

            return trailers;
        }

        // IDictionary is (string -> Int32)
        private static readonly IDictionary<string, int> TrailerMap = CreateTrailerMap();

        public static int GetTrailer(IDigest digest)
        {
            return TrailerMap[digest.AlgorithmName];
        }

        public static bool NoTrailerAvailable(IDigest digest)
        {
            return !TrailerMap.ContainsKey(digest.AlgorithmName);
        }
    }
}
