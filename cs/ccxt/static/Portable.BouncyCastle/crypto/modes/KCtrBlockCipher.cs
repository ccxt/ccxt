using System;

using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Modes
{
    /**
    * Implements a Gamming or Counter (CTR) mode on top of a DSTU 7624 block cipher.
    */
    public class KCtrBlockCipher
        : IStreamCipher, IBlockCipherMode
    {
        private byte[] IV;
        private byte[] ofbV;
        private byte[] ofbOutV;
        private bool initialised;

        private int byteCount;

        private readonly int blockSize;
        private readonly IBlockCipher cipher;

        /**
      * Basic constructor.
      *
      * @param cipher the block cipher to be used as the basis of the
      * feedback mode.
      */
        public KCtrBlockCipher(IBlockCipher cipher)
        {
            this.cipher = cipher;
            this.IV = new byte[cipher.GetBlockSize()];
            this.blockSize = cipher.GetBlockSize();

            this.ofbV = new byte[cipher.GetBlockSize()];
            this.ofbOutV = new byte[cipher.GetBlockSize()];
        }

        /**
        * return the underlying block cipher that we are wrapping.
        *
        * @return the underlying block cipher that we are wrapping.
        */
        public IBlockCipher UnderlyingCipher => cipher;

        /**
        * Initialise the cipher and, possibly, the initialisation vector (IV).
        * If an IV isn't passed as part of the parameter, the IV will be all zeros.
        * An IV which is too short is handled in FIPS compliant fashion.
        *
        * @param forEncryption if true the cipher is initialised for
        *  encryption, if false for decryption.
        * @param param the key and other data required by the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public void Init(
            bool forEncryption,
            ICipherParameters parameters)
        {
            this.initialised = true;
            if (parameters is ParametersWithIV)
            {
                ParametersWithIV ivParam = (ParametersWithIV)parameters;
                byte[] iv = ivParam.GetIV();
                int diff = IV.Length - iv.Length;

                Array.Clear(IV, 0, IV.Length);
                Array.Copy(iv, 0, IV, diff, iv.Length);
         
                parameters = ivParam.Parameters;
            }
            else
            {
                throw new ArgumentException("Invalid parameter passed");
            }

            // if it's null, key is to be reused.
            if (parameters != null)
            {
                cipher.Init(true, parameters);
            }

            Reset();
        }

        /**
        * return the algorithm name and mode.
        *
        * @return the name of the underlying algorithm followed by "/KCTR"
        * and the block size in bits.
        */
        public string AlgorithmName
        {
            get { return cipher.AlgorithmName + "/KCTR"; }
        }

        public bool IsPartialBlockOkay
        {
            get { return true; }
        }

        /**
      * return the block size we are operating at.
      *
      * @return the block size we are operating at (in bytes).
      */
        public int GetBlockSize()
        {
            return cipher.GetBlockSize();
        }

        public byte ReturnByte(byte input)
        {
            return CalculateByte(input);
        }

        public void ProcessBytes(byte[] input, int inOff, int len, byte[] output, int outOff)
        {
            Check.DataLength(input, inOff, len, "input buffer too small");
            Check.OutputLength(output, outOff, len, "output buffer too short");

            int inStart = inOff;
            int inEnd = inOff + len;
            int outStart = outOff;

            while (inStart < inEnd)
            {
                output[outStart++] = CalculateByte(input[inStart++]);
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.OutputLength(output, input.Length, "output buffer too short");

            for (int i = 0; i < input.Length; ++i)
            {
                output[i] = CalculateByte(input[i]);
            }
        }
#endif

        protected byte CalculateByte(byte b)
        {
            if (byteCount == 0)
            {
                incrementCounterAt(0);

                checkCounter();

                cipher.ProcessBlock(ofbV, 0, ofbOutV, 0);

                return (byte)(ofbOutV[byteCount++] ^ b);
            }

            byte rv = (byte)(ofbOutV[byteCount++] ^ b);

            if (byteCount == ofbV.Length)
            {
                byteCount = 0;
            }

            return rv;
        }

        /**
         * Process one block of input from the array in and write it to
         * the out array.
         *
         * @param input the array containing the input data.
         * @param inOff offset into the in array the data starts at.
         * @param output the array the output data will be copied into.
         * @param outOff the offset into the out array the output will start at.
         * @exception DataLengthException if there isn't enough data in in, or
         * space in out.
         * @exception InvalidOperationException if the cipher isn't initialised.
         * @return the number of bytes processed and produced.
         */
        public int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
        {
            int blockSize = GetBlockSize();
            Check.DataLength(input, inOff, blockSize, "input buffer too short");
            Check.OutputLength(output, outOff, blockSize, "output buffer too short");

            ProcessBytes(input, inOff, blockSize, output, outOff);

            return blockSize;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            int blockSize = GetBlockSize();
            Check.DataLength(input, blockSize, "input buffer too short");
            Check.OutputLength(output, blockSize, "output buffer too short");

            ProcessBytes(input[..blockSize], output);

            return blockSize;
        }
#endif

        /**
        * reset the chaining vector back to the IV and reset the underlying
        * cipher.
        */
        public void Reset()
        {
            if (initialised)
            {
                cipher.ProcessBlock(IV, 0, ofbV, 0);
            }
            byteCount = 0;
        }

        private void incrementCounterAt(int pos)
        {
            int i = pos;
            while (i < ofbV.Length)
            {
                if (++ofbV[i++] != 0)
                {
                    break;
                }
            }
        }

        private void checkCounter()
        {
            // TODO:
            // if the IV is the same as the blocksize we assume the user knows what they are doing
            //        if (IV.length < ofbV.length)
            //        {
            //            for (int i = 0; i != IV.length; i++)
            //            {
            //                if (ofbV[i] != IV[i])
            //                {
            //                    throw new IllegalStateException("Counter in KCTR mode out of range.");
            //                }
            //            }
            //        }
        }
    }
}
