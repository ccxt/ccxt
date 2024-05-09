using System;

namespace Org.BouncyCastle.Crypto
{
    /// <remarks>
    /// With FIPS PUB 202 a new kind of message digest was announced which supported extendable output, or variable digest sizes.
    /// This interface provides the extra methods required to support variable output on a digest implementation.
    /// </remarks>
    public interface IXof
        : IDigest
    {
        /// <summary>
        /// Output the results of the final calculation for this XOF to outLen number of bytes.
        /// </summary>
        /// <param name="output">output array to write the output bytes to.</param>
        /// <param name="outOff">offset to start writing the bytes at.</param>
        /// <param name="outLen">the number of output bytes requested.</param>
        /// <returns>the number of bytes written</returns>
        int DoFinal(byte[] output, int outOff, int outLen);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary>
        /// Output the results of the final calculation for this XOF to fill the output span.
        /// </summary>
        /// <param name="output">span to fill with the output bytes.</param>
        /// <returns>the number of bytes written</returns>
        int OutputFinal(Span<byte> output);
#endif

        /// <summary>
        /// Start outputting the results of the final calculation for this XOF. Unlike DoFinal, this method
        /// will continue producing output until the XOF is explicitly reset, or signals otherwise.
        /// </summary>
        /// <param name="output">output array to write the output bytes to.</param>
        /// <param name="outOff">offset to start writing the bytes at.</param>
        /// <param name="outLen">the number of output bytes requested.</param>
        /// <returns>the number of bytes written</returns>
        int DoOutput(byte[] output, int outOff, int outLen);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary>
        /// Start outputting the results of the final calculation for this XOF. Unlike OutputFinal, this method
        /// will continue producing output until the XOF is explicitly reset, or signals otherwise.
        /// </summary>
        /// <param name="output">span to fill with the output bytes.</param>
        /// <returns>the number of bytes written</returns>
        int Output(Span<byte> output);
#endif
    }
}
