using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>(D)TLS DH key exchange.</summary>
    public class TlsDHKeyExchange
        : AbstractTlsKeyExchange
    {
        private static int CheckKeyExchange(int keyExchange)
        {
            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.DH_DSS:
            case KeyExchangeAlgorithm.DH_RSA:
                return keyExchange;
            default:
                throw new ArgumentException("unsupported key exchange algorithm", "keyExchange");
            }
        }

        protected TlsCredentialedAgreement m_agreementCredentials;
        protected TlsCertificate m_dhPeerCertificate;

        public TlsDHKeyExchange(int keyExchange)
            : base(CheckKeyExchange(keyExchange))
        {
        }

        public override void SkipServerCredentials()
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public override void ProcessServerCredentials(TlsCredentials serverCredentials)
        {
            this.m_agreementCredentials = TlsUtilities.RequireAgreementCredentials(serverCredentials);
        }

        public override void ProcessServerCertificate(Certificate serverCertificate)
        {
            this.m_dhPeerCertificate = serverCertificate.GetCertificateAt(0).CheckUsageInRole(TlsCertificateRole.DH);
        }

        public override short[] GetClientCertificateTypes()
        {
            return new short[]{ ClientCertificateType.dss_fixed_dh, ClientCertificateType.rsa_fixed_dh };
        }

        public override void SkipClientCredentials()
        {
            throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }

        public override void ProcessClientCredentials(TlsCredentials clientCredentials)
        {
            this.m_agreementCredentials = TlsUtilities.RequireAgreementCredentials(clientCredentials);
        }

        public override void GenerateClientKeyExchange(Stream output)
        {
            /*
             * RFC 2246 7.4.7.2 If the client certificate already contains a suitable Diffie-Hellman
             * key, then Yc is implicit and does not need to be sent again. In this case, the Client Key
             * Exchange message will be sent, but will be empty.
             */
        }

        public override void ProcessClientCertificate(Certificate clientCertificate)
        {
            this.m_dhPeerCertificate = clientCertificate.GetCertificateAt(0).CheckUsageInRole(TlsCertificateRole.DH);
        }

        public override void ProcessClientKeyExchange(Stream input)
        {
            // For dss_fixed_dh and rsa_fixed_dh, the key arrived in the client certificate
        }

        public override bool RequiresCertificateVerify
        {
            get { return false; }
        }

        public override TlsSecret GeneratePreMasterSecret()
        {
            return m_agreementCredentials.GenerateAgreement(m_dhPeerCertificate);
        }
    }
}
