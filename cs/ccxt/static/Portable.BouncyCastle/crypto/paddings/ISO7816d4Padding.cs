using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Paddings
{
	/**
	 * A padder that adds the padding according to the scheme referenced in
	 * ISO 7814-4 - scheme 2 from ISO 9797-1. The first byte is 0x80, rest is 0x00
	 */
	public class ISO7816d4Padding
		: IBlockCipherPadding
	{
		/**
		 * Initialise the padder.
		 *
		 * @param random - a SecureRandom if available.
		 */
		public void Init(
			SecureRandom random)
		{
			// nothing to do.
		}

		/**
		 * Return the name of the algorithm the padder implements.
		 *
		 * @return the name of the algorithm the padder implements.
		 */
		public string PaddingName
		{
			get { return "ISO7816-4"; }
		}

		public int AddPadding(byte[] input, int inOff)
		{
			int count = input.Length - inOff;

			input[inOff]= 0x80;
			while (++inOff < input.Length)
			{
				input[inOff] = 0x00;
			}

			return count;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int AddPadding(Span<byte> block, int position)
        {
            int count = block.Length - position;
			block[position++] = 0x80;
            block[position..].Fill(0x00);
            return count;
        }
#endif

        public int PadCount(byte[] input)
		{
			int position = -1, still00Mask = -1;
			int i = input.Length;
			while (--i >= 0)
			{
				int next = input[i];
				int match00Mask = ((next ^ 0x00) - 1) >> 31;
				int match80Mask = ((next ^ 0x80) - 1) >> 31;
				position ^= (i ^ position) & still00Mask & match80Mask;
				still00Mask &= match00Mask;
			}
			if (position < 0)
				throw new InvalidCipherTextException("pad block corrupted");

			return input.Length - position;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int PadCount(ReadOnlySpan<byte> block)
		{
            int position = -1, still00Mask = -1;
            int i = block.Length;
            while (--i >= 0)
            {
                int next = block[i];
                int match00Mask = ((next ^ 0x00) - 1) >> 31;
                int match80Mask = ((next ^ 0x80) - 1) >> 31;
                position ^= (i ^ position) & still00Mask & match80Mask;
                still00Mask &= match00Mask;
            }
            if (position < 0)
                throw new InvalidCipherTextException("pad block corrupted");

            return block.Length - position;
        }
#endif
    }
}
