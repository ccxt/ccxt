using System;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// Base interface for a key wrapper.
    /// </summary>
    public interface IKeyWrapper
    {
        /// <summary>
        /// The parameter set used to configure this key wrapper.
        /// </summary>
        object AlgorithmDetails { get; }

        /// <summary>
        /// Wrap the passed in key data.
        /// </summary>
        /// <param name="keyData">The key data to be wrapped.</param>
        /// <returns>an IBlockResult containing the wrapped key data.</returns>
        IBlockResult Wrap(byte[] keyData);
    }
}
