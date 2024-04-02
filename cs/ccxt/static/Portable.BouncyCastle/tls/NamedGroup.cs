using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 7919</summary>
    public abstract class NamedGroup
    {
        /*
         * RFC 4492 5.1.1
         * <p>
         * The named curves defined here are those specified in SEC 2 [13]. Note that many of these curves
         * are also recommended in ANSI X9.62 [7] and FIPS 186-2 [11]. Values 0xFE00 through 0xFEFF are
         * reserved for private use. Values 0xFF01 and 0xFF02 indicate that the client supports arbitrary
         * prime and characteristic-2 curves, respectively (the curve parameters must be encoded explicitly
         * in ECParameters).
         */
        public const int sect163k1 = 1;
        public const int sect163r1 = 2;
        public const int sect163r2 = 3;
        public const int sect193r1 = 4;
        public const int sect193r2 = 5;
        public const int sect233k1 = 6;
        public const int sect233r1 = 7;
        public const int sect239k1 = 8;
        public const int sect283k1 = 9;
        public const int sect283r1 = 10;
        public const int sect409k1 = 11;
        public const int sect409r1 = 12;
        public const int sect571k1 = 13;
        public const int sect571r1 = 14;
        public const int secp160k1 = 15;
        public const int secp160r1 = 16;
        public const int secp160r2 = 17;
        public const int secp192k1 = 18;
        public const int secp192r1 = 19;
        public const int secp224k1 = 20;
        public const int secp224r1 = 21;
        public const int secp256k1 = 22;
        public const int secp256r1 = 23;
        public const int secp384r1 = 24;
        public const int secp521r1 = 25;

        /*
         * RFC 7027
         */
        public const int brainpoolP256r1 = 26;
        public const int brainpoolP384r1 = 27;
        public const int brainpoolP512r1 = 28;

        /*
         * RFC 8422
         */
        public const int x25519 = 29;
        public const int x448 = 30;

        /*
         * RFC 8734
         */
        public const int brainpoolP256r1tls13 = 31;
        public const int brainpoolP384r1tls13 = 32;
        public const int brainpoolP512r1tls13 = 33;

        /*
         * draft-smyshlyaev-tls12-gost-suites-10
         */
        public const int GC256A = 34;
        public const int GC256B = 35;
        public const int GC256C = 36;
        public const int GC256D = 37;
        public const int GC512A = 38;
        public const int GC512B = 39;
        public const int GC512C = 40;

        /*
         * RFC 8998
         */
        public const int curveSM2 = 41;

        /*
         * RFC 7919 2. Codepoints in the "Supported Groups Registry" with a high byte of 0x01 (that is,
         * between 256 and 511, inclusive) are set aside for FFDHE groups, though only a small number of
         * them are initially defined and we do not expect many other FFDHE groups to be added to this
         * range. No codepoints outside of this range will be allocated to FFDHE groups.
         */
        public const int ffdhe2048 = 256;
        public const int ffdhe3072 = 257;
        public const int ffdhe4096 = 258;
        public const int ffdhe6144 = 259;
        public const int ffdhe8192 = 260;

        /*
         * RFC 8446 reserved ffdhe_private_use (0x01FC..0x01FF)
         */

        /*
         * RFC 4492 reserved ecdhe_private_use (0xFE00..0xFEFF)
         */

        /*
         * RFC 4492
         */
        public const int arbitrary_explicit_prime_curves = 0xFF01;
        public const int arbitrary_explicit_char2_curves = 0xFF02;

        /* Names of the actual underlying elliptic curves (not necessarily matching the NamedGroup names). */
        private static readonly string[] CurveNames = new string[]{ "sect163k1", "sect163r1", "sect163r2", "sect193r1",
            "sect193r2", "sect233k1", "sect233r1", "sect239k1", "sect283k1", "sect283r1", "sect409k1", "sect409r1",
            "sect571k1", "sect571r1", "secp160k1", "secp160r1", "secp160r2", "secp192k1", "secp192r1", "secp224k1",
            "secp224r1", "secp256k1", "secp256r1", "secp384r1", "secp521r1", "brainpoolP256r1", "brainpoolP384r1",
            "brainpoolP512r1", "X25519", "X448", "brainpoolP256r1", "brainpoolP384r1", "brainpoolP512r1",
            "Tc26-Gost-3410-12-256-paramSetA", "GostR3410-2001-CryptoPro-A", "GostR3410-2001-CryptoPro-B",
            "GostR3410-2001-CryptoPro-C", "Tc26-Gost-3410-12-512-paramSetA", "Tc26-Gost-3410-12-512-paramSetB",
            "Tc26-Gost-3410-12-512-paramSetC", "sm2p256v1" };

        private static readonly string[] FiniteFieldNames = new string[]{ "ffdhe2048", "ffdhe3072", "ffdhe4096",
            "ffdhe6144", "ffdhe8192" };

        public static bool CanBeNegotiated(int namedGroup, ProtocolVersion version)
        {
            if (TlsUtilities.IsTlsV13(version))
            {
                if ((namedGroup >= sect163k1 && namedGroup <= secp256k1)
                    || (namedGroup >= brainpoolP256r1 && namedGroup <= brainpoolP512r1)
                    || (namedGroup >= GC256A && namedGroup <= GC512C)
                    || (namedGroup >= arbitrary_explicit_prime_curves && namedGroup <= arbitrary_explicit_char2_curves))
                {
                    return false;
                }
            }
            else
            {
                if ((namedGroup >= brainpoolP256r1tls13 && namedGroup <= brainpoolP512r1tls13)
                    || (namedGroup == curveSM2))
                {
                    return false;
                }
            }

            return IsValid(namedGroup);
        }

        public static int GetCurveBits(int namedGroup)
        {
            switch (namedGroup)
            {
            case secp160k1:
            case secp160r1:
            case secp160r2:
                return 160;

            case sect163k1:
            case sect163r1:
            case sect163r2:
                return 163;

            case secp192k1:
            case secp192r1:
                return 192;

            case sect193r1:
            case sect193r2:
                return 193;

            case secp224k1:
            case secp224r1:
                return 224;

            case sect233k1:
            case sect233r1:
                return 233;

            case sect239k1:
                return 239;

            case x25519:
                return 252;

            case brainpoolP256r1:
            case brainpoolP256r1tls13:
            case curveSM2:
            case GC256A:
            case GC256B:
            case GC256C:
            case GC256D:
            case secp256k1:
            case secp256r1:
                return 256;

            case sect283k1:
            case sect283r1:
                return 283;

            case brainpoolP384r1:
            case brainpoolP384r1tls13:
            case secp384r1:
                return 384;

            case sect409k1:
            case sect409r1:
                return 409;

            case x448:
                return 446;

            case brainpoolP512r1:
            case brainpoolP512r1tls13:
            case GC512A:
            case GC512B:
            case GC512C:
                return 512;

            case secp521r1:
                return 521;

            case sect571k1:
            case sect571r1:
                return 571;

            default:
                return 0;
            }
        }

        public static string GetCurveName(int namedGroup)
        {
            if (RefersToASpecificCurve(namedGroup))
            {
                return CurveNames[namedGroup - sect163k1];
            }

            return null;
        }

        public static int GetFiniteFieldBits(int namedGroup)
        {
            switch (namedGroup)
            {
            case ffdhe2048:
                return 2048;
            case ffdhe3072:
                return 3072;
            case ffdhe4096:
                return 4096;
            case ffdhe6144:
                return 6144;
            case ffdhe8192:
                return 8192;
            default:
                return 0;
            }
        }

        public static string GetFiniteFieldName(int namedGroup)
        {
            if (RefersToASpecificFiniteField(namedGroup))
            {
                return FiniteFieldNames[namedGroup - ffdhe2048];
            }

            return null;
        }

        public static int GetMaximumChar2CurveBits()
        {
            return 571;
        }

        public static int GetMaximumCurveBits()
        {
            return 571;
        }

        public static int GetMaximumFiniteFieldBits()
        {
            return 8192;
        }

        public static int GetMaximumPrimeCurveBits()
        {
            return 521;
        }

        public static string GetName(int namedGroup)
        {
            if (IsPrivate(namedGroup))
            {
                return "PRIVATE";
            }

            switch (namedGroup)
            {
            case x25519:
                return "x25519";
            case x448:
                return "x448";
            case brainpoolP256r1tls13:
                return "brainpoolP256r1tls13";
            case brainpoolP384r1tls13:
                return "brainpoolP384r1tls13";
            case brainpoolP512r1tls13:
                return "brainpoolP512r1tls13";
            case GC256A:
                return "GC256A";
            case GC256B:
                return "GC256B";
            case GC256C:
                return "GC256C";
            case GC256D:
                return "GC256D";
            case GC512A:
                return "GC512A";
            case GC512B:
                return "GC512B";
            case GC512C:
                return "GC512C";
            case curveSM2:
                return "curveSM2";
            case arbitrary_explicit_prime_curves:
                return "arbitrary_explicit_prime_curves";
            case arbitrary_explicit_char2_curves:
                return "arbitrary_explicit_char2_curves";
            }

            string standardName = GetStandardName(namedGroup);
            if (null != standardName)
            {
                return standardName;
            }

            return "UNKNOWN";
        }

        public static string GetStandardName(int namedGroup)
        {
            string curveName = GetCurveName(namedGroup);
            if (null != curveName)
            {
                return curveName;
            }

            string finiteFieldName = GetFiniteFieldName(namedGroup);
            if (null != finiteFieldName)
            {
                return finiteFieldName;
            }

            return null;
        }

        public static string GetText(int namedGroup)
        {
            return GetName(namedGroup) + "(" + namedGroup + ")";
        }

        public static bool IsChar2Curve(int namedGroup)
        {
            return (namedGroup >= sect163k1 && namedGroup <= sect571r1)
                || (namedGroup == arbitrary_explicit_char2_curves);
        }

        public static bool IsPrimeCurve(int namedGroup)
        {
            return (namedGroup >= secp160k1 && namedGroup <= curveSM2)
                || (namedGroup == arbitrary_explicit_prime_curves);
        }

        public static bool IsPrivate(int namedGroup)
        {
            return (namedGroup >> 2) == 0x7F || (namedGroup >> 8) == 0xFE;
        }

        public static bool IsValid(int namedGroup)
        {
            return RefersToASpecificGroup(namedGroup)
                || IsPrivate(namedGroup)
                || (namedGroup >= arbitrary_explicit_prime_curves && namedGroup <= arbitrary_explicit_char2_curves);
        }

        public static bool RefersToAnECDHCurve(int namedGroup)
        {
            return RefersToASpecificCurve(namedGroup);
        }

        public static bool RefersToAnECDSACurve(int namedGroup)
        {
            /*
             * TODO[RFC 8998] Double-check whether this method is only being used to mean
             * "signature-capable" or specifically ECDSA, and consider curveSM2 behaviour
             * accordingly.
             */
            return RefersToASpecificCurve(namedGroup)
                && !RefersToAnXDHCurve(namedGroup);
        }

        public static bool RefersToAnXDHCurve(int namedGroup)
        {
            return namedGroup >= x25519 && namedGroup <= x448;
        }

        public static bool RefersToASpecificCurve(int namedGroup)
        {
            return namedGroup >= sect163k1 && namedGroup <= curveSM2;
        }

        public static bool RefersToASpecificFiniteField(int namedGroup)
        {
            return namedGroup >= ffdhe2048 && namedGroup <= ffdhe8192;
        }

        public static bool RefersToASpecificGroup(int namedGroup)
        {
            return RefersToASpecificCurve(namedGroup)
                || RefersToASpecificFiniteField(namedGroup);
        }
    }
}
