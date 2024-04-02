using System;
using System.IO;
using System.Threading;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    internal abstract class AbstractTlsContext
        : TlsContext
    {
        private static long counter = Times.NanoTime();

        private static long NextCounterValue()
        {
            return Interlocked.Increment(ref counter);
        }

        private static TlsNonceGenerator CreateNonceGenerator(TlsCrypto crypto, int connectionEnd)
        {
            byte[] additionalSeedMaterial = new byte[16];
            Pack.UInt64_To_BE((ulong)NextCounterValue(), additionalSeedMaterial, 0);
            Pack.UInt64_To_BE((ulong)Times.NanoTime(), additionalSeedMaterial, 8);
            additionalSeedMaterial[0] &= 0x7F;
            additionalSeedMaterial[0] |= (byte)(connectionEnd << 7);

            return crypto.CreateNonceGenerator(additionalSeedMaterial);
        }

        private readonly TlsCrypto m_crypto;
        private readonly int m_connectionEnd;
        private readonly TlsNonceGenerator m_nonceGenerator;

        private SecurityParameters m_securityParameters = null;
        private ProtocolVersion[] m_clientSupportedVersions = null;
        private ProtocolVersion m_clientVersion = null;
        private ProtocolVersion m_rsaPreMasterSecretVersion = null;
        private TlsSession m_session = null;
        private object m_userObject = null;
        private bool m_connected = false;

        internal AbstractTlsContext(TlsCrypto crypto, int connectionEnd)
        {
            this.m_crypto = crypto;
            this.m_connectionEnd = connectionEnd;
            this.m_nonceGenerator = CreateNonceGenerator(crypto, connectionEnd);
        }

        /// <exception cref="IOException"/>
        internal void HandshakeBeginning(TlsPeer peer)
        {
            lock (this)
            {
                if (null != m_securityParameters)
                    throw new TlsFatalAlert(AlertDescription.internal_error, "Handshake already started");

                m_securityParameters = new SecurityParameters();
                m_securityParameters.m_entity = m_connectionEnd;
            }

            peer.NotifyHandshakeBeginning();
        }

        /// <exception cref="IOException"/>
        internal void HandshakeComplete(TlsPeer peer, TlsSession session)
        {
            lock (this)
            {
                if (null == m_securityParameters)
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                this.m_session = session;
                this.m_connected = true;
            }

            peer.NotifyHandshakeComplete();
        }

        internal bool IsConnected
        {
            get { lock (this) return m_connected; }
        }

        internal bool IsHandshaking
        {
            get { lock (this) return !m_connected && null != m_securityParameters; }
        }

        public TlsCrypto Crypto
        {
            get { return m_crypto; }
        }

        public virtual TlsNonceGenerator NonceGenerator
        {
            get { return m_nonceGenerator; }
        }

        public SecurityParameters SecurityParameters
        {
            get { lock (this) return m_securityParameters; }
        }

        public abstract bool IsServer { get; }

        public virtual ProtocolVersion[] ClientSupportedVersions
        {
            get { return m_clientSupportedVersions; }
        }

        internal void SetClientSupportedVersions(ProtocolVersion[] clientSupportedVersions)
        {
            this.m_clientSupportedVersions = clientSupportedVersions;
        }

        public virtual ProtocolVersion ClientVersion
        {
            get { return m_clientVersion; }
        }

        internal void SetClientVersion(ProtocolVersion clientVersion)
        {
            this.m_clientVersion = clientVersion;
        }

        public virtual ProtocolVersion RsaPreMasterSecretVersion
        {
            get { return m_rsaPreMasterSecretVersion; }
        }

        internal void SetRsaPreMasterSecretVersion(ProtocolVersion rsaPreMasterSecretVersion)
        {
            this.m_rsaPreMasterSecretVersion = rsaPreMasterSecretVersion;
        }

        public virtual ProtocolVersion ServerVersion
        {
            get { return SecurityParameters.NegotiatedVersion; }
        }

        public virtual TlsSession ResumableSession
        {
            get
            {
                TlsSession session = Session;
                if (session == null || !session.IsResumable)
                    return null;

                return session;
            }
        }

        public virtual TlsSession Session
        {
            get { return m_session; }
        }

        public virtual object UserObject
        {
            get { return m_userObject; }
            set { this.m_userObject = value; }
        }

        public virtual byte[] ExportChannelBinding(int channelBinding)
        {
            if (!IsConnected)
                throw new InvalidOperationException("Export of channel bindings unavailable before handshake completion");

            SecurityParameters securityParameters = SecurityParameters;

            if (ChannelBinding.tls_exporter == channelBinding)
                return ExportKeyingMaterial("EXPORTER-Channel-Binding", TlsUtilities.EmptyBytes, 32);

            if (TlsUtilities.IsTlsV13(securityParameters.NegotiatedVersion))
                return null;

            switch (channelBinding)
            {
            case ChannelBinding.tls_server_end_point:
            {
                byte[] tlsServerEndPoint = securityParameters.TlsServerEndPoint;

                return TlsUtilities.IsNullOrEmpty(tlsServerEndPoint) ? null : Arrays.Clone(tlsServerEndPoint);
            }

            case ChannelBinding.tls_unique:
            {
                return Arrays.Clone(securityParameters.TlsUnique);
            }

            case ChannelBinding.tls_unique_for_telnet:
            default:
                throw new NotSupportedException();
            }
        }

        public virtual byte[] ExportEarlyKeyingMaterial(string asciiLabel, byte[] context, int length)
        {
            // TODO[tls13] Ensure early_exporter_master_secret is available suitably early!
            if (!IsConnected)
                throw new InvalidOperationException("Export of early key material only available during handshake");

            SecurityParameters sp = SecurityParameters;

            return ExportKeyingMaterial13(CheckEarlyExportSecret(sp.EarlyExporterMasterSecret),
                sp.PrfCryptoHashAlgorithm, asciiLabel, context, length);
        }

        public virtual byte[] ExportKeyingMaterial(string asciiLabel, byte[] context, int length)
        {
            if (!IsConnected)
                throw new InvalidOperationException("Export of key material unavailable before handshake completion");

            /*
             * TODO[tls13] Introduce a TlsExporter interface? Avoid calculating (early) exporter
             * secret(s) unless the peer actually uses it.
             */
            SecurityParameters sp = SecurityParameters;

            if (!sp.IsExtendedMasterSecret)
            {
                /*
                 * RFC 7627 5.4. If a client or server chooses to continue with a full handshake without
                 * the extended master secret extension, [..] the client or server MUST NOT export any
                 * key material based on the new master secret for any subsequent application-level
                 * authentication. In particular, it MUST disable [RFC5705] [..].
                 */
                throw new InvalidOperationException("Export of key material requires extended_master_secret");
            }

            if (TlsUtilities.IsTlsV13(sp.NegotiatedVersion))
            {
                return ExportKeyingMaterial13(CheckExportSecret(sp.ExporterMasterSecret), sp.PrfCryptoHashAlgorithm,
                    asciiLabel, context, length);
            }

            byte[] seed = TlsUtilities.CalculateExporterSeed(sp, context);

            return TlsUtilities.Prf(sp, CheckExportSecret(sp.MasterSecret), asciiLabel, seed, length).Extract();
        }

        protected virtual byte[] ExportKeyingMaterial13(TlsSecret secret, int cryptoHashAlgorithm, string asciiLabel,
            byte[] context, int length)
        {
            if (null == context)
            {
                context = TlsUtilities.EmptyBytes;
            }
            else if (!TlsUtilities.IsValidUint16(context.Length))
            {
                throw new ArgumentException("must have length less than 2^16 (or be null)", "context");
            }

            TlsHash exporterHash = Crypto.CreateHash(cryptoHashAlgorithm);
            byte[] emptyTranscriptHash = exporterHash.CalculateHash();

            TlsSecret exporterSecret = TlsUtilities.DeriveSecret(SecurityParameters, secret, asciiLabel,
                emptyTranscriptHash);

            byte[] exporterContext = emptyTranscriptHash;
            if (context.Length > 0)
            {
                exporterHash.Update(context, 0, context.Length);
                exporterContext = exporterHash.CalculateHash();
            }

            return TlsCryptoUtilities
                .HkdfExpandLabel(exporterSecret, cryptoHashAlgorithm, "exporter", exporterContext, length).Extract();
        }

        protected virtual TlsSecret CheckEarlyExportSecret(TlsSecret secret)
        {
            if (null == secret)
            {
                // TODO[tls13] For symmetry with normal export, ideally available for NotifyHandshakeBeginning() only
                //throw new InvalidOperationException("Export of early key material only available from NotifyHandshakeBeginning()");
                throw new InvalidOperationException("Export of early key material not available for this handshake");
            }
            return secret;
        }

        protected virtual TlsSecret CheckExportSecret(TlsSecret secret)
        {
            if (null == secret)
                throw new InvalidOperationException(
                    "Export of key material only available from NotifyHandshakeComplete()");

            return secret;
        }
    }
}
