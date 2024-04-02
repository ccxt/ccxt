using System;
using System.IO;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Base interface for an encryptor.</summary>
    public interface TlsEncryptor
    {
        /// <summary>Encrypt data from the passed in input array.</summary>
        /// <param name="input">byte array containing the input data.</param>
        /// <param name="inOff">offset into input where the data starts.</param>
        /// <param name="length">the length of the data to encrypt.</param>
        /// <returns>the encrypted data.</returns>
        /// <exception cref="IOException"/>
        byte[] Encrypt(byte[] input, int inOff, int length);
    }
}
