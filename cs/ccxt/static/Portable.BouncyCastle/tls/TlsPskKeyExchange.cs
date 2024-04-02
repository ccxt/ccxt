using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    /// <summary>(D)TLS PSK key exchange (RFC 4279).</summary>
    public class TlsPskKeyExchange
        : AbstractTlsKeyExchange
    {
        private static int CheckKeyExchange(int keyExchange)
        {
            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.DHE_PSK:
            case KeyExchangeAlgorithm.ECDHE_PSK:
            case KeyExchangeAlgorithm.PSK:
            case KeyExchangeAlgorithm.RSA_PSK:
                return keyExchange;
            default:
                throw new ArgumentException("unsupported key exchange algorithm", "keyExchange");
            }
        }

        protected TlsPskIdentity m_pskIdentity;
        protected TlsPskIdentityManager m_pskIdentityManager;
        protected TlsDHGroupVerifier m_dhGroupVerifier;

        protected byte[] m_psk_identity_hint = null;
        protected byte[] m_psk = null;

        protected TlsDHConfig m_dhConfig;
        protected TlsECConfig m_ecConfig;
        protected TlsAgreement m_agreement;

        protected TlsCredentialedDecryptor m_serverCredentials = null;
        protected TlsEncryptor m_serverEncryptor;
        protected TlsSecret m_preMasterSecret;

        public TlsPskKeyExchange(int keyExchange, TlsPskIdentity pskIdentity, TlsDHGroupVerifier dhGroupVerifier)
            : this(keyExchange, pskIdentity, null, dhGroupVerifier, null, null)
        {
        }

        public TlsPskKeyExchange(int keyExchange, TlsPskIdentityManager pskIdentityManager,
            TlsDHConfig dhConfig, TlsECConfig ecConfig)
            : this(keyExchange, null, pskIdentityManager, null, dhConfig, ecConfig)
        {
        }

        private TlsPskKeyExchange(int keyExchange, TlsPskIdentity pskIdentity, TlsPskIdentityManager pskIdentityManager,
            TlsDHGroupVerifier dhGroupVerifier, TlsDHConfig dhConfig, TlsECConfig ecConfig)
            : base(CheckKeyExchange(keyExchange))
        {
            this.m_pskIdentity = pskIdentity;
            this.m_pskIdentityManager = pskIdentityManager;
            this.m_dhGroupVerifier = dhGroupVerifier;
            this.m_dhConfig = dhConfig;
            this.m_ecConfig = ecConfig;
        }

        public override void SkipServerCredentials()
        {
            if (m_keyExchange == KeyExchangeAlgorithm.RSA_PSK)
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public override void ProcessServerCredentials(TlsCredentials serverCredentials)
        {
            if (m_keyExchange != KeyExchangeAlgorithm.RSA_PSK)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            this.m_serverCredentials = TlsUtilities.RequireDecryptorCredentials(serverCredentials);
        }

        public override void ProcessServerCertificate(Certificate serverCertificate)
        {
            if (m_keyExchange != KeyExchangeAlgorithm.RSA_PSK)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            this.m_serverEncryptor = serverCertificate.GetCertificateAt(0).CreateEncryptor(
                TlsCertificateRole.RsaEncryption);
        }

        public override byte[] GenerateServerKeyExchange()
        {
            this.m_psk_identity_hint = m_pskIdentityManager.GetHint();

            if (this.m_psk_identity_hint == null && !RequiresServerKeyExchange)
                return null;

            MemoryStream buf = new MemoryStream();

            if (this.m_psk_identity_hint == null)
            {
                TlsUtilities.WriteOpaque16(TlsUtilities.EmptyBytes, buf);
            }
            else
            {
                TlsUtilities.WriteOpaque16(this.m_psk_identity_hint, buf);
            }

            if (this.m_keyExchange == KeyExchangeAlgorithm.DHE_PSK)
            {
                if (this.m_dhConfig == null)
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                TlsDHUtilities.WriteDHConfig(m_dhConfig, buf);

                this.m_agreement = m_context.Crypto.CreateDHDomain(m_dhConfig).CreateDH();

                GenerateEphemeralDH(buf);
            }
            else if (this.m_keyExchange == KeyExchangeAlgorithm.ECDHE_PSK)
            {
                if (this.m_ecConfig == null)
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                TlsEccUtilities.WriteECConfig(m_ecConfig, buf);

                this.m_agreement = m_context.Crypto.CreateECDomain(m_ecConfig).CreateECDH();

                GenerateEphemeralECDH(buf);
            }

            return buf.ToArray();
        }

        public override bool RequiresServerKeyExchange
        {
            get
            {
                switch (m_keyExchange)
                {
                case KeyExchangeAlgorithm.DHE_PSK:
                case KeyExchangeAlgorithm.ECDHE_PSK:
                    return true;
                default:
                    return false;
                }
            }
        }

        public override void ProcessServerKeyExchange(Stream input)
        {
            this.m_psk_identity_hint = TlsUtilities.ReadOpaque16(input);

            if (this.m_keyExchange == KeyExchangeAlgorithm.DHE_PSK)
            {
                this.m_dhConfig = TlsDHUtilities.ReceiveDHConfig(m_context, m_dhGroupVerifier, input);

                byte[] y = TlsUtilities.ReadOpaque16(input, 1);

                this.m_agreement = m_context.Crypto.CreateDHDomain(m_dhConfig).CreateDH();

                ProcessEphemeralDH(y);
            }
            else if (this.m_keyExchange == KeyExchangeAlgorithm.ECDHE_PSK)
            {
                this.m_ecConfig = TlsEccUtilities.ReceiveECDHConfig(m_context, input);

                byte[] point = TlsUtilities.ReadOpaque8(input, 1);

                this.m_agreement = m_context.Crypto.CreateECDomain(m_ecConfig).CreateECDH();

                ProcessEphemeralECDH(point);
            }
        }

        public override void ProcessClientCredentials(TlsCredentials clientCredentials)
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public override void GenerateClientKeyExchange(Stream output)
        {
            if (m_psk_identity_hint == null)
            {
                m_pskIdentity.SkipIdentityHint();
            }
            else
            {
                m_pskIdentity.NotifyIdentityHint(m_psk_identity_hint);
            }

            byte[] psk_identity = m_pskIdentity.GetPskIdentity();
            if (psk_identity == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            this.m_psk = m_pskIdentity.GetPsk();
            if (m_psk == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            TlsUtilities.WriteOpaque16(psk_identity, output);

            m_context.SecurityParameters.m_pskIdentity = Arrays.Clone(psk_identity);

            if (this.m_keyExchange == KeyExchangeAlgorithm.DHE_PSK)
            {
                GenerateEphemeralDH(output);
            }
            else if (this.m_keyExchange == KeyExchangeAlgorithm.ECDHE_PSK)
            {
                GenerateEphemeralECDH(output);
            }
            else if (this.m_keyExchange == KeyExchangeAlgorithm.RSA_PSK)
            {
                this.m_preMasterSecret = TlsUtilities.GenerateEncryptedPreMasterSecret(m_context, m_serverEncryptor,
                    output);
            }
        }

        public override void ProcessClientKeyExchange(Stream input)
        {
            byte[] psk_identity = TlsUtilities.ReadOpaque16(input);

            this.m_psk = m_pskIdentityManager.GetPsk(psk_identity);
            if (m_psk == null)
                throw new TlsFatalAlert(AlertDescription.unknown_psk_identity);

            m_context.SecurityParameters.m_pskIdentity = psk_identity;

            if (this.m_keyExchange == KeyExchangeAlgorithm.DHE_PSK)
            {
                byte[] y = TlsUtilities.ReadOpaque16(input, 1);

                ProcessEphemeralDH(y);
            }
            else if (this.m_keyExchange == KeyExchangeAlgorithm.ECDHE_PSK)
            {
                byte[] point = TlsUtilities.ReadOpaque8(input, 1);

                ProcessEphemeralECDH(point);
            }
            else if (this.m_keyExchange == KeyExchangeAlgorithm.RSA_PSK)
            {
                byte[] encryptedPreMasterSecret = TlsUtilities.ReadEncryptedPms(m_context, input);

                this.m_preMasterSecret = m_serverCredentials.Decrypt(new TlsCryptoParameters(m_context),
                    encryptedPreMasterSecret);
            }
        }

        public override TlsSecret GeneratePreMasterSecret()
        {
            byte[] other_secret = GenerateOtherSecret(m_psk.Length);

            MemoryStream buf = new MemoryStream(4 + other_secret.Length + m_psk.Length);
            TlsUtilities.WriteOpaque16(other_secret, buf);
            TlsUtilities.WriteOpaque16(m_psk, buf);

            Array.Clear(m_psk, 0, m_psk.Length);
            this.m_psk = null;

            return m_context.Crypto.CreateSecret(buf.ToArray());
        }

        protected virtual void GenerateEphemeralDH(Stream output)
        {
            byte[] y = m_agreement.GenerateEphemeral();
            TlsUtilities.WriteOpaque16(y, output);
        }

        protected virtual void GenerateEphemeralECDH(Stream output)
        {
            byte[] point = m_agreement.GenerateEphemeral();
            TlsUtilities.WriteOpaque8(point, output);
        }

        protected virtual byte[] GenerateOtherSecret(int pskLength)
        {
            if (this.m_keyExchange == KeyExchangeAlgorithm.PSK)
                return new byte[pskLength];

            if (this.m_keyExchange == KeyExchangeAlgorithm.DHE_PSK ||
                this.m_keyExchange == KeyExchangeAlgorithm.ECDHE_PSK)
            {
                if (m_agreement != null)
                    return m_agreement.CalculateSecret().Extract();
            }

            if (this.m_keyExchange == KeyExchangeAlgorithm.RSA_PSK)
            {
                if (m_preMasterSecret != null)
                    return this.m_preMasterSecret.Extract();
            }

            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        protected virtual void ProcessEphemeralDH(byte[] y)
        {
            this.m_agreement.ReceivePeerValue(y);
        }

        protected virtual void ProcessEphemeralECDH(byte[] point)
        {
            TlsEccUtilities.CheckPointEncoding(m_ecConfig.NamedGroup, point);

            this.m_agreement.ReceivePeerValue(point);
        }
    }
}
