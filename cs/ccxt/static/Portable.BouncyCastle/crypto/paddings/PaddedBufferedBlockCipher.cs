using System;

using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Paddings
{
	/**
	* A wrapper class that allows block ciphers to be used to process data in
	* a piecemeal fashion with padding. The PaddedBufferedBlockCipher
	* outputs a block only when the buffer is full and more data is being added,
	* or on a doFinal (unless the current block in the buffer is a pad block).
	* The default padding mechanism used is the one outlined in Pkcs5/Pkcs7.
	*/
	public class PaddedBufferedBlockCipher
		: BufferedBlockCipher
	{
        private readonly IBlockCipherPadding padding;

        public PaddedBufferedBlockCipher(IBlockCipher cipher, IBlockCipherPadding padding)
			: this(EcbBlockCipher.GetBlockCipherMode(cipher), padding)
        {
        }

        /**
		* Create a buffered block cipher with the desired padding.
		*
		* @param cipher the underlying block cipher this buffering object wraps.
		* @param padding the padding type.
		*/
        public PaddedBufferedBlockCipher(IBlockCipherMode cipherMode, IBlockCipherPadding padding)
		{
			m_cipherMode = cipherMode;
			this.padding = padding;

			buf = new byte[m_cipherMode.GetBlockSize()];
			bufOff = 0;
		}

		/**
		* Create a buffered block cipher Pkcs7 padding
		*
		* @param cipher the underlying block cipher this buffering object wraps.
		*/
		public PaddedBufferedBlockCipher(IBlockCipherMode cipherMode)
			: this(cipherMode, new Pkcs7Padding())
		{
		}

		/**
		* initialise the cipher.
		*
		* @param forEncryption if true the cipher is initialised for
		*  encryption, if false for decryption.
		* @param param the key and other data required by the cipher.
		* @exception ArgumentException if the parameters argument is
		* inappropriate.
		*/
		public override void Init(bool forEncryption, ICipherParameters parameters)
		{
			this.forEncryption = forEncryption;

			SecureRandom initRandom = null;
			if (parameters is ParametersWithRandom withRandom)
			{
				initRandom = withRandom.Random;
				parameters = withRandom.Parameters;
			}

			Reset();
			padding.Init(initRandom);
			m_cipherMode.Init(forEncryption, parameters);
		}

		/**
		* return the minimum size of the output buffer required for an update
		* plus a doFinal with an input of len bytes.
		*
		* @param len the length of the input.
		* @return the space required to accommodate a call to update and doFinal
		* with len bytes of input.
		*/
		public override int GetOutputSize(
			int length)
		{
			int total = length + bufOff;
			int leftOver = total % buf.Length;

			if (leftOver == 0)
			{
				if (forEncryption)
				{
					return total + buf.Length;
				}

				return total;
			}

			return total - leftOver + buf.Length;
		}

		/**
		* return the size of the output buffer required for an update
		* an input of len bytes.
		*
		* @param len the length of the input.
		* @return the space required to accommodate a call to update
		* with len bytes of input.
		*/
		public override int GetUpdateOutputSize(
			int length)
		{
			int total = length + bufOff;
			int leftOver = total % buf.Length;

			if (leftOver == 0)
			{
				return total - buf.Length;
			}

			return total - leftOver;
		}

		/**
		* process a single byte, producing an output block if necessary.
		*
		* @param in the input byte.
		* @param out the space for any output that might be produced.
		* @param outOff the offset from which the output will be copied.
		* @return the number of output bytes copied to out.
		* @exception DataLengthException if there isn't enough space in out.
		* @exception InvalidOperationException if the cipher isn't initialised.
		*/
		public override int ProcessByte(byte input, byte[] output, int outOff)
		{
			int resultLen = 0;

			if (bufOff == buf.Length)
			{
				resultLen = m_cipherMode.ProcessBlock(buf, 0, output, outOff);
				bufOff = 0;
			}

			buf[bufOff++] = input;

			return resultLen;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public override int ProcessByte(byte input, Span<byte> output)
		{
			int resultLen = 0;

			if (bufOff == buf.Length)
			{
				resultLen = m_cipherMode.ProcessBlock(buf, output);
				bufOff = 0;
			}

			buf[bufOff++] = input;

			return resultLen;
		}
#endif

		/**
		* process an array of bytes, producing output if necessary.
		*
		* @param in the input byte array.
		* @param inOff the offset at which the input data starts.
		* @param len the number of bytes to be copied out of the input array.
		* @param out the space for any output that might be produced.
		* @param outOff the offset from which the output will be copied.
		* @return the number of output bytes copied to out.
		* @exception DataLengthException if there isn't enough space in out.
		* @exception InvalidOperationException if the cipher isn't initialised.
		*/
		public override int ProcessBytes(byte[] input, int inOff, int length, byte[] output, int outOff)
		{
			if (length < 0)
				throw new ArgumentException("Can't have a negative input length!");

			int blockSize = GetBlockSize();
			int outLength = GetUpdateOutputSize(length);

			if (outLength > 0)
			{
				Check.OutputLength(output, outOff, outLength, "output buffer too short");
			}

			int resultLen = 0;
			int gapLen = buf.Length - bufOff;

			if (length > gapLen)
			{
				Array.Copy(input, inOff, buf, bufOff, gapLen);

				resultLen = m_cipherMode.ProcessBlock(buf, 0, output, outOff);

				bufOff = 0;
				length -= gapLen;
				inOff += gapLen;

				while (length > buf.Length)
				{
					resultLen += m_cipherMode.ProcessBlock(input, inOff, output, outOff + resultLen);

					length -= blockSize;
					inOff += blockSize;
				}
			}

			Array.Copy(input, inOff, buf, bufOff, length);

			bufOff += length;

			return resultLen;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public override int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
		{
			int blockSize = GetBlockSize();
			int outLength = GetUpdateOutputSize(input.Length);

			if (outLength > 0)
			{
				Check.OutputLength(output, outLength, "output buffer too short");
			}

			int resultLen = 0;
			int gapLen = buf.Length - bufOff;

			if (input.Length > gapLen)
			{
				input[..gapLen].CopyTo(buf.AsSpan(bufOff));

				resultLen = m_cipherMode.ProcessBlock(buf, output);

				bufOff = 0;
				input = input[gapLen..];

				while (input.Length > buf.Length)
				{
					resultLen += m_cipherMode.ProcessBlock(input, output[resultLen..]);

					input = input[blockSize..];
				}
			}

			input.CopyTo(buf.AsSpan(bufOff));

			bufOff += input.Length;

			return resultLen;
		}
#endif

        /**
		* Process the last block in the buffer. If the buffer is currently
		* full and padding needs to be added a call to doFinal will produce
		* 2 * GetBlockSize() bytes.
		*
		* @param out the array the block currently being held is copied into.
		* @param outOff the offset at which the copying starts.
		* @return the number of output bytes copied to out.
		* @exception DataLengthException if there is insufficient space in out for
		* the output or we are decrypting and the input is not block size aligned.
		* @exception InvalidOperationException if the underlying cipher is not
		* initialised.
		* @exception InvalidCipherTextException if padding is expected and not found.
		*/
        public override int DoFinal(byte[] output, int outOff)
        {
            int blockSize = m_cipherMode.GetBlockSize();
			int resultLen = 0;

			if (forEncryption)
			{
				if (bufOff == blockSize)
				{
					if ((outOff + 2 * blockSize) > output.Length)
					{
						Reset();

						throw new OutputLengthException("output buffer too short");
					}

					resultLen = m_cipherMode.ProcessBlock(buf, 0, output, outOff);
					bufOff = 0;
				}

				padding.AddPadding(buf, bufOff);

				resultLen += m_cipherMode.ProcessBlock(buf, 0, output, outOff + resultLen);

				Reset();
			}
			else
			{
				if (bufOff == blockSize)
				{
					resultLen = m_cipherMode.ProcessBlock(buf, 0, buf, 0);
					bufOff = 0;
				}
				else
				{
					Reset();

					throw new DataLengthException("last block incomplete in decryption");
				}

				try
				{
					resultLen -= padding.PadCount(buf);

					Array.Copy(buf, 0, output, outOff, resultLen);
				}
				finally
				{
					Reset();
				}
			}

			return resultLen;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public override int DoFinal(Span<byte> output)
		{
            int blockSize = m_cipherMode.GetBlockSize();
			int resultLen = 0;

			if (forEncryption)
			{
				if (bufOff == blockSize)
				{
					if ((2 * blockSize) > output.Length)
					{
						Reset();

						throw new OutputLengthException("output buffer too short");
					}

					resultLen = m_cipherMode.ProcessBlock(buf, output);
					bufOff = 0;
				}

				padding.AddPadding(buf, bufOff);

				resultLen += m_cipherMode.ProcessBlock(buf, output[resultLen..]);

				Reset();
			}
			else
			{
				if (bufOff != blockSize)
                {
                    Reset();

                    throw new DataLengthException("last block incomplete in decryption");
                }

                resultLen = m_cipherMode.ProcessBlock(buf, buf);
				bufOff = 0;

				try
				{
					resultLen -= padding.PadCount(buf);

					buf.AsSpan(0, resultLen).CopyTo(output);
				}
				finally
				{
					Reset();
				}
			}

			return resultLen;
		}
#endif
	}
}
