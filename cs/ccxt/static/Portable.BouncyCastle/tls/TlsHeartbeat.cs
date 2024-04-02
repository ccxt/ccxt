using System;

namespace Org.BouncyCastle.Tls
{
    public interface TlsHeartbeat
    {
        byte[] GeneratePayload();

        int IdleMillis { get; }

        int TimeoutMillis { get; }
    }
}
