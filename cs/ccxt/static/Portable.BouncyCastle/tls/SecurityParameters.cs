using System;
using System.Collections.Generic;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    public sealed class SecurityParameters
    {
        internal int m_entity = -1;
        internal bool m_resumedSession = false;
        internal bool m_secureRenegotiation = false;
        internal int m_cipherSuite = Tls.CipherSuite.TLS_NULL_WITH_NULL_NULL;
        internal short m_maxFragmentLength = -1;
        internal int m_prfAlgorithm = -1;
        internal int m_prfCryptoHashAlgorithm = -1;
        internal int m_prfHashLength = -1;
        internal int m_verifyDataLength = -1;
        internal TlsSecret m_baseKeyClient = null;
        internal TlsSecret m_baseKeyServer = null;
        internal TlsSecret m_earlyExporterMasterSecret = null;
        internal TlsSecret m_earlySecret = null;
        internal TlsSecret m_exporterMasterSecret = null;
        internal TlsSecret m_handshakeSecret = null;
        internal TlsSecret m_masterSecret = null;
        internal TlsSecret m_trafficSecretClient = null;
        internal TlsSecret m_trafficSecretServer = null;
        internal byte[] m_clientRandom = null;
        internal byte[] m_serverRandom = null;
        internal byte[] m_sessionHash = null;
        internal byte[] m_sessionID = null;
        internal byte[] m_pskIdentity = null;
        internal byte[] m_srpIdentity = null;
        internal byte[] m_tlsServerEndPoint = null;
        internal byte[] m_tlsUnique = null;
        internal bool m_encryptThenMac = false;
        internal bool m_extendedMasterSecret = false;
        internal bool m_extendedPadding = false;
        internal bool m_truncatedHmac = false;
        internal ProtocolName m_applicationProtocol = null;
        internal bool m_applicationProtocolSet = false;
        internal short[] m_clientCertTypes = null;
        internal IList<ServerName> m_clientServerNames = null;
        internal IList<SignatureAndHashAlgorithm> m_clientSigAlgs = null;
        internal IList<SignatureAndHashAlgorithm> m_clientSigAlgsCert = null;
        internal int[] m_clientSupportedGroups = null;
        internal IList<SignatureAndHashAlgorithm> m_serverSigAlgs = null;
        internal IList<SignatureAndHashAlgorithm> m_serverSigAlgsCert = null;
        internal int[] m_serverSupportedGroups = null;
        internal int m_keyExchangeAlgorithm = -1;
        internal Certificate m_localCertificate = null;
        internal Certificate m_peerCertificate = null;
        internal ProtocolVersion m_negotiatedVersion = null;
        internal int m_statusRequestVersion = 0;

        // TODO[tls-ops] Investigate whether we can handle verify data using TlsSecret
        internal byte[] m_localVerifyData = null;
        internal byte[] m_peerVerifyData = null;

        internal void Clear()
        {
            this.m_sessionHash = null;
            this.m_sessionID = null;
            this.m_clientCertTypes = null;
            this.m_clientServerNames = null;
            this.m_clientSigAlgs = null;
            this.m_clientSigAlgsCert = null;
            this.m_clientSupportedGroups = null;
            this.m_serverSigAlgs = null;
            this.m_serverSigAlgsCert = null;
            this.m_serverSupportedGroups = null;
            this.m_statusRequestVersion = 0;

            this.m_baseKeyClient = ClearSecret(m_baseKeyClient);
            this.m_baseKeyServer = ClearSecret(m_baseKeyServer);
            this.m_earlyExporterMasterSecret = ClearSecret(m_earlyExporterMasterSecret);
            this.m_earlySecret = ClearSecret(m_earlySecret);
            this.m_exporterMasterSecret = ClearSecret(m_exporterMasterSecret);
            this.m_handshakeSecret = ClearSecret(m_handshakeSecret);
            this.m_masterSecret = ClearSecret(m_masterSecret);
        }

        public ProtocolName ApplicationProtocol
        {
            get { return m_applicationProtocol; }
        }

        public TlsSecret BaseKeyClient
        {
            get { return m_baseKeyClient; }
        }

        public TlsSecret BaseKeyServer
        {
            get { return m_baseKeyServer; }
        }

        public int CipherSuite
        {
            get { return m_cipherSuite; }
        }

        public short[] ClientCertTypes
        {
            get { return m_clientCertTypes; }
        }

        public byte[] ClientRandom
        {
            get { return m_clientRandom; }
        }

        public IList<ServerName> ClientServerNames
        {
            get { return m_clientServerNames; }
        }

        public IList<SignatureAndHashAlgorithm> ClientSigAlgs
        {
            get { return m_clientSigAlgs; }
        }

        public IList<SignatureAndHashAlgorithm> ClientSigAlgsCert
        {
            get { return m_clientSigAlgsCert; }
        }

        public int[] ClientSupportedGroups
        {
            get { return m_clientSupportedGroups; }
        }

        public TlsSecret EarlyExporterMasterSecret
        {
            get { return m_earlyExporterMasterSecret; }
        }

        public TlsSecret EarlySecret
        {
            get { return m_earlySecret; }
        }

        public TlsSecret ExporterMasterSecret
        {
            get { return m_exporterMasterSecret; }
        }

        public int Entity
        {
            get { return m_entity; }
        }

        public TlsSecret HandshakeSecret
        {
            get { return m_handshakeSecret; }
        }

        public bool IsApplicationProtocolSet
        {
            get { return m_applicationProtocolSet; }
        }

        public bool IsEncryptThenMac
        {
            get { return m_encryptThenMac; }
        }

        public bool IsExtendedMasterSecret
        {
            get { return m_extendedMasterSecret; }
        }

        public bool IsExtendedPadding
        {
            get { return m_extendedPadding; }
        }

        public bool IsResumedSession
        {
            get { return m_resumedSession; }
        }

        public bool IsSecureRenegotiation
        {
            get { return m_secureRenegotiation; }
        }

        public bool IsTruncatedHmac
        {
            get { return m_truncatedHmac; }
        }

        public int KeyExchangeAlgorithm
        {
            get { return m_keyExchangeAlgorithm; }
        }

        public Certificate LocalCertificate
        {
            get { return m_localCertificate; }
        }

        public byte[] LocalVerifyData
        {
            get { return m_localVerifyData; }
        }

        public TlsSecret MasterSecret
        {
            get { return m_masterSecret; }
        }

        public short MaxFragmentLength
        {
            get { return m_maxFragmentLength; }
        }

        public ProtocolVersion NegotiatedVersion
        {
            get { return m_negotiatedVersion; }
        }

        public Certificate PeerCertificate
        {
            get { return m_peerCertificate; }
        }

        public byte[] PeerVerifyData
        {
            get { return m_peerVerifyData; }
        }

        public int PrfAlgorithm
        {
            get { return m_prfAlgorithm; }
        }

        public int PrfCryptoHashAlgorithm
        {
            get { return m_prfCryptoHashAlgorithm; }
        }

        public int PrfHashLength
        {
            get { return m_prfHashLength; }
        }

        public byte[] PskIdentity
        {
            get { return m_pskIdentity; }
        }

        public byte[] ServerRandom
        {
            get { return m_serverRandom; }
        }

        public IList<SignatureAndHashAlgorithm> ServerSigAlgs
        {
            get { return m_serverSigAlgs; }
        }

        public IList<SignatureAndHashAlgorithm> ServerSigAlgsCert
        {
            get { return m_serverSigAlgsCert; }
        }

        public int[] ServerSupportedGroups
        {
            get { return m_serverSupportedGroups; }
        }

        public byte[] SessionHash
        {
            get { return m_sessionHash; }
        }

        public byte[] SessionID
        {
            get { return m_sessionID; }
        }

        public byte[] SrpIdentity
        {
            get { return m_srpIdentity; }
        }

        public int StatusRequestVersion
        {
            get { return m_statusRequestVersion; }
        }

        public byte[] TlsServerEndPoint
        {
            get { return m_tlsServerEndPoint; }
        }

        public byte[] TlsUnique
        {
            get { return m_tlsUnique; }
        }

        public TlsSecret TrafficSecretClient
        {
            get { return m_trafficSecretClient; }
        }

        public TlsSecret TrafficSecretServer
        {
            get { return m_trafficSecretServer; }
        }

        public int VerifyDataLength
        {
            get { return m_verifyDataLength; }
        }

        private static TlsSecret ClearSecret(TlsSecret secret)
        {
            if (null != secret)
            {
                secret.Destroy();
            }
            return null;
        }
    }
}
