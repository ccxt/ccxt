using System;
using System.Diagnostics;

namespace Org.BouncyCastle.Crypto.Modes
{
    /**
    * A Cipher Text Stealing (CTS) mode cipher. CTS allows block ciphers to
    * be used to produce cipher text which is the same outLength as the plain text.
    */
    public class CtsBlockCipher
		: BufferedBlockCipher
    {
        private readonly int blockSize;

        public CtsBlockCipher(IBlockCipher cipher)
            : this(EcbBlockCipher.GetBlockCipherMode(cipher))
        {
        }

        /**
        * Create a buffered block cipher that uses Cipher Text Stealing
        *
        * @param cipher the underlying block cipher this buffering object wraps.
        */
        public CtsBlockCipher(IBlockCipherMode cipherMode)
        {
            if (!(cipherMode is CbcBlockCipher || cipherMode is EcbBlockCipher))
                throw new ArgumentException("CtsBlockCipher can only accept ECB, or CBC ciphers");

			m_cipherMode = cipherMode;

            blockSize = cipherMode.GetBlockSize();

            buf = new byte[blockSize * 2];
            bufOff = 0;
        }

        /**
        * return the size of the output buffer required for an update of 'length' bytes.
        *
        * @param length the outLength of the input.
        * @return the space required to accommodate a call to update
        * with length bytes of input.
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
        * return the size of the output buffer required for an update plus a
        * doFinal with an input of length bytes.
        *
        * @param length the outLength of the input.
        * @return the space required to accommodate a call to update and doFinal
        * with length bytes of input.
        */
        public override int GetOutputSize(
            int length)
        {
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
            int resultLen = 0;

            if (bufOff == buf.Length)
            {
                resultLen = m_cipherMode.ProcessBlock(buf, 0, output, outOff);
				Debug.Assert(resultLen == blockSize);

				Array.Copy(buf, blockSize, buf, 0, blockSize);
                bufOff = blockSize;
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
                Debug.Assert(resultLen == blockSize);

                Array.Copy(buf, blockSize, buf, 0, blockSize);
                bufOff = blockSize;
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
        * @param length the number of bytes to be copied out of the input array.
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
                Array.Copy(buf, blockSize, buf, 0, blockSize);

                bufOff = blockSize;

                length -= gapLen;
                inOff += gapLen;

                while (length > blockSize)
                {
                    Array.Copy(input, inOff, buf, bufOff, blockSize);
                    resultLen += m_cipherMode.ProcessBlock(buf, 0, output, outOff + resultLen);
                    Array.Copy(buf, blockSize, buf, 0, blockSize);

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
                Array.Copy(buf, blockSize, buf, 0, blockSize);

                bufOff = blockSize;

                input = input[gapLen..];

                while (input.Length > blockSize)
                {
                    input[..blockSize].CopyTo(buf.AsSpan(bufOff));
                    resultLen += m_cipherMode.ProcessBlock(buf, output[resultLen..]);
                    Array.Copy(buf, blockSize, buf, 0, blockSize);

                    input = input[blockSize..];
                }
            }

            input.CopyTo(buf.AsSpan(bufOff));

            bufOff += input.Length;

            return resultLen;
        }
#endif

        /**
        * Process the last block in the buffer.
        *
        * @param out the array the block currently being held is copied into.
        * @param outOff the offset at which the copying starts.
        * @return the number of output bytes copied to out.
        * @exception DataLengthException if there is insufficient space in out for
        * the output.
        * @exception InvalidOperationException if the underlying cipher is not
        * initialised.
        * @exception InvalidCipherTextException if cipher text decrypts wrongly (in
        * case the exception will never Get thrown).
        */
        public override int DoFinal(byte[] output, int outOff)
        {
            if (bufOff + outOff > output.Length)
                throw new DataLengthException("output buffer too small in DoFinal");

            int blockSize = m_cipherMode.GetBlockSize();
            int length = bufOff - blockSize;
            byte[] block = new byte[blockSize];

            if (forEncryption)
            {
                m_cipherMode.ProcessBlock(buf, 0, block, 0);

				if (bufOff < blockSize)
					throw new DataLengthException("need at least one block of input for CTS");

                for (int i = bufOff; i != buf.Length; i++)
                {
                    buf[i] = block[i - blockSize];
                }

                for (int i = blockSize; i != bufOff; i++)
                {
                    buf[i] ^= block[i - blockSize];
                }

                m_cipherMode.UnderlyingCipher.ProcessBlock(buf, blockSize, output, outOff);

				Array.Copy(block, 0, output, outOff + blockSize, length);
            }
            else
            {
                byte[] lastBlock = new byte[blockSize];

                m_cipherMode.UnderlyingCipher.ProcessBlock(buf, 0, block, 0);

				for (int i = blockSize; i != bufOff; i++)
                {
                    lastBlock[i - blockSize] = (byte)(block[i - blockSize] ^ buf[i]);
                }

                Array.Copy(buf, blockSize, block, 0, length);

                m_cipherMode.ProcessBlock(block, 0, output, outOff);
                Array.Copy(lastBlock, 0, output, outOff + blockSize, length);
            }

            int offset = bufOff;

            Reset();

            return offset;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
        {
            if (bufOff > output.Length)
                throw new DataLengthException("output buffer too small in DoFinal");

            int blockSize = m_cipherMode.GetBlockSize();
            int length = bufOff - blockSize;
            Span<byte> block = stackalloc byte[blockSize];

            if (forEncryption)
            {
                m_cipherMode.ProcessBlock(buf, block);

                if (bufOff < blockSize)
                    throw new DataLengthException("need at least one block of input for CTS");

                for (int i = bufOff; i != buf.Length; i++)
                {
                    buf[i] = block[i - blockSize];
                }

                for (int i = blockSize; i != bufOff; i++)
                {
                    buf[i] ^= block[i - blockSize];
                }

                m_cipherMode.UnderlyingCipher.ProcessBlock(buf.AsSpan(blockSize), output);

                block[..length].CopyTo(output[blockSize..]);
            }
            else
            {
                Span<byte> lastBlock = stackalloc byte[blockSize];

                m_cipherMode.UnderlyingCipher.ProcessBlock(buf, block);

                for (int i = blockSize; i != bufOff; i++)
                {
                    lastBlock[i - blockSize] = (byte)(block[i - blockSize] ^ buf[i]);
                }

                buf.AsSpan(blockSize, length).CopyTo(block);

                m_cipherMode.ProcessBlock(block, output);
                lastBlock[..length].CopyTo(output[blockSize..]);
            }

            int offset = bufOff;

            Reset();

            return offset;
        }
#endif
    }
}
