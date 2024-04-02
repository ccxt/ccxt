using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Interface for message digest, or hash, services.</summary>
    public interface TlsHash
    {
        /// <summary>Update the hash with the passed in input.</summary>
        /// <param name="input">input array containing the data.</param>
        /// <param name="inOff">offset into the input array the input starts at.</param>
        /// <param name="length">the length of the input data.</param>
        void Update(byte[] input, int inOff, int length);

        /// <summary>Return calculated hash for any input passed in.</summary>
        /// <returns>the hash value.</returns>
        byte[] CalculateHash();

        /// <summary>Return a clone of this hash object representing its current state.</summary>
        /// <returns>a clone of the current hash.</returns>
        TlsHash CloneHash();

        /// <summary>Reset the hash underlying this service.</summary>
        void Reset();
    }
}
