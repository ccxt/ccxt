using System;

namespace Org.BouncyCastle.Utilities.Encoders
{
    /// <summary>
    /// A hex translator.
    /// </summary>
    public class HexTranslator : ITranslator
    {
        private static readonly byte[]   hexTable =
            {
                (byte)'0', (byte)'1', (byte)'2', (byte)'3', (byte)'4', (byte)'5', (byte)'6', (byte)'7',
                (byte)'8', (byte)'9', (byte)'a', (byte)'b', (byte)'c', (byte)'d', (byte)'e', (byte)'f'
            };

        /// <summary>
        /// Return encoded block size.
        /// </summary>
        /// <returns>2</returns>
        public int GetEncodedBlockSize()
        {
            return 2;
        }

        /// <summary>
        /// Encode some data.
        /// </summary>
        /// <param name="input">Input data array.</param>
        /// <param name="inOff">Start position within input data array.</param>
        /// <param name="length">The amount of data to process.</param>
        /// <param name="outBytes">The output data array.</param>
        /// <param name="outOff">The offset within the output data array to start writing from.</param>
        /// <returns>Amount of data encoded.</returns>
        public int Encode(
            byte[]  input,
            int     inOff,
            int     length,
            byte[]  outBytes,
            int     outOff)
        {
            for (int i = 0, j = 0; i < length; i++, j += 2)
            {
                outBytes[outOff + j] = hexTable[(input[inOff] >> 4) & 0x0f];
                outBytes[outOff + j + 1] = hexTable[input[inOff] & 0x0f];

                inOff++;
            }

            return length * 2;
        }

        /// <summary>
        /// Returns the decoded block size.
        /// </summary>
        /// <returns>1</returns>
        public int GetDecodedBlockSize()
        {
            return 1;
        }

        /// <summary>
        /// Decode data from a byte array.
        /// </summary>
        /// <param name="input">The input data array.</param>
        /// <param name="inOff">Start position within input data array.</param>
        /// <param name="length">The amounty of data to process.</param>
        /// <param name="outBytes">The output data array.</param>
        /// <param name="outOff">The position within the output data array to start writing from.</param>
        /// <returns>The amount of data written.</returns>
        public int Decode(
            byte[]  input,
            int     inOff,
            int     length,
            byte[]  outBytes,
            int     outOff)
        {
            int halfLength = length / 2;
            byte left, right;
            for (int i = 0; i < halfLength; i++)
            {
                left  = input[inOff + i * 2];
                right = input[inOff + i * 2 + 1];

                if (left < (byte)'a')
                {
                    outBytes[outOff] = (byte)((left - '0') << 4);
                }
                else
                {
                    outBytes[outOff] = (byte)((left - 'a' + 10) << 4);
                }
                if (right < (byte)'a')
                {
                    outBytes[outOff] += (byte)(right - '0');
                }
                else
                {
                    outBytes[outOff] += (byte)(right - 'a' + 10);
                }

                outOff++;
            }

            return halfLength;
        }
    }

}
