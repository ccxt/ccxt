using System;
using System.IO;

namespace Org.BouncyCastle.Tls.Crypto.Impl
{
    /// <summary>Base interface for services supporting AEAD encryption/decryption.</summary>
    public interface TlsAeadCipherImpl
    {
        /// <summary>Set the key to be used by the AEAD cipher implementation supporting this service.</summary>
        /// <param name="key">array holding the AEAD cipher key.</param>
        /// <param name="keyOff">offset into the array the key starts at.</param>
        /// <param name="keyLen">length of the key in the array.</param>
        /// <exception cref="IOException"/>
        void SetKey(byte[] key, int keyOff, int keyLen);

        /// <summary>Initialise the parameters for the AEAD operator.</summary>
        /// <param name="nonce">the nonce.</param>
        /// <param name="macSize">MAC size in bytes.</param>
        /// <param name="additionalData">any additional data to be included in the MAC calculation.</param>
        /// <exception cref="IOException">if the parameters are inappropriate.</exception>
        void Init(byte[] nonce, int macSize, byte[] additionalData);

        /// <summary>Return the maximum size of the output for input of inputLength bytes.</summary>
        /// <param name="inputLength">the length (in bytes) of the proposed input.</param>
        /// <returns>the maximum size of the output.</returns>
        int GetOutputSize(int inputLength);

        /// <summary>Perform the cipher encryption/decryption returning the output in output.</summary>
        /// <remarks>
        /// Note: we have to use DoFinal() here as it is the only way to guarantee output from the underlying cipher.
        /// </remarks>
        /// <param name="input">array holding input data to the cipher.</param>
        /// <param name="inputOffset">offset into input array data starts at.</param>
        /// <param name="inputLength">length of the input data in the array.</param>
        /// <param name="output">array to hold the cipher output.</param>
        /// <param name="outputOffset">offset into output array to start saving output.</param>
        /// <returns>the amount of data written to output.</returns>
        /// <exception cref="IOException">in case of failure.</exception>
        int DoFinal(byte[] input, int inputOffset, int inputLength, byte[] output, int outputOffset);
    }
}
