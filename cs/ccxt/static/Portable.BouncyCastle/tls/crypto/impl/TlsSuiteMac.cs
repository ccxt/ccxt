using System;

namespace Org.BouncyCastle.Tls.Crypto.Impl
{
    /// <summary>Base interface for a generic TLS MAC implementation for use with a bulk cipher.</summary>
    public interface TlsSuiteMac
    {
        /// <summary>Return the output length (in bytes) of this MAC.</summary>
        /// <returns>The output length of this MAC.</returns>
        int Size { get; }

        /// <summary>Calculate the MAC for some given data.</summary>
        /// <param name="seqNo">The sequence number of the record.</param>
        /// <param name="type">The content type of the message.</param>
        /// <param name="message">A byte array containing the message.</param>
        /// <param name="offset">The number of bytes to skip, before the message starts.</param>
        /// <param name="length">The length of the message.</param>
        /// <returns>A new byte array containing the MAC value.</returns>
        byte[] CalculateMac(long seqNo, short type, byte[] message, int offset, int length);

        /// <summary>Constant time calculation of the MAC for some given data with a given expected length.</summary>
        /// <param name="seqNo">The sequence number of the record.</param>
        /// <param name="type">The content type of the message.</param>
        /// <param name="message">A byte array containing the message.</param>
        /// <param name="offset">The number of bytes to skip, before the message starts.</param>
        /// <param name="length">The length of the message.</param>
        /// <param name="expectedLength">The expected length of the full message.</param>
        /// <param name="randomData">Random data for padding out the MAC calculation if required.</param>
        /// <returns>A new byte array containing the MAC value.</returns>
        byte[] CalculateMacConstantTime(long seqNo, short type, byte[] message, int offset, int length,
            int expectedLength, byte[] randomData);
    }
}
