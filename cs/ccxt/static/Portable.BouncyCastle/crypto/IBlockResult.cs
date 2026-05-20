using System;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// Operators that reduce their input to a single block return an object
    /// of this type.
    /// </summary>
    public interface IBlockResult
    {
        /// <summary>
        /// Return the final result of the operation.
        /// </summary>
        /// <returns>A block of bytes, representing the result of an operation.</returns>
        byte[] Collect();

        /// <summary>
        /// Store the final result of the operation by copying it into the destination array.
        /// </summary>
        /// <returns>The number of bytes copied into destination.</returns>
        /// <param name="destination">The byte array to copy the result into.</param>
        /// <param name="offset">The offset into destination to start copying the result at.</param>
        int Collect(byte[] destination, int offset);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary>
        /// Store the final result of the operation by copying it into the destination span.
        /// </summary>
        /// <returns>The number of bytes copied into destination.</returns>
        /// <param name="destination">The span to copy the result into.</param>
        int Collect(Span<byte> destination);
#endif
    }
}
