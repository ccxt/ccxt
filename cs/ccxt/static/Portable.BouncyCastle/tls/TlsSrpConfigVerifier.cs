using System;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Interface for verifying SRP config needs to conform to.</summary>
    public interface TlsSrpConfigVerifier
    {
        /// <summary>Check whether the given SRP configuration is acceptable for use.</summary>
        /// <param name="srpConfig">the <see cref="TlsSrpConfig"/> to check.</param>
        /// <returns>true if (and only if) the specified configuration is acceptable.</returns>
        bool Accept(TlsSrpConfig srpConfig);
    }
}
