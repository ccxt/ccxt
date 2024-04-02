using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public abstract class TlsEccUtilities
    {
        /// <exception cref="IOException"/>
        public static TlsECConfig CreateNamedECConfig(TlsContext context, int namedGroup)
        {
            if (NamedGroup.GetCurveBits(namedGroup) < 1)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return new TlsECConfig(namedGroup);
        }

        public static int GetMinimumCurveBits(int cipherSuite)
        {
            /*
             * NOTE: This mechanism was added to support a minimum bit-size requirement mooted in early
             * drafts of RFC 8442. This requirement was removed in later drafts, so this mechanism is
             * currently somewhat trivial.
             */
            return IsEccCipherSuite(cipherSuite) ? 1 : 0;
        }

        public static bool IsEccCipherSuite(int cipherSuite)
        {
            switch (TlsUtilities.GetKeyExchangeAlgorithm(cipherSuite))
            {
            case KeyExchangeAlgorithm.ECDH_anon:
            case KeyExchangeAlgorithm.ECDH_ECDSA:
            case KeyExchangeAlgorithm.ECDH_RSA:
            case KeyExchangeAlgorithm.ECDHE_ECDSA:
            case KeyExchangeAlgorithm.ECDHE_PSK:
            case KeyExchangeAlgorithm.ECDHE_RSA:
                return true;

            default:
                return false;
            }
        }

        /// <exception cref="IOException"/>
        public static void CheckPointEncoding(int namedGroup, byte[] encoding)
        {
            if (TlsUtilities.IsNullOrEmpty(encoding))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            switch (namedGroup)
            {
            case NamedGroup.x25519:
            case NamedGroup.x448:
                return;
            }

            switch (encoding[0])
            {
            case 0x04: // uncompressed
                return;

            case 0x00: // infinity
            case 0x02: // compressed
            case 0x03: // compressed
            case 0x06: // hybrid
            case 0x07: // hybrid
            default:
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }
        }

        /// <exception cref="IOException"/>
        public static TlsECConfig ReceiveECDHConfig(TlsContext context, Stream input)
        {
            short curveType = TlsUtilities.ReadUint8(input);
            if (curveType != ECCurveType.named_curve)
                throw new TlsFatalAlert(AlertDescription.handshake_failure);

            int namedGroup = TlsUtilities.ReadUint16(input);
            if (NamedGroup.RefersToAnECDHCurve(namedGroup))
            {
                int[] clientSupportedGroups = context.SecurityParameters.ClientSupportedGroups;
                if (null == clientSupportedGroups || Arrays.Contains(clientSupportedGroups, namedGroup))
                    return new TlsECConfig(namedGroup);
            }

            throw new TlsFatalAlert(AlertDescription.illegal_parameter);
        }

        /// <exception cref="IOException"/>
        public static void WriteECConfig(TlsECConfig ecConfig, Stream output)
        {
            WriteNamedECParameters(ecConfig.NamedGroup, output);
        }

        /// <exception cref="IOException"/>
        public static void WriteNamedECParameters(int namedGroup, Stream output)
        {
            if (!NamedGroup.RefersToASpecificCurve(namedGroup))
            {
                /*
                 * RFC 4492 5.4. All those values of NamedCurve are allowed that refer to a specific
                 * curve. Values of NamedCurve that indicate support for a class of explicitly defined
                 * curves are not allowed here [...].
                 */
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            TlsUtilities.WriteUint8(ECCurveType.named_curve, output);
            TlsUtilities.CheckUint16(namedGroup);
            TlsUtilities.WriteUint16(namedGroup, output);
        }
    }
}
