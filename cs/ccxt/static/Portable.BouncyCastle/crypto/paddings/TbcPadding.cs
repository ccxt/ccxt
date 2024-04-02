using System;

using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Paddings
{

    /// <summary> A padder that adds Trailing-Bit-Compliment padding to a block.
    /// <p>
    /// This padding pads the block out compliment of the last bit
    /// of the plain text.
    /// </p>
    /// </summary>
    public class TbcPadding
		: IBlockCipherPadding
    {
        /// <summary> Return the name of the algorithm the cipher implements.</summary>
        /// <returns> the name of the algorithm the cipher implements.
        /// </returns>
        public string PaddingName
        {
            get { return "TBC"; }
        }

		/// <summary> Initialise the padder.</summary>
        /// <param name="random">- a SecureRandom if available.
        /// </param>
        public virtual void Init(SecureRandom random)
        {
            // nothing to do.
        }

        /// <summary> add the pad bytes to the passed in block, returning the number of bytes added.</summary>
        /// <remarks>
        /// This assumes that the last block of plain text is always passed to it inside <paramref name="input"/>.
        /// i.e. if <paramref name="inOff"/> is zero, indicating the padding will fill the entire block,the value of
        /// <paramref name="input"/> should be the same as the last block of plain text.
        /// </remarks>
        public virtual int AddPadding(byte[] input, int inOff)
        {
            int count = input.Length - inOff;
            byte lastByte = inOff > 0 ? input[inOff - 1] : input[input.Length - 1];
            byte padValue = (byte)((lastByte & 1) - 1);

            while (inOff < input.Length)
            {
                input[inOff++] = padValue;
            }

            return count;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        /// <summary> add the pad bytes to the passed in block, returning the number of bytes added.</summary>
        /// <remarks>
        /// This assumes that the last block of plain text is always passed to it inside <paramref name="block"/>.
        /// i.e. if <paramref name="position"/> is zero, indicating the padding will fill the entire block,the value of
        /// <paramref name="block"/> should be the same as the last block of plain text.
        /// </remarks>
        public virtual int AddPadding(Span<byte> block, int position)
        {
            byte lastByte = position > 0 ? block[position - 1] : block[block.Length - 1];
            byte padValue = (byte)((lastByte & 1) - 1);

            var padding = block[position..];
            padding.Fill(padValue);
            return padding.Length;
        }
#endif

        public virtual int PadCount(byte[] input)
        {
            int i = input.Length;
            int code = input[--i], count = 1, countingMask = -1;
            while (--i >= 0)
            {
                int next = input[i];
                int matchMask = ((next ^ code) - 1) >> 31;
                countingMask &= matchMask;
                count -= countingMask;
            }
            return count;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int PadCount(ReadOnlySpan<byte> block)
        {
            int i = block.Length;
            int code = block[--i], count = 1, countingMask = -1;
            while (--i >= 0)
            {
                int next = block[i];
                int matchMask = ((next ^ code) - 1) >> 31;
                countingMask &= matchMask;
                count -= countingMask;
            }
            return count;
        }
#endif
    }
}
