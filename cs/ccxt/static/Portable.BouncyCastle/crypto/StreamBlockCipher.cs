using System;

using Org.BouncyCastle.Crypto.Modes;

namespace Org.BouncyCastle.Crypto
{
	/**
	 * a wrapper for block ciphers with a single byte block size, so that they
	 * can be treated like stream ciphers.
	 */
	public class StreamBlockCipher
		: IStreamCipher
	{
		private readonly IBlockCipherMode m_cipherMode;
		private readonly byte[] oneByte = new byte[1];

		/**
		 * basic constructor.
		 *
		 * @param cipher the block cipher to be wrapped.
		 * @exception ArgumentException if the cipher has a block size other than
		 * one.
		 */
		public StreamBlockCipher(IBlockCipherMode cipherMode)
		{
			if (cipherMode == null)
				throw new ArgumentNullException(nameof(cipherMode));
			if (cipherMode.GetBlockSize() != 1)
				throw new ArgumentException("block cipher block size != 1.", nameof(cipherMode));

            m_cipherMode = cipherMode;
		}

        /**
		 * initialise the underlying cipher.
		 *
		 * @param forEncryption true if we are setting up for encryption, false otherwise.
		 * @param param the necessary parameters for the underlying cipher to be initialised.
		 */
        public void Init(bool forEncryption, ICipherParameters parameters)
        {
            m_cipherMode.Init(forEncryption, parameters);
		}

		/**
		* return the name of the algorithm we are wrapping.
		*
		* @return the name of the algorithm we are wrapping.
		*/
		public string AlgorithmName
		{
			get { return m_cipherMode.AlgorithmName; }
		}

		/**
		* encrypt/decrypt a single byte returning the result.
		*
		* @param in the byte to be processed.
		* @return the result of processing the input byte.
		*/
		public byte ReturnByte(byte input)
		{
			oneByte[0] = input;

            m_cipherMode.ProcessBlock(oneByte, 0, oneByte, 0);

			return oneByte[0];
		}

        /**
		* process a block of bytes from in putting the result into out.
		*
		* @param in the input byte array.
		* @param inOff the offset into the in array where the data to be processed starts.
		* @param len the number of bytes to be processed.
		* @param out the output buffer the processed bytes go into.
		* @param outOff the offset into the output byte array the processed data stars at.
		* @exception DataLengthException if the output buffer is too small.
		*/
        public void ProcessBytes(byte[] input, int inOff, int length, byte[] output, int outOff)
        {
            Check.DataLength(input, inOff, length, "input buffer too short");
            Check.OutputLength(output, outOff, length, "output buffer too short");

			for (int i = 0; i != length; i++)
			{
                m_cipherMode.ProcessBlock(input, inOff + i, output, outOff + i);
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.OutputLength(output, input.Length, "output buffer too short");

            for (int i = 0; i != input.Length; i++)
            {
                m_cipherMode.ProcessBlock(input[i..], output[i..]);
            }
        }
#endif

        /**
		* reset the underlying cipher. This leaves it in the same state
		* it was at after the last init (if there was one).
		*/
        public void Reset()
		{
            m_cipherMode.Reset();
		}
	}
}
