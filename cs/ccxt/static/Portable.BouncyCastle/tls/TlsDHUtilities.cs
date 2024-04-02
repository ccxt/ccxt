using System;
using System.IO;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public abstract class TlsDHUtilities
    {
        public static TlsDHConfig CreateNamedDHConfig(TlsContext context, int namedGroup)
        {
            if (namedGroup < 0 || NamedGroup.GetFiniteFieldBits(namedGroup) < 1)
                return null;

            bool padded = TlsUtilities.IsTlsV13(context);
            return new TlsDHConfig(namedGroup, padded);
        }

        public static DHGroup GetDHGroup(TlsDHConfig dhConfig)
        {
            int namedGroup = dhConfig.NamedGroup;
            if (namedGroup >= 0)
                return GetNamedDHGroup(namedGroup);

            return dhConfig.ExplicitGroup;
        }

        public static DHGroup GetNamedDHGroup(int namedGroup)
        {
            switch (namedGroup)
            {
            case NamedGroup.ffdhe2048:
                return DHStandardGroups.rfc7919_ffdhe2048;
            case NamedGroup.ffdhe3072:
                return DHStandardGroups.rfc7919_ffdhe3072;
            case NamedGroup.ffdhe4096:
                return DHStandardGroups.rfc7919_ffdhe4096;
            case NamedGroup.ffdhe6144:
                return DHStandardGroups.rfc7919_ffdhe6144;
            case NamedGroup.ffdhe8192:
                return DHStandardGroups.rfc7919_ffdhe8192;
            default:
                return null;
            }
        }

        public static int GetMinimumFiniteFieldBits(int cipherSuite)
        {
            /*
             * NOTE: An equivalent mechanism was added to support a minimum bit-size requirement for ECC
             * mooted in early drafts of RFC 8442. This requirement was removed in later drafts, so that
             * mechanism is currently somewhat trivial, and this similarly so.
             */
            return IsDHCipherSuite(cipherSuite) ? 1 : 0;
        }

        public static bool IsDHCipherSuite(int cipherSuite)
        {
            switch (TlsUtilities.GetKeyExchangeAlgorithm(cipherSuite))
            {
            case KeyExchangeAlgorithm.DH_anon:
            case KeyExchangeAlgorithm.DH_DSS:
            case KeyExchangeAlgorithm.DH_RSA:
            case KeyExchangeAlgorithm.DHE_DSS:
            case KeyExchangeAlgorithm.DHE_PSK:
            case KeyExchangeAlgorithm.DHE_RSA:
                return true;

            default:
                return false;
            }
        }

        public static int GetNamedGroupForDHParameters(BigInteger p, BigInteger g)
        {
            int[] namedGroups = new int[]{ NamedGroup.ffdhe2048, NamedGroup.ffdhe3072, NamedGroup.ffdhe4096,
                NamedGroup.ffdhe6144, NamedGroup.ffdhe8192 };

            for (int i = 0; i < namedGroups.Length; ++i)
            {
                int namedGroup = namedGroups[i];
                DHGroup dhGroup = GetNamedDHGroup(namedGroup);
                if (dhGroup != null && dhGroup.P.Equals(p) && dhGroup.G.Equals(g))
                    return namedGroup;
            }

            return -1;
        }

        public static DHGroup GetStandardGroupForDHParameters(BigInteger p, BigInteger g)
        {
            DHGroup[] standardGroups = new DHGroup[] { DHStandardGroups.rfc7919_ffdhe2048,
                DHStandardGroups.rfc7919_ffdhe3072, DHStandardGroups.rfc7919_ffdhe4096, DHStandardGroups.rfc7919_ffdhe6144,
                DHStandardGroups.rfc7919_ffdhe8192, DHStandardGroups.rfc3526_1536, DHStandardGroups.rfc3526_2048,
                DHStandardGroups.rfc3526_3072, DHStandardGroups.rfc3526_4096, DHStandardGroups.rfc3526_6144,
                DHStandardGroups.rfc3526_8192, DHStandardGroups.rfc5996_768, DHStandardGroups.rfc5996_1024 };

            for (int i = 0; i < standardGroups.Length; ++i)
            {
                DHGroup dhGroup = standardGroups[i];
                if (dhGroup != null && dhGroup.P.Equals(p) && dhGroup.G.Equals(g))
                    return dhGroup;
            }

            return null;
        }

        /// <exception cref="IOException"/>
        public static TlsDHConfig ReceiveDHConfig(TlsContext context, TlsDHGroupVerifier dhGroupVerifier,
            Stream input)
        {
            BigInteger p = ReadDHParameter(input);
            BigInteger g = ReadDHParameter(input);

            int namedGroup = GetNamedGroupForDHParameters(p, g);
            if (namedGroup< 0)
            {
                DHGroup dhGroup = GetStandardGroupForDHParameters(p, g);
                if (null == dhGroup)
                {
                    dhGroup = new DHGroup(p, null, g, 0);
                }

                if (!dhGroupVerifier.Accept(dhGroup))
                    throw new TlsFatalAlert(AlertDescription.insufficient_security);

                return new TlsDHConfig(dhGroup);
            }

            int[] clientSupportedGroups = context.SecurityParameters.ClientSupportedGroups;
            if (null == clientSupportedGroups || Arrays.Contains(clientSupportedGroups, namedGroup))
                return new TlsDHConfig(namedGroup, false);

            throw new TlsFatalAlert(AlertDescription.illegal_parameter);
        }

        /// <exception cref="IOException"/>
        public static BigInteger ReadDHParameter(Stream input)
        {
            return new BigInteger(1, TlsUtilities.ReadOpaque16(input, 1));
        }

        /// <exception cref="IOException"/>
        public static void WriteDHConfig(TlsDHConfig dhConfig, Stream output)
        {
            DHGroup group = GetDHGroup(dhConfig);
            WriteDHParameter(group.P, output);
            WriteDHParameter(group.G, output);
        }

        /// <exception cref="IOException"/>
        public static void WriteDHParameter(BigInteger x, Stream output)
        {
            TlsUtilities.WriteOpaque16(BigIntegers.AsUnsignedByteArray(x), output);
        }
    }
}
