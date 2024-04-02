using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Base interface for an object that can process a PSK identity.</summary>
    public interface TlsPskIdentityManager
    {
        byte[] GetHint();

        byte[] GetPsk(byte[] identity);
    }
}
