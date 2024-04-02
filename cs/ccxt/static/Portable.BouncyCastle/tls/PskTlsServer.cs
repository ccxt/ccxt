using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    public class PskTlsServer
        : AbstractTlsServer
    {
        private static readonly int[] DefaultCipherSuites = new int[]
        {
            CipherSuite.TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256,
            CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA384,
            CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA256,
            CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA,
            CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA,
            CipherSuite.TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256,
            CipherSuite.TLS_DHE_PSK_WITH_AES_256_GCM_SHA384,
            CipherSuite.TLS_DHE_PSK_WITH_AES_128_GCM_SHA256,
            CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA384,
            CipherSuite.TLS_DHE_PSK_WITH_AES_128_CBC_SHA256,
            CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA,
            CipherSuite.TLS_DHE_PSK_WITH_AES_128_CBC_SHA
        };

        protected readonly TlsPskIdentityManager m_pskIdentityManager;

        public PskTlsServer(TlsCrypto crypto, TlsPskIdentityManager pskIdentityManager)
            : base(crypto)
        {
            this.m_pskIdentityManager = pskIdentityManager;
        }

        /// <exception cref="IOException"/>
        protected virtual TlsCredentialedDecryptor GetRsaEncryptionCredentials()
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        protected override ProtocolVersion[] GetSupportedVersions()
        {
            return ProtocolVersion.TLSv12.Only();
        }

        protected override int[] GetSupportedCipherSuites()
        {
            return TlsUtilities.GetSupportedCipherSuites(Crypto, DefaultCipherSuites);
        }

        public override TlsCredentials GetCredentials()
        {
            int keyExchangeAlgorithm = m_context.SecurityParameters.KeyExchangeAlgorithm;

            switch (keyExchangeAlgorithm)
            {
            case KeyExchangeAlgorithm.DHE_PSK:
            case KeyExchangeAlgorithm.ECDHE_PSK:
            case KeyExchangeAlgorithm.PSK:
                return null;

            case KeyExchangeAlgorithm.RSA_PSK:
                return GetRsaEncryptionCredentials();

            default:
                // Note: internal error here; selected a key exchange we don't implement!
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
        }

        public override TlsPskIdentityManager GetPskIdentityManager()
        {
            return m_pskIdentityManager;
        }
    }
}
