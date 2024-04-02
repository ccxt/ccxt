using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    /// <summary>(D)TLS SRP key exchange (RFC 5054).</summary>
    public class TlsSrpKeyExchange
        : AbstractTlsKeyExchange
    {
        private static int CheckKeyExchange(int keyExchange)
        {
            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.SRP:
            case KeyExchangeAlgorithm.SRP_DSS:
            case KeyExchangeAlgorithm.SRP_RSA:
                return keyExchange;
            default:
                throw new ArgumentException("unsupported key exchange algorithm", "keyExchange");
            }
        }

        protected TlsSrpIdentity m_srpIdentity;
        protected TlsSrpConfigVerifier m_srpConfigVerifier;
        protected TlsCertificate m_serverCertificate = null;
        protected byte[] m_srpSalt = null;
        protected TlsSrp6Client m_srpClient = null;

        protected TlsSrpLoginParameters m_srpLoginParameters;
        protected TlsCredentialedSigner m_serverCredentials = null;
        protected TlsSrp6Server m_srpServer = null;

        protected BigInteger m_srpPeerCredentials = null;

        public TlsSrpKeyExchange(int keyExchange, TlsSrpIdentity srpIdentity, TlsSrpConfigVerifier srpConfigVerifier)
            : base(CheckKeyExchange(keyExchange))
        {
            this.m_srpIdentity = srpIdentity;
            this.m_srpConfigVerifier = srpConfigVerifier;
        }

        public TlsSrpKeyExchange(int keyExchange, TlsSrpLoginParameters srpLoginParameters)
            : base(CheckKeyExchange(keyExchange))
        {
            this.m_srpLoginParameters = srpLoginParameters;
        }

        public override void SkipServerCredentials()
        {
            if (m_keyExchange != KeyExchangeAlgorithm.SRP)
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public override void ProcessServerCredentials(TlsCredentials serverCredentials)
        {
            if (m_keyExchange == KeyExchangeAlgorithm.SRP)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            this.m_serverCredentials = TlsUtilities.RequireSignerCredentials(serverCredentials);
        }

        public override void ProcessServerCertificate(Certificate serverCertificate)
        {
            if (m_keyExchange == KeyExchangeAlgorithm.SRP)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            this.m_serverCertificate = serverCertificate.GetCertificateAt(0);
        }

        public override bool RequiresServerKeyExchange
        {
            get { return true; }
        }

        public override byte[] GenerateServerKeyExchange()
        {
            TlsSrpConfig config = m_srpLoginParameters.Config;

            this.m_srpServer = m_context.Crypto.CreateSrp6Server(config, m_srpLoginParameters.Verifier);

            BigInteger B = m_srpServer.GenerateServerCredentials();

            BigInteger[] ng = config.GetExplicitNG();
            ServerSrpParams srpParams = new ServerSrpParams(ng[0], ng[1], m_srpLoginParameters.Salt, B);

            DigestInputBuffer digestBuffer = new DigestInputBuffer();

            srpParams.Encode(digestBuffer);

            if (m_serverCredentials != null)
            {
                TlsUtilities.GenerateServerKeyExchangeSignature(m_context, m_serverCredentials, null, digestBuffer);
            }

            return digestBuffer.ToArray();
        }

        public override void ProcessServerKeyExchange(Stream input)
        {
            DigestInputBuffer digestBuffer = null;
            Stream teeIn = input;

            if (m_keyExchange != KeyExchangeAlgorithm.SRP)
            {
                digestBuffer = new DigestInputBuffer();
                teeIn = new TeeInputStream(input, digestBuffer);
            }

            ServerSrpParams srpParams = ServerSrpParams.Parse(teeIn);

            if (digestBuffer != null)
            {
                TlsUtilities.VerifyServerKeyExchangeSignature(m_context, input, m_serverCertificate, null,
                    digestBuffer);
            }

            TlsSrpConfig config = new TlsSrpConfig();
            config.SetExplicitNG(new BigInteger[]{ srpParams.N, srpParams.G });

            if (!m_srpConfigVerifier.Accept(config))
                throw new TlsFatalAlert(AlertDescription.insufficient_security);

            this.m_srpSalt = srpParams.S;

            /*
             * RFC 5054 2.5.3: The client MUST abort the handshake with an "illegal_parameter" alert if
             * B % N = 0.
             */
            this.m_srpPeerCredentials = ValidatePublicValue(srpParams.N, srpParams.B);
            this.m_srpClient = m_context.Crypto.CreateSrp6Client(config);
        }

        public override void ProcessClientCredentials(TlsCredentials clientCredentials)
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public override void GenerateClientKeyExchange(Stream output)
        {
            byte[] identity = m_srpIdentity.GetSrpIdentity();
            byte[] password = m_srpIdentity.GetSrpPassword();

            BigInteger A = m_srpClient.GenerateClientCredentials(m_srpSalt, identity, password);
            TlsSrpUtilities.WriteSrpParameter(A, output);

            m_context.SecurityParameters.m_srpIdentity = Arrays.Clone(identity);
        }

        public override void ProcessClientKeyExchange(Stream input)
        {
            /*
             * RFC 5054 2.5.4: The server MUST abort the handshake with an "illegal_parameter" alert if
             * A % N = 0.
             */
            this.m_srpPeerCredentials = ValidatePublicValue(m_srpLoginParameters.Config.GetExplicitNG()[0],
                TlsSrpUtilities.ReadSrpParameter(input));

            m_context.SecurityParameters.m_srpIdentity = Arrays.Clone(m_srpLoginParameters.Identity);
        }

        public override TlsSecret GeneratePreMasterSecret()
        {
            BigInteger S = m_srpServer != null
                ?   m_srpServer.CalculateSecret(m_srpPeerCredentials)
                :   m_srpClient.CalculateSecret(m_srpPeerCredentials);

            // TODO Check if this needs to be a fixed size
            return m_context.Crypto.CreateSecret(BigIntegers.AsUnsignedByteArray(S));
        }

        protected static BigInteger ValidatePublicValue(BigInteger N, BigInteger val)
        {
            val = val.Mod(N);

            // Check that val % N != 0
            if (val.Equals(BigInteger.Zero))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            return val;
        }
    }
}
