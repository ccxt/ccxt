using System;

using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Paddings
{
    /**
    * A padder that adds X9.23 padding to a block - if a SecureRandom is
    * passed in random padding is assumed, otherwise padding with zeros is used.
    */
    public class X923Padding
		: IBlockCipherPadding
    {
        private SecureRandom random;

		/**
        * Initialise the padder.
        *
        * @param random a SecureRandom if one is available.
        */
        public void Init(
			SecureRandom random)
        {
            this.random = random;
        }

		/**
        * Return the name of the algorithm the cipher implements.
        *
        * @return the name of the algorithm the cipher implements.
        */
        public string PaddingName
        {
            get { return "X9.23"; }
        }

        public int AddPadding(byte[] input, int inOff)
        {
            int count = input.Length - inOff;
            if (count > 1)
            {
                if (random == null)
                {
                    Arrays.Fill(input, inOff, input.Length - 1, 0x00);
                }
                else
                {
                    random.NextBytes(input, inOff, count - 1);
                }
            }
            input[input.Length - 1] = (byte)count;
            return count;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int AddPadding(Span<byte> block, int position)
        {
            int count = block.Length - position;
            if (count > 1)
            {
                var body = block[position..(block.Length - 1)];
                if (random == null)
                {
                    body.Fill(0x00);
                }
                else
                {
                    random.NextBytes(body);
                }
            }
            block[block.Length - 1] = (byte)count;
            return count;
        }
#endif

        public int PadCount(byte[] input)
        {
            int count = input[input.Length - 1];
            int position = input.Length - count;

            int failed = (position | (count - 1)) >> 31;
            if (failed != 0)
                throw new InvalidCipherTextException("pad block corrupted");

            return count;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int PadCount(ReadOnlySpan<byte> block)
        {
            int count = block[block.Length - 1];
            int position = block.Length - count;

            int failed = (position | (count - 1)) >> 31;
            if (failed != 0)
                throw new InvalidCipherTextException("pad block corrupted");

            return count;
        }
#endif
    }
}
