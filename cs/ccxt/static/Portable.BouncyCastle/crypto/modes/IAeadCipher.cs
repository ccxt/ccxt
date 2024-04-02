using System;

using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Modes
{
    /// <summary>
    /// A cipher mode that includes authenticated encryption with a streaming mode and optional
    /// associated data.
    /// </summary>
    /// <remarks>
    /// Implementations of this interface may operate in a packet mode (where all input data is
    /// buffered and processed during the call to DoFinal, or in a streaming mode (where output
    /// data is incrementally produced with each call to ProcessByte or ProcessBytes. This is
    /// important to consider during decryption: in a streaming mode, unauthenticated plaintext
    /// data may be output prior to the call to DoFinal that results in an authentication failure.
    /// The higher level protocol utilising this cipher must ensure the plaintext data is handled
    /// appropriately until the end of data is reached and the entire ciphertext is authenticated.
    /// </remarks>
    /// <see cref="AeadParameters"/>
    public interface IAeadCipher
    {
        /// <summary>The name of the algorithm this cipher implements.</summary>
        string AlgorithmName { get; }

        /// <summary>Initialise the cipher.</summary>
        /// <remarks>Parameter can either be an AeadParameters or a ParametersWithIV object.</remarks>
        /// <param name="forEncryption">Initialise for encryption if true, for decryption if false.</param>
        /// <param name="parameters">The key or other data required by the cipher.</param>
        void Init(bool forEncryption, ICipherParameters parameters);

        /// <summary>Add a single byte to the associated data check.</summary>
        /// <remarks>If the implementation supports it, this will be an online operation and will not retain the associated data.</remarks>
        /// <param name="input">The byte to be processed.</param>
        void ProcessAadByte(byte input);

        /// <summary>Add a sequence of bytes to the associated data check.</summary>
        /// <remarks>If the implementation supports it, this will be an online operation and will not retain the associated data.</remarks>
        /// <param name="inBytes">The input byte array.</param>
        /// <param name="inOff">The offset into the input array where the data to be processed starts.</param>
        /// <param name="len">The number of bytes to be processed.</param>
        void ProcessAadBytes(byte[] inBytes, int inOff, int len);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary>Add a span of bytes to the associated data check.</summary>
        /// <remarks>If the implementation supports it, this will be an online operation and will not retain the associated data.</remarks>
        /// <param name="input">the span containing the data.</param>
        void ProcessAadBytes(ReadOnlySpan<byte> input);
#endif

        /**
		* Encrypt/decrypt a single byte.
		*
		* @param input the byte to be processed.
		* @param outBytes the output buffer the processed byte goes into.
		* @param outOff the offset into the output byte array the processed data starts at.
		* @return the number of bytes written to out.
		* @exception DataLengthException if the output buffer is too small.
		*/
        int ProcessByte(byte input, byte[] outBytes, int outOff);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        int ProcessByte(byte input, Span<byte> output);
#endif

        /**
        * Process a block of bytes from in putting the result into out.
        *
        * @param inBytes the input byte array.
        * @param inOff the offset into the in array where the data to be processed starts.
        * @param len the number of bytes to be processed.
        * @param outBytes the output buffer the processed bytes go into.
        * @param outOff the offset into the output byte array the processed data starts at.
        * @return the number of bytes written to out.
        * @exception DataLengthException if the output buffer is too small.
        */
        int ProcessBytes(byte[] inBytes, int inOff, int len, byte[] outBytes, int outOff);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output);
#endif

        /**
        * Finish the operation either appending or verifying the MAC at the end of the data.
        *
        * @param outBytes space for any resulting output data.
        * @param outOff offset into out to start copying the data at.
        * @return number of bytes written into out.
        * @throws InvalidOperationException if the cipher is in an inappropriate state.
        * @throws InvalidCipherTextException if the MAC fails to match.
        */
        int DoFinal(byte[] outBytes, int outOff);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        int DoFinal(Span<byte> output);
#endif

        /**
        * Return the value of the MAC associated with the last stream processed.
        *
        * @return MAC for plaintext data.
        */
        byte[] GetMac();

        /**
        * Return the size of the output buffer required for a ProcessBytes
        * an input of len bytes.
        *
        * @param len the length of the input.
        * @return the space required to accommodate a call to ProcessBytes
        * with len bytes of input.
        */
        int GetUpdateOutputSize(int len);

        /**
        * Return the size of the output buffer required for a ProcessBytes plus a
        * DoFinal with an input of len bytes.
        *
        * @param len the length of the input.
        * @return the space required to accommodate a call to ProcessBytes and DoFinal
        * with len bytes of input.
        */
        int GetOutputSize(int len);

        /// <summary>
        /// Reset the cipher to the same state as it was after the last init (if there was one).
        /// </summary>
        void Reset();
    }
}
