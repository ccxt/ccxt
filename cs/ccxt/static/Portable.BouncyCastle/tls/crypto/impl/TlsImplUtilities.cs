using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls.Crypto.Impl
{
    /// <summary>Useful utility methods.</summary>
    public abstract class TlsImplUtilities
    {
        public static bool IsSsl(TlsCryptoParameters cryptoParams)
        {
            return cryptoParams.ServerVersion.IsSsl;
        }

        public static bool IsTlsV10(ProtocolVersion version)
        {
            return ProtocolVersion.TLSv10.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static bool IsTlsV10(TlsCryptoParameters cryptoParams)
        {
            return IsTlsV10(cryptoParams.ServerVersion);
        }

        public static bool IsTlsV11(ProtocolVersion version)
        {
            return ProtocolVersion.TLSv11.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static bool IsTlsV11(TlsCryptoParameters cryptoParams)
        {
            return IsTlsV11(cryptoParams.ServerVersion);
        }

        public static bool IsTlsV12(ProtocolVersion version)
        {
            return ProtocolVersion.TLSv12.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static bool IsTlsV12(TlsCryptoParameters cryptoParams)
        {
            return IsTlsV12(cryptoParams.ServerVersion);
        }

        public static bool IsTlsV13(ProtocolVersion version)
        {
            return ProtocolVersion.TLSv13.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static bool IsTlsV13(TlsCryptoParameters cryptoParams)
        {
            return IsTlsV13(cryptoParams.ServerVersion);
        }

        public static byte[] CalculateKeyBlock(TlsCryptoParameters cryptoParams, int length)
        {
            SecurityParameters securityParameters = cryptoParams.SecurityParameters;
            TlsSecret master_secret = securityParameters.MasterSecret;
            int prfAlgorithm = securityParameters.PrfAlgorithm;
            byte[] seed = Arrays.Concatenate(securityParameters.ServerRandom, securityParameters.ClientRandom);
            return master_secret.DeriveUsingPrf(prfAlgorithm, ExporterLabel.key_expansion, seed, length).Extract();
        }
    }
}
