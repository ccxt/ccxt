using System;

namespace Org.BouncyCastle.Utilities.Encoders
{
    /// <summary>
    ///  A buffering class to allow translation from one format to another to
    ///     be done in discrete chunks.
    /// </summary>
    public class BufferedDecoder
    {
        internal byte[]        buffer;
        internal int           bufOff;

        internal ITranslator   translator;

        /// <summary>
        /// Create a buffered Decoder.
        /// </summary>
        /// <param name="translator">The translater to use.</param>
        /// <param name="bufferSize">The size of the buffer.</param>
        public BufferedDecoder(
            ITranslator translator,
            int         bufferSize)
        {
            this.translator = translator;

            if ((bufferSize % translator.GetEncodedBlockSize()) != 0)
            {
                throw new ArgumentException("buffer size not multiple of input block size");
            }

            buffer = new byte[bufferSize];
//            bufOff = 0;
        }

        /// <summary>
        /// Process one byte of data.
        /// </summary>
        /// <param name="input">Data in.</param>
        /// <param name="output">Byte array for the output.</param>
        /// <param name="outOff">The offset in the output byte array to start writing from.</param>
        /// <returns>The amount of output bytes.</returns>
        public int ProcessByte(
            byte        input,
            byte[]      output,
            int         outOff)
        {
            int         resultLen = 0;

            buffer[bufOff++] = input;

            if (bufOff == buffer.Length)
            {
                resultLen = translator.Decode(buffer, 0, buffer.Length, output, outOff);
                bufOff = 0;
            }

            return resultLen;
        }


        /// <summary>
        /// Process data from a byte array.
        /// </summary>
        /// <param name="input">The input data.</param>
        /// <param name="inOff">Start position within input data array.</param>
        /// <param name="len">Amount of data to process from input data array.</param>
        /// <param name="outBytes">Array to store output.</param>
        /// <param name="outOff">Position in output array to start writing from.</param>
        /// <returns>The amount of output bytes.</returns>
        public int ProcessBytes(
            byte[]      input,
            int         inOff,
            int         len,
            byte[]      outBytes,
            int         outOff)
        {
            if (len < 0)
            {
            throw new ArgumentException("Can't have a negative input length!");
            }

            int resultLen = 0;
            int gapLen = buffer.Length - bufOff;

            if (len > gapLen)
            {
                Array.Copy(input, inOff, buffer, bufOff, gapLen);

                resultLen += translator.Decode(buffer, 0, buffer.Length, outBytes, outOff);

                bufOff = 0;

                len -= gapLen;
                inOff += gapLen;
                outOff += resultLen;

                int chunkSize = len - (len % buffer.Length);

                resultLen += translator.Decode(input, inOff, chunkSize, outBytes, outOff);

                len -= chunkSize;
                inOff += chunkSize;
            }

            if (len != 0)
            {
                Array.Copy(input, inOff, buffer, bufOff, len);

                bufOff += len;
            }

            return resultLen;
        }
    }

}
