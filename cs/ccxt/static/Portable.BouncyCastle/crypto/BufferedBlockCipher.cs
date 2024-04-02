using System;

using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto
{
	/**
	* A wrapper class that allows block ciphers to be used to process data in
	* a piecemeal fashion. The BufferedBlockCipher outputs a block only when the
	* buffer is full and more data is being added, or on a doFinal.
	* <p>
	* Note: in the case where the underlying cipher is either a CFB cipher or an
	* OFB one the last block may not be a multiple of the block size.
	* </p>
	*/
	public class BufferedBlockCipher
		: BufferedCipherBase
	{
        internal byte[] buf;
		internal int bufOff;
		internal bool forEncryption;
		internal IBlockCipherMode m_cipherMode;

		/**
		* constructor for subclasses
		*/
		protected BufferedBlockCipher()
		{
		}

        public BufferedBlockCipher(IBlockCipher cipher)
			: this(EcbBlockCipher.GetBlockCipherMode(cipher))
        {
        }

        /**
		* Create a buffered block cipher without padding.
		*
		* @param cipher the underlying block cipher this buffering object wraps.
		* false otherwise.
		*/
        public BufferedBlockCipher(IBlockCipherMode cipherMode)
		{
			if (cipherMode == null)
				throw new ArgumentNullException(nameof(cipherMode));

            m_cipherMode = cipherMode;
			buf = new byte[cipherMode.GetBlockSize()];
			bufOff = 0;
		}

		public override string AlgorithmName
		{
			get { return m_cipherMode.AlgorithmName; }
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
		// Note: This doubles as the Init in the event that this cipher is being used as an IWrapper
		public override void Init(bool forEncryption, ICipherParameters parameters)
		{
			this.forEncryption = forEncryption;

			if (parameters is ParametersWithRandom withRandom)
			{
				parameters = withRandom.Parameters;
			}

            Reset();

			m_cipherMode.Init(forEncryption, parameters);
		}

		/**
		* return the blocksize for the underlying cipher.
		*
		* @return the blocksize for the underlying cipher.
		*/
		public override int GetBlockSize()
		{
			return m_cipherMode.GetBlockSize();
		}

		/**
		* return the size of the output buffer required for an update
		* an input of len bytes.
		*
		* @param len the length of the input.
		* @return the space required to accommodate a call to update
		* with len bytes of input.
		*/
		public override int GetUpdateOutputSize(int length)
		{
			int total = length + bufOff;
			int leftOver = total % buf.Length;
			return total - leftOver;
		}

		/**
		* return the size of the output buffer required for an update plus a
		* doFinal with an input of len bytes.
		*
		* @param len the length of the input.
		* @return the space required to accommodate a call to update and doFinal
		* with len bytes of input.
		*/
		public override int GetOutputSize(int length)
		{
			// Note: Can assume IsPartialBlockOkay is true for purposes of this calculation
			return length + bufOff;
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
			buf[bufOff++] = input;

			if (bufOff == buf.Length)
			{
				if ((outOff + buf.Length) > output.Length)
					throw new DataLengthException("output buffer too short");

				bufOff = 0;
				return m_cipherMode.ProcessBlock(buf, 0, output, outOff);
			}

			return 0;
		}

		public override byte[] ProcessByte(byte input)
		{
			int outLength = GetUpdateOutputSize(1);

			byte[] outBytes = outLength > 0 ? new byte[outLength] : null;

			int pos = ProcessByte(input, outBytes, 0);

			if (outLength > 0 && pos < outLength)
			{
				byte[] tmp = new byte[pos];
				Array.Copy(outBytes, 0, tmp, 0, pos);
				outBytes = tmp;
			}

			return outBytes;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int ProcessByte(byte input, Span<byte> output)
        {
            buf[bufOff++] = input;

            if (bufOff == buf.Length)
            {
				Check.OutputLength(output, buf.Length, "output buffer too short");

                bufOff = 0;
                return m_cipherMode.ProcessBlock(buf, output);
            }

            return 0;
        }
#endif

        public override byte[] ProcessBytes(byte[] input, int inOff, int length)
        {
            if (input == null)
				throw new ArgumentNullException(nameof(input));
			if (length < 1)
				return null;

			int outLength = GetUpdateOutputSize(length);

			byte[] outBytes = outLength > 0 ? new byte[outLength] : null;

			int pos = ProcessBytes(input, inOff, length, outBytes, 0);

			if (outLength > 0 && pos < outLength)
			{
				byte[] tmp = new byte[pos];
				Array.Copy(outBytes, 0, tmp, 0, pos);
				outBytes = tmp;
			}

			return outBytes;
		}

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
            if (length < 1)
			{
				if (length < 0)
					throw new ArgumentException("Can't have a negative input length!");

				return 0;
			}

			int blockSize = GetBlockSize();
			int outLength = GetUpdateOutputSize(length);

			if (outLength > 0)
			{
                Check.OutputLength(output, outOff, outLength, "output buffer too short");
			}

            int resultLen = 0;
			int gapLen = buf.Length - bufOff;
			if (length >= gapLen)
			{
				Array.Copy(input, inOff, buf, bufOff, gapLen);
				resultLen = m_cipherMode.ProcessBlock(buf, 0, output, outOff);
				bufOff = 0;
				length -= gapLen;
				inOff += gapLen;
				while (length >= buf.Length)
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
            if (input.IsEmpty)
                return 0;

            int blockSize = GetBlockSize();
            int outLength = GetUpdateOutputSize(input.Length);

            if (outLength > 0)
            {
                Check.OutputLength(output, outLength, "output buffer too short");
            }

            int resultLen = 0;
            int gapLen = buf.Length - bufOff;
            if (input.Length >= gapLen)
            {
				input[..gapLen].CopyTo(buf.AsSpan(bufOff));
                resultLen = m_cipherMode.ProcessBlock(buf, output);
                bufOff = 0;
				input = input[gapLen..];
                while (input.Length >= buf.Length)
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

        public override byte[] DoFinal()
		{
			byte[] outBytes = EmptyBuffer;

			int length = GetOutputSize(0);
			if (length > 0)
			{
				outBytes = new byte[length];

				int pos = DoFinal(outBytes, 0);
				if (pos < outBytes.Length)
				{
					byte[] tmp = new byte[pos];
					Array.Copy(outBytes, 0, tmp, 0, pos);
					outBytes = tmp;
				}
			}
			else
			{
				Reset();
			}

			return outBytes;
		}

        public override byte[] DoFinal(byte[] input, int inOff, int inLen)
        {
            if (input == null)
				throw new ArgumentNullException(nameof(input));

			int length = GetOutputSize(inLen);

			byte[] outBytes = EmptyBuffer;

			if (length > 0)
			{
				outBytes = new byte[length];

				int pos = (inLen > 0)
					?	ProcessBytes(input, inOff, inLen, outBytes, 0)
					:	0;

				pos += DoFinal(outBytes, pos);

				if (pos < outBytes.Length)
				{
					byte[] tmp = new byte[pos];
					Array.Copy(outBytes, 0, tmp, 0, pos);
					outBytes = tmp;
				}
			}
			else
			{
				Reset();
			}

			return outBytes;
		}

        /**
		* Process the last block in the buffer.
		*
		* @param out the array the block currently being held is copied into.
		* @param outOff the offset at which the copying starts.
		* @return the number of output bytes copied to out.
		* @exception DataLengthException if there is insufficient space in out for
		* the output, or the input is not block size aligned and should be.
		* @exception InvalidOperationException if the underlying cipher is not
		* initialised.
		* @exception InvalidCipherTextException if padding is expected and not found.
		* @exception DataLengthException if the input is not block size
		* aligned.
		*/
        public override int DoFinal(byte[] output, int outOff)
        {
            try
			{
				if (bufOff != 0)
				{
                    Check.DataLength(!m_cipherMode.IsPartialBlockOkay, "data not block size aligned");
                    Check.OutputLength(output, outOff, bufOff, "output buffer too short for DoFinal()");

                    // NB: Can't copy directly, or we may write too much output
                    m_cipherMode.ProcessBlock(buf, 0, buf, 0);
					Array.Copy(buf, 0, output, outOff, bufOff);
				}

				return bufOff;
			}
			finally
			{
				Reset();
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
		{
            try
            {
                if (bufOff != 0)
                {
                    Check.DataLength(!m_cipherMode.IsPartialBlockOkay, "data not block size aligned");
                    Check.OutputLength(output, bufOff, "output buffer too short for DoFinal()");

                    // NB: Can't copy directly, or we may write too much output
                    m_cipherMode.ProcessBlock(buf, buf);
					buf.AsSpan(0, bufOff).CopyTo(output);
                }

                return bufOff;
            }
            finally
            {
                Reset();
            }
        }
#endif

        /**
		* Reset the buffer and cipher. After resetting the object is in the same
		* state as it was after the last init (if there was one).
		*/
		public override void Reset()
		{
			Array.Clear(buf, 0, buf.Length);
			bufOff = 0;

            m_cipherMode.Reset();
		}
	}
}
