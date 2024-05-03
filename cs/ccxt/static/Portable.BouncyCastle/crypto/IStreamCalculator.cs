using System;
using System.IO;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// Base interface for cryptographic operations such as Hashes, MACs, and Signatures which reduce a stream of data
    /// to a single value.
    /// </summary>
    public interface IStreamCalculator
    {
        /// <summary>Return a "sink" stream which only exists to update the implementing object.</summary>
        /// <returns>A stream to write to in order to update the implementing object.</returns>
        Stream Stream { get; }

        /// <summary>
        /// Return the result of processing the stream. This value is only available once the stream
        /// has been closed.
        /// </summary>
        /// <returns>The result of processing the stream.</returns>
        object GetResult();
    }
}
