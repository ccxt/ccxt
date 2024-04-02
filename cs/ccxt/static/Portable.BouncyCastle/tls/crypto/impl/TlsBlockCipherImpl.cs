using System;
using System.IO;

namespace Org.BouncyCastle.Tls.Crypto.Impl
{
    /// <summary>Interface for block cipher services.</summary>
    public interface TlsBlockCipherImpl
    {
        /// <summary>Set the key to be used by the block cipher implementation supporting this service.</summary>
        /// <param name="key">array holding the block cipher key.</param>
        /// <param name="keyOff">offset into the array the key starts at.</param>
        /// <param name="keyLen">length of the key in the array.</param>
        /// <exception cref="IOException"/>
        void SetKey(byte[] key, int keyOff, int keyLen);

        /// <summary>Initialise the parameters for operator.</summary>
        /// <param name="iv">array holding the initialization vector (IV).</param>
        /// <param name="ivOff">offset into the array the IV starts at.</param>
        /// <param name="ivLen">length of the IV in the array.</param>
        /// <exception cref="IOException">if the parameters are inappropriate.</exception>
        void Init(byte[] iv, int ivOff, int ivLen);

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

        /// <summary>Return the blocksize (in bytes) of the underlying block cipher.</summary>
        /// <returns>the cipher's blocksize.</returns>
        int GetBlockSize();
    }
}
