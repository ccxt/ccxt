using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Domain interface to service factory for creating Elliptic-Curve (EC) based operators.</summary>
    public interface TlsECDomain
    {
        /// <summary>Return an agreement operator suitable for ephemeral EC Diffie-Hellman.</summary>
        /// <returns>a key agreement operator.</returns>
        TlsAgreement CreateECDH();
    }
}
