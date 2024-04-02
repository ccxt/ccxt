using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>(D)TLS ECDH_anon key exchange (see RFC 4492).</summary>
    public class TlsECDHanonKeyExchange
        : AbstractTlsKeyExchange
    {
        private static int CheckKeyExchange(int keyExchange)
        {
            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.ECDH_anon:
                return keyExchange;
            default:
                throw new ArgumentException("unsupported key exchange algorithm", "keyExchange");
            }
        }

        protected TlsECConfig m_ecConfig;

        protected TlsAgreement m_agreement;

        public TlsECDHanonKeyExchange(int keyExchange)
            : this(keyExchange, null)
        {
        }

        public TlsECDHanonKeyExchange(int keyExchange, TlsECConfig ecConfig)
            : base(CheckKeyExchange(keyExchange))
        {
            this.m_ecConfig = ecConfig;
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

            TlsEccUtilities.WriteECConfig(m_ecConfig, buf);

            this.m_agreement = m_context.Crypto.CreateECDomain(m_ecConfig).CreateECDH();

            GenerateEphemeral(buf);

            return buf.ToArray();
        }

        public override void ProcessServerKeyExchange(Stream input)
        {
            this.m_ecConfig = TlsEccUtilities.ReceiveECDHConfig(m_context, input);

            byte[] point = TlsUtilities.ReadOpaque8(input, 1);

            this.m_agreement = m_context.Crypto.CreateECDomain(m_ecConfig).CreateECDH();

            ProcessEphemeral(point);
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
            GenerateEphemeral(output);
        }

        public override void ProcessClientCertificate(Certificate clientCertificate)
        {
            throw new TlsFatalAlert(AlertDescription.unexpected_message);
        }

        public override void ProcessClientKeyExchange(Stream input)
        {
            byte[] point = TlsUtilities.ReadOpaque8(input, 1);

            ProcessEphemeral(point);
        }

        public override TlsSecret GeneratePreMasterSecret()
        {
            return m_agreement.CalculateSecret();
        }

        protected virtual void GenerateEphemeral(Stream output)
        {
            byte[] point = m_agreement.GenerateEphemeral();

            TlsUtilities.WriteOpaque8(point, output);
        }

        protected virtual void ProcessEphemeral(byte[] point)
        {
            TlsEccUtilities.CheckPointEncoding(m_ecConfig.NamedGroup, point);

            this.m_agreement.ReceivePeerValue(point);
        }
    }
}
