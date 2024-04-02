using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>(D)TLS DH_anon key exchange.</summary>
    public class TlsDHanonKeyExchange
        : AbstractTlsKeyExchange
    {
        private static int CheckKeyExchange(int keyExchange)
        {
            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.DH_anon:
                return keyExchange;
            default:
                throw new ArgumentException("unsupported key exchange algorithm", "keyExchange");
            }
        }

        protected TlsDHGroupVerifier m_dhGroupVerifier;
        protected TlsDHConfig m_dhConfig;

        protected TlsAgreement m_agreement;

        public TlsDHanonKeyExchange(int keyExchange, TlsDHGroupVerifier dhGroupVerifier)
            : this(keyExchange, dhGroupVerifier, null)
        {
        }

        public TlsDHanonKeyExchange(int keyExchange, TlsDHConfig dhConfig)
            : this(keyExchange, null, dhConfig)
        {
        }

        private TlsDHanonKeyExchange(int keyExchange, TlsDHGroupVerifier dhGroupVerifier, TlsDHConfig dhConfig)
            : base(CheckKeyExchange(keyExchange))
        {
            this.m_dhGroupVerifier = dhGroupVerifier;
            this.m_dhConfig = dhConfig;
        }

        public override void SkipServerCredentials()
        {
        }

        public override void ProcessServerCredentials(TlsCredentials serverCredentials)
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public override void ProcessServerCertificate(Certificate serverCertificate)
        {
            throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }

        public override bool RequiresServerKeyExchange
        {
            get { return true; }
        }

        public override byte[] GenerateServerKeyExchange()
        {
            MemoryStream buf = new MemoryStream();

            TlsDHUtilities.WriteDHConfig(m_dhConfig, buf);

            this.m_agreement = m_context.Crypto.CreateDHDomain(m_dhConfig).CreateDH();

            byte[] y = m_agreement.GenerateEphemeral();

            TlsUtilities.WriteOpaque16(y, buf);

            return buf. ToArray();
        }

        public override void ProcessServerKeyExchange(Stream input)
        {
            this.m_dhConfig = TlsDHUtilities.ReceiveDHConfig(m_context, m_dhGroupVerifier, input);

            byte[] y = TlsUtilities.ReadOpaque16(input, 1);

            this.m_agreement = m_context.Crypto.CreateDHDomain(m_dhConfig).CreateDH();

            m_agreement.ReceivePeerValue(y);
        }

        public override short[] GetClientCertificateTypes()
        {
            return null;
        }

        public override void ProcessClientCredentials(TlsCredentials clientCredentials)
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public override void GenerateClientKeyExchange(Stream output)
        {
            byte[] y = m_agreement.GenerateEphemeral();

            TlsUtilities.WriteOpaque16(y, output);
        }

        public override void ProcessClientCertificate(Certificate clientCertificate)
        {
            throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }

        public override void ProcessClientKeyExchange(Stream input)
        {
            byte[] y = TlsUtilities.ReadOpaque16(input, 1);

            m_agreement.ReceivePeerValue(y);
        }

        public override TlsSecret GeneratePreMasterSecret()
        {
            return m_agreement.CalculateSecret();
        }
    }
}
