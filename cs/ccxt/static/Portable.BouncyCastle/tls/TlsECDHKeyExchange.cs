using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>(D)TLS ECDH key exchange (see RFC 4492).</summary>
    public class TlsECDHKeyExchange
        : AbstractTlsKeyExchange
    {
        private static int CheckKeyExchange(int keyExchange)
        {
            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.ECDH_ECDSA:
            case KeyExchangeAlgorithm.ECDH_RSA:
                return keyExchange;
            default:
                throw new ArgumentException("unsupported key exchange algorithm", "keyExchange");
            }
        }

        protected TlsCredentialedAgreement m_agreementCredentials;
        protected TlsCertificate m_ecdhPeerCertificate;

        public TlsECDHKeyExchange(int keyExchange)
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
            this.m_ecdhPeerCertificate = serverCertificate.GetCertificateAt(0).CheckUsageInRole(
                TlsCertificateRole.ECDH);
        }

        public override short[] GetClientCertificateTypes()
        {
            /*
             * RFC 4492 3. [...] The ECDSA_fixed_ECDH and RSA_fixed_ECDH mechanisms are usable with
             * ECDH_ECDSA and ECDH_RSA. Their use with ECDHE_ECDSA and ECDHE_RSA is prohibited because
             * the use of a long-term ECDH client key would jeopardize the forward secrecy property of
             * these algorithms.
             */
            return new short[]{ ClientCertificateType.ecdsa_fixed_ecdh, ClientCertificateType.rsa_fixed_ecdh };
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
            // In this case, the Client Key Exchange message will be sent, but will be empty.
        }

        public override void ProcessClientCertificate(Certificate clientCertificate)
        {
            this.m_ecdhPeerCertificate = clientCertificate.GetCertificateAt(0).CheckUsageInRole(
                TlsCertificateRole.ECDH);
        }

        public override void ProcessClientKeyExchange(Stream input)
        {
            // For ecdsa_fixed_ecdh and rsa_fixed_ecdh, the key arrived in the client certificate
        }

        public override bool RequiresCertificateVerify
        {
            get { return false; }
        }

        public override TlsSecret GeneratePreMasterSecret()
        {
            return m_agreementCredentials.GenerateAgreement(m_ecdhPeerCertificate);
        }
    }
}
