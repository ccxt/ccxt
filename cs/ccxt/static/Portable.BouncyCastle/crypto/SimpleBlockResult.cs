using System;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// A simple block result object which just carries a byte array.
    /// </summary>
    public class SimpleBlockResult
        : IBlockResult
    {
        private readonly byte[] result;

        /// <summary>
        /// Base constructor - a wrapper for the passed in byte array.
        /// </summary>
        /// <param name="result">The byte array to be wrapped.</param>
        public SimpleBlockResult(byte[] result)
        {
            this.result = result;
        }

        /// <summary>
        /// Return the number of bytes in the result
        /// </summary>
        /// <value>The length of the result in bytes.</value>
        public int Length
        {
            get { return result.Length; }
        }

        /// <summary>
        /// Return the final result of the operation.
        /// </summary>
        /// <returns>A block of bytes, representing the result of an operation.</returns>
        public byte[] Collect()
        {
            return result;
        }

        /// <summary>
        /// Store the final result of the operation by copying it into the destination array.
        /// </summary>
        /// <returns>The number of bytes copied into destination.</returns>
        /// <param name="destination">The byte array to copy the result into.</param>
        /// <param name="offset">The offset into destination to start copying the result at.</param>
        public int Collect(byte[] destination, int offset)
        {
            Array.Copy(result, 0, destination, offset, result.Length);

            return result.Length;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int Collect(Span<byte> destination)
        {
            result.CopyTo(destination);

            return result.Length;
        }
#endif
    }
}
