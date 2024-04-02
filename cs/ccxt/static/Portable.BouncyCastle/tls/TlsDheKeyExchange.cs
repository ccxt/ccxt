using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    public class TlsDheKeyExchange
        : AbstractTlsKeyExchange
    {
        private static int CheckKeyExchange(int keyExchange)
        {
            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.DHE_DSS:
            case KeyExchangeAlgorithm.DHE_RSA:
                return keyExchange;
            default:
                throw new ArgumentException("unsupported key exchange algorithm", "keyExchange");
            }
        }

        protected TlsDHGroupVerifier m_dhGroupVerifier;
        protected TlsDHConfig m_dhConfig;

        protected TlsCredentialedSigner m_serverCredentials = null;
        protected TlsCertificate m_serverCertificate = null;
        protected TlsAgreement m_agreement;

        public TlsDheKeyExchange(int keyExchange, TlsDHGroupVerifier dhGroupVerifier)
            : this(keyExchange, dhGroupVerifier, null)
        {
        }

        public TlsDheKeyExchange(int keyExchange, TlsDHConfig dhConfig)
            : this(keyExchange, null, dhConfig)
        {
        }

        private TlsDheKeyExchange(int keyExchange, TlsDHGroupVerifier dhGroupVerifier, TlsDHConfig dhConfig)
            : base(CheckKeyExchange(keyExchange))
        {
            this.m_dhGroupVerifier = dhGroupVerifier;
            this.m_dhConfig = dhConfig;
        }

        public override void SkipServerCredentials()
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public override void ProcessServerCredentials(TlsCredentials serverCredentials)
        {
            this.m_serverCredentials = TlsUtilities.RequireSignerCredentials(serverCredentials);
        }

        public override void ProcessServerCertificate(Certificate serverCertificate)
        {
            this.m_serverCertificate = serverCertificate.GetCertificateAt(0);
        }

        public override bool RequiresServerKeyExchange
        {
            get { return true; }
        }

        public override byte[] GenerateServerKeyExchange()
        {
            DigestInputBuffer digestBuffer = new DigestInputBuffer();

            TlsDHUtilities.WriteDHConfig(m_dhConfig, digestBuffer);

            this.m_agreement = m_context.Crypto.CreateDHDomain(m_dhConfig).CreateDH();

            byte[] y = m_agreement.GenerateEphemeral();

            TlsUtilities.WriteOpaque16(y, digestBuffer);

            TlsUtilities.GenerateServerKeyExchangeSignature(m_context, m_serverCredentials, null, digestBuffer);

            return digestBuffer.ToArray();
        }

        public override void ProcessServerKeyExchange(Stream input)
        {
            DigestInputBuffer digestBuffer = new DigestInputBuffer();
            Stream teeIn = new TeeInputStream(input, digestBuffer);

            this.m_dhConfig = TlsDHUtilities.ReceiveDHConfig(m_context, m_dhGroupVerifier, teeIn);

            byte[] y = TlsUtilities.ReadOpaque16(teeIn, 1);

            TlsUtilities.VerifyServerKeyExchangeSignature(m_context, input, m_serverCertificate, null, digestBuffer);

            this.m_agreement = m_context.Crypto.CreateDHDomain(m_dhConfig).CreateDH();

            m_agreement.ReceivePeerValue(y);
        }

        public override short[] GetClientCertificateTypes()
        {
            return new short[]{ ClientCertificateType.dss_sign, ClientCertificateType.ecdsa_sign,
                ClientCertificateType.rsa_sign };
        }

        public override void ProcessClientCredentials(TlsCredentials clientCredentials)
        {
            TlsUtilities.RequireSignerCredentials(clientCredentials);
        }

        public override void GenerateClientKeyExchange(Stream output)
        {
            byte[] y = m_agreement.GenerateEphemeral();

            TlsUtilities.WriteOpaque16(y, output);
        }

        public override void ProcessClientKeyExchange(Stream input)
        {
            m_agreement.ReceivePeerValue(TlsUtilities.ReadOpaque16(input, 1));
        }

        public override TlsSecret GeneratePreMasterSecret()
        {
            return m_agreement.CalculateSecret();
        }
    }
}
