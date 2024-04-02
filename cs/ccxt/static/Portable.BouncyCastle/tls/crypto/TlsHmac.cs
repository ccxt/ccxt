using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Interface for MAC services based on HMAC.</summary>
    public interface TlsHmac
        : TlsMac
    {
        /// <summary>Return the internal block size for the message digest underlying this HMAC service.</summary>
        /// <returns>the internal block size for the digest (in bytes).</returns>
        int InternalBlockSize { get; }
    }
}
