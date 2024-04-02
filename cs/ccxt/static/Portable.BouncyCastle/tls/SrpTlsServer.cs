using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    public class SrpTlsServer
        : AbstractTlsServer
    {
        private static readonly int[] DefaultCipherSuites = new int[]
        {
            CipherSuite.TLS_SRP_SHA_DSS_WITH_AES_256_CBC_SHA,
            CipherSuite.TLS_SRP_SHA_DSS_WITH_AES_128_CBC_SHA,
            CipherSuite.TLS_SRP_SHA_RSA_WITH_AES_256_CBC_SHA,
            CipherSuite.TLS_SRP_SHA_RSA_WITH_AES_128_CBC_SHA,
            CipherSuite.TLS_SRP_SHA_WITH_AES_256_CBC_SHA,
            CipherSuite.TLS_SRP_SHA_WITH_AES_128_CBC_SHA
        };

        protected readonly TlsSrpIdentityManager m_srpIdentityManager;

        protected byte[] m_srpIdentity = null;
        protected TlsSrpLoginParameters m_srpLoginParameters = null;

        public SrpTlsServer(TlsCrypto crypto, TlsSrpIdentityManager srpIdentityManager)
            : base(crypto)
        {
            this.m_srpIdentityManager = srpIdentityManager;
        }

        /// <exception cref="IOException"/>
        protected virtual TlsCredentialedSigner GetDsaSignerCredentials()
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        /// <exception cref="IOException"/>
        protected virtual TlsCredentialedSigner GetRsaSignerCredentials()
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

        public override void ProcessClientExtensions(IDictionary<int, byte[]> clientExtensions)
        {
            base.ProcessClientExtensions(clientExtensions);

            this.m_srpIdentity = TlsSrpUtilities.GetSrpExtension(clientExtensions);
        }

        public override int GetSelectedCipherSuite()
        {
            int cipherSuite = base.GetSelectedCipherSuite();

            if (TlsSrpUtilities.IsSrpCipherSuite(cipherSuite))
            {
                if (m_srpIdentity != null)
                {
                    this.m_srpLoginParameters = m_srpIdentityManager.GetLoginParameters(m_srpIdentity);
                }

                if (m_srpLoginParameters == null)
                    throw new TlsFatalAlert(AlertDescription.unknown_psk_identity);
            }

            return cipherSuite;
        }

        public override TlsCredentials GetCredentials()
        {
            int keyExchangeAlgorithm = m_context.SecurityParameters.KeyExchangeAlgorithm;

            switch (keyExchangeAlgorithm)
            {
            case KeyExchangeAlgorithm.SRP:
                return null;

            case KeyExchangeAlgorithm.SRP_DSS:
                return GetDsaSignerCredentials();

            case KeyExchangeAlgorithm.SRP_RSA:
                return GetRsaSignerCredentials();

            default:
                // Note: internal error here; selected a key exchange we don't implement!
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
        }

        public override TlsSrpLoginParameters GetSrpLoginParameters()
        {
            return m_srpLoginParameters;
        }
    }
}
