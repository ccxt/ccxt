using System;

using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Paddings
{

    /**
    * A padder that adds ISO10126-2 padding to a block.
    */
    public class ISO10126d2Padding: IBlockCipherPadding
    {
        private SecureRandom random;

        /**
        * Initialise the padder.
        *
        * @param random a SecureRandom if available.
        */
        public void Init(
			SecureRandom random)
            //throws ArgumentException
        {
			this.random = (random != null) ? random : new SecureRandom();
        }

		/**
        * Return the name of the algorithm the cipher implements.
        *
        * @return the name of the algorithm the cipher implements.
        */
        public string PaddingName
        {
            get { return "ISO10126-2"; }
        }

        public int AddPadding(byte[] input, int inOff)
        {
            int count = input.Length - inOff;
            if (count > 1)
            {
                random.NextBytes(input, inOff, count - 1);
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
                random.NextBytes(block[position..(block.Length - 1)]);
            }
            block[block.Length - 1] = (byte)count;

            return count;
        }
#endif

        public int PadCount(byte[] input)
        {
            int count = input[input.Length -1];
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
