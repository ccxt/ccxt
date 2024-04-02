using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Base interface for an object that can return login parameters from an SRP identity.</summary>
    public interface TlsSrpIdentityManager
    {
        /// <summary>Lookup the <see cref="TlsSrpLoginParameters"/> corresponding to the specified identity.</summary>
        /// <remarks>
        /// NOTE: To avoid "identity probing", unknown identities SHOULD be handled as recommended in RFC 5054 2.5.1.3.
        /// <see cref="SimulatedTlsSrpIdentityManager"/> is provided for this purpose.
        /// </remarks>
        /// <param name="identity">the SRP identity sent by the connecting client.</param>
        /// <returns>the <see cref="TlsSrpLoginParameters"/> for the specified identity, or else 'simulated' parameters
        /// if the identity is not recognized. A null value is also allowed, but not recommended.</returns>
        TlsSrpLoginParameters GetLoginParameters(byte[] identity);
    }
}
