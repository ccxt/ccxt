using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 2246 A.5</summary>
    public abstract class CipherSuite
    {
        public static bool IsScsv(int cipherSuite)
        {
            switch (cipherSuite)
            {
            case TLS_EMPTY_RENEGOTIATION_INFO_SCSV:
            case TLS_FALLBACK_SCSV:
                return true;
            default:
                return false;
            }
        }

        public const int TLS_NULL_WITH_NULL_NULL = 0x0000;
        public const int TLS_RSA_WITH_NULL_MD5 = 0x0001;
        public const int TLS_RSA_WITH_NULL_SHA = 0x0002;
        public const int TLS_RSA_EXPORT_WITH_RC4_40_MD5 = 0x0003;
        public const int TLS_RSA_WITH_RC4_128_MD5 = 0x0004;
        public const int TLS_RSA_WITH_RC4_128_SHA = 0x0005;
        public const int TLS_RSA_EXPORT_WITH_RC2_CBC_40_MD5 = 0x0006;
        public const int TLS_RSA_WITH_IDEA_CBC_SHA = 0x0007;
        public const int TLS_RSA_EXPORT_WITH_DES40_CBC_SHA = 0x0008;
        public const int TLS_RSA_WITH_DES_CBC_SHA = 0x0009;
        public const int TLS_RSA_WITH_3DES_EDE_CBC_SHA = 0x000A;
        public const int TLS_DH_DSS_EXPORT_WITH_DES40_CBC_SHA = 0x000B;
        public const int TLS_DH_DSS_WITH_DES_CBC_SHA = 0x000C;
        public const int TLS_DH_DSS_WITH_3DES_EDE_CBC_SHA = 0x000D;
        public const int TLS_DH_RSA_EXPORT_WITH_DES40_CBC_SHA = 0x000E;
        public const int TLS_DH_RSA_WITH_DES_CBC_SHA = 0x000F;
        public const int TLS_DH_RSA_WITH_3DES_EDE_CBC_SHA = 0x0010;
        public const int TLS_DHE_DSS_EXPORT_WITH_DES40_CBC_SHA = 0x0011;
        public const int TLS_DHE_DSS_WITH_DES_CBC_SHA = 0x0012;
        public const int TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA = 0x0013;
        public const int TLS_DHE_RSA_EXPORT_WITH_DES40_CBC_SHA = 0x0014;
        public const int TLS_DHE_RSA_WITH_DES_CBC_SHA = 0x0015;
        public const int TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA = 0x0016;
        public const int TLS_DH_anon_EXPORT_WITH_RC4_40_MD5 = 0x0017;
        public const int TLS_DH_anon_WITH_RC4_128_MD5 = 0x0018;
        public const int TLS_DH_anon_EXPORT_WITH_DES40_CBC_SHA = 0x0019;
        public const int TLS_DH_anon_WITH_DES_CBC_SHA = 0x001A;
        public const int TLS_DH_anon_WITH_3DES_EDE_CBC_SHA = 0x001B;

        /*
         * Note: The cipher suite values { 0x00, 0x1C } and { 0x00, 0x1D } are reserved to avoid
         * collision with Fortezza-based cipher suites in SSL 3.
         */

        /*
         * RFC 3268
         */
        public const int TLS_RSA_WITH_AES_128_CBC_SHA = 0x002F;
        public const int TLS_DH_DSS_WITH_AES_128_CBC_SHA = 0x0030;
        public const int TLS_DH_RSA_WITH_AES_128_CBC_SHA = 0x0031;
        public const int TLS_DHE_DSS_WITH_AES_128_CBC_SHA = 0x0032;
        public const int TLS_DHE_RSA_WITH_AES_128_CBC_SHA = 0x0033;
        public const int TLS_DH_anon_WITH_AES_128_CBC_SHA = 0x0034;
        public const int TLS_RSA_WITH_AES_256_CBC_SHA = 0x0035;
        public const int TLS_DH_DSS_WITH_AES_256_CBC_SHA = 0x0036;
        public const int TLS_DH_RSA_WITH_AES_256_CBC_SHA = 0x0037;
        public const int TLS_DHE_DSS_WITH_AES_256_CBC_SHA = 0x0038;
        public const int TLS_DHE_RSA_WITH_AES_256_CBC_SHA = 0x0039;
        public const int TLS_DH_anon_WITH_AES_256_CBC_SHA = 0x003A;

        /*
         * RFC 5932
         */
        public const int TLS_RSA_WITH_CAMELLIA_128_CBC_SHA = 0x0041;
        public const int TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA = 0x0042;
        public const int TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA = 0x0043;
        public const int TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA = 0x0044;
        public const int TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA = 0x0045;
        public const int TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA = 0x0046;

        public const int TLS_RSA_WITH_CAMELLIA_256_CBC_SHA = 0x0084;
        public const int TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA = 0x0085;
        public const int TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA = 0x0086;
        public const int TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA = 0x0087;
        public const int TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA = 0x0088;
        public const int TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA = 0x0089;

        public const int TLS_RSA_WITH_CAMELLIA_128_CBC_SHA256 = 0x00BA;
        public const int TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA256 = 0x00BB;
        public const int TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA256 = 0x00BC;
        public const int TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA256 = 0x00BD;
        public const int TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA256 = 0x00BE;
        public const int TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA256 = 0x00BF;

        public const int TLS_RSA_WITH_CAMELLIA_256_CBC_SHA256 = 0x00C0;
        public const int TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA256 = 0x00C1;
        public const int TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA256 = 0x00C2;
        public const int TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA256 = 0x00C3;
        public const int TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA256 = 0x00C4;
        public const int TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA256 = 0x00C5;

        /*
         * RFC 4162
         */
        public const int TLS_RSA_WITH_SEED_CBC_SHA = 0x0096;
        public const int TLS_DH_DSS_WITH_SEED_CBC_SHA = 0x0097;
        public const int TLS_DH_RSA_WITH_SEED_CBC_SHA = 0x0098;
        public const int TLS_DHE_DSS_WITH_SEED_CBC_SHA = 0x0099;
        public const int TLS_DHE_RSA_WITH_SEED_CBC_SHA = 0x009A;
        public const int TLS_DH_anon_WITH_SEED_CBC_SHA = 0x009B;

        /*
         * RFC 4279
         */
        public const int TLS_PSK_WITH_RC4_128_SHA = 0x008A;
        public const int TLS_PSK_WITH_3DES_EDE_CBC_SHA = 0x008B;
        public const int TLS_PSK_WITH_AES_128_CBC_SHA = 0x008C;
        public const int TLS_PSK_WITH_AES_256_CBC_SHA = 0x008D;
        public const int TLS_DHE_PSK_WITH_RC4_128_SHA = 0x008E;
        public const int TLS_DHE_PSK_WITH_3DES_EDE_CBC_SHA = 0x008F;
        public const int TLS_DHE_PSK_WITH_AES_128_CBC_SHA = 0x0090;
        public const int TLS_DHE_PSK_WITH_AES_256_CBC_SHA = 0x0091;
        public const int TLS_RSA_PSK_WITH_RC4_128_SHA = 0x0092;
        public const int TLS_RSA_PSK_WITH_3DES_EDE_CBC_SHA = 0x0093;
        public const int TLS_RSA_PSK_WITH_AES_128_CBC_SHA = 0x0094;
        public const int TLS_RSA_PSK_WITH_AES_256_CBC_SHA = 0x0095;

        /*
         * RFC 4492
         */
        public const int TLS_ECDH_ECDSA_WITH_NULL_SHA = 0xC001;
        public const int TLS_ECDH_ECDSA_WITH_RC4_128_SHA = 0xC002;
        public const int TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA = 0xC003;
        public const int TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA = 0xC004;
        public const int TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA = 0xC005;
        public const int TLS_ECDHE_ECDSA_WITH_NULL_SHA = 0xC006;
        public const int TLS_ECDHE_ECDSA_WITH_RC4_128_SHA = 0xC007;
        public const int TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA = 0xC008;
        public const int TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA = 0xC009;
        public const int TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA = 0xC00A;
        public const int TLS_ECDH_RSA_WITH_NULL_SHA = 0xC00B;
        public const int TLS_ECDH_RSA_WITH_RC4_128_SHA = 0xC00C;
        public const int TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA = 0xC00D;
        public const int TLS_ECDH_RSA_WITH_AES_128_CBC_SHA = 0xC00E;
        public const int TLS_ECDH_RSA_WITH_AES_256_CBC_SHA = 0xC00F;
        public const int TLS_ECDHE_RSA_WITH_NULL_SHA = 0xC010;
        public const int TLS_ECDHE_RSA_WITH_RC4_128_SHA = 0xC011;
        public const int TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA = 0xC012;
        public const int TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA = 0xC013;
        public const int TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA = 0xC014;
        public const int TLS_ECDH_anon_WITH_NULL_SHA = 0xC015;
        public const int TLS_ECDH_anon_WITH_RC4_128_SHA = 0xC016;
        public const int TLS_ECDH_anon_WITH_3DES_EDE_CBC_SHA = 0xC017;
        public const int TLS_ECDH_anon_WITH_AES_128_CBC_SHA = 0xC018;
        public const int TLS_ECDH_anon_WITH_AES_256_CBC_SHA = 0xC019;

        /*
         * RFC 4785
         */
        public const int TLS_PSK_WITH_NULL_SHA = 0x002C;
        public const int TLS_DHE_PSK_WITH_NULL_SHA = 0x002D;
        public const int TLS_RSA_PSK_WITH_NULL_SHA = 0x002E;

        /*
         * RFC 5054
         */
        public const int TLS_SRP_SHA_WITH_3DES_EDE_CBC_SHA = 0xC01A;
        public const int TLS_SRP_SHA_RSA_WITH_3DES_EDE_CBC_SHA = 0xC01B;
        public const int TLS_SRP_SHA_DSS_WITH_3DES_EDE_CBC_SHA = 0xC01C;
        public const int TLS_SRP_SHA_WITH_AES_128_CBC_SHA = 0xC01D;
        public const int TLS_SRP_SHA_RSA_WITH_AES_128_CBC_SHA = 0xC01E;
        public const int TLS_SRP_SHA_DSS_WITH_AES_128_CBC_SHA = 0xC01F;
        public const int TLS_SRP_SHA_WITH_AES_256_CBC_SHA = 0xC020;
        public const int TLS_SRP_SHA_RSA_WITH_AES_256_CBC_SHA = 0xC021;
        public const int TLS_SRP_SHA_DSS_WITH_AES_256_CBC_SHA = 0xC022;

        /*
         * RFC 5246
         */
        public const int TLS_RSA_WITH_NULL_SHA256 = 0x003B;
        public const int TLS_RSA_WITH_AES_128_CBC_SHA256 = 0x003C;
        public const int TLS_RSA_WITH_AES_256_CBC_SHA256 = 0x003D;
        public const int TLS_DH_DSS_WITH_AES_128_CBC_SHA256 = 0x003E;
        public const int TLS_DH_RSA_WITH_AES_128_CBC_SHA256 = 0x003F;
        public const int TLS_DHE_DSS_WITH_AES_128_CBC_SHA256 = 0x0040;
        public const int TLS_DHE_RSA_WITH_AES_128_CBC_SHA256 = 0x0067;
        public const int TLS_DH_DSS_WITH_AES_256_CBC_SHA256 = 0x0068;
        public const int TLS_DH_RSA_WITH_AES_256_CBC_SHA256 = 0x0069;
        public const int TLS_DHE_DSS_WITH_AES_256_CBC_SHA256 = 0x006A;
        public const int TLS_DHE_RSA_WITH_AES_256_CBC_SHA256 = 0x006B;
        public const int TLS_DH_anon_WITH_AES_128_CBC_SHA256 = 0x006C;
        public const int TLS_DH_anon_WITH_AES_256_CBC_SHA256 = 0x006D;

        /*
         * RFC 5288
         */
        public const int TLS_RSA_WITH_AES_128_GCM_SHA256 = 0x009C;
        public const int TLS_RSA_WITH_AES_256_GCM_SHA384 = 0x009D;
        public const int TLS_DHE_RSA_WITH_AES_128_GCM_SHA256 = 0x009E;
        public const int TLS_DHE_RSA_WITH_AES_256_GCM_SHA384 = 0x009F;
        public const int TLS_DH_RSA_WITH_AES_128_GCM_SHA256 = 0x00A0;
        public const int TLS_DH_RSA_WITH_AES_256_GCM_SHA384 = 0x00A1;
        public const int TLS_DHE_DSS_WITH_AES_128_GCM_SHA256 = 0x00A2;
        public const int TLS_DHE_DSS_WITH_AES_256_GCM_SHA384 = 0x00A3;
        public const int TLS_DH_DSS_WITH_AES_128_GCM_SHA256 = 0x00A4;
        public const int TLS_DH_DSS_WITH_AES_256_GCM_SHA384 = 0x00A5;
        public const int TLS_DH_anon_WITH_AES_128_GCM_SHA256 = 0x00A6;
        public const int TLS_DH_anon_WITH_AES_256_GCM_SHA384 = 0x00A7;

        /*
         * RFC 5289
         */
        public const int TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256 = 0xC023;
        public const int TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384 = 0xC024;
        public const int TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256 = 0xC025;
        public const int TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384 = 0xC026;
        public const int TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256 = 0xC027;
        public const int TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384 = 0xC028;
        public const int TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256 = 0xC029;
        public const int TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384 = 0xC02A;
        public const int TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 = 0xC02B;
        public const int TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 = 0xC02C;
        public const int TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256 = 0xC02D;
        public const int TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384 = 0xC02E;
        public const int TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 = 0xC02F;
        public const int TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 = 0xC030;
        public const int TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256 = 0xC031;
        public const int TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384 = 0xC032;

        /*
         * RFC 5487
         */
        public const int TLS_PSK_WITH_AES_128_GCM_SHA256 = 0x00A8;
        public const int TLS_PSK_WITH_AES_256_GCM_SHA384 = 0x00A9;
        public const int TLS_DHE_PSK_WITH_AES_128_GCM_SHA256 = 0x00AA;
        public const int TLS_DHE_PSK_WITH_AES_256_GCM_SHA384 = 0x00AB;
        public const int TLS_RSA_PSK_WITH_AES_128_GCM_SHA256 = 0x00AC;
        public const int TLS_RSA_PSK_WITH_AES_256_GCM_SHA384 = 0x00AD;
        public const int TLS_PSK_WITH_AES_128_CBC_SHA256 = 0x00AE;
        public const int TLS_PSK_WITH_AES_256_CBC_SHA384 = 0x00AF;
        public const int TLS_PSK_WITH_NULL_SHA256 = 0x00B0;
        public const int TLS_PSK_WITH_NULL_SHA384 = 0x00B1;
        public const int TLS_DHE_PSK_WITH_AES_128_CBC_SHA256 = 0x00B2;
        public const int TLS_DHE_PSK_WITH_AES_256_CBC_SHA384 = 0x00B3;
        public const int TLS_DHE_PSK_WITH_NULL_SHA256 = 0x00B4;
        public const int TLS_DHE_PSK_WITH_NULL_SHA384 = 0x00B5;
        public const int TLS_RSA_PSK_WITH_AES_128_CBC_SHA256 = 0x00B6;
        public const int TLS_RSA_PSK_WITH_AES_256_CBC_SHA384 = 0x00B7;
        public const int TLS_RSA_PSK_WITH_NULL_SHA256 = 0x00B8;
        public const int TLS_RSA_PSK_WITH_NULL_SHA384 = 0x00B9;

        /*
         * RFC 5489
         */
        public const int TLS_ECDHE_PSK_WITH_RC4_128_SHA = 0xC033;
        public const int TLS_ECDHE_PSK_WITH_3DES_EDE_CBC_SHA = 0xC034;
        public const int TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA = 0xC035;
        public const int TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA = 0xC036;
        public const int TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA256 = 0xC037;
        public const int TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA384 = 0xC038;
        public const int TLS_ECDHE_PSK_WITH_NULL_SHA = 0xC039;
        public const int TLS_ECDHE_PSK_WITH_NULL_SHA256 = 0xC03A;
        public const int TLS_ECDHE_PSK_WITH_NULL_SHA384 = 0xC03B;

        /*
         * RFC 5746
         */
        public const int TLS_EMPTY_RENEGOTIATION_INFO_SCSV = 0x00FF;

        /*
         * RFC 6209
         */
        public const int TLS_RSA_WITH_ARIA_128_CBC_SHA256 = 0xC03C;
        public const int TLS_RSA_WITH_ARIA_256_CBC_SHA384 = 0xC03D;
        public const int TLS_DH_DSS_WITH_ARIA_128_CBC_SHA256 = 0xC03E;
        public const int TLS_DH_DSS_WITH_ARIA_256_CBC_SHA384 = 0xC03F;
        public const int TLS_DH_RSA_WITH_ARIA_128_CBC_SHA256 = 0xC040;
        public const int TLS_DH_RSA_WITH_ARIA_256_CBC_SHA384 = 0xC041;
        public const int TLS_DHE_DSS_WITH_ARIA_128_CBC_SHA256 = 0xC042;
        public const int TLS_DHE_DSS_WITH_ARIA_256_CBC_SHA384 = 0xC043;
        public const int TLS_DHE_RSA_WITH_ARIA_128_CBC_SHA256 = 0xC044;
        public const int TLS_DHE_RSA_WITH_ARIA_256_CBC_SHA384 = 0xC045;
        public const int TLS_DH_anon_WITH_ARIA_128_CBC_SHA256 = 0xC046;
        public const int TLS_DH_anon_WITH_ARIA_256_CBC_SHA384 = 0xC047;

        public const int TLS_ECDHE_ECDSA_WITH_ARIA_128_CBC_SHA256 = 0xC048;
        public const int TLS_ECDHE_ECDSA_WITH_ARIA_256_CBC_SHA384 = 0xC049;
        public const int TLS_ECDH_ECDSA_WITH_ARIA_128_CBC_SHA256 = 0xC04A;
        public const int TLS_ECDH_ECDSA_WITH_ARIA_256_CBC_SHA384 = 0xC04B;
        public const int TLS_ECDHE_RSA_WITH_ARIA_128_CBC_SHA256 = 0xC04C;
        public const int TLS_ECDHE_RSA_WITH_ARIA_256_CBC_SHA384 = 0xC04D;
        public const int TLS_ECDH_RSA_WITH_ARIA_128_CBC_SHA256 = 0xC04E;
        public const int TLS_ECDH_RSA_WITH_ARIA_256_CBC_SHA384 = 0xC04F;

        public const int TLS_RSA_WITH_ARIA_128_GCM_SHA256 = 0xC050;
        public const int TLS_RSA_WITH_ARIA_256_GCM_SHA384 = 0xC051;
        public const int TLS_DHE_RSA_WITH_ARIA_128_GCM_SHA256 = 0xC052;
        public const int TLS_DHE_RSA_WITH_ARIA_256_GCM_SHA384 = 0xC053;
        public const int TLS_DH_RSA_WITH_ARIA_128_GCM_SHA256 = 0xC054;
        public const int TLS_DH_RSA_WITH_ARIA_256_GCM_SHA384 = 0xC055;
        public const int TLS_DHE_DSS_WITH_ARIA_128_GCM_SHA256 = 0xC056;
        public const int TLS_DHE_DSS_WITH_ARIA_256_GCM_SHA384 = 0xC057;
        public const int TLS_DH_DSS_WITH_ARIA_128_GCM_SHA256 = 0xC058;
        public const int TLS_DH_DSS_WITH_ARIA_256_GCM_SHA384 = 0xC059;
        public const int TLS_DH_anon_WITH_ARIA_128_GCM_SHA256 = 0xC05A;
        public const int TLS_DH_anon_WITH_ARIA_256_GCM_SHA384 = 0xC05B;

        public const int TLS_ECDHE_ECDSA_WITH_ARIA_128_GCM_SHA256 = 0xC05C;
        public const int TLS_ECDHE_ECDSA_WITH_ARIA_256_GCM_SHA384 = 0xC05D;
        public const int TLS_ECDH_ECDSA_WITH_ARIA_128_GCM_SHA256 = 0xC05E;
        public const int TLS_ECDH_ECDSA_WITH_ARIA_256_GCM_SHA384 = 0xC05F;
        public const int TLS_ECDHE_RSA_WITH_ARIA_128_GCM_SHA256 = 0xC060;
        public const int TLS_ECDHE_RSA_WITH_ARIA_256_GCM_SHA384 = 0xC061;
        public const int TLS_ECDH_RSA_WITH_ARIA_128_GCM_SHA256 = 0xC062;
        public const int TLS_ECDH_RSA_WITH_ARIA_256_GCM_SHA384 = 0xC063;

        public const int TLS_PSK_WITH_ARIA_128_CBC_SHA256 = 0xC064;
        public const int TLS_PSK_WITH_ARIA_256_CBC_SHA384 = 0xC065;
        public const int TLS_DHE_PSK_WITH_ARIA_128_CBC_SHA256 = 0xC066;
        public const int TLS_DHE_PSK_WITH_ARIA_256_CBC_SHA384 = 0xC067;
        public const int TLS_RSA_PSK_WITH_ARIA_128_CBC_SHA256 = 0xC068;
        public const int TLS_RSA_PSK_WITH_ARIA_256_CBC_SHA384 = 0xC069;
        public const int TLS_PSK_WITH_ARIA_128_GCM_SHA256 = 0xC06A;
        public const int TLS_PSK_WITH_ARIA_256_GCM_SHA384 = 0xC06B;
        public const int TLS_DHE_PSK_WITH_ARIA_128_GCM_SHA256 = 0xC06C;
        public const int TLS_DHE_PSK_WITH_ARIA_256_GCM_SHA384 = 0xC06D;
        public const int TLS_RSA_PSK_WITH_ARIA_128_GCM_SHA256 = 0xC06E;
        public const int TLS_RSA_PSK_WITH_ARIA_256_GCM_SHA384 = 0xC06F;
        public const int TLS_ECDHE_PSK_WITH_ARIA_128_CBC_SHA256 = 0xC070;
        public const int TLS_ECDHE_PSK_WITH_ARIA_256_CBC_SHA384 = 0xC071;

        /*
         * RFC 6367
         */
        public const int TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_CBC_SHA256 = 0xC072;
        public const int TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_CBC_SHA384 = 0xC073;
        public const int TLS_ECDH_ECDSA_WITH_CAMELLIA_128_CBC_SHA256 = 0xC074;
        public const int TLS_ECDH_ECDSA_WITH_CAMELLIA_256_CBC_SHA384 = 0xC075;
        public const int TLS_ECDHE_RSA_WITH_CAMELLIA_128_CBC_SHA256 = 0xC076;
        public const int TLS_ECDHE_RSA_WITH_CAMELLIA_256_CBC_SHA384 = 0xC077;
        public const int TLS_ECDH_RSA_WITH_CAMELLIA_128_CBC_SHA256 = 0xC078;
        public const int TLS_ECDH_RSA_WITH_CAMELLIA_256_CBC_SHA384 = 0xC079;

        public const int TLS_RSA_WITH_CAMELLIA_128_GCM_SHA256 = 0xC07A;
        public const int TLS_RSA_WITH_CAMELLIA_256_GCM_SHA384 = 0xC07B;
        public const int TLS_DHE_RSA_WITH_CAMELLIA_128_GCM_SHA256 = 0xC07C;
        public const int TLS_DHE_RSA_WITH_CAMELLIA_256_GCM_SHA384 = 0xC07D;
        public const int TLS_DH_RSA_WITH_CAMELLIA_128_GCM_SHA256 = 0xC07E;
        public const int TLS_DH_RSA_WITH_CAMELLIA_256_GCM_SHA384 = 0xC07F;
        public const int TLS_DHE_DSS_WITH_CAMELLIA_128_GCM_SHA256 = 0xC080;
        public const int TLS_DHE_DSS_WITH_CAMELLIA_256_GCM_SHA384 = 0xC081;
        public const int TLS_DH_DSS_WITH_CAMELLIA_128_GCM_SHA256 = 0xC082;
        public const int TLS_DH_DSS_WITH_CAMELLIA_256_GCM_SHA384 = 0xC083;
        public const int TLS_DH_anon_WITH_CAMELLIA_128_GCM_SHA256 = 0xC084;
        public const int TLS_DH_anon_WITH_CAMELLIA_256_GCM_SHA384 = 0xC085;
        public const int TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_GCM_SHA256 = 0xC086;
        public const int TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_GCM_SHA384 = 0xC087;
        public const int TLS_ECDH_ECDSA_WITH_CAMELLIA_128_GCM_SHA256 = 0xC088;
        public const int TLS_ECDH_ECDSA_WITH_CAMELLIA_256_GCM_SHA384 = 0xC089;
        public const int TLS_ECDHE_RSA_WITH_CAMELLIA_128_GCM_SHA256 = 0xC08A;
        public const int TLS_ECDHE_RSA_WITH_CAMELLIA_256_GCM_SHA384 = 0xC08B;
        public const int TLS_ECDH_RSA_WITH_CAMELLIA_128_GCM_SHA256 = 0xC08C;
        public const int TLS_ECDH_RSA_WITH_CAMELLIA_256_GCM_SHA384 = 0xC08D;

        public const int TLS_PSK_WITH_CAMELLIA_128_GCM_SHA256 = 0xC08E;
        public const int TLS_PSK_WITH_CAMELLIA_256_GCM_SHA384 = 0xC08F;
        public const int TLS_DHE_PSK_WITH_CAMELLIA_128_GCM_SHA256 = 0xC090;
        public const int TLS_DHE_PSK_WITH_CAMELLIA_256_GCM_SHA384 = 0xC091;
        public const int TLS_RSA_PSK_WITH_CAMELLIA_128_GCM_SHA256 = 0xC092;
        public const int TLS_RSA_PSK_WITH_CAMELLIA_256_GCM_SHA384 = 0xC093;
        public const int TLS_PSK_WITH_CAMELLIA_128_CBC_SHA256 = 0xC094;
        public const int TLS_PSK_WITH_CAMELLIA_256_CBC_SHA384 = 0xC095;
        public const int TLS_DHE_PSK_WITH_CAMELLIA_128_CBC_SHA256 = 0xC096;
        public const int TLS_DHE_PSK_WITH_CAMELLIA_256_CBC_SHA384 = 0xC097;
        public const int TLS_RSA_PSK_WITH_CAMELLIA_128_CBC_SHA256 = 0xC098;
        public const int TLS_RSA_PSK_WITH_CAMELLIA_256_CBC_SHA384 = 0xC099;
        public const int TLS_ECDHE_PSK_WITH_CAMELLIA_128_CBC_SHA256 = 0xC09A;
        public const int TLS_ECDHE_PSK_WITH_CAMELLIA_256_CBC_SHA384 = 0xC09B;

        /*
         * RFC 6655
         */
        public const int TLS_RSA_WITH_AES_128_CCM = 0xC09C;
        public const int TLS_RSA_WITH_AES_256_CCM = 0xC09D;
        public const int TLS_DHE_RSA_WITH_AES_128_CCM = 0xC09E;
        public const int TLS_DHE_RSA_WITH_AES_256_CCM = 0xC09F;
        public const int TLS_RSA_WITH_AES_128_CCM_8 = 0xC0A0;
        public const int TLS_RSA_WITH_AES_256_CCM_8 = 0xC0A1;
        public const int TLS_DHE_RSA_WITH_AES_128_CCM_8 = 0xC0A2;
        public const int TLS_DHE_RSA_WITH_AES_256_CCM_8 = 0xC0A3;
        public const int TLS_PSK_WITH_AES_128_CCM = 0xC0A4;
        public const int TLS_PSK_WITH_AES_256_CCM = 0xC0A5;
        public const int TLS_DHE_PSK_WITH_AES_128_CCM = 0xC0A6;
        public const int TLS_DHE_PSK_WITH_AES_256_CCM = 0xC0A7;
        public const int TLS_PSK_WITH_AES_128_CCM_8 = 0xC0A8;
        public const int TLS_PSK_WITH_AES_256_CCM_8 = 0xC0A9;
        public const int TLS_PSK_DHE_WITH_AES_128_CCM_8 = 0xC0AA;
        public const int TLS_PSK_DHE_WITH_AES_256_CCM_8 = 0xC0AB;

        /*
         * RFC 7251
         */
        public const int TLS_ECDHE_ECDSA_WITH_AES_128_CCM = 0xC0AC;
        public const int TLS_ECDHE_ECDSA_WITH_AES_256_CCM = 0xC0AD;
        public const int TLS_ECDHE_ECDSA_WITH_AES_128_CCM_8 = 0xC0AE;
        public const int TLS_ECDHE_ECDSA_WITH_AES_256_CCM_8 = 0xC0AF;

        /*
         * RFC 7507
         */
        public const int TLS_FALLBACK_SCSV = 0x5600;

        /*
         * RFC 7905
         */
        public const int TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 = 0xCCA8;
        public const int TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 = 0xCCA9;
        public const int TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256 = 0xCCAA;
        public const int TLS_PSK_WITH_CHACHA20_POLY1305_SHA256 = 0xCCAB;
        public const int TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256 = 0xCCAC;
        public const int TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256 = 0xCCAD;
        public const int TLS_RSA_PSK_WITH_CHACHA20_POLY1305_SHA256 = 0xCCAE;

        /*
         * RFC 8442
         */
        public const int TLS_ECDHE_PSK_WITH_AES_128_GCM_SHA256 = 0xD001;
        public const int TLS_ECDHE_PSK_WITH_AES_256_GCM_SHA384 = 0xD002;
        public const int TLS_ECDHE_PSK_WITH_AES_128_CCM_8_SHA256 = 0xD003;
        public const int TLS_ECDHE_PSK_WITH_AES_128_CCM_SHA256 = 0xD005;

        /*
         * TLS 1.3 Section
         * 
         * Although TLS 1.3 uses the same cipher suite space as previous versions of TLS, TLS 1.3 cipher
         * suites are defined differently, only specifying the symmetric ciphers, and cannot be used for
         * TLS 1.2. Similarly, cipher suites for TLS 1.2 and lower cannot be used with TLS 1.3.
         */

        /*
         * RFC 8446
         */
        public const int TLS_AES_128_GCM_SHA256 = 0x1301;
        public const int TLS_AES_256_GCM_SHA384 = 0x1302;
        public const int TLS_CHACHA20_POLY1305_SHA256 = 0x1303;
        public const int TLS_AES_128_CCM_SHA256 = 0x1304;
        public const int TLS_AES_128_CCM_8_SHA256 = 0x1305;

        /*
         * RFC 8998
         */
        public const int TLS_SM4_GCM_SM3 = 0x00C6;
        public const int TLS_SM4_CCM_SM3 = 0x00C7;

        /*
         * draft-smyshlyaev-tls12-gost-suites-10
         */
        public const int TLS_GOSTR341112_256_WITH_KUZNYECHIK_CTR_OMAC = 0xC100;
        public const int TLS_GOSTR341112_256_WITH_MAGMA_CTR_OMAC = 0xC101;
        public const int TLS_GOSTR341112_256_WITH_28147_CNT_IMIT = 0xC102;
    }
}
