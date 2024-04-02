using System;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Interface for verifying explicit Diffie-Hellman group parameters.</summary>
    public interface TlsDHGroupVerifier
    {
        /// <summary>Check whether the given DH group is acceptable for use.</summary>
        /// <param name="dhGroup">the <see cref="DHGroup"/> to check.</param>
        /// <returns>true if (and only if) the specified group is acceptable.</returns>
        bool Accept(DHGroup dhGroup);
    }
}
