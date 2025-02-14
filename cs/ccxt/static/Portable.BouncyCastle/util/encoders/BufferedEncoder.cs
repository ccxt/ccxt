using System;

namespace Org.BouncyCastle.Utilities.Encoders
{
    /// <summary>
    /// A class that allows encoding of data using a specific encoder to be processed in chunks.
    /// </summary>
    public class BufferedEncoder
    {
        internal byte[]        Buffer;
        internal int           bufOff;

        internal ITranslator   translator;


        /// <summary>
        /// Create.
        /// </summary>
        /// <param name="translator">The translator to use.</param>
        /// <param name="bufferSize">Size of the chunks.</param>
        public BufferedEncoder(
            ITranslator translator,
            int         bufferSize)
        {
            this.translator = translator;

            if ((bufferSize % translator.GetEncodedBlockSize()) != 0)
            {
                throw new ArgumentException("buffer size not multiple of input block size");
            }

            Buffer = new byte[bufferSize];
//            bufOff = 0;
        }


        /// <summary>
        /// Process one byte of data.
        /// </summary>
        /// <param name="input">The byte.</param>
        /// <param name="outBytes">An array to store output in.</param>
        /// <param name="outOff">Offset within output array to start writing from.</param>
        /// <returns></returns>
        public int ProcessByte(
            byte        input,
            byte[]      outBytes,
            int         outOff)
        {
            int         resultLen = 0;

            Buffer[bufOff++] = input;

            if (bufOff == Buffer.Length)
            {
                resultLen = translator.Encode(Buffer, 0, Buffer.Length, outBytes, outOff);
                bufOff = 0;
            }

            return resultLen;
        }

        /// <summary>
        /// Process data from a byte array.
        /// </summary>
        /// <param name="input">Input data Byte array containing data to be processed.</param>
        /// <param name="inOff">Start position within input data array.</param>
        /// <param name="len">Amount of input data to be processed.</param>
        /// <param name="outBytes">Output data array.</param>
        /// <param name="outOff">Offset within output data array to start writing to.</param>
        /// <returns>The amount of data written.</returns>
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
            int gapLen = Buffer.Length - bufOff;

            if (len > gapLen)
            {
                Array.Copy(input, inOff, Buffer, bufOff, gapLen);

                resultLen += translator.Encode(Buffer, 0, Buffer.Length, outBytes, outOff);

                bufOff = 0;

                len -= gapLen;
                inOff += gapLen;
                outOff += resultLen;

                int chunkSize = len - (len % Buffer.Length);

                resultLen += translator.Encode(input, inOff, chunkSize, outBytes, outOff);

                len -= chunkSize;
                inOff += chunkSize;
            }

            if (len != 0)
            {
                Array.Copy(input, inOff, Buffer, bufOff, len);

                bufOff += len;
            }

            return resultLen;
        }
    }

}
