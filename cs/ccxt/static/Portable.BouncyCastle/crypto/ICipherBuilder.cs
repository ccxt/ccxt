using System;
using System.IO;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// Base interface for cipher builders.
    /// </summary>
    public interface ICipherBuilder
    {
        /// <summary>
        /// Return the algorithm and parameter details associated with any cipher built.
        /// </summary>
        object AlgorithmDetails { get; }

        /// <summary>
        /// Return the maximum output size that a given input will produce.
        /// </summary>
        /// <param name="inputLen">the length of the expected input.</param>
        /// <returns>The maximum possible output size that can produced for the expected input length.</returns>
        int GetMaxOutputSize(int inputLen);

        /// <summary>
        /// Build a cipher that operates on the passed in stream.
        /// </summary>
        /// <param name="stream">The stream to write/read any encrypted/decrypted data.</param>
        /// <returns>A cipher based around the given stream.</returns>
        ICipher BuildCipher(Stream stream);
    }
}
