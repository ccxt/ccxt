using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Base class for a TLS client or server.</summary>
    public abstract class AbstractTlsPeer
        : TlsPeer
    {
        private readonly TlsCrypto m_crypto;

        private volatile TlsCloseable m_closeHandle;

        protected AbstractTlsPeer(TlsCrypto crypto)
        {
            this.m_crypto = crypto;
        }

        /// <summary>Get the <see cref="ProtocolVersion"/> values that are supported by this peer.</summary>
        /// <remarks>
        /// WARNING: Mixing DTLS and TLS versions in the returned array is currently NOT supported. Use a separate
        /// (sub-)class for each case.
        /// </remarks>
        /// <returns>an array of supported <see cref="ProtocolVersion"/> values.</returns>
        protected virtual ProtocolVersion[] GetSupportedVersions()
        {
            return ProtocolVersion.TLSv13.DownTo(ProtocolVersion.TLSv12);
        }

        protected abstract int[] GetSupportedCipherSuites();

        /// <exception cref="IOException"/>
        public virtual void Cancel()
        {
            TlsCloseable closeHandle = this.m_closeHandle;
            if (null != closeHandle)
            {
                closeHandle.Close();
            }
        }

        public virtual TlsCrypto Crypto
        {
            get { return m_crypto; }
        }

        public virtual void NotifyCloseHandle(TlsCloseable closeHandle)
        {
            this.m_closeHandle = closeHandle;
        }

        public abstract ProtocolVersion[] GetProtocolVersions();

        public abstract int[] GetCipherSuites();

        /// <exception cref="IOException"/>
        public virtual void NotifyHandshakeBeginning()
        {
        }

        public virtual int GetHandshakeTimeoutMillis()
        {
            return 0;
        }

        public virtual bool AllowLegacyResumption()
        {
            return false;
        }

        public virtual int GetMaxCertificateChainLength()
        {
            return 10;
        }

        public virtual int GetMaxHandshakeMessageSize()
        {
            return 32768;
        }

        public virtual short[] GetPskKeyExchangeModes()
        {
            return new short[]{ PskKeyExchangeMode.psk_dhe_ke };
        }

        public virtual bool RequiresCloseNotify()
        {
            return true;
        }

        public virtual bool RequiresExtendedMasterSecret()
        {
            return false;
        }

        public virtual bool ShouldCheckSigAlgOfPeerCerts()
        {
            return true;
        }

        public virtual bool ShouldUseExtendedMasterSecret()
        {
            return true;
        }

        public virtual bool ShouldUseExtendedPadding()
        {
            return false;
        }

        public virtual bool ShouldUseGmtUnixTime()
        {
            /*
             * draft-mathewson-no-gmtunixtime-00 2. For the reasons we discuss above, we recommend that
             * TLS implementors MUST by default set the entire value the ClientHello.Random and
             * ServerHello.Random fields, including gmt_unix_time, to a cryptographically random
             * sequence.
             */
            return false;
        }

        /// <exception cref="IOException"/>
        public virtual void NotifySecureRenegotiation(bool secureRenegotiation)
        {
            if (!secureRenegotiation)
                throw new TlsFatalAlert(AlertDescription.handshake_failure);
        }

        /// <exception cref="IOException"/>
        public virtual TlsKeyExchangeFactory GetKeyExchangeFactory()
        {
            return new DefaultTlsKeyExchangeFactory();
        }

        public virtual void NotifyAlertRaised(short alertLevel, short alertDescription, string message,
            Exception cause)
        {
        }

        public virtual void NotifyAlertReceived(short alertLevel, short alertDescription)
        {
        }

        /// <exception cref="IOException"/>
        public virtual void NotifyHandshakeComplete()
        {
        }

        public virtual TlsHeartbeat GetHeartbeat()
        {
            return null;
        }

        public virtual short GetHeartbeatPolicy()
        {
            return HeartbeatMode.peer_not_allowed_to_send;
        }
    }
}
