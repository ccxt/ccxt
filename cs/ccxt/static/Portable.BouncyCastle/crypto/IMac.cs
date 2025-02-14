using System;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>The base interface for implementations of message authentication codes (MACs).</summary>
    public interface IMac
    {
        /// <summary>Initialise the MAC.</summary>
        /// <param name="parameters">The key or other data required by the MAC.</param>
        void Init(ICipherParameters parameters);

        /// <summary>The algorithm name.</summary>
        string AlgorithmName { get; }

        /// <summary>Return the size, in bytes, of the MAC produced by this implementation.</summary>
        /// <returns>the size, in bytes, of the MAC produced by this implementation.</returns>
        int GetMacSize();

        /// <summary>Update the MAC with a single byte.</summary>
        /// <param name="input">the input byte to be entered.</param>
        void Update(byte input);

        /// <summary>Update the MAC with a block of bytes.</summary>
        /// <param name="input">the byte array containing the data.</param>
        /// <param name="inOff">the offset into the byte array where the data starts.</param>
        /// <param name="inLen">the length of the data.</param>
        void BlockUpdate(byte[] input, int inOff, int inLen);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary>Update the MAC with a span of bytes.</summary>
        /// <param name="input">the span containing the data.</param>
        void BlockUpdate(ReadOnlySpan<byte> input);
#endif

        /// <summary>Perform final calculations, producing the result MAC.</summary>
        /// <remarks>This call leaves the MAC reset.</remarks>
        /// <param name="output">the byte array the MAC is to be copied into.</param>
        /// <param name="outOff">the offset into the byte array the MAC is to start at.</param>
        /// <returns>the number of bytes written</returns>
        int DoFinal(byte[] output, int outOff);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary>Perform final calculations, producing the result MAC.</summary>
        /// <remarks>This call leaves the MAC reset.</remarks>
        /// <param name="output">the span the MAC is to be copied into.</param>
        /// <returns>the number of bytes written</returns>
        int DoFinal(Span<byte> output);
#endif

        /// <summary>Reset the MAC back to its initial state.</summary>
        void Reset();
    }
}
