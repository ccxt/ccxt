using System;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// Base interface describing a provider of entropy sources.
    /// </summary>
    public interface IEntropySourceProvider
    {
        /// <summary>
        /// Return an entropy source providing a block of entropy.
        /// </summary>
        /// <param name="bitsRequired">The size of the block of entropy required.</param>
        /// <returns>An entropy source providing bitsRequired blocks of entropy.</returns>
        IEntropySource Get(int bitsRequired);
    }
}
