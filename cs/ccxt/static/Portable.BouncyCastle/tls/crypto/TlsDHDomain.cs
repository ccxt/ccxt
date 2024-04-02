using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Domain interface to service factory for creating Diffie-Hellman operators.</summary>
    public interface TlsDHDomain
    {
        /// <summary>Return an agreement operator suitable for ephemeral Diffie-Hellman.</summary>
        /// <returns>a key agreement operator.</returns>
        TlsAgreement CreateDH();
    }
}
