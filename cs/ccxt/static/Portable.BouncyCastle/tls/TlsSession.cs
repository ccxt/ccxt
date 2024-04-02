using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Base interface for a carrier object for a TLS session.</summary>
    public interface TlsSession
    {
        SessionParameters ExportSessionParameters();

        byte[] SessionID { get; }

        void Invalidate();

        bool IsResumable { get; }
    }
}
