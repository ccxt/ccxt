using System;

namespace Org.BouncyCastle.Crypto
{
    /// <remarks>Base interface for a message digest.</remarks>
    public interface IDigest
    {
        /// <summary>The algorithm name.</summary>
        string AlgorithmName { get; }

        /// <summary>Return the size, in bytes, of the digest produced by this message digest.</summary>
        /// <returns>the size, in bytes, of the digest produced by this message digest.</returns>
        int GetDigestSize();

        /// <summary>Return the size, in bytes, of the internal buffer used by this digest.</summary>
        /// <returns>the size, in bytes, of the internal buffer used by this digest.</returns>
        int GetByteLength();

        /// <summary>Update the message digest with a single byte.</summary>
        /// <param name="input">the input byte to be entered.</param>
        void Update(byte input);

        /// <summary>Update the message digest with a block of bytes.</summary>
        /// <param name="input">the byte array containing the data.</param>
        /// <param name="inOff">the offset into the byte array where the data starts.</param>
        /// <param name="inLen">the length of the data.</param>
        void BlockUpdate(byte[] input, int inOff, int inLen);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary>Update the message digest with a span of bytes.</summary>
        /// <param name="input">the span containing the data.</param>
        void BlockUpdate(ReadOnlySpan<byte> input);
#endif

        /// <summary>Close the digest, producing the final digest value.</summary>
        /// <remarks>This call leaves the digest reset.</remarks>
        /// <param name="output">the byte array the digest is to be copied into.</param>
        /// <param name="outOff">the offset into the byte array the digest is to start at.</param>
        /// <returns>the number of bytes written</returns>
        int DoFinal(byte[] output, int outOff);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary>Close the digest, producing the final digest value.</summary>
        /// <remarks>This call leaves the digest reset.</remarks>
        /// <param name="output">the span the digest is to be copied into.</param>
        /// <returns>the number of bytes written</returns>
        int DoFinal(Span<byte> output);
#endif

        /// <summary>Reset the digest back to its initial state.</summary>
        void Reset();
    }
}
