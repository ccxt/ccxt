using System;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// Base interface for a key unwrapper.
    /// </summary>
    public interface IKeyUnwrapper
    {
        /// <summary>
        /// The parameter set used to configure this key unwrapper.
        /// </summary>
        object AlgorithmDetails { get; }

        /// <summary>
        /// Unwrap the passed in data.
        /// </summary>
        /// <param name="cipherText">The array containing the data to be unwrapped.</param>
        /// <param name="offset">The offset into cipherText at which the unwrapped data starts.</param>
        /// <param name="length">The length of the data to be unwrapped.</param>
        /// <returns>an IBlockResult containing the unwrapped key data.</returns>
        IBlockResult Unwrap(byte[] cipherText, int offset, int length);
    }
}
