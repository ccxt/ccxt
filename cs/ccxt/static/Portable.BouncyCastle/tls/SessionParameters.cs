using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public sealed class SessionParameters
    {
        public sealed class Builder
        {
            private int m_cipherSuite = -1;
            private Certificate m_localCertificate = null;
            private TlsSecret m_masterSecret = null;
            private ProtocolVersion m_negotiatedVersion;
            private Certificate m_peerCertificate = null;
            private byte[] m_pskIdentity = null;
            private byte[] m_srpIdentity = null;
            private byte[] m_encodedServerExtensions = null;
            private bool m_extendedMasterSecret = false;

            public Builder()
            {
            }

            public SessionParameters Build()
            {
                Validate(m_cipherSuite >= 0, "cipherSuite");
                Validate(m_masterSecret != null, "masterSecret");
                return new SessionParameters(m_cipherSuite, m_localCertificate, m_masterSecret, m_negotiatedVersion,
                    m_peerCertificate, m_pskIdentity, m_srpIdentity, m_encodedServerExtensions, m_extendedMasterSecret);
            }

            public Builder SetCipherSuite(int cipherSuite)
            {
                this.m_cipherSuite = cipherSuite;
                return this;
            }

            public Builder SetExtendedMasterSecret(bool extendedMasterSecret)
            {
                this.m_extendedMasterSecret = extendedMasterSecret;
                return this;
            }

            public Builder SetLocalCertificate(Certificate localCertificate)
            {
                this.m_localCertificate = localCertificate;
                return this;
            }

            public Builder SetMasterSecret(TlsSecret masterSecret)
            {
                this.m_masterSecret = masterSecret;
                return this;
            }

            public Builder SetNegotiatedVersion(ProtocolVersion negotiatedVersion)
            {
                this.m_negotiatedVersion = negotiatedVersion;
                return this;
            }

            public Builder SetPeerCertificate(Certificate peerCertificate)
            {
                this.m_peerCertificate = peerCertificate;
                return this;
            }

            public Builder SetPskIdentity(byte[] pskIdentity)
            {
                this.m_pskIdentity = pskIdentity;
                return this;
            }

            public Builder SetSrpIdentity(byte[] srpIdentity)
            {
                this.m_srpIdentity = srpIdentity;
                return this;
            }

            /// <exception cref="IOException"/>
            public Builder SetServerExtensions(IDictionary<int, byte[]> serverExtensions)
            {
                if (serverExtensions == null || serverExtensions.Count < 1)
                {
                    this.m_encodedServerExtensions = null;
                }
                else
                {
                    MemoryStream buf = new MemoryStream();
                    TlsProtocol.WriteExtensions(buf, serverExtensions);
                    this.m_encodedServerExtensions = buf.ToArray();
                }
                return this;
            }

            private void Validate(bool condition, string parameter)
            {
                if (!condition)
                    throw new InvalidOperationException("Required session parameter '" + parameter + "' not configured");
            }
        }

        private readonly int m_cipherSuite;
        private readonly Certificate m_localCertificate;
        private readonly TlsSecret m_masterSecret;
        private readonly ProtocolVersion m_negotiatedVersion;
        private readonly Certificate m_peerCertificate;
        private readonly byte[] m_pskIdentity;
        private readonly byte[] m_srpIdentity;
        private readonly byte[] m_encodedServerExtensions;
        private readonly bool m_extendedMasterSecret;

        private SessionParameters(int cipherSuite, Certificate localCertificate, TlsSecret masterSecret,
            ProtocolVersion negotiatedVersion, Certificate peerCertificate, byte[] pskIdentity, byte[] srpIdentity,
            byte[] encodedServerExtensions, bool extendedMasterSecret)
        {
            this.m_cipherSuite = cipherSuite;
            this.m_localCertificate = localCertificate;
            this.m_masterSecret = masterSecret;
            this.m_negotiatedVersion = negotiatedVersion;
            this.m_peerCertificate = peerCertificate;
            this.m_pskIdentity = Arrays.Clone(pskIdentity);
            this.m_srpIdentity = Arrays.Clone(srpIdentity);
            this.m_encodedServerExtensions = encodedServerExtensions;
            this.m_extendedMasterSecret = extendedMasterSecret;
        }

        public int CipherSuite
        {
            get { return m_cipherSuite; }
        }

        public void Clear()
        {
            if (m_masterSecret != null)
            {
                m_masterSecret.Destroy();
            }
        }

        public SessionParameters Copy()
        {
            return new SessionParameters(m_cipherSuite, m_localCertificate, m_masterSecret, m_negotiatedVersion,
                m_peerCertificate, m_pskIdentity, m_srpIdentity, m_encodedServerExtensions, m_extendedMasterSecret);
        }

        public bool IsExtendedMasterSecret
        {
            get { return m_extendedMasterSecret; }
        }

        public Certificate LocalCertificate
        {
            get { return m_localCertificate; }
        }

        public TlsSecret MasterSecret
        {
            get { return m_masterSecret; }
        }

        public ProtocolVersion NegotiatedVersion
        {
            get { return m_negotiatedVersion; }
        }

        public Certificate PeerCertificate
        {
            get { return m_peerCertificate; }
        }

        public byte[] PskIdentity
        {
            get { return m_pskIdentity; }
        }

        /// <exception cref="IOException"/>
        public IDictionary<int, byte[]> ReadServerExtensions()
        {
            if (m_encodedServerExtensions == null)
                return null;

            return TlsProtocol.ReadExtensions(new MemoryStream(m_encodedServerExtensions, false));
        }

        public byte[] SrpIdentity
        {
            get { return m_srpIdentity; }
        }
    }
}
