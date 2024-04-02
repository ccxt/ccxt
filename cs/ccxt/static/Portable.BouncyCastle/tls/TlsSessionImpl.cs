using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    internal class TlsSessionImpl
        : TlsSession
    {
        private readonly byte[] m_sessionID;
        private readonly SessionParameters m_sessionParameters;
        private bool m_resumable;

        internal TlsSessionImpl(byte[] sessionID, SessionParameters sessionParameters)
        {
            if (sessionID == null)
                throw new ArgumentNullException("sessionID");
            if (sessionID.Length > 32)
                throw new ArgumentException("cannot be longer than 32 bytes", "sessionID");

            this.m_sessionID = Arrays.Clone(sessionID);
            this.m_sessionParameters = sessionParameters;
            this.m_resumable = sessionID.Length > 0 && null != sessionParameters;
        }

        public SessionParameters ExportSessionParameters()
        {
            lock (this)
            {
                return m_sessionParameters == null ? null : m_sessionParameters.Copy();
            }
        }

        public byte[] SessionID
        {
            get { lock (this) return m_sessionID; }
        }

        public void Invalidate()
        {
            lock (this)
            {
                this.m_resumable = false;
            }
        }

        public bool IsResumable
        {
            get { lock (this) return m_resumable; }
        }
    }
}
